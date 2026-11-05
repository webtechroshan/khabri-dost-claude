# 05 — Proposed sitemap

Principles: every reader-facing view gets a clean, shareable, crawlable URL; one canonical per page; unknown paths
return a real 404 page with HTTP 404; old URLs keep working through redirects.

## Public

| URL | Page | Prototype | Index? | Status vs today |
|---|---|---|---|---|
| `/` | Home | `visual/homepage-desktop.html` | Yes | IMPROVE |
| `/category/{slug}` | Category, paginated `?page=2` | `visual/category-page.html` | Yes | IMPROVE |
| `/category/{slug}/{state}` *(optional)* | State/region within category | category template | Yes | OPTIONAL |
| `/article/{slug-or-id}` | Article (standard, live, photo, video, opinion variants) | `visual/article-desktop.html`, `article-variants.html` | Yes | IMPROVE |
| `/live` (alias `/live-feed`) | All live coverage | `visual/live-news-page.html` | Yes | IMPROVE |
| `/videos` | Video listing | `visual/video-page.html` | Yes | MISSING |
| `/photos` | Photo galleries listing | video template variant | Yes | MISSING |
| `/epaper`, `/epaper/{date}` | E-paper edition | `visual/epaper-page.html` | Yes (edition pages) | IMPROVE (no hash) |
| `/author/{slug}` | Author profile + articles | `visual/author-page.html` | Yes, when real bio exists | MISSING |
| `/tag/{tag}` | Tag listing | category template | Yes if ≥ N articles, else noindex | MISSING |
| `/search?q=` | Search results | `visual/search-page.html` | **No** (noindex) | IMPROVE |
| `/archive` | Archive by date | category template | Yes | IMPROVE |
| `/about`, `/contact`, `/advertise` | Static pages | `visual/static-page.html` | Yes | IMPROVE |
| `/editorial-policy`, `/corrections-policy`, `/fact-check-policy`, `/privacy-policy`, `/terms`, `/cookie-policy`, `/disclaimer`, `/grievance-redressal`, `/dmca` | Policy pages | `visual/static-page.html` | Yes | IMPROVE (real content needed from owner) |
| `/submit-news` | Reader submission | static template + form | Yes | IMPROVE |
| `/sudoku` | Puzzle | — | No | OPTIONAL |
| anything else | 404 page, HTTP 404 | `components/empty-loading-error-states.html` | No | MISSING |

## Staff (never indexed)

| URL | Screen | Prototype |
|---|---|---|
| `/login` | Google sign-in only | `components/modals.html` |
| `/admin` | Dashboard | `visual/admin-dashboard.html` |
| `/admin/news`, `/admin/news/new`, `/admin/news/{id}` | List, editor | `visual/admin-news-list.html`, `admin-editor.html` |
| `/admin/media` | Media, videos, photos, e-paper | `visual/admin-media.html` |
| `/admin/ads` | Advertisements | `visual/admin-advertisements.html` |
| `/admin/settings/{section}` | Consolidated settings | `visual/admin-settings.html` |

## Redirects (301)

| Old | New |
|---|---|
| `/?article={id}` | `/article/{id}` |
| `/#live`, `/#live-feed` | `/live` |
| `/#epaper…` | `/epaper` |
| `/#about`, `/#contact`, `/#submit-news`, `/#reporter`, `/#archive` | matching clean path |
| `/#privacy-policy` … `/#dmca-notice` | matching policy path |
| `/#category/{x}` | `/category/{x}` |
| `/#admin`, `/#login` | `/admin`, `/login` |

Hash redirects must happen in the browser (servers never receive the hash); path redirects happen on the server.

## Sitemaps

`/sitemap.xml` (index) → `sitemap-pages.xml`, `sitemap-categories.xml`, `sitemap-articles-{yyyy-mm}.xml`;
`/news-sitemap.xml` (last 48 hours, published only); `/image-sitemap.xml` optional; `/rss.xml` and
`/category/{slug}/rss.xml` optional. Base URL from configuration, not hard-coded.
