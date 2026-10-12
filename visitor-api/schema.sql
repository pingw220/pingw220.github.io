-- Aggregated visits per city. No per-visitor rows are kept.
CREATE TABLE IF NOT EXISTS cities (
  city       TEXT    NOT NULL,
  country    TEXT    NOT NULL,
  lat        REAL    NOT NULL,
  lon        REAL    NOT NULL,
  visits     INTEGER NOT NULL DEFAULT 0,
  first_seen TEXT    NOT NULL DEFAULT (datetime('now')),
  PRIMARY KEY (city, country)
);

-- Salted, daily-rotating hashes used only to count each visitor once per day.
CREATE TABLE IF NOT EXISTS seen (
  hash TEXT PRIMARY KEY,
  day  TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS seen_day ON seen (day);
