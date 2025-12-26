-- Script de nettoyage de la base de données
-- Garde uniquement un compte super admin

USE light_church;

-- Désactiver les contraintes de clés étrangères temporairement
SET FOREIGN_KEY_CHECKS = 0;

-- Supprimer toutes les données des tables principales
TRUNCATE TABLE event_translations;
TRUNCATE TABLE event_details;
TRUNCATE TABLE events;
TRUNCATE TABLE church_schedules;
TRUNCATE TABLE church_socials;
TRUNCATE TABLE church_details;
TRUNCATE TABLE churches;
TRUNCATE TABLE push_tokens;
TRUNCATE TABLE admins;

-- Réactiver les contraintes de clés étrangères
SET FOREIGN_KEY_CHECKS = 1;

-- Créer le compte super admin
-- Email: admin@gmail.com
-- Mot de passe: 780662aB2
-- Hash bcrypt du mot de passe (généré avec bcrypt, rounds=10)
INSERT INTO admins (email, password_hash, role, status, first_name, last_name, created_at)
VALUES (
    'admin@gmail.com',
    '$2b$10$2q5z5I3kK43qzJ.JtWNlTORW0lcr51KYe9AUlRMeIDA8hyiB2oJ1S',
    'SUPER_ADMIN',
    'VALIDATED',
    'Super',
    'Admin',
    NOW()
);

-- Afficher le résultat
SELECT 'Base de données nettoyée! Seul le compte super admin reste.' as message;
SELECT id, email, role, status, first_name, last_name FROM admins;
