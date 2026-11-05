# 18 — Admin component catalogue

Sheet: `components/admin-components.html` (+ `tables.html`, `forms.html`, `modals.html`,
`empty-loading-error-states.html`). Screens: `visual/admin-*.html`. Admin language: English. Base font Noto Sans 14px.

| Component | Purpose | States | Notes |
|---|---|---|---|
| App shell (sidebar 236px, top bar 56px, content) | Frame for all screens | collapsed sidebar on <1024, drawer on phones | Grouped nav: Newsroom, Content, Site, Audience & SEO, Admin |
| Top bar | Search, "New article", notifications, account | — | |
| Page head | Title + primary action | — | Wraps on phones |
| Stat tile | Dashboard counts from real data | loading, empty ("—") | No invented numbers |
| Data table | Articles, media, ads, users | selectable rows, sort, empty, loading skeleton, error | Horizontal scroll on phones |
| Status pill | Draft, Review, Scheduled, Published, Archived | — | Colour + text (not colour alone) |
| Filter bar / tabs | Status tabs, category, author, date | — | |
| Bulk action bar | Publish, archive, delete selected | appears on selection | Delete requires confirm dialog |
| Editor: title, deck, slug fields | Article meta | error, char counters | |
| Editor: toolbar + canvas | Visual and HTML modes | focus, disabled | One editor component |
| Editor: side panel | Status, schedule, category, tags, author, images, SEO preview, checklist | — | Publishing checklist (title length, image, alt text, summary) |
| Media grid + upload dropzone | Images, video, PDF | uploading progress, error, too-large | Required alt text |
| Settings form section | Grouped fields with save bar | unsaved-changes bar, saved toast | |
| Ad placement row / editor dialog | Ad slots | active, paused, draft | Direct creative needs exact size |
| Role picker / invite dialog | Users & roles | pending invite, active, removed | |
| Confirm destructive dialog | Delete/unpublish | — | Type-to-confirm for bulk delete |
| Permission-denied panel | Role cannot access | — | |
| Toasts | Success / error | auto-dismiss 5s, pause on hover | `role="status"` / `role="alert"` |
