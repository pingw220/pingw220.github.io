import { getCollection } from 'astro:content';
import type { Lang } from './index';
import { getProjects } from './content';

/**
 * Research = papers + projects. A project that a paper links to (links.project) is
 * shown through the paper, so `projects` holds only the others.
 */
export async function getResearch(lang: Lang) {
  const papers = (await getCollection('publications')).sort((a, b) => b.data.year - a.data.year);
  const paperProjects = new Set(papers.map((p) => p.data.links.project).filter(Boolean));
  const projects = await getProjects(lang, (p) => !paperProjects.has(`/projects/${p.slug}`));
  return { papers, projects };
}
