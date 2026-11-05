# 21 — Accessibility specification

Target: WCAG 2.2 AA. Prototypes were built to these rules; the live site has **not** been audited with a screen
reader in this session.

| Area | Requirement | Existing (evidence) | Proposed |
|---|---|---|---|
| Language | `<html lang="hi">`; English admin regions `lang="en"` | check in Phase 2 | Set per region |
| Headings | One H1; H2 per section; H3 per card | 2–3 H1 on 7 page types (measured) | One H1 |
| Landmarks | `header`, `nav` (labelled), `main`, `aside`, `footer`; skip link to `#main-content` | partial | All |
| Colour contrast | Text ≥ 4.5:1, large text ≥ 3:1 | not audited | Tokens (computed on white): ink 18.5:1, ink-2 9.5:1, ink-3 5.6:1, brand-ink 6.5:1, brand 4.8:1; status colours 5.4–6.6:1 |
| Colour alone | Status shown with text | — | Pills with words |
| Focus | Visible 2px ring, 2px offset, never removed | not audited | `focus-visible` ring token |
| Targets | ≥ 44×44px on touch | many small icons | 44px icon buttons |
| Text size | ≥ 12px; zoom to 200% without loss | 124–143 nodes <12px on home/login | 12px minimum |
| Motion | No auto-rotating sliders; respect `prefers-reduced-motion` | auto-slider, ticker | Static hero; ticker pausable |
| Dialogs | `role="dialog"`, `aria-modal`, labelled, focus trap, Esc closes, focus returns | partial | Shared Dialog primitive |
| Images | Meaningful `alt`; decorative `alt=""`; captions visible | alt field exists (`imageAltText`) | Required in editor |
| Forms | Visible labels, errors linked with `aria-describedby`, no placeholder-only labels | mixed | Shared TextField |
| Live updates | Live blog new posts announced politely; "pause updates" control | — | `aria-live="polite"` region |
| Tables | `th` with scope; captions | — | Admin tables |
| Language of numbers | Hindi or Latin digits consistently | mixed | Latin digits, Hindi words |
| Ads | Labelled "विज्ञापन"; not focus-trapping | test banner | Label + no auto-focus |
