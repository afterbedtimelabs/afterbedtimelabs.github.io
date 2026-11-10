# Ambient Homepage V1.2 owner acceptance

Status: **Accepted local development baseline; development sprint closed.**

Owner: Isaac. Acceptance recorded November 8, 2026 (America/New_York).

Accepted application commit: `ba475f7377c7d75a315a88714c6b1658c6cec621` (`ba475f7`).

Branch: `feature/ambient-continuity-v1-2`.

Worktree: `C:\AI\afterbedtimelabs.github.io\.ambient-worktrees\continuity-v1-2`.

## Owner decision

The owner explicitly approved After Bedtime Labs Ambient Homepage V1.2 at `ba475f7` as the accepted local development baseline and confirmed approval of:

- The circuit-board bulb animation.
- Continuous music playback across portfolio navigation.

This closes the outstanding visual and music-continuity owner review. No browser, device, or listening setup was specified, and none is inferred.

## Accepted implementation and evidence

The accepted application restores the V1.1 resting arms, removes active typing/frame loading, retains the accepted rain, steam, nighttime scene and mascot identity, adds the restrained circuit light, and keeps one music player across supported internal navigation. It also fixes the Home toolbar shift during history scroll restoration.

Existing verification at the accepted checkpoint is retained without rerunning completed development:

- [Validation](validation.txt): `npm.cmd run validate` passed, with 0 Astro errors, warnings, or hints; 24 HTML pages verified; 15/15 legacy controller scenarios passed; canonical mascot and pinned showcase checks passed.
- [Browser checks](browser-checks.json): 59 passed, 0 failed. Includes persistent player identity, media-clock progression, repeated navigation, controls, history/scroll, motion and responsive checks.
- [Browser recording](ambient-v1-2-browser-46s.mp4) and [metadata](browser-recording.json): actual compositor output and audio captured from the same player across navigation.
- [Audio analysis](audio-capture-analysis.txt): no detected silence of at least 25ms below -55dB. This remains instrumented signal evidence, separate from the owner's subsequent acceptance.
- [Preservation audit](preservation.json): 243 historical art, audio, ambient and review files preserved against V1.1, allowing checkout line-ending differences only.

## Preserved baselines

| Baseline | Application checkpoint | Worktree under `.ambient-worktrees` |
| --- | --- | --- |
| V1 | `86ad877aacf63b59a340dd02dd23d32c59cecc62` | `v1` |
| V1.1 reviewed source | `4cf8a9487f15652b440549fd999d1445bd82539e` | `night-workshop-v1-1` |
| V1.2 accepted | `ba475f7377c7d75a315a88714c6b1658c6cec621` | `continuity-v1-2` |

All three worktrees were clean when closeout began. V1 and V1.1 remain at their existing checkpoints. V1.2 receives a documentation-only closeout commit; its accepted application remains exactly `ba475f7`.

Approved artwork, original music, review copies, screenshots, recordings, and verification reports are retained. The pre-closeout README remains available in Git at `ba475f7`. No source, runtime asset, dependency, launcher, browser evidence, or validation report is changed by closeout. Unrelated local work is preserved.

## Outstanding technical limitations

- Automated browser coverage is Edge. Safari, Firefox, physical mobile devices and older browsers without modern state-preserving DOM movement are unverified. Owner approval does not establish those platforms' compatibility.
- Hard refreshes and new tabs intentionally start silent. External/full-document departures do not preserve playback; these are scope boundaries, not outstanding defects.
- The final focused suite used a built-site preview to exclude development hot reloads. Production-domain hosting, caching, remote CI and deployed behavior were not verified by this local sprint.
- The nested checkout resolves existing outer dependencies. A clean install/build in the integration environment remains a release requirement.
- Current publication-branch reconciliation has not been performed for V1.2. Local acceptance is not proof of integration readiness.

## Closeout scope and authorization

This closeout records acceptance and prepares the separate [publication/integration backlog](publication-integration-backlog.md). No new feature, implementation change, rebuild or browser rerun is part of closeout. Verification is limited to repository state, existing evidence and the documentation diff.

No push, merge, publish or deployment is authorized. Those actions require separate owner authorization. The existing local preview workflow remains documented in [README.md](README.md).
