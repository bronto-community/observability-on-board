// @ts-check
import { defineConfig } from 'astro/config';
import icon from 'astro-icon';
import sitemap from '@astrojs/sitemap';
import vercel from '@astrojs/vercel';

export default defineConfig({
  // If a custom domain ever replaces this, canonicals, OG URLs, the sitemap
  // and robots.txt all bake this value in.
  site: 'https://observability-on-board.vercel.app',
  // The site is static; the adapter exists for the one server route, /get/[slug].
  adapter: vercel(),
  integrations: [icon(), sitemap()],
  markdown: {
    shikiConfig: {
      theme: 'github-dark-default',
      colorReplacements: {
        // Comment grey lifted for AA contrast on our --night block background.
        '#8b949e': '#a3adb8',
      },
    },
  },
});
