# Night Workshop V1.1 — local owner review

The workshop now looks out into a dark blue-black night while retaining the original warm interior. Tinker is explicitly identified as the lab's fictional mascot, a short alternating typing action has been added, and the rejected rain audio has been removed. Navigation, responsive framing, original music, and the V1 candidate are preserved. New artwork and motion await owner approval.

## Open the candidate

- Worktree: `C:\AI\afterbedtimelabs.github.io\.ambient-worktrees\night-workshop-v1-1`
- Branch: `feature/ambient-night-workshop-v1-1`
- Base: `86ad877aacf63b59a340dd02dd23d32c59cecc62` on `feature/ambient-homepage-v1`
- Preview: <http://127.0.0.1:4352/>
- Windows launcher: [Launch Night Workshop V1.1.cmd](../../Launch%20Night%20Workshop%20V1.1.cmd)
- Full checkpoint hash: `git rev-parse HEAD` in this worktree; the delivery message gives the exact committed hash.

Full PowerShell commands:

```powershell
Set-Location -LiteralPath 'C:\AI\afterbedtimelabs.github.io\.ambient-worktrees\night-workshop-v1-1'
npm.cmd run dev -- --background --host 127.0.0.1 --port 4352
npm.cmd run dev -- status
Start-Process 'http://127.0.0.1:4352/'
```

Or run the launcher, which reuses this worktree's running server and prints its actual URL:

```powershell
Set-Location -LiteralPath 'C:\AI\afterbedtimelabs.github.io\.ambient-worktrees\night-workshop-v1-1'
& '.\Launch Night Workshop V1.1.cmd'
```

Manage only V1.1 from this directory:

```powershell
npm.cmd run dev -- status
npm.cmd run dev -- logs
npm.cmd run dev -- stop
```

Node and dependencies are already installed on this PC. This nested checkout resolves the existing outer `node_modules`; if moved elsewhere, run `npm.cmd ci`. No dependencies or lockfiles were changed. The ordinary Windows launcher does not require administrator privileges. The automated test environment required local-network access for isolated Edge/CDP and the background server; that is separate from normal Windows use.

V1's reserved port is 4351. At initial inspection, its background-server status reported no running server and that port was not listening. No V1 server was stopped or replaced. The inherited launcher in the follow-up directory redirects visibly to V1.1 to avoid version confusion; the original V1 launcher is intact.

## Changes

**Identity.** The visible caption reads “Meet Tinker Panda, the lab’s resident mascot.” The scene description, fallback, About copy, and legacy mascot descriptions use consistent wording. Isaac remains the person behind the projects. Expanded mode keeps the caption small and out of the action.

**Night relight.** Generated source material was registered and confined to exact glass masks. Sky, buildings, roofs, blossoms, and reflections recede into a dark night. A few warm windows and streetlights remain. Original Tinker, furniture, lamp, and desk pixels are reused, not darkened by a full-scene overlay. Light and dark interface appearances share the same nighttime illustration.

**Typing.** Seven registered crop cels articulate the two original paw/forearm selections. Movement concentrates at the fingertips with a small wrist response. The 1.36-second alternating burst is separated by 6.8–9.2-second quiet holds. The complete original resting pose appears between bursts and when motion is paused or unavailable. Eye-only blinking remains intact. The generated contact-pose study changed too much of the drawing and was not used at runtime.

**Environment.** The conspicuous painted rain and large steam ribbon were reconstructed before adding motion. Sparse short rain strokes are masked around actual glass panes, wooden bars, and foreground objects, with varied phases and speeds. Small stepped steam starts at the mug rim. A few dim static water marks remain in narrow glass-edge transition bands.

**Music only.** Rain audio elements, controls, mixer entries, handlers, playback state, and loading are gone. The menu is now **Volume**, with a single music slider and mute control. V1 never stored audio preferences; the current code cannot revive rain from obsolete storage keys. The historical rain file and generator are retained only as inactive provenance. Original **Window seat** activation, looping, default 40% volume, loading/cancel/retry, and browser media-pause handling are preserved. Visual motion remains independent of music.

## Review evidence

These are actual Edge browser captures. The before images are byte-identical copies of V1's committed review captures; [provenance](before-capture-provenance.json) records their source and hashes.

| Review | Capture |
| --- | --- |
| Desktop before | [V1 homepage](screenshots/before-v1-home-1440-dark-viewport.png) · [V1 expanded](screenshots/before-v1-ambient-1440-dark.png) |
| Desktop after | [V1.1 homepage](screenshots/home-1440-dark-viewport.png) · [V1.1 expanded](screenshots/ambient-1440-dark.png) |
| Light interface | [Homepage](screenshots/home-1440-light-viewport.png) · [Expanded](screenshots/ambient-1440-light.png) |
| Mobile 390px | [Homepage](screenshots/home-390-dark.png) · [Expanded](screenshots/ambient-390-dark.png) |
| Mobile 320px | [Expanded](screenshots/ambient-320-dark.png) |
| Complete motion | [40-second actual browser recording](night-workshop-browser-40s.mp4) · [capture method and pose timestamps](browser-recording.json) |
| Exact contact inspection | [Rest](screenshots/typing-rest-for-art-review.png) · [Near contact](screenshots/typing-near-contact-for-art-review.png) · [Far contact](screenshots/typing-far-contact-for-art-review.png) |
| Editable artwork | [Layer/frame/timing package and assembly instructions](../../art/night-workshop-v1-1/README.md) · [offline source reviewer](../../art/night-workshop-v1-1/review.html) · [separate source motion study](../../art/night-workshop-v1-1/typing-motion-study.gif) |

The movie records actual Edge compositor frames for 40 seconds: homepage first, then expanded mode, with naturally scheduled typing, resting holds, blink, rain, and steam. Music remains off. It is not a generated video or animated export substituted for browser evidence. The contact-inspection screenshots are forced static poses captured after the movie; they are labeled separately.

## Validation

- [Full validation log](validation.txt): `npm.cmd run validate` passes Astro checking/build, 24-page metadata/link/asset verification, canonical mascot checks, 15 legacy controller scenarios, and pinned project artwork checks.
- [Final Astro check](final-check.txt): 0 errors, 0 warnings, 0 hints after simplifying the module import in the recording-inspection helper.
- [Browser report](browser-checks.json): **83 passed, 0 failed**, isolated headless Microsoft Edge, browser sandbox retained and speaker output muted. Coverage includes 1440, 768, 390, and 320px; home/expanded; light/dark; keyboard/touch; original routes; no autoplay or audio preload; music volume/mute/pause/reload/history/loop; obsolete preference safety; no rain-audio requests; typing poses/rest; mid-burst pause; reduced motion; offscreen/hidden lifecycle; missing scene/atlas fallback; no JavaScript; and no runtime/console errors.
- [Animation pixel checks](animation-pixel-checks.json): full-frame comparison, fixed-region invariants, foreground occlusion, and exact lossless atlas export. [Environment preservation checks](../../art/night-workshop-v1-1/environment/preservation-checks.json) confirm unchanged protected interior regions and no edits outside the declared relighting/steam masks.
- A 14.503-second browser idle sample used 0.026882 seconds of task time and 0.001678 seconds of script time; DOM 394→394 and CDP nodes 884→884. No growing DOM or obvious performance regression was observed. This is a brief sample, not a long-duration benchmark.
- The final far-paw mask was tightened after the browser suite to exclude two rows of visible key pixels. Runtime behavior and timing were unchanged; full pixel checks and the final browser recording use the corrected export.

Reproduce:

```powershell
Set-Location -LiteralPath 'C:\AI\afterbedtimelabs.github.io\.ambient-worktrees\night-workshop-v1-1'
npm.cmd run validate
node scripts/verify-night-typing.mjs --gif
node scripts/verify-ambient-browser.mjs
node scripts/record-night-workshop.mjs
```

The last two commands require the 4352 preview. The existing isolated Edge/CDP infrastructure was reused as requested. Browser evidence is from Edge; Safari, Firefox, physical mobile hardware, and prolonged background sessions were not tested. Automated passing checks establish behavior and registration, not artistic approval.

## Preservation and scope

The outer repository had a different Git history and unrelated untracked recovery/art/release directories. V1's actual Git common directory is under `.release-candidates\v34-2026-11-05\.git`. Its branch, clean state, and exact supplied commit were verified before the follow-up worktree was created from that commit. Those unrelated changes were left intact.

[Preservation audit](preservation.json): 65 binary files match the committed V1 blobs and current V1 checkout byte-for-byte; 16 copied text artifacts match after checkout-only CRLF/LF normalization. Original art, music, approved canonical sprite, and V1 review copies remain recoverable. FLAC SHA-256 is `48ce7cc1ccccc8b59d36d5df52a8812f919ea851ea6580b8743a52c9dc0449e8`; browser OGG is `49329d4d3c94011a5b98c9ff6d7a4711a7ad7612248e06cb7153d6bb5c30d61d`.

No push, merge, public preview, deployment, or other-project change was made. All new exports live in V1.1.

Implementation consulted the official [Astro components](https://docs.astro.build/en/basics/astro-components/) and [styling](https://docs.astro.build/en/guides/styling/) guides.

## Owner review questions

1. Does the exterior now feel like a peaceful inhabited night, with enough comfortable visibility indoors?
2. In expanded mode, do the alternating fingertip contacts read as quiet typing? Check the silhouette edges and the return to rest. This is restrained raster articulation, not a fully hand-drawn character rig; approval of its artistic quality remains pending.
3. Are the burst frequency, rain visibility, and small steam plume quiet enough to leave running while working?

Mobile framing and navigation were deliberately retained. The source study and individual cels are included so any remaining artistic concern can be reviewed directly rather than inferred from test success.
