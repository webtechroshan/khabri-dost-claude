import type { NewsArticle } from '../types/news';

/** Sample content is only allowed in demo builds (`VITE_DEMO_CONTENT=true`). */
export const DEMO_CONTENT: boolean =
  typeof import.meta !== 'undefined' && (import.meta as any).env?.VITE_DEMO_CONTENT === 'true';

/** The time readers see as "published": when it went live, else when it was created. */
export const publishedTime = (a: Pick<NewsArticle, 'publishedAt' | 'createdAt'>): string => a.publishedAt || a.createdAt;

/** Readers only ever see published articles whose publish time has arrived. */
export function isArticlePubliclyVisible(a: Pick<NewsArticle, 'status' | 'scheduledFor'> | null | undefined, now = Date.now()): boolean {
  if (!a || a.status !== 'published') return false;
  if (a.scheduledFor) {
    const t = Date.parse(a.scheduledFor);
    if (!Number.isNaN(t) && t > now) return false;
  }
  return true;
}
