/**
 * News items for the home page, newest first. Edited from the admin page (/admin) and
 * stored in src/data/news.json. Text is Markdown, one version per language; site links
 * are written in English form (e.g. /projects/x) and localized automatically.
 */
import type { Text } from '../i18n';
import data from '../data/news.json';

export interface NewsItem {
  date: string; // 'YYYY.MM'
  en: string;
  zh: string;
  links?: { label: Text; href: string }[];
}

export const NEWS: NewsItem[] = data.items;
