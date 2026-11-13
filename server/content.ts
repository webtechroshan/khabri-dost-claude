/**
 * Read-only access to published content for crawlers (head tags, sitemaps, RSS).
 * Uses the Firestore REST API without credentials, so `firestore.rules` only return published articles.
 */
import { firebaseProjectId, firestoreDatabaseId } from './config';

export interface PublicArticle {
  id: string;
  title: string;
  summary: string;
  category: string;
  imageUrl: string;
  imageAltText: string;
  authorName: string;
  tags: string[];
  seoTitle: string;
  seoDescription: string;
  createdAt: string;
  updatedAt: string;
  isBreaking: boolean;
}

type FsValue = {
  stringValue?: string;
  booleanValue?: boolean;
  timestampValue?: string;
  integerValue?: string;
  arrayValue?: { values?: FsValue[] };
};

/** FIRESTORE_EMULATOR_HOST (e.g. 127.0.0.1:8085) points the server at the emulator for local testing. */
const base = () =>
  `${process.env.FIRESTORE_EMULATOR_HOST ? `http://${process.env.FIRESTORE_EMULATOR_HOST}` : 'https://firestore.googleapis.com'}/v1/projects/${firebaseProjectId()}/databases/${encodeURIComponent(firestoreDatabaseId())}/documents`;

const str = (v?: FsValue) => v?.stringValue ?? v?.timestampValue ?? '';

export function toArticle(doc: { name?: string; fields?: Record<string, FsValue>; updateTime?: string }): PublicArticle | null {
  const f = doc.fields || {};
  const id = (doc.name || '').split('/').pop() || '';
  const title = str(f.title).trim();
  if (!id || !title || str(f.status) !== 'published') return null;
  // The date readers and search engines see: when it went live, else when it was created.
  const createdAt = str(f.publishedAt) || str(f.createdAt) || doc.updateTime || '';
  return {
    id,
    title,
    summary: str(f.summary),
    category: str(f.category) || 'national',
    imageUrl: str(f.imageUrl),
    imageAltText: str(f.imageAltText),
    authorName: str(f.authorName),
    tags: (f.tags?.arrayValue?.values || []).map((v) => str(v)).filter(Boolean),
    seoTitle: str(f.seoTitle),
    seoDescription: str(f.seoDescription),
    createdAt,
    updatedAt: str(f.updatedAt) || createdAt,
    isBreaking: f.isBreaking?.booleanValue === true,
  };
}

let listCache: { at: number; items: PublicArticle[] } | null = null;
const LIST_TTL = 5 * 60_000;

/** Up to 500 published articles, newest first. Returns [] when Firestore cannot be reached. */
export async function listPublishedArticles(): Promise<PublicArticle[]> {
  if (listCache && Date.now() - listCache.at < LIST_TTL) return listCache.items;
  if (!firebaseProjectId()) return [];
  try {
    const res = await fetch(`${base()}:runQuery`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        structuredQuery: {
          from: [{ collectionId: 'articles' }],
          where: { fieldFilter: { field: { fieldPath: 'status' }, op: 'EQUAL', value: { stringValue: 'published' } } },
          limit: 500,
        },
      }),
      signal: AbortSignal.timeout(4000),
    });
    if (!res.ok) throw new Error(String(res.status));
    const rows = (await res.json()) as Array<{ document?: Parameters<typeof toArticle>[0] }>;
    const items = rows
      .map((r) => (r.document ? toArticle(r.document) : null))
      .filter((a): a is PublicArticle => !!a)
      .sort((a, b) => Date.parse(b.createdAt || '0') - Date.parse(a.createdAt || '0'));
    listCache = { at: Date.now(), items };
    return items;
  } catch {
    return listCache?.items || [];
  }
}

export type Lookup = { state: 'found'; item: PublicArticle } | { state: 'missing' } | { state: 'unknown' };

const oneCache = new Map<string, { at: number; result: Lookup }>();

/**
 * One published article. `missing` means Firestore answered that it does not exist or is not public;
 * `unknown` means Firestore could not be reached (the page is then served without a 404).
 */
export async function getPublishedArticle(id: string): Promise<Lookup> {
  if (!/^[A-Za-z0-9_-]{1,128}$/.test(id)) return { state: 'missing' };
  if (!firebaseProjectId()) return { state: 'unknown' };
  const hit = oneCache.get(id);
  if (hit && Date.now() - hit.at < LIST_TTL) return hit.result;
  try {
    const res = await fetch(`${base()}/articles/${id}`, { signal: AbortSignal.timeout(3000) });
    let result: Lookup;
    if (res.ok) {
      const item = toArticle(await res.json());
      result = item ? { state: 'found', item } : { state: 'missing' };
    } else if (res.status === 404 || res.status === 403) {
      result = { state: 'missing' };
    } else {
      return { state: 'unknown' };
    }
    oneCache.set(id, { at: Date.now(), result });
    return result;
  } catch {
    return { state: 'unknown' };
  }
}

/** Drop cached article lists (after the scheduler publishes, so sitemaps and pages update at once). */
export function clearContentCache() {
  listCache = null;
  oneCache.clear();
}

/** Test hook. */
export function clearContentCacheForTests() {
  listCache = null;
  oneCache.clear();
}
