-- Aggregated visits per city. No per-visitor rows are kept.
CREATE TABLE IF NOT EXISTS cities (
  city       TEXT    NOT NULL,
  country    TEXT    NOT NULL,
  lat        REAL    NOT NULL,
  lon        REAL    NOT NULL,
  visits     INTEGER NOT NULL DEFAULT 0, -- visitors, each counted at most once per day
  views      INTEGER NOT NULL DEFAULT 0, -- every page view
  first_seen TEXT    NOT NULL DEFAULT (datetime('now')),
  PRIMARY KEY (city, country)
);

-- Salted, daily-rotating hashes used only to count each visitor once per day.
CREATE TABLE IF NOT EXISTS seen (
  hash TEXT PRIMARY KEY,
  day  TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS seen_day ON seen (day);

-- Guestbook messages for the Playground's post office.
CREATE TABLE IF NOT EXISTS messages (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  name       TEXT    NOT NULL DEFAULT '',
  message    TEXT    NOT NULL,
  public     INTEGER NOT NULL DEFAULT 0,   -- 1 = shown on the board, 0 = only for Ping
  sender     TEXT    NOT NULL,             -- salted daily hash, for rate limiting only
  day        TEXT    NOT NULL,
  created_at TEXT    NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS messages_public ON messages (public, id);
CREATE INDEX IF NOT EXISTS messages_sender ON messages (sender, day);
