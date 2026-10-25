-- Hide a message from the public board without deleting it.
ALTER TABLE messages ADD COLUMN hidden INTEGER NOT NULL DEFAULT 0;

-- Wrong admin keys per visitor per day (salted daily hash, no IPs), to stop guessing.
CREATE TABLE IF NOT EXISTS auth_failures (
  who  TEXT    NOT NULL,
  day  TEXT    NOT NULL,
  n    INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (who, day)
);
