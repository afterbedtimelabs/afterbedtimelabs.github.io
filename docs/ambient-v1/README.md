# Ambient Homepage V1 — local owner review

This is a working local candidate, built from the approved November 5 V3.4 release. Nothing was pushed, merged, published, or deployed. The NightStock repository was not accessed or changed.

## Open the candidate

- Worktree: `C:\AI\afterbedtimelabs.github.io\.ambient-worktrees\v1`
- Branch: `feature/ambient-homepage-v1`
- Checkpoint: run `git rev-parse HEAD` in this worktree for the full local commit SHA.
- Double-click [`Launch Ambient Homepage.cmd`](../../Launch%20Ambient%20Homepage.cmd).
- Preview: <http://127.0.0.1:4351/>. The launcher reuses this worktree's background server or starts it on an available loopback port and prints the actual URL.
- Manual start: `npm run dev -- --background --host 127.0.0.1 --port 4351`
- Manage only this worktree's preview: `npm run dev -- status`, `npm run dev -- logs`, `npm run dev -- stop`.

Node and the existing repository dependencies are available on this PC. This nested worktree currently resolves the existing installed dependencies in `C:\AI\afterbedtimelabs.github.io\node_modules`; if moved elsewhere, run `npm ci` first. No dependencies were added or lockfiles changed. The launcher was tested without opening the owner's browser. The background server was left available for review.

## What changed

The normal homepage introduces Isaac as a software engineer, describes his software, local AI and game work, and provides immediate project and existing About/contact links. Mission Control remains the featured project. All project data, writing, routes, metadata, theme behavior, and canonical Tinker assets are retained. A homepage note accurately says NightStock development is on hold.

The new scene places Tinker at a desk beside a rainy city window, with a steady warm lamp, laptop, notebook, mug, and electronics. Real HTML copy occupies the quieter left side on desktop. Tablet and mobile layouts put the introduction above the scene. The mobile ambient view uses intentional framing with quiet space above and below so Tinker's full face, the lamp, and the window remain visible.

**Stay awhile** expands the same scene and removes surrounding portfolio content. **Back to portfolio** or Escape returns to the portfolio and restores focus. Sound controls remain accessible in either view. **Sound** opens independent music/rain volume sliders and a **Mute all sound** button.

Completed motion: two restrained window-rain layers, gentle steam, and a discrete eye-only blink with 6.2–12.7-second quiet intervals. No flat-image stretching, flashing, or lamp flicker. Manual pause, reduced-motion preference, viewport exit, page hiding, and page lifecycle stop visual animation work. A missing scene falls back to the unchanged canonical Tinker sprite; a missing blink cel keeps the open-eyed composition. Without JavaScript, the portfolio and full static scene remain usable.

**Character limitation:** typing, ear, tail, and glance animation are not implemented. The exploratory typing cel shifts surrounding details and was not enabled. Only blinking is completed character animation. The seated pose is new candidate artwork, not a replacement for the approved canonical mascot.

## Original audio

The player label is **Window seat**; the composition source working title is **After Hours**. This original 74 BPM, 48-bar instrumental is 2:35.676 long, with synthesized mellow electric piano, soft bass, restrained drums, a sparse melody, and harmonic variation. Separate synthesized rain loops every 40 seconds. No recordings, samples, soundfonts, streaming services, paid APIs, or purchases were used.

- [Music, browser Vorbis](../../public/audio/ambient/after-hours.ogg)
- [Full lossless music sample](../../public/audio/ambient/after-hours.flac)
- [Separate rain sample](../../public/audio/ambient/window-rain.ogg)
- [Composition and generator](../../scripts/generate-ambient-audio.mjs)
- [Origin, reproduction, and listening notes](audio.md)
- [Measured audio analysis](../../public/audio/ambient/audio-analysis.json)

Press **Play music** deliberately to listen. Toggle rain separately, then open **Sound** to balance them. Reload and browser history return leave sound stopped. Previously requested audio may continue while the tab is hidden, which supports background listening; visual work stops. The browser/OS pausing audio also updates the player state. Loading, cancellation, failure, and retry states are implemented.

All three encoded audio files fully decoded with FFmpeg and had zero clipped samples. Decoded music peak was −3.16 dBFS. Circular synthesis and a measured seam support looping; browser playback was also observed wrapping both tracks. These checks do not establish subjective musical quality. No audio was played through the PC speakers.

## Actual validation

- [Baseline log](baseline-validation.txt): the existing `npm run validate` suite passed before implementation; no inherited failures were observed.
- [Final validation log](validation.txt): `npm run validate` passes (Astro check, static build, 24 HTML pages and metadata/links/assets/sitemap/RSS/draft checks, canonical mascot verification, 15 legacy controller scenarios, and pinned project captures).
- [Final browser report](browser-checks.json): **70 checks passed, 0 failed**, in isolated headless Microsoft Edge 157.0.4341.42 with `--mute-audio`; browser sandbox retained. Reproduce with `node scripts/verify-ambient-browser.mjs` while this preview is running.
- Browser coverage: 320, 390, 768, and 1440 CSS pixels, normal/ambient, dark/light, no horizontal overflow, introduction/project/About discovery, touch targets, keyboard focus and Escape, actual touch events, no autoplay, independent music/rain, slider and mute behavior, pause/reload/history return, browser-external media pause, loading/cancel, failures/retry, loop wrapping, reduced motion, offscreen and hidden-page suspension, scene failure fallback, no JavaScript, and seven representative existing routes.
- Observed blink: 160 ms. One **14.511-second** ambient idle sample recorded **0.00775 seconds task time**, **0.00031 seconds script time**, DOM elements **438→438**, CDP nodes **1061→1061**, and heap **1,353,848→1,363,132 bytes**. No growing DOM was observed. This brief headless sample is not a long-duration performance benchmark.
- No unexpected runtime console errors in the final browser pass. Browser validation is on Edge; Safari, Firefox, physical touch devices, and prolonged listening were not tested.

The V3.4 validator's obsolete homepage-component assertion was updated for `AmbientWorkshop`; all canonical pixel, frame, atlas, palette, and SHA checks remain. New validation output is written to [canonical-asset-validation.json](canonical-asset-validation.json), leaving historical V3.4 reports intact. The dev toolbar is disabled for this review so it cannot obstruct small-screen controls; production behavior is unaffected.

## Real browser screenshots

These are rendered browser captures, not generated concept art. The final report indexes all 29 screenshots.

| View | Dark | Light |
| --- | --- | --- |
| Desktop homepage, viewport | [1440 dark](screenshots/home-1440-dark-viewport.png) | [1440 light](screenshots/home-1440-light-viewport.png) |
| Desktop homepage, full page | [1440 dark](screenshots/home-1440-dark.png) | [1440 light](screenshots/home-1440-light.png) |
| Desktop ambient | [1440 dark](screenshots/ambient-1440-dark.png) | [1440 light](screenshots/ambient-1440-light.png) |
| Mobile homepage | [390 dark](screenshots/home-390-dark.png) | [390 light](screenshots/home-390-light.png) |
| Mobile ambient | [390 dark](screenshots/ambient-390-dark.png) | [390 light](screenshots/ambient-390-light.png) |
| Small mobile ambient | [320 dark](screenshots/ambient-320-dark.png) | [320 light](screenshots/ambient-320-light.png) |
| Tablet homepage | [768 dark](screenshots/home-768-dark.png) | [768 light](screenshots/home-768-light.png) |

[Motion paused](screenshots/motion-paused-desktop.png) · [Reduced motion](screenshots/reduced-motion-desktop.png) · [Blink cel rendered for inspection](screenshots/blink-closed-for-art-review.png) · [Keyboard focus](screenshots/keyboard-focus-ambient.png) · [Volume and mute](screenshots/audio-mixer-muted-desktop.png) · [Loading](screenshots/audio-loading.png) · [Desktop audio failure](screenshots/audio-error-desktop.png) · [Mobile audio failure](screenshots/audio-error-mobile.png) · [Missing scene fallback](screenshots/missing-scene-ambient-mobile.png) · [No JavaScript](screenshots/no-javascript-desktop.png).

Focused corrections from observed browser results: tablet text reflow, wider mobile ambient crop, organic eye clipping, centered missing-scene fallback, and removal of the development toolbar's 320px control obstruction. The [first-pass report](browser-checks-first-pass.json) and [obstruction capture](screenshots/first-pass-toolbar-obstruction-320.png) are retained as historical evidence; final results are in `browser-checks.json`.

## Baseline and preservation

The approved baseline is **`8d792a4af95c17e7d697b223228bc4d9300bd4f2`**, branch `release/v34-2026-11-05`, in `C:\AI\afterbedtimelabs.github.io\.release-candidates\v34-2026-11-05`. The new branch/worktree was created directly from it. The location stays inside the authorized writable workspace; the suggested D: path was unused, but existing D: review content was left in place.

Original locations were inspected before editing:

- Outer repository: `709f60031cd72f085ff4ad799aba767c65814c69`, `codex/nightstock-showcase-tinker-final`; existing untracked recovery, release, art, and documentation directories preserved.
- Approved V3.4 repository: the SHA above, with a pre-existing modification to `docs/tinker-panda-v3.4/asset-validation.json` preserved in that original checkout.
- `D:\workspace\Labs-v34-Final-Review`: detached `709f60031cd72f085ff4ad799aba767c65814c69`, same report path modified; inspected read-only with elevated filesystem access. It was not substituted for the newer release.
- Living Workshop V2: `C:\AI\afterbedtimelabs.github.io\.recovery\living-workshop-v2`, branch `feature/living-workshop-v2`, clean at **`6862a4b16bef428fe514c575032410dfbb044936`**. Its separate base repository's 82 staged deletions remain untouched.

Selective V2 reuse is the notebook's numbered-entry idea with real collection dates, reading times, and responsive rows. V3.4's theme component is already identical to V2 and remains unchanged. Existing galleries and newer content remain intact; the older V2 mascot and project records were not imported. GitHub main and PR #5 were not used as a baseline.

Approved canonical Tinker SHA-256 remains **`b7a25d71ae8b74a0f692462090809843fab594eb58ef38f8c4e6d3bc68f3963e`**. New image sources are under `art/ambient-v1/`, runtime art under `public/images/ambient/`. [Artwork provenance and exact generation prompts](artwork.md) identify the built-in image-generation tool and each new candidate asset. No rainy-workshop concept attachment was available in this task.

Implementation followed the official [Astro component guide](https://docs.astro.build/en/basics/astro-components/) and [styling guide](https://docs.astro.build/en/guides/styling/).

## Owner review

1. Compare the seated Tinker interpretation with the approved mascot: face, cheek markings, eye size, scarf, dark outfit, proportions, and tail.
2. Judge scene warmth, pixel crispness, blink, rain/steam strength, desktop text balance, and the deliberate mobile framing.
3. Listen to music and rain separately, then together. Assess timbre, repetition, default balance, and the music seam around 2:35.7. Perceptual audio quality and long listening comfort remain unapproved.
4. Decide whether blink-only character motion is sufficient for V1. Typing, ear, tail, and glance cels remain deferred; there are no games, accounts, chat, live feeds, or unrelated redesigns in this candidate.
