# 04 — Current sitemap (as built)

Source: `src/App.tsx` routing block (L520–600), `server.ts` routes, browser checks on the local dev server.

## Public views

| URL as used today | View | Distinct title? | Canonical | Notes |
|---|---|---|---|---|
| `/` | Home (all categories) | Site title | `https://khabridost.com` | Seed + real articles mixed |
| `/category/{id}` | Home filtered by category | No (site title) | Site root | Same layout as home |
| `/article/{id}` and `/?article={id}` | Article page | Partially (client sets title after load) | Site root | 2 H1s |
| `/#live`, `/live` | Live feed | No | Site root | 2 H1s |
| `/#epaper`, `/epaper` | E-paper | Yes ("ई-पेपर (date)") | Site root | 3 H1s, hash URL pushed (L859) |
| `/#about` | About | No | Site root | 2 H1s |
| `/#contact` | Contact | No | Site root | |
| `/#privacy-policy`, `/#terms-of-service`, `/#cookie-policy`, `/#disclaimer`, `/#grievance-redressal`, `/#fact-check-policy`, `/#editorial-ethics`, `/#corrections`, `/#dmca-notice` | Legal pages (one component) | No | Site root | 2 H1s |
| `/#submit-news`, `/#reporter` | Reader news submission | No | Site root | |
| `/#archive` | Archive | No | Site root | |
| `/#sudoku` | Sudoku modal over home | — | — | Modal |
| `/#login`, `/login` | Staff login modal over home | — | — | Shows super-admin button |
| `/#admin`, `/admin` | Admin panel overlay | — | — | Disallowed in robots |
| any other path | **Home page (HTTP 200)** | Site title | Site root | Soft 404 |

## Server endpoints visible to crawlers

| Path | Content |
|---|---|
| `/sitemap.xml` | Home, categories, articles (`server.ts` L1355) |
| `/news-sitemap.xml` | Recent articles (L1455) |
| `/rss.xml` | Feed (L1496) |
| `/robots.txt` | Allows all; disallows `/admin`, `/#admin`, `/#login` (L1530) |

## Modals that behave like pages (no URL)

Bookmarks, Read later, Subscriber preferences, Quick read panel, Article e-paper clipping, Live blog reader, All
states directory, Portal popup, Typography customiser, Media manager.
