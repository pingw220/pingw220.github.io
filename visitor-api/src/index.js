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
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    Vary: 'Origin',
  };
}

function json(body, headers, cacheControl = 'no-store') {
  return new Response(JSON.stringify(body), {
    headers: { ...headers, 'Content-Type': 'application/json', 'Cache-Control': cacheControl },
  });
}
