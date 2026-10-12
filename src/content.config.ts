import { defineCollection } from 'astro:content';
import { z } from 'astro/zod';
import { glob } from 'astro/loaders';

// The admin editor can save an empty field as ''; treat that the same as leaving it out.
const blankToUndefined = (v: unknown) => (v === '' || v === null ? undefined : v);
const linkSchema = z.preprocess(blankToUndefined, z.string().min(1).optional());
const optionalText = z.preprocess(blankToUndefined, z.string().optional());
const optionalDate = z.preprocess(blankToUndefined, z.coerce.date().optional());

const publications = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/publications' }),
  schema: z.object({
    title: z.string(),
    authors: z.array(z.string()).min(1),
    venue: z.string(),
    year: z.number().int(),
    status: z.enum(['published', 'accepted', 'preprint', 'under-review', 'in-progress']),
    abstract: z.string(),
    tags: z.array(z.string()).default([]),
    links: z
      .object({
        paper: linkSchema,
        code: linkSchema,
        demo: linkSchema,
        project: linkSchema,
      })
      .default({}),
    bibtex: optionalText,
    featured: z.boolean().default(false),
  }),
});

const projects = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/projects' }),
  schema: z.object({
    title: z.string(),
    subtitle: optionalText,
    description: z.string(),
    role: optionalText,
    year: z.number().int(),
    status: z.enum(['active', 'completed', 'paused', 'archived']),
    category: z.enum(['research', 'engineering', 'experiment']),
    tags: z.array(z.string()).default([]),
    links: z
      .object({
        github: linkSchema,
        paper: linkSchema,
        demo: linkSchema,
        report: linkSchema,
      })
      .default({}),
    featured: z.boolean().default(false),
    cover: optionalText,
  }),
});

const posts = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/posts' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    date: z.coerce.date(),
    updated: optionalDate,
    tags: z.array(z.string()).default([]),
    draft: z.boolean().default(false),
    cover: optionalText,
  }),
});

export const collections = { publications, projects, posts };
