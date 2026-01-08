# 🌱 Seeders - Données de Test

Ce dossier contient les fichiers de seed pour initialiser automatiquement la base de données avec des données de test cohérentes.

## 📂 Fichiers

| Fichier | Description | Ordre d'exécution |
|---------|-------------|-------------------|
| `01-denominations.sql` | Dénominations, unions, types d'activités, langues | 1er (après schema.sql) |
| `02-churches-data.sql` | 30 églises + 31 admins + horaires + réseaux sociaux | 2ème |

## 🔐 Identifiants de Connexion

### Super Admin (Accès complet)
```
Email: admin@lightchurch.fr
Password: Admin123!
```

### Pasteurs (30 comptes)
```
Email: p.martin@paris1.fr (et 29 autres)
Password: Pastor123!
```

**Liste complète des emails pasteurs :**
- **Paris (10)** : `p.martin@paris1.fr`, `j.dubois@paris2.fr`, `m.bernard@paris3.fr`, etc.
- **Toulon (10)** : `c.moreau@toulon1.fr`, `f.girard@toulon2.fr`, `g.bonnet@toulon3.fr`, etc.
- **Ollioules (10)** : `e.dupont@ollioules1.fr`, `l.andre@ollioules2.fr`, `j.mercier@ollioules3.fr`, etc.

## 📊 Données Créées

### Églises (30 au total)

**📍 Paris (75) - 10 églises**
- Quartiers : Belleville, Montmartre, Marais, Nation, Ménilmontant, Bastille, Gobelins, Passy, Bercy, Montparnasse
- Coordonnées GPS réelles autour de Paris (48.85°N, 2.35°E)

**📍 Toulon (83) - 10 églises**
- Quartiers : Port, Mourillon, La Rode, Sainte-Musse, Faron, Centre, Bon Rencontre, Cap Brun, Est
- Coordonnées GPS réelles autour de Toulon (43.12°N, 5.93°E)

**📍 Ollioules (83) - 10 églises**
- Quartiers : Centre, Les Gorges, Courtine, Centre-ville, Baou, Centre, La Favière, Les Playes, Sud
- Coordonnées GPS réelles autour d'Ollioules (43.14°N, 5.85°E)

### Détails par Église

Chaque église contient :
- ✅ Nom d'église réaliste (Assemblée de Dieu, Église Évangélique, Centre Chrétien, etc.)
- ✅ Pasteur avec prénom/nom
- ✅ Téléphone français (+33)
- ✅ Adresse complète (numéro, rue, code postal, ville)
- ✅ Description de l'église
- ✅ Site web
- ✅ Coordonnées GPS exactes
- ✅ Informations parking (capacité, gratuit/payant)
- ✅ 2 horaires : Dimanche 10h (culte) + Mercredi 19h30 (prière)

### Dénominations (8)

1. Assemblée de Dieu (ADD France)
2. Église Évangélique Libre (CNEF)
3. Église Baptiste (CNEF)
4. Église Pentecôtiste (CNEF)
5. Église Protestante Unie (FPF)
6. Église du Plein Évangile (CNEF)
7. Église Évangélique Méthodiste (FPF)
8. Centre Chrétien (indépendant)

### Types d'Activités (5)

1. Culte Dominical
2. Réunion de Prière
3. Étude Biblique
4. Groupe de Jeunes
5. Louange et Adoration

### Langues (3)

- Français 🇫🇷
- Anglais 🇬🇧
- Espagnol 🇪🇸

## 🚀 Utilisation

### Initialisation Automatique

Les seeders sont exécutés automatiquement par Docker lors du premier démarrage :

```bash
docker-compose up -d
```

Docker exécute dans l'ordre :
1. `01-schema.sql` (structure)
2. `02-denominations.sql` (référentiels)
3. `03-churches-data.sql` (données d'églises)

### Réinitialisation

Pour réinitialiser la base avec les seeders :

```bash
# Arrêter et supprimer le volume
docker-compose down
docker volume rm test-docker_mysql-data

# Redémarrer (les seeders se réexécutent)
docker-compose up -d
```

## 📝 Modification des Seeders

### Ajouter des Églises

Éditez `02-churches-data.sql` et ajoutez :

```sql
-- 1. Créer l'admin/pasteur
INSERT INTO admins (id, email, password_hash, role, status, first_name, last_name) VALUES
(401, 'nouveau.pasteur@ville.fr', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'PASTOR', 'VALIDATED', 'Prénom', 'Nom');

-- 2. Créer l'église
INSERT INTO churches (id, church_name, denomination_id, admin_id, location) VALUES
(4001, 'Nom de l\'Église', 1, 401, ST_GeomFromText('POINT(longitude latitude)', 4326));

-- 3. Ajouter les détails
INSERT INTO church_details (church_id, language_id, pastor_first_name, pastor_last_name, phone, description, street_number, street_name, postal_code, city, website, has_parking, parking_capacity, is_parking_free) VALUES
(4001, 1, 'Prénom', 'Nom', '+33 X XX XX XX XX', 'Description...', '123', 'Rue Example', '00000', 'Ville', 'www.example.fr', TRUE, 50, TRUE);

-- 4. Ajouter les horaires
INSERT INTO church_schedules (church_id, day_of_week, start_time, activity_type_id) VALUES
(4001, 'SUNDAY', '10:00:00', 1),
(4001, 'WEDNESDAY', '19:30:00', 2);
```

### Changer les Mots de Passe

Pour générer un nouveau hash bcrypt :

```bash
# Node.js
npm install bcryptjs
node -e "console.log(require('bcryptjs').hashSync('NouveauMotDePasse', 10));"

# Python
pip install bcrypt
python -c "import bcrypt; print(bcrypt.hashpw(b'NouveauMotDePasse', bcrypt.gensalt()).decode())"
```

## 🗺️ Coordonnées GPS

Pour trouver des coordonnées GPS réelles :
- Google Maps : Clic droit → "Plus d'infos sur cet endroit"
- Format : `POINT(longitude latitude)` → `POINT(2.3522 48.8566)`
- ⚠️ **longitude PUIS latitude** (inverse de l'affichage habituel)

## ⚠️ Important

- Les mots de passe sont identiques pour faciliter les tests
- **NE JAMAIS** utiliser ces mots de passe en production
- Les numéros de téléphone sont fictifs
- Les sites web sont fictifs (non configurés)
- Les adresses sont des exemples pour les quartiers mentionnés

## 📊 Statistiques

- **Total églises** : 30
- **Total admins** : 31 (1 super admin + 30 pasteurs)
- **Total horaires** : 60 (2 par église)
- **Réseaux sociaux** : 6 exemples (Facebook, Instagram, YouTube)
- **Dénominations** : 8
- **Unions** : 3 (CNEF, FPF, ADD France)
