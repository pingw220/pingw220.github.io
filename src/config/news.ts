/**
 * News items for the home page, newest first.
 *
 * `html` is rendered as-is (one version per language), so it can contain inline
 * links (<a href="...">). Site-internal links are written in English form
 * (e.g. /projects/x) and localized automatically. Extra `[label]` links go in `links`.
 */
import type { Text } from '../i18n';

export interface NewsItem {
  date: string; // 'YYYY.MM'
  html: { en: string; zh: string };
  links?: { label: Text; href: string }[];
}

const PAPER: Text = { en: 'paper', zh: '論文' };
const CODE: Text = { en: 'code', zh: '程式碼' };

export const NEWS: NewsItem[] = [
  {
    date: '2026.10',
    html: {
      en: 'New preprint: <a href="https://arxiv.org/abs/2610.03589">Rubric-Based Optimization for Text-to-Music Generation</a>, using audio-language-model rubrics as rewards to post-train music generators.',
      zh: '新預印本：<a href="https://arxiv.org/abs/2610.03589">Rubric-Based Optimization for Text-to-Music Generation</a>，以音訊語言模型的評分標準（rubric）作為獎勵訊號，對音樂生成模型進行後訓練。',
    },
    links: [{ label: PAPER, href: 'https://arxiv.org/abs/2610.03589' }],
  },
  {
    date: '2026.08',
    html: {
      en: 'Open-sourced <a href="/projects/sheetsage-pro">SheetSage-Pro</a>, which turns a song into an editable lead sheet: melody, chords, structure, and aligned lyrics.',
      zh: '開源 <a href="/projects/sheetsage-pro">SheetSage-Pro</a>：把一首歌轉成可編輯的主旋律譜（lead sheet），包含旋律、和弦、段落結構與對齊的歌詞。',
    },
    links: [{ label: CODE, href: 'https://github.com/pingw220/sheetsage-pro' }],
  },
  {
    date: '2026.08',
    html: {
      en: 'New preprint: <a href="https://arxiv.org/abs/2608.04511">A Dual Evaluation for Music Transcription</a>, judging transcriptions both as notation and as playback, validated with a listening study of 100+ participants.',
      zh: '新預印本：<a href="https://arxiv.org/abs/2608.04511">A Dual Evaluation for Music Transcription</a>，從「樂譜」與「播放」兩個面向評估自動採譜結果，並以超過 100 位受試者的聽測實驗驗證。',
    },
    links: [{ label: PAPER, href: 'https://arxiv.org/abs/2608.04511' }],
  },
  {
    date: '2026.05',
    html: {
      en: 'Joined the <a href="https://affige.github.io/lab.html">Music and AI Lab</a> at National Taiwan University as a student researcher with Prof. <a href="https://affige.github.io/">Yi-Hsuan Yang</a>.',
      zh: '加入臺灣大學 <a href="https://affige.github.io/lab.html">Music and AI Lab</a>，擔任學生研究員，由<a href="https://affige.github.io/">楊奕軒</a>教授指導。',
    },
  },
  {
    date: '2025.08',
    html: {
      en: 'Joined <a href="https://noahs-ark.github.io/">Noah’s ARK</a> at the University of Washington as a student researcher with Prof. <a href="https://homes.cs.washington.edu/~nasmith/">Noah A. Smith</a>.',
      zh: '加入華盛頓大學 <a href="https://noahs-ark.github.io/">Noah’s ARK</a>，擔任學生研究員，由 <a href="https://homes.cs.washington.edu/~nasmith/">Noah A. Smith</a> 教授指導。',
    },
  },
];
