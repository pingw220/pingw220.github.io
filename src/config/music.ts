/**
 * Performances shown on the Music page, grouped by section.
 * `id` is the YouTube video id (the part after youtu.be/ or watch?v=).
 * `date` is the performance date from the video title, when it has one.
 */
export interface Performance {
  id: string;
  title: string;
  detail: string;
  date?: string; // 'YYYY-MM-DD'
  award?: string;
}

export interface MusicSection {
  title: string;
  description?: string;
  performances: Performance[];
}

export const MUSIC_SECTIONS: MusicSection[] = [
  {
    title: 'Cello solo',
    performances: [
      {
        id: 'AgizJ1VHcAQ',
        title: 'Ave Maria (J.S. Bach / Gounod)',
        detail: 'Cello: Ping Wang · Piano: Guang Yang',
      },
      {
        id: 'yhQ20vhg5fg',
        title: 'Cello Solo, Senior High School',
        detail: 'National Student Competition of Music',
        date: '2022-03-20',
      },
      {
        id: '4Za3gSi1_kY',
        title: 'Cello Solo (chosen piece)',
        detail: 'National Student Competition of Music',
        date: '2022-03-20',
      },
      {
        id: 'i4_G3LoFnMA',
        title: 'A Thousand Years (Christina Perri)',
        detail: 'Cello remix by Ping Wang',
        date: '2021-06-30',
      },
      {
        id: '-PN8xdWQdKM',
        title: 'Cello Solo (chosen piece)',
        detail: 'National Student Competition of Music',
        date: '2020-03-27',
      },
      {
        id: 'WRSC-dy1oj0',
        title: 'Haydn: Cello Concerto No. 1 in C major, I.',
        detail: 'Hsing-Long Elementary School graduation concert',
        date: '2017-06-10',
      },
      {
        id: 'ehTPZCobCMM',
        title: 'Cello Solo, age 11',
        detail: 'National Student Competition of Music',
        date: '2016-03-16',
      },
    ],
  },
  {
    title: 'Chamber music',
    performances: [
      {
        id: 'HQPN_eh8qvQ',
        title: 'Piano Trio',
        detail: 'National Student Competition of Music, Senior High School',
      },
      {
        id: 'IquJVmuy5e0',
        title: 'A Dandelion’s Promise (Jay Chou)',
        detail: 'With William Han and Allison Wang',
      },
      {
        id: '98n8q_BbJ0c',
        title: 'In Your Presence (Stream of Praise)',
        detail: 'With Allison Wang',
        date: '2021-07-14',
      },
      {
        id: '9-ANdbmj-Qc',
        title: 'Piano Trio (chosen piece)',
        detail: 'National Student Competition of Music, Senior High School',
        date: '2020-12-03',
      },
      {
        id: 'MWImklLDgws',
        title: 'Piano Trio (compulsory piece)',
        detail: 'National Student Competition of Music, Senior High School',
        date: '2020-12-03',
      },
      {
        id: 'pU_Oeg8WFM0',
        title: 'Piano Quintet',
        detail: 'National Student Competition of Music, Hsinchu County Chenggong Junior High School',
        date: '2019-03-15',
        award: 'National 3rd place',
      },
    ],
  },
  {
    title: 'UW Campus Philharmonia Orchestras',
    description: 'Cello in the University of Washington Campus Philharmonia Orchestras, 2023–present.',
    performances: [
      {
        id: 'svMwTcC9u6Y',
        title: 'Elgar: Pomp and Circumstance March No. 1 in D',
        detail: 'Combined orchestras · Zach Banks, conductor',
        date: '2026-05-30',
      },
      {
        id: 'zExqGtxWDns',
        title: 'de Falla: El Amor Brujo — Ritual Fire Dance',
        detail: 'Section B · Zach Banks, conductor',
        date: '2026-05-30',
      },
      {
        id: 'yXiPCGbRrpU',
        title: 'Grieg: Sigurd Jorsalfar, Op. 56 — Triumphal March',
        detail: 'Combined orchestras · Zach Banks, conductor',
        date: '2026-05-30',
      },
      {
        id: 'v__x9Bf7I9A',
        title: 'Grieg: Peer Gynt Suite No. 1 — Morning Mood',
        detail: 'Section B · Zach Banks, conductor',
        date: '2026-05-30',
      },
      {
        id: 'Ypn5z6zaxXM',
        title: 'Massenet: Le Cid — Selections',
        detail: 'Combined orchestras · Robert Stahly, conductor',
        date: '2026-05-30',
      },
      {
        id: '-kMPfAosbrU',
        title: 'Mozart: Overture to Idomeneo, K. 366',
        detail: 'Section B · Zach Banks, conductor',
        date: '2026-03-07',
      },
      {
        id: 'WuBZlAA3zKY',
        title: 'Tchaikovsky: Suite No. 4 in G major, Op. 61 “Mozartiana”',
        detail: 'Section B · Zach Banks, conductor',
        date: '2026-03-07',
      },
      {
        id: 'fGcNDosgpWo',
        title: 'Bizet: L’Arlésienne Suite No. 2',
        detail: 'Section B · Zach Banks, conductor',
        date: '2025-11-22',
      },
      {
        id: 'XPBUfekAnf4',
        title: 'Fauré: Masques et Bergamasques',
        detail: 'Section B · Zach Banks, conductor',
        date: '2025-11-22',
      },
      {
        id: 'NF0Smo3uVrU',
        title: 'Brahms: Hungarian Dance No. 1 in G minor',
        detail: 'Combined orchestras · Robert Stahly, conductor',
        date: '2025-05-31',
      },
      {
        id: 'NlIuUuq4jBg',
        title: 'Brahms: Hungarian Dance No. 5 in G minor',
        detail: 'Combined orchestras · Ryan Farris, conductor',
        date: '2025-05-31',
      },
      {
        id: 'OBjifdTHRFI',
        title: 'Johann Strauss II: Die Fledermaus Overture',
        detail: 'Section A · Ryan Farris, conductor',
        date: '2025-05-31',
      },
      {
        id: 'MxcTHHL55qM',
        title: 'Tchaikovsky: Capriccio Italien, Op. 45',
        detail: 'Combined orchestras · Ryan Farris, conductor',
        date: '2025-05-31',
      },
      {
        id: 'BT3EVuyVrJU',
        title: 'Grieg: Symphonic Dances, Op. 64',
        detail: 'Section A · Ryan Farris, conductor',
        date: '2025-03-08',
      },
      {
        id: 'COqnG4qG9ag',
        title: 'Sibelius: Finlandia, Op. 26',
        detail: 'Section A · Ryan Farris, conductor',
        date: '2025-03-08',
      },
      {
        id: 'Ho-qn4CUxgI',
        title: 'Borodin: Symphony No. 3 in A minor “Unfinished”',
        detail: 'Section A · Ryan Farris, conductor',
        date: '2024-11-23',
      },
      {
        id: 'hcrUvShwPkc',
        title: 'Duparc: Aux étoiles (To the Stars)',
        detail: 'Section A · Ryan Farris, conductor',
        date: '2024-11-23',
      },
      {
        id: '9Z4qxeja9X4',
        title: 'Smetana: Three Dances from The Bartered Bride',
        detail: 'Section A · Ryan Farris, conductor',
        date: '2024-11-23',
      },
      {
        id: 'Axs641OPMsc',
        title: 'Holmès: Ludus pro Patria — La Nuit et l’Amour',
        detail: 'Section A · Daren Weissfisch, conductor',
        date: '2024-05-18',
      },
      {
        id: '8woaNxrf-O4',
        title: 'Moncayo: Huapango',
        detail: 'Combined orchestras · Daren Weissfisch, conductor',
        date: '2024-05-18',
      },
      {
        id: '-n7H4P0dwTY',
        title: 'Dvořák: Symphony No. 8 in G major, Op. 88',
        detail: 'Section A · Daren Weissfisch, conductor',
      },
      {
        id: 'NGwRPUxMRCg',
        title: 'Rimsky-Korsakov: Scheherazade, Op. 35',
        detail: 'Section A · Daren Weissfisch, conductor',
        date: '2023-12-02',
      },
    ],
  },
  {
    title: 'School orchestras',
    performances: [
      {
        id: 'xn3TPRXDgZw',
        title: 'String Orchestra (chosen piece)',
        detail: 'National Student Competition of Music',
        award: 'National Champion',
      },
      {
        id: 'MqtcuYVaLao',
        title: 'Rossini: William Tell Overture',
        detail: 'Hsinchu County Chenggong Junior High School annual concert',
        date: '2019-06-06',
      },
    ],
  },
];
