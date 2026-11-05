# 22 — SEO, Discover, E-E-A-T and performance specification

Google documentation could not be opened (network blocked). Requirements below are from prior knowledge and must be
re-checked against current Search Central pages before go-live. **No traffic or ranking outcome is promised.**

## SEO

| Item | Existing (measured / code) | Requirement |
|---|---|---|
| `<title>` | Same site title on 9 of 11 page types | Unique per URL, server-rendered: "{headline} – खबरी दोस्त" |
| Meta description | Site-wide | Per article (summary), per category |
| Canonical | `https://khabridost.com` everywhere | Self-referencing absolute URL per page; base URL from config |
| Status codes | Unknown URL → 200 + homepage | 404 page with HTTP 404; 410 for removed articles optional |
| URLs | Hash URLs for e-paper/static pages | Clean paths + 301 from old forms |
| Robots meta | — | `max-image-preview:large` on articles; `noindex` on search, admin, login, thin tag pages |
| Structured data | — (verify) | `NewsArticle` (headline, image ≥1200px wide, datePublished, dateModified, author with URL, publisher with logo), `BreadcrumbList`, `Organization`/`NewsMediaOrganization`, `LiveBlogPosting` for live |
| Open Graph / Twitter | partly from settings | Per article: og:title, og:description, og:image (1200×630+), og:type=article |
| Sitemaps | `/sitemap.xml`, `/news-sitemap.xml` (code) | Published only; news sitemap last 48h; lastmod accurate |
| RSS | `/rss.xml` | Keep; per-category optional |
| Author pages | missing | `/author/{slug}` with real bio |
| Pagination | missing | `?page=n`, self canonical per page |

## Discover / E-E-A-T (no guarantees)

- Large, original lead images (≥ 1200px wide), not stock or AI images presented as real photos.
- Accurate published and updated dates; visible on the page and in JSON-LD.
- Real authors with bios, role and contact; editorial policy, corrections policy, fact-check policy, ownership and
  grievance officer details — **content must come from the owner**; nothing is invented.
- Clear labelling of sponsored and AI-assisted content.
- Remove fabricated items (popup, seed articles, view counts, hashtags).

## Performance

| Metric | Existing | Target (lab, mid-range phone emulation) |
|---|---|---|
| Initial JS | 3.96 MB raw / 985 KB gzip (build of `6c9b022`, measured in an earlier session) | ≤ 350 KB gzip initial; admin, editor, e-paper (pdfjs), AI tools lazy-loaded |
| Fonts | 16 families in one Google Fonts request (`index.html` L37) | 2 families, 3 weights, preconnect + preload |
| Images | some data URLs/base64 | Firebase Storage URLs, `srcset`, `width`/`height`, `loading="lazy"` below the fold, `fetchpriority="high"` on lead |
| Ads | — | Reserved space; load after main content |
| Caching | — (verify) | Hashed assets `immutable`, HTML `no-cache` |
| LCP / CLS / INP | not measured (no field data, network blocked) | LCP < 2.5s, CLS < 0.1, INP < 200ms — to be measured with Lighthouse in Phase 2 |
