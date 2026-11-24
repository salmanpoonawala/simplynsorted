// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// TODO: replace with your real domain once confirmed.
const SITE = 'https://www.simplynsorted.com';

export default defineConfig({
  site: SITE,
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
