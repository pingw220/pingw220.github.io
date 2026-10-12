import type { Text } from '../i18n';

/**
 * Central site configuration.
 * Update social links, email, images, and the site URL here — every page reads from this file.
 */
export const SITE = {
  name: 'Ping Wang',
  nameZh: '王平',
  title: 'Ping Wang 王平',
  description: {
    en: 'Ping Wang is an undergraduate researcher at the University of Washington working on post-training, multimodal learning, and AI for music. Advised by Prof. Noah A. Smith (UW) and Prof. Yi-Hsuan Yang (NTU).',
    zh: '王平是華盛頓大學的大學部學生研究員，研究方向為後訓練（post-training）、多模態學習與音樂 AI，由 Noah A. Smith 教授（華盛頓大學）與楊奕軒教授（臺灣大學）指導。',
  } as Text,
  role: { en: 'Undergraduate Researcher · University of Washington', zh: '華盛頓大學 · 大學部學生研究員' } as Text,
  tagline: { en: 'Post-training · Multimodal Learning · AI for Music', zh: '後訓練 · 多模態學習 · 音樂 AI' } as Text,
  email: 'pingw220@gmail.com',
  cv: '/cv/ping-wang-cv.pdf',

  /** Portrait shown on the home intro and About page (head-and-shoulders square crop). */
  portrait: '/images/profile/ping-wang.jpg',
  /** Square image shown when the site is shared in chats and social posts. */
  ogImage: '/images/og-logo.png',

  /** Leave a URL empty ('') to hide that link everywhere on the site. */
  social: {
    scholar: 'https://scholar.google.com/citations?user=cICbXioAAAAJ',
    github: 'https://github.com/pingw220',
    linkedin: 'https://www.linkedin.com/in/pingw220/',
  },

  /**
   * Global Reach visitor map. Set this to the URL of the Cloudflare Worker in
   * `visitor-api/` (see its README) to show live visits. While it is empty, the
   * map shows the sample data in `src/config/visitors.ts`.
   */
  visitorApi: 'https://pingw220-visitor-api.pingw220.workers.dev' as string,
} as const;

/** People and places linked from the bio, About page, and project pages. */
export const LINKS = {
  noahSmith: 'https://homes.cs.washington.edu/~nasmith/',
  yiHsuanYang: 'https://affige.github.io/',
  noahsArk: 'https://noahs-ark.github.io/',
  ntuMusicAi: 'https://affige.github.io/lab.html',
  ubicomp: 'https://ubicomplab.cs.washington.edu/',
  allenSchool: 'https://www.cs.washington.edu/',
} as const;

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
  { href: '/publications', key: 'nav.publications' },
  { href: '/projects', key: 'nav.projects' },
  { href: '/posts', key: 'nav.posts' },
  { href: '/music', key: 'nav.music' },
] as const;
