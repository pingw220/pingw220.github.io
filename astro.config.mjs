// @ts-check
import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import react from '@astrojs/react';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';

// https://astro.build/config
export default defineConfig({
  // GitHub Pages user site (repo `pingw220.github.io`). Used for canonical URLs,
  // Open Graph tags, the sitemap, and RSS.
  site: 'https://pingw220.github.io',
  integrations: [mdx(), react(), sitemap()],
  vite: {
    plugins: [tailwindcss()],
    // The visitor-api Worker is deployed separately; its local D1 database
    // changes on every visit, which would otherwise trigger reload loops.
    server: { watch: { ignored: ['**/visitor-api/**'] } },
    // Leaflet is only imported dynamically, so pre-bundle it at startup; otherwise the
    // first dev page load fails with "Outdated Optimize Dep" while Vite re-bundles it.
    optimizeDeps: { include: ['leaflet'] },
  },
});
