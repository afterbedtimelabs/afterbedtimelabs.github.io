# Tinker Panda V2.1: approved B master and initial production assets

The owner approved facial candidate B because its sparkling amber eyes and
open smile better match Tinker's friendly personality. This asset-only change
locks that exact 64x64 PNG as the canonical front master and derives the first
production views, expressions and animation loops from it.

- Front, side, back and a dedicated native 64x64 portrait.
- Neutral, happy, blink, curious and sleepy expressions with fixed face anchors.
- Idle breathing, blink, happy bounce and tail sway; 14 transparent PNG frames,
  sprite atlases and GIF previews at 1x/4x/8x.
- Deterministic pixel-grid sources, fixed 19-color palette, validation and
  light/dark review boards, plus an offline animation inspector.

The approved front is byte-for-byte candidate B. Body, clothing, pouch, tail,
emblem, bow and external silhouettes are preserved. No website integration is
included; no routes, homepage content, logo, favicon, privacy/OAuth pages,
dependencies or deployment configuration change.

## Validation

- Passed: 29 PNGs, 14 animation frames, 12 GIFs, palette/binary alpha/dimensions,
  all atlas cells, 57,344 alignment checks, exact master hash, unchanged body
  and silhouettes, expression eye/mouth isolation and connected front ears.
- Every decoded GIF pixel and light/dark preview at 1x/4x/8x matches its source.
- Repeated generation is byte-identical.
- Source review boards inspected at native and enlarged sizes.
- Recovery checked against origin/main `7d695e47b8a47f448d0dd5bb9f9086be15bf41fd`; the original asset patch applies without overlap.
- Every regenerated PNG/GIF matches the supplied production ZIP byte-for-byte;
  a second generation/validation run is also byte-identical.
- Browser inspector checked at 1x/4x/8x, with light/dark and pause/resume controls.
  All four loops load; frame strips and pixel checks confirm alignment.
  Reduced-motion handling was source-reviewed, not tested by changing OS preferences.
- `npm ci` and `npm run validate` pass: Astro checks report zero errors/warnings,
  the production build succeeds, and verification passes for all 16 HTML pages.

## Review gate

B is approved; the new side/portrait/expressions and loop timing still need
owner visual review. Keep this PR in draft. Do not merge or deploy.

Review files: `docs/mascot-v2.1/production-review.png`,
`docs/mascot-v2.1/animation-frames.png`, `docs/mascot-v2.1/review.html`.
Full process and timings: `docs/mascot-v2.1/README.md`.
