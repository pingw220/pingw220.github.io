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
