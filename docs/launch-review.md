# First launch review — October 15, 2026

Status: ready for final owner review, subject to the operating sign-off below. Do not merge or dispatch deployment until the owner approves. No DNS, Pages custom-domain setting, Google OAuth setting, or Navi service changes are part of this work.

## Review findings and changes

- Retained the lamp/workbench branding, typography, warm light and dark themes, studio homepage, four project descriptions, About page, and writing system.
- Writing has no published posts. The unfinished sample remains a draft and is excluded from production routes, RSS, and sitemap. The production empty state is intentional; no article was fabricated.
- Existing project source/demo links are omitted where no verified public destination is available. No placeholder buttons were added.
- Added `/navi/` and `/navi/privacy/` using the existing static routing, SEO, typography, theme, and accessible site shell. Added a compact homepage introduction and persistent footer links.
- Changed the default public origin to `https://afterbedtimelabs.github.io` across Astro, SEO fallback, and the verifier. `SITE_URL` still supports the later custom-domain build.
- Kept the existing workflow unchanged: only `workflow_dispatch` can deploy. Pushing this branch or merging the PR does not run that deployment workflow.
- The site has no backend, user account system, analytics, Gmail sign-in, or connection to a home network service. The theme toggle stores only a browser preference. GitHub Pages serves static files.

## Final policy and implementation review

The policy was derived from a read-only review of the requested private repository's OAuth implementation, Gmail reader, financial monitor security/setup documentation, vendor-discovery documentation, and owner financial-query documentation. Only public-facing behavior is summarized here. Do not copy private source, deployment configuration, credentials, account information, logs, or database contents into this repository or its issues.

The official privacy contact is **privacy@afterbedtimelabs.dev**, approved by the owner on October 15, 2026. The owner reports that Cloudflare Email Routing forwards it to a dedicated studio Gmail account and that a test message was delivered successfully. Both Navi pages now link to this address. No test email was sent during this website review, and no destination Gmail address is published. GitHub Issues remains approved for general public support/feedback with warnings against posting private information. The temporary contact warnings have been removed.

The current private implementation was rechecked read-only against a pinned default-branch source snapshot. These previous technical confirmations are supported by the implementation:

| Policy statement | Implementation evidence and limits |
| --- | --- |
| Exactly one Gmail read-only scope | OAuth requests and saved/new grant validation accept only `gmail.readonly`. Gmail access uses fixed message-list/message GET requests; no Gmail mutation or attachment-download operation exists in this integration. |
| Message data is processed locally | The MIME parser reads bounded sender/subject and message text, skips attachments, strips active HTML, and does not follow links/images. Optional extraction and vendor naming use a verified loopback local model; remote/cloud aliases are rejected without a cloud fallback. |
| Structured storage rather than raw mail history | Database inserts use normalized financial fields and vendor evidence. Raw subjects, full addresses, bodies, model prompts/responses and OAuth tokens are excluded from that schema. Raw-message references are released after processing, without a secure-memory-erasure claim. |
| Credential and database protection | Saved Windows tokens use current-user DPAPI; non-Windows plaintext tokens require explicit opt-in and restrictive permissions. SQLite is not application-encrypted. Disk, backup and local-host security remain operator responsibilities. |
| Retention defaults and exceptions | Configuration defaults to 730 days with a 90–1,825-day range. After successful polls, history pruning uses local retention timestamps and row caps. Vendor candidates/approval/ignore decisions and scan state are outside history pruning; complete removal requires deleting local data and backups separately. Revoking Google access does not delete retained copies. |
| Optional Discord transfers | The alert formatter sends fixed summaries/source/opaque identifiers and omits metadata. Owner-authorized financial commands are ephemeral. Financial replies are deterministic formatted observations; query results are not fed back to the local model or general conversation memory. Voice access requires the restricted owner-and-bot audience and is rechecked during the turn. The public policy now names reply fields rather than every field available in the internal query projection. |
| Limited Use and no model training | Reviewed Gmail paths perform feature-specific retrieval, local inference and disclosed optional responses, with no advertising, sale, lending/credit scoring or training operation. Broader business practices, future changes and permitted human access remain operating commitments for the owner to approve. |

No unresolved website code/content blocker was found in this review. Final owner approval still covers these operating matters, which source code alone cannot establish:

1. The deployed Navi version/settings and trusted local model service match the described behavior; local permissions, disk/swap/backups and dashboard access are protected. No live mailbox, secret configuration, host ACLs, backup contents or production services were accessed or changed for this review.
2. Any enabled Discord features have appropriate user-facing consent/disclosures, and the privacy inbox and public support issues will be monitored. Optional Discord coverage was explicitly approved by the owner; this review does not certify the running Discord permissions.
3. Adopt the policy's Limited Use, no sale/advertising/credit or lending use, no general-purpose model training, restricted human access, and consent-before-new-use commitments. Approve the public developer identity and October 15, 2026 policy date. No Google verification, certification or absolute security guarantee is claimed.

The existing X profile is preserved; external verification was unavailable during the initial review. Confirming that optional social profile is an editorial follow-up, not a Navi contact or policy implementation blocker. Google support/developer contact fields and any restricted-scope verification remain separate OAuth launch tasks; they are not changed by publishing this website.

## Local validation

`npm run validate` passed: Astro/TypeScript reported 0 errors, 0 warnings, and 0 hints; the static build and output verifier passed for all 11 HTML pages and 1 excluded draft. The verifier covers required routes, unique metadata, canonical/social URLs, internal links and fragments, local assets, sitemap, RSS, robots, excluded drafts, and Navi permission/policy discoverability. `git diff --check` passed.

The full suite was rerun successfully after the verified-contact update and final policy wording review. Both generated Navi pages contain the visible approved address and matching `mailto:privacy@afterbedtimelabs.dev` link, retain the general GitHub Issues link and private-data warnings, and omit the temporary contact notices. Only the approved email address appears on those pages. Final source/output review found no personal destination inbox, credentials, private source, runtime data or workstation paths. This follow-up changes text and links only; the earlier responsive/theme review remains applicable.

Build and output verification also passed with `SITE_URL=https://afterbedtimelabs.dev`; the final local output was then restored to the initial GitHub Pages origin. This tests metadata generation only and does not change DNS or deployment settings.

Production-preview review covered Home, Projects, About, Writing, Navi, and the privacy policy at desktop and mobile sizes, with both themes. Home and both Navi routes had no horizontal overflow at 320, 768, 1024, and 1440 CSS pixels; 390-pixel phone views were also inspected. Policy section links worked with keyboard activation, and Skip to content moved focus to the main landmark. The browser reported no console errors. Home, Navi, policy, About, Projects, Writing, robots, RSS, and sitemap returned HTTP 200 without cookies or authorization headers. GitHub's repository API confirms public support issues are enabled.

Public source/output review found no copied private repository source, credentials, personal email addresses, runtime data, or internal workstation paths. This was a focused source/content review and pattern scan, not a certification or a live production-security audit. The existing workflow's manual trigger, Node 24 setup, static artifact path, and deployment permission boundaries were reviewed; no Actions deployment was dispatched or exercised.

On this Windows host, dependency installation and validation require execution outside the filesystem/process sandbox. Restricted execution produced an Astro dependency `require is not defined` error; unrestricted execution succeeded without a dependency or source workaround. `npm ci` reported zero vulnerabilities.

## First GitHub Pages deployment — only after approval

1. Approve the reviewed policy and operating commitments, confirm validation still passes, and merge the approved PR into `main`.
2. Open this repository's **Settings → Pages → Build and deployment** and select **GitHub Actions** as Source. Leave **Custom domain** empty for this first launch. Do not add a CNAME or change DNS.
3. Open **Actions → Deploy to GitHub Pages → Run workflow**. Select branch **main** and set `site_url` to exactly `https://afterbedtimelabs.github.io`. Run only after the owner explicitly approves publishing.
4. Wait for both build and deploy jobs to succeed and approve the `github-pages` environment if it has required reviewers. The workflow installs the lockfile, checks, builds, verifies, uploads only `dist/`, and deploys that static artifact.
5. In a signed-out browser, verify the homepage, `/navi/`, `/navi/privacy/`, navigation, mobile layout, theme toggle, `/robots.txt`, `/sitemap-index.xml`, and `/rss.xml`. Check generated canonical and social URLs use the Pages hostname. No local app or home server needs to run.

Expected public URLs after deployment:

- Studio: `https://afterbedtimelabs.github.io/`
- OAuth application homepage: `https://afterbedtimelabs.github.io/navi/`
- OAuth privacy policy: `https://afterbedtimelabs.github.io/navi/privacy/`

## Later custom domain and Google OAuth Branding

1. When ready, verify ownership of `afterbedtimelabs.dev` in GitHub to prevent domain takeover. Add it under **Settings → Pages → Custom domain** before directing DNS to Pages. Follow [GitHub's current domain instructions](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/managing-a-custom-domain-for-your-github-pages-site) for apex A/AAAA or ALIAS/ANAME records; copy current values from that guide instead of guessing DNS records. Change only the website-related records and preserve the existing Cloudflare Email Routing MX and mail-related TXT records. Confirm GitHub's DNS check and enable Enforce HTTPS when the certificate is available.
2. Re-run the manual workflow with `site_url` set to `https://afterbedtimelabs.dev`. Check redirects from the Pages hostname, HTTPS, canonical/social metadata, sitemap, RSS, and robots. With Actions publishing, the Pages custom-domain setting controls hosting; a CNAME file alone does not configure it.
3. In the existing Google Cloud project, open **Google Auth Platform → Branding**. Set the app name to **Navi Gmail Monitor** (and ensure the actual consent app name agrees), the real monitored user-support email, and developer contact details. Use the deployed app homepage `/navi/` and policy `/navi/privacy/` on the same hostname. Prefer the app-specific homepage over the studio root because it directly explains the Gmail feature. Add terms only if real reviewed terms exist.
4. For the custom-domain phase use `https://afterbedtimelabs.dev/navi/` and `https://afterbedtimelabs.dev/navi/privacy/`, add `afterbedtimelabs.dev` to Authorized domains, and verify ownership through Google Search Console with an account associated with the Cloud project. For the initial Pages URLs, determine the registrable authorized-domain value Google accepts for that GitHub Pages hostname and complete its ownership requirements; do not assume owning a repository automatically satisfies Google domain verification. If Google will not accept the Pages host, complete the custom-domain phase first.
5. In **Data Access**, confirm the only Gmail scope is `https://www.googleapis.com/auth/gmail.readonly`, categorized by Google as **restricted**. Do not add write scopes. Retain the existing **Desktop app** OAuth client and local loopback authorization; these static pages are informational URLs, not OAuth callback URLs. Do not replace the client or change redirect settings just to add the website links.
6. Review Audience and whether the app remains personal/testing or is being distributed. Publishing branding or moving an app to production is separate from approval for restricted-scope access. Follow Google's applicable verification process (and any required security assessment), or establish a documented applicable exception. Optional Discord transfers of derived Google data must be considered; do not assume local processing alone guarantees an exemption. Prepare the requested scope justification and demo without showing private data.
7. Submit/verify the reviewed branding and data-access information through Google's current interface only after approval. When moving hosts later, update Branding links and authorized domains, reverify/re-publish branding as required, and check the policy remains public. Do not retire old working links before redirects and updated branding are verified.

References: [Google brand verification and homepage/policy requirements](https://developers.google.com/identity/protocols/oauth2/production-readiness/brand-verification), [Gmail scopes](https://developers.google.com/workspace/gmail/api/auth/scopes), [Google API Services User Data Policy](https://developers.google.com/terms/api-services-user-data-policy), [restricted-scope verification](https://developers.google.com/identity/protocols/oauth2/production-readiness/restricted-scope-verification), [GitHub Pages custom workflows](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages).
