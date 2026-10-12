import type { Text } from '../i18n';

/**
 * Central site configuration. Your profile (name, role, bio, links, photo, CV) lives in
 * src/data/profile.json so it can be edited from the admin page (/admin); the
 * technical settings below stay here.
 */
import profile from '../data/profile.json';

export const SITE = {
  ...profile,
  title: `${profile.name} ${profile.nameZh}`,
  description: profile.description as Text,
  role: profile.role as Text,
  tagline: profile.tagline as Text,
  bio: profile.bio as { home: { en: string; zh: string }; about: { en: string; zh: string } },

  /** Square image shown when the site is shared in chats and social posts. */
  ogImage: '/images/og-logo.png',

  /**
   * Global Reach visitor map: URL of the Cloudflare Worker in `visitor-api/`.
   * While it is empty, the map shows the sample data in `src/config/visitors.ts`.
   */
  visitorApi: 'https://pingw220-visitor-api.pingw220.workers.dev' as string,
};

/** Profile links shown as the row of pills on the home page, About page, and footer. */
export const PROFILE_LINKS = [
  { label: 'Google Scholar', key: 'link.scholar', href: SITE.social.scholar, icon: 'scholar' },
  { label: 'GitHub', key: 'link.github', href: SITE.social.github, icon: 'github' },
  { label: 'LinkedIn', key: 'link.linkedin', href: SITE.social.linkedin, icon: 'linkedin' },
  { label: 'Email', key: 'link.email', href: `mailto:${SITE.email}`, icon: 'email' },
  { label: 'CV', key: 'link.cv', href: SITE.cv, icon: 'cv' },
].filter((link) => link.href) as {
  label: string;
  key: 'link.scholar' | 'link.github' | 'link.linkedin' | 'link.email' | 'link.cv';
  href: string;
  icon: IconName;
}[];

export type IconName = 'scholar' | 'github' | 'linkedin' | 'email' | 'cv';

/** Header navigation. `href` is the English path; it is localized when rendered. */
export const NAV_LINKS = [
  { href: '/about', key: 'nav.about' },
  { href: '/research', key: 'nav.research' },
  { href: '/posts', key: 'nav.posts' },
  { href: '/music', key: 'nav.music' },
] as const;
