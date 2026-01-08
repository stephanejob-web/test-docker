
-- ==================================================
-- SEEDER : Églises et Pasteurs
-- ==================================================
-- 30 églises : 10 Paris, 10 Toulon, 10 Ollioules
-- Mot de passe : 780662aB2 (pour tous les comptes)
-- ==================================================

SET NAMES utf8mb4;
SET CHARACTER SET utf8mb4;

-- ==========================================
-- ADMIN SUPER_ADMIN
-- ==========================================
-- Email: admin@lightchurch.fr
-- Password: 780662aB2
INSERT INTO admins (id, email, password_hash, role, status, first_name, last_name) VALUES
(1, 'admin@lightchurch.fr', '$2b$10$AzaCCLYpZwe0oOYQR9nfEuX5JrbUSrIJMxx/eULcJp1N/erMfxq2.', 'SUPER_ADMIN', 'VALIDATED', 'Jean', 'Administrateur');

-- ==========================================
-- PASTEURS (30 pasteurs - 1 par église)
-- ==========================================
-- Password: 780662aB2 (pour tous)
INSERT INTO admins (id, email, password_hash, role, status, first_name, last_name) VALUES
-- Paris (10 pasteurs)
(101, 'p.martin@paris1.fr', '$2b$10$AzaCCLYpZwe0oOYQR9nfEuX5JrbUSrIJMxx/eULcJp1N/erMfxq2.', 'PASTOR', 'VALIDATED', 'Pierre', 'Martin'),
(102, 'j.dubois@paris2.fr', '$2b$10$AzaCCLYpZwe0oOYQR9nfEuX5JrbUSrIJMxx/eULcJp1N/erMfxq2.', 'PASTOR', 'VALIDATED', 'Jacques', 'Dubois'),
(103, 'm.bernard@paris3.fr', '$2b$10$AzaCCLYpZwe0oOYQR9nfEuX5JrbUSrIJMxx/eULcJp1N/erMfxq2.', 'PASTOR', 'VALIDATED', 'Marc', 'Bernard'),
(104, 'l.petit@paris4.fr', '$2b$10$AzaCCLYpZwe0oOYQR9nfEuX5JrbUSrIJMxx/eULcJp1N/erMfxq2.', 'PASTOR', 'VALIDATED', 'Luc', 'Petit'),
(105, 'a.robert@paris5.fr', '$2b$10$AzaCCLYpZwe0oOYQR9nfEuX5JrbUSrIJMxx/eULcJp1N/erMfxq2.', 'PASTOR', 'VALIDATED', 'André', 'Robert'),
(106, 's.richard@paris6.fr', '$2b$10$AzaCCLYpZwe0oOYQR9nfEuX5JrbUSrIJMxx/eULcJp1N/erMfxq2.', 'PASTOR', 'VALIDATED', 'Stéphane', 'Richard'),
(107, 'd.simon@paris7.fr', '$2b$10$AzaCCLYpZwe0oOYQR9nfEuX5JrbUSrIJMxx/eULcJp1N/erMfxq2.', 'PASTOR', 'VALIDATED', 'David', 'Simon'),
(108, 'p.laurent@paris8.fr', '$2b$10$AzaCCLYpZwe0oOYQR9nfEuX5JrbUSrIJMxx/eULcJp1N/erMfxq2.', 'PASTOR', 'VALIDATED', 'Philippe', 'Laurent'),
(109, 'm.michel@paris9.fr', '$2b$10$AzaCCLYpZwe0oOYQR9nfEuX5JrbUSrIJMxx/eULcJp1N/erMfxq2.', 'PASTOR', 'VALIDATED', 'Michel', 'Michel'),
(110, 'j.lefebvre@paris10.fr', '$2b$10$AzaCCLYpZwe0oOYQR9nfEuX5JrbUSrIJMxx/eULcJp1N/erMfxq2.', 'PASTOR', 'VALIDATED', 'Jean', 'Lefebvre'),

-- Toulon (10 pasteurs)
(201, 'c.moreau@toulon1.fr', '$2b$10$AzaCCLYpZwe0oOYQR9nfEuX5JrbUSrIJMxx/eULcJp1N/erMfxq2.', 'PASTOR', 'VALIDATED', 'Christian', 'Moreau'),
(202, 'f.girard@toulon2.fr', '$2b$10$AzaCCLYpZwe0oOYQR9nfEuX5JrbUSrIJMxx/eULcJp1N/erMfxq2.', 'PASTOR', 'VALIDATED', 'François', 'Girard'),
(203, 'g.bonnet@toulon3.fr', '$2b$10$AzaCCLYpZwe0oOYQR9nfEuX5JrbUSrIJMxx/eULcJp1N/erMfxq2.', 'PASTOR', 'VALIDATED', 'Gérard', 'Bonnet'),
(204, 'n.fontaine@toulon4.fr', '$2b$10$AzaCCLYpZwe0oOYQR9nfEuX5JrbUSrIJMxx/eULcJp1N/erMfxq2.', 'PASTOR', 'VALIDATED', 'Nicolas', 'Fontaine'),
(205, 'r.rousseau@toulon5.fr', '$2b$10$AzaCCLYpZwe0oOYQR9nfEuX5JrbUSrIJMxx/eULcJp1N/erMfxq2.', 'PASTOR', 'VALIDATED', 'René', 'Rousseau'),
(206, 'p.vincent@toulon6.fr', '$2b$10$AzaCCLYpZwe0oOYQR9nfEuX5JrbUSrIJMxx/eULcJp1N/erMfxq2.', 'PASTOR', 'VALIDATED', 'Paul', 'Vincent'),
(207, 'a.lambert@toulon7.fr', '$2b$10$AzaCCLYpZwe0oOYQR9nfEuX5JrbUSrIJMxx/eULcJp1N/erMfxq2.', 'PASTOR', 'VALIDATED', 'Alain', 'Lambert'),
(208, 'j.muller@toulon8.fr', '$2b$10$AzaCCLYpZwe0oOYQR9nfEuX5JrbUSrIJMxx/eULcJp1N/erMfxq2.', 'PASTOR', 'VALIDATED', 'Jacques', 'Muller'),
(209, 'b.lefevre@toulon9.fr', '$2b$10$AzaCCLYpZwe0oOYQR9nfEuX5JrbUSrIJMxx/eULcJp1N/erMfxq2.', 'PASTOR', 'VALIDATED', 'Bernard', 'Lefevre'),
(210, 'm.faure@toulon10.fr', '$2b$10$AzaCCLYpZwe0oOYQR9nfEuX5JrbUSrIJMxx/eULcJp1N/erMfxq2.', 'PASTOR', 'VALIDATED', 'Maurice', 'Faure'),

-- Ollioules (10 pasteurs)
(301, 'e.dupont@ollioules1.fr', '$2b$10$AzaCCLYpZwe0oOYQR9nfEuX5JrbUSrIJMxx/eULcJp1N/erMfxq2.', 'PASTOR', 'VALIDATED', 'Étienne', 'Dupont'),
(302, 'l.andre@ollioules2.fr', '$2b$10$AzaCCLYpZwe0oOYQR9nfEuX5JrbUSrIJMxx/eULcJp1N/erMfxq2.', 'PASTOR', 'VALIDATED', 'Luc', 'André'),
(303, 'j.mercier@ollioules3.fr', '$2b$10$AzaCCLYpZwe0oOYQR9nfEuX5JrbUSrIJMxx/eULcJp1N/erMfxq2.', 'PASTOR', 'VALIDATED', 'Julien', 'Mercier'),
(304, 'c.blanc@ollioules4.fr', '$2b$10$AzaCCLYpZwe0oOYQR9nfEuX5JrbUSrIJMxx/eULcJp1N/erMfxq2.', 'PASTOR', 'VALIDATED', 'Claude', 'Blanc'),
(305, 'r.guerin@ollioules5.fr', '$2b$10$AzaCCLYpZwe0oOYQR9nfEuX5JrbUSrIJMxx/eULcJp1N/erMfxq2.', 'PASTOR', 'VALIDATED', 'Robert', 'Guérin'),
(306, 't.boyer@ollioules6.fr', '$2b$10$AzaCCLYpZwe0oOYQR9nfEuX5JrbUSrIJMxx/eULcJp1N/erMfxq2.', 'PASTOR', 'VALIDATED', 'Thierry', 'Boyer'),
(307, 'p.garnier@ollioules7.fr', '$2b$10$AzaCCLYpZwe0oOYQR9nfEuX5JrbUSrIJMxx/eULcJp1N/erMfxq2.', 'PASTOR', 'VALIDATED', 'Pascal', 'Garnier'),
(308, 'y.chevalier@ollioules8.fr', '$2b$10$AzaCCLYpZwe0oOYQR9nfEuX5JrbUSrIJMxx/eULcJp1N/erMfxq2.', 'PASTOR', 'VALIDATED', 'Yves', 'Chevalier'),
(309, 'f.francois@ollioules9.fr', '$2b$10$AzaCCLYpZwe0oOYQR9nfEuX5JrbUSrIJMxx/eULcJp1N/erMfxq2.', 'PASTOR', 'VALIDATED', 'Fabien', 'François'),
(310, 'h.garcia@ollioules10.fr', '$2b$10$AzaCCLYpZwe0oOYQR9nfEuX5JrbUSrIJMxx/eULcJp1N/erMfxq2.', 'PASTOR', 'VALIDATED', 'Henri', 'Garcia');

-- ==========================================
-- ÉGLISES (30 églises)
-- ==========================================

-- ========== PARIS (10 églises) ==========
INSERT INTO churches (id, church_name, denomination_id, admin_id, location) VALUES
(1001, 'Église Évangélique de Belleville', 2, 101, ST_GeomFromText('POINT(2.3808 48.8720)')),
(1002, 'Assemblée de Dieu Montmartre', 1, 102, ST_GeomFromText('POINT(2.3422 48.8867)')),
(1003, 'Centre Chrétien du Marais', 8, 103, ST_GeomFromText('POINT(2.3599 48.8566)')),
(1004, 'Église Baptiste de Nation', 3, 104, ST_GeomFromText('POINT(2.3964 48.8483)')),
(1005, 'Église Pentecôtiste de Ménilmontant', 4, 105, ST_GeomFromText('POINT(2.3847 48.8678)')),
(1006, 'Église du Plein Évangile - Bastille', 6, 106, ST_GeomFromText('POINT(2.3688 48.8532)')),
(1007, 'Assemblée Chrétienne des Gobelins', 1, 107, ST_GeomFromText('POINT(2.3522 48.8326)')),
(1008, 'Église Évangélique Libre de Passy', 2, 108, ST_GeomFromText('POINT(2.2844 48.8584)')),
(1009, 'Centre Évangélique de Bercy', 8, 109, ST_GeomFromText('POINT(2.3831 48.8400)')),
(1010, 'Église Méthodiste de Montparnasse', 7, 110, ST_GeomFromText('POINT(2.3219 48.8422)'));

-- ========== TOULON (10 églises) ==========
INSERT INTO churches (id, church_name, denomination_id, admin_id, location) VALUES
(2001, 'Église Évangélique du Port de Toulon', 2, 201, ST_GeomFromText('POINT(5.9280 43.1242)')),
(2002, 'Assemblée de Dieu Le Mourillon', 1, 202, ST_GeomFromText('POINT(5.9422 43.1189)')),
(2003, 'Centre Chrétien de La Rode', 8, 203, ST_GeomFromText('POINT(5.9180 43.1350)')),
(2004, 'Église Baptiste Sainte-Musse', 3, 204, ST_GeomFromText('POINT(5.9745 43.1156)')),
(2005, 'Église Pentecôtiste du Faron', 4, 205, ST_GeomFromText('POINT(5.9511 43.1389)')),
(2006, 'Église du Plein Évangile Toulon Centre', 6, 206, ST_GeomFromText('POINT(5.9280 43.1242)')),
(2007, 'Assemblée Chrétienne de Bon Rencontre', 1, 207, ST_GeomFromText('POINT(5.9100 43.1089)')),
(2008, 'Église Évangélique Libre Cap Brun', 2, 208, ST_GeomFromText('POINT(5.9622 43.1033)')),
(2009, 'Centre Évangélique Toulon Est', 8, 209, ST_GeomFromText('POINT(5.9689 43.1267)')),
(2010, 'Église Protestante Unie de Toulon', 5, 210, ST_GeomFromText('POINT(5.9311 43.1211)'));

-- ========== OLLIOULES (10 églises) ==========
INSERT INTO churches (id, church_name, denomination_id, admin_id, location) VALUES
(3001, 'Église Évangélique d\'Ollioules Centre', 2, 301, ST_GeomFromText('POINT(5.8478 43.1397)')),
(3002, 'Assemblée de Dieu Les Gorges', 1, 302, ST_GeomFromText('POINT(5.8567 43.1422)')),
(3003, 'Centre Chrétien de la Courtine', 8, 303, ST_GeomFromText('POINT(5.8511 43.1378)')),
(3004, 'Église Baptiste d\'Ollioules', 3, 304, ST_GeomFromText('POINT(5.8489 43.1411)')),
(3005, 'Église Pentecôtiste du Baou', 4, 305, ST_GeomFromText('POINT(5.8422 43.1444)')),
(3006, 'Église du Plein Évangile Ollioules', 6, 306, ST_GeomFromText('POINT(5.8500 43.1389)')),
(3007, 'Assemblée Chrétienne La Favière', 1, 307, ST_GeomFromText('POINT(5.8556 43.1367)')),
(3008, 'Église Évangélique Libre Les Playes', 2, 308, ST_GeomFromText('POINT(5.8444 43.1356)')),
(3009, 'Centre Évangélique d\'Ollioules Sud', 8, 309, ST_GeomFromText('POINT(5.8478 43.1344)')),
(3010, 'Église Méthodiste d\'Ollioules', 7, 310, ST_GeomFromText('POINT(5.8522 43.1389)'));

-- ==========================================
-- DÉTAILS DES ÉGLISES
-- ==========================================

-- ========== PARIS ==========
INSERT INTO church_details (church_id, language_id, pastor_first_name, pastor_last_name, phone, description, street_number, street_name, postal_code, city, website, has_parking, parking_capacity, is_parking_free) VALUES
(1001, 1, 'Pierre', 'Martin', '+33 1 42 08 15 42', 'Église dynamique au cœur de Belleville, avec une communauté multiculturelle et engagée.', '15', 'Rue de Belleville', '75020', 'Paris', 'www.eglise-belleville.fr', TRUE, 20, FALSE),
(1002, 1, 'Jacques', 'Dubois', '+33 1 46 06 23 11', 'Assemblée de Dieu historique de Montmartre, cultes en français et musique contemporaine.', '28', 'Rue des Abbesses', '75018', 'Paris', 'www.add-montmartre.fr', FALSE, NULL, NULL),
(1003, 1, 'Marc', 'Bernard', '+33 1 48 87 62 33', 'Centre chrétien moderne accueillant toutes les générations au cœur du Marais.', '42', 'Rue du Temple', '75004', 'Paris', 'www.centremarais.fr', FALSE, NULL, NULL),
(1004, 1, 'Luc', 'Petit', '+33 1 43 73 44 55', 'Église baptiste familiale proche de la Place de la Nation.', '89', 'Avenue Philippe-Auguste', '75011', 'Paris', 'www.baptiste-nation.fr', TRUE, 15, TRUE),
(1005, 1, 'André', 'Robert', '+33 1 43 55 29 17', 'Communauté pentecôtiste chaleureuse avec ministère de jeunesse actif.', '123', 'Rue de Ménilmontant', '75020', 'Paris', 'www.eglise-menilmontant.fr', FALSE, NULL, NULL),
(1006, 1, 'Stéphane', 'Richard', '+33 1 43 14 80 96', 'Église du Plein Évangile avec louange puissante et enseignements bibliques.', '67', 'Boulevard Beaumarchais', '75011', 'Paris', 'www.pleinevangilebastille.fr', TRUE, 10, FALSE),
(1007, 1, 'David', 'Simon', '+33 1 47 07 25 88', 'Assemblée chrétienne conviviale dans le 13ème arrondissement.', '34', 'Avenue des Gobelins', '75013', 'Paris', 'www.eglise-gobelins.fr', TRUE, 25, TRUE),
(1008, 1, 'Philippe', 'Laurent', '+33 1 45 25 67 43', 'Église évangélique dans le quartier chic de Passy, culte traditionnel et moderne.', '56', 'Rue de Passy', '75016', 'Paris', 'www.eglise-passy.fr', FALSE, NULL, NULL),
(1009, 1, 'Michel', 'Michel', '+33 1 43 43 21 09', 'Centre évangélique innovant près de Bercy Village.', '78', 'Rue de Bercy', '75012', 'Paris', 'www.centrebercy.fr', TRUE, 30, FALSE),
(1010, 1, 'Jean', 'Lefebvre', '+33 1 43 20 45 67', 'Église méthodiste historique avec forte implication sociale.', '21', 'Boulevard du Montparnasse', '75006', 'Paris', 'www.methodiste-montparnasse.fr', FALSE, NULL, NULL);

-- ========== TOULON ==========
INSERT INTO church_details (church_id, language_id, pastor_first_name, pastor_last_name, phone, description, street_number, street_name, postal_code, city, website, has_parking, parking_capacity, is_parking_free) VALUES
(2001, 1, 'Christian', 'Moreau', '+33 4 94 92 15 33', 'Église évangélique au cœur du port de Toulon, vue imprenable sur la rade.', '12', 'Quai Stalingrad', '83000', 'Toulon', 'www.eglise-toulon-port.fr', FALSE, NULL, NULL),
(2002, 1, 'François', 'Girard', '+33 4 94 41 22 88', 'Assemblée de Dieu dans le quartier du Mourillon, proche de la plage.', '45', 'Avenue du Docteur Fontan', '83000', 'Toulon', 'www.add-mourillon.fr', TRUE, 40, TRUE),
(2003, 1, 'Gérard', 'Bonnet', '+33 4 94 24 67 19', 'Centre chrétien moderne dans le quartier de La Rode.', '78', 'Chemin de la Rode', '83000', 'Toulon', 'www.centrechretien-larode.fr', TRUE, 50, TRUE),
(2004, 1, 'Nicolas', 'Fontaine', '+33 4 94 27 83 44', 'Église baptiste familiale dans le quartier résidentiel Sainte-Musse.', '23', 'Avenue Sainte-Musse', '83100', 'Toulon', 'www.baptiste-toulon.fr', TRUE, 30, TRUE),
(2005, 1, 'René', 'Rousseau', '+33 4 94 92 33 77', 'Église pentecôtiste au pied du Mont Faron avec vue panoramique.', '89', 'Chemin du Faron', '83000', 'Toulon', 'www.eglise-faron.fr', TRUE, 35, TRUE),
(2006, 1, 'Paul', 'Vincent', '+33 4 94 89 45 22', 'Église du Plein Évangile en centre-ville, accessible en transport.', '34', 'Boulevard de Strasbourg', '83000', 'Toulon', 'www.pleinevangile-toulon.fr', FALSE, NULL, NULL),
(2007, 1, 'Alain', 'Lambert', '+33 4 94 20 56 91', 'Assemblée chrétienne dans le quartier Bon Rencontre.', '56', 'Chemin de Bon Rencontre', '83200', 'Toulon', 'www.eglise-bonrencontre.fr', TRUE, 25, TRUE),
(2008, 1, 'Jacques', 'Muller', '+33 4 94 36 77 12', 'Église évangélique libre à Cap Brun, proche de la corniche.', '91', 'Avenue Cap Brun', '83000', 'Toulon', 'www.eglise-capbrun.fr', TRUE, 20, FALSE),
(2009, 1, 'Bernard', 'Lefevre', '+33 4 94 61 88 45', 'Centre évangélique moderne à l\'est de Toulon.', '123', 'Avenue de l\'Infanterie de Marine', '83000', 'Toulon', 'www.centreest-toulon.fr', TRUE, 45, TRUE),
(2010, 1, 'Maurice', 'Faure', '+33 4 94 92 66 33', 'Église protestante unie historique, patrimoine architectural remarquable.', '18', 'Rue Jean Jaurès', '83000', 'Toulon', 'www.epu-toulon.fr', FALSE, NULL, NULL);

-- ========== OLLIOULES ==========
INSERT INTO church_details (church_id, language_id, pastor_first_name, pastor_last_name, phone, description, street_number, street_name, postal_code, city, website, has_parking, parking_capacity, is_parking_free) VALUES
(3001, 1, 'Étienne', 'Dupont', '+33 4 94 63 11 45', 'Église évangélique au centre d\'Ollioules, communauté accueillante et familiale.', '25', 'Avenue Maréchal Foch', '83190', 'Ollioules', 'www.eglise-ollioules.fr', TRUE, 30, TRUE),
(3002, 1, 'Luc', 'André', '+33 4 94 63 22 78', 'Assemblée de Dieu proche des Gorges d\'Ollioules, cadre naturel exceptionnel.', '12', 'Chemin des Gorges', '83190', 'Ollioules', 'www.add-ollioules.fr', TRUE, 40, TRUE),
(3003, 1, 'Julien', 'Mercier', '+33 4 94 63 33 91', 'Centre chrétien moderne dans le quartier de la Courtine.', '67', 'Avenue de la Courtine', '83190', 'Ollioules', 'www.centrechretien-courtine.fr', TRUE, 35, TRUE),
(3004, 1, 'Claude', 'Blanc', '+33 4 94 63 44 15', 'Église baptiste avec fort engagement missionnaire local et international.', '89', 'Boulevard Pierre Toesca', '83190', 'Ollioules', 'www.baptiste-ollioules.fr', TRUE, 25, TRUE),
(3005, 1, 'Robert', 'Guérin', '+33 4 94 63 55 28', 'Église pentecôtiste au pied du Gros Cerveau avec vue sur le Baou.', '34', 'Chemin du Baou', '83190', 'Ollioules', 'www.eglise-baou.fr', TRUE, 30, TRUE),
(3006, 1, 'Thierry', 'Boyer', '+33 4 94 63 66 42', 'Église du Plein Évangile avec ministère de délivrance actif.', '56', 'Avenue Jean Moulin', '83190', 'Ollioules', 'www.pleinevangile-ollioules.fr', TRUE, 20, TRUE),
(3007, 1, 'Pascal', 'Garnier', '+33 4 94 63 77 55', 'Assemblée chrétienne dans le quartier La Favière, louange contemporaine.', '78', 'Chemin de la Favière', '83190', 'Ollioules', 'www.eglise-faviere.fr', TRUE, 28, TRUE),
(3008, 1, 'Yves', 'Chevalier', '+33 4 94 63 88 69', 'Église évangélique libre dans le quartier Les Playes.', '91', 'Avenue des Playes', '83190', 'Ollioules', 'www.eglise-playes.fr', TRUE, 22, TRUE),
(3009, 1, 'Fabien', 'François', '+33 4 94 63 99 82', 'Centre évangélique au sud d\'Ollioules, groupe de jeunes dynamique.', '123', 'Chemin de la Seyne', '83190', 'Ollioules', 'www.centre-ollioules-sud.fr', TRUE, 32, TRUE),
(3010, 1, 'Henri', 'Garcia', '+33 4 94 63 00 11', 'Église méthodiste avec engagement social et aide aux démunis.', '45', 'Place de la Mairie', '83190', 'Ollioules', 'www.methodiste-ollioules.fr', FALSE, NULL, NULL);

-- ==========================================
-- HORAIRES DES CULTES (Dimanche matin)
-- ==========================================
INSERT INTO church_schedules (church_id, day_of_week, start_time, activity_type_id)
SELECT id, 'SUNDAY', '10:00:00', 1 FROM churches WHERE id >= 1001 AND id <= 3010;

-- Réunions de prière (Mercredi soir)
INSERT INTO church_schedules (church_id, day_of_week, start_time, activity_type_id)
SELECT id, 'WEDNESDAY', '19:30:00', 2 FROM churches WHERE id >= 1001 AND id <= 3010;

-- ==========================================
-- RÉSEAUX SOCIAUX (Exemples pour quelques églises)
-- ==========================================
INSERT INTO church_socials (church_id, platform, url) VALUES
(1001, 'FACEBOOK', 'https://facebook.com/eglise.belleville'),
(1002, 'INSTAGRAM', 'https://instagram.com/add_montmartre'),
(1003, 'YOUTUBE', 'https://youtube.com/@centremarais'),
(2001, 'FACEBOOK', 'https://facebook.com/eglise.toulon.port'),
(2002, 'INSTAGRAM', 'https://instagram.com/add_mourillon'),
(3001, 'FACEBOOK', 'https://facebook.com/eglise.ollioules');
