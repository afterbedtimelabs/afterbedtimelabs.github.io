# First launch review — October 15, 2026

Status: prepared for owner review. Do not merge or dispatch deployment until the owner approves. No DNS, Pages custom-domain setting, Google OAuth setting, or Navi service changes are part of this work.

## Review findings and changes

- Retained the lamp/workbench branding, typography, warm light and dark themes, studio homepage, four project descriptions, About page, and writing system.
- Writing has no published posts. The unfinished sample remains a draft and is excluded from production routes, RSS, and sitemap. The production empty state is intentional; no article was fabricated.
- Existing project source/demo links are omitted where no verified public destination is available. No placeholder buttons were added.
- Added `/navi/` and `/navi/privacy/` using the existing static routing, SEO, typography, theme, and accessible site shell. Added a compact homepage introduction and persistent footer links.
- Changed the default public origin to `https://afterbedtimelabs.github.io` across Astro, SEO fallback, and the verifier. `SITE_URL` still supports the later custom-domain build.
- Kept the existing workflow unchanged: only `workflow_dispatch` can deploy. Pushing this branch or merging the PR does not run that deployment workflow.
- The site has no backend, user account system, analytics, Gmail sign-in, or connection to a home network service. The theme toggle stores only a browser preference. GitHub Pages serves static files.

## Policy basis and owner confirmations

The policy was derived from a read-only review of the requested private repository's OAuth implementation, Gmail reader, financial monitor security/setup documentation, vendor-discovery documentation, and owner financial-query documentation. Only public-facing behavior is summarized here. Do not copy private source, deployment configuration, credentials, account information, logs, or database contents into this repository or its issues.

Before publication, the owner must confirm:

1. **Publication blocker — private contact:** provide a dedicated public support/privacy email for private data inquiries. Replace the explicit prepublication notice in both Navi pages with that address. Do not use a personal address without explicit authorization. GitHub Issues is approved for general public support/feedback only, with the private-data warning kept visible. Issues are enabled; confirm they will be monitored. Google Branding also needs a real monitored support email and developer contact email; a GitHub issue URL does not fill those fields.
2. **Actual deployment:** confirm the running version matches the described single `gmail.readonly` permission, local processing, optional Discord features, and absence of cloud mail analysis. This source review did not access a live mailbox, inspect private runtime settings, or exercise production services.
3. **Retention and storage:** confirm actual retention configuration (documented default 730 days; range 90–1,825), persistent vendor decisions, operator file/disk/backup protection, and deletion instructions. The database is not encrypted by Navi, and pruning is not secure erasure.
4. **Discord:** optional generic alerts and owner-requested selected financial text/voice responses are disclosed at the owner's request. Confirm enabled features and the in-app consent/disclosures match these transfers. Private/ephemeral delivery still involves Discord processing.
5. **Policy commitments:** approve the Limited Use commitment, no sale/advertising/credit or lending use, no general-purpose model training, restricted human access, and consent before new data use. These are operating commitments as well as descriptions of code. No Google verification, compliance certification, or absolute security guarantee is claimed.
6. **Identity and date:** approve Isaac/After Bedtime Labs as the public developer identity and update the policy date if substantive changes occur before launch. Review final support wording together with OAuth Branding. The existing X profile is preserved but could not be independently verified by the external web fetcher; confirm it remains the intended public profile.

## Local validation

`npm run validate` passed: Astro/TypeScript reported 0 errors, 0 warnings, and 0 hints; the static build and output verifier passed for all 11 HTML pages and 1 excluded draft. The verifier covers required routes, unique metadata, canonical/social URLs, internal links and fragments, local assets, sitemap, RSS, robots, excluded drafts, and Navi permission/policy discoverability. `git diff --check` passed.

Build and output verification also passed with `SITE_URL=https://afterbedtimelabs.dev`; the final local output was then restored to the initial GitHub Pages origin. This tests metadata generation only and does not change DNS or deployment settings.

Production-preview review covered Home, Projects, About, Writing, Navi, and the privacy policy at desktop and mobile sizes, with both themes. Home and both Navi routes had no horizontal overflow at 320, 768, 1024, and 1440 CSS pixels; 390-pixel phone views were also inspected. Policy section links worked with keyboard activation, and Skip to content moved focus to the main landmark. The browser reported no console errors. Home, Navi, policy, About, Projects, Writing, robots, RSS, and sitemap returned HTTP 200 without cookies or authorization headers. GitHub's repository API confirms public support issues are enabled.

Public source/output review found no copied private repository source, credentials, personal email addresses, runtime data, or internal workstation paths. This was a focused source/content review and pattern scan, not a certification or a live production-security audit. The existing workflow's manual trigger, Node 24 setup, static artifact path, and deployment permission boundaries were reviewed; no Actions deployment was dispatched or exercised.

On this Windows host, dependency installation and validation require execution outside the filesystem/process sandbox. Restricted execution produced an Astro dependency `require is not defined` error; unrestricted execution succeeded without a dependency or source workaround. `npm ci` reported zero vulnerabilities.

## First GitHub Pages deployment — only after approval

1. Resolve the policy confirmations and private-contact blocker, rerun `npm run validate`, review the PR, and merge the approved changes into `main`.
2. Open this repository's **Settings → Pages → Build and deployment** and select **GitHub Actions** as Source. Leave **Custom domain** empty for this first launch. Do not add a CNAME or change DNS.
3. Open **Actions → Deploy to GitHub Pages → Run workflow**. Select branch **main** and set `site_url` to exactly `https://afterbedtimelabs.github.io`. Run only after the owner explicitly approves publishing.
4. Wait for both build and deploy jobs to succeed and approve the `github-pages` environment if it has required reviewers. The workflow installs the lockfile, checks, builds, verifies, uploads only `dist/`, and deploys that static artifact.
5. In a signed-out browser, verify the homepage, `/navi/`, `/navi/privacy/`, navigation, mobile layout, theme toggle, `/robots.txt`, `/sitemap-index.xml`, and `/rss.xml`. Check generated canonical and social URLs use the Pages hostname. No local app or home server needs to run.

Expected public URLs after deployment:

- Studio: `https://afterbedtimelabs.github.io/`
- OAuth application homepage: `https://afterbedtimelabs.github.io/navi/`
- OAuth privacy policy: `https://afterbedtimelabs.github.io/navi/privacy/`

## Later custom domain and Google OAuth Branding

1. When ready, verify ownership of `afterbedtimelabs.dev` in GitHub to prevent domain takeover. Add it under **Settings → Pages → Custom domain** before directing DNS to Pages. Follow [GitHub's current domain instructions](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/managing-a-custom-domain-for-your-github-pages-site) for apex A/AAAA or ALIAS/ANAME records; copy current values from that guide instead of guessing DNS records. Remove conflicting records and confirm GitHub's DNS check. Enable Enforce HTTPS when the certificate is available.
2. Re-run the manual workflow with `site_url` set to `https://afterbedtimelabs.dev`. Check redirects from the Pages hostname, HTTPS, canonical/social metadata, sitemap, RSS, and robots. With Actions publishing, the Pages custom-domain setting controls hosting; a CNAME file alone does not configure it.
3. In the existing Google Cloud project, open **Google Auth Platform → Branding**. Set the app name to **Navi Gmail Monitor** (and ensure the actual consent app name agrees), the real monitored user-support email, and developer contact details. Use the deployed app homepage `/navi/` and policy `/navi/privacy/` on the same hostname. Prefer the app-specific homepage over the studio root because it directly explains the Gmail feature. Add terms only if real reviewed terms exist.
4. For the custom-domain phase use `https://afterbedtimelabs.dev/navi/` and `https://afterbedtimelabs.dev/navi/privacy/`, add `afterbedtimelabs.dev` to Authorized domains, and verify ownership through Google Search Console with an account associated with the Cloud project. For the initial Pages URLs, determine the registrable authorized-domain value Google accepts for that GitHub Pages hostname and complete its ownership requirements; do not assume owning a repository automatically satisfies Google domain verification. If Google will not accept the Pages host, complete the custom-domain phase first.
5. In **Data Access**, confirm the only Gmail scope is `https://www.googleapis.com/auth/gmail.readonly`, categorized by Google as **restricted**. Do not add write scopes. Retain the existing **Desktop app** OAuth client and local loopback authorization; these static pages are informational URLs, not OAuth callback URLs. Do not replace the client or change redirect settings just to add the website links.
6. Review Audience and whether the app remains personal/testing or is being distributed. Publishing branding or moving an app to production is separate from approval for restricted-scope access. Follow Google's applicable verification process (and any required security assessment), or establish a documented applicable exception. Optional Discord transfers of derived Google data must be considered; do not assume local processing alone guarantees an exemption. Prepare the requested scope justification and demo without showing private data.
7. Submit/verify the reviewed branding and data-access information through Google's current interface only after approval. When moving hosts later, update Branding links and authorized domains, reverify/re-publish branding as required, and check the policy remains public. Do not retire old working links before redirects and updated branding are verified.

References: [Google brand verification and homepage/policy requirements](https://developers.google.com/identity/protocols/oauth2/production-readiness/brand-verification), [Gmail scopes](https://developers.google.com/workspace/gmail/api/auth/scopes), [Google API Services User Data Policy](https://developers.google.com/terms/api-services-user-data-policy), [restricted-scope verification](https://developers.google.com/identity/protocols/oauth2/production-readiness/restricted-scope-verification), [GitHub Pages custom workflows](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages).
