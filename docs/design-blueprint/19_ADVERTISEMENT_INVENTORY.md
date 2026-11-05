# 19 — Advertisement inventory

**No ad IDs are included or invented.** Slots are empty and collapse until the owner adds real AdSense / Ad Manager
codes or direct campaigns. Every slot shows the label "विज्ञापन · Advertisement" (11px) and reserves its height.
Prototype: `components/advertisements.html`, `visual/admin-advertisements.html`.

## Sidebar

Sidebar width **372px** (range 370–390). Creatives are centred.

| Slot | Size | Where | Behaviour |
|---|---|---|---|
| Sidebar 1 | **336×280** (fallback 300×250) | Top of sidebar | Reserve 280px |
| Sidebar 2 | **300×600** | Lower sidebar | Sticky within sidebar (top: nav height + 16px); stops before footer |
| Sidebar custom | **350px wide (custom)** — e.g. 350×300 | Optional | **Custom direct-sale size, not a Google standard size.** Serve only direct campaigns; never request it from AdSense/GAM as a standard size. |
| Sidebar 3 | 300×250 | Between sidebar lists | Optional |

## Page slots

| Slot | Desktop | Tablet | Phone |
|---|---|---|---|
| Header leaderboard (below nav) | 970×250 or 728×90 | 728×90 | hidden (or 320×100 below first story) |
| Homepage in-feed | 728×90 band between sections | 728×90 | 300×250 after 6th story |
| In-article 1 | 336×280 after paragraph 3 | 336×280 | 300×250 (336×280 if width ≥ 360) |
| In-article 2 | 336×280 after paragraph 7 | same | 300×250 |
| Below article | 728×90 | 728×90 | 300×250 |
| Phone anchor | — | — | 320×50, above the bottom bar, dismissible, max one |

## Rules

1. Max 3 ads in the article body; none between headline and lead image.
2. No ads inside the phone header or bottom bar; the anchor sits above the bar and never covers it.
3. Reserve the slot height to avoid layout shift; collapse to 0 only when the slot is disabled.
4. Ad code is chosen from providers (AdSense, Ad Manager) by ID fields — not free HTML. Direct campaigns upload an
   image + click URL + dates.
5. `ads.txt` managed in admin, served at `/ads.txt`.
6. Remove the default "Testing Ad Banner" (`portalDefaults.ts` L441) and any stock-photo ads.
7. Sizes should be re-checked against current Google documentation before go-live (not verified — network blocked).
