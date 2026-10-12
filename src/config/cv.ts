/**
 * CV data shown on the About page, in English and Chinese. Edited from the admin page
 * (/admin) and stored in src/data/cv.json. Mirrors the CV PDF — update both together.
 */
import type { Text } from '../i18n';
import data from '../data/cv.json';

export interface Entry {
  org: Text;
  orgHref?: string;
  place: Text;
  title: Text;
  advisor?: { name: Text; href: string };
  dates: Text;
  points?: { title: Text; text: Text; href?: string }[];
}

export const RESEARCH_INTERESTS: Text[] = data.interests;
export const EDUCATION: Entry[] = data.education;
export const RESEARCH_EXPERIENCE: Entry[] = data.research;
export const INDUSTRY_EXPERIENCE: Entry[] = data.industry;
export const SKILLS: { area: Text; items: Text }[] = data.skills;
