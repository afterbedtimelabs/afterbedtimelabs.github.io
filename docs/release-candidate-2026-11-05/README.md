# After Bedtime Labs V3.4 release candidate

Prepared November 5, 2026. Automated validation passes. Final browser and approved-worktree verification remain incomplete because of environment access failures. This is a local candidate, not a completed release certification.

The owner approved the desktop appearance at `http://localhost:4326` on November 5, including the higher-detail Tinker Panda. That design decision is accepted. No push, PR mutation, merge, publication, or deployment was performed or authorized.

## Identity and reconciliation

| Source | Verified identity | Treatment |
| --- | --- | --- |
| Original source checkout | `709f60031cd72f085ff4ad799aba767c65814c69`, `codex/nightstock-showcase-tinker-final` | Approved baseline; no tracked or staged edits |
| Approved D: review worktree | Shared Git metadata records detached HEAD `709f60031cd72f085ff4ad799aba767c65814c69` | Direct folder access denied; actual dirty state and files NOT verified |
| Current remote main | `05431e62db6077c302c265a7a7ede0410c0e72d6` | Confirmed through GitHub connector November 5; candidate parent |
| Local `main` | `b8ca55a` | Stale initial site; preserved, not used as release base |
| V3.4 handoff | `3be47e92ac778ffc6ef3c8cd6e474f89bd573e1b` | Incorporated in approved baseline |
| Draft PR #5 | `a10be4d4ce634e6bf94a23072de1a2932d284751`, `codex/tinker-panda-homepage-v1` | Still open/draft/unmerged; older V2.1 assets superseded; useful controller patterns already adapted in V3.4 |
| Living Workshop V2 | `6862a4b16bef428fe514c575032410dfbb044936` | Preserved separately; broader redesign deferred |

Living Workshop's two unique commits are `41ac164` and `6862a4b`. Its base `7f1a8913becf86814b9b052613a04ffc685c572d` has the same tree as current main. Its redesigned navigation, theme, project pages, NightStock flagship, galleries, milestones, video, older V0.9 content and older 64px V2.1 Panda would change the approved presentation. Its own visual acceptance was incomplete. No missing PR #5 controller fix was identified. No broad merge or cherry-pick was needed.

Candidate location: `C:/AI/afterbedtimelabs.github.io/.release-candidates/v34-2026-11-05`.

Local branch: `release/v34-2026-11-05`. The isolated repository contains one candidate commit directly above verified remote main. Obtain its exact SHA with `git rev-parse HEAD`; the delivery message also supplies it. The original repository's branches and worktrees were not reset or rewritten. No remote is configured on this candidate.

## Changes after the approved source

- `package.json`: add `showcase:verify` and include the existing NightStock integrity verifier in `validate`.
- `src/components/TinkerPanda.astro`: make `figcaption` the final figure child by enclosing the existing controls and live greeting within it. CSS, controller code, copy, imagery and animation timing are unchanged. A fresh visual regression check of this semantic correction is still required.
- This evidence directory: release review, exact changed-file inventories, validation output, asset checks and blocked HTTP-check records.

[Exact changed files](CHANGED-FILES.md) lists every path relative to remote main and to approved source `709f600`. Older validation documents remain historical records; their former owner-approval wording does not override the November 5 desktop approval recorded here.

All 26 PNG artwork/frame/runtime files match the approved Git blobs byte for byte. The six associated JSON records match their Git contents after Git's text line-ending normalization. The canonical 96x96 front remains SHA-256 `b7a25d71ae8b74a0f692462090809843fab594eb58ef38f8c4e6d3bc68f3963e`. The five production PNGs total 16,400 bytes. No V2.1 runtime asset was introduced.

## Verification

| Area | Result and evidence |
| --- | --- |
| Final full suite | PASS: `npm run validate`; [complete output](validation.txt) |
| Astro / TypeScript | 37 files, 0 errors, 0 warnings, 0 hints |
| Production build | 23 Astro pages; 24 HTML documents including legacy redirect |
| Navigation and production structure | PASS: local links, fragments, assets, page metadata, sitemap, RSS, robots, draft exclusion, project priority and preserved routes |
| Mascot | PASS: approved source, 18 native frames, palette/alpha/unchanged-region rules, atlas dimensions/timing and exact built asset copies; [current report](asset-validation.json) |
| Animation and reduced motion | PASS: 15 actual-controller scenarios with deterministic DOM/timers/media/image I/O; includes initial and changed reduced-motion preferences, greeting, pause, cancellation, offscreen/hidden state, failed/stalled/malformed atlases |
| Accessibility | Source/controller checks pass static fallback, image description, accessible controls, polite live greeting and motion control; independent code review confirmed skip link, focusable main and focus styles. No new automated WCAG/axe score or complete native accessibility audit claimed |
| NightStock integrity | PASS: six pinned originals, 18 WebP hashes/dimensions, exact production copies, one eager/five lazy images |
| Fresh approved-preview desktop observation | November 5: actual `localhost:4326`, 1440x1000 dark view inspected. V3.4 asset URL, expected content, accessible control labels and no horizontal overflow observed. Approved figure/stage/control measurements in [review coverage](review-coverage.json) |
| Existing responsive evidence | October 25/26 Chromium records retained in `../tinker-panda-v3.4/` and `../nightstock-tinker-review/`. Desktop/mobile light/dark screenshots inspected again November 5; original records cover widths 320, 390, 768, 820 and 1440, navigation, greeting and pause. These are historical baseline checks, NOT fresh candidate browser runs |
| Fresh candidate browser matrix | BLOCKED: in-app browser lost its route when opening candidate; native Chrome app approval timed out; Codex browser opening also failed. No successful fresh candidate screenshot, interaction or responsive matrix claimed |
| Native reduced-motion preference | NOT TESTED in a real browser; deterministic controller checks pass |
| HTTP checks | BLOCKED: all 14 requests failed from the restricted shell; direct probe returned `connect EACCES 127.0.0.1:4327`. [Integrity/HTTP record](integrity.json). This does not establish that the existing owner preview is down |
| Diff hygiene | `git diff --check` passed |
| Source preservation | All 8 original local branch refs and 7 remote refs unchanged; original tracked/staged files clean; all 106 historical-art manifest entries exact. Living Workshop retains its 82 pre-existing staged deletions in the base repository and clean linked worktree |

Validation used installed Node 24.18.0 / npm 11.16.0 and the existing locked dependencies resolved from the parent checkout. No new dependency installation or clean `npm ci` run is claimed. Package dependencies and lockfile are unchanged. The asset verifier's regenerated checkout-specific report is copied here; the old committed historical report is preserved unchanged.

## Local reproduction

Run from the candidate directory in a normal local terminal:

```powershell
npm ci
npm run validate
npm exec astro preview -- --background --host 127.0.0.1 --port 4327
```

Open `http://127.0.0.1:4327/`. Check home, projects, writing, about, NightStock detail/gallery, existing Navi/privacy routes and the legacy companion redirect. Preview management: `npm exec astro preview status`, `npm exec astro preview logs`, `npm exec astro preview stop`.

Development uses `npm exec astro dev -- --background --host 127.0.0.1 --port 4327`, managed with `astro dev status/logs/stop`. Background launch commands initially reported success here, but later status checks found no server. No candidate server is represented as currently running. The existing owner server on 4326 was not stopped or modified.

`npm run validate` regenerates `docs/tinker-panda-v3.4/asset-validation.json` with checkout-specific preservation counts. That is an existing verifier behavior; do not confuse this report-only change with artwork changes.

## Remaining gates and owner decisions

1. Verify the actual `D:/workspace/Labs-V34-Final-Review` tracked/untracked status and source files when that folder is accessible. If it has edits beyond `709f600`, compare and reconcile them before release.
2. Complete fresh candidate browser checks at 320, 390, 768, 820 and 1440 widths in light/dark, including navigation, keyboard/focus, greeting/pause, no-JavaScript fallback and a real reduced-motion preference. Compare the caption/control positions with the approved baseline after the semantic fix.
3. After these technical gates, obtain separate authorization for any push/PR action, merge, publication or deployment. Recommended eventual PR path is a new V3.4 candidate PR, retaining #5 as historical provenance.

No additional mascot redesign or repeat desktop design approval is needed. The remaining browser/worktree gates are verification work, not new design decisions. Living Workshop's broader redesign can be considered separately in future development.
