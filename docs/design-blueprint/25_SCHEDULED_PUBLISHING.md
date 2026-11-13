# 25 — Scheduled publishing (server)

**What it does:** when an editor schedules an article, the server publishes it at that time — every
minute it looks for articles with status `scheduled` whose time has passed and sets them to
`published`. No editor needs to have the site open. The article's public date (`publishedAt`) is the
scheduled time, and sitemaps, RSS and pages update straight away.

| Piece | Where |
|---|---|
| Job (runs inside the Express server) | `server/scheduler.ts`, started from `server.ts` |
| Status | `GET /api/health` → `"scheduler": "on" \| "off" \| "error"`; details for editors at `GET /api/scheduler/status` |
| Editor | Write article → Schedule; the help text says whether automatic scheduling is on |
| Fallback when the job is off | An editor's browser publishes due articles while the newsroom is open (old behaviour) |
| Publish date | `publishedAt` is set on first publish (editor, scheduler or fallback); readers, feeds and JSON-LD use it |

## Why it needs a credential

The rest of the server only *reads* public data and checks staff tokens; it has no admin access.
Publishing on a schedule is a *write* with nobody signed in, so the job needs a Firebase service
account. It is used for this job only.

## Set-up (owner, once)

1. Firebase console → Project settings → **Service accounts** → **Generate new private key**.
   A JSON file downloads. Treat it like a password.
2. Copy it to the server **outside the website folder**, e.g. `/etc/khabri-dost/service-account.json`, then:
   ```bash
   chmod 600 /etc/khabri-dost/service-account.json
   ```
3. In the server environment (`.env` or the process manager), set:
   ```bash
   FIREBASE_SERVICE_ACCOUNT_FILE=/etc/khabri-dost/service-account.json
   ```
4. Restart the server and open `https://<your-site>/api/health` — it should show `"scheduler":"on"`.
5. Never commit the file, never paste it into the admin, and never put it in the `settings` collection.

## Safety

- Each article is published inside a Firestore transaction: two server instances never double-publish, and
  if an editor changed the status in the meantime, the editor's change wins.
- Only articles with status `scheduled` and a past `scheduledFor` are touched; drafts, reviews and future
  schedules are left alone.
- `SCHEDULER_DISABLED=true` turns the job off; `SCHEDULER_INTERVAL_MS` changes the interval (minimum 5 s).

## Tests

- `tests/unit/scheduler.test.ts` — which articles are due.
- `tests/rules/scheduler.emulator.test.ts` — publishes against the Firestore emulator, sets `publishedAt`,
  leaves others alone, second run publishes nothing (`npm run test:rules`).
- `scripts/e2e-local.sh` — starts the real server on the emulator; an overdue seeded article must become
  public (HTTP 200) and a future one must stay hidden (HTTP 404). Runs in CI.

## Not verified here

Running with a real service account against the production project (by design: no production access).
After set-up, schedule a test article a few minutes ahead and confirm it goes live.
