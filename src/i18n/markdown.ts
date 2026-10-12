import { marked } from 'marked';
import { localizePath, type Lang } from './index';

/** Point site-internal links (href="/...") at the given language. */
const localizeLinks = (html: string, lang: Lang) =>
  html.replace(/href="(\/[^"]*)"/g, (_, path) => `href="${localizePath(path, lang)}"`);

/** Render Markdown written in the admin (bio, news) to HTML. */
export function renderMarkdown(md: string, lang: Lang, { inline = false } = {}): string {
  const html = inline ? marked.parseInline(md, { async: false }) : marked.parse(md, { async: false });
  return localizeLinks(html, lang);
}
