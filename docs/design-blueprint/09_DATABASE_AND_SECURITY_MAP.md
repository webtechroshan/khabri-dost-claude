# 09 — Database and security map

Database: Cloud Firestore (named database, ID in `firebase-applet-config.json` — not repeated here).
Rules: `firestore.rules` (181 lines). **No schema changes are made in Phase 1.**

## Collections

| Collection | Used by | Read today | Write today | Risk | Proposed (least privilege) |
|---|---|---|---|---|---|
| `articles` | Site, admin, server sitemaps | Published, **or no `status` field**, or admin, or own (staff) (L61) | Admin; staff own; anyone +1 `viewsCount`; signed-in likes/reactions | Old docs without `status` are public; view count spoofable | Public read only `status == "published"`; backfill `status`; views via server counter |
| `comments` | Article page | Public | Signed-in own; anyone may change `likesCount` to any number | Like spoofing | Moderation flag; likes ±1 only |
| `bookmarks`, `read_laters` | Reader | Owner | Owner | OK | Keep |
| `users` | Auth, admin | **Public** (L128) | Self (no role change) or admin | Exposes staff emails/roles | Read self or admin; public author profile in separate `authors` collection |
| `admins` | Auth | Self or admin | Admin | OK | Keep |
| `settings` | Whole site | Public | Admin | Must never hold secrets (currently stripped ✔) | Keep; add size/shape checks |
| `subscribers` | Newsletter | Admin | **Anyone, any shape** | Spam, storage abuse | Validate email + fields; rate limit via server |
| `media` | Media library | Public | Admin or staff | OK | Keep; restrict delete to admin/owner |
| `live_blogs` | Live pages | Public | Admin or staff | Drafts public | Add `status` and filter |
| `inquiries` | Contact form | Admin or staff | **Anyone, any shape** | Spam | Validate fields |
| `test` | Connection test | Public | — | Unnecessary | Remove |
| (new) `staff_invites` | Users & roles | Admin | Admin | — | Invite by email + role |
| (new) `submissions` | Reader news | Editor+ | Public create (validated) | — | Replaces in-memory store |
| (new) `revisions` | Editor history | Staff | Staff | — | Optional |

## Role matrix (proposed — current code has the same role names)

Roles in rules today: `super_admin`, `admin`, `editor`, `reporter` (+ `reader`). Keep these names identical in
`firestore.rules`, `server/config.ts` and `src/context/AuthContext.tsx`.

| Permission | Reader | Reporter | Editor | Admin | Super admin |
|---|---|---|---|---|---|
| Read published articles | ✔ | ✔ | ✔ | ✔ | ✔ |
| Create draft | — | ✔ | ✔ | ✔ | ✔ |
| Edit own draft | — | ✔ | ✔ | ✔ | ✔ |
| Edit others' articles | — | — | ✔ | ✔ | ✔ |
| Submit for review | — | ✔ | ✔ | ✔ | ✔ |
| Publish / schedule / unpublish | — | — | ✔ | ✔ | ✔ |
| Delete article | — | — | — | ✔ | ✔ |
| Live blog posts | — | ✔ (own) | ✔ | ✔ | ✔ |
| Media upload | — | ✔ | ✔ | ✔ | ✔ |
| Read submissions / inquiries | — | — | ✔ | ✔ | ✔ |
| Ads, homepage, navigation, branding | — | — | — | ✔ | ✔ |
| Users & roles | — | — | — | ✔ (not super admins) | ✔ |
| Integrations, keys, backups | — | — | — | — | ✔ |

## Authentication today vs proposed

| Today (verified in code) | Proposed |
|---|---|
| Three login methods: super-admin direct button (public), Google, email-only | Google only |
| Staff list in `localStorage['kd_editorial_users']` | `staff_invites` + `users/{uid}.role` in Firestore |
| Session in `localStorage['kd_staff_session']` | Firebase Auth session; role from Firestore |
| Admin emails hard-coded in rules and `AuthContext.tsx` L8–9 | Keep one bootstrap owner email in rules; everyone else via invites |
| Server trusts the browser | Server verifies ID token and role |

## Other security items

- Content Security Policy and `X-Frame-Options`/`frame-ancestors` headers (some headers set at `server.ts` L37).
- Restrict the Firebase browser API key to the site's domains in Google Cloud console (owner action).
- Remove `/api/security/audit-report` from public access.
- Ad scripts: allow-list of providers (AdSense/GAM) instead of free HTML.
