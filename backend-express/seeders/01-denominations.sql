-- ==================================================
-- SEEDER : Dénominations
-- ==================================================

SET NAMES utf8mb4;
SET CHARACTER SET utf8mb4;

INSERT INTO church_unions (id, name, abbreviation, website, is_active) VALUES
(1, 'Conseil National des Évangéliques de France', 'CNEF', 'https://lecnef.org', 1),
(2, 'Fédération Protestante de France', 'FPF', 'https://www.protestants.org', 1),
(3, 'Assemblées de Dieu de France', 'ADD France', 'https://www.add.fr', 1);

INSERT INTO denominations (id, name, union_id) VALUES
(1, 'Assemblée de Dieu', 3),
(2, 'Église Évangélique Libre', 1),
(3, 'Église Baptiste', 1),
(4, 'Église Pentecôtiste', 1),
(5, 'Église Protestante Unie', 2),
(6, 'Église du Plein Évangile', 1),
(7, 'Église Évangélique Méthodiste', 2),
(8, 'Centre Chrétien', NULL);

INSERT INTO activity_types (id, name, label_fr, icon) VALUES
(1, 'sunday_service', 'Culte Dominical', 'church'),
(2, 'prayer', 'Réunion de Prière', 'praying-hands'),
(3, 'bible_study', 'Étude Biblique', 'book'),
(4, 'youth', 'Groupe de Jeunes', 'users'),
(5, 'worship', 'Louange et Adoration', 'music');

INSERT INTO languages (id, code, name_native, name_fr, flag_emoji, is_active, display_order) VALUES
(1, 'fr', 'Français', 'Français', '🇫🇷', 1, 1),
(2, 'en', 'English', 'Anglais', '🇬🇧', 1, 2),
(3, 'es', 'Español', 'Espagnol', '🇪🇸', 1, 3);
