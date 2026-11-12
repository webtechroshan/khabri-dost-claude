# 11 — Simplification and consolidation plan

Goal: fewer things, each done well. Nothing is deleted from the database; settings that disappear from the UI keep
their stored values until an admin saves the new screen.

## Public site

| Remove or reduce | Why | Replacement |
|---|---|---|
| Fully sticky 233–241px header | Covers ~28% of a phone screen | 96px phone header; only the 48px category bar sticks on desktop |
| Auto-rotating spotlight slider | Motion, hides stories, CLS | Static lead + 3 stories |
| Default breaking popup | Fabricated; interrupts | Real alerts only |
| Default hashtags, gold rate, invented counts | Fabricated or unsourced | Hidden until real data exists |
| 16 font families | Weight, inconsistency | Noto Sans Devanagari + Noto Sans |
| Two bottom bars on article pages | Clutter | One share bar |
| Two e-paper readers (`EPaperReader.tsx` ×2, `EPaperPdfViewer.tsx`) | Duplicate code | One reader |
| Many card styles | Visual noise | 4 card variants (lead, standard, horizontal, list) |
| Gradients, heavy shadows, large radii | Noise | Flat surfaces, 1px lines, radius ≤ 8px |

## Admin (29 tabs → 11 screens)

See the mapping in `07_ADMIN_PAGE_INVENTORY.md` and the prototype `visual/admin-settings.html`.

| Merge | Into |
|---|---|
| AdSense & Monetization + Sidebar Ad Slots + Header/Footer "Ad Slots & Scripts" | **Advertisements** |
| Header & Navigation + Mobile Drawer + Mobile Bottom Nav + Footer | **Settings › Navigation** |
| Homepage Sections + Spotlight + Trending & Tickers + Sidebar & Rashifal | **Homepage builder** |
| Video Bulletins + Photo Stories + Media Library + E-Paper | **Media** |
| Editorial Team + Admin Security & Access | **Users & roles** |
| Speed & Vitals + SEO Audit | **SEO & sitemaps** |
| Typography tab + Typography modal + Brand Customizer | **Settings › Branding** (brand colour, logo, one text-size scale; no free font picker) |
| All Articles + Write + Pipeline & Calendar | **News** (list with Draft / Review / Scheduled / Published / Archived tabs) |
| Citizen submissions + Contact inquiries | **Inbox** |

## Code

| Item | Today | Proposed |
|---|---|---|
| `AdminBackendPanel.tsx` | 3,963 lines | Shell + one file per screen |
| `ArticlePageView.tsx` | 2,852 lines | Article layout + small parts (byline, share, body, related) |
| `Header.tsx` | 2,626 lines | Desktop header, phone header, drawer |
| Editors | `PublisherCMS.tsx`, `RichPostEditorModal.tsx`, `WordPressVisualEditor.tsx` | One editor component |
| Shared UI | Inline Tailwind strings | `src/components/ui` primitives (Button, TextField, Dialog, EmptyState, …) |
