/**
 * Central site configuration.
 * Update social links, email, images, and the site URL here — every page reads from this file.
 */
export const SITE = {
  name: 'Ping Wang',
  nameZh: '王平',
  title: 'Ping Wang · AI for Music',
  description:
    'Ping Wang is an undergraduate researcher at the University of Washington working on AI for music: music information retrieval, automatic music transcription, music generation, and post-training. Advised by Prof. Noah A. Smith (UW) and Prof. Yi-Hsuan Yang (NTU).',
  role: 'Undergraduate Researcher · University of Washington',
  tagline: 'AI for Music · Transcription · Generation · Post-training',
  email: 'pingw220@gmail.com',
  cv: '/cv/ping-wang-cv.pdf',

  /** Portrait shown on the home intro and About page (head-and-shoulders square crop). */
  portrait: '/images/profile/ping-wang.jpg',
  ogImage: '/images/og-default.png',

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
  { label: 'Google Scholar', short: 'Scholar', href: SITE.social.scholar, icon: 'scholar' },
  { label: 'GitHub', short: 'GitHub', href: SITE.social.github, icon: 'github' },
  { label: 'LinkedIn', short: 'LinkedIn', href: SITE.social.linkedin, icon: 'linkedin' },
  { label: 'Email', short: 'Email', href: `mailto:${SITE.email}`, icon: 'email' },
  { label: 'CV', short: 'CV', href: SITE.cv, icon: 'cv' },
].filter((link) => link.href) as { label: string; short: string; href: string; icon: IconName }[];

export type IconName = 'scholar' | 'github' | 'linkedin' | 'email' | 'cv';

export const NAV_LINKS = [
  { href: '/about', label: 'About' },
  { href: '/publications', label: 'Publications' },
  { href: '/projects', label: 'Projects' },
  { href: '/posts', label: 'Posts' },
  { href: '/music', label: 'Music' },
] as const;
