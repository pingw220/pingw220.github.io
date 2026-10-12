/**
 * Central site configuration.
 * Update social links, email, images, and the site URL here — every page reads from this file.
 */
export const SITE = {
  name: 'Peter Wang',
  nameZh: '王平',
  nameRomanized: 'Ping Wang',
  title: 'Peter Wang · AI for Music',
  description:
    'Peter Wang is a music-AI researcher and engineer working on automatic music transcription, music information retrieval, generation, and evaluation. Building systems that listen to, understand, and create music.',
  role: 'Music-AI Researcher & Research Engineer',
  tagline: 'AI for Music · Transcription · Generation · Evaluation',
  oneLiner: 'I build systems that listen to, transcribe, evaluate, and generate music.',
  valueProp:
    'Research thinking paired with engineering execution — from transcription and evaluation methods to the tooling, demos, and datasets that make them usable.',
  email: 'claude.ai.uw@gmail.com',
  cv: '/cv/peter-wang-cv.pdf',

  /** Portrait shown on the home intro and About page (head-centered square crop). */
  portrait: '/images/profile/peter-wang-square.jpg',
  ogImage: '/images/og-default.png',

  social: {
    github: 'https://github.com/pingw220',
    scholar: 'https://scholar.google.com/citations?user=cICbXioAAAAJ',
    linkedin: 'https://www.linkedin.com/in/peter-wang-placeholder', // TODO: replace
  },

  /**
   * Global Reach visitor map. Set this to the URL of the Cloudflare Worker in
   * `visitor-api/` (see its README) to show live visits. While it is empty, the
   * map shows the sample data in `src/config/visitors.ts`.
   */
  visitorApi: 'https://pingw220-visitor-api.pingw220.workers.dev' as string,
} as const;

export const NAV_LINKS = [
  { href: '/about', label: 'About' },
  { href: '/publications', label: 'Publications' },
  { href: '/projects', label: 'Projects' },
  { href: '/demos', label: 'Demos' },
  { href: '/posts', label: 'Posts' },
  { href: '/contact', label: 'Contact' },
] as const;
