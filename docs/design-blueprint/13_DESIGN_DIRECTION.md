# 13 — Design direction: Minimal Editorial News

## Intent

A Hindi newspaper that feels calm, fast and trustworthy. The news is the design: strong headlines, clear dates
and authors, white space, one accent colour. Nothing moves unless the reader asks.

## Keep (brand continuity)

- Name and wordmark **खबरी दोस्त / Khabri Dost** (logo artwork is the owner's; the prototype uses a text wordmark).
- Brand red `#dc2626` — already the default in the code.
- Light theme only.
- Noto Sans Devanagari + Noto Sans (already in `src/index.css` tokens).
- Existing sections and categories.

## Change

| From (measured / in code) | To |
|---|---|
| 233–241px sticky header with 5 bands | ~154px desktop, ~96px phone; only nav (desktop) / top bar (phone) sticks |
| Gradients, large radii, shadows, many colours | Flat white, 1px lines, radius ≤ 8px, one accent |
| 16 fonts; body in Mukta | 2 families |
| Text down to <12px | 12px minimum (ad label 11px) |
| Auto-slider hero | Static lead story |
| Bilingual decorative labels and emoji in UI | Plain Hindi on the public site; English in admin |
| Multiple bottom bars | One |

## Principles

1. **Content first.** On a 390px phone the first headline is visible without scrolling.
2. **One hierarchy.** Kicker → headline → deck → meta. Same everywhere.
3. **Honest by default.** No placeholder people, numbers, IDs or news. Empty states instead.
4. **Stable layout.** Images and ads reserve space.
5. **Reachable.** 44px targets, visible focus, real headings and landmarks.
6. **Small admin.** 11 screens, English labels, one editor.

## Where to see it

`visual/index.html` → homepage, article, category, search, author, live, video, e-paper, static page, admin screens;
`visual/design-system.html` for tokens; `visual/compare.html` for before/proposed.
