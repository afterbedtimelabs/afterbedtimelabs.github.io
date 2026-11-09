# GitHub and hosting readiness

Read-only checks on November 9, 2026 UTC. [Sanitized API evidence](github-readiness.json), [live HTTP evidence](live-origin.json).

## Current remote state

- Main: `05431e62db6077c302c265a7a7ede0410c0e72d6`, verified through fetch and GitHub's branch API.
- Older PRs [#3](https://github.com/afterbedtimelabs/afterbedtimelabs.github.io/pull/3) and [#5](https://github.com/afterbedtimelabs/afterbedtimelabs.github.io/pull/5) remain open drafts. They are not the accepted release candidate.
- Last observed successful main validation: [run 39346306236](https://github.com/afterbedtimelabs/afterbedtimelabs.github.io/actions/runs/39346306236), main `05431e6`.
- Last observed successful Pages deployment: [run 39346324137](https://github.com/afterbedtimelabs/afterbedtimelabs.github.io/actions/runs/39346324137), `workflow_dispatch` on main `05431e6`, October 20, 2026.
- Newer green validation of PR #5 concerns its older `a10be4d` source. **No remote CI has run for this integration candidate.**

## Workflow gates, unchanged

`validate.yml` runs on pull requests and pushes to main. It uses pinned action SHAs, Node 24, `npm ci`, the complete `npm run validate` pipeline, and uploads the reviewed static build with seven-day retention. Repository token permission is `contents: read`; checkout disables persisted credentials. The job has a ten-minute timeout.

`deploy.yml` has only a `workflow_dispatch` trigger. **Both jobs require an explicitly initiated workflow on `refs/heads/main`.** It cannot deploy a draft branch or tag merely by selecting it. The build job checks Astro, builds and verifies `dist`, then uploads only `dist`. The deploy job uses environment `github-pages` with `pages: write` and `id-token: write`; build permissions are `contents: read` and `pages: read`. All third-party actions are SHA-pinned. Deployment concurrency is `github-pages`, with cancellation disabled. These gates were not changed or weakened.

The deploy job does not rerun the supplemental mascot/showcase/browser suites; the complete validation pipeline runs in the separate validation workflow. Branch/environment protection therefore matters when enforcing that a green validated commit is the one dispatched. The workflows contain no automatic deploy-on-push path.

## Domain and generated paths

Read-only HTTPS requests to the public homepage, RSS, robots and both sitemap documents returned 200 from GitHub Pages. Homepage canonical is `https://afterbedtimelabs.dev/`; sitemap locations use the same origin. Responses advertise `Cache-Control: max-age=600`. The current public site contains 22 indexed URLs, all retained in the candidate.

The production config's default and this build's explicit `SITE_URL` are `https://afterbedtimelabs.dev`, with no repository subpath. Root-relative asset URLs, trailing-slash routes, RSS, robots, sitemap and canonical links all passed generated-output checks. The old Navi article URL remains a redirect to Riku. The build does not add a `CNAME` file; custom-domain assignment must remain correct in Pages settings for this Actions-based deployment.

## Settings and permissions still requiring confirmation

The GitHub connector can read the repository, branches, PRs, rulesets and workflow-run records, but its fetch endpoint does not expose `/pages` or `/environments/github-pages`. No claim is made about current Pages source settings, HTTPS enforcement, domain verification, environment reviewers or branch policy based on that unavailable data. The working HTTPS site and successful historical run provide operational evidence, not a read of those settings.

Main reports `protected: false`, and the repository ruleset list is empty. Thus the inspected repository does not enforce required PR checks through those mechanisms. Do not confuse the workflow's main-only deployment guard with required human review of main. Confirm the owner's intended review policy; any settings change requires separate authorization.

The connected repository capability includes write/admin access, but the task authorizes none of those remote mutations. An authorized release operator must be able to push/create the reviewed PR, merge after review, initiate Actions on main and satisfy any `github-pages` environment approval. The workflow's job token permissions must remain enabled by repository/organization policy. Verify those settings before the first authorized dispatch.

## Bounded release sequence, not executed

1. Owner authorizes this exact local checkpoint to be pushed to its release branch and a new draft PR against current main. Include [proposed-pr.md](proposed-pr.md). Do not merge #3/#5.
2. Obtain a successful Linux validation run on that PR commit, inspect its artifact, resolve/accept the dependency advisories, and complete the hosting and supported-browser decisions.
3. Owner approves the exact reviewed candidate for integration. Prefer a normal PR merge commit for a clear single rollback boundary. If main changed, revalidate the new integration result before proceeding.
4. Record the pre-release main and last successful deployment. Obtain separate publication authorization for the resulting main SHA and `https://afterbedtimelabs.dev`.
5. Manually initiate **Deploy to GitHub Pages**, selecting main and the exact custom origin. Confirm the checkout SHA in the run. A push or merge alone does not initiate this workflow.
6. Follow the live smoke/recovery procedure and record the deployed SHA/run URL. No source or configuration change is required just to enable automatic publishing, and none is proposed.
