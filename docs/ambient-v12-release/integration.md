# Integration and repository audit

## Source reconciliation

Fetched main and both older PR heads directly from `https://github.com/afterbedtimelabs/afterbedtimelabs.github.io.git` into local `release-audit/*` refs. No remote was added to the accepted repository and no remote ref was written.

| Source | Full SHA | Finding |
| --- | --- | --- |
| Current remote main | `05431e62db6077c302c265a7a7ede0410c0e72d6` | Matches last known public main; ancestor of all accepted ambient work |
| V3.4 publication candidate | `8d792a4af95c17e7d697b223228bc4d9300bd4f2` | Contains approved canonical Tinker and newer NightStock showcase; already in V1.2 ancestry |
| Ambient V1 | `86ad877aacf63b59a340dd02dd23d32c59cecc62` | Preserved |
| Ambient V1.1 | `4cf8a9487f15652b440549fd999d1445bd82539e` | Preserved |
| Accepted V1.2 application | `ba475f7377c7d75a315a88714c6b1658c6cec621` | Owner-approved bulb and continuous music |
| V1.2 documentation closeout | `d972b1dbd0d48e05b03fd5537a6a4b152603018c` | Owner acceptance and publication backlog, no application changes |
| Draft PR #3 | `824ecaa4b42c0a6797059a5dbd716e9b8548e0fa` | Older V2.1 mascot assets; open and draft, superseded design |
| Draft PR #5 | `a10be4d4ce634e6bf94a23072de1a2932d284751` | Older V2.1 homepage integration; open and draft, superseded design |

Created the new release worktree from fetched main, then fast-forwarded **locally** to `d972b1d`. There were no divergent main commits, merge conflicts or discarded main changes. This local Git operation did not merge a remote PR or modify public main. Neither older PR was imported. Both remain untouched.

## What comes from each source

Main supplies the portfolio structure, all routes and article archives, Mission Control and other showcases, Riku/Navi and privacy pages, site identity/contact settings, SEO/RSS/sitemap/redirect/custom origin, and pinned manual deployment workflows. No main source or public asset path was deleted.

The accepted lineage supplies approved V3.4 Tinker assets, the newer NightStock first-shift text and six captures, then the ambient scene, original Window seat music, V1.1 rain/steam/night lighting, and V1.2 stable resting arms, circuit light, ClientRouter/shared player, synchronized controls and lifecycle fixes. Tinker remains a fictional mascot, distinct from Isaac. Historical typing files are retained, but are not loaded by the homepage.

This release adds no application feature or design change. New changes are bounded to browser/release audit scripts, an optional output directory for the canonical-art verifier so historical reports are not overwritten, the production-preview launcher, and release documentation/evidence. Dependency declarations and lockfile are unchanged from main. Both workflow files remain byte-identical to main. The application tree and public assets are unchanged from `ba475f7`.

## Worktree preservation

There are two Git common directories. The outer working repository is separate from the nested V3.4 repository that owns the ambient and new release worktrees. The release was created in the latter, where the complete accepted history exists.

| Existing location | Observed state | Treatment |
| --- | --- | --- |
| Outer repository | `709f600`, existing untracked worktree/recovery/art/release directories | Preserved; no staging or commits there |
| `.ambient-worktrees/v1` | `86ad877`, clean | Unchanged |
| `.ambient-worktrees/night-workshop-v1-1` | `4cf8a94`, clean | Unchanged |
| `.ambient-worktrees/continuity-v1-2` | `d972b1d`, clean | Unchanged |
| `.release-candidates/v34-2026-11-05` | `8d792a4`, existing modified `docs/tinker-panda-v3.4/asset-validation.json` | Preserved; not reset or included |
| External older V2.1/integration/website worktrees under the user profile and `D:/workspace/Labs-V34-Final-Review` | Listed by outer Git; direct status reads denied by the environment | Not modified; cleanliness cannot be established here |

The historical artwork, original audio, review copies and browser recordings remain in place. The release audit compares 304 accepted application/asset/config/workflow/evidence paths with the closeout and finds no changes. The earlier 243-file V1.1 preservation audit is retained unchanged. No worktree was removed, no branch reset, no history rewritten and no accepted preview stopped.
