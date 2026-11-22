import assert from 'node:assert/strict';
import { mkdir, readFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';

const require = createRequire(import.meta.url);
const playwright = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const origin = process.env.ATLAS_ORIGIN || 'http://127.0.0.1:4397';
const captures = fileURLToPath(new URL('../docs/kaerimichi/screenshots/', import.meta.url));
const published = JSON.parse(await readFile(new URL('../src/data/kaerimichi/register.json', import.meta.url)));
await mkdir(captures, { recursive: true });
const browser = await playwright.chromium.launch({
  executablePath: process.env.ATLAS_BROWSER_EXECUTABLE || undefined,
  chromiumSandbox: true, headless: true, args: ['--mute-audio'],
});
try {
  for (const mobile of [false, true]) {
    const width = mobile ? 390 : 1440;
    const context = await browser.newContext({
      viewport: { width, height: mobile ? 844 : 1000 },
      isMobile: mobile, hasTouch: mobile, acceptDownloads: true, reducedMotion: 'reduce',
    });
    try {
      const page = await context.newPage();
      page.setDefaultTimeout(10000);
      const errors = [];
      page.on('pageerror', error => errors.push(error.message));
      page.on('response', response => {
        if (response.url().startsWith(origin) && response.status() >= 400) errors.push(response.status() + ' ' + response.url());
      });
      await page.goto(origin + '/');
      await page.locator('[data-audio-toggle="music"]:visible').click();
      await page.waitForFunction(() => document.querySelector('audio').currentTime > 0.1);
      await page.evaluate(() => { window.atlasTestAudio = document.querySelector('audio'); });
      await page.locator('header a[href="/projects/"]').click();
      await page.locator('a[href="/kaerimichi/"]').first().click();
      await page.locator('.wm-pin').first().waitFor();
      assert.ok(await page.evaluate(() => window.atlasTestAudio === document.querySelector('audio') && !window.atlasTestAudio.paused));
      // Pause after verifying continuity so the review captures show the default sound state.
      await page.locator('[data-audio-toggle="music"]:visible').click();
      await page.reload();
      await page.locator('.wm-pin').first().waitFor();
      const canvas = page.locator('.wm-canvas');
      const world = page.locator('.wm-world');
      const camera = () => world.getAttribute('transform');
      async function changed(before) {
        await page.waitForFunction(previous => document.querySelector('.wm-world').getAttribute('transform') !== previous, before);
      }
      assert.ok((await page.locator('path.wm-building').getAttribute('d')).split('M').length > 100);
      await canvas.focus();
      const initial = await camera();
      await page.keyboard.press('ArrowRight');
      await changed(initial);
      const panned = await camera();
      await page.keyboard.press('+');
      await changed(panned);
      const beforeFit = await camera();
      await page.locator('[data-tool="fit"]').click();
      await changed(beforeFit);
      const beforeZoom = await camera();
      await page.locator('[data-tool="zoom-in"]').click();
      await changed(beforeZoom);
      await canvas.focus();
      await page.keyboard.press('Home');
      const box = await canvas.boundingBox();
      const x = Math.round(box.x + box.width * .25), y = Math.round(box.y + box.height * .55);
      const beforeDrag = await camera();
      if (mobile) {
        const touch = await context.newCDPSession(page);
        for (const [type, delta] of [['touchStart',0],['touchMove',35],['touchEnd',0]]) {
          await touch.send('Input.dispatchTouchEvent', {type, touchPoints:type === 'touchEnd' ? [] : [{x:x+delta,y}]});
        }
        await touch.detach();
      } else {
        await page.mouse.move(x,y); await page.mouse.down(); await page.mouse.move(x+35,y,{steps:4}); await page.mouse.up();
      }
      await changed(beforeDrag);
      for (const area of ['station','honcho','nakajuku','walk']) {
        await page.locator('[data-area="'+area+'"]').click();
        assert.equal(await page.locator('[data-area="'+area+'"]').getAttribute('aria-pressed'),'true');
      }
      await page.locator('[data-kj="stops"]').selectOption('a2');
      assert.ok(await page.locator('[data-kj="prev"]').isDisabled());
      await page.locator('[data-kj="next"]').click();
      assert.match(await page.locator('#kj-place').innerText(),/Tokyo Yamato/);
      await page.locator('[data-kj="prev"]').click();
      await page.locator('[data-area="walk"]').click();
      assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
      await page.locator('.kj-explorer').screenshot({path: captures + (mobile ? 'mobile-walk.png':'desktop-walk.png')});
      if (mobile) {
        await page.locator('[data-area="station"]').click();
        await page.locator('.walk-map').screenshot({path:captures+'mobile-shops.png'});
        await page.locator('[data-area="walk"]').click();
      }
      if (!mobile) {
        await page.evaluate(() => scrollTo(0,0));
        await page.screenshot({path:captures+'atlas.png'});
      }
      await testJournal(page, mobile);
      await testWorkingCopy(page);
      await page.locator('.kj-gallery video').evaluate(async video => { await video.play(); });
      await page.waitForFunction(() => document.querySelector('.kj-gallery video').currentTime > .1);
      await page.locator('header a[href="/projects/"]').click();
      await page.locator('a[href="/kaerimichi/"]').first().click();
      await page.locator('.wm-pin').first().waitFor();
      assert.equal(await page.locator('#kj-stops option').count(),14);
      assert.deepEqual(errors, []);
      console.log('Passed map, timeline, JSON, citations, video, navigation and audio checks at width ' + width);
    } finally { await context.close(); }
  }
} finally { await browser.close(); }

async function testJournal(page, mobile) {
  await page.locator('[data-area="station"]').click();
  const group = page.locator('.wm-pin[aria-label*="Chōryū"]:visible');
  await group.focus(); await page.keyboard.press('Enter');
  await page.locator('.wm-chooser button').filter({hasText:'Ajishino'}).focus();
  await page.keyboard.press('Enter');
  assert.equal(await page.locator('#kj-place').innerText(),'Ajishino');
  await page.locator('[data-kj="view-record"]').click();
  await page.getByRole('button',{name:'2021',exact:true}).click();
  assert.match(await page.locator('.kj-observation').innerText(),/Three white panels/);
  await page.getByRole('button',{name:'2024',exact:true}).click();
  assert.deepEqual(await page.locator('.kj-observation time').allTextContents(),['August 2024']);
  assert.match(await page.locator('.kj-observation').innerText(),/trading status.*unknown/);
  assert.equal(await page.locator('.kj-observation a[href*="B490668092"]').count(),1);
  await page.locator('#historical-register').screenshot({path:captures+(mobile?'mobile-2024.png':'ajishino-2024.png')});
  await page.getByRole('button',{name:'All years',exact:true}).click();
  for (const record of published.landmarks) {
    await page.locator('#kj-stops').selectOption(record.id);
    assert.equal(await page.locator('#kj-place').innerText(),record.nameEn);
    assert.equal(await page.locator('[data-kj="notes-place"]').innerText(),record.nameEn);
    const expected = record.sources.map(s => s.url).filter(Boolean);
    const linked = await page.locator('.kj-context a').evaluateAll(anchors=>anchors.map(a=>a.getAttribute('href')));
    assert.ok(expected.every(url=>linked.includes(url)), record.nameEn+' source missing');
    await page.locator('[data-kj="capture-image"]').evaluate(img=>img.decode());
  }
  assert.ok(await page.locator('[data-kj="next"]').isDisabled());
  await page.locator('#kj-stops').selectOption('a2');
  await page.locator('.kj-archive-photo img').evaluate(img=>img.decode());
}
async function testWorkingCopy(page) {
  const summary = page.locator('summary').filter({ hasText: 'Working register' });
  await summary.click();
  const textarea = page.locator('#kaerimichi-json-records');
  const source = JSON.parse(await textarea.inputValue());
  assert.equal(source.landmarks.length, 14);
  const response = await page.request.get(origin + '/kaerimichi/register.json');
  assert.ok(response.ok());
  assert.deepEqual(await response.json(),source);
  const geography = await page.request.get(origin + '/kaerimichi/geography.geojson');
  assert.ok(geography.ok());
  assert.equal((await geography.json()).features.length,2489);
  await textarea.fill('{"schemaVersion":0}');
  await page.locator('[data-action="apply"]').click();
  assert.match(await page.locator('.editor-body .status').innerText(), /schemaVersion/);
  const working = structuredClone(source);
  working.landmarks[0].nameEn = 'QA working-copy landmark';
  const file = page.locator('#kaerimichi-json-import');
  await file.setInputFiles({ name: 'qa.json', mimeType: 'application/json', buffer: Buffer.from(JSON.stringify(working)) });
  await page.waitForFunction(() => document.querySelector('#kaerimichi-json-records').value.includes('QA working-copy landmark'));
  await page.locator('[data-action="apply"]').click();
  assert.equal(await page.locator('#kj-place').innerText(),'QA working-copy landmark');
  const download = page.waitForEvent('download');
  await page.locator('[data-action="download"]').click();
  const exported = JSON.parse(await readFile(await (await download).path(), 'utf8'));
  assert.deepEqual(exported, working);
  await page.reload({ waitUntil: 'domcontentloaded' });
  if (!(await textarea.isVisible())) await summary.click();
  assert.equal(JSON.parse(await textarea.inputValue()).landmarks[0].nameEn, 'QA working-copy landmark');
  await page.locator('[data-action="restore"]').click();
  assert.deepEqual(JSON.parse(await textarea.inputValue()), source);
}
