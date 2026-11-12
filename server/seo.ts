/**
 * Search and sharing: per-URL <head> tags, HTTP status codes, sitemaps, RSS and robots.txt.
 * Only published articles (read through Firestore rules) are ever listed.
 */
import type { Express, Request, Response } from 'express';
import { parseRoute, legacyRedirect, POLICY_PATHS, CATEGORY_IDS, type Route } from '../src/utils/routes';
import { headFor as sharedHeadFor, SITE_NAME, SITE_NAME_EN, CATEGORY_LABELS, DEFAULT_DESCRIPTION, clip, type HeadData } from '../src/utils/head';
import { siteUrl } from './config';
import { listPublishedArticles, getPublishedArticle, type PublicArticle } from './content';

export const escapeHtml = (s: string) =>
  String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

export const escapeXml = escapeHtml;

/** JSON for a <script type="application/ld+json"> block that cannot break out of the tag. */
export const jsonLd = (data: unknown) =>
  `<script type="application/ld+json">${JSON.stringify(data).replace(/</g, '\\u003c')}</script>`;

export { SITE_NAME, SITE_NAME_EN, CATEGORY_LABELS, type HeadData };

/** Head data for a route on this site (base URL from SITE_URL). */
export const headFor = (route: Route, article?: PublicArticle | null): HeadData => sharedHeadFor(route, article, siteUrl());

export function renderHead(h: HeadData): string {
  const tags = [
    `<title>${escapeHtml(h.title)}</title>`,
    `<meta name="description" content="${escapeHtml(h.description)}" />`,
    `<meta name="robots" content="${escapeHtml(h.robots)}" />`,
    h.canonical ? `<link rel="canonical" href="${escapeHtml(h.canonical)}" />` : '',
    `<meta property="og:site_name" content="${escapeHtml(SITE_NAME)}" />`,
    `<meta property="og:locale" content="hi_IN" />`,
    `<meta property="og:type" content="${h.ogType}" />`,
    `<meta property="og:title" content="${escapeHtml(h.title)}" />`,
    `<meta property="og:description" content="${escapeHtml(h.description)}" />`,
    h.canonical ? `<meta property="og:url" content="${escapeHtml(h.canonical)}" />` : '',
    h.image ? `<meta property="og:image" content="${escapeHtml(h.image)}" />` : '',
    h.image && h.imageAlt ? `<meta property="og:image:alt" content="${escapeHtml(h.imageAlt)}" />` : '',
    h.published ? `<meta property="article:published_time" content="${escapeHtml(h.published)}" />` : '',
    h.modified ? `<meta property="article:modified_time" content="${escapeHtml(h.modified)}" />` : '',
    h.section ? `<meta property="article:section" content="${escapeHtml(h.section)}" />` : '',
    `<meta name="twitter:card" content="${h.image ? 'summary_large_image' : 'summary'}" />`,
    ...h.structured.map(jsonLd),
  ];
  return tags.filter(Boolean).join('\n    ');
}

/** Replace the block between the head markers in index.html. */
export function injectHead(template: string, headHtml: string): string {
  const re = /<!--kd:head-->[\s\S]*?<!--\/kd:head-->/;
  return re.test(template) ? template.replace(re, `<!--kd:head-->\n    ${headHtml}\n    <!--/kd:head-->`) : template;
}

export interface PageResult {
  status: number;
  redirect?: string;
  head: HeadData;
}

/** Decide status code, redirect and head tags for a page request. */
export async function resolvePage(pathname: string, search: string): Promise<PageResult> {
  const redirect = legacyRedirect(pathname, search);
  if (redirect && redirect !== pathname) return { status: 301, redirect, head: headFor({ page: 'home' }) };
  const route = parseRoute(pathname, search);
  if (route.page === 'not-found') return { status: 404, head: headFor(route) };
  if (route.page === 'article') {
    const result = await getPublishedArticle(route.value || '');
    if (result.state === 'missing') return { status: 404, head: headFor({ page: 'not-found' }) };
    return { status: 200, head: headFor(route, result.state === 'found' ? result.item : null) };
  }
  return { status: 200, head: headFor(route) };
}

const day = (iso: string) => (iso && !Number.isNaN(Date.parse(iso)) ? new Date(iso).toISOString() : new Date().toISOString());

export function buildSitemap(articles: PublicArticle[]): string {
  const now = new Date().toISOString();
  const urls: Array<{ loc: string; lastmod: string }> = [
    { loc: `${siteUrl()}/`, lastmod: articles[0]?.updatedAt ? day(articles[0].updatedAt) : now },
    ...CATEGORY_IDS.filter((c) => c !== 'trending').map((c) => ({ loc: `${siteUrl()}/category/${c}`, lastmod: now })),
    ...['/live', '/epaper', '/archive', '/about', '/contact', '/submit-news', ...Object.values(POLICY_PATHS)].map((p) => ({
      loc: `${siteUrl()}${p}`,
      lastmod: now,
    })),
    ...articles.map((a) => ({ loc: `${siteUrl()}/article/${encodeURIComponent(a.id)}`, lastmod: day(a.updatedAt) })),
  ];
  return (
    `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
    urls.map((u) => `  <url><loc>${escapeXml(u.loc)}</loc><lastmod>${u.lastmod}</lastmod></url>`).join('\n') +
    `\n</urlset>\n`
  );
}

export function buildNewsSitemap(articles: PublicArticle[], nowMs = Date.now()): string {
  const cutoff = nowMs - 48 * 3600_000;
  const recent = articles.filter((a) => Date.parse(a.createdAt) >= cutoff).slice(0, 1000);
  return (
    `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" ` +
    `xmlns:news="http://www.google.com/schemas/sitemap-news/0.9">\n` +
    recent
      .map(
        (a) =>
          `  <url><loc>${escapeXml(`${siteUrl()}/article/${encodeURIComponent(a.id)}`)}</loc><news:news>` +
          `<news:publication><news:name>${escapeXml(SITE_NAME)}</news:name><news:language>hi</news:language></news:publication>` +
          `<news:publication_date>${day(a.createdAt)}</news:publication_date><news:title>${escapeXml(a.title)}</news:title>` +
          `</news:news></url>`
      )
      .join('\n') +
    `\n</urlset>\n`
  );
}

export function buildRss(articles: PublicArticle[]): string {
  const items = articles.slice(0, 50).map((a) => {
    const link = `${siteUrl()}/article/${encodeURIComponent(a.id)}`;
    return (
      `    <item>\n      <title>${escapeXml(a.title)}</title>\n      <link>${escapeXml(link)}</link>\n` +
      `      <guid isPermaLink="true">${escapeXml(link)}</guid>\n` +
      (a.summary ? `      <description>${escapeXml(clip(a.summary, 300))}</description>\n` : '') +
      `      <category>${escapeXml(CATEGORY_LABELS[a.category] || a.category)}</category>\n` +
      `      <pubDate>${new Date(Date.parse(a.createdAt) || Date.now()).toUTCString()}</pubDate>\n    </item>`
    );
  });
  return (
    `<?xml version="1.0" encoding="UTF-8"?>\n<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">\n  <channel>\n` +
    `    <title>${escapeXml(SITE_NAME)}</title>\n    <link>${escapeXml(siteUrl())}/</link>\n` +
    `    <description>${escapeXml(DEFAULT_DESCRIPTION)}</description>\n    <language>hi</language>\n` +
    `    <atom:link href="${escapeXml(siteUrl())}/rss.xml" rel="self" type="application/rss+xml" />\n` +
    (items.length ? `${items.join('\n')}\n` : '') +
    `  </channel>\n</rss>\n`
  );
}

export const buildRobots = () =>
  `User-agent: *\nAllow: /\nDisallow: /admin\nDisallow: /login\nDisallow: /search\nDisallow: /api/\n\n` +
  `Sitemap: ${siteUrl()}/sitemap.xml\nSitemap: ${siteUrl()}/news-sitemap.xml\n`;

export function registerSeoRoutes(app: Express) {
  const xml = (res: Response, body: string, maxAge: number) => {
    res.setHeader('Content-Type', 'application/xml; charset=utf-8');
    res.setHeader('Cache-Control', `public, max-age=${maxAge}`);
    res.status(200).send(body);
  };
  app.get('/sitemap.xml', async (_req: Request, res: Response) => xml(res, buildSitemap(await listPublishedArticles()), 1800));
  app.get('/news-sitemap.xml', async (_req: Request, res: Response) => xml(res, buildNewsSitemap(await listPublishedArticles()), 600));
  app.get('/rss.xml', async (_req: Request, res: Response) => xml(res, buildRss(await listPublishedArticles()), 900));
  app.get('/robots.txt', (_req: Request, res: Response) => {
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.send(buildRobots());
  });
}
