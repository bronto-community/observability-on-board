import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const episodes = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/episodes' }),
  schema: z.object({
    title: z.string(),
    tool: z.string(),
    episode: z.number(),
    description: z.string(),
    takeaway: z.string(),
    signals: z.array(z.enum(['traces', 'metrics', 'logs'])),
    video: z.string().url().optional(),
    docs: z.string().url(),
    blog: z.string().url().optional(),
    share: z.string().url().optional(),
    verified: z.string().optional(),
  }),
});

export const collections = { episodes };
