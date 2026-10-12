import { defineCollection } from 'astro:content';
import { z } from 'astro/zod';
import { glob } from 'astro/loaders';

const linkSchema = z.string().min(1);

const publications = defineCollection({
  loader: glob({ pattern: '**/*.mdx', base: './src/content/publications' }),
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
        paper: linkSchema.optional(),
        code: linkSchema.optional(),
        demo: linkSchema.optional(),
        project: linkSchema.optional(),
      })
      .default({}),
    bibtex: z.string().optional(),
    featured: z.boolean().default(false),
  }),
});

const projects = defineCollection({
  loader: glob({ pattern: '**/*.mdx', base: './src/content/projects' }),
  schema: z.object({
    title: z.string(),
    subtitle: z.string().optional(),
    description: z.string(),
    role: z.string().optional(),
    year: z.number().int(),
    status: z.enum(['active', 'completed', 'paused', 'archived']),
    category: z.enum(['research', 'engineering', 'experiment']),
    tags: z.array(z.string()).default([]),
    links: z
      .object({
        github: linkSchema.optional(),
        paper: linkSchema.optional(),
        demo: linkSchema.optional(),
        report: linkSchema.optional(),
      })
      .default({}),
    featured: z.boolean().default(false),
    cover: z.string().optional(),
  }),
});

const demos = defineCollection({
  loader: glob({ pattern: '**/*.mdx', base: './src/content/demos' }),
  schema: z.object({
    title: z.string(),
    subtitle: z.string().optional(),
    description: z.string(),
    tags: z.array(z.string()).default([]),
    media: z
      .array(
        z.object({
          kind: z.enum(['audio', 'image', 'midi']),
          src: z.string(),
          label: z.string().optional(),
        }),
      )
      .default([]),
    links: z
      .object({
        github: linkSchema.optional(),
        paper: linkSchema.optional(),
        project: linkSchema.optional(),
      })
      .default({}),
    featured: z.boolean().default(false),
  }),
});

const posts = defineCollection({
  loader: glob({ pattern: '**/*.mdx', base: './src/content/posts' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    date: z.coerce.date(),
    updated: z.coerce.date().optional(),
    tags: z.array(z.string()).default([]),
    draft: z.boolean().default(false),
    cover: z.string().optional(),
  }),
});

export const collections = { publications, projects, demos, posts };
