import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';
import { categories } from './data/site';

// Each portfolio project is one Markdown file in src/content/projects/.
const projects = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/projects' }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      client: z.string(),
      industry: z.string(),
      category: z.enum(categories),
      services: z.array(z.string()).default([]),
      summary: z.string(),
      url: z.string().url().optional(),
      year: z.number().optional(),
      featured: z.boolean().default(false),
      order: z.number().default(100),
      // Card colour used until a real screenshot is added.
      tint: z.string().default('#F5F4FB'),
      // Optional screenshot: put the file next to the .md and reference it, e.g. ./makaan.png
      cover: image().optional(),
      // Optional scroll-through video to show animation/parallax.
      // Put files in public/media/ and reference them as '/media/name.mp4'.
      video: z.string().optional(),
      // Still frame shown before the video loads, e.g. '/media/name.jpg'
      poster: z.string().optional(),
      results: z
        .array(z.object({ value: z.string(), label: z.string() }))
        .default([]),
      testimonial: z
        .object({ quote: z.string(), name: z.string(), role: z.string().optional() })
        .optional(),
    }),
});

export const collections = { projects };
