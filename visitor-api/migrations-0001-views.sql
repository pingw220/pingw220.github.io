-- One-time migration for databases created before page views were counted.
-- Earlier page views weren't recorded, so start each city's views at its visitor count.
ALTER TABLE cities ADD COLUMN views INTEGER NOT NULL DEFAULT 0;
UPDATE cities SET views = visits;
