import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const writing = defineCollection({
  loader: glob({ base: './src/content/writing', pattern: '**/*.{md,mdx}' }),
  schema: z.object({
    title: z.string().min(1),
    description: z.string().min(1),
    publishDate: z.coerce.date(),
    updatedDate: z.coerce.date().optional(),
    tags: z.array(z.string().min(1)).default([]),
    draft: z.boolean().default(false),
    heroImage: z.string().optional(),
    heroImageAlt: z.string().optional(),
    heroImageCaption: z.string().optional(),
    canonicalURL: z.url({ protocol: /^https?$/ }).optional(),
  }).refine((article) => !article.heroImage || Boolean(article.heroImageAlt?.trim()), {
    message: 'Provide heroImageAlt when using a hero image.',
    path: ['heroImageAlt'],
  }),
});

export const collections = { writing };
