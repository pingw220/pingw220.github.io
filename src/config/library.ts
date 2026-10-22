/**
 * Items on the Playground's library stalls (Novels, Anime, Dramas, Movies, Travel, Sports). Edited from the
 * admin page (/admin → Profile & pages → Playground library) and stored in
 * src/data/library.json. Every field except the title is optional.
 */
import { tr, type Text } from '../i18n';
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
  /** Your own photos (uploaded in the admin). The first one is used as the cover. */
  gallery?: string[];
  link?: string;
}

export type LibraryShelf = 'novels' | 'anime' | 'dramas' | 'movies' | 'travel' | 'sports';

export const LIBRARY = data as Record<LibraryShelf, LibraryItem[]>;

/** Ranked favorites (by rank) and the rest grouped by category, keeping each item's index. */
export function groupItems(items: LibraryItem[], lang: 'en' | 'zh') {
  const indexed = items.map((item, index) => ({ item, index }));
  const ranked = indexed.filter(({ item }) => item.rank).sort((a, b) => a.item.rank! - b.item.rank!);
  const groups: { title: string; list: typeof indexed }[] = [];
  for (const entry of indexed) {
    if (entry.item.rank) continue;
    const title = entry.item.category ? tr(entry.item.category, lang) : '';
    let g = groups.find((x) => x.title === title);
    if (!g) groups.push((g = { title, list: [] }));
    g.list.push(entry);
  }
  return { ranked, groups };
}

/** The picture to show for an item: your own first photo, else the cover/photo. */
export const coverOf = (item: LibraryItem): string | undefined => item.gallery?.[0] ?? item.image;
