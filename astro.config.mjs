// @ts-check
import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';

// The organization Pages repository is served at /, including before the
// custom domain is ready. SITE_URL keeps metadata correct for either host.
const site = new URL(process.env.SITE_URL || 'https://afterbedtimelabs.dev');
if (!['https:', 'http:'].includes(site.protocol) || site.pathname !== '/' || site.search || site.hash) {
  throw new Error('SITE_URL must be an absolute HTTP(S) origin, without a path, query, or fragment.');
}

export default defineConfig({
  site: site.href,
  output: 'static',
  trailingSlash: 'always',
  integrations: [
    mdx(),
    sitemap({
      // Drafts have no production routes. The error page should not be indexed.
      filter: (page) => !/\/404(?:\.html)?\/?$/.test(new URL(page).pathname),
    }),
  ],
  markdown: {
    shikiConfig: {
      themes: { light: 'github-light', dark: 'github-dark' },
      wrap: true,
    },
  },
});
