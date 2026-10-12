/**
 * Minimal i18n: English lives at `/`, Traditional Chinese (Taiwan) at `/zh/`.
 *
 * - `getLang(url)` reads the language from a URL.
 * - `localizePath(path, lang)` builds the link to the same page in a language.
 * - `t(lang)` returns the UI strings below.
 * - `tr(text, lang)` picks the right version of a bilingual `Text` value from the config files.
 */
export const LANGS = ['en', 'zh'] as const;
export type Lang = (typeof LANGS)[number];
export const DEFAULT_LANG: Lang = 'en';

/** BCP 47 tag for <html lang>, hreflang, and date formatting. */
export const HTML_LANG: Record<Lang, string> = { en: 'en', zh: 'zh-Hant-TW' };

/** A string that is either the same in both languages or given per language. */
export type Text = string | { en: string; zh: string };

export const tr = (text: Text, lang: Lang): string => (typeof text === 'string' ? text : text[lang]);

export function getLang(url: URL): Lang {
  return url.pathname === '/zh' || url.pathname.startsWith('/zh/') ? 'zh' : 'en';
}

/** Strip the language prefix: '/zh/about' → '/about'. */
export function stripLang(pathname: string): string {
  const stripped = pathname.replace(/^\/zh(?=\/|$)/, '');
  return stripped === '' ? '/' : stripped;
}

/** Path to `path` (an English-style path like '/about') in `lang`. External URLs and files pass through. */
export function localizePath(path: string, lang: Lang): string {
  if (!path.startsWith('/') || /\.[a-z0-9]+$/i.test(path.split(/[?#]/)[0])) return path;
  if (lang === DEFAULT_LANG) return path;
  return path === '/' ? '/zh/' : `/zh${path}`;
}

/** Space digits from 年/月/日 in Chinese dates (2026 年 10 月 12 日), matching the site's CJK spacing. */
export const spaceCjkDate = (s: string) => s.replace(/(\d)([年月日])/g, '$1 $2').replace(/([年月])(\d)/g, '$1 $2');

export function formatDate(date: Date | string, lang: Lang, month: 'short' | 'long' = 'short'): string {
  const text = new Date(date).toLocaleDateString(HTML_LANG[lang], { year: 'numeric', month, day: 'numeric', timeZone: 'UTC' });
  return lang === 'zh' ? spaceCjkDate(text) : text;
}

const STRINGS = {
  en: {
    'nav.about': 'About',
    'nav.research': 'Research',
    'nav.publications': 'Publications',
    'nav.projects': 'Projects',
    'nav.posts': 'Posts',
    'nav.music': 'Music',
    'lang.switch': '中文',
    'lang.switchLabel': 'Switch to Chinese',
    'theme.toLight': 'Switch to light mode',
    'theme.toDark': 'Switch to dark mode',
    'menu.open': 'Open menu',
    'menu.close': 'Close menu',
    'skip': 'Skip to content',
    'link.scholar': 'Scholar',
    'link.github': 'GitHub',
    'link.linkedin': 'LinkedIn',
    'link.email': 'Email',
    'link.cv': 'CV',
    'home.news': 'News',
    'home.publications': 'Publications',
    'home.allPublications': 'All publications',
    'home.projects': 'Projects',
    'home.allProjects': 'All projects',
    'home.research': 'Research',
    'home.allResearch': 'All research',
    'research.title': 'Research',
    'research.intro': 'Papers and projects in post-training, multimodal learning, and AI for music.',
    'research.papers': 'Publications',
    'research.otherProjects': 'Projects',
    'research.papersNote': 'is shown in bold. Expand a paper for its abstract and BibTeX. Also on',
    'research.allResearch': '← All research',
    'portrait': 'Portrait of',
    'about.title': 'About',
    'about.interests': 'Research interests',
    'about.education': 'Education',
    'about.research': 'Research experience',
    'about.industry': 'Industry experience',
    'about.skills': 'Skills',
    'about.advisor': 'Advisor',
    'pubs.title': 'Publications',
    'pubs.intro.before': 'Papers and preprints in AI for music. Author names are listed as published;',
    'pubs.intro.after': 'is shown in bold. Expand any entry for its abstract and a copy-ready BibTeX citation. Also on',
    'pubs.count': (n: number) => `${n} ${n === 1 ? 'entry' : 'entries'}`,
    'pubs.updated': 'updated',
    'pub.abstract': 'Abstract',
    'pub.bibtex': 'BibTeX',
    'pub.pdf': 'PDF',
    'pub.code': 'Code',
    'pub.demo': 'Demo',
    'pub.project': 'Project',
    'pub.short.paper': 'paper',
    'pub.short.code': 'code',
    'pub.short.demo': 'demo',
    'pub.short.project': 'project',
    'status.published': 'Published',
    'status.accepted': 'Accepted',
    'status.preprint': 'Preprint',
    'status.under-review': 'Under review',
    'status.in-progress': 'In progress',
    'projects.title': 'Projects',
    'projects.intro': 'Research systems, engineering work, and smaller experiments. Click a card for details.',
    'projects.all': '← All projects',
    'projects.role': 'Role:',
    'category.research': 'Research',
    'category.engineering': 'Engineering',
    'category.experiment': 'Experiment',
    'pstatus.active': 'Active',
    'pstatus.completed': 'Completed',
    'pstatus.paused': 'Paused',
    'pstatus.archived': 'Archived',
    'link.paper': 'Paper',
    'link.report': 'Report',
    'posts.title': 'Posts',
    'posts.intro': 'Research notes, opinions, and write-ups.',
    'posts.empty': 'No posts yet — check back soon.',
    'posts.all': '← All posts',
    'posts.updated': 'Updated',
    'filter.topic': 'Topic',
    'filter.year': 'Year',
    'filter.status': 'Status',
    'filter.type': 'Type',
    'filter.all': 'All',
    'filter.none': 'No items match the selected filters.',
    'filter.shown': 'shown',
    'music.title': 'Music',
    'music.intro':
      'I play the cello. These are recordings of my performances: solo, chamber music, and orchestra, from the University of Washington Campus Philharmonia Orchestras and earlier concerts and competitions in Taiwan.',
    'music.play': 'Play',
    'reach.title': 'Global Reach',
    'reach.loading': 'Loading visitor data…',
    'reach.unavailable': 'Visitor data is unavailable right now.',
    'reach.mapLabel': 'World map of where visitors come from',
    'reach.density': 'Visit density',
    'reach.low': 'Low',
    'reach.medium': 'Medium',
    'reach.high': 'High',
    'reach.show': 'Show statistics',
    'reach.hide': 'Hide statistics',
    'reach.countries': 'Top countries',
    'reach.cities': 'Top cities',
    'reach.none': 'No visits yet.',
    'reach.visitors': 'Visitors',
    'reach.visits': 'Visits',
    'reach.countriesCount': 'Countries',
    'reach.note': 'Visitors are counted once per day; visits count every page view.',
    'notFound.title': "This page doesn't exist",
    'notFound.body': "The note you're looking for was never played — or it moved somewhere else.",
    'notFound.home': 'Back to home',
  },
  zh: {
    'nav.about': '關於我',
    'nav.research': '研究',
    'nav.publications': '論文',
    'nav.projects': '專案',
    'nav.posts': '文章',
    'nav.music': '音樂',
    'lang.switch': 'EN',
    'lang.switchLabel': 'Switch to English',
    'theme.toLight': '切換為淺色模式',
    'theme.toDark': '切換為深色模式',
    'menu.open': '開啟選單',
    'menu.close': '關閉選單',
    'skip': '跳至主要內容',
    'link.scholar': 'Scholar',
    'link.github': 'GitHub',
    'link.linkedin': 'LinkedIn',
    'link.email': 'Email',
    'link.cv': '履歷',
    'home.news': '最新消息',
    'home.publications': '論文',
    'home.allPublications': '所有論文',
    'home.projects': '專案',
    'home.allProjects': '所有專案',
    'home.research': '研究',
    'home.allResearch': '所有研究',
    'research.title': '研究',
    'research.intro': '關於後訓練、多模態學習與音樂 AI 的論文與專案。',
    'research.papers': '論文',
    'research.otherProjects': '專案',
    'research.papersNote': '以粗體標示。展開論文可查看摘要與 BibTeX。完整列表也可見於',
    'research.allResearch': '← 所有研究',
    'portrait': '照片：',
    'about.title': '關於我',
    'about.interests': '研究興趣',
    'about.education': '學歷',
    'about.research': '研究經歷',
    'about.industry': '業界經歷',
    'about.skills': '技能',
    'about.advisor': '指導教授',
    'pubs.title': '論文',
    'pubs.intro.before': 'AI 與音樂相關的論文與預印本。作者依發表時的順序列出，',
    'pubs.intro.after': '以粗體標示。展開各篇可查看摘要與 BibTeX 引用格式。完整列表也可見於',
    'pubs.count': (n: number) => `共 ${n} 篇`,
    'pubs.updated': '更新於',
    'pub.abstract': '摘要',
    'pub.bibtex': 'BibTeX',
    'pub.pdf': 'PDF',
    'pub.code': '程式碼',
    'pub.demo': '展示',
    'pub.project': '專案',
    'pub.short.paper': '論文',
    'pub.short.code': '程式碼',
    'pub.short.demo': '展示',
    'pub.short.project': '專案',
    'status.published': '已發表',
    'status.accepted': '已接受',
    'status.preprint': '預印本',
    'status.under-review': '審稿中',
    'status.in-progress': '進行中',
    'projects.title': '專案',
    'projects.intro': '研究系統、工程實作與小型實驗。點選卡片查看詳細內容。',
    'projects.all': '← 所有專案',
    'projects.role': '角色：',
    'category.research': '研究',
    'category.engineering': '工程',
    'category.experiment': '實驗',
    'pstatus.active': '進行中',
    'pstatus.completed': '已完成',
    'pstatus.paused': '暫停',
    'pstatus.archived': '已封存',
    'link.paper': '論文',
    'link.report': '報告',
    'posts.title': '文章',
    'posts.intro': '研究筆記、想法與心得。',
    'posts.empty': '目前還沒有文章，敬請期待。',
    'posts.all': '← 所有文章',
    'posts.updated': '更新於',
    'filter.topic': '主題',
    'filter.year': '年份',
    'filter.status': '狀態',
    'filter.type': '類型',
    'filter.all': '全部',
    'filter.none': '沒有符合篩選條件的項目。',
    'filter.shown': '項顯示中',
    'music.title': '音樂',
    'music.intro':
      '我拉大提琴。以下是我的演出錄影，包括獨奏、室內樂與管弦樂團，有在華盛頓大學 Campus Philharmonia Orchestras 的演出，也有早年在臺灣的音樂會與比賽。',
    'music.play': '播放',
    'reach.title': '全球訪客',
    'reach.loading': '正在載入訪客資料…',
    'reach.unavailable': '目前無法取得訪客資料。',
    'reach.mapLabel': '訪客來源世界地圖',
    'reach.density': '造訪密度',
    'reach.low': '低',
    'reach.medium': '中',
    'reach.high': '高',
    'reach.show': '顯示統計',
    'reach.hide': '隱藏統計',
    'reach.countries': '熱門國家',
    'reach.cities': '熱門城市',
    'reach.none': '目前還沒有造訪紀錄。',
    'reach.visitors': '訪客',
    'reach.visits': '造訪次數',
    'reach.countriesCount': '國家',
    'reach.note': '訪客每天只計算一次；造訪次數計入每一次頁面瀏覽。',
    'notFound.title': '找不到這個頁面',
    'notFound.body': '你要找的這個音符從未被演奏過，或者它已經移到別的地方了。',
    'notFound.home': '回到首頁',
  },
} as const;

/** UI strings with literal types widened to `string`, so both languages share one type. */
type Strings = { [K in keyof (typeof STRINGS)['en']]: (typeof STRINGS)['en'][K] extends string ? string : (typeof STRINGS)['en'][K] };
export type UiKey = keyof Strings;

export function t(lang: Lang): Strings {
  return STRINGS[lang] as unknown as Strings;
}
