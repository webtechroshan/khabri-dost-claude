# Khabri Dost — Design Blueprint (Phase 1)

**Status:** Phase 1 deliverable — audit and design blueprint only. **Nothing in the running website or admin
application has been changed.** Phase 2 starts only after the written approval
`APPROVED — START PHASE 2 WEBSITE UPGRADE`.

**Repository:** `webtechroshan/khabri-dost-claude`, base commit `6c9b022` (branch `main`).
**Work branch:** `claude/design-blueprint-phase1` (documentation only).
**Prepared:** 5 November 2026.

## How to open the prototypes

The prototypes are static HTML files. They need no build step and no server.

1. Open `visual/index.html` in a desktop browser. It links to every page and component sheet.
2. Every prototype carries `<meta name="robots" content="noindex, nofollow">` and is **not** linked from the public
   website. The files are not served by `server.ts` (which serves `dist/` only).
3. Images are grey placeholders on purpose: no stock photos and no copied artwork.

| Start here | File |
|---|---|
| Visual index (all pages) | `visual/index.html` |
| Design system (tokens, type, colour, grid) | `visual/design-system.html` |
| Before / proposed comparison | `visual/compare.html` |
| Component sheets (13) | `components/*.html` |
| Machine-readable tokens | `14_MASTER_DESIGN_TOKENS.json` |
| Approval summary and roadmap | `23_APPROVAL_AND_UPGRADE_PLAN.md` |

## Reading order

| # | Document | What it answers |
|---|---|---|
| 01 | Executive summary | The state of the project in one page |
| 02 | Existing project audit | Which earlier claims are true, with code citations |
| 03 | Architecture and data flow | How the pieces talk to each other |
| 04 / 05 | Current / proposed sitemap | Every URL today and the proposed URL map |
| 06 / 07 | Frontend / admin page inventory | Every division, and what to keep, improve, merge or remove |
| 08 / 09 | Backend API / database and security | Routes, collections, rules, roles |
| 10 / 11 | Gap register / simplification | What is missing and what is excess |
| 12 | Reference research | Research protocol — external sites could not be reached |
| 13–16 | Design direction, tokens, type, layout | The design system |
| 17 / 18 | Component catalogues | Frontend and admin components |
| 19 | Advertisement inventory | Slots, sizes, sidebar rules |
| 20 / 21 / 22 | Responsive, accessibility, SEO and performance specs | Acceptance criteria |
| 23 | Approval and upgrade plan | P0–P3 roadmap and the 20-point approval list |

## Folder layout

```
docs/design-blueprint/
  00–23 *.md, 14_MASTER_DESIGN_TOKENS.json
  visual/        page prototypes, design system, compare, responsive-previews/, assets/blueprint.css
  components/    13 component sheets
  diagrams/      4 Mermaid diagrams (.mmd)
  screenshots/
    existing/    35 screenshots of the current site (local dev server, emulated widths)
    proposed/    6 screenshots of the prototypes
```

## What "verified" means in this package

| Label | Meaning |
|---|---|
| **Verified (code)** | Read in the source at the cited file and line. |
| **Verified (browser)** | Measured in headless Chromium against the local dev server (`npx tsx server.ts`) at emulated widths. Not physical devices. |
| **Not visually verified** | Could not be seen — usually the admin panel, which requires Google sign-in. |
| **Not observed — network blocked** | External sites (competitors, Google docs) could not be reached from this sandbox. |

The production domain was never visited, crawled or tested.
