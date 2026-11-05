import DOMPurify, { type Config } from 'dompurify';

/**
 * The one HTML sanitiser for article and user HTML. DOM-based (DOMPurify), allow-list only.
 * Never render stored HTML without passing it through `sanitizeArticleHtml()`.
 */

/** Embeds allowed in articles (iframe src must start with one of these). */
const EMBED_PREFIXES = [
  'https://www.youtube.com/embed/',
  'https://www.youtube-nocookie.com/embed/',
  'https://player.vimeo.com/video/',
  'https://www.facebook.com/plugins/',
  'https://platform.twitter.com/embed/',
  'https://www.instagram.com/p/',
];

const CONFIG: Config = {
  ALLOWED_TAGS: [
    'p', 'br', 'hr', 'strong', 'b', 'em', 'i', 'u', 's', 'mark', 'sub', 'sup', 'small', 'span', 'div',
    'a', 'h2', 'h3', 'h4', 'h5', 'ul', 'ol', 'li', 'blockquote', 'q', 'cite', 'code', 'pre',
    'figure', 'figcaption', 'img', 'picture', 'source',
    'table', 'caption', 'thead', 'tbody', 'tfoot', 'tr', 'th', 'td', 'iframe',
  ],
  ALLOWED_ATTR: [
    'href', 'title', 'target', 'rel', 'src', 'srcset', 'sizes', 'alt', 'width', 'height', 'loading',
    'colspan', 'rowspan', 'scope', 'allow', 'allowfullscreen', 'frameborder', 'lang', 'dir', 'type', 'media',
  ],
  ALLOW_DATA_ATTR: false,
  // Only http(s), mailto, tel and in-site links; data: images allowed for legacy inline pictures.
  ALLOWED_URI_REGEXP: /^(?:(?:https?|mailto|tel):|[^a-z]|[a-z+.-]+(?:[^a-z+.\-:]|$))/i,
};

let hooksInstalled = false;
function installHooks() {
  if (hooksInstalled) return;
  hooksInstalled = true;
  DOMPurify.addHook('uponSanitizeElement', (node, data) => {
    if (data.tagName === 'iframe') {
      const src = (node as Element).getAttribute?.('src') || '';
      if (!EMBED_PREFIXES.some((p) => src.startsWith(p))) node.parentNode?.removeChild(node);
    }
  });
  DOMPurify.addHook('afterSanitizeAttributes', (node) => {
    const el = node as Element;
    if (el.tagName === 'A') {
      const href = el.getAttribute('href') || '';
      if (/^https?:\/\//i.test(href)) {
        el.setAttribute('target', '_blank');
        el.setAttribute('rel', 'noopener noreferrer nofollow ugc');
      } else {
        el.removeAttribute('target');
      }
    }
    if (el.tagName === 'IMG') {
      const src = el.getAttribute('src') || '';
      if (!/^(https?:\/\/|\/|data:image\/(png|jpe?g|gif|webp);base64,)/i.test(src)) el.removeAttribute('src');
      if (!el.hasAttribute('loading')) el.setAttribute('loading', 'lazy');
      if (!el.hasAttribute('alt')) el.setAttribute('alt', '');
    }
    if (el.tagName === 'IFRAME') {
      el.setAttribute('loading', 'lazy');
      el.setAttribute('referrerpolicy', 'strict-origin-when-cross-origin');
    }
  });
}

export function sanitizeArticleHtml(html: string | null | undefined): string {
  if (!html) return '';
  installHooks();
  return DOMPurify.sanitize(String(html), CONFIG) as unknown as string;
}

/** Plain text from HTML (for summaries, meta descriptions, counts). */
export function htmlToText(html: string | null | undefined): string {
  if (!html) return '';
  installHooks();
  const clean = DOMPurify.sanitize(String(html), { ALLOWED_TAGS: [], KEEP_CONTENT: true }) as unknown as string;
  const el = document.createElement('textarea');
  el.innerHTML = clean;
  return el.value.replace(/\s+/g, ' ').trim();
}
