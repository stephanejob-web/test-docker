-- ============================================
-- Light Church - Reference Data Seeder
-- ============================================
-- This file contains all reference/lookup tables that don't depend on user data
-- Order matters due to foreign key constraints

SET NAMES utf8mb4;
SET CHARACTER SET utf8mb4;

-- ============================================
-- 1. CHURCH UNIONS (no dependencies)
-- ============================================
INSERT INTO church_unions (id, name, abbreviation, website, is_active) VALUES
(1, 'Conseil National des Évangéliques de France', 'CNEF', 'https://lecnef.org', 1),
(2, 'Fédération Protestante de France', 'FPF', 'https://www.protestants.org', 1),
(3, 'Assemblées de Dieu de France', 'ADD France', 'https://www.add.fr', 1),
(4, 'Indépendant', NULL, NULL, 1);

-- ============================================
-- 2. DENOMINATIONS (depends on church_unions)
-- ============================================
INSERT INTO denominations (id, union_id, name, abbreviation, is_active) VALUES
(1, 3, 'Assemblées de Dieu', 'ADD', 1),
(2, 1, 'Église Évangélique', 'EE', 1),
(3, 1, 'Église Baptiste', 'EB', 1),
(4, 2, 'Église Protestante Unie', 'EPU', 1),
(5, 1, 'Église Pentecôtiste', 'EP', 1),
(6, 4, 'Église Indépendante', NULL, 1);

-- ============================================
-- 3. LANGUAGES (no dependencies)
-- IMPORTANT: id=10 is used as DEFAULT in schema for church_details and events
-- ============================================
INSERT INTO languages (id, code, name_native, name_fr, flag_emoji, is_active, display_order) VALUES
(1, 'en', 'English', 'Anglais', '🇬🇧', 1, 2),
(2, 'es', 'Español', 'Espagnol', '🇪🇸', 1, 3),
(3, 'pt', 'Português', 'Portugais', '🇵🇹', 1, 4),
(4, 'de', 'Deutsch', 'Allemand', '🇩🇪', 1, 5),
(5, 'it', 'Italiano', 'Italien', '🇮🇹', 1, 6),
(6, 'ar', 'العربية', 'Arabe', '🇸🇦', 1, 7),
(7, 'zh', '中文', 'Chinois', '🇨🇳', 1, 8),
(8, 'ru', 'Русский', 'Russe', '🇷🇺', 1, 9),
(9, 'pl', 'Polski', 'Polonais', '🇵🇱', 1, 10),
(10, 'fr', 'Français', 'Français', '🇫🇷', 1, 1);  -- DEFAULT language in schema

-- ============================================
-- 4. ACTIVITY TYPES (no dependencies)
-- ============================================
INSERT INTO activity_types (id, name, label_fr, icon) VALUES
(1, 'WORSHIP', 'Culte', '⛪'),
(2, 'PRAYER', 'Prière', '🙏'),
(3, 'BIBLE_STUDY', 'Étude Biblique', '📖'),
(4, 'YOUTH', 'Groupe de Jeunes', '👥'),
(5, 'CHILDREN', 'École du Dimanche', '👶');
