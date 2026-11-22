# Atlas review evidence

Public baseline: `0691217059d6a729e9b0fd0776495eadce5930d1`. Review branch: `codex/kaerimichi-historical-atlas`. The site’s Projects catalog links directly to the atlas. Its featured-project list still drives the approved homepage.

## Evidence checks

The register contains 14 ordered landmarks. A2, My Basket and Itabashi Bridge have verified positions. The other eleven represent documented buildings or street positions. Hair Salon Best, Ajishino and Chōryū share a building point. Selecting their map group opens the individual records.

The geographic test checks the bounds of the 2,489 features, the main walk and spur against mapped street segments, the 14 landmark offsets, the endpoint identities, and the crossing of Itabashi Bridge. The main route measures 822 m. The spur measures 175 m in one direction. [Geographic method and sources](../kaerimichi-geography.md)

The register tests exercise lossless import/export and rejection of invalid coordinates, dates, duplicate IDs, dangling citations, unsafe URL schemes, and incompatible schema versions. Run both suites with `npm run atlas:verify`.

The source review cross-checked the station exit against Toei, the hospital and stores against their operators, and the old highway and bridge against Itabashi Ward. The LIFE renovation report dates its exterior evidence to February 2024. The August 2025 Hokkai report explicitly identifies the former Ajishino premises and Chōryū next door. The contemporary listings and circulars carry no implied photographic evidence for other years. [Toei](https://www.kotsu.metro.tokyo.jp/subway/stations/itabashihoncho.html) · [Ward bridge record](https://www.city.itabashi.tokyo.jp/bunka/kanko/jyukei/1006821.html) · [LIFE report](https://itabashi-times.com/archives/nakajuku-life202402.html) · [Hokkai report](https://itabashi-times.com/archives/hokkai-honcho.html)

Photo captions and direct links were inspected during research. Some Tabelog/CDN and MapFan URLs could not be reopened by the automated link checker. Each record carries its source links so an owner can inspect the originals. The atlas does not host those storefront photographs.


## Browser and production verification

The production build passed `npm run validate` using Node 24. This includes Astro diagnostics, the static production build, site verification, all 15 mascot controller scenarios, the project showcase regression, street geometry and the register tests.

The browser test runs against the served build. It enters from the workshop through Projects, checks playback continuity in the same audio element, exercises map keys, pointer or touch dragging, zoom, fit, all four area presets, adjacent stops and the grouped landmark chooser. It checks each record’s source URLs and capture, Ajishino's year filter, both download endpoints, invalid JSON, local edits, export, reload, restore, video playback and return navigation. The mobile run uses Chromium touch emulation at 390 × 844. The desktop run uses 1440 × 1000.

To repeat, start the production preview as described in the [atlas guide](README.md). Make Playwright and its Chromium browser available, or set `PLAYWRIGHT_MODULE` and `ATLAS_BROWSER_EXECUTABLE` to local installations. Run `node scripts/test-kaerimichi-browser.mjs`. Set `ATLAS_ORIGIN` when using a different preview port.

[Desktop atlas](screenshots/atlas.png) · [Walking map](screenshots/desktop-walk.png) · [Mobile walk](screenshots/mobile-walk.png) · [Mobile shops](screenshots/mobile-shops.png) · [Ajishino in August 2024](screenshots/ajishino-2024.png) · [Mobile register](screenshots/mobile-2024.png)
