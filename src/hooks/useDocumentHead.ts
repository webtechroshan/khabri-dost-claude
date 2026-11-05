import { useEffect } from 'react';
import { headFor, type HeadArticle } from '../utils/head';
import { parseRoute } from '../utils/routes';
import type { NewsArticle } from '../types/news';

const setMeta = (attr: 'name' | 'property', key: string, value?: string) => {
  let el = document.head.querySelector<HTMLMetaElement>(`meta[${attr}="${key}"]`);
  if (!value) {
    el?.remove();
    return;
  }
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.content = value;
};

const setCanonical = (href: string) => {
  let el = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
  if (!href) {
    el?.remove();
    return;
  }
  if (!el) {
    el = document.createElement('link');
    el.rel = 'canonical';
    document.head.appendChild(el);
  }
  el.href = href;
};

export const toHeadArticle = (a: NewsArticle): HeadArticle => ({
  id: a.id,
  title: a.title,
  summary: a.summary || '',
  category: a.category,
  imageUrl: a.imageUrl || '',
  imageAltText: a.imageAltText || '',
  authorName: a.authorName || '',
  tags: a.tags || [],
  seoTitle: a.seoTitle || '',
  seoDescription: a.seoDescription || '',
  createdAt: a.createdAt,
  updatedAt: a.updatedAt || a.createdAt,
});

/**
 * Keeps <title>, description, robots and canonical in step with in-app navigation, using the same
 * rules as the server (`src/utils/head.ts`). `path` is null for a page that keeps the typed URL (404).
 */
export function useDocumentHead(path: string | null, article: NewsArticle | null, notFound: boolean) {
  useEffect(() => {
    const url = new URL(path || window.location.pathname + window.location.search, window.location.origin);
    const route = notFound ? ({ page: 'not-found' } as const) : parseRoute(url.pathname, url.search);
    const h = headFor(route, route.page === 'article' && article ? toHeadArticle(article) : null, window.location.origin.includes('localhost') ? undefined : window.location.origin);
    document.title = h.title;
    setMeta('name', 'description', h.description);
    setMeta('name', 'robots', h.robots);
    setCanonical(h.canonical);
    setMeta('property', 'og:title', h.title);
    setMeta('property', 'og:description', h.description);
    setMeta('property', 'og:url', h.canonical);
    setMeta('property', 'og:type', h.ogType);
    setMeta('property', 'og:image', h.image);
  }, [path, article?.id, article?.title, notFound]);
}
