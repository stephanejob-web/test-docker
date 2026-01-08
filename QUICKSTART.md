# Quick Start - Light Church

## Démarrage en 3 minutes sur n'importe quelle machine

### 📋 Prérequis

- Docker + Docker Compose installés
- Git

---

## 🚀 Installation

### 1️⃣ Cloner le projet

```bash
git clone <votre-repo>
cd test-docker
```

### 2️⃣ Configurer les ports

**Mac / Environnement standard** : Garder la config par défaut

**Linux / Machine avec conflits de ports** :

```bash
# Copier le template
cp .env.example .env

# Éditer selon vos besoins
nano .env
```

Exemple pour Linux avec Grafana (port 3000) et MySQL (port 3306) déjà utilisés :

```bash
MYSQL_PORT=3307
EXPRESS_PORT=5000
FRONTEND_PORT=8080
```

### 3️⃣ Lancer le projet

```bash
# Build et démarrage
docker-compose up -d --build

# Suivre les logs (optionnel)
docker-compose logs -f
```

### 4️⃣ Accéder à l'application

**Avec config par défaut** :
- Frontend : http://localhost
- API : http://localhost:3000/api

**Avec ports personnalisés** (exemple ci-dessus) :
- Frontend : http://localhost:8080
- API : http://localhost:5000/api

---

## ✅ Vérification

### Test rapide

```bash
# Frontend → Backend (via proxy nginx)
curl http://localhost/api/public/churches

# OU si FRONTEND_PORT=8080
curl http://localhost:8080/api/public/churches
```

### Voir les logs

```bash
# Tous les services
docker-compose logs -f

# Service spécifique
docker logs -f frontend-react
docker logs -f backend-express
docker logs -f mysql-db
```

---

## 🔧 Commandes Utiles

### Redémarrer après changement de .env

```bash
docker-compose down
docker-compose up -d --build
```

### Nettoyer complètement

```bash
# Arrêter et supprimer tout (⚠️ données MySQL perdues)
docker-compose down -v

# Rebuild from scratch
docker-compose up -d --build
```

### Accéder à MySQL

```bash
docker exec -it mysql-db mysql -uadmin -padmin light_church
```

### Shell dans un conteneur

```bash
docker exec -it backend-express sh
docker exec -it frontend-react sh
```

---

## 📚 Documentation Complète

- **CONFIGURATION_PORTS.md** : Guide détaillé de configuration multi-environnements
- **CLAUDE.md** : Architecture et développement
- **.env.example** : Toutes les variables disponibles

---

## 🐛 Problèmes Courants

### Port déjà utilisé

```bash
# Erreur : Bind for 0.0.0.0:3000 failed: port is already allocated

# Solution : Changer le port dans .env
EXPRESS_PORT=5000

# Rebuild
docker-compose down && docker-compose up -d --build
```

### 502 Bad Gateway sur /api

```bash
# Vérifier que nginx pointe vers le bon port backend
docker exec frontend-react cat /etc/nginx/conf.d/default.conf | grep proxy_pass

# Devrait montrer : http://backend:5000 (correspond à EXPRESS_PORT)

# Si incorrect, rebuild
docker-compose up -d --build frontend
```

### Frontend ne charge pas

```bash
# Vérifier que le build s'est bien passé
docker logs frontend-react

# Rebuild si nécessaire
docker-compose up -d --build frontend
```

---

**Besoin d'aide ?** Consultez CONFIGURATION_PORTS.md pour le guide complet.
