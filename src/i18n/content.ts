import { getCollection, type CollectionEntry } from 'astro:content';
import type { Lang } from './index';

/**
 * Projects live in src/content/projects/{en,zh}/<slug>.mdx. Both languages share
 * the slug, so /projects/x and /zh/projects/x are the same project.
 */
export type Project = CollectionEntry<'projects'> & { slug: string };

export async function getProjects(lang: Lang, filter?: (p: Project) => boolean): Promise<Project[]> {
  const all = await getCollection('projects', ({ id }) => id.startsWith(`${lang}/`));
  const projects = all.map((p) => Object.assign(p, { slug: p.id.slice(lang.length + 1) }));
  return (filter ? projects.filter(filter) : projects).sort((a, b) => b.data.year - a.data.year);
}
