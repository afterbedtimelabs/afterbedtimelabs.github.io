# Rollback and recovery procedure

Prepared only. No rollback, merge or deployment is authorized by this document.

## Before an authorized release

Record the exact pre-release main SHA, integration merge SHA, validation run, deployment run and Pages artifact. At preparation time the public checkpoint is `05431e62db6077c302c265a7a7ede0410c0e72d6`; verify it again immediately before release rather than assuming it stayed unchanged. Keep the accepted V1/V1.1/V1.2 worktrees, branches, artwork/music and review evidence intact.

Prefer a normal PR merge commit so the integration has one explicit revert boundary. If a different merge strategy is chosen, record how its resulting commit(s) should be reverted. Do not force-push, reset public history, delete worktrees or alter DNS to roll this website back.

## If CI or deployment fails before publication

Do not bypass verification or dispatch from a non-main branch. Inspect the failed step and artifact, prepare the smallest repair in an isolated candidate, rerun affected checks and obtain approval for its new SHA. Verify the live domain's state rather than assuming a failed workflow changed or preserved it. Keep the last known good deployment reference available.

## If a published release needs rollback

1. Obtain explicit rollback authorization. Create a new rollback branch/worktree from the then-current main; keep accepted development environments unchanged.
2. Revert the release integration. For a normal two-parent PR merge, use `git revert -m 1 <integration-merge-sha>` in that isolated worktree. For a squash merge, use `git revert <squash-sha>`. If it was fast-forwarded as several commits or subsequent changes overlap, prepare and review the exact reverse changes instead of blindly reverting a range. Preserve unrelated later work.
3. Run a clean install and the appropriate complete validation for the restored source, inspect the production artifact, verify public URLs and domain, and review the revert diff. A rollback to pre-ambient main intentionally removes the ambient experience from the served site while its source history and approved assets remain preserved in Git/worktrees.
4. After approval, push/open the rollback PR, obtain successful CI, merge its exact reviewed commit and separately initiate **Deploy to GitHub Pages** on main with the custom-domain origin. The workflow rejects direct deployment from an old tag/branch, so recovery proceeds via a forward commit on main.
5. Verify the deployed SHA/run and perform the live checks below. Record the cause, recovery checkpoint and outcome before attempting another release.

## Post-deployment smoke checks

Verify HTTPS on `https://afterbedtimelabs.dev`, homepage, Projects/Mission Control, Writing/article, About, Riku/Navi and privacy URLs, the legacy Navi article redirect, RSS, sitemap and robots. Inspect canonical origin, asset responses and console errors. Compare appearance to the reviewed production build at desktop and mobile widths.

For an ambient release, deliberately start music, follow the real workbench link, navigate and use Back/Forward, listen for continuity, change volume, pause/navigate/resume and return Home. Check one player, no reload events, correct controls, and silent hard refresh/new tab. Verify reduced motion and paused warm bulb. For a pre-ambient rollback, compare with that baseline's expected behavior instead.

Allow for observed ten-minute HTTP caching when checking stale responses: use a fresh profile/disabled browser cache for diagnosis and inspect response headers. Do not change domain/DNS/cache configuration as a workaround. If results differ by cache or location, retain evidence and investigate before declaring recovery complete.
