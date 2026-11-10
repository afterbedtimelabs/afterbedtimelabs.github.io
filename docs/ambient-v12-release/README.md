# Ambient V1.2 publication integration

Prepared November 9, 2026 UTC (November 8 locally). **Local candidate ready for review; NO-GO for public deployment yet.** No push, remote PR, merge, deployment, DNS change or production configuration change was performed.

Branch: `release/ambient-v12-integration`.

Worktree: `C:\AI\afterbedtimelabs.github.io\.release-candidates\ambient-v12-integration`.

The full candidate checkpoint is the commit containing this report, obtainable with `git rev-parse HEAD`. The delivery message records its exact SHA. All production application files are identical to accepted V1.2 `ba475f7377c7d75a315a88714c6b1658c6cec621`; only release verification tooling, a production-preview launcher and this evidence were added after the closeout.

## Evidence and results

- [Integration and repository audit](integration.md)
- [Production validation and browser coverage](validation.md), [complete pipeline log](validation.txt), [artifact audit](artifact-audit.json)
- [GitHub and hosting findings](hosting.md), [read-only remote snapshot](github-readiness.json)
- [Public content, provenance and dependencies](public-content-audit.md)
- [Proposed draft PR](proposed-pr.md), [rollback and recovery](rollback.md)
- [Edge browser results](edge/browser-checks.json), [Chrome browser results](chrome/browser-checks.json)

`npm.cmd ci` installed 285 packages in this worktree. `npm.cmd run validate` passed: 0 errors, warnings or hints; 24 HTML documents verified; 15/15 legacy controller scenarios; pinned artwork and showcase checks. Edge 157 and Chrome 156 each passed 67 real-browser assertions with sandboxing enabled. All 22 indexed live URLs are retained, all 95 generated files passed HTTP/content checks, and all 64 public assets are exact copies.

## Release decision

**NO-GO for deployment at this handoff.** The local application/build/browser checks passed. These release gates remain:

1. Authorize pushing this exact candidate and creating a new draft PR against main. Neither is currently authorized. Keep older draft PRs #3 and #5 untouched.
2. Obtain a successful `Validate website` run for the integrated PR commit on GitHub's Linux runner. Existing green runs are for other commits. Reconcile again if main advances.
3. Verify Pages source is GitHub Actions, the custom domain and HTTPS setting, and the `github-pages` environment's deployment-branch/reviewer rules. The connector did not expose these settings. Main currently has no branch protection or rulesets; confirm the intended review policy before integration.
4. Resolve or explicitly accept the inherited dependency advisories: `fast-uri` moderate, `undici` high, `zod` high. A targeted dependency maintenance change would require its own validated checkpoint; none was silently applied here.
5. Confirm browser support expectations. This candidate is verified in current Windows Edge and Chrome, with emulated mobile viewports. Safari, Firefox, physical mobile and older browsers remain unverified. If those are release targets, complete their checks before authorizing publication. Accepted owner listening review is retained; this integration run used instrumented, muted browsers.
6. Approve the exact integration/merge commit and separately authorize a manual deployment from main with `site_url=https://afterbedtimelabs.dev`. Run the live smoke checks in [rollback.md](rollback.md) immediately afterward.

## Local review

The launcher serves the existing **production build**, not the development server. It does not rebuild or publish. Port 4355 is separate from the accepted preview ports. The test-owned server was stopped after verification; original previews were not stopped.

```powershell
Set-Location 'C:\AI\afterbedtimelabs.github.io\.release-candidates\ambient-v12-integration'
git status --short
git rev-parse HEAD
.\Launch-Ambient-V12-Release.cmd
```

Wait for Astro's ready message, then open **http://127.0.0.1:4355/**. Press Play music, use the actual Mission Control workbench link, and continue through Projects, Writing and About. Browser Back/Forward should preserve music. Check the compact volume/pause controls and return Home. This is a production integration spot check of the already accepted design.

Inspect from a second PowerShell window:

```powershell
(Invoke-WebRequest 'http://127.0.0.1:4355/' -UseBasicParsing).StatusCode
Get-NetTCPConnection -LocalAddress 127.0.0.1 -LocalPort 4355 -State Listen |
  Select-Object LocalAddress, LocalPort, OwningProcess
```

Stop with **Ctrl+C in the launcher's terminal**, answering `Y` if Windows asks to terminate the batch job. If the port is occupied, inspect the owning process before starting another server; do not stop an unrelated process.

To reproduce the build after changes or on a clean checkout:

```powershell
Set-Location 'C:\AI\afterbedtimelabs.github.io\.release-candidates\ambient-v12-integration'
npm.cmd ci
$env:SITE_URL = 'https://afterbedtimelabs.dev'
$env:RELEASE_EVIDENCE_DIR = 'docs/ambient-v12-release'
npm.cmd run validate
Remove-Item Env:SITE_URL, Env:RELEASE_EVIDENCE_DIR
npm.cmd run preview -- --host 127.0.0.1 --port 4355
```

This intentionally refreshes the release validation evidence. Keep the accepted worktrees and historical evidence unchanged. Browser replay commands are in [validation.md](validation.md).
