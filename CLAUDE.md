# Khabri Dost — notes for AI assistants and developers

Hindi news site: React 19 SPA + Express (`server.ts`, `server/`) + Firebase (Firestore, Auth).
Design blueprint and reports: `docs/design-blueprint/` (start with `00_START_HERE.md`; Phase 2 status in
`24_PHASE2_IMPLEMENTATION_REPORT.md`).

## Commands

- `npm run dev` — dev server (Vite middleware) on :3000
- `npm run check` — typecheck, unit tests, production build (run before every commit)
- `npm run test:rules` — Firestore rules tests in the emulator (needs Java)
- Browser matrix (local only, emulator-backed):
  1. `firebase emulators:start --only firestore --project <projectId>`
  2. `FIRESTORE_EMULATOR_HOST=127.0.0.1:8085 node tests/e2e/seed-emulator.mjs`
  3. `FIRESTORE_EMULATOR_HOST=127.0.0.1:8085 VITE_FIRESTORE_EMULATOR=127.0.0.1:8085 PORT=3420 npx tsx server.ts`
  4. `BASE_URL=http://localhost:3420 npm run test:e2e`

## Rules that must not be broken

- `firestore.rules` is the security boundary. The server has no admin credentials; it verifies Firebase ID tokens
  (`server/auth.ts`) and reads Firestore over REST under the same rules. Keep role lists identical in
  `firestore.rules` and `src/utils/roles.ts`.
- Staff sign in with Google only; roles come from `staff/{email}` (owner emails are the bootstrap admins).
- Never render stored HTML without `sanitizeArticleHtml()` (`src/utils/sanitizeHtml.ts`). No regex sanitisers.
  Ad code goes through `AdCode` / `AdPlacement`.
- Public views receive only `isArticlePubliclyVisible()` articles; public Firestore queries filter `status == "published"`.
- No fabricated content in defaults: no sample articles, people, numbers, credentials, ad IDs or registration
  details. Sample data only behind `VITE_DEMO_CONTENT=true`.
- Never store secrets in the `settings` collection (public-read).
- Styling: tokens and components in `src/index.css`; light theme only; Noto Sans Devanagari + Noto Sans;
  Devanagari line-height ≥ 1.3 headings / ≥ 1.6 body; no text under 12px; one H1 per page.
- Staff API calls from the browser use `authFetch()`; new staff routes on the server use `requireRole()`.
- Do not test against or crawl the production domain, and do not run tests against the production Firestore
  (use the emulator).
