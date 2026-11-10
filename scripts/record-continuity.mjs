/** Record actual Edge compositor output, preserving wall-clock timing. No pose forcing. */
import { spawn } from 'node:child_process';
import { mkdir, mkdtemp, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { tmpdir } from 'node:os';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const output = path.join(root, 'docs/ambient-v1-2');
const base = process.argv[2] || process.env.AMBIENT_URL || 'http://127.0.0.1:4353';
const edge = process.env.EDGE_BINARY || 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe';
const ffmpeg = process.env.FFMPEG_BINARY || 'ffmpeg';
const duration = 46;
const wait = ms => new Promise(resolve => setTimeout(resolve, ms));
await mkdir(output, { recursive: true });
await mkdir(path.join(root, '.astro'), { recursive: true });
const scratch = await mkdtemp(path.join(tmpdir(), 'abl-v12-recording-'));
const framesDirectory = path.join(scratch, 'frames');
await mkdir(framesDirectory);
const report = {
  started: new Date().toISOString(), url: base, viewport: { width: 1440, height: 1000 },
  method: 'Actual headless Edge Page.startScreencast compositor frames, timestamped by CDP; ffmpeg encodes those captured frames at their original timing. No generated scene video and no forced animation poses.',
  intendedSeconds: duration, music: 'Actual media-element captureStream, recorded across navigation and muxed with browser compositor frames. Browser speaker output muted. No human listening claim.',
  interactions: [], poses: [], frames: [], errors: [],
};
let browser, socket, cdp, startedAt, stopping = false;
let browserOutput = '';
const writes = [];
const moviePath = path.join(output, 'ambient-v1-2-browser-46s.mp4');
async function evaluate(expression) {
  const response = await cdp('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true });
  if (response.exceptionDetails) throw new Error(response.exceptionDetails.exception?.description || response.exceptionDetails.text);
  return response.result.value;
}
async function until(expression, timeout = 10000) {
  const start = Date.now();
  while (Date.now() - start < timeout) { if (await evaluate(expression)) return; await wait(100); }
  throw new Error(`Timed out: ${expression}`);
}
async function click(selector) {
  const point = await evaluate(`(()=>{const el=document.querySelector(${JSON.stringify(selector)});el.scrollIntoView({block:'center',behavior:'instant'});const r=el.getBoundingClientRect();return {x:r.x+r.width/2,y:r.y+r.height/2};})()`);
  await cdp('Input.dispatchMouseEvent', { type: 'mousePressed', button: 'left', clickCount: 1, ...point });
  await cdp('Input.dispatchMouseEvent', { type: 'mouseReleased', button: 'left', clickCount: 1, ...point });
  report.interactions.push({ second: (Date.now() - startedAt) / 1000, action: 'click', selector });
}
try {
  browser = spawn(edge, ['--headless=new', '--mute-audio', '--no-first-run', '--disable-extensions', '--no-default-browser-check', '--remote-debugging-port=0', `--user-data-dir=${path.join(scratch, 'profile')}`, 'about:blank'], { windowsHide: true, stdio: ['ignore', 'pipe', 'pipe'] });
  browser.stdout.on('data', chunk => { browserOutput += chunk; });
  browser.stderr.on('data', chunk => { browserOutput += chunk; });
  let spawnError, endpoint;
  browser.on('error', error => { spawnError = error; });
  for (let n = 0; n < 100; n++) {
    if (spawnError) throw spawnError;
    endpoint = browserOutput.match(/DevTools listening on (ws:\/\/[^\s]+)/)?.[1];
    if (endpoint) break;
    try { const [port, route] = (await readFile(path.join(scratch, 'profile', 'DevToolsActivePort'), 'utf8')).trim().split(/\r?\n/); if (port && route) { endpoint = `ws://127.0.0.1:${port}${route}`; break; } } catch {}
    await wait(100);
  }
  if (!endpoint) throw new Error('Edge debugger did not start: ' + browserOutput);
  const pages = await (await fetch(`http://127.0.0.1:${new URL(endpoint).port}/json/list`)).json();
  socket = new WebSocket(pages.find(page => page.type === 'page').webSocketDebuggerUrl);
  await new Promise((resolve, reject) => { socket.onopen = resolve; socket.onerror = reject; });
  let id = 0;
  const pending = new Map();
  socket.onmessage = ({ data }) => {
    const message = JSON.parse(data);
    if (message.id) {
      const request = pending.get(message.id); pending.delete(message.id);
      if (request) message.error ? request.reject(new Error(JSON.stringify(message.error))) : request.resolve(message.result);
    } else if (message.method === 'Page.screencastFrame') {
      const { sessionId, metadata, data: pixels } = message.params;
      void cdp('Page.screencastFrameAck', { sessionId }).catch(() => {});
      if (stopping) return;
      const name = `frame-${String(report.frames.length).padStart(6, '0')}.jpg`;
      report.frames.push({ name, timestamp: metadata.timestamp, second: (Date.now() - startedAt) / 1000 });
      writes.push(writeFile(path.join(framesDirectory, name), Buffer.from(pixels, 'base64')));
    } else if (message.method === 'Runtime.exceptionThrown') report.errors.push(message.params.exceptionDetails.exception?.description || message.params.exceptionDetails.text);
  };
  cdp = (method, params = {}) => new Promise((resolve, reject) => { const nextId = ++id; pending.set(nextId, { resolve, reject }); socket.send(JSON.stringify({ id: nextId, method, params })); });
  await cdp('Page.enable'); await cdp('Runtime.enable');
  report.browser = await cdp('Browser.getVersion');
  await cdp('Emulation.setDeviceMetricsOverride', { ...report.viewport, deviceScaleFactor: 1, mobile: false });
  await cdp('Page.navigate', { url: base + '/' });
  await until("document.readyState==='complete'&&Boolean(document.querySelector('.ambient-toolbar:not([hidden])'))");
  await evaluate("localStorage.setItem('abl-theme','dark');location.reload()");
  await until("document.readyState==='complete'&&Boolean(document.querySelector('.ambient-toolbar:not([hidden])'))&&document.querySelector('.scene-image').naturalWidth>0");
  await cdp('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-reduced-motion', value: 'no-preference' }] });
  await evaluate('scrollTo(0,0)');
  await wait(350);
  await click('.ambient-workshop [data-audio-toggle="music"]');
  await until("!document.querySelector('audio').paused&&document.querySelector('audio').currentTime>.3");
  startedAt = Date.now();
  await evaluate(`window.capturedAudio=document.querySelector('audio');window.audioChunks=[];
    window.mediaCapture=new MediaRecorder(capturedAudio.captureStream(),{mimeType:'audio/webm;codecs=opus'});
    mediaCapture.ondataavailable=e=>{if(e.data.size)audioChunks.push(e.data)};
    window.audioCaptureStart=performance.now();mediaCapture.start(250);`);
  await cdp('Page.startScreencast', { format: 'jpeg', quality: 95, maxWidth: 1440, maxHeight: 1000, everyNthFrame: 2 });
  let expanded = false, returned = false, navigated = false, homeAgain = false, lastPose;
  while (Date.now() - startedAt < duration * 1000) {
    const second = (Date.now() - startedAt) / 1000;
    if (!expanded && second >= 3) { await click('.stay-button'); expanded = true; }
    if (!returned && second >= 24) { await click('.return-button'); returned = true; }
    if (!navigated && second >= 27) { await click('a[href="/projects/mission-control/"]'); navigated = true; }
    if (!homeAgain && second >= 36) { await click('.site-header a[href="/"]'); await until("location.pathname==='/'&&document.querySelector('.ambient-toolbar:not([hidden])')"); await evaluate('scrollTo(0,0)'); homeAgain = true; }
    const state = await evaluate("(()=>{const el=document.querySelector('.circuit-light');const a=document.querySelector('[data-audio=\"music\"]');return {path:location.pathname,bulb:el?getComputedStyle(el).color:null,motion:document.querySelector('.ambient-workshop')?.dataset.motion,musicPaused:a?.paused,time:a?.currentTime,blink:document.querySelector('.blink-overlay')?.classList.contains('eyes-closed')};})()");
    const signature = JSON.stringify(state);
    if (signature !== lastPose) { report.poses.push({ second, ...state }); lastPose = signature; }
    await wait(65);
  }
  stopping = true;
  await cdp('Page.stopScreencast');
  const recordedAudio = await evaluate(`new Promise(resolve=>{mediaCapture.onstop=()=>{const reader=new FileReader();reader.onload=()=>resolve({base64:reader.result.split(',')[1],same:capturedAudio===document.querySelector('audio'),elapsed:performance.now()-audioCaptureStart});reader.readAsDataURL(new Blob(audioChunks,{type:'audio/webm'}))};mediaCapture.stop()})`);
  const audioPath=path.join(scratch,'captured-music.webm');
  await writeFile(audioPath,Buffer.from(recordedAudio.base64,'base64'));
  report.audioCapture={method:'HTMLMediaElement.captureStream + MediaRecorder Opus',samePlayer:recordedAudio.same,elapsedMs:recordedAudio.elapsed};
  report.wallClockSeconds = (Date.now() - startedAt) / 1000;
  await Promise.all(writes);
  if (!report.frames.length) throw new Error('Edge supplied no screencast frames.');
  const first = report.frames[0].timestamp;
  const lines = ['ffconcat version 1.0'];
  for (let i = 0; i < report.frames.length; i++) {
    const frame = report.frames[i], next = report.frames[i + 1];
    const length = Math.max(.001, next ? next.timestamp - frame.timestamp : duration - (frame.timestamp - first));
    lines.push(`file '${frame.name}'`, `duration ${length.toFixed(6)}`);
  }
  lines.push(`file '${report.frames.at(-1).name}'`);
  const concatPath = path.join(framesDirectory, 'timing.ffconcat');
  await writeFile(concatPath, lines.join('\n') + '\n');
  const args = ['-hide_banner', '-loglevel', 'warning', '-y', '-f', 'concat', '-safe', '0', '-i', concatPath, '-i', audioPath, '-t', String(duration), '-vf', 'fps=24,pad=ceil(iw/2)*2:ceil(ih/2)*2', '-c:v', 'libx264', '-preset', 'medium', '-crf', '18', '-pix_fmt', 'yuv420p', '-c:a','aac','-b:a','192k', '-movflags', '+faststart', moviePath];
  await new Promise((resolve, reject) => {
    const encoder = spawn(ffmpeg, args, { windowsHide: true, stdio: ['ignore', 'ignore', 'pipe'] });
    let errorText = '';
    encoder.stderr.on('data', chunk => { errorText += chunk; });
    encoder.on('error', reject);
    encoder.on('exit', code => code === 0 ? resolve() : reject(new Error(`ffmpeg exited ${code}: ${errorText}`)));
  });
  report.file = path.relative(root, moviePath).replaceAll('\\', '/');
  report.capturedFrameCount = report.frames.length;
  report.sourceFrameTimes = { first, last: report.frames.at(-1).timestamp };
  report.encoding = { frameRate: 24, durationSeconds: duration, codec: 'H.264', qualityCRF: 18 };
  report.hasBulbColorChanges = new Set(report.poses.map(state => state.bulb).filter(Boolean)).size > 1;
  report.scratch = path.relative(root, scratch).replaceAll('\\', '/');
  console.log(JSON.stringify({file:report.file,seconds:duration,captures:report.capturedFrameCount,bulbChanges:report.hasBulbColorChanges,errors:report.errors}));
} catch (error) {
  report.fatal = error.stack || String(error); process.exitCode = 1; console.error(error);
} finally {
  report.finished = new Date().toISOString();
  // Keep transition and timing evidence compact; the raw frames remain in ignored .astro scratch.
  delete report.frames;
  await writeFile(path.join(output, 'browser-recording.json'), JSON.stringify(report, null, 2) + '\n');
  try { if (cdp) await cdp('Browser.close'); } catch {}
  socket?.close(); browser?.kill();
}
