/**
 * Performances shown on the Music page, grouped by section. Edited from the admin page
 * (/admin) and stored in src/data/music.json.
 * `id` is the YouTube video id (the part after youtu.be/ or watch?v=).
 */
import type { Text } from '../i18n';
import data from '../data/music.json';

export interface Performance {
  id: string;
  title: Text;
  detail: Text;
  date?: string; // 'YYYY-MM-DD'
  award?: Text;
}

export interface MusicSection {
  title: Text;
  description?: Text;
  performances: Performance[];
}

export const MUSIC_SECTIONS: MusicSection[] = data.sections;
