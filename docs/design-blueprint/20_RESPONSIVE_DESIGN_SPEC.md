# 20 — Responsive design specification

Widths tested: 320, 360, 375, 390, 414, 430, 480, 768, 1024, 1280, 1366, 1440, 1600, 1920.
**All measurements are headless Chromium emulation** (`isMobile` for <768), not physical devices.

## A. Existing site — measured (local dev server, commit 6c9b022, 11 page types × 14 widths = 154 samples)

| Page | h1 count | Header height (px) | Whole header sticky | Max text nodes <12px | Fixed bottom bars (phone, max) | Max horizontal overflow | Distinct titles | Canonical |
|---|---|---|---|---|---|---|---|---|
| home | 1 | 233–241 | yes | 136 | 1 | 0 | 1 | site root |
| category | 1 | 233–241 | yes | 19 | 1 | 0 | 1 | site root |
| article | **2** | 233–241 | yes | 59 | **2** | 0 | 1 | site root |
| live | **2** | 233–241 | yes | 33 | 1 | 0 | 1 | site root |
| epaper | **3** | 233–241 | yes | 38 | 1 | 0 | 2 | site root |
| about | **2** | 233–241 | yes | 38 | 1 | 0 | 1 | site root |
| privacy | **2** | 233–241 | yes | 52 | 1 | 0 | 1 | site root |
| submit | **2** | 233–241 | yes | 11 | 1 | 0 | 1 | site root |
| archive | **2** | 233–241 | yes | 56 | 1 | 0 | 1 | site root |
| login | 1 | 233–241 | yes | 143 | 1 | 0 | 1 | site root |
| unknown URL | 1 | 233–241 | yes | 136 | 1 | 0 | 1 | site root (soft 404) |

Body font on every sample: `Mukta, sans-serif`. Body background under emulated OS dark mode: `rgb(248,250,252)`
(stays light ✔). Screenshots: `screenshots/existing/` (375, 768, 1366 for each page; home also 320 and 1920;
`-dismissed` variants with the popup closed).

## B. Proposed — checked on the prototypes

All 16 page prototypes (10 public, 6 admin) at all 14 widths: **0px horizontal overflow** (Chromium emulation).
Component sheets, design system, compare and index pages: 0px at 320, 390, 768 and 1366.
Previews: `visual/responsive-previews/home-{width}.jpg` and `article-{width}.jpg` (14 widths each).

## C. Behaviour by range

| Element | 320–767 | 768–1023 | 1024+ |
|---|---|---|---|
| Header | 56px bar (menu, logo, search) + 40px category scroller; only the 56px bar sticks | Masthead + nav (no utility strip); nav sticks | Utility 32 + masthead 72 + nav 48; nav sticks |
| Bottom bar | 5-item nav (56px + safe area); article pages: share bar instead | none | none |
| Sidebar | Below content (latest, most read) or hidden | Below content | 372px column |
| Hero | 1 column | lead + side | lead + side |
| Card grids | 1 column, horizontal cards for lists | 2–3 columns | 3–4 columns |
| Article H1 | 26px | 32px | 36px |
| Body | 17px / 1.8 | 18px / 1.85 | 18px / 1.85, 680px measure |
| Ads | 300×250, 320×50 anchor | 728×90, 336×280 | 970×250/728×90, 336×280, 300×600 |
| Touch targets | ≥ 44px | ≥ 44px | ≥ 32px pointer, 44px for icon buttons |
| Tables (admin) | Horizontal scroll inside panel | scroll | full |

## D. Acceptance criteria for Phase 2

1. 0px horizontal overflow at all 14 widths for every public template.
2. Phone header ≤ 100px; first headline visible at 390×844 without scrolling.
3. Exactly one H1 per page.
4. No reader-facing text under 12px except the ad label.
5. At most one fixed bar at the bottom on phones (plus an optional dismissible 320×50 anchor above it).
6. No overlap between sticky elements and content (checked by script).
