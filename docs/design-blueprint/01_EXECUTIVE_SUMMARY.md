# 01 — Executive summary

## In one paragraph

Khabri Dost is a Hindi news site built as a React 19 single-page app with an Express server and Firebase
(Firestore + Auth). It already has a wide feature set — articles, live blogs, an e-paper reader, a large admin panel
with 29 tabs, AI helpers, sitemaps and RSS. The core problems are not missing features but **trust, safety and
focus**: staff sign-in can be bypassed in the browser, the article HTML sanitiser is a regex, every page shares
one title and one canonical URL, unknown URLs show the homepage, fake content (popup, view counts, hashtags,
test ad) appears to readers, and the interface is crowded (a 233–241px sticky header, 2 H1s on most inner pages,
130+ text nodes under 12px on the homepage). The design blueprint proposes a calm, editorial, light-only design that
keeps the existing brand red, Noto Sans Devanagari and the existing information architecture, and a smaller admin
(29 tabs → 11 screens).

## Top findings (all cited in `02_EXISTING_PROJECT_AUDIT.md`)

| # | Finding | Evidence | Severity |
|---|---|---|---|
| 1 | The public `/login` dialog shows a one-click **"log in directly as super admin"** button that creates an admin session with no password or Google check; a second tab signs staff in with an email address alone, checked against a browser-local list | Screenshot `screenshots/existing/login-1366.jpg`; `StaffLoginModal.tsx` L38–42, L258, L269; `AuthContext.tsx` L339 (`loginAsStaffWithEmail`), L371 (`loginAsSuperAdminDirectly`), list in `localStorage['kd_editorial_users']` (L113) | Critical |
| 2 | Staff-only server routes do not verify a Firebase ID token; `/api/citizen-news/list` treats **any** `x-admin-key` / `Authorization` header as admin and returns phone numbers and emails | `server.ts` L1103–1104 | Critical |
| 3 | Article HTML sanitiser is a regex (`sanitizeEditorialHtml`); `<svg/onload=…>` style payloads do not match `\s+on…` | `src/utils/articleContentParser.tsx` L487–498 | High |
| 4 | Ad/footer script HTML is injected raw with `dangerouslySetInnerHTML` from public-read settings | `Footer.tsx` L845, `ArticlePageView.tsx` L2540/L2584, `AdSlot.tsx` L321 | High (admin-controlled) |
| 5 | Firestore: articles **without** a `status` field are public; `users` collection is world-readable; `subscribers`/`inquiries` accept any document shape | `firestore.rules` articles `allow read`, `users` `allow read: if true` | High |
| 6 | Every page has the same `<title>`-style head and canonical `https://khabridost.com`; unknown URLs render the homepage (soft 404) | Verified (browser), 11 page types × 14 widths | High (SEO) |
| 7 | Readers see fabricated content: Gaganyaan "breaking" popup, seed articles with view counts, invented hashtags, a "Testing Ad Banner" | `src/data/portalDefaults.ts` L228, L1130; screenshots `existing/home-*` | High (trust) |
| 8 | Header is 233–241px and fully sticky; on phones it covers ~28% of an 860px screen | Verified (browser) | Medium |
| 9 | Inner pages have 2–3 H1 elements (article 2, e-paper 3) | Verified (browser) | Medium |
| 10 | Body text renders in **Mukta**, although earlier reports state Noto Sans Devanagari; `index.html` loads 16 font families | `index.html` L37, L77; Verified (browser) | Medium |
| 11 | Admin has 29 tabs, several overlapping (two ad tabs, three header/footer/nav places, two typography places) | `src/components/AdminBackendPanel.tsx` L801–900 | Medium |
| 12 | API keys are kept in the admin's `localStorage` (they are correctly stripped before Firestore writes) | `src/services/newsService.ts` L660–690 | Medium |

## What is good and should be kept

- The Firestore rules have a default-deny catch-all and owner-only bookmarks/read-later.
- Settings saves strip raw API keys before writing to the public `settings` collection.
- There is no horizontal overflow at any of the 14 tested widths, and no console errors besides blocked network.
- Server has a rate limiter on `/api/*` and dynamic `/sitemap.xml`, `/news-sitemap.xml`, `/rss.xml`, `/robots.txt`.
- The brand red `#dc2626` and a light theme are already the defaults.

## Proposed direction (summary)

**Minimal Editorial News**: white page, one brand red, cool neutrals, Noto Sans Devanagari + Noto Sans only,
a 1280px container with a 372px sidebar, a ~154px desktop / ~96px phone header that is **not** fully sticky, one
bottom bar on phones, one H1 per page, real per-URL SEO, and an admin reduced to 11 screens with a clean
article editor. Details: `13_DESIGN_DIRECTION.md`, prototypes in `visual/`.

## What was not possible in this session

| Item | Reason | Impact |
|---|---|---|
| Competitor and Google-documentation research | Sandbox network policy blocks all external hosts | `12_REFERENCE_RESEARCH.md` contains a protocol and no competitor claims |
| Seeing the existing admin UI | Google sign-in cannot complete in the sandbox | Admin findings are from code; marked "Not visually verified" |
| Physical-device testing | Only Chromium emulation available | Responsive results are emulation only |
| Production checks | Forbidden by the brief | Nothing was sent to `khabridost.com` |

## Decision needed

Read `23_APPROVAL_AND_UPGRADE_PLAN.md` and reply `APPROVED — START PHASE 2 WEBSITE UPGRADE` (optionally with
changes). Until then no application code will be modified.
