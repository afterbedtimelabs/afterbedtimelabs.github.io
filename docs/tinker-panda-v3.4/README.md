# Tinker Panda V3.4 — owner review

Expressive Markings is the final canonical front. The website now uses the exact approved 96 × 96 PNG, with a small, cohesive set of idle, blink, greeting and tail animations. The current open-eyed expression and restrained smile are retained. No new character concepts were generated.

This implementation is locally committed on `codex/tinker-panda-v3.4-final`, based on main `05431e62db6077c302c265a7a7ede0410c0e72d6`. Obtain the exact deliverable commit with `git rev-parse HEAD`; it is also supplied in the delivery message. Nothing was pushed, merged, deployed or published.

## Review first

- [Local review board](review.html): native 96px and 4× master, historical comparison, all frames, finite playback and actual website captures.
- [Lossless comparison board](comparison-board.png) and [all animation frames](animation-frames.png).
- [Full automated test output](test-results.txt), [pixel validation](asset-validation.json), [browser evidence](browser-validation.json), and [reproducibility hashes](reproducibility.json).
- Actual website screenshots: [desktop light](screenshots/desktop-light.jpg), [desktop dark](screenshots/desktop-dark.jpg), [mobile light](screenshots/mobile-light.jpg), [mobile dark](screenshots/mobile-dark.jpg), [tablet](screenshots/tablet-light.jpg).
- Browser captures of the [native/4× master](screenshots/canonical-native-4x.jpg), [idle](screenshots/animation-idle.jpg), [blink](screenshots/animation-blink.jpg), [happy](screenshots/animation-happy.jpg), and [tail](screenshots/animation-tail.jpg). Animation captures show selected production-atlas frames in the review HTML; website captures show the real Astro production build.

The approved 96px source works well here: the homepage displays it at exactly 192 CSS pixels (2×), with a 96px fallback for containers narrower than 240px. Native-size comparison remains clear, and the existing colors fit both site themes. The owner can review animation restraint and placement without reopening the face decision.

## Exact deliverable paths

All paths are within `C:\AI\afterbedtimelabs.github.io`:

| Deliverable | Relative path |
| --- | --- |
| Canonical website PNG | `public/mascot/tinker-panda-v3.4/front.png` |
| Atlas files and timing/lineage manifest | `public/mascot/tinker-panda-v3.4/` |
| Frozen approved source, historical references, palette and prompt | `art/tinker-panda-v3.4/sources/` |
| Individual native animation frames | `art/tinker-panda-v3.4/frames/` |
| Astro component and controller | `src/components/TinkerPanda.astro` |
| Homepage integration | `src/pages/index.astro` |
| Review board | `docs/tinker-panda-v3.4/review.html` |
| Genuine browser captures | `docs/tinker-panda-v3.4/screenshots/` |
| Validation records | `docs/tinker-panda-v3.4/{asset-validation,browser-validation,independent-review}.json` |

Canonical PNG SHA-256: `b7a25d71ae8b74a0f692462090809843fab594eb58ef38f8c4e6d3bc68f3963e`. It is byte-identical to V3.3 `01-expressive-markings.png`. Compared with V3.2 Hybrid 96, exactly 191 face pixels differ; alpha and all 8,122 pixels outside the prior face mask remain exact. The palette has 19 opaque colors and binary transparency.

## Animation and integration

| Sequence | Frames / duration | Constraint |
| --- | --- | --- |
| Idle | 3 / 3,600ms | 55 changed hoodie-interior pixels; face, silhouette, scarf and paws fixed |
| Blink | 5 / 470ms | Approved eye apertures only; closed for 90ms; brows, cheeks and smile fixed |
| Happy / greeting | 5 / 820ms | Whole character moves up 0, 1, 2, 1, 0 native pixels; exact face throughout |
| Tail | 5 / 1,640ms | Isolated upper tail moves one native pixel each way; ears and body fixed |

Every sequence starts and ends on the exact approved front. Ambient playback rotates blink, idle and tail with 7.5 seconds of rest between sequences; happy plays only after “Say hello.” Pause, hidden-page and viewport guards cancel motion. Reduced motion uses the approved still and leaves greetings functional. The static image and caption remain usable without JavaScript. Failed, stalled or malformed atlases retain the still image.

The five runtime PNGs total **16,400 bytes**. Atlases load on demand. No dependencies were added and the lockfile is unchanged. The homepage keeps its current text, projects, navigation and visual identity. Only the hero illustration slot changes, plus a tablet-only 24px gap to prevent the new rectangular panel overlapping the text. The original Workbench component remains available. No other canonical mascot occurrence was present on current main; Riku remains a separate, unchanged project.

## Validation and corrections

Run from the repository root:

```powershell
npm run validate
npm run mascot:generate
node scripts/build-tinker-review.mjs
npm run mascot:verify
git diff --check
```

`npm run validate` extends the existing checks: Astro check → production build → original website regression verifier → mascot pixel checks → actual-controller scenarios. Final results:

- Astro: 0 errors, 0 warnings. One pre-existing unused-function hint in the preserved V3.2 exploration script.
- Production build: 23 Astro pages; existing verifier passes all 24 HTML documents, metadata, internal links/fragments, assets, sitemap, RSS, robots and draft exclusion.
- Pixel checks: approved PNG exact, 18 native frames, first/last exact, original palette/binary alpha, unchanged-region constraints, all frames retain 5,215 opaque pixels, atlas/standalone consistency and timing agreement.
- Preservation: 186 pre-existing files match their original raw hashes. Only the intentional homepage and package-script changes are excluded. LF-normalized text checks also pass against Git blobs for portable CI; images always require exact bytes.
- Controller: 15/15 deterministic scenarios pass, including timing, cancellation, repeated greetings, missing/failed/stalled/malformed image loading, visibility threshold, page restoration, pause and initial/changing reduced-motion preferences.
- Reproduction: 28 generated assets, native frames and review files are byte-identical after regeneration.
- Browser: real Chromium views at widths 320, 390, 768, 820 and 1440; desktop/mobile light/dark screenshots; no horizontal overflow, broken images or console warnings/errors in the inspected pages. Greeting size/position within its reserved figure remains stable. Navigation and the projects anchor work. Review playback completes three tail cycles and returns to the front.

Independent critique found and corrected a rectangular tail mask that included seven ear-edge pixels, an inaccurate happy-frame change count, and Windows-only preservation hashes. Visual QA also corrected residual blink edges and the inherited tablet overlap. [Independent review](independent-review.json) records the pixel checks and portable-check simulation. Final frame boards and website screenshots were recaptured after the relevant corrections.

Browser captures use DPR 1 viewport emulation, not physical devices. Safari and Firefox were not available. OS reduced-motion switching and browser JavaScript-disable controls were not exposed: those behaviors are validated using the actual controller under deterministic media/DOM conditions, plus markup/CSS checks. JPEG screenshots establish appearance; the lossless source/atlas validator establishes pixel fidelity. Subtle idle/tail amplitude is an owner preference, not an unresolved technical defect.

## Preservation and PR path

All earlier V2.1, V3, V3.2, V3.3 and approved-handoff artwork in the original checkout remains unchanged. Large historical exploration folders, `.recovery/` and `.codex/` were already untracked and remain outside this commit. The exact approved master and minimal historical references needed to reproduce and validate V3.4 are versioned in the new source folder. Existing branches and other worktrees were not modified.

[Draft PR #3](https://github.com/afterbedtimelabs/afterbedtimelabs.github.io/pull/3) remains open, unmerged and unchanged. Its head is `824ecaa4b42c0a6797059a5dbd716e9b8548e0fa` on `codex/tinker-panda-v2-1-production`: 70 asset/document/script files, no website integration. The separate old integration branch `codex/tinker-panda-homepage-v1` is at `a10be4d4ce634e6bf94a23072de1a2932d284751`. Its controller architecture and tests were selectively adapted; no old branch was merged or overwritten. Remote main was independently confirmed at the base SHA above.

Recommended next step after owner approval: push this separate V3.4 branch and create a new integration PR against main, linking #3 as historical provenance. Preserve the old draft rather than force-updating it. Remote CI and any merge/deployment require subsequent authorization.

## Local review commands

```powershell
npm exec astro dev -- --background
npm exec astro dev status
npm exec astro dev logs
npm exec astro dev stop

# Serve the committed review board only on loopback:
npm run mascot:review
# http://127.0.0.1:4322/docs/tinker-panda-v3.4/review.html
# Ctrl+C stops this review server.

# Inspect the production build locally:
npm exec astro preview -- --background --port 4323
npm exec astro preview stop
```

Owner review is the remaining gate: confirm the website placement and restrained motion. No further mascot redesign or full animation-pack expansion is recommended for this pass.
