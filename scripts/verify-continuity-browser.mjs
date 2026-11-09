/** Real, isolated Edge/CDP checks. Audio is muted at the browser process. */
import { spawn } from 'node:child_process';
import { mkdir, mkdtemp, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { tmpdir } from 'node:os';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const output = path.resolve(root, process.argv[3] || 'docs/ambient-v1-2');
const captures = path.join(output, 'screenshots');
const base = process.argv[2] || process.env.AMBIENT_URL || 'http://127.0.0.1:4353';
const edge = process.argv[4] || process.env.EDGE_BINARY || 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe';
const wait = ms => new Promise(resolve => setTimeout(resolve, ms));
await mkdir(captures, { recursive: true });
await mkdir(path.join(root, '.astro'), { recursive: true });
const profile = await mkdtemp(path.join(tmpdir(), 'abl-v12-browser-'));
const report = { started: new Date().toISOString(), url: base, browser: null, safety: { headless: true, browserAudioMuted: true, isolatedProfile: true, sandboxDisabled: false }, assertions: [], screenshots: [], consoleErrors: [], gaps: [], audioRequests: [], idle: null };
let browser, socket, cdp, currentStage = 'startup';
let browserOutput = '';
const eventHandlers = new Map();
function check(name, pass, evidence) { report.assertions.push({ name, pass: Boolean(pass), evidence }); console.log(`${pass ? 'PASS' : 'FAIL'} ${name}`); }
async function evaluate(expression) {
  const response = await cdp('Runtime.evaluate', { expression, awaitPromise: true, returnByValue: true });
  if (response.exceptionDetails) throw new Error(response.exceptionDetails.text + ': ' + response.exceptionDetails.exception?.description);
  return response.result.value;
}
async function until(expression, timeout = 8000) {
  const start = Date.now();
  while (Date.now() - start < timeout) { const value = await evaluate(expression); if (value) return value; await wait(80); }
  throw new Error(`Timed out: ${expression}`);
}
async function click(selector) {
  await evaluate(`(async () => { const el=document.querySelector(${JSON.stringify(selector)}); if(!el) throw Error('Missing control'); const r=el.getBoundingClientRect();if(r.top<0||r.bottom>innerHeight)el.scrollIntoView({block:'center',behavior:'instant'});await new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))); })()`);
  const point = await evaluate(`(() => { const el=document.querySelector(${JSON.stringify(selector)});const r=el.getBoundingClientRect(); return {x:r.x+r.width/2,y:r.y+r.height/2}; })()`);
  await until(`document.elementFromPoint(${point.x},${point.y})?.closest(${JSON.stringify(selector)})!==null`);
  await cdp('Input.dispatchMouseEvent', { type: 'mousePressed', button: 'left', clickCount: 1, ...point });
  await cdp('Input.dispatchMouseEvent', { type: 'mouseReleased', button: 'left', clickCount: 1, ...point });
  await wait(120);
}
async function key(key, code = key) {
  await cdp('Input.dispatchKeyEvent', { type: 'keyDown', key, code });
  await cdp('Input.dispatchKeyEvent', { type: 'keyUp', key, code });
  await wait(80);
}
async function viewport(width, height, mobile = width < 761) { await cdp('Emulation.setDeviceMetricsOverride', { width, height, deviceScaleFactor: 1, mobile }); }
async function navigate(route = '/') {
  await cdp('Page.navigate', { url: base + route });
  await until("document.readyState === 'complete'");
  await until("Boolean(document.querySelector('.ambient-toolbar:not([hidden])'))");
  await wait(250);
}
async function screenshot(name, full = false) {
  // Scroll lazy media into view before whole-page capture; return to the same viewport.
  if(full) await evaluate(`(async()=>{const y=scrollY;for(const image of document.images){if(image.loading==='lazy'&&!image.complete){image.scrollIntoView({block:'center'});await new Promise(resolve=>{image.addEventListener('load',resolve,{once:true});image.addEventListener('error',resolve,{once:true});setTimeout(resolve,1000);});}}scrollTo(0,y);})()`);
  const metrics = await cdp('Page.getLayoutMetrics');
  const clip = full ? { x: 0, y: 0, width: metrics.cssContentSize.width, height: metrics.cssContentSize.height, scale: 1 } : undefined;
  const shot = await cdp('Page.captureScreenshot', { format: 'png', captureBeyondViewport: full, ...(clip ? { clip } : {}) });
  await writeFile(path.join(captures, name + '.png'), Buffer.from(shot.data, 'base64'));
  report.screenshots.push({ name: name + '.png', stage: currentStage, fullPage: full, dimensions: await evaluate('({width:innerWidth,height:innerHeight,scrollHeight:document.documentElement.scrollHeight})') });
}
const soundState = `(() => {const a=document.querySelector('[data-audio="music"]');return {music:{paused:a.paused,time:a.currentTime,volume:a.volume,muted:a.muted,ready:a.readyState,error:a.error?.code??null,duration:Number.isFinite(a.duration)?a.duration:null,loop:a.loop},audioElements:document.querySelectorAll('audio').length,rainControls:document.querySelectorAll('[data-audio="rain"],[data-audio-toggle="rain"],#rain-volume').length,status:document.querySelector('.audio-status').textContent};})()`;
try {
  browser = spawn(edge, ['--headless=new', '--mute-audio', '--no-first-run', '--disable-extensions', '--no-default-browser-check', '--remote-debugging-port=0', `--user-data-dir=${profile}`, 'about:blank'], { windowsHide: true, stdio: ['ignore', 'pipe', 'pipe'] });
  browser.stdout.on('data', chunk => { browserOutput += chunk; });
  browser.stderr.on('data', chunk => { browserOutput += chunk; });
  let spawnError;
  browser.on('error', error => { spawnError = error; });
  let endpoint;
  for (let n = 0; n < 100; n++) { if (spawnError) throw spawnError; const match = browserOutput.match(/DevTools listening on (ws:\/\/[^\s]+)/); if (match) { endpoint = match[1]; break; } try { const [port, route] = (await readFile(path.join(profile, 'DevToolsActivePort'), 'utf8')).trim().split(/\r?\n/); if(port && route) { endpoint=`ws://127.0.0.1:${port}${route}`; break; } } catch {} await wait(100); }
  if (!endpoint) throw new Error('Browser debugger did not start: ' + browserOutput);
  const port = new URL(endpoint).port;
  const pages = await (await fetch(`http://127.0.0.1:${port}/json/list`)).json();
  socket = new WebSocket(pages.find(page => page.type === 'page').webSocketDebuggerUrl);
  await new Promise((resolve, reject) => { socket.onopen = resolve; socket.onerror = reject; });
  let nextId = 0; const pending = new Map();
  socket.onmessage = ({ data }) => {
    const message = JSON.parse(data);
    if (message.id) { const promise = pending.get(message.id); pending.delete(message.id); if (promise) message.error ? promise.reject(new Error(JSON.stringify(message.error))) : promise.resolve(message.result); }
    else { for (const handler of eventHandlers.get(message.method) || []) handler(message.params); }
  };
  cdp = (method, params = {}) => new Promise((resolve, reject) => { const id = ++nextId; pending.set(id, { resolve, reject }); socket.send(JSON.stringify({ id, method, params })); });
  eventHandlers.set('Runtime.exceptionThrown', [event => report.consoleErrors.push({ stage: currentStage, kind: 'exception', text: event.exceptionDetails.exception?.description || event.exceptionDetails.text })]);
  eventHandlers.set('Runtime.consoleAPICalled', [event => { if (event.type === 'error') report.consoleErrors.push({ stage: currentStage, kind: 'console', text: event.args.map(arg => arg.value || arg.description).join(' ') }); }]);
  eventHandlers.set('Network.requestWillBeSent', [event => { if (/\.(ogg|flac|mp3|wav)(?:\?|$)/i.test(event.request.url)) report.audioRequests.push({ stage: currentStage, url: event.request.url }); }]);
  await cdp('Page.enable'); await cdp('Runtime.enable'); await cdp('Network.enable'); await cdp('Performance.enable');
  await cdp('Network.setCacheDisabled', { cacheDisabled: true });
  report.browser = await cdp('Browser.getVersion');
  const requests = [];
  eventHandlers.get('Network.requestWillBeSent').push(e => requests.push(e.request.url));
  await viewport(1440,1000); await navigate();
  await until("document.querySelector('.ambient-workshop')?.dataset.motion==='running'");
  await evaluate("window.routeLoads=0;document.addEventListener('astro:page-load',()=>routeLoads++)");
  async function listenerCounts() {
    const counts={};
    for(const expression of ['document','window','document.querySelector("audio")']) {
      const {result}=await cdp('Runtime.evaluate',{expression});
      const {listeners}=await cdp('DOMDebugger.getEventListeners',{objectId:result.objectId});
      counts[expression]=listeners.map(l=>l.type).sort();
    }
    return counts;
  }
  const listenersBefore=await listenerCounts();
  check('Fresh visit silent with no music preload', (await evaluate(soundState)).music.paused && report.audioRequests.length === 0, await evaluate(soundState));
  check('No typing runtime or canvas', await evaluate("!document.querySelector('.typing-overlay')") && !requests.some(url=>url.includes('typing-v1-1')), requests.filter(url=>url.includes('typing')));
  await evaluate(`window.originalPlayer=document.querySelector('[data-audio="music"]');window.mediaEvents=[];window.samples=[];
    ['play','pause','waiting','stalled','emptied','loadstart','seeking','playing'].forEach(type=>originalPlayer.addEventListener(type,()=>mediaEvents.push({type,time:originalPlayer.currentTime,wall:performance.now(),path:location.pathname})));
    window.sampleTimer=setInterval(()=>samples.push({wall:performance.now(),time:originalPlayer.currentTime,paused:originalPlayer.paused,same:originalPlayer===document.querySelector('[data-audio="music"]')}),80);
    window.sceneChanges=[];window.sceneWatch=new MutationObserver(()=>{if(document.querySelector('.blink-overlay.eyes-closed'))sceneChanges.push('blink')});sceneWatch.observe(document.querySelector('.blink-overlay'),{attributes:true});`);
  await click('.ambient-workshop [data-audio-toggle="music"]');
  await until('!originalPlayer.paused && originalPlayer.currentTime>2');
  const started = await evaluate('({time:originalPlayer.currentTime,wall:performance.now()})');
  // The first navigation must use the actual workbench link, not programmatic navigate().
  async function route(selector, path, active) {
    const previous=await evaluate('routeLoads');
    await click(selector);
    await until(`routeLoads>${previous} && location.pathname===${JSON.stringify(path)} && document.querySelector('.site-header nav [aria-current="page"]')?.textContent===${JSON.stringify(active)}`);
    await wait(160);
    const state = await evaluate(`({same:originalPlayer===document.querySelector('[data-audio="music"]'),count:document.querySelectorAll('audio').length,time:originalPlayer.currentTime,paused:originalPlayer.paused,title:document.title,active:document.querySelector('.site-header nav [aria-current="page"]')?.textContent,theme:document.documentElement.dataset.themeMode,interior:document.querySelector('.interior-music').checkVisibility(),focus:document.activeElement?.tagName,scroll:scrollY})`);
    check(`Persistent player and page metadata: ${path}`,state.same&&state.count===1&&state.title.length>5&&state.active===active,state);
    return state;
  }
  currentStage='music navigation';
  await route('.workbench a[href="/projects/mission-control/"], a[href="/projects/mission-control/"]','/projects/mission-control/','Projects');
  check('Interior controls visible after Home activation',await evaluate("document.querySelector('.interior-music').checkVisibility()"));
  await screenshot('mission-control-playing');
  await click('.interior-music summary');
  await evaluate("const input=document.querySelector('#interior-music-volume');input.value='23';input.dispatchEvent(new Event('input',{bubbles:true}))");
  await click('.interior-music .mute-button');
  await route('.site-header a[href="/projects/"]','/projects/','Projects');
  check('Volume and mute survive navigation',await evaluate('originalPlayer.volume===.23&&originalPlayer.muted'));
  await click('.interior-music summary'); await click('.interior-music .mute-button');
  await route('main a[href="/projects/nightstock/"]','/projects/nightstock/','Projects');
  await screenshot('nightstock-playing');
  await route('.site-header a[href="/writing/"]','/writing/','Writing');
  const article=await evaluate("document.querySelector('.article-summary h3 a').getAttribute('href')");
  await route(`main a[href="${article}"]`,article,'Writing');
  let previousLoad=await evaluate('routeLoads');
  await evaluate('history.back()'); await until(`routeLoads>${previousLoad} && location.pathname==='/writing/'`);
  previousLoad=await evaluate('routeLoads');
  await evaluate('history.forward()'); await until(`routeLoads>${previousLoad} && location.pathname===${JSON.stringify(article)}`);
  check('Back and Forward retain same playing media',await evaluate("originalPlayer===document.querySelector('audio')&&!originalPlayer.paused"));
  await route('.site-header a[href="/about/"]','/about/','About');
  await click('#theme-toggle');
  const theme=await evaluate('document.documentElement.dataset.themeMode');
  await route('.site-header a[href="/"]','/','Home');
  check('Theme and volume retained on Home',await evaluate(`document.documentElement.dataset.themeMode===${JSON.stringify(theme)}&&document.querySelector('#music-volume').value==='23'`));
  check('Homepage controls synchronized',await evaluate("document.querySelector('.ambient-workshop [data-audio-toggle]').textContent==='Pause music'&&!document.querySelector('.interior-music').checkVisibility()"));
  for (const expectedTheme of ['light','dark']) {
    for(let n=0;n<3 && await evaluate('document.documentElement.dataset.themeMode')!==expectedTheme;n++) await click('#theme-toggle');
    check(`${expectedTheme} interface selected`,await evaluate('document.documentElement.dataset.themeMode')===expectedTheme);
    await screenshot(`home-${expectedTheme}`);
  }
  await viewport(390,844);
  await route('.site-header a[href="/about/"]','/about/','About');
  check('Mobile interior control remains accessible without overflow',await evaluate("document.querySelector('.interior-music [data-audio-toggle]').checkVisibility()&&document.documentElement.scrollWidth<=innerWidth"));
  await screenshot('mobile-interior-playing');
  await route('.site-header a[href="/"]','/','Home');
  await viewport(1440,1000);
  for(let n=0;n<5;n++) {
    await route('.site-header a[href="/about/"]','/about/','About');
    await route('.site-header a[href="/"]','/','Home');
  }
  const progress=await evaluate('({time:originalPlayer.currentTime,wall:performance.now(),events:mediaEvents,samples})');
  const listenersAfter=await listenerCounts();
  // The test itself added media listeners and one lifecycle listener before looping.
  check('No accumulated document or window listeners',JSON.stringify(listenersBefore.document)===JSON.stringify(listenersAfter.document)&&JSON.stringify(listenersBefore.window)===JSON.stringify(listenersAfter.window),{before:listenersBefore,after:listenersAfter});
  const unexpected=progress.events.filter(e=>['pause','waiting','stalled','emptied','loadstart','seeking'].includes(e.type)&&e.wall>started.wall);
  check('Uninterrupted media clock through repeated routes',Math.abs((progress.time-started.time)-(progress.wall-started.wall)/1000)<.5,{audioDelta:progress.time-started.time,wallDelta:(progress.wall-started.wall)/1000,unexpected});
  check('No pause, reload, seek or buffering during navigation',unexpected.length===0,unexpected);
  check('One play call through all playing navigation',progress.events.filter(e=>e.type==='play').length===1,progress.events);
  report.continuitySamples=progress.samples;
  await click('.ambient-workshop [data-audio-toggle]');
  const paused=await evaluate('originalPlayer.currentTime');
  await route('.site-header a[href="/about/"]','/about/','About');
  await wait(500);
  check('Paused music stays paused and controls remain available',await evaluate(`originalPlayer.paused&&Math.abs(originalPlayer.currentTime-${paused})<.1&&document.querySelector('.interior-music').checkVisibility()&&document.querySelector('.interior-music [data-audio-toggle]').textContent==='Play music'`));
  await click('.interior-music [data-audio-toggle]');
  await until(`originalPlayer.currentTime>${paused+.3}`);
  await route('.site-header a[href="/"]','/','Home');
  await click('.ambient-workshop [data-audio-toggle]');
  check('Single toggle after repeated navigation',await evaluate("originalPlayer.paused&&document.querySelector('.ambient-workshop [data-audio-toggle]').textContent==='Play music'"));
  currentStage='motion and visual';
  const bulbState=`(()=>{const el=document.querySelector('.circuit-light');const st=getComputedStyle(el);return {color:st.color,opacity:st.opacity,animation:st.animationName,count:el.getAnimations().length,transform:st.transform,box:el.getBoundingClientRect().toJSON()};})()`;
  await evaluate('scrollTo(0,0)');
  await until("document.querySelector('.ambient-workshop').dataset.motion==='running'");
  // Capture the same fixed arm region before/after a full natural bulb cycle.
  const armClip=await evaluate("(()=>{const r=document.querySelector('.scene-canvas').getBoundingClientRect();return {x:r.x+900*r.width/1659,y:r.y+590*r.height/948,width:245*r.width/1659,height:110*r.height/948,scale:1}})()");
  const armBefore=(await cdp('Page.captureScreenshot',{format:'png',clip:armClip})).data;
  await screenshot('home-desktop');
  const bulbSamples=[];
  await evaluate(`window.blinkSeen=false;window.blinkWatch=new MutationObserver(()=>{if(document.querySelector('.blink-overlay.eyes-closed'))blinkSeen=true});blinkWatch.observe(document.querySelector('.blink-overlay'),{attributes:true});`);
  for(let i=0;i<18;i++){bulbSamples.push(await evaluate(bulbState));await wait(1000);}
  const armAfter=(await cdp('Page.captureScreenshot',{format:'png',clip:armClip})).data;
  check('Resting arm pixels unchanged across 18 seconds',armBefore===armAfter);
  check('Natural blink observed',await evaluate('blinkSeen'));
  check('Bulb varies gently without moving',new Set(bulbSamples.map(s=>s.color)).size>3&&bulbSamples.every(s=>s.count===1&&s.transform==='none'&&JSON.stringify(s.box)===JSON.stringify(bulbSamples[0].box)),bulbSamples);
  const rainA=await evaluate("getComputedStyle(document.querySelector('.rain')).transform");
  const steamA=await evaluate("getComputedStyle(document.querySelector('.steam')).transform");
  await wait(1000);
  check('Accepted rain and steam still animate',await evaluate(`getComputedStyle(document.querySelector('.rain')).transform!==${JSON.stringify(rainA)}&&getComputedStyle(document.querySelector('.steam')).transform!==${JSON.stringify(steamA)}`));
  await click('.motion-button'); const held=await evaluate(bulbState); await wait(600);
  check('Pause holds warm amber',JSON.stringify(held)===JSON.stringify(await evaluate(bulbState))&&held.color==='rgb(239, 180, 92)'&&held.count===0,held);
  for(let n=0;n<3;n++){await click('.motion-button');await click('.motion-button');}
  await click('.motion-button');
  check('Resume creates only one CSS animation', (await evaluate(bulbState)).count===1);
  for(const [width,height] of [[1440,1000],[768,1024],[390,844],[320,740]]) {
    await viewport(width,height);await evaluate('scrollTo(0,0)');await wait(200);
    for(const expanded of [false,true]) {
      if(expanded)await click('.stay-button');
      const aligned=await evaluate(`(()=>{const svg=document.querySelector('.scene-weather');const point=new DOMPoint(1269,817).matrixTransform(svg.getScreenCTM());const core=document.querySelector('.bulb-core').getBoundingClientRect();const view=document.querySelector('.scene-viewport').getBoundingClientRect();return {x:point.x,y:point.y,dx:Math.abs(point.x-(core.x+core.width/2)),dy:Math.abs(point.y-(core.y+core.height/2)),visible:point.x>view.left&&point.x<view.right&&point.y>view.top&&point.y<view.bottom,overflow:document.documentElement.scrollWidth>innerWidth}})()`);
      check(`${width} ${expanded?'expanded':'normal'} bulb aligned and visible`,aligned.dx<1&&aligned.dy<1&&aligned.visible&&!aligned.overflow,aligned);
      await screenshot(`${expanded?'expanded':'home'}-${width}`);
      if(expanded){await key('Escape');check(`${width} Escape focus`,await evaluate("document.activeElement.matches('.stay-button')"));}
    }
  }
  await cdp('Emulation.setEmulatedMedia',{features:[{name:'prefers-reduced-motion',value:'reduce'}]});
  await until("document.querySelector('.motion-button').disabled");
  check('Reduced motion steady amber',await evaluate("getComputedStyle(document.querySelector('.circuit-light')).animationName==='none'&&document.querySelector('.motion-button').disabled"));
  await screenshot('reduced-motion-mobile');
  await cdp('Emulation.setEmulatedMedia',{features:[{name:'prefers-reduced-motion',value:'no-preference'}]});
  await viewport(1440,1000);
  currentStage='link semantics and reload';
  // Modified-click handler test: cancel the browser default after Astro has inspected it.
  const semantics=await evaluate(`(()=>{const a=document.querySelector('.site-header a[href="/about/"]');let result;const inspect=e=>{result={preventedByRouter:e.defaultPrevented,ctrl:e.ctrlKey};e.preventDefault()};document.addEventListener('click',inspect,{once:true});a.dispatchEvent(new MouseEvent('click',{bubbles:true,cancelable:true,ctrlKey:true,button:0}));return result})()`);
  check('Ctrl-click left to native browser behavior',semantics&&!semantics.preventedByRouter,semantics);
  const external=await evaluate(`(()=>{const a=document.querySelector('.social-links a');let result;const inspect=e=>{result={preventedByRouter:e.defaultPrevented,url:a.href};e.preventDefault()};document.addEventListener('click',inspect,{once:true});a.dispatchEvent(new MouseEvent('click',{bubbles:true,cancelable:true,button:0}));return result})()`);
  check('External link left to native browser behavior',external&&!external.preventedByRouter&&external.url.startsWith('https://'),external);
  await click('.hero-link'); await wait(250);
  check('Same-page anchor scroll',await evaluate("location.hash==='#projects-title'&&scrollY>100"));
  await evaluate("document.querySelector('a[href=\"/projects/mission-control/\"]').scrollIntoView({block:'center',behavior:'instant'})");
  const scrollBefore=await evaluate('scrollY');
  await route('a[href="/projects/mission-control/"]','/projects/mission-control/','Projects');
  check('Forward route resets scroll',await evaluate('scrollY<10'));
  previousLoad=await evaluate('routeLoads');
  await evaluate('history.back()');await until(`routeLoads>${previousLoad} && location.pathname==='/'`);await wait(700);
  check('Back restores scroll',Math.abs(await evaluate('scrollY')-scrollBefore)<5,{scrollBefore,after:await evaluate('scrollY')});
  await evaluate('clearInterval(sampleTimer);sceneWatch.disconnect();blinkWatch.disconnect()');
  await cdp('Page.reload',{ignoreCache:true}); await until("document.querySelector('.ambient-toolbar:not([hidden])')&&document.readyState==='complete'");
  check('Hard refresh silent and unactivated',await evaluate("document.querySelector('audio').paused&&document.querySelector('audio').currentTime===0&&!document.querySelector('.interior-music').checkVisibility()"));
  // A new target uses the same profile, but must not inherit playback activation.
  const fresh=await cdp('Target.createTarget',{url:base+'/about/'});
  const tabs=await (await fetch(`http://127.0.0.1:${port}/json/list`)).json();
  const freshSocket=new WebSocket(tabs.find(t=>t.id===fresh.targetId).webSocketDebuggerUrl);
  await new Promise(resolve=>{freshSocket.onopen=resolve});
  const freshResult=await new Promise(resolve=>{freshSocket.onmessage=({data})=>resolve(JSON.parse(data));freshSocket.send(JSON.stringify({id:1,method:'Runtime.evaluate',params:{expression:"new Promise(resolve=>setTimeout(()=>resolve({paused:document.querySelector('audio')?.paused,time:document.querySelector('audio')?.currentTime,visible:document.querySelector('.interior-music')?.checkVisibility()}),700))",awaitPromise:true,returnByValue:true}}));});
  check('Fresh interior tab silent',freshResult.result?.result?.value?.paused&&freshResult.result.result.value.time===0&&!freshResult.result.result.value.visible,freshResult.result?.result?.value);
  freshSocket.close();await cdp('Target.closeTarget',{targetId:fresh.targetId});
  check('No runtime or console errors',report.consoleErrors.length===0,report.consoleErrors);
  check('All loaded images decoded',await evaluate('Array.from(document.images).filter(i=>i.loading!=="lazy").every(i=>i.complete&&i.naturalWidth>0)'));
  check('No third-party runtime requests',requests.every(url=>url.startsWith(base)||url.startsWith('data:')),Array.from(new Set(requests.filter(url=>!url.startsWith(base)&&!url.startsWith('data:')))));
} catch(error) {
  report.fatal=error.stack||String(error);process.exitCode=1;console.error(error);
  try{report.failureState=await evaluate("({url:location.href,loads:window.routeLoads,scroll:scrollY,active:document.activeElement?.outerHTML,header:document.querySelector('.site-header')?.outerHTML})");await screenshot('failure');}catch{}
}
finally {
  report.finished=new Date().toISOString();
  report.passed=report.assertions.filter(a=>a.pass).length;report.failed=report.assertions.filter(a=>!a.pass).length;
  if(report.failed)process.exitCode=1;
  await writeFile(path.join(output,'browser-checks.json'),JSON.stringify(report,null,2)+'\n');
  console.log(JSON.stringify({passed:report.passed,failed:report.failed,fatal:report.fatal}));
  try{if(cdp)await cdp('Browser.close')}catch{}
  socket?.close();browser?.kill();
}
