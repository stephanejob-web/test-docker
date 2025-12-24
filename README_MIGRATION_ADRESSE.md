# Migration des champs d'adresse - Base de données

## Contexte
Cette migration ajoute 4 nouveaux champs détaillés à la table `church_details` pour une meilleure gestion des adresses :
- `street_number` : Numéro de rue (VARCHAR 10)
- `street_name` : Nom de rue (VARCHAR 255)
- `postal_code` : Code postal (VARCHAR 10, indexé)
- `city` : Ville (VARCHAR 100, indexé)

## Fichiers créés

### 1. Migration SQL
**Fichier:** `migration_add_address_fields.sql`
- Ajoute les 4 nouveaux champs à la table `church_details`
- Crée un index sur le champ `city` pour optimiser les recherches
- Mise à jour du schéma `bas_ok.sql` pour les nouvelles installations

### 2. Script de seed
**Fichier:** `backend-express/scripts/seedWithAddressFields.js`
- Génère 500 enregistrements d'églises avec adresses complètes et réalistes
- Utilise 35 villes françaises avec codes postaux réels
- Crée également :
  - 500 pasteurs validés
  - 1200+ horaires de culte
  - 500+ réseaux sociaux
  - Noms de rues réalistes et thématiques

## Exécution de la migration

### Étape 1 : Exécuter la migration SQL
```bash
# Avec Docker (si les containers sont actifs)
docker exec mysql-db mysql -uadmin -padmin light_church < migration_add_address_fields.sql

# Ou directement avec MySQL
mysql -uadmin -padmin light_church < migration_add_address_fields.sql
```

### Étape 2 : Vérifier la structure
```bash
docker exec mysql-db mysql -uadmin -padmin light_church -e "DESCRIBE church_details;"
```

### Étape 3 : Exécuter le script de seed
```bash
# Copier le script dans le container (si nécessaire)
docker cp backend-express/scripts/seedWithAddressFields.js backend-express:/app/scripts/

# Exécuter le script
docker exec backend-express node scripts/seedWithAddressFields.js
```

## Vérification des données

### Compter les églises avec adresses complètes
```bash
docker exec mysql-db mysql -uadmin -padmin light_church -e \
  "SELECT COUNT(*) FROM church_details WHERE street_number IS NOT NULL;"
```

### Afficher des exemples d'adresses
```bash
docker exec mysql-db mysql -uadmin -padmin light_church -e \
  "SELECT church_id, street_number, street_name, postal_code, city
   FROM church_details WHERE city IS NOT NULL LIMIT 10;"
```

### Distribution par ville
```bash
docker exec mysql-db mysql -uadmin -padmin light_church -e \
  "SELECT city, COUNT(*) as nb_eglises
   FROM church_details WHERE city IS NOT NULL
   GROUP BY city ORDER BY nb_eglises DESC LIMIT 15;"
```

## Statistiques attendues

Après exécution du script de seed, vous devriez avoir :
- ✅ **500 pasteurs** avec mot de passe `password123`
- ✅ **500 églises** avec adresses complètes (street_number, street_name, postal_code, city)
- ✅ **1200+ horaires** de culte et activités
- ✅ **500+ réseaux sociaux** (Facebook, Instagram, YouTube)
- ✅ **35 villes françaises** représentées avec codes postaux réels

## Données de test

### Connexion pasteur
- **Email:** `[prenom].[nom][timestamp]@eglise-france.fr`
- **Mot de passe:** `password123`
- **Rôle:** PASTOR
- **Status:** VALIDATED

### Exemples de villes
Paris (75001-75010), Marseille (13001-13008), Lyon (69001-69008), Toulouse (31000-31500), Nice (06000-06300), etc.

### Exemples de noms de rues
- Avenue du Pasteur Martin Luther King
- Rue de la Pentecôte
- Boulevard de la Mission
- Place de la Foi
- Rue Emmanuel
- etc.

## Données réalistes générées

Le script génère des données cohérentes et réalistes :
- **Adresses** : Numéros de 1 à 200, noms de rues thématiques chrétiens
- **Codes postaux** : Codes réels correspondants aux villes
- **Coordonnées GPS** : Légèrement randomisées autour des coordonnées réelles des villes
- **Téléphones** : Format français valide (0X XX XX XX XX)
- **Sites web** : URLs basées sur les noms de villes
- **Descriptions** : Textes personnalisés mentionnant la localisation

## Notes importantes

- Le champ `address` original est conservé et contient l'adresse complète formatée
- Les nouveaux champs permettent des recherches et filtres plus précis
- Index créés sur `city` et `postal_code` pour optimiser les performances
- Compatible avec le schéma existant (migration non destructive)
- Peut être exécuté plusieurs fois (génère de nouvelles églises à chaque fois)

## Rollback (si nécessaire)

Pour supprimer les nouveaux champs :
```sql
ALTER TABLE church_details
DROP COLUMN street_number,
DROP COLUMN street_name,
DROP COLUMN postal_code,
DROP COLUMN city;
```

Pour supprimer uniquement les données de test créées :
```sql
-- Identifier les IDs des nouvelles églises
SELECT MIN(church_id) FROM church_details WHERE street_number IS NOT NULL;

-- Supprimer à partir de cet ID
DELETE FROM churches WHERE id >= [MIN_ID];
-- Les détails seront supprimés automatiquement (CASCADE)
```
