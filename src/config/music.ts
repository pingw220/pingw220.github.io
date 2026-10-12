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

export const MUSIC_SECTIONS: { title: string; performances: Performance[] }[] = [
  {
    title: 'Cello solo',
    performances: [
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
        id: 'AgizJ1VHcAQ',
        title: 'Ave Maria (J.S. Bach / Gounod)',
        detail: 'Cello: Ping Wang · Piano: Guang Yang',
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
        id: 'HQPN_eh8qvQ',
        title: 'Piano Trio',
        detail: 'National Student Competition of Music, Senior High School',
      },
      {
        id: 'pU_Oeg8WFM0',
        title: 'Piano Quintet',
        detail: 'National Student Competition of Music, Hsinchu County Chenggong Junior High School',
        date: '2019-03-15',
        award: 'National 3rd place',
      },
      {
        id: 'IquJVmuy5e0',
        title: 'A Dandelion’s Promise (Jay Chou)',
        detail: 'With William Han and Allison Wang',
      },
    ],
  },
  {
    title: 'Orchestra',
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
