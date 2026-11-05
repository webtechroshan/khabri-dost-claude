# 16 — Layout and grid system

| Token | Value |
|---|---|
| Container | 1280px max, centred |
| Gutter | 16px (<768), 24px (768–1023), 32px (≥1024) |
| Desktop columns | main `minmax(0,1fr)` + sidebar 372px, 32px gap → main ≈ 812px at 1280 |
| Sidebar range | 370–390px (372 chosen: 336 creative + 2×18px breathing room) |
| Article measure | 680px inside the main column |
| Spacing scale | 4 · 8 · 12 · 16 · 20 · 24 · 32 · 40 · 48 |
| Section rhythm | 32px between homepage sections; 48px before footer |

## Breakpoints

| Range | Layout |
|---|---|
| 320–767 | One column; phone header (~96px); bottom bar; sidebar content moves below main or is hidden; ads 300×250 / 320×50/100 |
| 768–1023 | One main column with 2-column card grids; no sidebar; desktop header without utility strip |
| 1024–1439 | Main + 372px sidebar |
| 1440–1920 | Same as 1024+, container stays 1280px; extra space is page margin |

## Grids

| Grid | Desktop | Tablet | Phone |
|---|---|---|---|
| Hero (`k-hero`) | 1.55fr / 1fr | 1.55fr / 1fr | 1 column |
| Card grid 3 (`k-grid3`) | 3 | 3 | 1 |
| Card grid 4 (`k-grid4`) | 4 | 2 | 1 |
| Split (`k-split`) | 1.4fr / 1fr | 1.4fr / 1fr | 1 |
| Video grid | 3 | 2 | 1 (horizontal cards) |

All grid tracks use `minmax(0, …)` so long words or wide ads never widen the page (checked: 0px overflow on all
prototypes at 14 widths).

## Image ratios

16:9 lead and video, 4:3 cards, 1:1 avatars and list thumbnails, 9:16 web stories (optional). Every image has width
and height attributes.

Prototype: `visual/design-system.html` (layout diagram), all page prototypes.
