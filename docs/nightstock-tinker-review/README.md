# NightStock showcase + Expressive Markings homepage review

Local integration branch: `codex/nightstock-showcase-tinker-final`. The delivery message supplies the exact commit; `git rev-parse HEAD` also identifies it. Nothing was pushed, merged, deployed, or changed in either draft PR.

## Integration base and preservation

The branch starts at the requested V3.4 handoff, `3be47e92ac778ffc6ef3c8cd6e474f89bd573e1b`, whose parent is the newer showcase main `05431e62db6077c302c265a7a7ede0410c0e72d6`. The original checkout had no tracked edits. Its untracked `.codex/`, `.recovery/`, and four historical art folders remain intact and outside the commit. All other branches and worktrees remain unchanged. A new branch in the existing checkout avoids duplicating or disturbing those historical sources.

The existing homepage already fully integrated V3.4. This pass keeps `src/pages/index.astro`, `src/components/TinkerPanda.astro`, the approved sources, runtime assets, and manifest unchanged. Mission Control remains first and in the spotlight. The NightStock card, detail copy, and introduction now describe the verified first shift, retain the no-public-download status, and preserve the old test-course images and routes.

- [Draft PR #3](https://github.com/afterbedtimelabs/afterbedtimelabs.github.io/pull/3): open, unmerged, asset-only Candidate B at `824ecaa4b42c0a6797059a5dbd716e9b8548e0fa`.
- [Draft PR #5](https://github.com/afterbedtimelabs/afterbedtimelabs.github.io/pull/5): open, unmerged, older Candidate B homepage/controller at `a10be4d4ce634e6bf94a23072de1a2932d284751`, based on the same showcase main. V3.4 selectively adapted its useful controller architecture and tests, with the approved newer 96px art and four sequences. Neither old branch is merged into this branch; their common integration base is `05431e6`.

## Genuine gameplay captures

Inspected `D:/Night Stock` and the V1.3.1 owner, capture, packaging, and Git reports. V1.3.1 is the newest completed version present; the 720p/1080p extracted packages are copies of the same build. The V1.3.1 worktree is clean on `feature/v1.3.1-smooth-shift`, evidence head `11877a9fd6b6e6ea490c37eafe6d1a9e0b0871e8`; packaged game source is `6657236b3b44683e441c8f9bb67af2bf1065fd86`. The later evidence commit does not change packaged game code.

Verified the actual package at `D:/Night Stock/nightstock-v131/artifacts/NightStock-V131-Windows` against its handoff:

- EXE SHA-256: `ab1824f85bfd8e0e4128182c000c4003a3e042245b2967848d089b2a04b22424`.
- PCK SHA-256: `047072e08dd0affedd0bb6e85806c908c8c54479bf4802e0ad7f53967c12c579`.

| Website name | Original capture | Selection |
| --- | --- | --- |
| `nightstock-v131-road` | `.recovery/nightstock-scenic/bridge-cab.png` | Right-hand-drive cockpit, headlights, red bridge |
| `nightstock-v131-forest` | `.recovery/nightstock-scenic/forest-cab.png` | Cedar forest bend |
| `nightstock-v131-tunnel` | `.recovery/nightstock-scenic/tunnel-cab.png` | Kurotake Tunnel from the cab |
| `nightstock-v131-store` | `.recovery/nightstock-scenic/yorumichi-exterior.png` | Lit YORUMICHI store and truck |
| `nightstock-v131-delivery` | `D:/Night Stock/nightstock-v131/artifacts/v131-package-captures/final-02/screenshots/09-physical-delivery.png` | Two cartons physically received, one aboard |
| `nightstock-v131-phone` | `D:/Night Stock/nightstock-v131/artifacts/v131-package-captures/final-02/screenshots/02-dispatch.png` | Actual dispatch phone and destination |

Relative original paths above resolve from the website repository. All six unmodified 1920×1080 PNGs are also committed under [gameplay-originals](gameplay-originals/). [Provenance JSON](../../public/images/projects/showcase/provenance.json) records absolute original paths, preserved copies, source hashes, build identities, processing, and every exported file/hash/dimension. Existing historical provenance entries remain intact.

Fresh scenic images were rendered by the exact package using [capture-route.gd](capture-route.gd). It stages the truck/cargo, uses production cab/chase cameras, and positions an exterior camera at the store. Only the mission overlay is hidden; original lighting, materials, colors, FOV, and world remain unchanged. [Capture records](capture-records.json) retain stations and camera transforms. The initial overlay-visible exploratory captures remain under `.recovery/nightstock-review-scratch/captures`; unused scenic views remain under `.recovery/nightstock-scenic`.

These are genuine viewport readbacks, not retouched or generated images. They are staged visual evidence, not a continuous human drive or performance certification. Existing phone/delivery captures use the packaged harness's staged arrival and real physical handover. The game report's startup delay and unresolved intermittent source-run pause remain game limitations; the website makes no hitch-free claim.

Exports use WebP quality 84 at 640, 1280, and 1920px, with no crop or color adjustment. The article has explicit dimensions, descriptive alt text, factual captions, one eager lead, five lazy later images, and native full-size image links. The existing project media component provides responsive card/detail images. Re-export from original local paths or preserved PNGs:

```powershell
node scripts/export-nightstock-showcase.mjs
npm run validate
node scripts/verify-nightstock-showcase.mjs
git diff --check
```

## Approved Tinker Panda

Uses the unchanged V3.4 `public/mascot/tinker-panda-v3.4/front.png`, `manifest.json`, and `atlases/{idle,blink,happy,tail}.png`, with the unchanged `TinkerPanda.astro` controller. The master is the approved Expressive Markings front, byte-identical to its frozen source, native **96×96**:

`b7a25d71ae8b74a0f692462090809843fab594eb58ef38f8c4e6d3bc68f3963e`

It renders at 192 CSS pixels (2×), or 96px in a container narrower than 240px, with crisp nearest-neighbor rendering. All 18 native frames, palette, transparency, face/body constraints, exact first/last frames, and manifest timings pass. Runtime PNG payload remains 16,400 bytes. Idle, blink, and tail alternate after 7.5-second rests; greeting runs only on request. Pause, viewport, page-visibility, failure fallback, and reduced-motion guards remain present. No perpetual animation-frame loop or framework hydration is added.

The existing [review board](../tinker-panda-v3.4/review.html) was browser-inspected at native/4×, and tail playback completed and re-enabled Play. The actual homepage was separately inspected and exercised; the board is not a substitute for homepage verification.

## Verification and screenshots

- [Full validation](validation.txt): Astro check 0 errors, 0 warnings; one pre-existing unused-function hint in an untracked V3.2 exploration script. Production build succeeds; original verifier checks 24 HTML documents and excluded drafts. Panda asset constraints and **15/15 actual-controller scenarios** pass.
- [Image validation](image-validation.txt): six pinned source captures, original PNG hashes, 18 exported WebP hashes/dimensions, exact built copies, one eager/five lazy images pass.
- The gallery verifier now expects six 1920×1080 NightStock captures. The old mascot preservation audit explicitly excludes four intentionally refreshed content/verification files in addition to its original homepage/package exclusions; **182 other files still match exact raw hashes**. No mascot-art exception was introduced.
- [Browser page checks](browser-checks.json): actual Chromium production preview, desktop 1440×1000 and mobile 390×844, all three pages in light/dark. All images loaded, no overflow, no console warnings/errors in the preview. [Additional widths](responsive-checks.json): 320, 768, and 820, no hero overlap or overflow.
- Keyboard Enter greeting and Space pause worked; pause returned to the static front. Focus outline was a visible 2px accent line. Greeting/pause kept the reserved 192×192 art rectangle unchanged. Project and gallery navigation worked; Enter on full-size viewing opened the actual 1920×1080 image.
- Native reduced-motion switching and JavaScript-disable controls are not exposed by this browser backend. Reduced motion, hidden/offscreen cancellation, failure cases, and static no-JavaScript markup/CSS are covered by deterministic actual-controller/asset checks, not claimed as native-browser preference tests. Browser views emulate viewport sizes at DPR 1; physical devices, Safari, and Firefox were not tested.

Genuine final browser captures (all three pages, both themes, desktop/mobile) are in [screenshots](screenshots/):

| Page | Desktop light / dark | Mobile light / dark |
| --- | --- | --- |
| Homepage | [Light](screenshots/home-desktop-light.jpg) / [Dark](screenshots/home-desktop-dark.jpg) | [Light](screenshots/home-mobile-light.jpg) / [Dark](screenshots/home-mobile-dark.jpg) |
| NightStock detail | [Light](screenshots/nightstock-desktop-light.jpg) / [Dark](screenshots/nightstock-desktop-dark.jpg) | [Light](screenshots/nightstock-mobile-light.jpg) / [Dark](screenshots/nightstock-mobile-dark.jpg) |
| Introduction/gallery | [Light](screenshots/gallery-desktop-light.jpg) / [Dark](screenshots/gallery-desktop-dark.jpg) | [Light](screenshots/gallery-mobile-light.jpg) / [Dark](screenshots/gallery-mobile-dark.jpg) |

## Local preview

From `C:/AI/afterbedtimelabs.github.io`:

```powershell
npm run build
npm exec astro preview -- --background --host 127.0.0.1 --port 4326
```

Preview: <http://127.0.0.1:4326/>; [NightStock](http://127.0.0.1:4326/projects/nightstock/); [gallery](http://127.0.0.1:4326/writing/meet-nightstock/). It is running for review. Manage with `npm exec astro preview status`, `npm exec astro preview logs`, and `npm exec astro preview stop`. An older review-board server was already running on 4322 and was reused without alteration. Earlier preview attempts on 4324 were unreachable; the recorded final checks all use 4326.

Owner review is the remaining publication gate. The local branch is ready to review; publishing and any PR changes remain separate actions requiring authorization.
