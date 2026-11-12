# 10 — Feature gap register

Priority: **P0** must fix before any redesign goes live (safety, trust) · **P1** core reader/SEO value · **P2** quality
and efficiency · **P3** optional. Complexity: Small / Medium / Large. No time estimates are given.

| ID | Gap | Type | Evidence | Priority | Complexity |
|---|---|---|---|---|---|
| G1 | Public super-admin button and email-only staff login | Security | `StaffLoginModal.tsx` L258/L269; `AuthContext.tsx` L339, L371 | P0 | Medium |
| G2 | Staff server routes without token verification | Security | `08_BACKEND_AND_API_INVENTORY.md` | P0 | Medium |
| G3 | Regex HTML sanitiser; raw ad/footer HTML | Security | `articleContentParser.tsx` L487; `Footer.tsx` L845 | P0 | Medium |
| G4 | Firestore: status-less articles public; users public; unvalidated creates | Security | `firestore.rules` L61, L128 | P0 | Small |
| G5 | Fabricated content shown to readers (popup, seed articles, view counts, hashtags, test ad) | Trust | `portalDefaults.ts` L228, L441; `seedNews.ts` | P0 | Small |
| G6 | Same title/canonical on every page; soft 404 | SEO | browser metrics | P1 | Medium |
| G7 | Clean URLs for e-paper and static pages; redirects for hash URLs | SEO | `App.tsx` L859 | P1 | Medium |
| G8 | Author pages and tag pages | SEO / E-E-A-T | missing | P1 | Medium |
| G9 | One H1 per page; header height; single bottom bar | Accessibility / UX | metrics | P1 | Medium |
| G10 | Body font Mukta, 16 font families loaded | Design / performance | `index.html` L37, L77 | P1 | Small |
| G11 | Text under 12px (124–143 nodes on home/login) | Legibility | metrics | P1 | Medium |
| G12 | Initial JS 985 KB gzip, no code splitting | Performance | build of `6c9b022` | P1 | Medium |
| G13 | Staff list in `localStorage`; no invites | Admin | `AuthContext.tsx` L113 | P0 (with G1) | Medium |
| G14 | Scheduled publishing needs a browser open | Workflow | no server job | P2 | Medium |
| G15 | Citizen submissions in server memory | Data loss | `server.ts` L87 | P1 | Small |
| G16 | Admin: 29 tabs, duplicates | Admin UX | `07_ADMIN_PAGE_INVENTORY.md` | P2 | Large |
| G17 | Category pagination; video/photo listing pages | Reader | missing | P2 | Medium |
| G18 | Push notifications / newsletter sending | Feature | UI only | P3 | Large (needs provider) |
| G19 | Image width/height, responsive `srcset`, Storage uploads | Performance | base64/data URLs in places | P2 | Medium |
| G20 | Corrections log and visible correction notes | E-E-A-T | missing | P2 | Small |
| G21 | Real About, editorial policy, team bios, contact/grievance officer | E-E-A-T | placeholders | P1 (owner content) | Owner |
| G22 | Admin usable on phones | Admin | not visually verified | P3 | Medium |
| G23 | E2E tests in CI; rules tests | Quality | none in repo | P2 | Medium |
