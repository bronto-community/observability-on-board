// @ts-check
import { readdirSync, readFileSync } from 'node:fs';
import { defineConfig } from 'astro/config';
import icon from 'astro-icon';
import sitemap from '@astrojs/sitemap';
import vercel from '@astrojs/vercel';

// Episodes marked `hidden: true` are built and reachable, but stay out of the sitemap;
// listing one there announces it to crawlers, which is the thing hiding it prevents.
// The content collection is not available here, so the frontmatter is read directly.
const EPISODE_DIR = './src/content/episodes';
const hiddenEpisodes = readdirSync(EPISODE_DIR)
  .filter((f) => f.endsWith('.md'))
  .filter((f) => /^hidden:\s*true\s*$/m.test(readFileSync(`${EPISODE_DIR}/${f}`, 'utf8')))
  .map((f) => f.replace(/\.md$/, ''));

export default defineConfig({
  // If a custom domain ever replaces this, canonicals, OG URLs, the sitemap
  // and robots.txt all bake this value in.
  site: 'https://observability-on-board.vercel.app',
  // The site is static; the adapter exists for the one server route, /get/[slug].
  adapter: vercel(),
  integrations: [
    icon(),
    sitemap({
      filter: (page) => !hiddenEpisodes.some((slug) => page.endsWith(`/episodes/${slug}/`)),
    }),
  ],
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
