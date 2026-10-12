/**
 * CV data shown on the About page, in English and Chinese. Mirrors
 * public/cv/ping-wang-cv.pdf — update both together.
 */
import type { Text } from '../i18n';
import { LINKS } from './site';

export const RESEARCH_INTERESTS: Text[] = [
  { en: 'Post-training', zh: '後訓練' },
  { en: 'Multimodal Learning', zh: '多模態學習' },
  { en: 'Reinforcement Learning', zh: '強化學習' },
  { en: 'Generative AI', zh: '生成式 AI' },
  { en: 'Music Generation', zh: '音樂生成' },
  { en: 'Automatic Music Transcription', zh: '自動採譜' },
  { en: 'Audio Representation Learning', zh: '音訊表徵學習' },
  { en: 'Symbolic Music Modeling', zh: '符號音樂建模' },
  { en: 'Music Information Retrieval', zh: '音樂資訊檢索' },
];

export interface Entry {
  org: Text;
  orgHref?: string;
  place: Text;
  title: Text;
  advisor?: { name: Text; href: string };
  dates: Text;
  points?: { title: Text; text: Text; href?: string }[];
}

const SEATTLE: Text = { en: 'Seattle, WA', zh: '美國西雅圖' };
const STUDENT_RESEARCHER: Text = { en: 'Student Researcher', zh: '學生研究員' };

export const EDUCATION: Entry[] = [
  {
    org: { en: 'University of Washington', zh: '華盛頓大學' },
    orgHref: LINKS.allenSchool,
    place: SEATTLE,
    title: {
      en: 'B.S. in Computer Science, Paul G. Allen School of Computer Science & Engineering',
      zh: '資訊工程學士，Paul G. Allen 電腦科學與工程學院',
    },
    dates: { en: 'Expected Jun 2027', zh: '預計 2027 年 6 月畢業' },
  },
  {
    org: { en: 'National Experimental High School at Hsinchu Science Park', zh: '國立科學工業園區實驗高級中學' },
    place: { en: 'Hsinchu, Taiwan', zh: '臺灣新竹' },
    title: { en: 'High School', zh: '高中' },
    dates: '2020 – 2023',
  },
];

export const RESEARCH_EXPERIENCE: Entry[] = [
  {
    org: { en: 'Music and AI Lab, National Taiwan University', zh: '臺灣大學 Music and AI Lab' },
    orgHref: LINKS.ntuMusicAi,
    place: { en: 'Taipei, Taiwan', zh: '臺灣臺北' },
    title: STUDENT_RESEARCHER,
    advisor: { name: { en: 'Prof. Yi-Hsuan Yang', zh: '楊奕軒教授' }, href: LINKS.yiHsuanYang },
    dates: { en: 'May 2026 – Present', zh: '2026 年 5 月 – 至今' },
    points: [
      {
        title: 'SheetSage-Pro',
        href: '/projects/sheetsage-pro',
        text: {
          en: 'An audio-to-lead-sheet transcription pipeline that extracts melody, chords, beats, downbeats, meter, and song structure from full-song audio.',
          zh: '從整首歌曲音訊轉出主旋律譜（lead sheet）的採譜流程，擷取旋律、和弦、拍點、強拍、拍號與歌曲段落結構。',
        },
      },
    ],
  },
  {
    org: { en: 'Noah’s ARK, University of Washington', zh: '華盛頓大學 Noah’s ARK' },
    orgHref: LINKS.noahsArk,
    place: SEATTLE,
    title: STUDENT_RESEARCHER,
    advisor: { name: { en: 'Prof. Noah A. Smith', zh: 'Noah A. Smith 教授' }, href: LINKS.noahSmith },
    dates: { en: 'Aug 2025 – Present', zh: '2025 年 8 月 – 至今' },
    points: [
      {
        title: 'A Dual Evaluation for Music Transcription',
        href: '/projects/amt-dual-eval',
        text: {
          en: 'Evaluating transcriptions for both notation accuracy and playback fidelity across 24 pipelines, validated with a listening study of 106 participants and 3,180 pairwise judgments.',
          zh: '同時從樂譜正確性與播放擬真度評估 24 種自動採譜流程，並以 106 位受試者、3,180 筆成對比較的聽測實驗驗證。',
        },
      },
      {
        title: 'Rubric-Based Optimization for Text-to-Music Generation',
        href: '/projects/music-rl',
        text: {
          en: 'Post-training text-to-music models with rubric-based rewards from audio-language models, using preference optimization and RL.',
          zh: '以音訊語言模型的評分標準（rubric）作為獎勵，透過偏好最佳化與強化學習對文字生成音樂模型進行後訓練。',
        },
      },
    ],
  },
  {
    org: { en: 'Ubiquitous Computing Lab, University of Washington', zh: '華盛頓大學 Ubiquitous Computing Lab' },
    orgHref: LINKS.ubicomp,
    place: SEATTLE,
    title: STUDENT_RESEARCHER,
    dates: { en: 'Sep 2024 – Oct 2025', zh: '2024 年 9 月 – 2025 年 10 月' },
    points: [
      {
        title: { en: 'Cough Audio for Health Screening', zh: '咳嗽音訊健康篩檢' },
        href: '/projects/cough-audio',
        text: {
          en: 'Cough-event detection and localization, and tuberculosis risk classification from cough audio with transformer models.',
          zh: '咳嗽事件偵測與定位，以及使用 Transformer 模型從咳嗽音訊進行結核病風險分類。',
        },
      },
      {
        title: { en: 'Embedded Gesture Recognition', zh: '嵌入式手勢辨識' },
        href: '/projects/embedded-gesture-recognition',
        text: {
          en: 'Lightweight, quantized neural networks for real-time gesture recognition on resource-constrained devices.',
          zh: '在資源受限的裝置上，以輕量化、量化的神經網路進行即時手勢辨識。',
        },
      },
    ],
  },
];

export const INDUSTRY_EXPERIENCE: Entry[] = [
  {
    org: { en: 'Amazon', zh: 'Amazon' },
    place: { en: 'Taipei, Taiwan', zh: '臺灣臺北' },
    title: { en: 'Software Development Engineer Intern', zh: '軟體開發工程師實習生' },
    dates: { en: 'Jun 2025 – Sep 2025', zh: '2025 年 6 月 – 2025 年 9 月' },
    points: [
      {
        title: { en: 'Embedded firmware', zh: '嵌入式韌體' },
        text: {
          en: 'Firmware for inter-chip communication, camera-module integration, and Wi-Fi validation on smart-home devices, plus automated tests and peripheral mocks.',
          zh: '為智慧家庭裝置開發晶片間通訊、相機模組整合與 Wi-Fi 驗證的韌體，並建立自動化測試與周邊模擬框架。',
        },
      },
    ],
  },
  {
    org: { en: 'Phison Electronics', zh: '群聯電子' },
    place: { en: 'Miaoli, Taiwan', zh: '臺灣苗栗' },
    title: { en: 'Machine Learning / Embedded Systems Engineer Intern', zh: '機器學習／嵌入式系統工程師實習生' },
    dates: { en: 'Jun 2024 – Aug 2024', zh: '2024 年 6 月 – 2024 年 8 月' },
    points: [
      {
        title: { en: 'LLM memory modeling', zh: '大型語言模型記憶體估算' },
        text: {
          en: 'Estimated LLM memory use (weights and activations) from model configs, analyzing attention architectures and scaling across LLaMA, Mistral, Mixtral, Whisper, and others.',
          zh: '根據模型設定檔估算大型語言模型的記憶體用量（權重與激活值），並分析 LLaMA、Mistral、Mixtral、Whisper 等模型的注意力架構與規模。',
        },
      },
    ],
  },
];

export const SKILLS: { area: Text; items: Text }[] = [
  { area: { en: 'Languages', zh: '程式語言' }, items: 'Python, C, C++, Java' },
  {
    area: { en: 'Machine learning', zh: '機器學習' },
    items: {
      en: 'PyTorch, TensorFlow, Transformers, reinforcement learning, diffusion / flow-matching models, LoRA, RAG',
      zh: 'PyTorch、TensorFlow、Transformers、強化學習、擴散／流匹配模型、LoRA、RAG',
    },
  },
  {
    area: { en: 'Music & audio', zh: '音樂與音訊' },
    items: {
      en: 'Automatic music transcription, music generation, audio representation learning, symbolic music, MIDI, MusicXML',
      zh: '自動採譜、音樂生成、音訊表徵學習、符號音樂、MIDI、MusicXML',
    },
  },
  {
    area: { en: 'Systems', zh: '系統' },
    items: {
      en: 'Linux, Git, distributed and multi-GPU training, embedded systems, FPGA',
      zh: 'Linux、Git、分散式與多 GPU 訓練、嵌入式系統、FPGA',
    },
  },
];
