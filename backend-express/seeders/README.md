# Light Church - Database Seeders

Ce dossier contient les fichiers SQL pour peupler la base de données avec des données de test cohérentes.

## 📋 Fichiers

### 01-reference-data.sql
Données de référence (tables lookup) sans dépendances utilisateurs :
- **church_unions** (4 unions)
- **denominations** (6 dénominations)
- **languages** (10 langues, **id=10 = Français par défaut**)
- **activity_types** (5 types d'activités)

### 02-churches-and-admins.sql
Données utilisateurs avec IDs séquentiels cohérents :
- **31 admins** : 1 super admin + 30 pasteurs (IDs 1-31)
- **30 églises** : 10 Paris + 10 Toulon + 10 Ollioules (IDs 1-30)
- **30 church_details** : détails complets avec language_id=10
- **60 church_schedules** : 2 horaires par église
- **19 church_socials** : réseaux sociaux pour certaines églises

## 🔐 Identifiants de Test

**Mot de passe unique pour TOUS les comptes :** `780662aB2`

### Super Admin
```
Email: admin@lightchurch.fr
Password: 780662aB2
```

### Pasteurs Paris (IDs 2-11)
```
p.martin@paris1.fr       - Pierre Martin
j.dubois@paris2.fr       - Jacques Dubois
m.bernard@paris3.fr      - Michel Bernard
a.thomas@paris4.fr       - Alain Thomas
r.petit@paris5.fr        - Robert Petit
p.robert@paris6.fr       - Paul Robert
j.richard@paris7.fr      - Jean Richard
f.durand@paris8.fr       - François Durand
d.moreau@paris9.fr       - Daniel Moreau
l.simon@paris10.fr       - Laurent Simon
```

### Pasteurs Toulon (IDs 12-21)
```
c.moreau@toulon1.fr      - Christian Moreau
f.girard@toulon2.fr      - Frédéric Girard
g.bonnet@toulon3.fr      - Gérard Bonnet
n.blanc@toulon4.fr       - Nicolas Blanc
p.garcia@toulon5.fr      - Philippe Garcia
s.martinez@toulon6.fr    - Stéphane Martinez
t.lopez@toulon7.fr       - Thierry Lopez
v.gonzalez@toulon8.fr    - Vincent Gonzalez
x.perez@toulon9.fr       - Xavier Perez
y.sanchez@toulon10.fr    - Yves Sanchez
```

### Pasteurs Ollioules (IDs 22-31)
```
e.dupont@ollioules1.fr   - Éric Dupont
l.andre@ollioules2.fr    - Luc André
m.fontaine@ollioules3.fr - Marc Fontaine
o.chevalier@ollioules4.fr- Olivier Chevalier
q.lambert@ollioules5.fr  - Quentin Lambert
r.rousseau@ollioules6.fr - René Rousseau
s.vincent@ollioules7.fr  - Serge Vincent
t.leroy@ollioules8.fr    - Thomas Leroy
u.clement@ollioules9.fr  - Urbain Clément
w.gauthier@ollioules10.fr- William Gauthier
```

## 🗺️ Répartition Géographique

### Paris (10 églises, IDs 1-10)
- Coordonnées GPS réelles de différents quartiers parisiens
- Quartiers : Belleville, Montmartre, Marais, Nation, Bastille, Oberkampf, Batignolles, République, Ménilmontant, Père Lachaise

### Toulon (10 églises, IDs 11-20)
- Coordonnées GPS réelles de Toulon et environs
- Secteurs : Port, Mourillon, Faron, Centre-Ville, La Garde, Sainte-Musse, Bon Rencontre, Petit Bois, Claret, Cap Brun

### Ollioules (10 églises, IDs 21-30)
- Coordonnées GPS réelles d'Ollioules
- Quartiers : Centre, Les Gorges, La Favière, La Castellane, Sainte-Barbe, Les Oliviers, Le Castillon, La Courtine, Les Plans, La Combe

## 📊 Statistiques

| Élément | Quantité | IDs |
|---------|----------|-----|
| Super Admin | 1 | 1 |
| Pasteurs | 30 | 2-31 |
| Églises | 30 | 1-30 |
| Dénominations | 6 | 1-6 |
| Unions | 4 | 1-4 |
| Langues | 10 | 1-10 |
| Types d'activités | 5 | 1-5 |
| Horaires | 60 | Auto |
| Réseaux sociaux | 19 | Auto |

## 🔑 Points Clés

### Language ID = 10
**IMPORTANT** : Le schéma définit `language_id=10` comme valeur par défaut dans :
- `church_details.language_id` DEFAULT '10'
- `events.language_id` DEFAULT '10'

C'est pourquoi nous avons créé **10 langues** avec **id=10 = Français** comme langue par défaut.

### IDs Séquentiels
Tous les IDs sont séquentiels et cohérents :
- Admins : 1 (super admin), puis 2-31 (pasteurs)
- Églises : 1-30 (correspondant aux pasteurs 2-31)
- Pas de sauts d'IDs (comme l'ancien 1, 101, 102...)

### Clés Étrangères Respectées
Toutes les relations sont cohérentes :
- `churches.admin_id` → `admins.id` (chaque église a son pasteur)
- `churches.denomination_id` → `denominations.id`
- `church_details.church_id` → `churches.id`
- `church_details.language_id` → `languages.id` (toujours 10 = Français)
- `church_schedules.church_id` → `churches.id`
- `church_schedules.activity_type_id` → `activity_types.id`
- `church_socials.church_id` → `churches.id`

### Géométrie sans SRID
Les coordonnées GPS utilisent `ST_GeomFromText('POINT(lng lat)')` sans SRID pour compatibilité avec le backend existant.

### UTF-8
Tous les fichiers commencent par :
```sql
SET NAMES utf8mb4;
SET CHARACTER SET utf8mb4;
```

## 🚀 Utilisation

Ces fichiers sont automatiquement chargés par Docker lors de la première initialisation :

```bash
# Réinitialiser la base avec les nouveaux seeders
docker-compose down
docker volume rm test-docker_mysql-data
docker-compose up -d
```

L'ordre de chargement (alphabétique) :
1. `01-schema.sql` (structure)
2. `02-reference-data.sql` (données de référence)
3. `03-churches-and-admins.sql` (utilisateurs et églises)

## 🔍 Vérifications

Pour vérifier que tout est cohérent :

```bash
# Compter les admins
docker exec mysql-db mysql -u root -proot light_church -e "SELECT COUNT(*), role FROM admins GROUP BY role;"

# Compter les églises par ville
docker exec mysql-db mysql -u root -proot light_church -e "SELECT city, COUNT(*) FROM church_details GROUP BY city;"

# Vérifier les langues
docker exec mysql-db mysql -u root -proot light_church -e "SELECT id, code, name_fr FROM languages ORDER BY id;"

# Vérifier qu'il n'y a pas d'IDs cassés
docker exec mysql-db mysql -u root -proot light_church -e "SELECT c.id, c.church_name, c.admin_id, a.email FROM churches c LEFT JOIN admins a ON c.admin_id = a.id WHERE a.id IS NULL;"
```

## 📝 Notes

- **NE PAS modifier le backend** : Les seeders sont créés pour correspondre au backend existant
- **Mot de passe de test uniquement** : Ne jamais utiliser `780662aB2` en production
- **Coordonnées GPS réelles** : Toutes les coordonnées correspondent à de vraies adresses
- **Données cohérentes** : Toutes les relations FK sont respectées, pas d'orphelins

## 🎯 Prochaines Étapes Possibles

Pour étendre les seeders :
1. Créer `03-events.sql` avec des événements futurs pour chaque église
2. Créer `04-push-tokens.sql` avec des tokens de test
3. Créer `05-event-interests.sql` avec des intérêts d'événements

**Rappel** : Toujours respecter l'ordre des dépendances FK !
