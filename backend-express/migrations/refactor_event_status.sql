-- Migration: Refactor event status system
-- Date: 2025-12-26
-- Description:
--   - Remove 'draft' and 'published' status
--   - Add automatic status calculation based on dates
--   - Add cancellation support with reason

-- Step 1: Add new columns for cancellation
ALTER TABLE events
ADD COLUMN cancellation_reason TEXT NULL,
ADD COLUMN cancelled_at TIMESTAMP NULL,
ADD COLUMN cancelled_by INT NULL,
ADD CONSTRAINT fk_events_cancelled_by FOREIGN KEY (cancelled_by) REFERENCES admins(id) ON DELETE SET NULL;

-- Step 2: Expand ENUM to include both old and new values temporarily
ALTER TABLE events
MODIFY COLUMN status ENUM('PUBLISHED', 'CANCELLED', 'DRAFT', 'COMPLETED', 'UPCOMING', 'ONGOING')
DEFAULT 'UPCOMING' NOT NULL;

-- Step 3: Migrate existing data
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

-- Keep CANCELLED as is (it's already in both old and new)

-- Step 4: Finalize ENUM to only new values
ALTER TABLE events
MODIFY COLUMN status ENUM('UPCOMING', 'ONGOING', 'COMPLETED', 'CANCELLED')
DEFAULT 'UPCOMING' NOT NULL;

-- Step 5: Add index for performance on status queries
CREATE INDEX idx_events_status_dates ON events(status, start_datetime, end_datetime);
CREATE INDEX idx_events_cancelled_at ON events(cancelled_at);

-- Note: The actual status will be calculated dynamically in the backend based on:
-- - If cancelled_at IS NOT NULL -> 'CANCELLED'
-- - If NOW() < start_datetime -> 'UPCOMING'
-- - If NOW() BETWEEN start_datetime AND end_datetime -> 'ONGOING'
-- - If NOW() > end_datetime -> 'COMPLETED'
