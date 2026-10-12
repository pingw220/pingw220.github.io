import { visit } from 'unist-util-visit';

/**
 * Media in Markdown posts, so they stay plain Markdown that the admin editor understands:
 *
 *   ![Caption](/media/uploads/song.mp3)   → <audio controls>   (mp3, wav, ogg, m4a, flac, aac)
 *   ![Caption](/media/uploads/clip.mp4)   → <video controls>   (mp4, webm, mov)
 *   https://youtu.be/VIDEO_ID             → embedded YouTube player, when the link is alone in its paragraph
 */
const AUDIO = /\.(mp3|wav|ogg|oga|m4a|flac|aac)(\?.*)?$/i;
const VIDEO = /\.(mp4|webm|mov|m4v)(\?.*)?$/i;

export function youTubeId(url) {
  try {
    const u = new URL(url);
    if (u.hostname === 'youtu.be') return u.pathname.slice(1) || null;
    if (/(^|\.)youtube(-nocookie)?\.com$/.test(u.hostname)) {
      if (u.pathname === '/watch') return u.searchParams.get('v');
      const m = u.pathname.match(/^\/(embed|shorts|live)\/([^/]+)/);
      return m ? m[2] : null;
    }
  } catch {}
  return null;
}

const el = (tagName, properties, children = []) => ({ type: 'element', tagName, properties, children });

const figure = (media, caption) =>
  el('figure', { className: ['media'] }, [
    media,
    ...(caption ? [el('figcaption', {}, [{ type: 'text', value: caption }])] : []),
  ]);

export default function rehypeMedia() {
  return (tree) => {
    // Audio / video files written with image syntax.
    visit(tree, 'element', (node, index, parent) => {
      if (node.tagName !== 'img' || !parent || index === undefined) return;
      const src = String(node.properties?.src ?? '');
      const caption = String(node.properties?.alt ?? '');
      let media = null;
      if (AUDIO.test(src)) media = el('audio', { controls: true, preload: 'metadata', src });
      else if (VIDEO.test(src)) media = el('video', { controls: true, preload: 'metadata', playsInline: true, src });
      if (!media) return;
      // A lone media item replaces its whole paragraph; otherwise replace just the image.
      if (parent.tagName === 'p' && parent.children.filter((c) => !(c.type === 'text' && !c.value.trim())).length === 1) {
        Object.assign(parent, figure(media, caption));
      } else {
        parent.children[index] = media;
      }
    });

    // A YouTube link alone in its paragraph becomes an embedded player.
    visit(tree, 'element', (node) => {
      if (node.tagName !== 'p') return;
      const kids = node.children.filter((c) => !(c.type === 'text' && !c.value.trim()));
      if (kids.length !== 1) return;
      const only = kids[0];
      const url = only.type === 'element' && only.tagName === 'a' ? String(only.properties?.href ?? '') : only.type === 'text' ? only.value.trim() : '';
      const id = youTubeId(url);
      if (!id) return;
      Object.assign(
        node,
        el('div', { className: ['media', 'media-youtube'] }, [
          el('iframe', {
            src: `https://www.youtube-nocookie.com/embed/${encodeURIComponent(id)}?rel=0`,
            title: 'YouTube video',
            loading: 'lazy',
            allow: 'accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture',
            allowFullScreen: true,
          }),
        ]),
      );
    });
  };
}
