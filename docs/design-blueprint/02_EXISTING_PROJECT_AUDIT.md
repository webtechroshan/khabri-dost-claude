# 02 — Existing project audit (master index)

**Date:** 5 November 2026 · **Commit audited:** `6c9b022` · **Method:** source reading + headless Chromium against the
local dev server (`PORT=3300 npx tsx server.ts`), 11 page types × 14 widths, `colorScheme: 'dark'` emulation.

This file **supersedes** the earlier report sets for decision making. The earlier files are kept unchanged:

| Earlier set | Files | Status after this audit |
|---|---|---|
| `KHABRI_DOST_AUDIT_REPORT.md` | 1 | Historical. Several claims contradicted (below). |
| `docs/01–10_*.md` | 10 | Historical inventory; file maps still useful. |
| `docs/audit-discovery/` | 10 | Historical. |
| `docs/final-audit/` | 13 | Historical. Its "PASS" table is contradicted in several rows. |
| `docs/frontend-admin-parity/` | 2 | Historical; useful list of customisation settings. |

## Classification legend

| Label | Meaning |
|---|---|
| **Verified working** | Code and/or browser show it works as described. |
| **Implemented but defective** | Exists, but does not do what the claim says, or is unsafe. |
| **Partially implemented** | Some of the claim is true. |
| **Documented, not implemented** | Claimed, but no code found. |
| **Missing** | Needed but neither claimed nor present. |
| **Duplicated** | Two or more implementations of the same thing. |
| **Unnecessary** | Present but adds risk or noise without value for readers. |
| **Unable to verify** | Could not be checked in this sandbox (sign-in, network, real devices). |

## A. Verification of earlier claims

Claims quoted from `docs/final-audit/00_EXECUTIVE_SUMMARY.md` (FA-00) and
`docs/final-audit/11_TEST_RESULTS_AND_UNRESOLVED_ISSUES.md` (FA-11).

| # | Earlier claim | Source | Classification | Evidence |
|---|---|---|---|---|
| C1 | "Complete Noto Sans Devanagari & Latin tokens" / typography verified | FA-00 §2 | **Partially implemented** | Tokens in `src/index.css` L14–51 use Noto, but `index.html` L77 sets `font-['Mukta']` on `<body>` and `index.css` L107/L116 fall back to Mukta. Measured body font on all 154 page/width samples: `Mukta, sans-serif`. |
| C2 | "100% light mode enforced" | FA-00 §2 | **Verified working** | `index.html` L11 `color-scheme: light`; `index.css` L4; 0 `dark:` classes in `src/**/*.tsx`; body background `rgb(248,250,252)` under emulated OS dark mode. |
| C3 | "Security & Authorization: PASS (Hardened)" | FA-00 §2 | **Implemented but defective** | Public `/login` dialog offers one-click super-admin login (`StaffLoginModal.tsx` L38–42, L258, L269 → `AuthContext.tsx` L371). Email-only staff login (`AuthContext.tsx` L339) against `localStorage['kd_editorial_users']` (L113). Screenshot `screenshots/existing/login-1366.jpg`. |
| C4 | "verified strict RBAC … default-deny catch-all" | FA-00 §2 | **Partially implemented** | Default deny present (`firestore.rules` L4–6). But: articles with no `status` field are public (L61); `users` is world-readable (L128); `subscribers` and `inquiries` accept any shape (`allow create: if isValidId(...)`); admin emails hard-coded in rules and in `AuthContext.tsx` L8–9. |
| C5 | "Zero exposure of private service keys … in frontend client bundles" | FA-00 §3.4 | **Partially implemented** | `savePortalSettings` strips `geminiApiKey` etc. before Firestore (`newsService.ts` L668–683) ✔, but the full object incl. keys is written to `localStorage['kd_portal_settings']` (L663) in the admin's browser. |
| C6 | "XSS sanitization enforced" | FA-00 §3.4 | **Implemented but defective** | `sanitizeEditorialHtml` (`articleContentParser.tsx` L487–498) is a regex. Attribute handlers not preceded by whitespace (e.g. `<svg/onload=…>`) and `<iframe>`/`<embed>`/`<style>` are not removed. Raw HTML from settings is injected in `Footer.tsx` L845, `ArticlePageView.tsx` L2540/L2584, `AdSlot.tsx` L321. |
| C7 | "Server-side rate limiter active on /api/* (80 req / 60 s)" | FA-00 §3.4 | **Verified working** (code) | `server.ts` L70. In-memory, per process. |
| C8 | Staff-only API routes protected | implied FA-00 | **Implemented but defective** | No Firebase ID-token verification in `server.ts`. `/api/citizen-news/list` treats any `x-admin-key` or `Authorization` header as admin and returns unredacted phone/email (L1103–1110). AI routes callable by anyone (L187, L337, L577, L844, L1124). |
| C9 | "Express serves live dynamic sitemap, news sitemap, RSS, robots" | FA-00 §2 | **Verified working** (code) | `server.ts` L1355, L1455, L1496, L1530. URLs hard-code `https://khabridost.com`. |
| C10 | "SEO & Google News: PASS (GNP Ready)" | FA-00 §2 | **Implemented but defective** | Measured: canonical `https://khabridost.com` on every page incl. articles; one shared title on 9 of 11 page types; unknown URL renders the homepage with HTTP 200 (soft 404). No per-URL server-rendered `<head>`. |
| C11 | "Mobile Ad vs Nav Non-Collision — PASSED" | FA-11 | **Partially implemented** | No overlap measured, but article pages show **2** fixed bottom bars on phones (measured), and a "Testing Ad Banner" is shown by default (`portalDefaults.ts` L441). |
| C12 | "Verified across viewports from 320px to 1920px" | FA-00 §3.3 | **Verified working** (no overflow) | 0px horizontal overflow on all 154 samples. Emulation only. |
| C13 | "Complete lifecycle (Draft, Preview, Schedule, Publish, Update, Delete)" | FA-00 §2 | **Unable to verify** (UI) / **Partially implemented** (code) | Admin needs Google sign-in. Scheduling has no server job; scheduled items depend on a browser being open. |
| C14 | Build "PASSED" | FA-11 L16 | **Verified working** (earlier session, same commit) | Production build of commit `6c9b022`: 3.96 MB JS, 985 KB gzip initial. Not re-run in this session. |
| C15 | "Zero ascender/descender clipping on complex matras" | FA-11 L24 | **Unable to verify** fully | Spot checks in screenshots show no clipping; "high-zoom optical inspection" cannot be reproduced. |

## B. New findings by area (not in earlier reports, or contradicting them)

### Public site (Verified browser, emulated widths)

| ID | Finding | Classification | Evidence |
|---|---|---|---|
| F1 | Header 233–241px, entire header sticky | Implemented but defective (usability) | `existing-metrics` table in `20_RESPONSIVE_DESIGN_SPEC.md` |
| F2 | H1 count: article 2, e-paper 3, live/about/privacy/submit/archive 2 | Implemented but defective | same |
| F3 | 124–143 text nodes under 12px on home/login | Implemented but defective (legibility) | same |
| F4 | Gaganyaan "breaking" popup on first visit (fabricated news) | Unnecessary / trust risk | `portalDefaults.ts` L228; `existing/home-375.jpg` |
| F5 | Seed articles mixed with real posts, with invented view counts (e.g. 4250, 2820, 7820) | Unnecessary / trust risk | `seedNews.ts` L231/L255/L281; `App.tsx` L46 imports `INITIAL_NEWS` |
| F6 | Test article "aaaa…" visible on homepage | Data issue | `existing/home-1366.jpg` |
| F7 | 16 font families requested on every page | Implemented but defective (performance) | `index.html` L37 |
| F8 | Unknown URL → homepage (soft 404) | Missing | `existing/unknown-url-*.jpg` |
| F9 | E-paper uses `#epaper` hash URL | Implemented but defective (SEO) | `App.tsx` L859 |
| F10 | No author pages, no tag pages, no video/photo listing pages | Missing | `App.tsx` routing L520–600 |

### Admin (code only — **Not visually verified**)

| ID | Finding | Classification | Evidence |
|---|---|---|---|
| A1 | 29 tabs in one 3,963-line component | Duplicated / too large | `AdminBackendPanel.tsx` L801–900 |
| A2 | Ads configured in 3 places: `monetization`, `sidebar_ads`, Header & Footer › "Ad Slots & Scripts" | Duplicated | L874, L875; `HeaderFooterSettingsTab.tsx` L590 |
| A3 | Header/nav in `settings_header`, mobile drawer in `mobile_sidebar`, bottom nav in `mobile_footer`, footer in `settings_footer` | Consolidate | L853–880 |
| A4 | Typography in `typography` tab and `TypographyCustomizerModal` | Duplicated | `TypographySettingsTab.tsx`, `TypographyCustomizerModal.tsx` |
| A5 | Push notifications and newsletter sending are UI only — no sending backend | Documented, not implemented | `AdminBackendPanel.tsx` L887; no push/email route in `server.ts` |
| A6 | Editorial team list stored in `localStorage` | Implemented but defective | `AuthContext.tsx` L113 |
| A7 | Two editors (`PublisherCMS.tsx` 1,841 lines; `RichPostEditorModal.tsx`; `WordPressVisualEditor.tsx`) | Duplicated | files listed |

### Backend / data (code)

| ID | Finding | Classification | Evidence |
|---|---|---|---|
| B1 | Citizen submissions held in server memory (`citizenSubmissionsStore`) — lost on restart | Implemented but defective | `server.ts` L1026–1120 |
| B2 | E-paper PDF upload route accepts base64 in a 60 MB JSON body; no auth | Implemented but defective | `server.ts` L72, L1302 |
| B3 | `/api/security/audit-report` is public | Unnecessary | `server.ts` L1171 |
| B4 | `/api/ai/google-trends` returns generated data, not Google Trends | Implemented but defective (naming) | `server.ts` L825 |

## C. What is solid

- Default-deny Firestore rules, owner-only bookmarks and read-later.
- API keys stripped before Firestore writes.
- No horizontal overflow at 14 widths; no console errors besides blocked network requests.
- Light theme is consistent; brand red already the default.
- Sitemaps and RSS exist and escape XML.

## D. What could not be verified

| Item | Reason |
|---|---|
| Admin UI appearance and flows | Google sign-in impossible in sandbox. The direct super-admin button was **not** used. |
| Production data, production rules deployment | Production access forbidden |
| Physical devices, real network speed, Core Web Vitals in the field | Emulation only |
| Competitor features, current Google documentation | External network blocked (see `12_REFERENCE_RESEARCH.md`) |
