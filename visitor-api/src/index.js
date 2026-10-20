/**
 * Visitor-map API for the personal site (a Cloudflare Worker + D1 database).
 *
 * GitHub Pages only serves static files, so the site calls this Worker to record
 * a visit and to read the aggregated map data. Cloudflare resolves the visitor's
 * approximate city from their IP (`request.cf`), so the browser never calls a
 * third-party geo-IP service and no IP address is ever stored — only a salted,
 * daily-rotating hash used to count each visitor at most once per day.
 *
 *   POST /visit  → record this visit (if not already counted today), return stats
 *   GET  /stats  → return stats
 *
 * Guestbook (the Playground's post office):
 *   POST   /messages      { name?, message, public, website? } → leave a message
 *   GET    /messages      → public messages, newest first
 *   GET    /inbox         → every message, incl. private (Authorization: Bearer ADMIN_KEY)
 *   DELETE /messages/:id  → delete a message (Authorization: Bearer ADMIN_KEY)
 *
 * Response: { since: ISO date | null, cities: [{ city, country, lat, lon, visits, views }] }
 *   visits = visitors (each counted at most once per day); views = every page view.
 */

const BOT_UA = /bot|crawl|spider|slurp|preview|headless|lighthouse|monitor|curl|wget|python|http/i;

export default {
  async fetch(request, env) {
    const cors = corsHeaders(request, env);
    if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers: cors });

    const { pathname } = new URL(request.url);
    try {
      if (pathname === '/visit' && request.method === 'POST') {
        await recordVisit(request, env);
        return json(await readStats(env), cors);
      }
      if (pathname === '/stats' && request.method === 'GET') {
        return json(await readStats(env), cors, 'public, max-age=60');
      }
      if (pathname === '/messages' && request.method === 'POST') return json(await postMessage(request, env), cors);
      if (pathname === '/messages' && request.method === 'GET') return json(await publicMessages(env), cors);
      if (pathname === '/inbox' && request.method === 'GET') {
        if (!isAdmin(request, env)) return json({ error: 'unauthorized' }, cors, 'no-store', 401);
        return json(await allMessages(env), cors);
      }
      const del = pathname.match(/^\/messages\/(\d+)$/);
      if (del && request.method === 'DELETE') {
        if (!isAdmin(request, env)) return json({ error: 'unauthorized' }, cors, 'no-store', 401);
        await env.DB.prepare('DELETE FROM messages WHERE id = ?').bind(Number(del[1])).run();
        return json({ ok: true }, cors);
      }
      return new Response('Not found', { status: 404, headers: cors });
    } catch (err) {
      console.error(err);
      return new Response('Server error', { status: 500, headers: cors });
    }
  },
};

async function recordVisit(request, env) {
  // Only count visits made from the site itself.
  if (!isAllowedOrigin(request.headers.get('Origin'), env)) return;
  if (BOT_UA.test(request.headers.get('User-Agent') ?? '')) return;

  const cf = request.cf ?? {};
  const lat = Number(cf.latitude);
  const lon = Number(cf.longitude);
  if (!cf.country || !Number.isFinite(lat) || !Number.isFinite(lon)) return;

  // Every page view counts as a visit; each visitor is counted at most once per
  // UTC day, using a salted daily hash instead of storing their IP.
  const day = new Date().toISOString().slice(0, 10);
  const ip = request.headers.get('CF-Connecting-IP') ?? '';
  const hash = await sha256(`${env.HASH_SALT ?? ''}|${day}|${ip}`);
  const seen = await env.DB.prepare('INSERT OR IGNORE INTO seen (hash, day) VALUES (?, ?)').bind(hash, day).run();
  const newVisitor = seen.meta.changes ? 1 : 0;

  const country = countryName(cf.country);
  const city = cf.city || 'Unknown city';
  await env.DB.batch([
    env.DB.prepare(
      `INSERT INTO cities (city, country, lat, lon, visits, views) VALUES (?, ?, ?, ?, ?, 1)
       ON CONFLICT (city, country) DO UPDATE SET visits = visits + excluded.visits, views = views + 1`,
    ).bind(city, country, lat, lon, newVisitor),
    // Hashes are only needed for today's de-duplication.
    env.DB.prepare('DELETE FROM seen WHERE day < ?').bind(day),
  ]);
}

const MAX_NAME = 40;
const MAX_MESSAGE = 800;
const MAX_PER_DAY = 5; // per visitor

async function postMessage(request, env) {
  if (!isAllowedOrigin(request.headers.get('Origin'), env)) return { error: 'forbidden' };
  let body;
  try {
    body = await request.json();
  } catch {
    return { error: 'bad request' };
  }
  // Honeypot: real visitors never fill the hidden "website" field.
  if (body.website) return { ok: true };
  const name = String(body.name ?? '').trim().slice(0, MAX_NAME);
  const message = String(body.message ?? '').trim();
  if (!message) return { error: 'empty' };
  if (message.length > MAX_MESSAGE) return { error: 'too long' };
  const isPublic = body.public === true ? 1 : 0;

  // Rate limit with the same salted daily hash as visits (no IPs stored).
  const day = new Date().toISOString().slice(0, 10);
  const ip = request.headers.get('CF-Connecting-IP') ?? '';
  const who = await sha256(`${env.HASH_SALT ?? ''}|msg|${day}|${ip}`);
  const count = await env.DB.prepare('SELECT COUNT(*) AS n FROM messages WHERE sender = ? AND day = ?').bind(who, day).first();
  if ((count?.n ?? 0) >= MAX_PER_DAY) return { error: 'rate limited' };

  await env.DB.prepare('INSERT INTO messages (name, message, public, sender, day) VALUES (?, ?, ?, ?, ?)')
    .bind(name, message, isPublic, who, day)
    .run();
  return { ok: true };
}

async function publicMessages(env) {
  const rows = await env.DB.prepare(
    "SELECT id, name, message, strftime('%Y-%m-%dT%H:%M:%SZ', created_at) AS date FROM messages WHERE public = 1 ORDER BY id DESC LIMIT 50",
  ).all();
  return { messages: rows.results };
}

async function allMessages(env) {
  const rows = await env.DB.prepare(
    "SELECT id, name, message, public, strftime('%Y-%m-%dT%H:%M:%SZ', created_at) AS date FROM messages ORDER BY id DESC LIMIT 500",
  ).all();
  return { messages: rows.results };
}

function isAdmin(request, env) {
  const auth = request.headers.get('Authorization') ?? '';
  return Boolean(env.ADMIN_KEY) && auth === `Bearer ${env.ADMIN_KEY}`;
}

async function readStats(env) {
  const [rows, first] = await env.DB.batch([
    env.DB.prepare('SELECT city, country, lat, lon, visits, views FROM cities ORDER BY visits DESC'),
    env.DB.prepare("SELECT strftime('%Y-%m-%dT%H:%M:%SZ', MIN(first_seen)) AS since FROM cities"),
  ]);
  return { since: first.results[0]?.since ?? null, cities: rows.results };
}

function countryName(code) {
  try {
    return new Intl.DisplayNames(['en'], { type: 'region' }).of(code) ?? code;
  } catch {
    return code;
  }
}

async function sha256(text) {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text));
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, '0')).join('');
}

function isAllowedOrigin(origin, env) {
  const allowed = (env.ALLOWED_ORIGINS ?? '').split(',').map((s) => s.trim());
  return Boolean(origin) && allowed.includes(origin);
}

function corsHeaders(request, env) {
  const origin = request.headers.get('Origin');
  return {
    'Access-Control-Allow-Origin': isAllowedOrigin(origin, env) ? origin : 'null',
    'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    Vary: 'Origin',
  };
}

function json(body, headers, cacheControl = 'no-store', status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...headers, 'Content-Type': 'application/json', 'Cache-Control': cacheControl },
  });
}
