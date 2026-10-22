/**
 * The Interests hub: one block per topic, in the same order as the stalls in the 3D market.
 * Topics with a `page` get their own themed page at /interests/<id>; the others link to an
 * existing page.
 */
export interface Topic {
  id: 'guestbook' | 'music' | 'posts' | 'novels' | 'anime' | 'dramas' | 'movies' | 'travel' | 'sports';
  /** Key of the stall label/blurb in the UI strings (`stall.<key>`). */
  key: 'messages' | 'music' | 'posts' | 'novels' | 'anime' | 'dramas' | 'movies' | 'travel' | 'sports';
  emoji: string;
  /** Two colors for the hub block's gradient. */
  colors: [string, string];
  /** Link for topics without their own page. */
  href?: string;
}

export const TOPICS: Topic[] = [
  { id: 'guestbook', key: 'messages', emoji: '📮', colors: ['#d62828', '#8f1d1d'] },
  { id: 'music', key: 'music', emoji: '🎻', colors: ['#e76f51', '#a8432c'], href: '/music' },
  { id: 'posts', key: 'posts', emoji: '📝', colors: ['#2a9d8f', '#1b6b62'], href: '/posts' },
  { id: 'novels', key: 'novels', emoji: '📚', colors: ['#7b4fa0', '#46285e'] },
  { id: 'anime', key: 'anime', emoji: '🌸', colors: ['#e0529c', '#8e2464'] },
  { id: 'dramas', key: 'dramas', emoji: '📺', colors: ['#2f7f86', '#17474c'] },
  { id: 'movies', key: 'movies', emoji: '🎬', colors: ['#c9971c', '#7a5600'] },
  { id: 'travel', key: 'travel', emoji: '✈️', colors: ['#3fa7d6', '#1b628a'] },
  { id: 'sports', key: 'sports', emoji: '🏆', colors: ['#2a3a78', '#121a3c'] },
];

/** Topics with their own page under /interests/. */
export const TOPIC_PAGES = TOPICS.filter((t) => !t.href);
