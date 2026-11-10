# Production build and browser validation

## Build

Clean, candidate-local `npm.cmd ci`: 285 packages installed. Node 24; installed Astro **7.3.5** from the existing lockfile. The build uses `SITE_URL=https://afterbedtimelabs.dev`, static output and trailing slashes. The dependency installation resolves inside the new worktree, not the outer project's node_modules.

`npm.cmd run validate` exited 0. [Full log](validation.txt):

- Astro diagnostics: 53 files, 0 errors, 0 warnings, 0 hints.
- Static build and verification: 24 HTML documents, local links/fragments, image/CSS assets, canonical/social metadata, RSS, sitemap, robots and one excluded draft.
- Canonical mascot: exact approved image, 18 frames, 72 historical preservation comparisons. The 106 absent historical exploration files are outside the frozen tracked source subset, as documented by the inherited verifier; existing copies elsewhere were not removed.
- 15/15 legacy mascot-controller scenarios passed. These use a simulated DOM and timers, not a real browser.
- NightStock: six pinned source captures, 18 responsive outputs, dimensions/hashes, production copies and eager/lazy loading policy passed.

[Artifact audit](artifact-audit.json): 95 files, **18,085,306 bytes** in `dist`; all HTTP-served bytes match the local artifact. All 64 `public` files are exact production copies. All 22 current public sitemap URLs remain. The legacy `/writing/meet-navi-waypoint/` redirect and 404 document are present. No source PNG archive, review recording, environment file, dependency tree or source map is deployed.

## Real browser coverage

Tests used `astro preview` of this production build at `http://127.0.0.1:4355`, isolated profiles, browser sandboxing enabled, cache disabled and browser audio muted. The suite drove actual mouse/keyboard input through Chrome DevTools Protocol. It did not use the development server.

| Browser | Assertions | Errors | Captures |
| --- | --- | --- | --- |
| Microsoft Edge `157.0.4341.42` | 67 passed, 0 failed | 0 console/runtime errors | 15 PNGs |
| Google Chrome `156.0.8078.80` | 67 passed, 0 failed | 0 console/runtime errors | 15 PNGs |

Coverage includes Home's real Mission Control workbench link, Projects and NightStock detail, Writing and an article, About, Back/Forward, active navigation and titles, theme persistence, anchor/forward/history scroll, expanded-scene Escape focus, paused/resumed/reduced motion, stable arm pixels over 18 seconds, natural blinking, rain and steam, and one correctly aligned circuit-light animation. Layouts: 1440, 768, 390 and 320 CSS pixels, normal and expanded views. Both light/dark interfaces and mobile interior music controls were captured. Modified-click and external-link tests inspect cancellation behavior with synthetic click events; they do not claim an actual external destination/new-tab browsing test.

Music instrumentation retained the same audio DOM object across all supported route transitions and observed a single player, one initial play event, no intervening pause/load/seek/wait/stall events, stable listener counts, preserved volume/mute and pause state, synchronized Home/interior controls, and silent hard refresh/new tabs.

| Measurement across repeated playing navigation | Media time elapsed | Wall time elapsed |
| --- | --- | --- |
| Edge | 8.798318 seconds | 8.792600 seconds |
| Chrome | 8.706546 seconds | 8.674300 seconds |

The suites are **instrumented continuity evidence, not new listening checks**. No audible-output claim is based on muted browsers. The owner-approved V1.2 listening/visual decision and prior captured audio evidence are preserved at `docs/ambient-v1-2`; production application/audio bytes are unchanged. Safari, Firefox, physical phones, background OS audio interruption and older browsers without state-preserving DOM movement are not verified. Both tested browsers use Chromium. Firefox was absent from standard installation paths; Safari is not available in this Windows environment.

## Visual review

Inspected actual desktop dark/light, mobile Home and interior-control screenshots. Composition and mascot remain intact, text fits, and the compact interior control remains available. Automated coordinate checks establish bulb alignment in every captured viewport, including expanded mode. No design was reopened.

- [Edge desktop dark](edge/screenshots/home-dark.png)
- [Chrome desktop light](chrome/screenshots/home-light.png)
- [Mobile Home](edge/screenshots/home-390.png)
- [Mobile interior controls](chrome/screenshots/mobile-interior-playing.png)
- [Expanded mobile](edge/screenshots/expanded-390.png)
- [Reduced motion](edge/screenshots/reduced-motion-mobile.png)
- [Mission Control playing](edge/screenshots/mission-control-playing.png)
- [NightStock playing](chrome/screenshots/nightstock-playing.png)

## Reproduce focused checks

With the built preview running in one terminal, run from the candidate root in a second terminal:

```powershell
node scripts/verify-continuity-browser.mjs http://127.0.0.1:4355 docs/ambient-v12-release/edge
node scripts/verify-continuity-browser.mjs http://127.0.0.1:4355 docs/ambient-v12-release/chrome 'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe'
node scripts/verify-release-artifact.mjs http://127.0.0.1:4355
```

These overwrite only release evidence. They never change the accepted assets or remote state. Full tests need normal local browser/process/network permissions. In this managed session, localhost/network child processes required the available Node runtime rather than the restricted shell.

Remote Linux CI, production-host behavior of the new candidate, and settings unavailable through read access remain pending. No GitHub run is represented as having executed this local candidate.
