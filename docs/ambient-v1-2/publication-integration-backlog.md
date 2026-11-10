# Ambient Homepage V1.2 publication/integration backlog

Status: **Prepared only; not executed.** Separate from the closed V1.2 development sprint.

Accepted application source: `ba475f7377c7d75a315a88714c6b1658c6cec621`. Preserve its approved artwork, original music, behavior and review evidence. No additional feature work is proposed here.

## Release preparation

| Item | Required result |
| --- | --- |
| Reconcile publication source | Inspect the current publication branch, existing PRs and any later work. Identify the correct Git history and intended integration target. Preserve all existing worktrees and local changes. Do not assume the outer checkout and ambient candidates share the same Git common directory. |
| Prepare isolated integration candidate | Apply the accepted V1/V1.1/V1.2 lineage to a separate candidate as needed, resolve conflicts without silently replacing approved assets, and document the exact source and candidate commits. Keep the accepted V1.2 worktree unchanged. |
| Verify reproducible build | Install from the existing lockfile in the candidate environment and run validation. Review the generated publication artifact so source artwork, private/local review material and temporary files are not accidentally added to the deployed artifact. |
| Verify integration behavior | Test the actual built candidate's routes, direct article/project entry, Back/Forward, titles, navigation, theme, focus, scroll, reduced motion, persistent music, fresh-load silence and controls. Recheck asset hashes and paths. This is validation of the future integrated candidate, not a repeat of the closed development sprint. |
| Resolve browser coverage | Confirm supported browser targets. Test uninterrupted playback in the chosen additional browsers, including physical mobile where supported; document any compatibility limits. Do not treat Edge automation or the unspecified owner-review setup as broader coverage. |
| Review CI and hosting | Inspect actual checks, publishing workflow, target domain/base path, cache behavior and routing configuration. Record unavailable or failing checks honestly. No remote check status is asserted by this backlog. |
| Prepare release decision | Present the exact candidate diff, validation, known limits, approved appearance comparison, release instructions and rollback checkpoint for owner review. |

## Authorization and publication gates

1. Obtain separate authorization before any push, merge, publication or deployment. Local V1.2 acceptance grants none of these actions.
2. Confirm approval applies to the exact integration candidate and intended destination before releasing it.
3. After an authorized release, smoke-test the live domain, music/asset loading and navigation, then record the deployed commit and rollback reference.

Until separately authorized, preserve the accepted baseline and existing evidence. No remote PR, issue, branch update or publication action was created as part of this closeout.
