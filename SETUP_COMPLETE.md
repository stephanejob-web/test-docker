# ✅ Configuration Complète - Light Church

## 🎯 Ce qui a été fait

### 1. Nettoyage
- ❌ Supprimé `backend-express/migrations/` (obsolète)
- ✅ Gardé `schema.sql` comme source unique de vérité

### 2. Structure de Base de Données
- ✅ Exporté `schema.sql` depuis la base actuelle (14 tables)
- ✅ Remplacé l'ancien `bas_ok.sql` (12 tables obsolètes)

### 3. Seeders Créés (30 Églises + Admins)
- ✅ `seeders/01-denominations.sql` : Dénominations, unions, langues
- ✅ `seeders/02-churches-data.sql` : 30 églises + 31 admins + horaires
- ✅ `seeders/README.md` : Documentation complète

**Répartition des églises :**
- 📍 **10 églises à Paris** (Belleville, Montmartre, Marais, etc.)
- 📍 **10 églises à Toulon** (Port, Mourillon, Faron, etc.)
- 📍 **10 églises à Ollioules** (Centre, Les Gorges, La Favière, etc.)

**Toutes avec :**
- Coordonnées GPS réelles
- Adresses complètes
- Téléphones français (+33)
- Descriptions cohérentes
- Horaires de cultes (dimanche 10h + mercredi 19h30)
- Informations parking

### 4. Configuration Docker
- ✅ Mis à jour `docker-compose.yml` pour charger automatiquement :
  1. `schema.sql` (structure)
  2. `seeders/01-denominations.sql` (référentiels)
  3. `seeders/02-churches-data.sql` (églises et admins)

### 5. Documentation
- ✅ `DATABASE.md` : Guide complet de gestion de la BDD
- ✅ `seeders/README.md` : Identifiants de connexion et détails des données
- ✅ `.gitignore` : Mis à jour pour exclure les backups personnels

### 6. Tests
- ✅ Testé l'initialisation complète depuis zéro
- ✅ Vérifié les 30 églises + 31 admins + 60 horaires
- ✅ Confirmé les coordonnées GPS et données cohérentes

## 🔐 Identifiants de Test

### Super Admin
```
Email: admin@lightchurch.fr
Password: Admin123!
```

### Pasteurs (30 comptes)
```
Email: p.martin@paris1.fr (et 29 autres)
Password: Pastor123!
```

📖 Liste complète : `seeders/README.md`

## 🚀 Démarrage pour un Nouveau Développeur

```bash
# 1. Cloner le projet
git clone <votre-repo>
cd test-docker

# 2. Créer le fichier .env
cat > .env <<EOF
MYSQL_ROOT_PASSWORD=root
MYSQL_DATABASE=light_church
MYSQL_USER=light_user
MYSQL_PASSWORD=light_password
JWT_SECRET=your_secret_key_here
EOF

# 3. Démarrer Docker
docker-compose up -d

# ✅ La base est automatiquement initialisée !
```

**Résultat :**
- 🗄️ Base de données créée avec structure complète
- 🏛️ 30 églises réparties sur 3 villes
- 👤 31 comptes utilisateurs (1 admin + 30 pasteurs)
- ⏰ 60 horaires de cultes configurés
- 🎯 Prêt pour le développement !

## 📊 Statistiques des Données

| Type | Quantité |
|------|----------|
| Églises | 30 |
| Admins | 31 |
| Dénominations | 8 |
| Unions | 3 |
| Horaires | 60 |
| Langues | 3 |
| Types d'activités | 5 |
| Réseaux sociaux | 6 exemples |

## 📂 Fichiers à Versionner sur Git

```bash
git add schema.sql
git add seeders/
git add docker-compose.yml
git add .gitignore
git add DATABASE.md
git add SETUP_COMPLETE.md
git commit -m "feat: Database schema and seeders setup

- Export clean database structure (14 tables)
- Add 30 sample churches (Paris, Toulon, Ollioules)
- Add 31 admin accounts (1 super admin + 30 pastors)
- Configure Docker auto-initialization
- Update documentation
"
```

## 🔄 Réinitialisation de la Base

Pour recommencer avec des données fraîches :

```bash
docker-compose down
docker volume rm test-docker_mysql-data
docker-compose up -d
```

## 📝 Mise à Jour du Schema

Après avoir modifié la structure en développement :

```bash
# 1. Exporter la nouvelle structure
docker exec mysql-db mysqldump -u root -proot --no-data --routines --triggers light_church > schema.sql

# 2. Commit
git add schema.sql
git commit -m "update: Database schema changes"
```

## 🎓 Bonnes Pratiques

### ✅ DO (À FAIRE)
- Versionner `schema.sql` sur Git
- Versionner les `seeders/` sur Git
- Mettre à jour `schema.sql` après chaque modification de structure
- Utiliser les seeders pour les tests de développement
- Documenter les changements de schema dans le commit message

### ❌ DON'T (À ÉVITER)
- Ne pas versionner `backup_*.sql` (backups personnels)
- Ne pas utiliser ces mots de passe en production
- Ne pas modifier directement la base en production sans migration
- Ne pas commiter de données sensibles (vraies données utilisateurs)

## 🆘 Support

**Documentation :**
- `DATABASE.md` : Gestion de la base de données
- `seeders/README.md` : Détails des données de test
- `CLAUDE.md` : Documentation complète du projet

**En cas de problème :**
1. Vérifier les logs : `docker logs mysql-db`
2. Vérifier que le volume est vide avant init : `docker volume ls`
3. Réinitialiser complètement si nécessaire (commandes ci-dessus)

## 🏁 Next Steps

Le projet est maintenant prêt pour :
1. ✅ Partage sur GitHub
2. ✅ Développement en équipe
3. ✅ Tests avec données cohérentes
4. ✅ Démo du projet

**Prochaines améliorations possibles :**
- Ajouter plus de seeders (événements, réseaux sociaux)
- Créer des seeders pour différents environnements (dev, staging)
- Implémenter un système de migrations incrémentales (Phase 2)
- Ajouter des scripts de génération de données aléatoires

---

**✨ Projet configuré avec succès le 2026-01-08 ✨**
