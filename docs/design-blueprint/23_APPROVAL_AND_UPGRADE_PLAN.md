# 23 — Approval and upgrade plan

Phase 2 begins only after the written approval **`APPROVED — START PHASE 2 WEBSITE UPGRADE`**. Changes to this
plan can be included in the same message. Phase 2 work will happen on a separate branch, with `npm run check` and
the 14-width browser matrix before each commit, and no deployment.

## Roadmap

Complexity: **S** small · **M** medium · **L** large. No time estimates.

### P0 — safety and trust (before any visual change goes live)

| # | Item | Files | Complexity | Acceptance |
|---|---|---|---|---|
| P0-1 | Remove super-admin direct button and email-only login; Google sign-in only | `StaffLoginModal.tsx`, `AuthContext.tsx` | M | Only invited Google accounts reach admin |
| P0-2 | Staff invites + roles in Firestore (replace `localStorage` list) | `AuthContext.tsx`, `firestore.rules`, admin Users screen | M | Rules tests pass |
| P0-3 | Server ID-token verification + `requireRole()` on staff routes; `authFetch()` | `server.ts`, new `server/` helpers | M | 401/403 for missing/wrong role |
| P0-4 | DOM-based sanitiser for article HTML; ad code via provider IDs, not raw HTML | `articleContentParser.tsx`, `AdSlot.tsx`, `Footer.tsx`, `ArticlePageView.tsx` | M | Sanitiser unit tests incl. `<svg/onload>` |
| P0-5 | Firestore rules: published-only public reads, private `users`, validated creates | `firestore.rules` | S | Emulator rules tests |
| P0-6 | Remove fabricated defaults (popup, seed articles, view counts, hashtags, test ad) behind `VITE_DEMO_CONTENT` | `portalDefaults.ts`, `seedNews.ts`, `App.tsx` | S | Clean homepage with only real posts |
| P0-7 | Remove `/api/sitemap/sync-articles`; protect `/api/security/audit-report`, `/api/citizen-news/list` | `server.ts` | S | curl checks |

### P1 — reader experience and SEO

| # | Item | Complexity |
|---|---|---|
| P1-1 | Route table, clean URLs, 301s for hash URLs, real 404 | M |
| P1-2 | Server-rendered per-URL head (title, description, canonical, OG, JSON-LD) | M |
| P1-3 | Tokens + base styles in `src/index.css`; Noto only; 2 font families | S |
| P1-4 | New header (desktop ~154px, phone ~96px), drawer, bottom nav, breaking band | M |
| P1-5 | Homepage: static lead, grids, sidebar 372px, section headings | M |
| P1-6 | Article template: single H1, byline/dates, figure, body type, share bar, tags, author box, related | M |
| P1-7 | Category, search (noindex), static page template (17px/700 H1) | M |
| P1-8 | Author and tag pages | M |
| P1-9 | Ad slot component with reserved sizes; sidebar 336×280 / 300×600 / custom 350 | M |
| P1-10 | Code splitting (admin, editor, e-paper, AI) | M |
| P1-11 | Citizen submissions in Firestore | S |

### P2 — admin and quality

| # | Item | Complexity |
|---|---|---|
| P2-1 | Admin shell + 11 screens (consolidation map) | L |
| P2-2 | One editor (visual + HTML), publishing checklist, revisions | L |
| P2-3 | Server-side scheduled publishing | M |
| P2-4 | Image uploads to Firebase Storage, `srcset`, width/height | M |
| P2-5 | Live page timeline + `LiveBlogPosting` | M |
| P2-6 | Video/photo listing pages, category pagination | M |
| P2-7 | Corrections notes and log | S |
| P2-8 | E2E matrix + rules tests in CI | M |

### P3 — optional

Push notifications and newsletter sending (needs a provider), web stories, admin on phones, rashifal/sudoku/poll
polish, per-category RSS.

## Owner inputs needed (cannot be invented)

Real logo files; publisher legal name, address, registration (if any); grievance officer; About, editorial,
corrections, fact-check policies; author bios and photos; real ad codes; which reference sites to research.

---

## Phase 1 approval summary (20 points)

| # | Point | Where |
|---|---|---|
| 1 | Phase 1 changed **no** application code, CSS, rules, schema or data; only `docs/design-blueprint/` was added | git diff of branch |
| 2 | Audited repository: `webtechroshan/khabri-dost-claude` at `6c9b022` | `02_EXISTING_PROJECT_AUDIT.md` |
| 3 | 15 earlier claims checked and classified: 4 defective, 4 only partly true, 2 unable to verify | `02` §A |
| 4 | **Critical:** public one-click super-admin login and email-only staff login | `02` C3, `screenshots/existing/login-1366.jpg` |
| 5 | **Critical:** staff API routes unauthenticated; submissions list unredacts on any header | `08` |
| 6 | **High:** regex sanitiser and raw ad HTML; rules gaps (status-less articles, public users) | `02` C4, C6; `09` |
| 7 | **Trust:** fabricated popup, seed articles, view counts, hashtags, test ad shown to readers | `02` F4–F6 |
| 8 | **SEO:** one title/canonical for all pages, soft 404, hash URLs | `04`, `22` |
| 9 | Measured 154 page/width samples: 0 overflow ✔; header 233–241px; 2–3 H1s; Mukta body font; small text | `20` §A |
| 10 | Design direction: Minimal Editorial, existing brand red `#dc2626`, light only, Noto Sans Devanagari + Noto Sans | `13`, `14` |
| 11 | Tokens: colour, type scale, spacing, radius, layout, ads, motion, z-index (JSON) | `14_MASTER_DESIGN_TOKENS.json` |
| 12 | Typography scale with Devanagari floors; static page H1 at 17px/700 | `15` |
| 13 | Layout: 1280 container, 372px sidebar, 680px measure, 14-width behaviour | `16`, `20` |
| 14 | 16 page prototypes (10 public, 6 admin) — 0px overflow at all 14 widths (emulation) | `visual/` |
| 15 | 13 component sheets with 16-field specs | `components/`, `17`, `18` |
| 16 | Ads: 336×280, 300×250, 300×600, custom 350px (not a Google standard size), no invented IDs | `19` |
| 17 | Admin: 29 tabs → 11 screens, English, one editor (**admin not visually verified** — needs sign-in) | `07`, `11` |
| 18 | Proposed sitemap, redirects, role matrix, least-privilege rules | `05`, `09` |
| 19 | Research blocked by network policy; protocol provided; no competitor claims made | `12` |
| 20 | Roadmap P0–P3 with complexity; owner inputs listed; awaiting approval to start Phase 2 | this file |
