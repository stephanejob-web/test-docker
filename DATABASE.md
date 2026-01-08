# Guide de Gestion de la Base de Données

## Structure du Projet

```
schema.sql                          # Structure de la BDD (VERSIONNÉ sur Git)
backend-express/seeders/            # Données de test (VERSIONNÉES sur Git)
  ├── 01-denominations.sql
  ├── 02-churches-data.sql
  └── README.md                     # Documentation des identifiants et données
backup_*.sql                        # Backups personnels (NON VERSIONNÉS)
```

## Commandes Utiles

### Export de la structure (schema only)
```bash
docker exec mysql-db mysqldump -u root -proot --no-data --routines --triggers light_church > schema.sql
```

### Backup complet (structure + données)
```bash
docker exec mysql-db mysqldump -u root -proot light_church > backup_complet_$(date +%Y%m%d).sql
```

### Restaurer un backup
```bash
# Méthode 1 : Depuis l'hôte
docker exec -i mysql-db mysql -u root -proot light_church < backup_complet.sql

# Méthode 2 : Depuis le conteneur
cat backup_complet.sql | docker exec -i mysql-db mysql -u root -proot light_church
```

### Réinitialiser la base (⚠️ DESTRUCTIF)
```bash
# 1. Arrêter les conteneurs
docker-compose down

# 2. Supprimer le volume
docker volume rm test-docker_mysql-data

# 3. Redémarrer (utilise schema.sql)
docker-compose up -d
```

## Workflow de Développement

### Après avoir modifié la structure
1. Tester les changements en local
2. Exporter la nouvelle structure :
   ```bash
   docker exec mysql-db mysqldump -u root -proot --no-data light_church > schema.sql
   ```
3. Commit sur Git :
   ```bash
   git add schema.sql
   git commit -m "Update database schema: [description]"
   ```

### Quand un collègue clone le projet
```bash
git clone <repo>
docker-compose up -d
# La base est automatiquement initialisée avec schema.sql
```

## Fichiers à Versionner (Git)

✅ À COMMIT :
- `schema.sql` - Structure de référence
- `backend-express/seeders/` - Données de test (30 églises, admins, etc.)
- `docker-compose.yml` - Configuration Docker

❌ À IGNORER (.gitignore) :
- `backup_*.sql` - Backups personnels
- `bas_ok.sql` - Ancien fichier obsolète

## Identifiants de Test

Les seeders créent automatiquement des comptes de test :

**Tous les comptes (Super Admin + 30 Pasteurs) :**
- Password : `780662aB2`

**Emails :**
- Super Admin : `admin@lightchurch.fr`
- Pasteurs Paris : `p.martin@paris1.fr`, `j.dubois@paris2.fr`, etc.
- Pasteurs Toulon : `c.moreau@toulon1.fr`, `f.girard@toulon2.fr`, etc.
- Pasteurs Ollioules : `e.dupont@ollioules1.fr`, `l.andre@ollioules2.fr`, etc.

📖 Voir `backend-express/seeders/README.md` pour la liste complète

## Notes Importantes

- `schema.sql` est exécuté **une seule fois** à la création du volume Docker
- Pour voir les changements, il faut **supprimer le volume** et recréer
- Les données de test peuvent être ajoutées via des seeders (à créer)

## Migrations Futures (Phase 2)

Quand le projet sera en production, utiliser un système de migrations incrémentales :
- [node-pg-migrate](https://github.com/salsita/node-pg-migrate)
- [Knex.js](https://knexjs.org/)
- [Flyway](https://flywaydb.org/)

Pour l'instant, `schema.sql` suffit pour le développement.
