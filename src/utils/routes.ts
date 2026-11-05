/**
 * The single URL map for Khabri Dost. Used by the browser app (to read and write the address bar)
 * and by the server (for <head> tags, HTTP status codes and redirects).
 */

export const CATEGORY_IDS = [
  'national',
  'state',
  'politics',
  'business',
  'entertainment',
  'tech',
  'sports',
  'lifestyle',
  'world',
  'trending',
] as const;

export type PageName =
  | 'home'
  | 'category'
  | 'search'
  | 'article'
  | 'live'
  | 'epaper'
  | 'archive'
  | 'about'
  | 'contact'
  | 'submit-news'
  | 'policy'
  | 'author'
  | 'tag'
  | 'videos'
  | 'not-found';

/** Policy page key → clean path. Keys match the `LegalPolicyPageView` policy names. */
export const POLICY_PATHS = {
  privacy: '/privacy-policy',
  terms: '/terms',
  cookies: '/cookie-policy',
  disclaimer: '/disclaimer',
  grievance: '/grievance-redressal',
  factCheck: '/fact-check-policy',
  ethics: '/editorial-policy',
  corrections: '/corrections-policy',
  dmca: '/dmca',
} as const;

export type PolicyKey = keyof typeof POLICY_PATHS;

const POLICY_ALIASES: Record<string, PolicyKey> = {
  '/terms-of-service': 'terms',
  '/terms-and-conditions': 'terms',
  '/editorial-ethics': 'ethics',
  '/corrections': 'corrections',
  '/dmca-notice': 'dmca',
};

export interface Route {
  page: PageName;
  /** Article id, category id, author name, tag, policy key, or search query depending on page. */
  value?: string;
  /** 1-based page number for listings. */
  pageNumber?: number;
  /** Overlay to open on top of the page. */
  overlay?: 'login' | 'admin' | 'sudoku';
}

/** Old `#hash` links → clean paths. Only meaningful in the browser (servers never see the hash). */
const HASH_TO_PATH: Record<string, string> = {
  '#live': '/live',
  '#live-feed': '/live',
  '#epaper': '/epaper',
  '#about': '/about',
  '#contact': '/contact',
  '#submit-news': '/submit-news',
  '#reporter': '/submit-news',
  '#archive': '/archive',
  '#privacy-policy': '/privacy-policy',
  '#terms-of-service': '/terms',
  '#cookie-policy': '/cookie-policy',
  '#grievance-redressal': '/grievance-redressal',
  '#fact-check-policy': '/fact-check-policy',
  '#editorial-ethics': '/editorial-policy',
  '#disclaimer': '/disclaimer',
  '#corrections': '/corrections-policy',
  '#dmca': '/dmca',
  '#dmca-notice': '/dmca',
  '#admin': '/admin',
  '#/admin': '/admin',
  '#login': '/login',
  '#/login': '/login',
  '#staff': '/login',
  '#sudoku': '/sudoku',
  '#game': '/sudoku',
  '#puzzle': '/sudoku',
};

/** If the URL uses an old form, return the clean URL it should be replaced with; otherwise null. */
export function legacyRedirect(pathname: string, search = '', hash = ''): string | null {
  const params = new URLSearchParams(search);
  const article = params.get('article');
  if (article) return `/article/${encodeURIComponent(article)}`;
  const category = params.get('category');
  if (category && (pathname === '/' || pathname === '')) return `/category/${encodeURIComponent(category.toLowerCase())}`;
  if ((pathname === '/' || pathname === '') && hash) {
    const h = hash.toLowerCase();
    if (HASH_TO_PATH[h]) return HASH_TO_PATH[h];
    if (h.startsWith('#epaper')) return '/epaper';
    if (h.startsWith('#category/')) return `/category/${h.slice('#category/'.length)}`;
    if (h.startsWith('#article-')) return `/article/${h.slice('#article-'.length)}`;
  }
  const lower = pathname.toLowerCase().replace(/\/+$/, '');
  if (lower === '/live-feed') return '/live';
  if (POLICY_ALIASES[lower]) return POLICY_PATHS[POLICY_ALIASES[lower]];
  return null;
}

const safeDecode = (s: string) => {
  try {
    return decodeURIComponent(s);
  } catch {
    return s;
  }
};

/** Parse a pathname + query into a route. Unknown paths give `not-found`. */
export function parseRoute(pathname: string, search = ''): Route {
  const params = new URLSearchParams(search);
  const pageNumber = Math.max(1, Math.floor(Number(params.get('page')) || 1));
  const path = (pathname || '/').replace(/\/+$/, '') || '/';
  const lower = path.toLowerCase();
  const segs = path.split('/').filter(Boolean);

  if (lower === '/') return { page: 'home', pageNumber };
  if (lower === '/search') return { page: 'search', value: (params.get('q') || '').trim(), pageNumber };
  if (segs[0]?.toLowerCase() === 'article' && segs.length === 2) return { page: 'article', value: safeDecode(segs[1]) };
  if (segs[0]?.toLowerCase() === 'category' && segs.length === 2) {
    const id = safeDecode(segs[1]).toLowerCase();
    return (CATEGORY_IDS as readonly string[]).includes(id) ? { page: 'category', value: id, pageNumber } : { page: 'not-found' };
  }
  if ((segs[0]?.toLowerCase() === 'author' || segs[0]?.toLowerCase() === 'tag') && segs.length === 2) {
    const value = safeDecode(segs[1]).trim();
    if (!value) return { page: 'not-found' };
    return { page: segs[0].toLowerCase() as 'author' | 'tag', value, pageNumber };
  }
  switch (lower) {
    case '/live':
    case '/live-feed':
      return { page: 'live' };
    case '/epaper':
      return { page: 'epaper' };
    case '/archive':
      return { page: 'archive', pageNumber };
    case '/about':
      return { page: 'about' };
    case '/contact':
    case '/advertise':
      return { page: 'contact' };
    case '/submit-news':
      return { page: 'submit-news' };
    case '/videos':
      return { page: 'videos' };
    case '/login':
      return { page: 'home', overlay: 'login' };
    case '/admin':
      return { page: 'home', overlay: 'admin' };
    case '/sudoku':
      return { page: 'home', overlay: 'sudoku' };
  }
  const policy = (Object.keys(POLICY_PATHS) as PolicyKey[]).find((k) => POLICY_PATHS[k] === lower) || POLICY_ALIASES[lower];
  if (policy) return { page: 'policy', value: policy };
  return { page: 'not-found' };
}

/** Build the canonical path (with query) for a route. */
export function buildPath(route: Route): string {
  const pageQuery = route.pageNumber && route.pageNumber > 1 ? `page=${route.pageNumber}` : '';
  const withPage = (p: string) => (pageQuery ? `${p}?${pageQuery}` : p);
  switch (route.page) {
    case 'home':
      return withPage('/');
    case 'search':
      return `/search?q=${encodeURIComponent(route.value || '')}${pageQuery ? `&${pageQuery}` : ''}`;
    case 'article':
      return `/article/${encodeURIComponent(route.value || '')}`;
    case 'category':
      return withPage(`/category/${route.value}`);
    case 'author':
    case 'tag':
      return withPage(`/${route.page}/${encodeURIComponent(route.value || '')}`);
    case 'policy':
      return POLICY_PATHS[(route.value as PolicyKey) || 'privacy'] || '/privacy-policy';
    case 'live':
      return '/live';
    case 'archive':
      return withPage('/archive');
    case 'not-found':
      return '/404';
    default:
      return `/${route.page}`;
  }
}

/** Pages that must not be indexed. */
export const isNoIndex = (route: Route) => route.page === 'search' || route.page === 'not-found' || !!route.overlay;
