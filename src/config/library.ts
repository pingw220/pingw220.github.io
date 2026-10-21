/**
 * Items on the Playground's library stalls (Novels, Anime, Dramas, Movies, Travel, Sports). Edited from the
 * admin page (/admin → Profile & pages → Playground library) and stored in
 * src/data/library.json. Every field except the title is optional.
 */
import type { Text } from '../i18n';
import data from '../data/library.json';

export interface LibraryItem {
  title: Text;
  /** Your rating out of 5 (halves allowed), e.g. 4.5. */
  rating?: number;
  /** How much you love it, 1–5 hearts. */
  love?: number;
  /** All-time ranking (1 = favorite). Ranked items get the place of honor. */
  rank?: number;
  /** Genre / group, e.g. 武俠 / Wuxia. Items are grouped by it in the 3D worlds. */
  category?: Text;
  /** Your review / thoughts. */
  review?: Text;
  /** Credit for a photo or cover that isn't yours. */
  imageCredit?: { text: string; href?: string };
  /** Travel only: map position and whether it's home. */
  lat?: number;
  lon?: number;
  home?: boolean;
  /** Author, studio, or place. */
  subtitle?: Text;
  /** A sentence or two: why you like it, what happened there. */
  note?: Text;
  /** e.g. '2024' or '2025-08'. */
  date?: string;
  image?: string;
  link?: string;
}

export type LibraryShelf = 'novels' | 'anime' | 'dramas' | 'movies' | 'travel' | 'sports';

export const LIBRARY = data as Record<LibraryShelf, LibraryItem[]>;
