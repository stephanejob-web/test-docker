-- Migration: Ajout de la table event_translations pour gérer les traductions des événements
-- Date: 2025-12-25
-- Description: Permet de stocker les langues de traduction disponibles pour chaque événement

USE light_church;

-- Créer la table event_translations (relation many-to-many)
CREATE TABLE IF NOT EXISTS event_translations (
  id INT NOT NULL AUTO_INCREMENT,
  event_id INT NOT NULL,
  language_id INT NOT NULL,
  PRIMARY KEY (id),
  UNIQUE KEY unique_event_language (event_id, language_id),
  CONSTRAINT fk_event_trans_event FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE,
  CONSTRAINT fk_event_trans_lang FOREIGN KEY (language_id) REFERENCES languages(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Créer un index sur event_id pour améliorer les performances de recherche
CREATE INDEX idx_event_translations_event_id ON event_translations(event_id);

-- Afficher la structure de la nouvelle table
DESCRIBE event_translations;
