# 12 — Reference research

## Status: **Not observed — network blocked**

All external hosts are blocked by this cloud environment's network policy. Attempts to open reference news sites
and Google's documentation failed at the proxy. Therefore:

- **No competitor feature is claimed in this package.** No competitor logo, colour, text, image or layout was
  copied or described.
- Statements below are general design principles from prior knowledge, labelled **Interpretation** or
  **Recommendation**, never **Fact (observed)**.

To enable research in a later session: cloud environment → Edit → Network access → allow the specific hosts
(e.g. the reference sites you choose, `developers.google.com`, `support.google.com`, `web.dev`).

## Research protocol (to run when network access is allowed)

1. Pick 6–10 reference sites (Hindi and English news; at least 2 regional Hindi publishers). The owner should
   approve the list.
2. For each site, at 375px and 1366px, record only what is observed, with date and URL:
   header height and what sticks; number of nav items; homepage section order; card types; article template order
   (kicker, H1, deck, byline, image, highlights, body, tags, author box, related); ad positions and sizes; sidebar
   width; font family and body size; bottom bar on phones; live-blog layout; author page content; footer content.
3. Save screenshots privately for reference only (not in the repo, not reused).
4. Fill the matrix below. Columns: **Fact (observed)** · **Interpretation** · **Recommendation for Khabri Dost**.
5. Verify Google requirements against current official pages (Search Central: News, Discover, structured data,
   page experience; AdSense/Ad Manager ad size policies) and record the page title and date read.

## Evidence matrix (template — empty until observed)

| Site | Width | Observation | Date | Interpretation | Recommendation |
|---|---|---|---|---|---|
| — | — | Not observed — network blocked | — | — | — |

## General principles used in this blueprint (Interpretation, not observed facts)

| Principle | Used where |
|---|---|
| Readers on phones need the story in the first screen; tall sticky headers reduce that | Header spec, `20_RESPONSIVE_DESIGN_SPEC.md` |
| One clear typographic hierarchy (kicker → headline → deck → meta) improves scanning | `15_TYPOGRAPHY_SYSTEM.md` |
| Devanagari needs more line-height than Latin text (matras above and below) | Type tokens |
| Ads with reserved space avoid layout shift | `19_ADVERTISEMENT_INVENTORY.md` |
| Visible authorship, dates and correction policies support trust | Article and author templates |
| Common IAB/Google display sizes (300×250, 336×280, 300×600, 728×90, 970×250, 320×50/100) | Ad inventory — to be re-checked against current Google pages |
