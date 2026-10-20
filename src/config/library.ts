/**
 * Items on the Playground's library stalls (Novels, Anime, Travel). Edited from the
 * admin page (/admin → Profile & pages → Playground library) and stored in
 * src/data/library.json. Every field except the title is optional.
 */
import type { Text } from '../i18n';
import data from '../data/library.json';

export interface LibraryItem {
  title: Text;
  /** Author, studio, or place. */
  subtitle?: Text;
  /** A sentence or two: why you like it, what happened there. */
  note?: Text;
  /** e.g. '2024' or '2025-08'. */
  date?: string;
  image?: string;
  link?: string;
}

export type LibraryShelf = 'novels' | 'anime' | 'travel';

export const LIBRARY = data as Record<LibraryShelf, LibraryItem[]>;
