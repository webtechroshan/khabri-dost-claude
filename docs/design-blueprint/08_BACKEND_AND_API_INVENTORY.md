# 08 — Backend and API inventory

Source: `server.ts` (1,606 lines), commit `6c9b022`. **No route verifies a Firebase ID token.** The only
protection is the in-memory rate limiter on `/api/*` (80 requests / 60 s, L70) and a 60 MB JSON body limit (L72).

| Method | Path | Line | Purpose (from code comment) | Caller | Auth today | Proposed |
|---|---|---|---|---|---|---|
| POST | `/api/ai/generate-seo-meta` | 187 | AI SEO title, slug, description, tags | Admin editor | None | `requireRole(reporter+)` |
| POST | `/api/ai/quick-read` | 337 | 3-bullet summary | Public article page | None | Public, cached per article, stricter rate limit |
| POST | `/api/admin/validate-key` | 418 | Test AI provider keys (accepts key in body) | Admin | None | `requireRole(admin)`; never echo keys |
| POST | `/api/ai/draft-article-seo` | 577 | Full article + SEO drafter | Admin | None | `requireRole(reporter+)` |
| GET | `/api/ai/google-trends` | 825 | Returns a fixed array `GOOGLE_TRENDS_DATA` (L717), not live Google Trends | Admin | None | Rename or connect a real source; staff only |
| POST | `/api/ai/generate-trend-article` | 844 | AI news writer | Admin | None | `requireRole(editor+)`; label output as AI draft |
| POST | `/api/social/webhook-dispatch` | 972 | Forward article to Zapier/Telegram/etc.; blocks private targets (`isSafeExternalUrl`) | Admin | None | `requireRole(editor+)`; webhook URLs stored server-side |
| POST | `/api/citizen-news/submit` | 1026 | Reader submission, honeypot | Public | None (correct) | Keep public; store in Firestore; add CAPTCHA option |
| GET | `/api/citizen-news/list` | 1102 | List submissions; **any** `x-admin-key`/`Authorization` header unredacts phone and email (L1103–1104) | Admin | Broken | `requireRole(editor+)` |
| POST | `/api/ai/generate-news-image` | 1124 | Generate/suggest image | Admin | None | `requireRole(reporter+)` |
| GET | `/api/security/audit-report` | 1171 | Security "health" report | Admin | None | Remove from public, or `requireRole(admin)` |
| POST | `/api/sitemap/sync-articles` | 1212 | Browser pushes article list into the server sitemap registry | Browser | None — anyone can add URLs to the sitemap | Remove; server reads published articles itself |
| POST | `/api/news/slugify` | 1241 | Latin slug from Hindi title | Admin | None | Keep (pure function) or move to client |
| POST | `/api/epaper/upload-pdf` | 1302 | Upload PDF as base64 to disk | Admin | None | `requireRole(editor+)`; multipart, size/type checks, Storage |
| GET | `/sitemap.xml` | 1355 | Sitemap | Crawlers | Public | Keep; base URL from config |
| GET | `/news-sitemap.xml` | 1455 | News sitemap | Crawlers | Public | Keep; last 48 h, published only |
| GET | `/rss.xml` | 1496 | RSS | Readers | Public | Keep |
| GET | `/robots.txt` | 1530 | Robots | Crawlers | Public | Keep; base URL from config |
| GET | `/api/health` | 1543 | Health check | Ops | Public | Keep |
| GET | `*` | 1563 / 1579 | SPA fallback | All | Public | Per-URL head + real 404 status |

## Data held only in server memory (lost on restart)

| Store | Line | Proposed |
|---|---|---|
| `citizenSubmissionsStore` | 87 | Firestore `submissions` (staff read, public create with validation) |
| Sitemap registry fed by `/api/sitemap/sync-articles` | 1212 | Remove; query Firestore published articles |
| Rate-limit counters | 70 | Fine for one process; document limits for multi-process hosting |

## Proposed server helpers (Phase 2)

- `verifyIdToken(req)` via Google's public keys (no service account needed) and `requireRole(...roles)` reading
  `users/{uid}.role` through the Firestore REST API under the same rules.
- `authFetch()` in the browser adds `Authorization: Bearer <idToken>`.
- One `config.ts` for base URL, allowed origins and role lists (kept identical to `firestore.rules`).
