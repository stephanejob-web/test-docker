-- Migration: Refactor event status system (V2 - simplified)
-- Date: 2025-12-26
-- Description: Update ENUM values and migrate data

-- Step 1: Expand ENUM to include both old and new values temporarily
ALTER TABLE events
MODIFY COLUMN status ENUM('PUBLISHED', 'CANCELLED', 'DRAFT', 'COMPLETED', 'UPCOMING', 'ONGOING')
DEFAULT 'UPCOMING' NOT NULL;

-- Step 2: Migrate existing data
-- Convert 'PUBLISHED' to appropriate status based on dates
UPDATE events
SET status = 'UPCOMING'
WHERE status = 'PUBLISHED' AND start_datetime > NOW();

UPDATE events
SET status = 'ONGOING'
WHERE status = 'PUBLISHED' AND NOW() BETWEEN start_datetime AND end_datetime;

UPDATE events
SET status = 'COMPLETED'
WHERE status = 'PUBLISHED' AND end_datetime < NOW();

-- Convert 'DRAFT' to 'UPCOMING' (no more draft concept)
UPDATE events
SET status = 'UPCOMING'
WHERE status = 'DRAFT';

-- Keep CANCELLED as is

-- Step 3: Finalize ENUM to only new values
ALTER TABLE events
MODIFY COLUMN status ENUM('UPCOMING', 'ONGOING', 'COMPLETED', 'CANCELLED')
DEFAULT 'UPCOMING' NOT NULL;

-- Step 4: Add indexes for performance
-- Note: These may fail if already exist, that's OK
-- CREATE INDEX idx_events_status_dates ON events(status, start_datetime, end_datetime);
-- CREATE INDEX idx_events_cancelled_at ON events(cancelled_at);

-- Note: The actual status will be calculated dynamically in the backend based on:
-- - If cancelled_at IS NOT NULL -> 'CANCELLED'
-- - If NOW() < start_datetime -> 'UPCOMING'
-- - If NOW() BETWEEN start_datetime AND end_datetime -> 'ONGOING'
-- - If NOW() > end_datetime -> 'COMPLETED'
