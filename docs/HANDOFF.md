# Khabri Dost — project handoff

**Updated:** 13 November 2026 · **Repository:** `webtechroshan/khabri-dost-claude` (GitHub) · **Default branch:** `main`

Read this first, then `CLAUDE.md` (rules for working on the code), then `docs/design-blueprint/00_START_HERE.md`.

---

## 1. What the project is

Hindi news website **खबरी दोस्त / Khabri Dost**.

| Part | Technology | Where |
|---|---|---|
| Public site | React 19 single-page app, Vite 8, Tailwind v4 + own design tokens | `src/` (entry `src/main.tsx` → `src/App.tsx`) |
| Server | Express (`server.ts`): page `<head>` per URL, 404/301, sitemaps, RSS, robots, AI routes, e-paper upload, scheduler | `server.ts`, `server/` |
| Database / login | Firebase Firestore (named database) + Firebase Auth (Google) | `src/firebase.ts`, `firestore.rules`, `firestore.indexes.json` |
| Newsroom (admin) | 11 screens + one article editor, English UI | `src/components/newsroom/` |
| Tests | Vitest (unit), Firestore emulator (rules + scheduler), Playwright (browser matrix + newsroom) | `tests/`, `scripts/e2e-local.sh` |
| CI | GitHub Actions on every PR: typecheck, unit, build, rules, browser tests (emulators only) | `.github/workflows/ci.yml` |

Hosting target: a VPS (Hostinger was planned). **Nothing has been deployed by Claude.**

---

## 2. Current state (verified 13 Nov 2026)

| Item | State |
|---|---|
| PR #1 — Phase 2 website upgrade + newsroom + CI | **Merged** into `main` (merge commit `ceb7561`) |
| PR #2 — server-side scheduled publishing + `publishedAt` dates | **Open, not merged**, mergeable, all 3 CI checks green — https://github.com/webtechroshan/khabri-dost-claude/pull/2 (branch `claude/scheduled-publishing`) |
| Latest local test results (PR #2 branch) | typecheck ✓ · 84 unit tests ✓ · build ✓ · 15 rules + 2 scheduler emulator tests ✓ · browser matrix 2,100/2,100 ✓ · newsroom test ✓ · scheduler end-to-end ✓ |
| Production | Not deployed. New Firestore rules **not deployed**. Production Firebase hit its **free daily read quota** during testing on 5 Nov. |
| Old repo `khabaridostcom-glitch/Khabri-Dost` | Obsolete. 7 old commits there were never pushed (no GitHub access). Do not use it as a source. |

### Done so far
- **Phase 1:** audit + full design blueprint and HTML prototypes in `docs/design-blueprint/` (00–23, `visual/`, `components/`).
- **Security:**
  - Google-only staff sign-in, with roles in Firestore `staff/{email}`.
  - The server checks sign-in tokens and roles (`server/auth.ts`, `requireRole`).
  - All stored HTML goes through a DOMPurify sanitiser.
  - Ads render through `AdCode` / `AdPlacement`.
  - `firestore.rules` is rewritten, with 15 emulator tests.
- **Honest content:**
  - No invented articles, people, numbers, IDs, phone or RNI numbers, popups or compliance badges.
  - Sample data appears only with `VITE_DEMO_CONTENT=true`.
  - `cleanPortalSettings()` ignores old fake values that are already saved.
- **URLs and SEO:**
  - Clean URLs (`src/utils/routes.ts`), 301 redirects from old links, real 404s.
  - Per-URL head tags and JSON-LD (`src/utils/head.ts`, `server/seo.ts`).
  - Author, tag and video pages.
  - Sitemaps and RSS list published articles only.
- **Design:**
  - New header, home, article, category, search and footer (`src/components/site/`).
  - Noto fonts only, one H1 per page, nothing under 12px.
  - Initial JavaScript is about 323 KB gzip.
- **Newsroom:** Dashboard, News, Write article, Live coverage, Inbox, Media, Advertisements, SEO & sitemaps, Settings, Audience, Users & roles.
- **Scheduled publishing (PR #2):**
  - Job in `server/scheduler.ts`; it needs `FIREBASE_SERVICE_ACCOUNT_FILE` on the server.
  - `publishedAt` dates are used everywhere readers or search engines see a date.

Full reports: `docs/design-blueprint/24_PHASE2_IMPLEMENTATION_REPORT.md`, `25_SCHEDULED_PUBLISHING.md`.

---

## 3. Known gaps, bugs and unfinished work (the to-do list)

Verified in the code unless marked *(check)*.

### Broken or dead features
1. **Newsletter sign-ups never reach the database.** `handleAddSubscriber` in `src/hooks/useNewsPortalData.ts` only writes `localStorage['kd_subscribers']`. The Audience screen reads Firestore `subscribers`, so it is always empty. There is also no visible sign-up form on the new site.
2. **Unreachable modals are still mounted.** `App.tsx` renders `BookmarksModal`, `ReadLaterModal`, `SubscriberPreferencesModal`, `AllStatesDirectoryModal`, `EPaperModal`, `QuickReadSlidePanel` and `PortalPopup`, but nothing in the new design opens them. `handleOpenQuickRead` is never passed to any card, and only `/sudoku` still opens its modal. Decide for each one: bring it back in the new design, or delete it.
3. **Reader accounts.** Bookmarks and read-later need a signed-in reader, but the new header has no reader sign-in. Decide whether reader accounts are wanted at all.
4. **Legacy ad components.** `AdSlot.tsx` (calls hooks after an early return, which breaks the rules of hooks) and `AdBanner.tsx` are still used by the e-paper pages. Replace them with `AdPlacement`.

### Pages still in the old design
5. These pages still use the old dense Tailwind styling:
   - E-paper (`EPaperPageView.tsx`, `EPaperReader.tsx`, `epaper/*`, clipping modal).
   - Live (`LiveFeedPageView.tsx`).
   - Archive (`ArchivePageView.tsx`).
   - Submit news (`SubmitNewsPageView.tsx`).
   - Policy pages (`LegalPolicyPageView.tsx`, about 1,400 lines, with an old contact and complaint form).
   - Quick-read panel.
   Redesign them with the tokens in `src/index.css` and the `kd-*` components.

### Content and data
6. **Images as base64.** The media library and reader tips can store images as base64 data URLs in Firestore. Move uploads to **Firebase Storage**, with size limits, generated sizes (`srcset`) and Storage rules.
7. **Reader queries only see the newest 60 articles** (`PUBLIC_ARTICLE_LIMIT`). Search, archive and category "show more" therefore only cover those 60. This needs:
   - real pagination with Firestore cursors, per category;
   - server-side or indexed search;
   - an archive by date.
8. **Category pagination with URLs** (`?page=2`) is parsed by the router but not implemented in `HomeView`.
9. **Live blog** has no structured timeline, no `LiveBlogPosting` JSON-LD and no "new updates" button.
10. **Comments** collection rules exist, but there is no comment UI any more. Decide: remove the rules, or build moderated comments.

### Server and security
11. **Large legacy code in `server.ts`** (about 1,280 lines): AI prompt code, a `sanitizeString` regex used on AI inputs, an in-memory rate limiter that trusts `X-Forwarded-For`, and e-paper PDF upload as base64 JSON (60 MB). Split it into modules, accept multipart uploads to Storage, and trust the proxy explicitly.
12. **No Content-Security-Policy header.** Add CSP, `frame-ancestors` and HSTS (at the server or nginx).
13. **AI routes accept a `customApiKey` from the request body.** Review this and prefer server-side keys only.
14. Every sign-in writes a `users/{uid}` reader profile. Check whether that is needed, since each write and read costs quota.
15. **Reads and quota:** after deploying, watch Firestore usage. Consider caching homepage data on the server.

### Admin and newsroom
16. The admin is new but young. Missing pieces:
    - Image upload inside the editor.
    - Bulk actions on the News list.
    - A filter for "my articles".
    - Article locking when two editors edit at once.
    - An unsaved-changes guard when switching screens inside the newsroom.
    - Searching staff by name.
17. **Push notifications and newsletter sending** are not connected to any provider. They are deliberately hidden or labelled.

### Quality, docs and operations
18. **No deployment guide in this repository.** Needed: nginx reverse proxy, PM2 or systemd, `.env`, the service-account file, a backup schedule (Firestore export), and a rollback procedure.
19. **No error monitoring** (e.g. Sentry) and no uptime check.
20. **Accessibility** has only been checked automatically. A manual screen-reader and keyboard pass is still needed, especially on the old pages and in the newsroom.
21. **Lighthouse and Core Web Vitals** have not been measured on a deployed site.
22. **Older docs** in `docs/01_…10_*.md`, `docs/final-audit/`, `docs/audit-discovery/` and `docs/frontend-admin-parity/` are historical and partly wrong. `docs/design-blueprint/02_EXISTING_PROJECT_AUDIT.md` explains which claims are wrong. Consider archiving them.
23. The old design-system prototypes in `docs/design-blueprint/visual/` describe the target design; the live code now differs in small ways.

### Not verifiable inside a Claude cloud session
- Real Google sign-in (tests use the Auth emulator and `window.__kdTestSignIn`, which exists only in local test builds).
- AI suggestions with a real Gemini key and a real Firebase token.
- The scheduler with a real service account.
- Physical phones; the production domain (never test or crawl `khabridost.com`); the production Firestore (use the emulator).

---

## 4. Owner actions (must be done by the site owner, not in code)

1. Deploy rules and indexes: `firebase deploy --only firestore:rules,firestore:indexes`.
2. Turn on Firebase billing (Blaze plan) or watch the quota. The free read quota ran out during testing.
3. Deploy the server. Set `SITE_URL`. For scheduling, set `FIREBASE_SERVICE_ACCOUNT_FILE`; see `docs/design-blueprint/25_SCHEDULED_PUBLISHING.md`.
4. Sign in as an owner (`khabridost.com@gmail.com` or `khabaridost.com@gmail.com`) and add staff in **Users & roles**.
5. Re-save articles that have no `status`; the Dashboard lists them.
6. Restrict the Firebase browser API key to the site's domains in Google Cloud console.
7. Fill in the real details that are currently left blank: grievance officer, address, phone, registration number (if any), author bios, logo, social links, AdSense IDs and policy texts.
8. Merge PR #2 after review.

---

## 5. How to run and test locally

```bash
npm ci
npm run check          # typecheck + unit tests + build
npm run test:rules     # Firestore rules + scheduler tests in the emulator (needs Java)
```

Browser tests (the same as CI, emulators only):
```bash
PROJECT_ID=$(node -p "require('./firebase-applet-config.json').projectId")
npx firebase emulators:exec --only firestore,auth --project "$PROJECT_ID" "bash scripts/e2e-local.sh"
```

To browse a local copy with test data:
1. Start the emulators (firestore and auth).
2. Run `node tests/e2e/seed-emulator.mjs` with `FIRESTORE_EMULATOR_HOST` set.
3. Start `npx tsx server.ts` with `VITE_FIRESTORE_EMULATOR=127.0.0.1:8085` and `VITE_AUTH_EMULATOR=127.0.0.1:9099`.
4. In the browser console, run `window.__kdTestSignIn('admin@example.test')`, then open `/admin`. `editor@example.test` and `reporter@example.test` also work.

---

## 6. Rules for whoever continues

- Follow `CLAUDE.md`. Key points:
  - Firestore rules are the security boundary.
  - No regex sanitisers.
  - No fabricated content.
  - Never test the production domain or the production Firestore.
  - Light theme, Noto fonts, one H1 per page, nothing under 12px.
- Work on a new branch from `main`, run `npm run check` and the emulator tests before each commit, and open a PR. CI must be green.
- Do not deploy and do not merge without the owner's explicit approval.
- Do not invent data (people, numbers, IDs, quotes). Leave fields empty and tell the owner what is needed.
