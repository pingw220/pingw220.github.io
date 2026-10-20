# Visitor-map API

GitHub Pages can't run server code, so the Global Reach map on the site gets its
data from this small Cloudflare Worker. Cloudflare looks up each visitor's
approximate city from their IP, and the Worker stores **only per-city totals** in
a D1 (SQLite) database. Each visitor is counted at most once per day using a
salted hash that rotates daily; IP addresses are never stored.

Everything here fits in Cloudflare's free plan.

## One-time setup

Run these from this `visitor-api/` folder:

```sh
# 1. Log in to Cloudflare (opens a browser; free account is fine)
npx wrangler login

# 2. Create the database, then paste the printed `database_id` into wrangler.toml
npx wrangler d1 create visitor-map

# 3. Create the tables
npx wrangler d1 execute visitor-map --remote --file=schema.sql

# 4. Set a random secret used to hash IPs (paste any long random string)
npx wrangler secret put HASH_SALT

# 5. Set the key that unlocks the message inbox (any long random string; keep it private)
npx wrangler secret put ADMIN_KEY

# 6. Deploy
npx wrangler deploy
```

`wrangler deploy` prints the Worker URL, e.g.
`https://pingw220-visitor-api.<your-subdomain>.workers.dev`. Put that URL in
`SITE.visitorApi` in `src/config/site.ts`, then commit and push. The site will
start recording visits and the map will show live data.

## What it counts

- **Visitors** (`visits` column): each visitor at most once per UTC day, per city.
- **Visits** (`views` column): every page view.

Databases created before page views were counted need a one-time migration:

```sh
npx wrangler d1 execute visitor-map --remote --file=migrations-0001-views.sql
```

## Messages (Playground post office)

Visitors can leave a message from the Playground's post office, marked **public** or **private**.

| Endpoint | Who | What |
| --- | --- | --- |
| `POST /messages` | anyone (from the site) | `{ name, message, public }`; name ≤ 40 chars, message ≤ 800, at most 5 per visitor per day |
| `GET /messages` | anyone | the latest 50 **public** messages |
| `GET /inbox` | `Authorization: Bearer <ADMIN_KEY>` | every message, public and private |
| `DELETE /messages/:id` | `Authorization: Bearer <ADMIN_KEY>` | removes a message |

Read them at `https://pingw220.github.io/admin/inbox.html` (enter the admin key once; it's
remembered in that browser). Only a salted daily hash of the sender is kept, for the rate limit.

Databases created before messages existed need a one-time migration:

```sh
npx wrangler d1 execute visitor-map --remote --file=migrations-0002-messages.sql
```

## Checking it

```sh
curl https://pingw220-visitor-api.<your-subdomain>.workers.dev/stats \
  -H "Origin: https://pingw220.github.io"
```

To reset the counts: `npx wrangler d1 execute visitor-map --remote --command "DELETE FROM cities"`.

If you serve the site from another domain, add it to `ALLOWED_ORIGINS` in
`wrangler.toml` and run `npx wrangler deploy` again.
