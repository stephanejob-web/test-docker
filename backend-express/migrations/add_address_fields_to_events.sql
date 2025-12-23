-- Migration: Ajout des champs d'adresse détaillés pour les événements
-- Date: 2025-12-23
-- Description: Ajoute street_number, street_name, city, postal_code à event_details

USE light_church;

-- Ajouter les nouveaux champs d'adresse
ALTER TABLE event_details
ADD COLUMN street_number VARCHAR(20) AFTER address,
ADD COLUMN street_name VARCHAR(255) AFTER street_number,
ADD COLUMN postal_code VARCHAR(10) AFTER street_name,
ADD COLUMN city VARCHAR(100) AFTER postal_code;

-- Créer un index sur la ville pour recherches rapides
CREATE INDEX idx_event_city ON event_details(city);

-- Créer un index sur le code postal pour recherches rapides
CREATE INDEX idx_event_postal_code ON event_details(postal_code);

-- Afficher la structure mise à jour
DESCRIBE event_details;
