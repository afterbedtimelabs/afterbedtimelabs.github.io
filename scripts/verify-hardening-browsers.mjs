// Supplemental real Firefox/WebKit checks. No application or audio substitutions.
// Install Playwright separately in .astro/browser-tools; it is not a site dependency.
import { mkdir, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
const { firefox, webkit } = await import(pathToFileURL(resolve('.astro/browser-tools/node_modules/playwright/index.mjs')));
const base = process.argv[2] || 'http://127.0.0.1:4357';
const names = process.argv.slice(3).length ? process.argv.slice(3) : ['firefox', 'webkit'];
for (const name of names) {
  const out = resolve('docs/ambient-v12-hardening', name);
  await mkdir(out, { recursive: true });
  const report = { name, started: new Date().toISOString(), platform: process.platform, assertions: [], errors: [], requests: [], screenshots: [], listeningPerformed: false, limitation: 'Playwright browser builds on Windows; WebKit is not physical Safari coverage.' };
  const check = (name, pass, evidence) => { report.assertions.push({ name, pass: Boolean(pass), evidence }); console.log(`${pass ? 'PASS' : 'FAIL'} ${name}`); };
  let browser, page;
  try {
    browser = await ({ firefox, webkit }[name]).launch({ headless: true, ...(name === 'firefox' ? { firefoxUserPrefs: { 'media.volume_scale': '0.0' } } : {}) });
    report.version = browser.version();
    const context = await browser.newContext({ viewport: { width: 1440, height: 1000 } });
    page = await context.newPage();
    page.setDefaultTimeout(12000);
    page.on('pageerror', e => report.errors.push({ type: 'pageerror', text: e.message }));
    page.on('console', m => { if (m.type() === 'error') report.errors.push({ type: 'console', text: m.text() }); });
    page.on('request', r => { if (/\.(ogg|mp3|wav|flac)(?:\?|$)/.test(r.url())) report.requests.push(r.url()); });
    const shot = async label => {
      // A full-page screenshot alone does not trigger off-screen lazy images.
      await page.evaluate(async () => {
        const y = scrollY;
        for (const image of document.images) if (image.loading === 'lazy' && !image.complete) {
          image.scrollIntoView({ block: 'center', behavior: 'instant' });
          await new Promise(resolve => { image.addEventListener('load', resolve, { once: true }); image.addEventListener('error', resolve, { once: true }); setTimeout(resolve, 1000); });
        }
        scrollTo(0, y);
      });
      await page.screenshot({ path: resolve(out, label + '.png'), fullPage: true }); report.screenshots.push(label + '.png');
    };
    const ready = async () => page.locator('.ambient-toolbar:not([hidden])').waitFor();
    const state = () => page.evaluate(() => {
      const a = document.querySelector('audio');
      return { paused: a.paused, time: a.currentTime, volume: a.volume, muted: a.muted, error: a.error?.code || null, count: document.querySelectorAll('audio').length, same: window.originalPlayer === a, wall: performance.now(), moveBefore: typeof Element.prototype.moveBefore, ogg: a.canPlayType('audio/ogg; codecs="vorbis"') };
    });
    const bulb = () => page.evaluate(() => {
      const el = document.querySelector('.circuit-light'), s = getComputedStyle(el), b = el.getBoundingClientRect();
      return { color: s.color, animation: s.animationName, count: el.getAnimations().length, transform: s.transform, rect: [b.x, b.y, b.width, b.height] };
    });
    await page.goto(base); await ready();
    report.freshAudioRequests = [...report.requests];
    check('Fresh Home silent with one player at time zero', (await state()).paused && (await state()).time === 0 && (await state()).count === 1, await state());
    await page.waitForFunction(() => document.querySelector('.scene-image').complete && document.querySelector('.scene-image').naturalWidth > 0);
    const caption = await page.locator('.scene-caption').innerText();
    check('Approved scene loaded, fictional mascot label present', await page.locator('.scene-image').getAttribute('src') === '/images/ambient/night-workshop-v1-1.webp' && /lab[’']s resident mascot/.test(caption), { caption });
    await shot('home-desktop');
    const samples = [];
    for (let i = 0; i < 17; i++) { samples.push(await bulb()); await page.waitForTimeout(1000); }
    check('Bulb changes color without moving or duplicate animation', new Set(samples.map(s => s.color)).size > 3 && samples.every(s => s.count === 1 && s.transform === 'none' && JSON.stringify(s.rect) === JSON.stringify(samples[0].rect)), samples);
    await page.locator('.motion-button').click();
    const held = await bulb(); await page.waitForTimeout(500);
    check('Motion pause holds steady amber', held.color === 'rgb(239, 180, 92)' && held.count === 0 && JSON.stringify(held) === JSON.stringify(await bulb()), held);
    await page.locator('.motion-button').click();
    check('Motion resumes one bulb animation', (await bulb()).count === 1);
    for (const width of [1440, 390]) {
      await page.setViewportSize({ width, height: width === 390 ? 844 : 1000 });
      for (const expanded of [false, true]) {
        if (expanded) await page.locator('.stay-button').click();
        const alignment = await page.evaluate(() => {
          const p = new DOMPoint(1269, 817).matrixTransform(document.querySelector('.scene-weather').getScreenCTM());
          const c = document.querySelector('.bulb-core').getBoundingClientRect(), v = document.querySelector('.scene-viewport').getBoundingClientRect();
          return { dx: Math.abs(p.x - c.x - c.width / 2), dy: Math.abs(p.y - c.y - c.height / 2), visible: p.x > v.left && p.x < v.right && p.y > v.top && p.y < v.bottom, overflow: document.documentElement.scrollWidth > innerWidth };
        });
        check(`${width} ${expanded ? 'expanded' : 'normal'} bulb alignment`, alignment.dx < 1 && alignment.dy < 1 && alignment.visible && !alignment.overflow, alignment);
        await shot(`${width}-${expanded ? 'expanded' : 'normal'}`);
        if (expanded) await page.keyboard.press('Escape');
      }
    }
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.waitForFunction(() => document.querySelector('.motion-button').disabled);
    await page.waitForFunction(() => getComputedStyle(document.querySelector('.circuit-light')).animationName === 'none');
    // Media-query notification can precede the next style/animation update in WebKit.
    await page.waitForTimeout(250);
    const reducedA = await bulb(); await page.waitForTimeout(500); const reducedB = await bulb();
    check('Reduced motion steady amber', reducedA.color === 'rgb(239, 180, 92)' && reducedB.color === reducedA.color && reducedA.animation === 'none' && reducedB.animation === 'none' && reducedB.count === 0, { before: reducedA, after: reducedB });
    await page.emulateMedia({ reducedMotion: 'no-preference' });
    await page.setViewportSize({ width: 1440, height: 1000 });
    await page.evaluate(() => {
      window.originalPlayer = document.querySelector('audio'); window.mediaEvents = []; window.loads = 0;
      document.addEventListener('astro:page-load', () => window.loads++);
      for (const type of ['play', 'pause', 'waiting', 'stalled', 'emptied', 'loadstart', 'seeking']) originalPlayer.addEventListener(type, () => mediaEvents.push({ type, time: originalPlayer.currentTime, wall: performance.now() }));
    });
    await page.locator('.ambient-workshop [data-audio-toggle]').click();
    let started = null;
    try { await page.waitForFunction(() => !originalPlayer.paused && originalPlayer.currentTime > 2, null, { timeout: 15000 }); started = await state(); } catch (e) { report.audioInitiationError = e.message; }
    check('Explicit click starts original music', !!started, await state());
    const route = async (selector, path) => {
      const previous = await page.evaluate(() => window.loads);
      await page.locator(selector).first().click();
      await page.waitForURL(base + path);
      await page.waitForFunction(n => window.loads > n, previous);
      await page.waitForTimeout(200);
      const s = await state();
      check('Single persistent player: ' + path, s.same && s.count === 1, s);
      return s;
    };
    await route('.workbench a[href="/projects/mission-control/"], a[href="/projects/mission-control/"]', '/projects/mission-control/');
    await shot('mission-control');
    check('Interior controls available after activation', await page.locator('.interior-music').isVisible());
    await page.locator('.interior-music summary').click();
    await page.locator('#interior-music-volume').fill('23');
    await page.locator('.interior-music .mute-button').click();
    await route('.site-header a[href="/projects/"]', '/projects/');
    check('Volume and mute retained', (await state()).volume === .23 && (await state()).muted, await state());
    await page.locator('.interior-music summary').click(); await page.locator('.interior-music .mute-button').click();
    await route('main a[href="/projects/nightstock/"]', '/projects/nightstock/');
    await route('.site-header a[href="/writing/"]', '/writing/');
    const article = await page.locator('.article-summary h3 a').first().getAttribute('href');
    await route(`main a[href="${article}"]`, article);
    await page.goBack(); await page.waitForURL(base + '/writing/'); await page.waitForTimeout(300);
    const backState = await state();
    await page.goForward(); await page.waitForURL(base + article); await page.waitForTimeout(300);
    check('Back/Forward retain single player and volume', backState.same && (await state()).same && (await state()).count === 1 && (await state()).volume === .23, { back: backState, forward: await state() });
    await route('.site-header a[href="/about/"]', '/about/');
    await route('.site-header a[href="/"]', '/'); await ready();
    for (let n = 0; n < 3; n++) { await route('.site-header a[href="/about/"]', '/about/'); await route('.site-header a[href="/"]', '/'); }
    const final = await state(); const events = await page.evaluate(() => mediaEvents);
    const interruptions = started ? events.filter(e => e.wall > started.wall && ['pause', 'waiting', 'stalled', 'emptied', 'loadstart', 'seeking'].includes(e.type)) : events;
    check('Uninterrupted navigation clock and no restart/buffering events', started && !final.paused && Math.abs(final.time - started.time - (final.wall - started.wall) / 1000) < .6 && interruptions.length === 0 && events.filter(e => e.type === 'play').length === 1, { started, final, interruptions, events });
    if (!final.paused) await page.locator('.ambient-workshop [data-audio-toggle]').click();
    const paused = await state();
    await route('.site-header a[href="/about/"]', '/about/'); await page.waitForTimeout(500);
    check('Pause retained with available resume control', (await state()).paused && Math.abs((await state()).time - paused.time) < .1 && (await page.locator('.interior-music [data-audio-toggle]').innerText()) === 'Play music', await state());
    await route('.site-header a[href="/"]', '/');
    check('Home controls synchronized', (await page.locator('#music-volume').inputValue()) === '23' && (await page.locator('.ambient-workshop [data-audio-toggle]').innerText()) === 'Play music');
    await page.reload(); await ready();
    check('Hard reload silent', (await state()).paused && (await state()).time === 0);
    const fresh = await context.newPage(); await fresh.goto(base + '/about/'); await fresh.waitForTimeout(500);
    check('Fresh tab silent and unactivated', await fresh.evaluate(() => document.querySelector('audio').paused && document.querySelector('audio').currentTime === 0 && document.querySelector('.interior-music').hidden));
    await fresh.close();
    check('No console or page errors', report.errors.length === 0, report.errors);
  } catch (e) {
    report.fatal = e.stack || String(e);
    try { await page?.screenshot({ path: resolve(out, 'failure.png'), fullPage: true }); } catch {}
  } finally {
    await browser?.close();
    report.finished = new Date().toISOString();
    report.passed = report.assertions.filter(a => a.pass).length;
    report.failed = report.assertions.filter(a => !a.pass).length;
    await writeFile(resolve(out, 'browser-checks.json'), JSON.stringify(report, null, 2) + '\n');
    console.log(JSON.stringify({ browser: name, passed: report.passed, failed: report.failed, fatal: report.fatal }));
    if (report.failed || report.fatal) process.exitCode = 1;
  }
}
