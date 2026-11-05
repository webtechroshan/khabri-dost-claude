# 03 — Architecture and data flow

Diagrams: `diagrams/system-architecture.mmd`, `diagrams/frontend-admin-data-flow.mmd`,
`diagrams/publishing-workflow.mmd`, `diagrams/role-permissions.mmd` (Mermaid; open in any Mermaid viewer or GitHub).

## Current architecture (verified in code, commit 6c9b022)

| Layer | Technology | Where |
|---|---|---|
| Browser app | React 19 SPA, Vite 8, Tailwind v4, lucide-react, pdfjs | `src/` (entry `src/main.tsx` → `src/App.tsx`, 1,678 lines) |
| Routing | Hand-written in `App.tsx` (L520–600): `pathname`, `?article=`, `#hash` aliases; `history.pushState` | `App.tsx` L808, L817, L859 |
| State | React state in `App.tsx`; settings mirrored in `localStorage['kd_portal_settings']` | `services/newsService.ts` |
| Auth | Firebase Auth (Google popup) **plus** browser-only staff sessions in `localStorage['kd_staff_session']` | `context/AuthContext.tsx` |
| Database | Cloud Firestore (named database) accessed directly from the browser | `src/firebase.ts`, `services/newsService.ts` |
| Server | Express (`server.ts`, 1,606 lines): Vite middleware in dev, `dist/` in prod; AI routes (Gemini), sitemaps, RSS, robots, citizen news (in memory), e-paper upload | `server.ts` |
| AI | Google GenAI SDK called from the server; keys from env or request body | `server.ts` L187–1170 |
| Hosting target | Not deployed by this work | — |

### Request paths today

1. **Reader opens a URL** → Express returns the same `index.html` for every path (no per-URL head) → React reads the
   URL → loads `settings/portal_config` and `articles` from Firestore → renders. Seed articles from
   `src/data/seedNews.ts` are mixed in (`App.tsx` L46).
2. **Staff signs in** → `StaffLoginModal` → one of three methods (super-admin direct, Google, email-only) → a
   session object in `localStorage`. Only the Google path creates a Firebase Auth user, so only that path can
   write to Firestore under the rules.
3. **Staff saves an article** → browser writes `articles/{id}` directly → `firestore.rules` decide.
4. **Staff uses AI** → browser calls `/api/ai/*` with no ID token → server calls Gemini.
5. **Crawler** → `/sitemap.xml`, `/news-sitemap.xml`, `/rss.xml` read Firestore through the server.

## Proposed architecture (Phase 2, no change yet)

Same stack, same Firestore database and document shapes. Changes are additive:

| Change | Why | Compatibility |
|---|---|---|
| One route table (`src/utils/routes.ts`) used by the app and the server | Clean URLs, real 404s, Back/Forward | Old `#hash` and `?article=` URLs redirect |
| Server renders `<title>`, description, canonical, OG and JSON-LD per URL | SEO, sharing | Same `index.html` body |
| Staff sign-in = Google only; role read from Firestore `users/{uid}` / `staff_invites` | Close the bypass | Existing admins keep access via the email list in rules |
| Server verifies Firebase ID tokens on every staff route (`requireRole()`), browser uses `authFetch()` | Close open AI/admin routes | Same routes and payloads |
| DOM-based sanitiser (DOMPurify) for article HTML; ad scripts only from whitelisted providers | XSS | Stored HTML unchanged |
| Seed content only with `VITE_DEMO_CONTENT=true` | No fabricated content | No DB change |
| Citizen submissions stored in Firestore (`submissions`) | Survive restarts | New collection |
| Scheduled publishing via a server job or Cloud Function | Works without a browser open | Uses existing `scheduledFor` |

See `08_BACKEND_AND_API_INVENTORY.md` and `09_DATABASE_AND_SECURITY_MAP.md` for the detail.
