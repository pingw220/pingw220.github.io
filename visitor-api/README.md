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

# 5. Deploy
npx wrangler deploy
```

`wrangler deploy` prints the Worker URL, e.g.
`https://pingw220-visitor-api.<your-subdomain>.workers.dev`. Put that URL in
`SITE.visitorApi` in `src/config/site.ts`, then commit and push. The site will
start recording visits and the map will show live data.

## Checking it

```sh
curl https://pingw220-visitor-api.<your-subdomain>.workers.dev/stats \
  -H "Origin: https://pingw220.github.io"
```

To reset the counts: `npx wrangler d1 execute visitor-map --remote --command "DELETE FROM cities"`.

If you serve the site from another domain, add it to `ALLOWED_ORIGINS` in
`wrangler.toml` and run `npx wrangler deploy` again.
