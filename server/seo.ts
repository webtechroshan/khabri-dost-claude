/**
 * Search and sharing: per-URL <head> tags, HTTP status codes, sitemaps, RSS and robots.txt.
 * Only published articles (read through Firestore rules) are ever listed.
 */
import type { Express, Request, Response } from 'express';
import { parseRoute, legacyRedirect, buildPath, isNoIndex, POLICY_PATHS, CATEGORY_IDS, type Route } from '../src/utils/routes';
import { siteUrl } from './config';
import { listPublishedArticles, getPublishedArticle, type PublicArticle } from './content';

export const SITE_NAME = 'खबरी दोस्त';
export const SITE_NAME_EN = 'Khabri Dost';
const DEFAULT_DESCRIPTION = 'खबरी दोस्त: देश, राज्य, राजनीति, खेल, बिज़नेस और मनोरंजन की ताज़ा हिंदी ख़बरें।';

export const CATEGORY_LABELS: Record<string, string> = {
  national: 'देश',
  state: 'राज्य',
  politics: 'राजनीति',
  business: 'बिज़नेस',
  entertainment: 'मनोरंजन',
  tech: 'टेक',
  sports: 'खेल',
  lifestyle: 'लाइफ़स्टाइल',
  world: 'दुनिया',
  trending: 'ट्रेंडिंग',
};

const POLICY_TITLES: Record<string, string> = {
  privacy: 'गोपनीयता नीति',
  terms: 'उपयोग की शर्तें',
  cookies: 'कुकी नीति',
  disclaimer: 'अस्वीकरण',
  grievance: 'शिकायत निवारण',
  factCheck: 'तथ्य-जांच नीति',
  ethics: 'संपादकीय नीति',
  corrections: 'सुधार नीति',
  dmca: 'DMCA नोटिस',
};

const STATIC_TITLES: Record<string, string> = {
  live: 'लाइव ख़बरें',
  epaper: 'ई-पेपर',
  archive: 'ख़बरों का संग्रह',
  about: 'हमारे बारे में',
  contact: 'संपर्क करें',
  'submit-news': 'ख़बर भेजें',
  videos: 'वीडियो',
};

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

const clip = (s: string, n: number) => {
  const t = (s || '').replace(/\s+/g, ' ').trim();
  return t.length > n ? `${t.slice(0, n - 1).trimEnd()}…` : t;
};

const absolute = (url: string) => (/^https?:\/\//i.test(url) ? url : `${siteUrl()}${url.startsWith('/') ? '' : '/'}${url}`);

export interface HeadData {
  title: string;
  description: string;
  canonical: string;
  robots: string;
  ogType: 'website' | 'article';
  image?: string;
  imageAlt?: string;
  published?: string;
  modified?: string;
  section?: string;
  structured: unknown[];
}

const organization = () => ({
  '@type': 'NewsMediaOrganization',
  '@id': `${siteUrl()}/#organization`,
  name: SITE_NAME,
  alternateName: SITE_NAME_EN,
  url: `${siteUrl()}/`,
  publishingPrinciples: `${siteUrl()}${POLICY_PATHS.ethics}`,
  correctionsPolicy: `${siteUrl()}${POLICY_PATHS.corrections}`,
});

const breadcrumb = (items: Array<{ name: string; path: string }>) => ({
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: items.map((it, i) => ({ '@type': 'ListItem', position: i + 1, name: it.name, item: absolute(it.path) })),
});

/** Head data for a route. `article` is passed for article pages that were found. */
export function headFor(route: Route, article?: PublicArticle | null): HeadData {
  const canonical = absolute(buildPath(route));
  const robots = isNoIndex(route) ? 'noindex, follow' : 'index, follow, max-image-preview:large';
  const base: HeadData = {
    title: `${SITE_NAME} — ताज़ा हिंदी ख़बरें`,
    description: DEFAULT_DESCRIPTION,
    canonical,
    robots,
    ogType: 'website',
    structured: [],
  };

  switch (route.page) {
    case 'home':
      return {
        ...base,
        structured: [
          { '@context': 'https://schema.org', ...organization() },
          {
            '@context': 'https://schema.org',
            '@type': 'WebSite',
            name: SITE_NAME,
            url: `${siteUrl()}/`,
            inLanguage: 'hi-IN',
            potentialAction: {
              '@type': 'SearchAction',
              target: `${siteUrl()}/search?q={search_term_string}`,
              'query-input': 'required name=search_term_string',
            },
          },
        ],
      };
    case 'category': {
      const label = CATEGORY_LABELS[route.value || ''] || route.value || '';
      return {
        ...base,
        title: `${label} की ताज़ा ख़बरें${route.pageNumber && route.pageNumber > 1 ? ` — पेज ${route.pageNumber}` : ''} | ${SITE_NAME}`,
        description: `${label} से जुड़ी ताज़ा हिंदी ख़बरें, अपडेट और विश्लेषण — ${SITE_NAME}।`,
        structured: [breadcrumb([{ name: SITE_NAME, path: '/' }, { name: label, path: buildPath({ page: 'category', value: route.value }) }])],
      };
    }
    case 'article': {
      if (!article) return { ...base, title: `ख़बर | ${SITE_NAME}` };
      const label = CATEGORY_LABELS[article.category] || article.category;
      const description = clip(article.seoDescription || article.summary || article.title, 160);
      const image = article.imageUrl && !article.imageUrl.startsWith('data:') ? absolute(article.imageUrl) : undefined;
      const authorPath = article.authorName ? buildPath({ page: 'author', value: article.authorName }) : undefined;
      return {
        ...base,
        title: `${clip(article.seoTitle || article.title, 90)} | ${SITE_NAME}`,
        description,
        ogType: 'article',
        image,
        imageAlt: article.imageAltText || article.title,
        published: article.createdAt,
        modified: article.updatedAt,
        section: label,
        structured: [
          {
            '@context': 'https://schema.org',
            '@type': 'NewsArticle',
            mainEntityOfPage: { '@type': 'WebPage', '@id': canonical },
            headline: clip(article.title, 110),
            description,
            ...(image ? { image: [image] } : {}),
            datePublished: article.createdAt || undefined,
            dateModified: article.updatedAt || article.createdAt || undefined,
            articleSection: label,
            inLanguage: 'hi-IN',
            ...(article.tags.length ? { keywords: article.tags.join(', ') } : {}),
            ...(article.authorName
              ? { author: [{ '@type': 'Person', name: article.authorName, url: absolute(authorPath!) }] }
              : {}),
            publisher: organization(),
          },
          breadcrumb([
            { name: SITE_NAME, path: '/' },
            { name: label, path: buildPath({ page: 'category', value: article.category }) },
            { name: clip(article.title, 80), path: buildPath(route) },
          ]),
        ],
      };
    }
    case 'author':
      return {
        ...base,
        title: `${route.value} — लेखक | ${SITE_NAME}`,
        description: `${route.value} की लिखी ख़बरें और लेख — ${SITE_NAME}।`,
      };
    case 'tag':
      return {
        ...base,
        title: `#${route.value} — ताज़ा ख़बरें | ${SITE_NAME}`,
        description: `"${route.value}" से जुड़ी ख़बरें — ${SITE_NAME}।`,
      };
    case 'search':
      return { ...base, title: route.value ? `"${clip(route.value, 60)}" के खोज परिणाम | ${SITE_NAME}` : `खोज | ${SITE_NAME}` };
    case 'policy':
      return { ...base, title: `${POLICY_TITLES[route.value || ''] || 'नीति'} | ${SITE_NAME}` };
    case 'not-found':
      return { ...base, title: `पेज नहीं मिला | ${SITE_NAME}`, canonical: '' };
    default:
      return { ...base, title: `${STATIC_TITLES[route.page] || SITE_NAME} | ${SITE_NAME}` };
  }
}

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
