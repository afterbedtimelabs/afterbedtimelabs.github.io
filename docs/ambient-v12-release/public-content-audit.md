# Public content, provenance and dependency audit

## Deployable artifact

The verified `dist` contains 95 files (18,085,306 bytes). Only `dist` is uploaded by the Pages workflow. It contains built pages/client bundles and the existing public assets, not repository source art, development reports, review screenshots/videos, local environment files, node_modules or source maps. All local asset/link targets resolved and all files served with exact expected bytes.

The retained public archive includes the lossless music edition, original synthesized rain and historical typing sprite. These were already in the accepted public directory. They remain directly addressable but are not loaded by the homepage; the UI remains music-only. No asset was regenerated or deleted to reduce packaging size.

The source branch, when eventually pushed to this public repository, will also expose its tracked development documentation and review artifacts. Those historical files contain local Windows paths and project development context. They are preserved by instruction; they are not served in `dist`. Untracked outer artwork/recovery/private environments are not staged. No source history is rewritten to conceal existing material.

## Content and secrets

Compared all main source/public paths with the accepted lineage: no deletions. The changed public-facing content is the already approved NightStock showcase, ambient homepage and clear fictional-mascot identity. Mission Control's existing sample-data disclosure remains. Riku, Navi, Gmail permission explanations, privacy policy, writing archive and intentional public contact/profile details are retained. There is no mailbox connection, private project database or credential export in this website.

The automated artifact audit inspected tracked text and generated text for high-confidence private-key/token/access-key patterns and inspected deployed text for private filesystem paths. It found no matches. Existing build verification also rejects known private project repository links and draft publication. Browser tests observed no third-party runtime requests. Fonts use system stacks; no external font download is introduced.

These checks are bounded: pattern scanning cannot certify the absence of every secret or image-embedded personal detail. Inspected browser captures show the website only. Preserved game/showcase provenance records identify source captures and transformations; no unrelated private project directory was copied into this release.

## Asset provenance

- Workshop and blink artwork: existing generated-art records in [Ambient V1 artwork](../ambient-v1/artwork.md), followed by the accepted V1.1 scene and V1.2 approval. Original source PNGs and generation/review history remain outside the deployment artifact. Canonical Tinker V3.4 asset hashes and frame constraints passed.
- Window seat: original internally synthesized composition, runtime file `after-hours.ogg`, with score/synthesis source and [audio provenance](../ambient-v1/audio.md). No sampled recording, soundfont, stream or paid music API was used according to that record. OGG SHA-256 remains `49329d4d3c94011a5b98c9ff6d7a4711a7ad7612248e06cb7153d6bb5c30d61d`; loop, encoding and composition are unchanged. Historical documents describing pending review are superseded by the recorded V1.2 owner acceptance.
- Project screenshots: existing `public/images/projects/showcase/provenance.json`, approved NightStock capture records and pinned verifier. Original pixel content and responsive variants pass. No new third-party imagery was sourced.
- Existing inline SVG/social icons are unchanged from public main. Their source/attribution is not separately documented in the repository. Confirm their intended provenance/notices during publication review. No standalone repository-wide LICENSE file was found; this integration does not assign a new license to the owner's work.
- Third-party dependency license metadata is inventoried in `artifact-audit.json`, including permissive, MPL and LGPL entries (platform/build dependencies included). No new package or font dependency was introduced. This inventory is not a legal clearance of every transitive package or asset.

## Inherited dependency findings

`npm audit --json` exited 1 with **3 vulnerable packages: 2 high, 1 moderate, 0 critical**. See [raw audit](npm-audit.json). The lockfile is byte-identical to both public main and the accepted V1.2 source, so these are inherited findings, not newly introduced packages.

| Package | Locked version | Audit severity | Reachability observed |
| --- | --- | --- | --- |
| `fast-uri` | 3.1.8 | Moderate | `@astrojs/check` language-server/YAML validation dependency |
| `undici` | 8.11.2 | High | Astro's `unifont` dependency; build/tooling HTTP client |
| `zod` | 4.6.5 | High | Astro/content, sitemap and RSS schema tooling |

The deployed site is static and does not run these Node services on GitHub Pages. No dependency directory is deployed. This narrows visitor-side exposure but does not establish that every build-time advisory is harmless. `npm audit` reports fixes available; the advisory records describe vulnerable ranges below fast-uri 3.1.9, undici 8.12.2 and zod 4.6.6. No blanket `npm audit fix` or dependency upgrade was applied.

Before release, make a bounded dependency-remediation change and validate its resulting checkpoint, or obtain an explicit, documented owner disposition of these inherited findings. Keep that decision separate from the previously accepted homepage design and music review.
