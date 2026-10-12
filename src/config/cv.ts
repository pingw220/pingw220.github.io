/**
 * CV data shown on the About page. Mirrors public/cv/ping-wang-cv.pdf —
 * update both together.
 */
import { LINKS } from './site';

export const RESEARCH_INTERESTS = [
  'Music Information Retrieval',
  'Music Generation',
  'Automatic Music Transcription',
  'Audio Representation Learning',
  'Multimodal Learning',
  'Reinforcement Learning',
  'Symbolic Music Modeling',
  'Generative AI',
];

export interface Entry {
  org: string;
  orgHref?: string;
  place: string;
  title: string;
  advisor?: { name: string; href: string };
  dates: string;
  points?: { title: string; text: string; href?: string }[];
}

export const EDUCATION: Entry[] = [
  {
    org: 'University of Washington',
    place: 'Seattle, WA',
    title: 'B.S. in Computer Science, Paul G. Allen School of Computer Science & Engineering',
    orgHref: LINKS.allenSchool,
    dates: 'Expected Jun 2027',
  },
];

export const RESEARCH_EXPERIENCE: Entry[] = [
  {
    org: 'Music and AI Lab, National Taiwan University',
    orgHref: LINKS.ntuMusicAi,
    place: 'Taipei, Taiwan',
    title: 'Student Researcher',
    advisor: { name: 'Prof. Yi-Hsuan Yang', href: LINKS.yiHsuanYang },
    dates: 'May 2026 – Present',
    points: [
      {
        title: 'SheetSage-Pro',
        href: '/projects/sheetsage-pro',
        text: 'An audio-to-lead-sheet transcription pipeline that extracts melody, chords, beats, downbeats, meter, and song structure from full-song audio.',
      },
      {
        title: 'Lyrics-to-Song Generation',
        href: '/projects/lyrics-to-song',
        text: 'An end-to-end lyrics-conditioned song generation pipeline that connects symbolic lead-sheet generation with arrangement and audio synthesis.',
      },
    ],
  },
  {
    org: 'Noah’s ARK, University of Washington',
    orgHref: LINKS.noahsArk,
    place: 'Seattle, WA',
    title: 'Student Researcher',
    advisor: { name: 'Prof. Noah A. Smith', href: LINKS.noahSmith },
    dates: 'Aug 2025 – Present',
    points: [
      {
        title: 'A Dual Evaluation for Music Transcription',
        href: '/projects/amt-dual-eval',
        text: 'Evaluating transcriptions for both notation accuracy and playback fidelity across 24 pipelines, validated with a listening study of 106 participants and 3,180 pairwise judgments.',
      },
      {
        title: 'Rubric-Based Optimization for Text-to-Music Generation',
        href: '/projects/music-rl',
        text: 'Post-training text-to-music models with rubric-based rewards from audio-language models, using preference optimization and RL.',
      },
    ],
  },
  {
    org: 'Ubiquitous Computing Lab, University of Washington',
    orgHref: LINKS.ubicomp,
    place: 'Seattle, WA',
    title: 'Student Researcher',
    dates: 'Sep 2024 – Oct 2025',
    points: [
      {
        title: 'Cough Audio for Health Screening',
        href: '/projects/cough-audio',
        text: 'Cough-event detection and localization, and tuberculosis risk classification from cough audio with transformer models.',
      },
      {
        title: 'Embedded Gesture Recognition',
        href: '/projects/embedded-gesture-recognition',
        text: 'Lightweight, quantized neural networks for real-time gesture recognition on resource-constrained devices.',
      },
    ],
  },
];

export const INDUSTRY_EXPERIENCE: Entry[] = [
  {
    org: 'Amazon',
    place: 'Taipei, Taiwan',
    title: 'Software Development Engineer Intern',
    dates: 'Jun 2025 – Sep 2025',
    points: [
      {
        title: 'Embedded firmware',
        text: 'Firmware for inter-chip communication, camera-module integration, and Wi-Fi validation on smart-home devices, plus automated tests and peripheral mocks.',
      },
    ],
  },
  {
    org: 'Phison Electronics',
    place: 'Miaoli, Taiwan',
    title: 'Machine Learning / Embedded Systems Engineer Intern',
    dates: 'Jun 2024 – Aug 2024',
    points: [
      {
        title: 'LLM memory modeling',
        text: 'Estimated LLM memory use (weights and activations) from model configs, analyzing attention architectures and scaling across LLaMA, Mistral, Mixtral, Whisper, and others.',
      },
    ],
  },
];

export const SKILLS = [
  { area: 'Languages', items: 'Python, C, C++, Java' },
  {
    area: 'Machine learning',
    items: 'PyTorch, TensorFlow, Transformers, reinforcement learning, diffusion / flow-matching models, LoRA, RAG',
  },
  {
    area: 'Music & audio',
    items: 'Automatic music transcription, music generation, audio representation learning, symbolic music, MIDI, MusicXML',
  },
  { area: 'Systems', items: 'Linux, Git, distributed and multi-GPU training, embedded systems, FPGA' },
];
