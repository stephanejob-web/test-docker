-- ==============================================
-- Migration: Optimisation des indexes BDD
-- Date: 2025-12-23
-- Description: Ajout d'indexes manquants pour améliorer les performances des requêtes fréquentes
-- ==============================================

USE light_church;

-- ============================================
-- 1. EVENTS TABLE - Indexes manquants
-- ============================================

-- Index sur church_id (requêtes fréquentes pour récupérer les événements d'une église)
-- Utilisé dans: GET /church/events, filtres par église
CREATE INDEX idx_events_church_id ON events(church_id);

-- Index sur start_datetime (requêtes fréquentes pour filtrer les événements futurs)
-- Utilisé dans: Dashboard KPIs, listings d'événements à venir
CREATE INDEX idx_events_start_datetime ON events(start_datetime);

-- Index sur status (requêtes fréquentes pour filtrer par statut PUBLISHED/DRAFT/CANCELLED)
-- Utilisé dans: Listings publics, administration
CREATE INDEX idx_events_status ON events(status);

-- Index composite pour optimiser les requêtes combinant status + date
-- Utilisé dans: "SELECT * FROM events WHERE status='PUBLISHED' AND start_datetime >= NOW()"
CREATE INDEX idx_events_status_date ON events(status, start_datetime);

-- ============================================
-- 2. ADMINS TABLE - Indexes manquants
-- ============================================

-- Index sur status (requêtes très fréquentes pour utilisateurs PENDING/VALIDATED)
-- Utilisé dans: GET /admin/pending-users, Dashboard KPIs, validation utilisateurs
CREATE INDEX idx_admins_status ON admins(status);

-- Index sur role (requêtes pour filtrer par rôle PASTOR/SUPER_ADMIN)
-- Utilisé dans: Dashboard KPIs, statistiques
CREATE INDEX idx_admins_role ON admins(role);

-- Index composite pour optimiser les requêtes de pagination par statut
-- Utilisé dans: "SELECT * FROM admins WHERE status='PENDING' ORDER BY created_at DESC"
CREATE INDEX idx_admins_status_created ON admins(status, created_at);

-- ============================================
-- 3. CHURCH_DETAILS - Index supplémentaire
-- ============================================

-- Index sur status pour filtrer églises actives/inactives
-- Utilisé dans: Listings d'églises actives, statistiques
CREATE INDEX idx_church_details_status ON church_details(status);

-- ============================================
-- 4. VÉRIFICATION - Afficher tous les indexes créés
-- ============================================

-- Vérifier les indexes sur events
SHOW INDEX FROM events;

-- Vérifier les indexes sur admins
SHOW INDEX FROM admins;

-- Vérifier les indexes sur church_details
SHOW INDEX FROM church_details;