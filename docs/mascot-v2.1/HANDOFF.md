# V2.1 asset-only recovery handoff

Recovered on 2026-10-18 from `Tinker-Panda-V2.1-Production.zip` in a fresh
isolated worktree on `codex/tinker-panda-v2-1-production`, based on current
`origin/main` commit `7d695e47b8a47f448d0dd5bb9f9086be15bf41fd`.

The supplied patch was originally prepared against
`fc1f8d3e11026713a3da22921f4f19634fce2c59`. Its 70 added files do not overlap
the portfolio changes since that base. `git apply --check` passed and the
patch was applied directly; no synthetic commit history was imported.
Applied text matched the archive after normalizing Windows line endings.
All supplied PNG/GIF files, including regenerated outputs, match the archive
byte-for-byte. Recovery updates only this handoff, README and PR description.

## Approved master

The attached B, frozen candidate B and production `front.png` have SHA-256:

`a07781439461bc715463a6d830598e8eb93ef47ec508d346307d71915f534ba3`

The approved front was copied exactly. No approved artwork was edited.

## Completed checks

- `npm ci` completed successfully with zero reported vulnerabilities.
- Python 3.12.14 / Pillow 12.3.0 production generation completed.
- `node scripts/validate-tinker-panda-v2-1.mjs` passed: 29 PNGs, 14 frames,
  12 GIF previews, 19 palette colors and 57,344 alignment pixel checks.
- Repeat generation and validation produced byte-identical files.
- `npm run validate` passed: zero Astro errors/warnings/hints, successful
  build, and 16 HTML pages verified, including links, metadata and feeds.
- Inspected production review and all animation frame strips. Idle keeps
  feet fixed with a one-pixel head lift; blink changes only the eye regions;
  happy bounce moves the whole sprite by 0/-1/-3/-1 pixels; tail sway keeps
  the head, body and tail attachment fixed. No unintended drift or clipping
  was found. GIF decoding verifies disposal, timing and every source pixel.
- Browser review covered the four loops, 1x/4x/8x sizing, light/dark backgrounds
  and pause/resume switching to static frame-zero PNGs. Reduced-motion logic
  was source-reviewed; OS preference changes were not exercised.

## Draft review gate

Candidate B is approved. Owner visual acceptance of the derived views,
portrait, expressions and animation timing remains open; keep the PR in draft.
Use `PR-DRAFT.md` for the draft PR description and `review.html` for review.
The change is asset-only: no existing site source, branding, dependency,
workflow, privacy/OAuth page or deployment configuration is modified.
Do not merge or deploy as part of this recovery.

The original package reported an integration-token 403 during branch creation.
This recovery uses the normal local clone and its configured GitHub credentials.
The original ZIP and complete binary patch remain preserved locally.
