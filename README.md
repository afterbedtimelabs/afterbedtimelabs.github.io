# After Bedtime Labs

Isaac's personal workshop for software, AI, games, and experiments built outside the day job. The site pairs a small project portfolio with technical writing about what works, what fails, and what is learned along the way.

The initial public origin is [afterbedtimelabs.github.io](https://afterbedtimelabs.github.io). The eventual custom domain is `afterbedtimelabs.dev`. The repository is the organization Pages site, `afterbedtimelabs/afterbedtimelabs.github.io`, so it uses the root URL `/` with no repository-name prefix.

## Stack

- Astro with static generation and TypeScript.
- Astro Content Collections for Markdown and MDX articles.
- Shiki syntax highlighting, an RSS feed, and generated sitemaps.
- Plain CSS, system fonts, and a small theme toggle that remembers the reader's preference.
- GitHub Actions for GitHub Pages deployment. Deployment is manual until the local site is reviewed and approved.

There is no frontend framework, database, analytics, or account system.

## Local development

Use Node.js 24 LTS (the Pages workflow also uses Node 24). Run these commands from the repository root:

```sh
npm ci
npm run dev -- --background
```

Open [localhost:4321](http://localhost:4321). Astro prints the chosen URL if that port is already in use. Manage the background development server with:

```sh
npm run dev -- status
npm run dev -- logs
npm run dev -- stop
```

The development server shows draft writing with a visible draft label and `noindex` metadata. Drafts are omitted from production pages and RSS.

## Production build and preview

```sh
npm run validate
npm run preview -- --background --host 127.0.0.1 --port 4322
```

Open [localhost:4322](http://localhost:4322) to review the production output, including the real empty writing state while the only article is still a draft. Manage the preview with `npm run preview -- status`, `npm run preview -- logs`, and `npm run preview -- stop`.

| Command | Purpose |
| --- | --- |
| `npm run check` | Check Astro components and TypeScript. |
| `npm run build` | Generate static files in `dist/`. |
| `npm run verify` | Inspect a completed build for metadata, internal links, fragments, assets, feeds, and excluded drafts. |
| `npm run validate` | Run check, build, and verification in order. |

The verifier does not check external websites or replace visual and keyboard review. Before publishing a design change, review both themes at phone, tablet, laptop, and desktop widths and navigate with the keyboard.

## Structure

```text
public/                     Static images, favicon, and default social image
scripts/verify-build.mjs     Production-output checks
src/components/             Shared UI and SEO components
src/config/site.ts          Public identity, social profiles, and social image
src/content/writing/        Markdown and MDX articles
src/content.config.ts       Article frontmatter schema
src/data/projects.ts        Project content and optional public URLs
src/layouts/                Shared site shell; articles use the writing route
src/lib/                    Content and formatting helpers
src/pages/                  Home, Writing, Projects, About, 404, RSS, robots
src/styles/                 Shared theme, layout, and article styling
.github/workflows/          Manual Pages deployment workflow
```

## Add an article

Create a `.md` or `.mdx` file in `src/content/writing/`. The filename determines its route; for example, `a-small-useful-tool.md` becomes `/writing/a-small-useful-tool/`. Begin with:

```yaml
---
title: "A small useful tool"
description: "A concise description of the actual work and what the article covers."
publishDate: 2026-10-05
tags: ["Developer tooling"]
draft: true
---
```

Write the article below the frontmatter. Set `draft: false` when it is ready to publish; it then appears in Writing, recent writing, its own article route, the sitemap, and RSS. Production builds exclude drafts regardless of whether someone knows their URL. Draft source files still live in this **public repository**, so they must contain only public information.

Optional frontmatter:

| Field | Usage |
| --- | --- |
| `updatedDate` | A date when the article received a meaningful update. |
| `heroImage` | Public image path, such as `/images/workbench.webp`, or an image URL. |
| `heroImageAlt` | Required when `heroImage` is supplied; describe the image for readers using assistive technology. |
| `heroImageCaption` | An optional visible image caption. |
| `canonicalURL` | An absolute URL when this article's preferred original lives elsewhere. Otherwise, the site generates its own canonical. |

Markdown supports headings, syntax-highlighted code, blockquotes, tables, and lists. Use an HTML `<figure>` with an `<img alt="…">` and `<figcaption>` for an inline image with a caption. MDX is available when an article needs an imported Astro component. Keep article components static unless interaction has a clear purpose.

The single sample, `managing-ai-agents-in-powershell.md`, is intentionally short, unfinished, and marked as a draft. Replace its notes with Isaac's real experience before publishing it.

## Add or update a project

Edit `src/data/projects.ts`. Each entry includes a stable `slug`, `name`, `category`, `summary`, `description` paragraphs, `areas`, `tags`, `artwork`, and `featured`. Copy an existing entry to preserve the typed shape. The details route `/projects/{slug}/` is generated automatically; `featured: true` also includes the project on Home.

The available artwork treatments are `control`, `chiba`, `deck`, and `local`. They are lightweight abstract illustrations, not screenshots or claims about a project's finished appearance. New projects can reuse a treatment or extend the shared project artwork component.

`repositoryURL` and `websiteURL` are optional. Add them only when the real public destination is known. Unknown URLs are omitted from the interface; there are no placeholder buttons.

## Identity and metadata

Update `src/config/site.ts` for the public name, description, GitHub/X links, optional LinkedIn link, and default social image. LinkedIn is currently omitted. Project repository/demo URLs are also omitted until verified URLs are supplied.

The shared SEO component supplies titles, descriptions, canonical URLs, OpenGraph, and X metadata. The default social card is a local 1200 × 630 PNG, with its editable vector source in `public/social-card.svg`. Replace it with a custom PNG or JPEG and update `socialImage` and `imageAlt` in the site config. Articles can use their own hero image. `npm run brand-assets` regenerates the PNG and lamp favicons from the repository's vector branding, using Astro's existing Sharp dependency.

Astro's `site` defaults to `https://afterbedtimelabs.github.io`. A `SITE_URL` environment variable overrides the public origin for a build, keeping canonical URLs, social URLs, sitemaps, RSS, and robots consistent. It must be an absolute HTTP(S) origin without a path, query, or fragment. The verifier and shared SEO fallback use the same initial hostname.

For an initial build at the Pages hostname, use:

```sh
# macOS/Linux
SITE_URL=https://afterbedtimelabs.github.io npm run validate
```

```powershell
# PowerShell
$env:SITE_URL = 'https://afterbedtimelabs.github.io'
npm run validate
Remove-Item Env:SITE_URL
```

The verifier must use the same `SITE_URL` as the build. A local dev or preview server still runs on localhost; `SITE_URL` describes the published origin.

## GitHub Pages deployment

Read [the launch review and approval checklist](docs/launch-review.md) before the first deployment. It records the verified privacy contact, implementation review, remaining operating commitments, validation results, and Google OAuth setup steps. `/navi/` is the app information page and `/navi/privacy/` is its public privacy policy. These are static pages; they do not initiate OAuth or connect to the local Navi application. The approved public privacy contact is `privacy@afterbedtimelabs.dev`; GitHub Issues remains the general public support channel.

No push or deployment is needed for local review. After Isaac approves the local result:

1. Commit and push the reviewed site and `package-lock.json` to the repository's default branch, or merge the reviewed changes there.
2. In the GitHub repository, open **Settings → Pages** and select **GitHub Actions** as the source.
3. Open **Actions → Deploy to GitHub Pages → Run workflow** on **main**, after the reviewed changes have been merged there.
4. Leave `site_url` as `https://afterbedtimelabs.github.io` until the custom domain is ready. Once it is ready, supply `https://afterbedtimelabs.dev`.

The workflow installs with `npm ci`, runs Astro checks, builds and verifies `dist/`, uploads the Pages artifact, and then deploys it using the `github-pages` environment. Action versions are pinned to release commit hashes. Build permissions are read-only; Pages and OIDC write permissions are limited to the deploy job. You can configure required reviewers on the GitHub environment for an additional review gate.

The workflow has only `workflow_dispatch`; it will not publish on a push. Both build and deploy jobs require a manual dispatch on exactly `refs/heads/main`. Selecting another branch or a tag skips both jobs. Build permissions remain `contents: read` and `pages: read`; only the deploy job receives `pages: write` and `id-token: write`.

The branch guard restricts the source ref; it does not establish that a human approved a commit. The owner should manually review main-branch protection/rulesets and the `github-pages` environment's required reviewers and deployment branch policy (main only). Organization or environment administration settings are not modified by this repository change.

## Private commit email for future commits

In GitHub **Settings → Emails**, enable **Keep my email addresses private** and copy the exact GitHub-provided `noreply` address. Use the displayed address rather than guessing its numeric ID or username. GitHub can also block command-line pushes that expose a private email when that option is enabled.

From this repository, configure future local commits with the copied value:

```sh
git config --local user.email "YOUR_EXACT_GITHUB_NOREPLY_ADDRESS"
git config --local --get user.email
```

Replace the placeholder with the full address copied from GitHub before running the command. To apply it as the default for all local repositories, use `--global` instead of `--local`; a repository-local setting takes precedence. GitHub's email privacy setting for web commits does not automatically update local Git configuration on your computers.

This affects newly created commits only. Existing public commits retain their recorded author/committer information. Do not amend/rebase published commits, rewrite history, or force-push to change earlier email metadata as part of this setup. See [GitHub's commit email guide](https://docs.github.com/en/account-and-profile/how-tos/email-preferences/setting-your-commit-email-address).

## Custom domain

DNS readiness has not been assumed. No Cloudflare settings are managed by this repository, and there is no active `public/CNAME` file.

When ready, follow [GitHub's custom-domain guide](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/managing-a-custom-domain-for-your-github-pages-site), verify ownership, and set `afterbedtimelabs.dev` under **Settings → Pages → Custom domain** before configuring the provider's DNS. Confirm GitHub's DNS and HTTPS checks before relying on the custom domain, then run the deployment workflow with the production origin. GitHub Actions deployment uses the Pages setting for the custom domain. If a `public/CNAME` record is wanted for repository portability, add a single line `afterbedtimelabs.dev` only after DNS is ready; that file alone does not configure DNS or the Actions-hosted domain.

Further references: [Astro's Pages deployment guide](https://docs.astro.build/en/guides/deploy/github/), [GitHub's Pages workflow guide](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages), and [Astro's CLI reference](https://docs.astro.build/en/reference/cli-reference/).

Keep this public repository free of credentials, API keys, personal contact information, employer details, and private project material.
