-- ============================================
-- Light Church - Fix AUTO_INCREMENT Values
-- ============================================
-- MySQL doesn't auto-adjust AUTO_INCREMENT when IDs are explicitly specified
-- This file forces recalculation to prevent ID conflicts on new inserts

SET NAMES utf8mb4;
SET CHARACTER SET utf8mb4;

-- Fix admins: MAX(id)=31, so next should be 32
ALTER TABLE admins AUTO_INCREMENT = 32;

-- Fix churches: MAX(id)=30, so next should be 31
ALTER TABLE churches AUTO_INCREMENT = 31;

-- Fix other tables that have seeded data
ALTER TABLE activity_types AUTO_INCREMENT = 6;
ALTER TABLE church_unions AUTO_INCREMENT = 5;
ALTER TABLE denominations AUTO_INCREMENT = 7;
ALTER TABLE languages AUTO_INCREMENT = 11;
ALTER TABLE church_schedules AUTO_INCREMENT = 61;
ALTER TABLE church_socials AUTO_INCREMENT = 20;
