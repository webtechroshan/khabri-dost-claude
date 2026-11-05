// @vitest-environment jsdom
import { describe, it, expect } from 'vitest';
import { parseRoute, buildPath, legacyRedirect } from '../../src/utils/routes';
import { headFor, renderHead, injectHead, buildSitemap, buildNewsSitemap, buildRss, jsonLd } from '../../server/seo';
import { toArticle, type PublicArticle } from '../../server/content';
import { isArticlePubliclyVisible } from '../../src/utils/articleVisibility';

describe('routes', () => {
  it.each([
    ['/', 'home'],
    ['/category/sports', 'category'],
    ['/category/unknown', 'not-found'],
    ['/article/art_1', 'article'],
    ['/author/राहुल%20शर्मा', 'author'],
    ['/tag/चुनाव', 'tag'],
    ['/search', 'search'],
    ['/live', 'live'],
    ['/epaper', 'epaper'],
    ['/privacy-policy', 'policy'],
    ['/editorial-policy', 'policy'],
    ['/nope/nope', 'not-found'],
    ['/article', 'not-found'],
  ])('%s → %s', (path, page) => {
    expect(parseRoute(path).page).toBe(page);
  });

  it('round-trips paths', () => {
    for (const p of ['/', '/category/sports', '/article/art_1', '/live', '/epaper', '/about', '/privacy-policy', '/terms']) {
      expect(buildPath(parseRoute(p))).toBe(p);
    }
    expect(buildPath(parseRoute('/category/sports', '?page=3'))).toBe('/category/sports?page=3');
    expect(buildPath(parseRoute('/author/A%20B'))).toBe('/author/A%20B');
  });

  it('decodes author names and search queries', () => {
    expect(parseRoute('/author/%E0%A4%B0%E0%A4%BE%E0%A4%AE').value).toBe('राम');
    expect(parseRoute('/search', '?q=बजट').value).toBe('बजट');
  });

  it.each([
    ['/', '?article=abc', '', '/article/abc'],
    ['/', '', '#epaper-2026-10-21', '/epaper'],
    ['/', '', '#live', '/live'],
    ['/', '', '#corrections', '/corrections-policy'],
    ['/', '', '#category/sports', '/category/sports'],
    ['/live-feed', '', '', '/live'],
    ['/terms-of-service', '', '', '/terms'],
    ['/', '', '', null],
    ['/about', '', '', null],
  ])('legacy %s%s%s → %s', (p, s, h, out) => {
    expect(legacyRedirect(p, s, h)).toBe(out);
  });
});

const sample: PublicArticle = {
  id: 'art_1',
  title: 'बजट 2026: <किसानों> के लिए "नई" योजना',
  summary: 'सरकार ने किसानों के लिए नई योजना की घोषणा की।',
  category: 'business',
  imageUrl: 'https://cdn.example/a.jpg',
  imageAltText: 'संसद भवन',
  authorName: 'राम कुमार',
  tags: ['बजट'],
  seoTitle: '',
  seoDescription: '',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  isBreaking: false,
};

describe('head tags', () => {
  it('article head has escaped title, canonical, OG and NewsArticle JSON-LD', () => {
    const h = headFor(parseRoute('/article/art_1'), sample);
    const html = renderHead(h);
    expect(html).toContain('<link rel="canonical" href="https://khabridost.com/article/art_1" />');
    expect(html).toContain('&lt;किसानों&gt;');
    expect(html).not.toContain('<किसानों>');
    expect(html).toContain('<meta property="og:type" content="article" />');
    expect(html).toContain('max-image-preview:large');
    const ld = [...html.matchAll(/<script type="application\/ld\+json">(.*?)<\/script>/g)].map((m) => JSON.parse(m[1]));
    const article = ld.find((d) => d['@type'] === 'NewsArticle');
    expect(article.author[0]).toMatchObject({ name: 'राम कुमार', url: 'https://khabridost.com/author/%E0%A4%B0%E0%A4%BE%E0%A4%AE%20%E0%A4%95%E0%A5%81%E0%A4%AE%E0%A4%BE%E0%A4%B0' });
    expect(article.image).toEqual(['https://cdn.example/a.jpg']);
    expect(ld.some((d) => d['@type'] === 'BreadcrumbList')).toBe(true);
  });

  it('JSON-LD cannot close the script tag', () => {
    expect(jsonLd({ x: '</script><script>alert(1)</script>' })).not.toContain('</script><script>');
  });

  it('search and 404 pages are noindex; 404 has no canonical', () => {
    expect(renderHead(headFor(parseRoute('/search', '?q=x')))).toContain('noindex');
    const nf = renderHead(headFor({ page: 'not-found' }));
    expect(nf).toContain('noindex');
    expect(nf).not.toContain('rel="canonical"');
  });

  it('every page type gets a distinct title', () => {
    const paths = ['/', '/category/sports', '/live', '/epaper', '/about', '/contact', '/privacy-policy', '/terms', '/archive', '/submit-news'];
    const titles = paths.map((p) => headFor(parseRoute(p)).title);
    expect(new Set(titles).size).toBe(paths.length);
  });

  it('injects between markers', () => {
    const t = '<head><!--kd:head--><title>old</title><!--/kd:head--></head>';
    expect(injectHead(t, '<title>new</title>')).toBe('<head><!--kd:head-->\n    <title>new</title>\n    <!--/kd:head--></head>');
  });
});

describe('feeds', () => {
  const parse = (xml: string) => new DOMParser().parseFromString(xml, 'application/xml');
  it('sitemap, news sitemap and RSS are well-formed XML with escaped titles', () => {
    for (const xml of [buildSitemap([sample]), buildNewsSitemap([sample]), buildRss([sample])]) {
      const doc = parse(xml);
      expect(doc.getElementsByTagName('parsererror').length).toBe(0);
    }
    expect(buildRss([sample])).toContain('&lt;किसानों&gt;');
  });
  it('news sitemap only lists the last 48 hours', () => {
    const old = { ...sample, id: 'old', createdAt: new Date(Date.now() - 72 * 3600_000).toISOString() };
    const xml = buildNewsSitemap([sample, old]);
    expect(xml).toContain('/article/art_1');
    expect(xml).not.toContain('/article/old');
  });
});

describe('content mapping and visibility', () => {
  it('only published Firestore documents become public articles', () => {
    const doc = (status?: string) => ({
      name: 'projects/p/databases/d/documents/articles/a1',
      fields: { title: { stringValue: 'शीर्षक' }, ...(status ? { status: { stringValue: status } } : {}) },
    });
    expect(toArticle(doc('published'))?.id).toBe('a1');
    expect(toArticle(doc('draft'))).toBeNull();
    expect(toArticle(doc())).toBeNull();
  });
  it('isArticlePubliclyVisible hides drafts and future-scheduled articles', () => {
    expect(isArticlePubliclyVisible({ status: 'published' })).toBe(true);
    expect(isArticlePubliclyVisible({ status: 'draft' })).toBe(false);
    expect(isArticlePubliclyVisible({ status: undefined })).toBe(false);
    expect(isArticlePubliclyVisible({ status: 'published', scheduledFor: new Date(Date.now() + 3600_000).toISOString() })).toBe(false);
  });
});
