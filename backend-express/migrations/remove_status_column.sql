-- Migration: Remove status column from events table
-- The status is now computed dynamically based on dates and cancellation state
-- and doesn't need to be stored in the database

ALTER TABLE events DROP COLUMN status;
