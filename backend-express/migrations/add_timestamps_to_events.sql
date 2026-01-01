-- Migration: Add created_at and updated_at to events table
-- Date: 2026-01-01
-- Description: Add timestamp tracking for event creation and updates
-- Author: Migration automatique

-- Étape 1 : Ajouter created_at avec valeur par défaut
ALTER TABLE events
ADD COLUMN created_at DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL;

-- Étape 2 : Ajouter updated_at avec auto-update
ALTER TABLE events
ADD COLUMN updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP NOT NULL;

-- Étape 3 : Pour les événements existants, approximer created_at avec start_datetime
-- Cela donne une meilleure estimation de quand l'événement a été créé
UPDATE events SET created_at = start_datetime;

-- Étape 4 : Indexation pour améliorer les performances des requêtes de tri
CREATE INDEX idx_events_created_at ON events(created_at DESC);
CREATE INDEX idx_events_updated_at ON events(updated_at DESC);

-- Résultat attendu :
-- - Tous les événements existants auront created_at = leur start_datetime
-- - Tous les événements existants auront updated_at = date de la migration
-- - Les nouveaux événements auront created_at et updated_at = date de création
-- - Chaque UPDATE mettra à jour automatiquement updated_at
