-- Migration: Ajout du champ document_sirene_path pour la vérification des pasteurs
-- Date: 2025-12-26
-- Description: Ajoute la possibilité de stocker le document SIRENE pour validation

USE light_church;

-- Ajouter la colonne pour le document SIRENE
ALTER TABLE admins
ADD COLUMN document_sirene_path VARCHAR(500) NULL AFTER last_name,
ADD COLUMN rejection_reason TEXT NULL AFTER status;

-- Afficher la structure mise à jour
DESCRIBE admins;
