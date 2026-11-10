# Ambient V1.2 final release hardening

Date: 2026-11-09. Local-only branch: `release/ambient-v12-hardening`.

Base: `43d308f4409af854f2f6a58d701c0820011e7780`, the accepted integration candidate on draft PR #6. The exact hardening commit is supplied in the handoff and can be read with `git rev-parse HEAD` in this worktree. No push, PR update, merge, deployment, or production configuration change was performed.

## Disposition

**Local dependency and notice maintenance is complete. NO-GO for immediate merge or deployment.** The owner can review this bounded candidate and separately authorize publishing it for CI. Remote CI has not run on this new checkpoint. Broader music compatibility remains unverified in Firefox and physical Safari; the Windows Playwright WebKit port cannot play the existing Ogg asset. Resolve or explicitly accept that coverage boundary before claiming broader browser readiness.

No homepage development was performed. All 95 files in the accepted production manifest are byte-for-byte identical after the dependency updates. The only added production file is `THIRD-PARTY-NOTICES.txt`. Artwork, original music, scene animation, navigation, public page content, custom-domain paths, workflows, and historical evidence remain unchanged. Earlier accepted worktrees and commits remain available.

## Dependency changes

| Package | Before | After | Existing parent constraint |
| --- | --- | --- | --- |
| fast-uri | 3.1.8 | 3.1.9 | ajv: `^3.0.1` |
| undici | 8.11.2 | 8.12.2 | unifont: `^8.0.0` |
| zod | 4.6.5 | 4.6.6 | Astro: `^4.5.4`; RSS and sitemap: `^4.3.6` |

Only nine lockfile values changed: version, tarball URL, and integrity for each package. No package was added or removed, no direct dependency constraint changed, and no override or forced upgrade was used. Registry metadata supplied the exact published tarball integrities. `npm ci` and `npm ls fast-uri undici zod --all --json` succeeded. Installed versions match the lockfile.

The fresh baseline audit reported three affected packages: one moderate and two high, with 13 advisory entries in total. The installed-tree audit after remediation returned **zero vulnerabilities at every severity**, exit 0. See `audit-before.json`, `audit-after.json`, and `dependency-tree.json` for the complete advisory URLs, ranges, and dependency paths. This is a point-in-time registry assessment, not a guarantee against future advisories.

Representative reviewed advisories:

- [fast-uri URI scheme spoofing](https://github.com/advisories/GHSA-w74x-v6f9-j3xg), fixed in 3.1.9.
- [undici excessive content-encoding denial of service](https://github.com/advisories/GHSA-xjj6-f33q-929c), fixed in 8.12.2, alongside the other seven listed undici findings.
- [Zod oversized constrained-collection memory exhaustion](https://github.com/advisories/GHSA-mrhx-c7xc-m3w5), fixed in 4.6.6.

These dependencies occur in build/check tooling for this static site. The exact unchanged browser artifacts substantiate that their updates did not alter visitor code. Node 24.18.0 and npm 11.16.0 were used. Undici requires Node >=22.19.0 both before and after this patch. The repository's broader `engines.node >=22.12.0` declaration is inherited; use Node 24 as the unchanged CI workflows do.

## Icon provenance

`src/components/Icon.astro` entered the repository in `b8ca55ab634260bcab17d2b9e6a498ce0c488b2f` (initial site) and has no subsequent path changes. That initial snapshot supplies no upstream attribution or authoring history for the ten icon paths.

Comparison with [Feather v4.29.2](https://github.com/feathericons/feather/tree/v4.29.2) identifies the exact RSS arc commands and the same sun-ray coordinate geometry. The RSS dot and sun circle differ, consistent with adaptation. Other arrows and interface shapes are common geometry or rewritten paths; this evidence does not establish the precise origin of every path. No additional identifiable license obligation was found in the inspected repository history. The comparison is not a complete chain-of-title certification.

The scoped `public/THIRD-PARTY-NOTICES.txt` includes Feather's full MIT copyright and permission notice for the derived portions. It is copied unchanged into the deployment artifact. `feather-reference.json` preserves the retrieved upstream license and eight reference icons for review. The SVG component itself is untouched. No overall repository, artwork, branding, or music license was introduced.

## Validation and actual browser coverage

`npm.cmd run validate` passed: Astro/TypeScript checks, production build, metadata and local-link verification for 24 HTML pages, sitemap/RSS/robots checks, exact canonical artwork checks, 15 deterministic controller scenarios, and all pinned showcase image checks. See `validate.log` and `canonical-asset-validation.json`.

The historical preservation checker now pins the **entire exact hardened lockfile hash**, rather than broadly excluding the lockfile. All previous artwork assertions remain intact. The supplemental `verify-release-hardening.mjs` proves that only the nine specified lock values changed, verifies the installed patch versions, checks preserved source and evidence against `43d308f`, compares the 95 original production files by SHA-256, and fetches all 96 current production files with matching contents. See `hardening-verification.json` and `artifact-verification.log`.

| Actual browser/tool | Result | Scope and limits |
| --- | --- | --- |
| Edge 157.0.4341.42, Windows, isolated headless CDP | 67/67 pass | Production build; desktop/mobile; full existing continuity and scene regression suite; no console errors |
| Chrome 156.0.8078.80, Windows, isolated headless CDP | 67/67 pass | Same suite; no console errors |
| Playwright 1.65.0 Firefox 159.0, revision 1572 | Not executed | Download succeeded; browser launch and direct `--version` probe both failed with `spawn UNKNOWN`; no sandbox/security bypass attempted |
| Playwright 1.65.0 WebKit 27.2, revision 2388, Windows | 33 pass, 2 fail | Rendering, navigation, single retained media element, volume/mute state, silent loads, bulb/motion, and responsive checks pass; music initiation and continuity fail because the port cannot decode Ogg/Vorbis |
| Physical Safari/macOS/iOS and physical mobile devices | Not tested | Playwright WebKit is not equivalent to device Safari |

Edge and Chrome verify the actual workbench Mission Control link, Projects/detail pages, Writing/articles, About, Back/Forward, repeated navigation, one persistent playing audio element, natural time progression, no reload/seek/pause/buffering events during navigation, no accumulated document/window listeners, preserved volume/mute/pause, synchronized controls, and silent hard reloads/fresh tabs. They also verify stable resting-arm pixels across 18 seconds, blinking/rain/steam, bulb alignment at 1440/768/390/320 widths and expanded views, reduced motion, theme switching, focus, scroll, and normal link semantics. Existing earlier evidence is preserved; new captures are under `edge/` and `chrome/`.

WebKit's `canPlayType('audio/ogg; codecs="vorbis"')` returns an empty string and the media element reports error 4, unsupported source. No codec, music file, fallback audio, or app behavior was changed to make the test pass. Single-element identity and controls surviving navigation do **not** establish playback continuity when decoding never begins. This port also lacks `Element.prototype.moveBefore`, so uninterrupted movement remains an additional compatibility question for a codec-capable WebKit/Safari environment.

The WebKit initial reports are retained transparently: the supplemental test initially assumed a straight apostrophe in rendered mascot copy, combined fresh-load silence with absence of any media request, and sampled animation removal immediately on media-query notification. Final assertions accept the actual typographic apostrophe, directly verify silence, and sample steady reduced-motion styles across settled frames. No application changes were made. Full-page captures now scroll lazy media into view before capture.

All music continuity results here are **instrumented**, not listening checks. Edge/Chrome processes are muted. No new audio capture or audible-gap assessment is claimed. The owner's earlier audible acceptance remains recorded for V1.2, and the music/application output is unchanged.

## Changed files

- `package-lock.json`: three patch releases, nine values only.
- `public/THIRD-PARTY-NOTICES.txt`: scoped Feather MIT notice.
- `scripts/verify-tinker-panda-v3-4.mjs`: replace the historical lock expectation with an exact new lock hash and report its separate maintenance count; preserve every artwork check.
- `scripts/verify-release-hardening.mjs`: bounded lock/source/artifact regression audit.
- `scripts/verify-hardening-browsers.mjs`: isolated optional Firefox/WebKit smoke runner; no application dependency added.
- `docs/ambient-v12-hardening/`: this report, audit/install/validation records, source references, browser results, and actual screenshots. `changed-files.json` lists the complete checkpoint file set, including individual evidence files.

## Reproduce locally

In PowerShell, using Node 24:

```powershell
Set-Location 'C:\AI\afterbedtimelabs.github.io\.release-candidates\ambient-v12-hardening'
git status --short
git rev-parse HEAD
npm.cmd ci
npm.cmd audit
$env:RELEASE_EVIDENCE_DIR = 'docs/ambient-v12-hardening'
$env:SITE_URL = 'https://afterbedtimelabs.dev'
npm.cmd run validate
npm.cmd run preview -- --host 127.0.0.1 --port 4357
```

Open http://127.0.0.1:4357. This is a production preview, not the development server. Stop the foreground preview with Ctrl+C. In a second PowerShell terminal, the artifact verifier is `node scripts/verify-release-hardening.mjs http://127.0.0.1:4357`.

The optional supplemental browsers use an isolated tool installation, excluded from the site lockfile:

```powershell
npm.cmd install --prefix .astro/browser-tools --save-exact playwright@1.65.0 --no-audit --no-fund
node .astro/browser-tools/node_modules/playwright/cli.js install firefox webkit
node scripts/verify-hardening-browsers.mjs http://127.0.0.1:4357
```

Expect the documented coverage failures on this host. Reports are overwritten by reruns; preserve the committed evidence before creating additional runs. Existing Edge/Chrome commands remain available in `scripts/verify-continuity-browser.mjs`.

## Remaining release decisions

1. Owner review of this local hardening checkpoint and the explicit browser limitations. If Firefox/Safari music support is required for release, verify on a capable supported host and investigate any actual failure under separately scoped authorization. Do not infer Safari success or failure solely from Windows Playwright WebKit.
2. Separate authorization to push this new SHA and update PR #6. The earlier permission covered only `43d308f`; it has not been reused.
3. Execute and review remote validation on the newly published candidate. The successful [earlier CI run](https://github.com/afterbedtimelabs/afterbedtimelabs.github.io/actions/runs/42565603473) covers the previous release candidate, not this hardening commit.
4. Owner's final merge decision after those checks, followed by separate deliberate production deployment authorization. The unchanged deployment workflow accepts only manual `workflow_dispatch` on `main`; no workflow was dispatched here.

Prior main-protection/environment-review limitations and rollback procedures remain in the integration/preflight reports. No policy was weakened or production setting changed. To compare or recover locally, use the untouched `ambient-v12-integration` worktree at `43d308f`; no history rewriting or baseline removal is necessary.
