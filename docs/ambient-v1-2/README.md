# Ambient Homepage V1.2: accepted local baseline

**Sprint closed.** Isaac accepted application checkpoint `ba475f7377c7d75a315a88714c6b1658c6cec621` on November 8, 2026 (America/New_York), approving the circuit-board bulb animation and continuous music playback across portfolio navigation. See [owner acceptance](owner-acceptance.md) and the separate [publication/integration backlog](publication-integration-backlog.md). This acceptance does not authorize push, merge, publication, or deployment.

V1.2 restores Tinker's resting arms, adds a quiet circuit-board light, and keeps the original music playing across portfolio navigation. Tinker remains the fictional lab mascot; Isaac remains the portfolio owner.

## Accepted baseline

- Reviewed parent: `4cf8a9487f15652b440549fd999d1445bd82539e`.
- Branch: `feature/ambient-continuity-v1-2`.
- Worktree: `C:\AI\afterbedtimelabs.github.io\.ambient-worktrees\continuity-v1-2`.
- Owner preview: <http://127.0.0.1:4353/>.
- Accepted application checkpoint: `ba475f7377c7d75a315a88714c6b1658c6cec621`. Subsequent sprint-closeout commits change documentation only.
- V1 and V1.1 remain in their original worktrees, with ports 4351 and 4352 reserved. The outer checkout and its unrelated local work were not changed.

The actual Git common directory for these ambient candidates is inside `.release-candidates\v34-2026-11-05\.git`, separate from the outer checkout's history. V1.1 was clean at the supplied checkpoint before this worktree was created.

## Start, inspect, stop

```powershell
Set-Location -LiteralPath 'C:\AI\afterbedtimelabs.github.io\.ambient-worktrees\continuity-v1-2'
& '.\Launch Ambient V1.2.cmd'
```

The launcher reuses this worktree's background server, reports the actual URL, and opens the browser without starting music. Alternatively:

```powershell
Set-Location -LiteralPath 'C:\AI\afterbedtimelabs.github.io\.ambient-worktrees\continuity-v1-2'
npm.cmd run dev -- --background --host 127.0.0.1 --port 4353
npm.cmd run dev -- status
npm.cmd run dev -- logs
Start-Process 'http://127.0.0.1:4353/'
```

Stop only this candidate from this directory:

```powershell
npm.cmd run dev -- stop
```

Node/dependencies resolve from the existing outer checkout. No package or lockfile change was needed. If moved elsewhere, run `npm.cmd ci` first.

## Implementation

**Resting pose.** Removed the typing canvas, atlas request, timing import, and scheduler. The original V1.1 scene supplies the untouched resting arms. Historical typing images, timing data, assembly scripts, and review material remain available. Eye-only blinking and the accepted rain/steam paths and timing are unchanged.

**Circuit light.** A small stepped SVG core and low-opacity reflected light share the scene's 1659 × 948 coordinate system, centered on the existing LED near (1269, 817). A single 16-second CSS animation varies warm amber, holds briefly toward muted teal, then returns. No geometry moves. Pausing or reduced motion removes the animation and renders steady warm amber; resuming creates one animation. The underlying artwork stays byte-identical.

**Continuous music.** Installed Astro is 7.3.5. Every portfolio page uses `BaseLayout`, now containing `ClientRouter`, one `transition:persist="workshop-music"` audio element, and a once-loaded music controller. The original OGG, loop attribute, volume range, default 40%, mute, loading/cancel/retry, and media-pause handling are retained. The exact audio node survives supported internal navigation. There is no timestamp-restoration workaround and no Web Audio engine to recreate.

Homepage controls and the compact interior controls use the same controller. Interior controls appear only after deliberate activation during this document's visit and remain available while paused. Delegated controls bind once; each page swap synchronizes the new controls. Playback is never serialized, so refreshes and new tabs stay silent. Full-document departures stop sound. Navigation to external sites does not promise continuity.

**Lifecycle.** Scene observers, blink timers, and page-scoped event listeners are disposed before a swap using an AbortController. Home reinitializes on `astro:page-load`; its deliberate motion-pause preference survives internal navigation. Its toolbar is revealed in the incoming document before the swap so history scroll restoration does not shift when controls initialize. Theme controls query the current DOM and resynchronize after swaps. Astro retains native modified/external-link behavior, history, page titles, active navigation, scroll handling, and route announcements. Transitions have no decorative animation.

Official documentation consulted: [view transitions and lifecycle](https://docs.astro.build/en/guides/view-transitions/), [Astro components](https://docs.astro.build/en/basics/astro-components/), and [styling](https://docs.astro.build/en/guides/styling/). The installed 7.3.5 router source was also inspected, including its state-preserving media movement.

## Evidence

- [Full validation log](validation.txt): `npm.cmd run validate`, including Astro check/build, 24 generated pages, canonical mascot/legacy controller checks, and pinned NightStock artwork.
- [Focused browser results](browser-checks.json): **59 passed, 0 failed**, actual isolated Microsoft Edge with its browser sandbox retained. Includes the real Mission Control workbench link, Projects, Writing, an individual article, About, Back/Forward, repeated navigation, player identity, media clock/event samples, volume/mute, pause/resume, synchronized controls, fresh-tab/refresh silence, theme, links, scroll, and scene motion.
- [46-second browser recording with captured audio](ambient-v1-2-browser-46s.mp4): Home, expanded scene, Mission Control, then Home. Approximately 3s expand, 24s return, 27s Mission Control, 36s Home. Music is deliberately activated just before the recorded interval. The clip includes the same player's actual `captureStream()` audio, recorded with MediaRecorder and muxed with timestamped Edge compositor frames. No source music file was overlaid to simulate continuity.
- [Recording metadata](browser-recording.json): natural bulb/blink samples, navigation times, same-player capture evidence, and browser version. The first click has a null timestamp because it precedes the capture interval.
- [Audio analysis](audio-capture-analysis.txt): 46-second AAC track; no detected silence of at least 25ms below -55dB. This is signal analysis, not a speaker/headphone listening test.
- [Desktop](screenshots/expanded-1440.png), [mobile](screenshots/expanded-390.png), [small mobile](screenshots/expanded-320.png), [interior music controls](screenshots/mission-control-playing.png), and [reduced motion](screenshots/reduced-motion-mobile.png).
- [Preservation audit](preservation.json): 243 historical art/review/audio/ambient files checked against V1.1, with no changes beyond checkout line endings. The original music hash is unchanged.

The canonical mascot verifier previously required the old layout/theme source bytes. Its documented exception list now permits the two intentional router/lifecycle edits, while all artwork/frame checks remain exact. New validation evidence goes into this directory, preserving V1.1's reports.

Reproduce in an ordinary Windows session:

```powershell
npm.cmd run validate
node scripts/verify-continuity-browser.mjs
node scripts/record-continuity.mjs
```

The browser scripts accept a URL as their first argument. Final automated acceptance used a built-site preview on 4354 to exclude development hot reloads; the owner dev preview remains 4353. Browser profiles and raw recording frames use temporary directories outside the source watcher. Edge and ffmpeg must be on this PC (or use `EDGE_BINARY` / `FFMPEG_BINARY`).

## Limits and completed owner review

Instrumented browser checks and captured-audio signal analysis remain distinct from owner review. The owner has now approved the bulb animation and continuous music playback across portfolio navigation; the review browser, device, and listening setup were not specified. This does not expand the automated coverage beyond Edge. Safari, Firefox, physical mobile devices, and older browsers without modern state-preserving DOM moves remain unverified. Hard reloads, new tabs, and external destinations deliberately do not carry playback.

The original review checklist is retained for reference:

1. Watch the board for 20 seconds in Home and Stay awhile: is the brightness/color change subtle enough, with stable arms and a stationary bulb?
2. Press Play music, wait a few seconds, then use the Mission Control workbench link. Listen through Writing, an article, About, Back/Forward, and Home for any audible gap or restart.
3. Change volume, pause on an interior page, navigate, and resume. Confirm the compact controls are comfortable and Home shows the same state.

V1.2 development is closed and owner acceptance is recorded. No push, merge, deployment, or public preview was performed. Publication/integration remains a separately authorized scope.
