# 17 — Frontend component catalogue

Each component is drawn, with all 16 specification fields (name, purpose, current file, status, preview, typography,
spacing, colours, dimensions, interaction, accessibility, data source, admin control, priority, mobile variant), in
the component sheets under `components/`. This table is the index.

| Component | Sheet | Replaces / current file | Status | Priority |
|---|---|---|---|---|
| Type styles (H1, deck, body, card, meta, static title) | `typography.html` | `index.css` tokens | IMPROVE | P1 |
| Button (primary, secondary, ghost, dark, danger; sizes; loading) | `buttons.html` | inline classes | IMPROVE | P1 |
| Icon button (44px) | `buttons.html` | inline | IMPROVE | P1 |
| Utility strip | `navigation.html` | `Header.tsx` | IMPROVE | P1 |
| Masthead | `navigation.html` | `Header.tsx` | IMPROVE | P1 |
| Category nav (desktop, sticky) | `navigation.html` | `Header.tsx` | IMPROVE | P1 |
| Phone header + category scroller | `navigation.html` | `Header.tsx` | REDESIGN | P1 |
| Drawer menu (dialog) | `navigation.html` | `Header.tsx` | IMPROVE | P1 |
| Bottom nav (5 items) | `navigation.html` | `MobileBottomNav.tsx` | IMPROVE | P1 |
| Breaking band | `navigation.html` | `SpotlightBriefTicker.tsx` | IMPROVE | P1 |
| Breadcrumb | `navigation.html` | `ArticlePageView.tsx` | IMPROVE | P1 |
| Pagination | `navigation.html` | — | MISSING | P2 |
| Lead card | `news-cards.html` | `SpotlightHeroSlider.tsx` | REDESIGN | P1 |
| Standard card | `news-cards.html` | `ArticleCard.tsx` | IMPROVE | P1 |
| Horizontal card | `news-cards.html` | `ArticleCard.tsx` variants | IMPROVE | P1 |
| Numbered list / ranked list | `news-cards.html` | `TrendingSection.tsx` | IMPROVE | P1 |
| Video card, photo card | `news-cards.html` | `VideoSection.tsx`, `PhotoGallerySection.tsx` | IMPROVE | P2 |
| Live badge | `news-cards.html` | `LiveFeedPageView.tsx` | IMPROVE | P1 |
| Section heading | `news-cards.html` | various | IMPROVE | P1 |
| Article header (kicker, H1, deck, byline, dates) | `article-components.html` | `ArticlePageView.tsx` | IMPROVE | P1 |
| Share row / phone share bar | `article-components.html` | `ArticlePageView.tsx` | IMPROVE | P1 |
| Figure (image, caption, credit) | `article-components.html` | `ArticlePageView.tsx` | IMPROVE | P1 |
| Key facts box | `article-components.html` | `ArticleKeyHighlights.tsx` | EXISTING (restyle) | P2 |
| Prose (paragraph, H2, quote, list, table, embed) | `article-components.html` | `articleContentParser.tsx` | IMPROVE + safe sanitiser | P0/P1 |
| Also-read inline link | `article-components.html` | — | IMPROVE | P2 |
| Tags | `article-components.html` | `ArticlePageView.tsx` | IMPROVE | P1 |
| Author box | `article-components.html` | `ArticlePageView.tsx` | IMPROVE | P1 |
| Correction note | `article-components.html` | — | MISSING | P2 |
| Live timeline entry | `article-components.html` | `LiveBlogReaderModal.tsx` | IMPROVE | P1 |
| Search field, select, checkbox, radio, textarea, file input | `forms.html` | inline | IMPROVE | P1 |
| Newsletter sign-up | `forms.html` | `SubscriberPreferencesModal.tsx` | IMPROVE | P2 |
| Submit-news form | `forms.html` | `SubmitNewsPageView.tsx` | IMPROVE | P1 |
| Dialog, drawer, toast, alert | `modals.html` | various modals | IMPROVE | P1 |
| Sidebar blocks (latest, most read, ad, e-paper teaser) | `sidebar.html` | `App.tsx`, widgets | IMPROVE | P1 |
| Ad slot (all sizes, label, empty/collapsed) | `advertisements.html` | `AdSlot.tsx`, `AdBanner.tsx` | IMPROVE | P1 |
| Footer (columns, legal row) | `footer.html` | `Footer.tsx` | IMPROVE | P1 |
| Empty, loading (skeleton), error, 404, offline | `empty-loading-error-states.html` | — | MISSING / IMPROVE | P1 |
