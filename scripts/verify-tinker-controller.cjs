// Runs the component controller in Node, with simulated DOM,
// timers, image loading, visibility and matchMedia. No browser-rendering claims.
const fs = require('node:fs');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const ts = require('typescript');
// Extends the integration-v1 behavioral coverage. Pixel identity is validated separately.
const sourcePath = require('node:path').resolve(__dirname, '../src/components/TinkerPanda.astro');
const source = fs.readFileSync(sourcePath, 'utf8');
const controller = source.match(/<script>([\s\S]*?)<\/script>/)[1];
const { outputText: script } = ts.transpileModule(controller, { compilerOptions: {
  target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.CommonJS,
} });

function node(initial = {}) {
  const listeners = new Map();
  return {
    dataset: {}, style: {}, attributes: {}, hidden: false, disabled: false, textContent: '', ...initial,
    addEventListener(event, callback) { const list = listeners.get(event) || []; list.push(callback); listeners.set(event, list); },
    dispatch(event) { for (const callback of listeners.get(event) || []) callback({ type: event }); },
    setAttribute(key, value) { this.attributes[key] = value; },
  };
}
function setup({ reduced = false, observer = true, hidden = false } = {}) {
  const nodes = Object.fromEntries(['art', 'sprite', 'controls', 'greet', 'pause', 'message'].map(name => [name, node()]));
  nodes.controls.hidden = true;
  nodes.message.textContent = 'A little curiosity goes a long way.';
  const host = node({ dataset: { frame: 'front', sprite: 'false' }, querySelector(selector) {
    return nodes[selector.match(/^\[data-tinker-(.+)\]$/)[1]];
  } });
  const doc = node({ hidden, querySelectorAll: () => [host] });
  const win = node();
  const media = node({ matches: reduced });
  let io;
  class Observer {
    constructor(callback) { io = callback; }
    observe(element) { assert.equal(element, nodes.art); }
  }
  if (observer) win.IntersectionObserver = Observer;
  const images = [];
  class Image {
    naturalHeight = 96;
    set src(value) { this._src = value; this.naturalWidth = value.endsWith('/idle.png') ? 288 : 480; images.push(this); }
    get src() { return this._src; }
  }
  let now = 0;
  let id = 0;
  const timers = new Map();
  const context = vm.createContext({
    document: doc, window: win, Image,
    matchMedia: query => { assert.equal(query, '(prefers-reduced-motion: reduce)'); return media; },
    IntersectionObserver: Observer,
    setTimeout(callback, delay) { const key = ++id; timers.set(key, { callback, at: now + delay, delay }); return key; },
    clearTimeout(key) { timers.delete(key); },
  });
  vm.runInContext(script, context, { filename: sourcePath });
  const flush = async () => { for (let i = 0; i < 5; i++) await Promise.resolve(); };
  return {
    host, nodes, media, doc, win, images, timers,
    flush,
    intersect(value, ratio = value ? 1 : 0) { assert.ok(io); io([{ isIntersecting: value, intersectionRatio: ratio }]); },
    reduce(value) { media.matches = value; media.dispatch('change'); },
    visibility(value) { doc.hidden = value; doc.dispatch('visibilitychange'); },
    async load(index, success = true) {
      assert.ok(images[index], `image ${index} exists`);
      images[index][success ? 'onload' : 'onerror']?.(); await flush();
    },
    async advance(delta) {
      const until = now + delta;
      let steps = 0;
      for (;;) {
        const next = [...timers.entries()].filter(([, timer]) => timer.at <= until).sort((a, b) => a[1].at - b[1].at)[0];
        if (!next) break;
        assert.ok(++steps < 1000, 'timer runaway protection');
        now = next[1].at; timers.delete(next[0]); next[1].callback(); await flush();
      }
      now = until; await flush();
    },
    static() { assert.equal(host.dataset.frame, 'front'); assert.equal(host.dataset.sprite, 'false'); },
  };
}
const tests = [];
function test(name, run) { tests.push([name, run]); }

test('static markup and CSS retain accessible no-JavaScript fallback and integral pixel sizing', () => {
  const markup = source.slice(0, source.indexOf('<script>'));
  assert.match(markup, /data-tinker-controls hidden/);
  assert.match(markup, /class="tinker-master"[\s\S]*?width="192"[\s\S]*?height="192"[\s\S]*?alt="Tinker Panda,/);
  assert.match(markup, /aria-live="polite" aria-atomic="true"/);
  assert.match(source, /\.tinker-controls\[hidden\] \{ display: none; \}/);
  assert.deepEqual([...source.matchAll(/--sprite-size: (\d+)px/g)].map(match => Number(match[1])), [192, 96]);
  assert.match(source, /image-rendering: pixelated/);
  assert.match(source, /@media \(prefers-reduced-motion: reduce\)[\s\S]*?\.tinker-master \{ opacity: 1; \}[\s\S]*?\.tinker-sprite \{ display: none; \}/);
  assert.equal((source.match(/const assetRoot = '\/mascot\/tinker-panda-v3\.4'/g) || []).length, 2);
});

test('initial reduced-motion state: static, no timers or atlas loads, greeting still works', async () => {
  const t = setup({ reduced: true }); t.intersect(true);
  t.static(); assert.equal(t.timers.size, 0); assert.equal(t.images.length, 0);
  assert.equal(t.nodes.controls.hidden, false); assert.equal(t.nodes.pause.disabled, true);
  assert.equal(t.nodes.pause.attributes['aria-pressed'], 'true'); assert.equal(t.nodes.pause.textContent, 'Reduced motion');
  t.nodes.greet.dispatch('click');
  assert.match(t.nodes.message.textContent, /^Hello!/); t.static();
  await t.advance(30000); assert.equal(t.images.length, 0); assert.equal(t.timers.size, 0);
});
test('preference change cancels an unresolved atlas and later resumes scheduling', async () => {
  const t = setup(); t.intersect(true); t.nodes.greet.dispatch('click'); assert.equal(t.images.length, 1);
  t.reduce(true); await t.load(0); t.static(); assert.equal(t.timers.size, 0);
  t.reduce(false); assert.equal(t.nodes.pause.disabled, false); assert.equal(t.timers.size, 1);
  await t.advance(7500); assert.match(t.images[1].src, /blink\.png$/);
});
test('pause while atlas loads cancels completion; paused greetings stay static; resume restarts timer', async () => {
  const t = setup(); t.intersect(true); t.nodes.greet.dispatch('click'); t.nodes.pause.dispatch('click');
  await t.load(0); t.static(); assert.equal(t.timers.size, 0); assert.equal(t.nodes.pause.textContent, 'Resume motion');
  assert.equal(t.nodes.pause.attributes['aria-pressed'], 'true');
  t.nodes.greet.dispatch('click'); assert.match(t.nodes.message.textContent, /^The lamp/); assert.equal(t.images.length, 1);
  t.nodes.pause.dispatch('click'); assert.equal(t.timers.size, 1); assert.equal(t.nodes.pause.attributes['aria-pressed'], 'false');
});
test('user pause survives enabling then disabling reduced-motion preference', async () => {
  const t = setup(); t.intersect(true); t.nodes.pause.dispatch('click'); t.reduce(true); t.reduce(false);
  t.static(); assert.equal(t.timers.size, 0); assert.equal(t.nodes.pause.textContent, 'Resume motion');
});
test('document visibility and viewport exit stop active animation and suppress work', async () => {
  const t = setup(); t.intersect(true); t.nodes.greet.dispatch('click'); await t.load(0);
  assert.equal(t.host.dataset.frame, 'happy:0'); t.visibility(true); t.static(); assert.equal(t.timers.size, 0);
  await t.advance(30000); assert.equal(t.images.length, 1);
  t.visibility(false); assert.equal(t.timers.size, 1); t.nodes.greet.dispatch('click'); await t.flush();
  assert.equal(t.host.dataset.frame, 'happy:0'); t.intersect(false); t.static(); assert.equal(t.timers.size, 0);
  t.intersect(true); assert.equal(t.timers.size, 1);
});
test('viewport motion requires at least fifteen percent visibility and stops below that threshold', async () => {
  const t = setup(); t.intersect(true, 0.14); t.static(); assert.equal(t.timers.size, 0);
  t.nodes.greet.dispatch('click'); assert.equal(t.images.length, 0);
  t.intersect(true, 0.15); assert.equal(t.timers.size, 1);
  t.nodes.greet.dispatch('click'); await t.load(0); assert.equal(t.host.dataset.frame, 'happy:0');
  t.intersect(true, 0.149); t.static(); assert.equal(t.timers.size, 0);
  await t.advance(30000); assert.equal(t.images.length, 1);
  t.intersect(true, 0.2); assert.equal(t.timers.size, 1);
  t.intersect(false, 0.2); t.static(); assert.equal(t.timers.size, 0);
});
test('failed atlas keeps approved front visible and caches failure without repeated requests', async () => {
  const t = setup(); t.intersect(true); t.nodes.greet.dispatch('click'); await t.load(0, false);
  t.static(); assert.equal(t.timers.size, 1);
  t.nodes.greet.dispatch('click'); await t.flush(); t.static(); assert.equal(t.images.length, 1); assert.equal(t.timers.size, 1);
  await t.advance(7500); assert.match(t.images[1].src, /blink\.png$/); await t.load(1, false); t.static();
});
test('repeated greeting cancels stale sequence; exact happy frames then static front', async () => {
  const t = setup(); t.intersect(true); t.nodes.greet.dispatch('click'); t.nodes.greet.dispatch('click');
  assert.equal(t.images.length, 1); await t.load(0); assert.equal(t.host.dataset.frame, 'happy:0'); assert.equal(t.timers.size, 1);
  await t.advance(200); assert.equal(t.host.dataset.frame, 'happy:1');
  await t.advance(120); assert.equal(t.host.dataset.frame, 'happy:2');
  await t.advance(180); assert.equal(t.host.dataset.frame, 'happy:3');
  await t.advance(120); assert.equal(t.host.dataset.frame, 'happy:4'); assert.equal(t.nodes.sprite.style.backgroundPosition, '100% 0');
  await t.advance(200); t.static(); assert.equal(t.timers.size, 1);
});
test('ambient schedule rotates blink, idle, and tail with exact timing and one timer', async () => {
  const t = setup(); t.intersect(true); await t.advance(7499); assert.equal(t.images.length, 0);
  await t.advance(1); assert.match(t.images[0].src, /blink\.png$/); await t.load(0); assert.equal(t.host.dataset.frame, 'blink:0');
  for (const [index, duration] of [120, 70, 90, 70, 120].entries()) {
    assert.equal(t.host.dataset.frame, `blink:${index}`);
    assert.equal(t.nodes.sprite.style.backgroundSize, '500% 100%');
    assert.equal(t.nodes.sprite.style.backgroundPosition, `${index * 25}% 0`);
    await t.advance(duration - 1); assert.equal(t.host.dataset.frame, `blink:${index}`);
    await t.advance(1);
  }
  t.static(); assert.equal(t.timers.size, 1);
  await t.advance(7500); assert.match(t.images[1].src, /idle\.png$/); await t.load(1); assert.equal(t.host.dataset.frame, 'idle:0');
  for (const index of [0, 1, 2]) {
    assert.equal(t.host.dataset.frame, `idle:${index}`);
    assert.equal(t.nodes.sprite.style.backgroundSize, '300% 100%');
    assert.equal(t.nodes.sprite.style.backgroundPosition, `${index * 50}% 0`);
    await t.advance(1200);
  }
  t.static(); assert.equal(t.timers.size, 1);
  await t.advance(7500); assert.match(t.images[2].src, /tail\.png$/); await t.load(2);
  for (const [index, duration] of [400, 220, 400, 220, 400].entries()) {
    assert.equal(t.host.dataset.frame, `tail:${index}`);
    assert.equal(t.nodes.sprite.style.backgroundPosition, `${index * 25}% 0`);
    await t.advance(duration);
  }
  t.static(); assert.equal(t.timers.size, 1);
  await t.advance(7500); assert.equal(t.host.dataset.frame, 'blink:0'); assert.equal(t.images.length, 3);
});

test('stalled atlas times out to the approved front and ignores late completion', async () => {
  const t = setup(); t.intersect(true); t.nodes.greet.dispatch('click');
  await t.advance(5999); t.static(); assert.equal(t.images.length, 1);
  await t.advance(1); t.static(); assert.equal(t.timers.size, 1);
  assert.equal(t.images[0].onload, null); assert.equal(t.images[0].onerror, null);
  await t.load(0); t.static();
  t.nodes.greet.dispatch('click'); await t.flush(); t.static(); assert.equal(t.images.length, 1);
});

test('malformed atlas dimensions keep the approved front visible', async () => {
  const t = setup(); t.intersect(true); t.nodes.greet.dispatch('click');
  t.images[0].naturalWidth = 256; t.images[0].naturalHeight = 64;
  await t.load(0); t.static(); assert.equal(t.timers.size, 1);
});
test('pagehide invalidates pending image completion; pageshow can resume', async () => {
  const t = setup(); t.intersect(true); t.nodes.greet.dispatch('click'); t.win.dispatch('pagehide');
  await t.load(0); t.static(); assert.equal(t.timers.size, 0); t.win.dispatch('pageshow'); assert.equal(t.timers.size, 1);
});
test('missing IntersectionObserver falls back safely to visible static initialization and delayed motion', async () => {
  const t = setup({ observer: false }); t.static(); assert.equal(t.nodes.controls.hidden, false); assert.equal(t.timers.size, 1);
  await t.advance(7500); assert.equal(t.images.length, 1);
});
test('hidden page initialization does not fetch or schedule until visible', async () => {
  const t = setup({ hidden: true }); t.intersect(true); t.static(); assert.equal(t.timers.size, 0);
  t.nodes.greet.dispatch('click'); assert.equal(t.images.length, 0); t.visibility(false); assert.equal(t.timers.size, 1);
});

(async () => {
  let passed = 0;
  for (const [name, run] of tests) { await run(); console.log(`PASS ${++passed}: ${name}`); }
  console.log(`\n${passed}/${tests.length} actual-controller scenarios passed.`);
  console.log(`Source: ${sourcePath}`);
  console.log('Method: TypeScript transpileModule + Node vm with deterministic fake DOM/timers/media/image I/O. No dependencies added; no native browser media-emulation claim.');
})().catch(error => { console.error(error); process.exitCode = 1; });
