/** Real, isolated Edge/CDP checks. Audio is muted at the browser process. */
import { spawn } from 'node:child_process';
import { mkdir, mkdtemp, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const output = path.join(root, 'docs/ambient-v1');
const captures = path.join(output, 'screenshots');
const base = process.env.AMBIENT_URL || 'http://127.0.0.1:4351';
const edge = process.env.EDGE_BINARY || 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe';
const wait = ms => new Promise(resolve => setTimeout(resolve, ms));
await mkdir(captures, { recursive: true });
await mkdir(path.join(root, '.astro'), { recursive: true });
const profile = await mkdtemp(path.join(root, '.astro', 'ambient-browser-'));
const report = { started: new Date().toISOString(), url: base, browser: null, safety: { headless: true, browserAudioMuted: true, isolatedProfile: true, sandboxDisabled: false }, assertions: [], screenshots: [], consoleErrors: [], gaps: [], idle: null };
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
  const point = await evaluate(`(() => { const el=document.querySelector(${JSON.stringify(selector)}); if(!el) throw Error('Missing control'); el.scrollIntoView({block:'nearest'}); const r=el.getBoundingClientRect(); return {x:r.x+r.width/2,y:r.y+r.height/2}; })()`);
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
const soundState = `(() => {const state={}; for(const kind of ['music','rain']) {const a=document.querySelector('[data-audio="'+kind+'"]');state[kind]={paused:a.paused,time:a.currentTime,volume:a.volume,muted:a.muted,ready:a.readyState,error:a.error?.code??null,duration:Number.isFinite(a.duration)?a.duration:null};} return {...state,status:document.querySelector('.audio-status').textContent};})()`;
const layoutState = `(() => {const controls=[...document.querySelectorAll('.ambient-workshop button,.ambient-workshop summary')].filter(el=>el.getClientRects().length&&el.checkVisibility());return {width:innerWidth,scrollWidth:document.documentElement.scrollWidth,mode:document.documentElement.classList.contains('ambient-mode'),motion:document.querySelector('.ambient-workshop').dataset.motion,broken:[...document.images].filter(i=>i.complete&&!i.naturalWidth).map(i=>i.getAttribute('src')),pendingLazy:[...document.images].filter(i=>!i.complete&&i.loading==='lazy').map(i=>i.getAttribute('src')),controls:controls.map(el=>{const r=el.getBoundingClientRect();return {text:el.textContent.trim(),width:r.width,height:r.height,left:r.left,right:r.right};}),heading:document.querySelector('h1')?.textContent,projectLink:Boolean(document.querySelector('a[href="/projects/mission-control/"]')),aboutLink:Boolean(document.querySelector('a[href="/about/"]'))};})()`;
try {
  browser = spawn(edge, ['--headless=new', '--mute-audio', '--no-first-run', '--no-default-browser-check', '--remote-debugging-port=0', `--user-data-dir=${profile}`, 'about:blank'], { windowsHide: true, stdio: ['ignore', 'pipe', 'pipe'] });
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
  await cdp('Page.enable'); await cdp('Runtime.enable'); await cdp('Network.enable'); await cdp('Performance.enable');
  await cdp('Network.setCacheDisabled', { cacheDisabled: true });
  report.browser = await cdp('Browser.getVersion');
  currentStage = 'responsive screenshots';
  for (const [width, height] of [[1440,1000],[390,844],[320,740],[768,1024]]) {
    for (const theme of ['dark','light']) {
      await viewport(width, height); await navigate();
      await evaluate(`localStorage.setItem('abl-theme',${JSON.stringify(theme)});location.reload()`);
      await until("document.readyState==='complete' && Boolean(document.querySelector('.ambient-toolbar:not([hidden])'))"); await wait(250);
      let state = await evaluate(layoutState);
      check(`${width} ${theme} normal layout`, state.scrollWidth <= width && state.broken.length === 0 && state.projectLink && state.aboutLink, state);
      await screenshot(`home-${width}-${theme}`, true);
      if(width===1440) { await evaluate('scrollTo(0,0)');await screenshot(`home-${width}-${theme}-viewport`); }
      check(`${width} ${theme} no autoplay`, (await evaluate(soundState)).music.paused && (await evaluate(soundState)).rain.paused, await evaluate(soundState));
      await click('.stay-button');
      state = await evaluate(layoutState);
      check(`${width} ${theme} ambient layout`, state.mode && state.scrollWidth <= width && state.controls.every(control => control.left >= -1 && control.right <= width + 1 && control.height >= 43), state);
      await screenshot(`ambient-${width}-${theme}`);
      await key('Escape');
      check(`${width} ${theme} Escape returns focus`, await evaluate("!document.documentElement.classList.contains('ambient-mode') && document.activeElement.matches('.stay-button')"), await evaluate("({focus:document.activeElement?.className,scrollY})"));
    }
  }
  currentStage = 'motion and keyboard';
  await viewport(1440,1000); await navigate();
  await click('.motion-button');
  const pausedOne = await evaluate("({motion:document.querySelector('.ambient-workshop').dataset.motion,rain:getComputedStyle(document.querySelector('.rain')).transform,steam:getComputedStyle(document.querySelector('.steam')).transform})");
  await wait(600);
  const pausedTwo = await evaluate("({motion:document.querySelector('.ambient-workshop').dataset.motion,rain:getComputedStyle(document.querySelector('.rain')).transform,steam:getComputedStyle(document.querySelector('.steam')).transform})");
  check('Pause freezes visual animation', pausedOne.motion === 'paused' && JSON.stringify(pausedOne) === JSON.stringify(pausedTwo), { pausedOne, pausedTwo });
  await screenshot('motion-paused-desktop');
  await evaluate("document.querySelector('.blink-overlay').classList.add('eyes-closed')");
  await screenshot('blink-closed-for-art-review');
  report.screenshots.at(-1).note='Closed-eye class forced while paused for artwork inspection; actual animation timing is checked separately during idle.';
  await evaluate("document.querySelector('.blink-overlay').classList.remove('eyes-closed')");
  await click('.motion-button');
  await cdp('Emulation.setEmulatedMedia', { features: [{ name:'prefers-reduced-motion', value:'reduce' }] }); await wait(180);
  check('Reduced motion disables animation and control', await evaluate("document.querySelector('.ambient-workshop').dataset.motion==='paused' && document.querySelector('.motion-button').disabled && getComputedStyle(document.querySelector('.rain')).animationName==='none'"), await evaluate("({motion:document.querySelector('.ambient-workshop').dataset.motion,button:document.querySelector('.motion-button').textContent})"));
  await screenshot('reduced-motion-desktop');
  await cdp('Emulation.setEmulatedMedia', { features: [{ name:'prefers-reduced-motion', value:'no-preference' }] });
  await evaluate('window.scrollTo(0,document.documentElement.scrollHeight)'); await wait(250);
  check('Offscreen scene pauses motion', await evaluate("document.querySelector('.ambient-workshop').dataset.motion==='paused'"), await evaluate("({motion:document.querySelector('.ambient-workshop').dataset.motion,scrollY})"));
  await evaluate('window.scrollTo(0,0)'); await wait(250);
  check('Visible scene resumes motion', await evaluate("document.querySelector('.ambient-workshop').dataset.motion==='running'"), null);
  await click('.stay-button'); await key('Tab');
  check('Keyboard focus visibly styled', await evaluate("getComputedStyle(document.activeElement).outlineStyle!=='none' && parseFloat(getComputedStyle(document.activeElement).outlineWidth)>=2"), await evaluate("({element:document.activeElement.outerHTML,outline:getComputedStyle(document.activeElement).outline})"));
  await screenshot('keyboard-focus-ambient'); await key('Escape');
  currentStage = 'audio independent playback';
  await navigate(); await click('[data-audio-toggle="music"]');
  await until("!document.querySelector('[data-audio=" + JSON.stringify('music') + "]').paused && document.querySelector('[data-audio=" + JSON.stringify('music') + "]').currentTime>0.1");
  let state = await evaluate(soundState); await wait(1100); let next = await evaluate(soundState);
  check('Music advances after explicit click; rain stays off', !next.music.paused && next.music.time > state.music.time + .5 && next.rain.paused, { state, next });
  await click('[data-audio-toggle="rain"]'); await wait(1100); state = await evaluate(soundState);
  check('Rain independently starts with music continuing', !state.music.paused && !state.rain.paused && state.rain.time > .3, state);
  await evaluate("for(const audio of document.querySelectorAll('audio'))audio.currentTime=audio.duration-.15");
  await wait(800); state=await evaluate(soundState);
  check('Both bundled tracks loop after seeking near end',!state.music.paused&&!state.rain.paused&&state.music.time<2&&state.rain.time<2,state);
  await click('.sound-mixer summary');
  await click('#music-volume'); await key('Home'); await key('ArrowRight'); await key('ArrowRight');
  await click('#rain-volume'); await key('End'); await key('ArrowLeft');
  state = await evaluate(soundState);
  check('Separate volume sliders control separate tracks', Math.abs(state.music.volume-.02)<.001 && Math.abs(state.rain.volume-.99)<.001, state);
  await click('.mute-button'); state = await evaluate(soundState);
  check('Mute silences both tracks without stopping playback', state.music.muted && state.rain.muted && !state.music.paused && !state.rain.paused, state);
  await screenshot('audio-mixer-muted-desktop');
  await click('.mute-button'); check('Unmute restores both tracks', !(await evaluate(soundState)).music.muted && !(await evaluate(soundState)).rain.muted, await evaluate(soundState));
  await key('Escape');
  check('Escape closes mixer and restores summary focus', await evaluate("!document.querySelector('.sound-mixer').open && document.activeElement.matches('.sound-mixer summary')"), null);
  await click('[data-audio-toggle="music"]'); state=await evaluate(soundState); await wait(650);next=await evaluate(soundState);
  check('Music pause independent of rain', next.music.paused && !next.rain.paused && Math.abs(next.music.time-state.music.time)<.1 && next.rain.time>state.rain.time+.3, {state,next});
  await click('[data-audio-toggle="rain"]'); check('Rain off stops its track', (await evaluate(soundState)).rain.paused, await evaluate(soundState));
  await click('[data-audio-toggle="music"]'); await click('[data-audio-toggle="rain"]'); await navigate();
  check('Reload never restores playback', (await evaluate(soundState)).music.paused && (await evaluate(soundState)).rain.paused && (await evaluate(soundState)).music.time===0, await evaluate(soundState));
  await click('[data-audio-toggle="music"]');await click('[data-audio-toggle="rain"]');
  const history=await cdp('Page.getNavigationHistory');const homeEntry=history.entries[history.currentIndex];
  await click('.hero-secondary');await until("document.readyState==='complete'&&location.pathname==='/about/'");
  await cdp('Page.navigateToHistoryEntry',{entryId:homeEntry.id});await until("Boolean(document.querySelector('.ambient-toolbar:not([hidden])'))");await wait(200);
  check('Returning through browser history does not restart sound',(await evaluate(soundState)).music.paused&&(await evaluate(soundState)).rain.paused,await evaluate(soundState));
  await click('[data-audio-toggle="music"]');await wait(200);
  await evaluate("document.querySelector('[data-audio=\"music\"]').pause()");await wait(150);
  check('External media pause updates player state',(await evaluate(soundState)).music.paused&&await evaluate("document.querySelector('[data-audio-toggle=\"music\"]').getAttribute('aria-pressed')==='false' && document.querySelector('[data-audio-toggle=\"music\"]').textContent.includes('Play music')"),await evaluate(soundState));
  currentStage = 'audio loading and errors';
  // History restore can retain decoded buffers. Start a fresh document for network interception.
  await navigate();
  let heldRequest;
  eventHandlers.set('Fetch.requestPaused', [event => { heldRequest=event.requestId; }]);
  await cdp('Fetch.enable', { patterns:[{urlPattern:'*after-hours.ogg',requestStage:'Request'}] });
  await click('[data-audio-toggle="music"]'); await wait(200);
  check('Loading has cancel and clear status', await evaluate("document.querySelector('[data-audio-toggle=" + JSON.stringify('music') + "]').getAttribute('aria-busy')==='true' && document.querySelector('.audio-status').textContent.includes('Loading')"), await evaluate(soundState));
  await screenshot('audio-loading'); await click('[data-audio-toggle="music"]');
  check('Pending playback can be canceled', (await evaluate(soundState)).music.paused && await evaluate("document.querySelector('[data-audio-toggle=" + JSON.stringify('music') + "]').getAttribute('aria-busy')==='false'"), await evaluate(soundState));
  if(heldRequest) await cdp('Fetch.failRequest',{requestId:heldRequest,errorReason:'Aborted'});
  await cdp('Fetch.disable');
  await cdp('Network.setBlockedURLs',{urls:['*after-hours.ogg']}); await navigate(); await click('[data-audio-toggle="music"]'); await wait(500);
  check('Missing music produces useful retry error', (await evaluate(soundState)).music.paused && (await evaluate(soundState)).status.includes('couldn’t play'), await evaluate(soundState));
  await click('[data-audio-toggle="rain"]'); await wait(500);
  check('Rain remains usable when music fails', !(await evaluate(soundState)).rain.paused, await evaluate(soundState));
  await click('.stay-button');
  await screenshot('audio-error-desktop');
  await cdp('Network.setBlockedURLs',{urls:[]}); await click('[data-audio-toggle="music"]'); await wait(500);
  check('Music retry recovers after media restored', !(await evaluate(soundState)).music.paused, await evaluate(soundState));
  await cdp('Network.setBlockedURLs',{urls:['*window-rain.ogg']}); await navigate(); await click('[data-audio-toggle="rain"]'); await wait(500);
  check('Missing rain produces useful retry error', (await evaluate(soundState)).rain.paused && (await evaluate(soundState)).status.includes('Rain couldn’t play'), await evaluate(soundState));
  await viewport(390,844); await click('.stay-button'); await screenshot('audio-error-mobile');
  currentStage = 'missing scene';
  await cdp('Network.setBlockedURLs',{urls:['*rainy-workshop-v1.webp']}); await navigate();
  check('Missing scene retains approved mascot and usable content', await evaluate("document.querySelector('.scene-fallback').hidden===false && document.querySelector('.scene-fallback img').naturalWidth>0 && Boolean(document.querySelector('a[href=\"/about/\"]'))"), await evaluate(layoutState));
  await screenshot('missing-scene-mobile',true); await click('.stay-button'); await screenshot('missing-scene-ambient-mobile');
  await cdp('Network.setBlockedURLs',{urls:[]});
  currentStage='touch input';
  await viewport(390,844); await navigate();
  await cdp('Emulation.setTouchEmulationEnabled',{enabled:true,maxTouchPoints:1});
  const tapPoint=await evaluate("(()=>{const el=document.querySelector('.stay-button');el.scrollIntoView({block:'center'});const r=el.getBoundingClientRect();return {x:r.x+r.width/2,y:r.y+r.height/2};})()");
  await cdp('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[tapPoint]});await cdp('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});await wait(200);
  check('Touch tap opens ambient mode',await evaluate("document.documentElement.classList.contains('ambient-mode')"),await evaluate(layoutState));
  await click('.return-button');
  check('Back button returns to portfolio and Stay awhile focus',await evaluate("!document.documentElement.classList.contains('ambient-mode')&&document.activeElement.matches('.stay-button')"),null);
  await cdp('Emulation.setTouchEmulationEnabled',{enabled:false});
  currentStage = 'idle and page lifecycle';
  await viewport(1440,1000); await navigate(); await click('.stay-button');
  await evaluate("window.__blinkEvents=[];window.__blinkObserver=new MutationObserver(()=>window.__blinkEvents.push({time:performance.now(),closed:document.querySelector('.blink-overlay').classList.contains('eyes-closed')}));window.__blinkObserver.observe(document.querySelector('.blink-overlay'),{attributes:true,attributeFilter:['class']});window.__domStart=document.querySelectorAll('*').length;");
  const metricsStart=await cdp('Performance.getMetrics'); const actualStart=Date.now();
  await wait(14500);
  const metricsEnd=await cdp('Performance.getMetrics');
  const values=result=>Object.fromEntries(result.metrics.map(({name,value})=>[name,value])); const start=values(metricsStart),end=values(metricsEnd);
  report.idle={elapsedSeconds:(Date.now()-actualStart)/1000,taskDurationSeconds:end.TaskDuration-start.TaskDuration,scriptDurationSeconds:end.ScriptDuration-start.ScriptDuration,layoutDurationSeconds:end.LayoutDuration-start.LayoutDuration,recalcStyleDurationSeconds:end.RecalcStyleDuration-start.RecalcStyleDuration,jsHeapBefore:start.JSHeapUsedSize,jsHeapAfter:end.JSHeapUsedSize,cdpNodesBefore:start.Nodes,cdpNodesAfter:end.Nodes,documentNodes:await evaluate('({before:window.__domStart,after:document.querySelectorAll("*").length})'),blinkEvents:await evaluate('window.__blinkEvents'),audio:await evaluate(soundState),scope:'One 14.5-second headless Edge ambient idle sample, no audio playing; CDP node counts include retained documents. Not a device benchmark.'};
  check('Idle keeps silent tracks paused and document DOM stable', report.idle.audio.music.paused && report.idle.audio.rain.paused && report.idle.documentNodes.before===report.idle.documentNodes.after, report.idle);
  const blinkClose=report.idle.blinkEvents.findIndex(event=>event.closed); const blinkOpen=report.idle.blinkEvents[blinkClose+1];
  check('Actual blink closes briefly and reopens after quiet interval',blinkClose>=0 && blinkOpen&&!blinkOpen.closed&&blinkOpen.time-report.idle.blinkEvents[blinkClose].time>=140&&blinkOpen.time-report.idle.blinkEvents[blinkClose].time<350,report.idle.blinkEvents);
  try {
    await cdp('Page.setWebLifecycleState',{state:'frozen'});
    const lifecycle=await evaluate("({hidden:document.hidden,motion:document.querySelector('.ambient-workshop').dataset.motion})");
    if(lifecycle.hidden) check('Hidden page pauses motion',lifecycle.motion==='paused',lifecycle);
    else report.gaps.push('CDP frozen state did not expose document.hidden=true; actual hidden-page visibility behavior requires a separate supported browser mechanism.');
    await cdp('Page.setWebLifecycleState',{state:'active'});
  } catch(error) { report.gaps.push('Hidden-page lifecycle CDP check unavailable: '+error.message); }
  currentStage='no JavaScript';
  await cdp('Emulation.setScriptExecutionDisabled',{value:true}); await cdp('Page.navigate',{url:base+'/'}); await wait(600);
  const nojs=await evaluate("({heading:document.querySelector('h1')?.textContent,about:Boolean(document.querySelector('a[href=\"/about/\"]')),scene:document.querySelector('.scene-image')?.naturalWidth,controlsHidden:document.querySelector('.ambient-toolbar')?.hidden})");
  check('No-JS portfolio and static scene remain complete',nojs.heading&&nojs.about&&nojs.scene>0&&nojs.controlsHidden,nojs);
  await screenshot('no-javascript-desktop');
  await cdp('Emulation.setScriptExecutionDisabled',{value:false});
  currentStage='existing routes';
  for(const route of ['/projects/','/projects/mission-control/','/projects/nightstock/','/writing/','/writing/meet-mission-control/','/about/','/navi/privacy/']) {
    const navigation=await cdp('Page.navigate',{url:base+route});await until("document.readyState==='complete'");await wait(150);
    const routeState=await evaluate("({path:location.pathname,title:document.title,heading:document.querySelector('h1')?.textContent,overflow:document.documentElement.scrollWidth>innerWidth,main:Boolean(document.querySelector('main')),text:document.querySelector('main')?.textContent.slice(0,300)})");
    check(`Existing route ${route}`,!navigation.errorText&&routeState.path===route&&routeState.heading&&routeState.main&&!routeState.overflow,routeState);
  }
  check('No browser runtime or console errors',report.consoleErrors.length===0,report.consoleErrors);
} catch(error) {
  report.fatal={stage:currentStage,message:error.stack||String(error),browserOutput};
  console.error(error);
} finally {
  report.finished=new Date().toISOString();
  report.passed=report.assertions.filter(item=>item.pass).length;
  report.failed=report.assertions.filter(item=>!item.pass).length;
  await writeFile(path.join(output,'browser-checks.json'),JSON.stringify(report,null,2)+'\n');
  try { if(cdp)await cdp('Browser.close'); } catch {}
  socket?.close(); browser?.kill();
  console.log(JSON.stringify({passed:report.passed,failed:report.failed,fatal:report.fatal?.message,gaps:report.gaps,screenshots:report.screenshots.length}));
  process.exitCode=report.fatal||report.failed?1:0;
}
