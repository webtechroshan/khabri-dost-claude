# 06 — Frontend page and division inventory

Decision labels: **EXISTING** (keep as is) · **IMPROVE** (keep, restyle/fix) · **REDESIGN** (rebuild the division) ·
**MISSING** (add) · **OPTIONAL** (add only if the newsroom will maintain it) · **REMOVE**.
Files are the current components. Prototypes are in `visual/`.

## 1. Global shell

| Division | Current file | Today (evidence) | Decision | Proposed |
|---|---|---|---|---|
| Utility strip (date, e-paper, social, login) | `Header.tsx` | Part of 233–241px sticky block | IMPROVE | 32px, desktop only, not sticky |
| Masthead / logo | `Header.tsx` | Large, decorated | IMPROVE | Centred wordmark, 72px band |
| Category navigation | `Header.tsx` | Sticky with the rest | IMPROVE | 48px bar; the only sticky element on desktop; horizontal scroll on phones |
| Hashtag / trending strip | `Header.tsx`, `TrendingSection.tsx` | Invented hashtags by default | REMOVE default data; OPTIONAL | Show only editor-set tags |
| Breaking ticker | `SpotlightBriefTicker.tsx` | Always visible | IMPROVE | Only when a real breaking story exists |
| Regional states bar | `home/RegionalStatesFilterBar.tsx` | Large | IMPROVE | Move into category pages / drawer |
| Phone header | `Header.tsx` | ~241px | REDESIGN | 56px top bar + 40px category scroller (~96px) |
| Phone drawer menu | `Header.tsx` / `MobileSidebarSettingsTab` | Exists | IMPROVE | Accessible dialog, focus trap |
| Bottom navigation | `navigation/MobileBottomNav.tsx` | 5 slots | IMPROVE | Home · Categories · Videos · E-Paper · Menu; replaced by share bar on articles |
| Breaking popup | `PortalPopup.tsx` | Fabricated Gaganyaan story on first visit | REMOVE default | Only real, editor-triggered alerts |
| Notification toast | `NotificationToast.tsx` | Exists | EXISTING | Restyle |
| Footer | `Footer.tsx` | Large, raw ad HTML (L845) | IMPROVE | 4 columns + legal row; no raw HTML |
| Sticky footer ad | `Footer.tsx` | "Testing Ad Banner" default | REMOVE default | Off unless configured |
| 404 page | — | Soft 404 | MISSING | Real 404 with search + latest |

## 2. Homepage

| Division | Current | Decision | Proposed |
|---|---|---|---|
| Spotlight hero / slider | `SpotlightHeroSlider.tsx`, `SpotlightSection.tsx` | REDESIGN | Static lead story + 3 side stories (no auto-slider) |
| Top stories grid | `App.tsx` | IMPROVE | 3/4-column grids with one card style |
| Latest list (sidebar) | `App.tsx` | IMPROVE | Numbered "ताज़ा" list in 372px sidebar |
| Most read | `TrendingSection.tsx` | IMPROVE | Real view counts only; hidden if no data |
| Category blocks | `home/TopCategoriesGrid.tsx` | IMPROVE | Section heading with 3px rule + 1 lead + list |
| Video section | `VideoSection.tsx` | IMPROVE | 16:9 cards, no third-party autoplay |
| Photo gallery section | `PhotoGallerySection.tsx` | IMPROVE | 4:3 cards with count badge |
| Opinion poll | `OpinionPollWidget.tsx` | OPTIONAL | Keep only if run by editors |
| Gold rate widget | `widgets/GoldRateWidget.tsx` | REMOVE unless a real data source is connected | — |
| Rashifal widget | `widgets/RashifalWidget.tsx` | OPTIONAL | Clearly labelled as entertainment |
| Sudoku | `widgets/SudokuGameWidget.tsx`, `DailySudokuModal.tsx` | OPTIONAL | Move to `/sudoku` |
| Ads | `AdSlot.tsx`, `AdBanner.tsx` | IMPROVE | See `19_ADVERTISEMENT_INVENTORY.md` |

## 3. Article page (`ArticlePageView.tsx`, 2,852 lines)

| Division | Decision | Proposed |
|---|---|---|
| Breadcrumb | IMPROVE | Home › Category, 13px |
| Category kicker | EXISTING | Red, 13px, links to category |
| H1 headline | IMPROVE | Single H1, 36px/1.32 desktop, 26px phone |
| Deck / subtitle | IMPROVE | 20px/1.6, muted |
| Byline + dates | IMPROVE | Author link, "प्रकाशित" and "अपडेट" with real dates |
| Share buttons | IMPROVE | Top row on desktop; one bottom share bar on phones (replaces bottom nav) |
| Lead image + caption + credit | IMPROVE | 16:9, ≥1200px source, caption and credit visible |
| Key highlights | EXISTING (`ArticleKeyHighlights.tsx`) | Restyle as "मुख्य बातें" box |
| Audio player | OPTIONAL (`AudioNewsPlayer.tsx`) | Only when audio exists |
| Body | IMPROVE | 18px/1.85, 680px measure, sanitised by DOM sanitiser |
| In-article ads | IMPROVE | After para 3 and 7; reserved height |
| "Also read" inline links | IMPROVE | Max 2 per article |
| Tags | IMPROVE | Link to `/tag/{tag}` |
| Author box | IMPROVE | Real bio only; link to author page |
| Corrections note | MISSING | Shown when an article has a correction |
| Reactions / likes | OPTIONAL (`Reactions.tsx`) | Keep small |
| Comments | OPTIONAL | Moderated only |
| Related stories | IMPROVE | 3–6 from same category |
| Sidebar widgets | IMPROVE | Desktop only: ad 336×280, latest, most read, sticky 300×600 |
| E-paper clipping | OPTIONAL (`ArticleEPaperClippingModal.tsx`) | Keep in "more" menu |
| Two fixed bottom bars on phones | REMOVE | One bar |

**Article variants** (`visual/article-variants.html`): standard, breaking/live (timeline), photo story, video story,
opinion (author-led header), explainer (numbered sections), sponsored (clear label).

## 4. Other pages

| Page | Current | Decision | Prototype |
|---|---|---|---|
| Category | Home with filter | IMPROVE (own header, pagination, sub-filters) | `category-page.html` |
| Search | Home with query | IMPROVE (results page, filters, noindex) | `search-page.html` |
| Author | — | MISSING | `author-page.html` |
| Tag | — | MISSING | category template |
| Video / photo listing | — | MISSING | `video-page.html` |
| Web stories | — | OPTIONAL (only if the newsroom produces them) | — |
| Live | `LiveFeedPageView.tsx`, `LiveBlogReaderModal.tsx` | IMPROVE (timeline, pinned post, "auto-update" control) | `live-news-page.html` |
| E-paper | `EPaperPageView.tsx`, `EPaperReader.tsx`, `epaper/*` (two readers) | IMPROVE + merge readers | `epaper-page.html` |
| Archive | `ArchivePageView.tsx` | IMPROVE | category template |
| About / Contact / Policies | `AboutUsPageView.tsx`, `ContactUsPageView.tsx`, `LegalPolicyPageView.tsx` | IMPROVE (one static template, 17px/700 page title, single H1) | `static-page.html` |
| Submit news | `SubmitNewsPageView.tsx` | IMPROVE (store in Firestore, consent text) | static template |
| Bookmarks / read later | modals | OPTIONAL as `/saved` | — |
