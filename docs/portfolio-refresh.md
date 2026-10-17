# Portfolio and blog refresh — October 17, 2026

## Deployment audit

The last successful website deployment was [run 38993757908](https://github.com/afterbedtimelabs/afterbedtimelabs.github.io/actions/runs/38993757908), from main commit `fc1f8d3e11026713a3da22921f4f19634fce2c59`, completed October 16 at 10:09 p.m. Eastern (October 17 at 02:09 UTC). It contains the original studio shell, four abstract project entries, an empty writing index, and the Navi Gmail Monitor information/privacy pages.

Live observations on October 17:

- `https://afterbedtimelabs.dev/` returns HTTP 200 with a valid TLS connection.
- `https://www.afterbedtimelabs.dev/` redirects to the HTTPS apex site.
- Apex A records resolve to GitHub Pages (`185.199.108.153` through `185.199.111.153`). The `www` CNAME targets `afterbedtimelabs.github.io`.
- The live canonical URLs, RSS, and robots sitemap still identify `https://afterbedtimelabs.github.io`. This PR changes all default build origins and the manual deployment input to the working custom domain.
- `https://afterbedtimelabs.github.io/` returns a 301 to **HTTP** `afterbedtimelabs.dev`; HTTP at the apex returns 200. HTTPS enforcement needs attention in Pages settings. Browser HSTS upgrades can conceal this when inspecting only a browser address bar.
- The unauthenticated Pages settings endpoint returns 404 and the available repository connector does not expose Pages administration. The exact settings and domain verification state were not inspected or changed. The successful workflow, live responses, and DNS establish that Pages is serving the custom domain; they do not establish every administrative setting.

There is no observed DNS or certificate blocker to deploying this refresh. Remaining deployment work is merging the reviewed PR, running the manual deployment, and checking **Enforce HTTPS**.

## Changes and scope

- Focus the landing page and project index on Riku, Dungeon Deckbuilder, and Midnight Chiba, with development status, availability, detail pages, next steps, and existing game captures.
- Use Riku as the public companion name. The current repository is still named `bot-monitor`, not Riku; a local remote retained the historical misspelling `bot-monitot`. Repository metadata confirmed the canonical name. The three project repositories are private, so no inaccessible source links or guessed demo URLs are presented.
- Retain the existing `/navi/` and `/navi/privacy/` names, content, policy date, and routes. They describe the specific Gmail Monitor feature; the portfolio explains the relationship. No OAuth configuration or policy commitments change.
- Keep the previous Mission Control and Local AI detail URLs working, but focus the project index on the three requested projects.
- Publish a new studio introduction with only established project context. Leave the unfinished PowerShell article as a draft. Add topic archives, linked tags, article structured metadata, and RSS discovery.
- Preserve the warm light/dark design, add larger mobile controls, maintain skip navigation and reduced-motion support, and use descriptive image text and explicit dimensions.
- Add read-only PR validation and a downloadable static preview artifact. Publishing stays manual on main. No changes to Tinker Panda, any companion/game repository, live DNS, or Pages administration.

Image provenance is recorded in [project-assets.md](project-assets.md).

## Deploy after review

1. Review the PR preview, public wording, and introductory article. Merge the PR when ready.
2. Open [Settings → Pages](https://github.com/afterbedtimelabs/afterbedtimelabs.github.io/settings/pages). Confirm **GitHub Actions** source and **afterbedtimelabs.dev** custom domain. Enable **Enforce HTTPS** if unchecked. See [GitHub's HTTPS guide](https://docs.github.com/en/pages/getting-started-with-github-pages/securing-your-github-pages-site-with-https). If it is unavailable, inspect GitHub's displayed certificate/DNS status before changing DNS. Preserve all email-routing records.
3. Run [Deploy to GitHub Pages](https://github.com/afterbedtimelabs/afterbedtimelabs.github.io/actions/workflows/deploy.yml) on **main** with `site_url=https://afterbedtimelabs.dev`. Merging alone does not deploy.
4. After the workflow succeeds, check Home, all three project pages, Writing, the introduction, a topic page, `/navi/`, `/navi/privacy/`, RSS, sitemap, and robots on the public domain. Confirm canonical/social/feed URLs use the custom domain and no drafts appear.
5. Check direct HTTP requests and the GitHub hostname redirect to HTTPS, plus mobile navigation and light/dark themes.

For rollback, redeploy a reviewed revert commit on main. This PR does not alter the live deployment until the manual workflow is run.
