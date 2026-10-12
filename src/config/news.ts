/**
 * News items for the home page, newest first.
 *
 * `html` is rendered as-is, so it can contain inline links (<a href="...">).
 * Keep links to your own work, papers, and code; add `[label]` style extras in `links`.
 */
export interface NewsItem {
  date: string; // 'YYYY.MM'
  html: string;
  links?: { label: string; href: string }[];
}

export const NEWS: NewsItem[] = [
  {
    date: '2026.10',
    html: 'New preprint: <a href="https://arxiv.org/abs/2610.03589">Rubric-Based Optimization for Text-to-Music Generation</a>, using audio-language-model rubrics as rewards to post-train music generators.',
    links: [{ label: 'paper', href: 'https://arxiv.org/abs/2610.03589' }],
  },
  {
    date: '2026.08',
    html: 'Open-sourced <a href="/projects/sheetsage-pro">SheetSage-Pro</a>, which turns a song into an editable lead sheet: melody, chords, structure, and aligned lyrics.',
    links: [{ label: 'code', href: 'https://github.com/pingw220/sheetsage-pro' }],
  },
  {
    date: '2026.08',
    html: 'New preprint: <a href="https://arxiv.org/abs/2608.04511">A Dual Evaluation for Music Transcription</a>, judging transcriptions both as notation and as playback, validated with a listening study of 100+ participants.',
    links: [{ label: 'paper', href: 'https://arxiv.org/abs/2608.04511' }],
  },
  {
    date: '2026.05',
    html: 'Joined the <a href="https://affige.github.io/lab.html">Music and AI Lab</a> at National Taiwan University as a student researcher with Prof. <a href="https://affige.github.io/">Yi-Hsuan Yang</a>.',
  },
  {
    date: '2025.08',
    html: 'Joined <a href="https://noahs-ark.github.io/">Noah’s ARK</a> at the University of Washington as a student researcher with Prof. <a href="https://homes.cs.washington.edu/~nasmith/">Noah A. Smith</a>.',
  },
];
