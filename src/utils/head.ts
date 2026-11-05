/**
 * Page <head> data for every route. Shared by the server (first page load, crawlers) and the
 * browser (in-app navigation), so both always agree. No Node or browser APIs here.
 */
import { buildPath, isNoIndex, POLICY_PATHS, type Route } from './routes';

/** The fields of a published article that head tags need. */
export interface HeadArticle {
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
}

export const SITE_NAME = 'खबरी दोस्त';
export const SITE_NAME_EN = 'Khabri Dost';
export const DEFAULT_DESCRIPTION = 'खबरी दोस्त: देश, राज्य, राजनीति, खेल, बिज़नेस और मनोरंजन की ताज़ा हिंदी ख़बरें।';

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

export const clip = (s: string, n: number) => {
  const t = (s || '').replace(/\s+/g, ' ').trim();
  return t.length > n ? `${t.slice(0, n - 1).trimEnd()}…` : t;
};

export const DEFAULT_SITE_URL = 'https://khabridost.com';

const absoluteFor = (base: string) => (url: string) =>
  /^https?:\/\//i.test(url) ? url : `${base}${url.startsWith('/') ? '' : '/'}${url}`;

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

const organizationFor = (base: string) => ({
  '@type': 'NewsMediaOrganization',
  '@id': `${base}/#organization`,
  name: SITE_NAME,
  alternateName: SITE_NAME_EN,
  url: `${base}/`,
  publishingPrinciples: `${base}${POLICY_PATHS.ethics}`,
  correctionsPolicy: `${base}${POLICY_PATHS.corrections}`,
});

const breadcrumbFor = (absolute: (u: string) => string) => (items: Array<{ name: string; path: string }>) => ({
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: items.map((it, i) => ({ '@type': 'ListItem', position: i + 1, name: it.name, item: absolute(it.path) })),
});

/** Head data for a route. `article` is passed for article pages that were found. */
export function headFor(route: Route, article?: HeadArticle | null, siteBase = DEFAULT_SITE_URL): HeadData {
  const absolute = absoluteFor(siteBase);
  const organization = () => organizationFor(siteBase);
  const breadcrumb = breadcrumbFor(absolute);
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
            url: `${siteBase}/`,
            inLanguage: 'hi-IN',
            potentialAction: {
              '@type': 'SearchAction',
              target: `${siteBase}/search?q={search_term_string}`,
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

