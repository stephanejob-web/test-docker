-- Migration: Créer la table event_interests
-- Permet aux utilisateurs mobiles de montrer leur intérêt pour un événement
-- et de recevoir des notifications push

-- Créer la table event_interests
CREATE TABLE IF NOT EXISTS event_interests (
    id INT AUTO_INCREMENT PRIMARY KEY,
    event_id INT NOT NULL,
    device_id VARCHAR(255) NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,

    -- Un device ne peut s'inscrire qu'une seule fois par événement
    UNIQUE KEY unique_event_device (event_id, device_id),

    -- Clés étrangères
    CONSTRAINT fk_interest_event FOREIGN KEY (event_id)
        REFERENCES events(id) ON DELETE CASCADE,
    CONSTRAINT fk_interest_device FOREIGN KEY (device_id)
        REFERENCES push_tokens(device_id) ON DELETE CASCADE,

    -- Index pour performance
    INDEX idx_event_id (event_id),
    INDEX idx_device_id (device_id),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Ajouter une colonne pour compter rapidement les intéressés (optionnel mais performant)
-- Vérifier d'abord si la colonne n'existe pas déjà
SET @col_exists = (SELECT COUNT(*) FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'events'
    AND COLUMN_NAME = 'interested_count');

SET @query = IF(@col_exists = 0,
    'ALTER TABLE events ADD COLUMN interested_count INT DEFAULT 0 COMMENT ''Nombre de personnes intéressées''',
    'SELECT ''Column interested_count already exists'' AS message');

PREPARE stmt FROM @query;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Index pour trier par popularité (ignorer l'erreur si existe déjà)
SET @index_exists = (SELECT COUNT(*) FROM information_schema.STATISTICS
    WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'events'
    AND INDEX_NAME = 'idx_interested_count');

SET @query = IF(@index_exists = 0,
    'CREATE INDEX idx_interested_count ON events(interested_count)',
    'SELECT ''Index idx_interested_count already exists'' AS message');

PREPARE stmt FROM @query;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Note: Pour mettre à jour le compteur automatiquement, on pourrait ajouter des triggers,
-- mais on va le gérer dans le code backend pour plus de contrôle
