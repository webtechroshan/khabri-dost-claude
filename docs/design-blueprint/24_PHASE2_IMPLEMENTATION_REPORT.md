# 24 — Phase 2 implementation report

**Approval:** "APPROVED — START PHASE 2 WEBSITE UPGRADE" (5 November 2026).
**Branch:** `claude/phase2-website-upgrade` (based on `claude/design-blueprint-phase1`, which is based on `main` at `6c9b022`).
**Implemented from scratch in this repository.** No code was copied from another Khabri Dost repository.
**Not deployed.** No production data was changed.

## What changed, by roadmap item

| Roadmap | Item | Status | Where | Verified by |
|---|---|---|---|---|
| P0-1 | Removed the public one-click super-admin login and email-only login. Google sign-in only. | Done | `src/context/AuthContext.tsx`, `src/components/StaffLoginModal.tsx` | Code; unit tests for roles; **not** browser-tested (Google sign-in is impossible in the sandbox) |
| P0-2 | Staff list moved from `localStorage` to the Firestore `staff/{email}` collection (Users & roles writes it) | Done | `src/services/newsService.ts`, `src/hooks/useNewsPortalData.ts`, `firestore.rules` | 15 emulator rules tests |
| P0-3 | Server verifies Firebase ID tokens; `requireRole('staff' / 'editor' / 'admin')` on AI, key-check, e-paper upload, webhook and security routes; browser uses `authFetch()` | Done | `server/auth.ts`, `server.ts`, `src/utils/authFetch.ts` | 12 unit tests (bad signature, wrong audience/issuer, expired, unverified email, role levels); curl 401 |
| P0-4 | DOMPurify allow-list sanitiser for all stored HTML; ad code via `AdCode` (AdSense units from IDs, other creatives sanitised, no third-party script execution) | Done | `src/utils/sanitizeHtml.ts`, `src/components/AdCode.tsx` | 22 unit tests incl. `<svg/onload>`, mXSS, `javascript:` |
| P0-5 | Firestore rules rewritten: published-only public reads, private `users`, `staff` roles, validated public creates, admin-only deletes, settings refuse API keys | Done | `firestore.rules`, `firestore.indexes.json` | 15 emulator tests (`npm run test:rules`) |
| P0-6 | Invented content removed or demo-only (`VITE_DEMO_CONTENT=true`); `cleanPortalSettings()` neutralises old placeholder values already saved in the live settings | Done | `src/data/*`, `src/utils/cleanSettings.ts` | 15 unit tests |
| P0-7 | Removed `/api/sitemap/sync-articles` and in-memory `/api/citizen-news/*`; reader tips go to Firestore `submissions` | Done | `server.ts`, `SubmitNewsPageView.tsx` | curl 404; rules tests |
| P1-1 | One route table; clean URLs; 301 for old `?article=`/path aliases; hash links rewritten in the browser; real 404 | Done | `src/utils/routes.ts`, `src/App.tsx`, `server/seo.ts` | unit tests; browser matrix (404 status) |
| P1-2 | Server-rendered `<head>` per URL (title, description, canonical, robots, OG, NewsArticle/Breadcrumb/Organization JSON-LD); same rules in the browser | Done | `src/utils/head.ts`, `server/seo.ts`, `src/hooks/useDocumentHead.ts` | unit tests (escaping, JSON-LD, distinct titles) |
| P1-3 | Tokens and base styles; Noto Sans Devanagari + Noto Sans only (2 families instead of 16) | Done | `src/index.css`, `index.html` | browser: body font Noto on all samples |
| P1-4 | Header ~156px desktop / ~98px phone; only the category bar (desktop) or top bar (phone) sticks; accessible menu dialog; one bottom nav | Done | `src/components/site/SiteHeader.tsx` | browser matrix |
| P1-5 | Homepage: lead + side stories, latest grid, category blocks, video block, 372px sidebar | Done | `src/components/site/HomeView.tsx` | screenshots |
| P1-6 | Article template: one H1, deck, byline/author link, published and updated dates, figure, key points, body, corrections, tags, author box, related; phone share bar replaces bottom nav | Done | `src/components/site/ArticleView.tsx` | browser matrix; screenshots |
| P1-7 | Category, search (noindex), static/policy H1 at 16–17px | Done | `HomeView.tsx`, `LegalPolicyPageView.tsx` et al. | browser matrix |
| P1-8 | Author and tag pages; video listing | Done | `src/components/ListingPageView.tsx` | browser matrix |
| P1-9 | Ad placements with reserved size and label; 336×280, 300×600, 728×90; 350px documented as custom | Done (renders only real, configured ads) | `src/components/site/AdPlacement.tsx` | code; no real ad IDs exist to test |
| P1-10 | Code splitting | Done | `src/App.tsx` | initial JS **≈330 KB gzip** (was ≈985 KB) |
| P1-11 | Reader submissions stored in Firestore | Done | `submissions` collection | rules tests |
| — | Fewer billed reads per visit (newest 60 published articles, media only for staff, no connection-test read) | Done | `newsService.ts` | code |
| P2-1 | Newsroom (admin) rebuilt: 11 screens in one shell — Dashboard, News, Write article, Live coverage, Inbox, Media, Advertisements, SEO & sitemaps, Settings, Audience, Users & roles. English UI, role-aware navigation, only settings that change the site. Replaces the 29-tab panel. | Done | `src/components/newsroom/` | `tests/e2e/newsroom.mjs` (emulator sign-in: admin at 1366 and 390, reporter, reader) |
| P2-2 | One article editor: visual/HTML body, deck, key points, image with alt/credit/caption, byline, SEO fields with search preview and optional AI suggestions, publishing checklist, role-aware actions (reporters: draft / submit for review; editors: publish / schedule / unpublish), revisions with restore, reader-visible corrections | Done | `src/components/newsroom/ArticleEditor.tsx` | newsroom test; rules tests |
| P2-8 | CI on every pull request: typecheck, unit tests, build, Firestore rules, public browser matrix and newsroom test (emulators only) | Done | `.github/workflows/ci.yml`, `scripts/e2e-local.sh` | Runs on GitHub; not run inside this sandbox |
| P2-3 … P2-7 | Server scheduling, Storage uploads, live timeline redesign, category pagination, corrections log page | **Not started** (corrections are shown on articles; scheduled posts publish while an editor has the newsroom open) | — | — |

## Test results (this session)

| Check | Command | Result |
|---|---|---|
| Typecheck | `npm run typecheck` | Pass |
| Unit tests | `npm test` | **82 passed** |
| Firestore rules (emulator) | `npm run test:rules` | **15 passed** |
| Production build | `npm run build` | Pass |
| Browser matrix (15 pages × 14 widths, Chromium emulation, local server + emulator) | `npm run test:e2e` | **2,100 / 2,100 checks passed** |
| Newsroom (admin) test, Auth + Firestore emulators | `npm run test:newsroom` | **Pass** (11 screens, publish, settings, ads, add member, reporter limits, reader refused) |

Browser checks per page and width: HTTP status (404 for unknown), no horizontal overflow, exactly one H1, phone
header ≤ 100px, desktop header ≤ 160px, at most one fixed bottom bar on phones, no text under 12px (except the ad
label), skip-link target present, light background under OS dark mode, no page errors.

## Removed (no longer reachable after the redesign)

Old admin panel (29 tabs), publisher CMS, rich-post editor, settings modal, admin customiser bar, the AI/trends/bulk/typography/spotlight admin tabs, old header, footer, article page, bottom nav, spotlight slider, tickers, trending section, video/photo sections,
gold/rashifal/sudoku widgets, opinion poll, audio player, reactions, e-paper clipping modal, typography customiser
and three unused admin tabs. Git history keeps them. Readers lose: emoji reactions, text-to-speech, the rashifal
widget and the article e-paper clipping. These were marked OPTIONAL in the blueprint and can be rebuilt in the new
style if wanted.

Also removed from the repository: three copies of a third-party newspaper PDF (Dainik Jagran) that was presented
as the Khabri Dost e-paper.

## Important finding during testing

While testing on 5 November 2026 the **production Firebase project answered "Quota limit exceeded"** (free daily
read quota). Local test runs had read from production before this was noticed; they were then moved to the local
Firestore emulator. The old app read every article and every media document on each page view; the new app reads
the newest 60 published articles (media only for staff), which reduces reads per visit substantially. Consider
enabling billing or watching usage in the Firebase console.

## Owner actions (required before or at deployment)

1. Deploy rules and indexes: `firebase deploy --only firestore:rules,firestore:indexes`.
2. Sign in once as an owner account, open **Users & roles**, and add every staff member (old browser-only lists
   are not migrated and no longer work).
3. Articles without a `status` field are no longer public. Open them in the admin and save with a status.
4. Set `SITE_URL` (and optionally `FIREBASE_PROJECT_ID`) in the server environment.
5. Restrict the Firebase browser API key to your domains in Google Cloud console.
6. Review settings in the admin and press Save: old placeholder values are already ignored on the site; saving
   writes the cleaned values.
7. Provide real details that the site now leaves blank instead of inventing: grievance officer, address, phone,
   registration number (if any), author bios and photos, social links, ad codes, logo.
8. Upload the newsroom's own e-paper PDF if the e-paper is used.

## Not verified

- Real Google sign-in (the newsroom is tested through the Auth emulator; a real Google account should be tried once after deployment).
- AI suggestions through the server (needs a real Firebase ID token and a Gemini key; the emulator token is rejected by design).
- Physical devices and real network speeds (emulation only).
- Production behaviour and production data (never accessed for writing; deploy is the owner's step).
- Current Google documentation (network policy blocks it); Search and Discover outcomes are not promised.
