# 07 — Admin page inventory

**Not visually verified** — the admin requires Google sign-in, which cannot complete in this sandbox. Everything
below comes from `src/components/AdminBackendPanel.tsx` (3,963 lines; tab list L801–900) and `src/components/admin/*`.
The brief mentions 27 modules; the code defines **29 tabs**.

Labels: **Essential** · **Useful** · **Optional** · **Duplicate** · **Consolidate** (merge into another screen).

| # | Tab id | Label | Component | Class | Proposed home (11 screens) |
|---|---|---|---|---|---|
| 1 | `dashboard` | Overview | in panel | Essential | Dashboard |
| 2 | `speed_vitals` | Speed & Vitals | `SpeedWebVitalsTab.tsx` | Optional (no field data source) | SEO & sitemaps › Performance |
| 3 | `seo_audit` | SEO Audit & Sitemap | `SEOAuditTab.tsx` | Useful | SEO & sitemaps |
| 4 | `articles` | All Articles | in panel, `BulkArticleManager.tsx` | Essential | News |
| 5 | `new_article` | Write New Article | `PublisherCMS.tsx` | Essential | News › Editor |
| 6 | `pipeline_calendar` | Pipeline & Calendar | `ScheduledPipelineCalendarTab.tsx` | Consolidate | News (Schedule view) |
| 7 | `live` | Live Coverage Desk | `LiveNewsManagerTab.tsx` | Essential | Live coverage |
| 8 | `trending` | Trending & Tickers | `GoogleTrendsTab.tsx` | Consolidate (data is generated, `server.ts` L717) | Homepage builder › Ticker |
| 9 | `epaper` | E-Paper Edition | `EPaperSettingsTab.tsx` | Essential | Media › E-paper |
| 10 | `media` | Media Library | `MediaLibraryTab.tsx` | Essential | Media |
| 11 | `video_gallery` | Video Bulletins & Reels | `VideoManagerTab.tsx` | Consolidate | Media › Videos |
| 12 | `photo_stories` | Photo Stories & Gallery | in panel | Consolidate | Media › Photos |
| 13 | `brand_customizer` | Brand Customizer & Colors | `BrandCustomizerTab.tsx` | Useful | Settings › Branding |
| 14 | `homepage_sections` | Homepage Sections | `HomepageSectionsSettingsTab.tsx` | Useful | Homepage builder |
| 15 | `spotlight` | Spotlight Hero | `SpotlightSettingsTab.tsx` | Consolidate | Homepage builder |
| 16 | `settings_header` | Header & Navigation | `HeaderFooterSettingsTab.tsx` | Consolidate | Settings › Navigation |
| 17 | `typography` | Typography & Fonts | `TypographySettingsTab.tsx` (+ `TypographyCustomizerModal.tsx`) | Duplicate → reduce | Settings › Branding (font size scale only) |
| 18 | `article_meta` | Article Single View | `ArticleMetaSettingsTab.tsx` | Consolidate | Settings › Article page |
| 19 | `sidebar_widgets` | Sidebar & Rashifal | `ArticleWidgetsSettingsTab.tsx` | Consolidate | Homepage builder › Sidebar |
| 20 | `mobile_sidebar` | Mobile Drawer Menu | `MobileSidebarSettingsTab.tsx` | Consolidate | Settings › Navigation |
| 21 | `settings_footer` | Footer & About Section | `HeaderFooterSettingsTab.tsx` | Consolidate | Settings › Navigation / Pages |
| 22 | `mobile_footer` | Mobile Bottom Nav | `MobileFooterBarTab.tsx` | Consolidate | Settings › Navigation |
| 23 | `monetization` | AdSense & Monetization | `AdvertisementTab.tsx` | Duplicate | Advertisements |
| 24 | `sidebar_ads` | Sidebar Ad Slots | `SidebarAdConfigTab.tsx`, `AdBreakpointEditor.tsx` | Duplicate | Advertisements |
| 25 | `subscribers` | Subscribers & VIPs | in panel | Useful | Audience |
| 26 | `notifications` | Push Notifications | in panel | Documented, not implemented (no sender) | Audience (hidden until a provider is connected) |
| 27 | `popups` | Reader Alerts & Popups | in panel | Optional | Audience › Alerts |
| 28 | `users` | Editorial Team | `UserManagementTab.tsx` | Essential (but stored in `localStorage`) | Users & roles |
| 29 | `admins` | Admin Security & Access | `AdminManagementTab.tsx` | Consolidate | Users & roles |

Other admin components not in the tab list: `ApiConfigTab.tsx`, `GoogleSuiteSettingsTab.tsx` (→ Integrations),
`DatabaseBackupRestoreTab.tsx` (→ Security & backups), `CitizenSubmissionsTab.tsx`, `ContactInquiriesTab.tsx`
(→ Inbox), `AiSeoAssistant*`, `AiSeoMetaGenerator.tsx`, `BulkSeoMetaEditor.tsx` (→ Editor side panel),
`AdminFrontendCustomizerBar.tsx`, `AdminSettingsModal.tsx`.

## Proposed admin (11 screens)

| Screen | Replaces | Prototype |
|---|---|---|
| Dashboard | Overview | `visual/admin-dashboard.html` |
| News (list, review queue, schedule) + Editor | 4, 5, 6 | `visual/admin-news-list.html`, `visual/admin-editor.html` |
| Live coverage | 7 | admin shell |
| Media (images, videos, photos, e-paper) | 9–12 | `visual/admin-media.html` |
| Homepage builder (sections, spotlight, ticker, sidebar) | 8, 14, 15, 19 | `visual/admin-settings.html` |
| Advertisements | 23, 24, header/footer ad fields | `visual/admin-advertisements.html` |
| Audience (subscribers, alerts, push, newsletter) | 25–27 | admin shell |
| Inbox (reader submissions, contact) | `CitizenSubmissionsTab`, `ContactInquiriesTab` | admin shell |
| SEO & sitemaps | 2, 3 | admin shell |
| Users & roles | 28, 29 | admin shell |
| Settings (branding, navigation, article page, pages, integrations, security & backups) | 13, 16–18, 20–22, API, Google suite, backups | `visual/admin-settings.html` |

## Admin component states (prototyped in `components/admin-components.html` and `empty-loading-error-states.html`)

Default, hover, focus-visible, disabled, loading (button spinner, skeleton rows), empty (with next action), error
(inline + toast), success toast, unsaved-changes bar, permission-denied panel, confirm-destructive dialog.
