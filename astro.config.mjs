// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// TODO: replace with your real domain once confirmed.
const SITE = process.env.SITE_URL || 'https://www.simplynsorted.com';
// Folder the site is served from. '/' for the live site; the test-branch deploy
// builds with BASE_PATH=/test so every link and asset points inside /test/.
const BASE = process.env.BASE_PATH || '/';

export default defineConfig({
  site: SITE,
  base: BASE,
  trailingSlash: 'ignore',
  build: {
    format: 'directory',
    // Put CSS inside each page so styling never depends on a separate file
    // (more reliable on shared hosting and preview URLs).
    inlineStylesheets: 'always',
    // Use a plain folder name for any generated files (images later).
    assets: 'assets',
  },
  integrations: [sitemap()],
});
