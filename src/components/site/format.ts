import type { NewsArticle } from '../../types/news';
import { CATEGORY_LABELS } from '../../utils/head';

export const articleHref = (a: Pick<NewsArticle, 'id'>) => `/article/${encodeURIComponent(a.id)}`;
export const categoryHref = (id: string) => (id === 'all' ? '/' : `/category/${id}`);
export const authorHref = (name: string) => `/author/${encodeURIComponent(name)}`;
export const tagHref = (tag: string) => `/tag/${encodeURIComponent(tag.replace(/^#/, ''))}`;

export const categoryLabel = (id: string, custom?: Record<string, string>) => custom?.[id] || CATEGORY_LABELS[id] || id;

/** "5 मिनट पहले", "3 घंटे पहले", "2 दिन पहले", else a date like "5 नवंबर 2026". */
export function timeAgo(iso?: string, now = Date.now()): string {
  const t = Date.parse(iso || '');
  if (Number.isNaN(t)) return '';
  const s = Math.max(0, Math.round((now - t) / 1000));
  if (s < 60) return 'अभी';
  if (s < 3600) return `${Math.floor(s / 60)} मिनट पहले`;
  if (s < 86400) return `${Math.floor(s / 3600)} घंटे पहले`;
  if (s < 7 * 86400) return `${Math.floor(s / 86400)} दिन पहले`;
  return fullDate(iso);
}

export function fullDate(iso?: string, withTime = false): string {
  const t = Date.parse(iso || '');
  if (Number.isNaN(t)) return '';
  return new Date(t).toLocaleString('hi-IN', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    ...(withTime ? { hour: 'numeric', minute: '2-digit' } : {}),
    timeZone: 'Asia/Kolkata',
  });
}

/** Image URL usable in a card; drops stock-photo placeholders and empty values. */
export const cardImage = (a: Pick<NewsArticle, 'imageUrl'>) => (a.imageUrl && a.imageUrl.trim() ? a.imageUrl : '');
