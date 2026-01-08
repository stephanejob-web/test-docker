# Configuration des Ports - Guide Multi-Environnements

## Problème Résolu

Ce projet est maintenant **100% portable** entre différentes machines. Les ports se configurent uniquement via le fichier `.env`.

### Avant (Configuration rigide)
- Ports codés en dur dans nginx.conf
- Obligation de modifier le code à chaque machine
- Risque d'oubli et d'incohérence

### Maintenant (Configuration dynamique)
- **Un seul fichier à modifier** : `.env`
- **Synchronisation automatique** entre tous les services
- **Zéro modification de code**

---

## Configuration Rapide

### 1. Mac (Développement Standard)

```bash
# .env
MYSQL_PORT=3306
EXPRESS_PORT=3000
FRONTEND_PORT=80
```

**Accès** :
- Frontend : http://localhost
- Backend API : http://localhost:3000/api
- MySQL : localhost:3306

---

### 2. Linux au Travail (Grafana sur 3000, MySQL sur 3306)

```bash
# .env
MYSQL_PORT=3307        # Évite conflit avec MySQL existant
EXPRESS_PORT=5000      # Évite conflit avec Grafana
FRONTEND_PORT=8080     # Port alternatif si 80 occupé
```

**Accès** :
- Frontend : http://localhost:8080
- Backend API : http://localhost:5000/api
- MySQL : localhost:3307

---

### 3. Production / Serveur

```bash
# .env
MYSQL_PORT=3306
EXPRESS_PORT=3000
FRONTEND_PORT=80
JWT_SECRET=<générer_clé_forte>  # openssl rand -base64 32
```

---

## Comment Ça Fonctionne

### Architecture de la Solution

```
┌─────────────────────────────────────────────┐
│         Fichier .env (unique source)        │
│  EXPRESS_PORT=5000                          │
│  FRONTEND_PORT=8080                         │
│  MYSQL_PORT=3307                            │
└─────────────────┬───────────────────────────┘
                  │
        ┌─────────┴─────────┐
        │                   │
        ▼                   ▼
┌──────────────┐    ┌──────────────┐
│   Backend    │    │   Frontend   │
│   Port 5000  │◄───│   Port 8080  │
└──────────────┘    └──────────────┘
                            │
                    ┌───────┴───────┐
                    │ Nginx Proxy   │
                    │ /api → :5000  │ ← Généré dynamiquement
                    └───────────────┘
```

### Mécanisme Technique

1. **docker-compose.yml** lit les variables du `.env`
2. **Backend** : Écoute sur `${EXPRESS_PORT}` (interne + hôte)
3. **Frontend** : Reçoit `BACKEND_PORT=${EXPRESS_PORT}` via variable d'environnement
4. **Script d'entrypoint** (`docker-entrypoint.sh`) :
   - S'exécute au démarrage du conteneur frontend
   - Lit `nginx.conf.template`
   - Remplace `${BACKEND_PORT}` par la valeur réelle
   - Génère `/etc/nginx/conf.d/default.conf`
   - Démarre nginx

---

## Commandes de Déploiement

### Changer de Machine

```bash
# 1. Cloner le projet
git clone <repo>
cd test-docker

# 2. Copier et adapter .env
cp .env.example .env
nano .env  # Modifier les ports selon la machine

# 3. Lancer Docker
docker-compose down -v          # Nettoyer anciens conteneurs
docker-compose up -d --build    # Build avec nouvelle config

# 4. Vérifier la configuration nginx
docker exec frontend-react cat /etc/nginx/conf.d/default.conf
# Doit montrer : proxy_pass http://backend:5000; (si EXPRESS_PORT=5000)

# 5. Tester
curl http://localhost:8080/api/health  # Frontend → Backend
curl http://localhost:5000/api/health  # Backend direct
```

---

## Vérification et Debug

### 1. Vérifier que nginx a la bonne config

```bash
docker exec frontend-react cat /etc/nginx/conf.d/default.conf | grep proxy_pass
```

**Résultat attendu** :
```
proxy_pass http://backend:5000;  # Doit correspondre à EXPRESS_PORT
```

### 2. Vérifier les logs du frontend au démarrage

```bash
docker logs frontend-react
```

**Résultat attendu** :
```
🔧 Configuration nginx avec BACKEND_PORT=5000
✅ Configuration nginx générée:
...
proxy_pass http://backend:5000;
...
```

### 3. Tester les appels API

```bash
# Depuis le navigateur ou curl
curl http://localhost:8080/api/public/churches | jq

# Logs backend pour voir les requêtes
docker logs -f backend-express
```

### 4. Vérifier les ports utilisés

```bash
docker ps --format "table {{.Names}}\t{{.Ports}}"
```

**Résultat attendu** (avec EXPRESS_PORT=5000, FRONTEND_PORT=8080) :
```
NAMES              PORTS
frontend-react     0.0.0.0:8080->80/tcp
backend-express    0.0.0.0:5000->5000/tcp
mysql-db           0.0.0.0:3307->3306/tcp
```

---

## Variables d'Environnement Disponibles

| Variable          | Défaut | Description                              | Impact                    |
|-------------------|--------|------------------------------------------|---------------------------|
| `MYSQL_PORT`      | 3306   | Port MySQL exposé sur l'hôte             | Connexion externe MySQL   |
| `EXPRESS_PORT`    | 3000   | Port backend Express                     | API + Proxy nginx         |
| `FRONTEND_PORT`   | 80     | Port frontend React (http)               | Accès navigateur          |
| `JWT_SECRET`      | weak   | Secret pour tokens JWT                   | Sécurité                  |
| `MYSQL_*`         | -      | Config base de données                   | Connexion DB              |

---

## Résolution de Problèmes

### Problème : "502 Bad Gateway" sur /api

**Cause** : Nginx n'arrive pas à joindre le backend

**Solution** :
```bash
# 1. Vérifier la config nginx
docker exec frontend-react cat /etc/nginx/conf.d/default.conf | grep proxy_pass
# Doit être : http://backend:5000 (même port que EXPRESS_PORT)

# 2. Si le port ne correspond pas, rebuild
docker-compose down
docker-compose up -d --build

# 3. Vérifier que le backend est accessible depuis le frontend
docker exec frontend-react wget -O- http://backend:5000/api/health
```

---

### Problème : Port déjà utilisé

**Cause** : Conflit de port sur la machine hôte

**Solution** :
```bash
# 1. Identifier le processus
sudo lsof -i :3000  # Remplacer par le port en conflit
# OU sur Linux
sudo netstat -tulpn | grep :3000

# 2. Modifier .env pour utiliser un port libre
EXPRESS_PORT=5000  # Port alternatif

# 3. Redémarrer
docker-compose down
docker-compose up -d --build
```

---

### Problème : Modifications non prises en compte

**Cause** : Docker utilise un cache d'image

**Solution** :
```bash
# Rebuild complet sans cache
docker-compose down
docker-compose build --no-cache
docker-compose up -d
```

---

## Bonnes Pratiques

### 1. Sécurité

```bash
# Générer un JWT_SECRET fort
openssl rand -base64 32

# Ajouter dans .env
JWT_SECRET=<clé_générée>
```

### 2. Gitignore

Le fichier `.env` est déjà dans `.gitignore` pour éviter de commit des secrets.

**Toujours utiliser** `.env.example` comme template pour les nouveaux développeurs.

### 3. Documentation

Lors de l'ajout d'une nouvelle variable :
1. Ajouter dans `.env.example` avec commentaire
2. Documenter dans ce fichier
3. Ajouter une valeur par défaut dans `docker-compose.yml` si possible

---

## Avantages de cette Approche

✅ **Portabilité** : Un seul fichier à modifier pour toute la stack
✅ **Maintenabilité** : Aucun code à toucher, juste la config
✅ **Sécurité** : Secrets centralisés dans .env (gitignored)
✅ **Flexibilité** : Adaptation facile à tout environnement
✅ **Professionnalisme** : Standard de l'industrie (12-factor app)
✅ **Debug facile** : Logs clairs montrant la config appliquée

---

## Next Steps (Améliorations Futures)

- [ ] Utiliser `.env.local` pour overrides locaux
- [ ] Ajouter `docker-compose.override.yml` pour dev
- [ ] Créer des profils Docker Compose (dev, prod)
- [ ] Ajouter healthchecks sur tous les services
- [ ] Configurer HTTPS avec Let's Encrypt (Traefik)

---

**Auteur** : Solution multi-environnements pour Light Church
**Date** : 2026-01-08
**Version** : 1.0
