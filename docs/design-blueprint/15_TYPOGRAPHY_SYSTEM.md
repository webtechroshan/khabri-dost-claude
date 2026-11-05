# 15 — Typography system

Families: **Noto Sans Devanagari** (Hindi, default) and **Noto Sans** (Latin, admin UI, numbers). No other
families. Weights loaded: 400, 600, 700. `font-display: swap`. Preload the two families' regular weights only.

Devanagari needs room for matras: headings line-height ≥ 1.3, body ≥ 1.6 (project rule in `CLAUDE.md`).

## Scale

| Token | Use | Desktop | Phone | Weight | Line-height |
|---|---|---|---|---|---|
| `articleH1` | Article headline (the only H1 on article pages) | 36px | 26px | 700 | 1.32 / 1.36 |
| `leadCardTitle` | Homepage lead story | 32px | 24px | 700 | 1.32 / 1.36 |
| `articleH2` | Sub-heads in body | 24px | 21px | 700 | 1.4 |
| `articleH3` | Minor heads | 20px | 19px | 700 | 1.45 |
| `sectionHeading` | "ताज़ा ख़बरें", category blocks (H2) | 20px | 18px | 700 | 1.4 + 3px red top rule |
| `articleDeck` | Subtitle under H1 | 20px | 18px | 400 | 1.6 |
| `articleBody` | Body paragraphs | 18px | 17px | 400 | 1.85 / 1.8 |
| `cardTitle` | Standard card headline (H3) | 17px | 17px | 600 | 1.5 |
| `staticPageTitle` | H1 on About/Contact/Policy pages | 17px | 16px | 700 | 1.5 |
| `listTitle` | Sidebar / list headlines | 16px | 16px | 600 | 1.5 |
| `summary` | Card summary | 15px | 15px | 400 | 1.65 |
| `nav` | Category navigation | 15px | 15px | 600 | 1.4 |
| `kicker` | Category label above headline | 13px | 13px | 600 | 1.4 |
| `meta`, `caption` | Time, place, byline, captions | 13px | 13px | 400 | 1.5–1.6 |
| `adLabel` | "विज्ञापन" label only | 11px | 11px | 600 | 1.3 |

## Rules

- One H1 per page. Static pages use a semantic H1 styled at 17px/700 (not the article style), as requested.
- Body measure 680px max (~60–70 Hindi characters per line).
- Numbers and English words inside Hindi text use the same family stack (Noto Sans covers Latin).
- No all-caps for Hindi. No letter-spacing on Devanagari.
- Admin uses Noto Sans 14px base, 13px tables, 22px page titles.
- Owner-selected fonts in saved settings (e.g. Rozha One) are ignored in Phase 2; a reset is offered in admin.

Prototype: `components/typography.html`, `visual/design-system.html`.
