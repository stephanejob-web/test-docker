# 🏛️ Light Church - Church Directory Platform

Light Church est une plateforme complète de gestion d'annuaire d'églises avec géolocalisation, événements et notifications push.

## 📋 Table des Matières

- [Prérequis](#-prérequis)
- [Architecture](#️-architecture)
- [Installation](#-installation)
- [Utilisation](#-utilisation)
- [Base de Données](#️-base-de-données)
- [Identifiants de Test](#-identifiants-de-test)
- [Documentation](#-documentation)
- [Troubleshooting](#-troubleshooting)

## 🎯 Prérequis

Avant de commencer, assurez-vous d'avoir installé :

- **Docker** (version 20.10+) - [Installation](https://docs.docker.com/get-docker/)
- **Docker Compose** (version 2.0+) - [Installation](https://docs.docker.com/compose/install/)
- **Git** - [Installation](https://git-scm.com/downloads)

### Vérifier les installations

```bash
docker --version          # Doit afficher Docker version 20.10+
docker-compose --version  # Doit afficher Docker Compose version 2.0+
git --version            # Doit afficher git version 2.x+
```

## 🏗️ Architecture

Le projet se compose de 3 applications conteneurisées :

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│                 │     │                 │     │                 │
│   Frontend      │────▶│    Backend      │────▶│    MySQL        │
│   React + Vite  │     │   Express.js    │     │   Database      │
│   Port: 80      │     │   Port: 3000    │     │   Port: 3306    │
│                 │     │                 │     │                 │
└─────────────────┘     └─────────────────┘     └─────────────────┘
```

### Technologies

- **Frontend** : React 18, Vite, Material-UI, Leaflet (cartes), React Query
- **Backend** : Node.js, Express, JWT, Bcrypt, MySQL2
- **Database** : MySQL 8.0 avec extension PostGIS pour géolocalisation
- **Mobile** : React Native, Expo (dans `/light-church-mobile`)

## 🚀 Installation

### 1. Cloner le projet

```bash
git clone <url-du-repo>
cd test-docker
```

### 2. Créer le fichier d'environnement

```bash
cat > .env <<EOF
MYSQL_ROOT_PASSWORD=root
MYSQL_DATABASE=light_church
MYSQL_USER=light_user
MYSQL_PASSWORD=light_password
JWT_SECRET=your_secret_key_here_change_in_production
EOF
```

⚠️ **IMPORTANT** : En production, utilisez des mots de passe forts et uniques !

### 3. Construire et lancer les conteneurs

```bash
docker-compose up -d
```

Cette commande va :
- Télécharger les images Docker nécessaires
- Construire les conteneurs backend et frontend
- Créer la base de données MySQL avec le schéma
- Démarrer tous les services

### 4. Vérifier que tout fonctionne

```bash
# Voir les logs
docker-compose logs -f

# Vérifier que les 3 conteneurs sont actifs
docker-compose ps
```

Vous devriez voir :
```
NAME                IMAGE                   STATUS
backend-express     test-docker-backend     Up
frontend-react      test-docker-frontend    Up
mysql-db            mysql:8.0               Up (healthy)
```

### 5. Accéder à l'application

**🌐 Frontend** : http://localhost

**📡 Backend API** : http://localhost:3000

**🗄️ Base de données** : localhost:3306

## 📖 Utilisation

### Démarrage Rapide

#### Première utilisation : Base de données vide

Au premier démarrage, la base de données contient uniquement la structure (tables), mais **aucune donnée**.

Pour pouvoir utiliser l'application, vous devez **soit** :

**Option A : Charger les données de test (recommandé)**

```bash
./seed-database.sh
```

Ce script va peupler la base avec :
- 1 Super Admin
- 30 Pasteurs (déjà validés)
- 30 Églises (Paris, Toulon, Ollioules)
- Données de référence (langues, dénominations, etc.)

**Option B : Créer vos propres données**

1. Ouvrez l'application : http://localhost
2. Cliquez sur "S'inscrire"
3. Créez un compte pasteur
4. Attendez qu'un super admin valide votre compte
5. Créez votre église

⚠️ **Note** : L'option B nécessite d'avoir d'abord un super admin. Pour créer le premier super admin, vous devez soit utiliser les seeders, soit modifier directement la base de données.

### Commandes Docker Utiles

```bash
# Démarrer les conteneurs
docker-compose up -d

# Arrêter les conteneurs
docker-compose down

# Voir les logs en temps réel
docker-compose logs -f

# Voir les logs d'un service spécifique
docker-compose logs -f backend

# Reconstruire après modification du code
docker-compose up -d --build

# Redémarrer un service spécifique
docker-compose restart backend

# Accéder au shell MySQL
docker exec -it mysql-db mysql -u root -proot light_church
```

### Réinitialiser la base de données

```bash
# 1. Arrêter les conteneurs
docker-compose down

# 2. Supprimer le volume de données
docker volume rm test-docker_mysql-data

# 3. Redémarrer (crée une base vide)
docker-compose up -d

# 4. Attendre que MySQL démarre (10-15 secondes)
sleep 15

# 5. Charger les seeders
./seed-database.sh
```

## 🗄️ Base de Données

### Structure

La base de données contient 14 tables principales :

- **admins** : Utilisateurs (Super Admin, Pasteurs, Évangélistes)
- **churches** : Églises avec géolocalisation
- **church_details** : Détails des églises (adresse, description, parking, etc.)
- **church_schedules** : Horaires des cultes
- **church_socials** : Réseaux sociaux des églises
- **events** : Événements organisés par les églises
- **event_details** : Détails des événements
- **denominations** : Dénominations religieuses
- **church_unions** : Unions d'églises (CNEF, FPF, etc.)
- **languages** : Langues disponibles
- **activity_types** : Types d'activités (Culte, Prière, etc.)
- **push_tokens** : Tokens de notification mobile
- **event_interests** : Intérêts des utilisateurs pour les événements
- **event_translations** : Traductions des événements

### Seeders

Le fichier `seeders.sql` contient :

| Type de Données | Quantité | Description |
|----------------|----------|-------------|
| Super Admin | 1 | admin@lightchurch.fr |
| Pasteurs | 30 | 10 Paris + 10 Toulon + 10 Ollioules |
| Églises | 30 | Avec adresses réelles et GPS |
| Dénominations | 6 | Évangélique, Baptiste, Pentecôtiste, etc. |
| Unions | 4 | CNEF, FPF, ADD France, Indépendant |
| Langues | 10 | Français, Anglais, Espagnol, etc. |
| Horaires | 60 | 2 horaires par église |
| Réseaux Sociaux | 19 | Facebook, Instagram, YouTube |

### Exécuter les Seeders

**Méthode 1 : Script helper (recommandé)**

```bash
./seed-database.sh
```

**Méthode 2 : Commande manuelle**

```bash
docker exec -i mysql-db mysql -u root -proot light_church < seeders.sql
```

**Méthode 3 : Depuis le shell MySQL**

```bash
# Entrer dans MySQL
docker exec -it mysql-db mysql -u root -proot light_church

# Exécuter le seeder
SOURCE /path/to/seeders.sql;
```

### Vérifier les données

```bash
# Compter les admins
docker exec mysql-db mysql -u root -proot light_church -e "SELECT COUNT(*) FROM admins;"

# Compter les églises par ville
docker exec mysql-db mysql -u root -proot light_church -e "
  SELECT city, COUNT(*) as count
  FROM church_details
  GROUP BY city
  ORDER BY city;
"

# Voir tous les emails admin
docker exec mysql-db mysql -u root -proot light_church -e "
  SELECT id, email, role, status
  FROM admins
  ORDER BY id;
"
```

## 🔐 Identifiants de Test

Après avoir exécuté les seeders, vous pouvez vous connecter avec :

### Super Admin

```
Email: admin@lightchurch.fr
Password: 780662aB2
```

Le super admin peut :
- ✅ Valider/rejeter les inscriptions de pasteurs
- ✅ Gérer tous les utilisateurs
- ✅ Modifier toutes les églises
- ✅ Voir tous les événements

### Pasteurs (30 comptes)

Tous les pasteurs partagent le même mot de passe : `780662aB2`

**Paris (10 églises)**
```
p.martin@paris1.fr       - Pierre Martin (Église Évangélique Belleville)
j.dubois@paris2.fr       - Jacques Dubois (Assemblée de Dieu Montmartre)
m.bernard@paris3.fr      - Michel Bernard (Église Baptiste du Marais)
a.thomas@paris4.fr       - Alain Thomas (Église Pentecôtiste Nation)
r.petit@paris5.fr        - Robert Petit (Église Évangélique Bastille)
p.robert@paris6.fr       - Paul Robert (Assemblée de Dieu Oberkampf)
j.richard@paris7.fr      - Jean Richard (Église Protestante Unie Batignolles)
f.durand@paris8.fr       - François Durand (Église Indépendante République)
d.moreau@paris9.fr       - Daniel Moreau (Église Évangélique Ménilmontant)
l.simon@paris10.fr       - Laurent Simon (Église Pentecôtiste Père Lachaise)
```

**Toulon (10 églises)**
```
c.moreau@toulon1.fr      - Christian Moreau (Assemblée de Dieu du Port)
f.girard@toulon2.fr      - Frédéric Girard (Église Évangélique Mourillon)
g.bonnet@toulon3.fr      - Gérard Bonnet (Église Baptiste Faron)
n.blanc@toulon4.fr       - Nicolas Blanc (Église Pentecôtiste Centre-Ville)
p.garcia@toulon5.fr      - Philippe Garcia (Église Évangélique La Garde)
s.martinez@toulon6.fr    - Stéphane Martinez (Assemblée de Dieu Sainte-Musse)
t.lopez@toulon7.fr       - Thierry Lopez (Église Protestante Unie Bon Rencontre)
v.gonzalez@toulon8.fr    - Vincent Gonzalez (Église Indépendante Petit Bois)
x.perez@toulon9.fr       - Xavier Perez (Église Évangélique Claret)
y.sanchez@toulon10.fr    - Yves Sanchez (Église Pentecôtiste Cap Brun)
```

**Ollioules (10 églises)**
```
e.dupont@ollioules1.fr   - Éric Dupont (Église Évangélique Centre)
l.andre@ollioules2.fr    - Luc André (Assemblée de Dieu Les Gorges)
m.fontaine@ollioules3.fr - Marc Fontaine (Église Baptiste La Favière)
o.chevalier@ollioules4.fr- Olivier Chevalier (Église Pentecôtiste La Castellane)
q.lambert@ollioules5.fr  - Quentin Lambert (Église Évangélique Sainte-Barbe)
r.rousseau@ollioules6.fr - René Rousseau (Assemblée de Dieu Les Oliviers)
s.vincent@ollioules7.fr  - Serge Vincent (Église Protestante Unie Le Castillon)
t.leroy@ollioules8.fr    - Thomas Leroy (Église Indépendante La Courtine)
u.clement@ollioules9.fr  - Urbain Clément (Église Évangélique Les Plans)
w.gauthier@ollioules10.fr- William Gauthier (Église Pentecôtiste La Combe)
```

Un pasteur peut :
- ✅ Modifier sa propre église
- ✅ Créer/modifier/supprimer ses événements
- ✅ Voir le réseau des autres pasteurs (si visibilité activée)

⚠️ **ATTENTION** : Ces mots de passe sont pour le développement UNIQUEMENT. Ne JAMAIS utiliser `780662aB2` en production !

## 📚 Documentation

### Structure du Projet

```
test-docker/
├── backend-express/          # Backend Node.js + Express
│   ├── routes/              # Routes API
│   ├── middleware/          # Auth, validation
│   ├── config/              # Configuration DB
│   ├── validators/          # Validateurs express-validator
│   └── utils/               # Utilitaires
├── frontend-react/           # Frontend React + Vite
│   ├── src/
│   │   ├── components/      # Composants réutilisables
│   │   ├── pages/           # Pages de l'application
│   │   ├── context/         # Context API (Auth)
│   │   ├── lib/             # Schemas Zod, utils
│   │   └── services/        # Appels API
│   └── public/              # Assets statiques
├── light-church-mobile/      # Application mobile Expo
├── docker-compose.yml        # Configuration Docker
├── schema.sql               # Structure de la base de données
├── seeders.sql              # Données de test
├── seed-database.sh         # Script pour charger les seeders
└── README.md                # Ce fichier

Documentation additionnelle :
├── CLAUDE.md                # Guide complet du projet pour Claude Code
├── DATABASE.md              # Guide de gestion de la base de données
├── SETUP_COMPLETE.md        # Historique de la configuration
├── SEEDERS_REBUILD.md       # Documentation de reconstruction des seeders
└── IMPLEMENTATION_SUMMARY.md # Résumé des fonctionnalités
```

### API Endpoints

#### Publics (sans authentification)

```bash
GET  /api/public/events                    # Liste des événements
GET  /api/public/events/:id                # Détails d'un événement
GET  /api/public/churches                  # Liste des églises
POST /api/public/events/:id/interest       # S'intéresser à un événement
```

#### Authentification

```bash
POST /api/auth/register                    # Inscription pasteur
POST /api/auth/login                       # Connexion (retourne JWT)
```

#### Pasteurs (authentification requise)

```bash
GET  /api/church                           # Voir sa propre église
PUT  /api/church                           # Modifier sa propre église
POST /api/church/events                    # Créer un événement
PUT  /api/church/events/:id                # Modifier son événement
DELETE /api/church/events/:id              # Supprimer son événement
```

#### Admin (rôle SUPER_ADMIN requis)

```bash
GET  /api/admin/registrations              # Liste des inscriptions en attente
PUT  /api/admin/registrations/:id          # Valider/rejeter une inscription
GET  /api/admin/users                      # Liste tous les utilisateurs
GET  /api/admin/churches                   # Liste toutes les églises
PUT  /api/admin/churches/:id               # Modifier n'importe quelle église
GET  /api/admin/events                     # Liste tous les événements
```

### Développement Frontend

```bash
cd frontend-react

# Installer les dépendances
npm install

# Démarrer en mode développement (hors Docker)
npm run dev

# Build de production
npm run build

# Lancer les tests
npm test

# Linter
npm run lint
```

### Développement Backend

```bash
cd backend-express

# Installer les dépendances
npm install

# Démarrer en mode développement (hors Docker)
npm run dev

# Lancer les tests
npm test

# Voir la couverture
npm run test:coverage
```

### Application Mobile

```bash
cd light-church-mobile

# Installer les dépendances
npm install

# Démarrer Expo
npm start

# Lancer sur Android
npm run android

# Lancer sur iOS
npm run ios

# Lancer dans le navigateur
npm run web
```

## 🔧 Troubleshooting

### Les conteneurs ne démarrent pas

```bash
# Vérifier les logs
docker-compose logs

# Vérifier que les ports ne sont pas utilisés
lsof -i :80    # Frontend
lsof -i :3000  # Backend
lsof -i :3306  # MySQL

# Nettoyer et reconstruire
docker-compose down
docker-compose up -d --build
```

### La base de données ne se connecte pas

```bash
# Vérifier que MySQL est prêt
docker exec mysql-db mysqladmin ping -h localhost -u root -proot

# Vérifier les logs MySQL
docker logs mysql-db

# Attendre que le healthcheck passe
docker-compose ps
```

### Les seeders ne s'exécutent pas

```bash
# Vérifier que le fichier existe
ls -la seeders.sql

# Vérifier les permissions
chmod 644 seeders.sql

# Exécuter manuellement avec verbose
docker exec -i mysql-db mysql -u root -proot light_church -vvv < seeders.sql
```

### Le frontend affiche une page blanche

```bash
# Reconstruire le frontend
docker-compose up -d --build frontend

# Vérifier les logs du frontend
docker-compose logs frontend

# Vérifier que l'API répond
curl http://localhost:3000/
```

### Erreur 500 lors de la création d'église

```bash
# Vérifier les logs backend
docker-compose logs backend

# Vérifier que les seeders ont bien créé les langues
docker exec mysql-db mysql -u root -proot light_church -e "SELECT * FROM languages WHERE id=10;"

# Si la langue id=10 n'existe pas, recharger les seeders
./seed-database.sh
```

### Réinitialisation complète

Si tout est cassé, réinitialisation complète :

```bash
# 1. Tout supprimer
docker-compose down -v
docker system prune -a --volumes -f

# 2. Recréer
docker-compose up -d

# 3. Attendre 15 secondes
sleep 15

# 4. Charger les données
./seed-database.sh
```

## 🤝 Contribution

### Workflow Git

```bash
# Créer une branche pour votre feature
git checkout -b feature/ma-nouvelle-feature

# Faire vos modifications
git add .
git commit -m "feat: description de la feature"

# Pousser la branche
git push origin feature/ma-nouvelle-feature

# Créer une Pull Request sur GitHub
```

### Conventions de Commit

Nous utilisons [Conventional Commits](https://www.conventionalcommits.org/) :

- `feat:` Nouvelle fonctionnalité
- `fix:` Correction de bug
- `docs:` Documentation
- `style:` Formatage, pas de changement de code
- `refactor:` Refactorisation
- `test:` Ajout/modification de tests
- `chore:` Tâches de maintenance

## 📄 Licence

Ce projet est sous licence [votre-licence].

## 📞 Support

Pour toute question ou problème :

- 📖 Consultez d'abord la documentation dans `/docs`
- 🐛 Ouvrez une issue sur GitHub
- 💬 Contactez l'équipe de développement

---

**✨ Développé avec ❤️ par l'équipe Light Church**
