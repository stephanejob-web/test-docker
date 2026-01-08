# 🎯 Solution Multi-Environnements - Light Church

## Résumé de la Solution

Votre projet est maintenant **100% portable** entre différentes machines. La configuration se fait uniquement via le fichier `.env`.

---

## 📦 Fichiers Créés

```
test-docker/
├── .env                          # ✅ Configuration actuelle (à modifier selon votre machine)
├── .env.example                  # 📖 Template avec toutes les variables documentées
├── .env.linux                    # 🐧 Exemple pour Linux (ports 3307, 5000, 8080)
│
├── frontend-react/
│   ├── nginx.conf.template       # 🔧 Template nginx avec variables
│   ├── docker-entrypoint.sh      # ⚙️  Script de génération dynamique de la config
│   └── Dockerfile                # 🐳 Modifié pour utiliser l'entrypoint
│
├── docker-compose.yml            # 🐳 Modifié : passe BACKEND_PORT au frontend
│
├── QUICKSTART.md                 # 🚀 Guide de démarrage rapide (3 minutes)
├── CONFIGURATION_PORTS.md        # 📚 Documentation complète multi-environnements
├── README_MULTI_ENV.md           # 📄 Ce fichier (résumé de la solution)
└── test-config.sh                # 🧪 Script de test automatique
```

---

## 🚀 Pour Démarrer sur une Nouvelle Machine

### Option 1 : Configuration Standard (Mac)

```bash
# Les valeurs par défaut fonctionnent directement
docker-compose up -d --build

# Accès
# Frontend : http://localhost
# API      : http://localhost:3000/api
```

### Option 2 : Linux avec Conflits de Ports

```bash
# 1. Copier le template Linux
cp .env.linux .env

# 2. Lancer Docker
docker-compose up -d --build

# 3. Tester
./test-config.sh

# Accès
# Frontend : http://localhost:8080
# API      : http://localhost:5000/api
```

### Option 3 : Configuration Personnalisée

```bash
# 1. Copier l'exemple
cp .env.example .env

# 2. Modifier selon vos besoins
nano .env

# Exemple : éviter conflits avec Grafana et phpMyAdmin
MYSQL_PORT=3307
EXPRESS_PORT=5000
FRONTEND_PORT=8080

# 3. Lancer
docker-compose up -d --build

# 4. Vérifier
./test-config.sh
```

---

## ✅ Vérifier que Tout Fonctionne

### Test Automatique

```bash
chmod +x test-config.sh
./test-config.sh
```

**Résultat attendu** :
```
==================================================
  ✅ Tous les tests sont passés !
==================================================

🌐 Accès :
   - Frontend : http://localhost:8080
   - API      : http://localhost:5000/api
   - MySQL    : localhost:3307
```

### Test Manuel

```bash
# 1. Vérifier nginx
docker exec frontend-react cat /etc/nginx/conf.d/default.conf | grep proxy_pass
# Doit montrer : proxy_pass http://backend:5000; (selon EXPRESS_PORT)

# 2. Tester frontend → backend
curl http://localhost:8080/api/public/churches | jq
# OU avec port par défaut
curl http://localhost/api/public/churches | jq

# 3. Voir les logs
docker logs frontend-react
# Doit montrer : 🔧 Configuration nginx avec BACKEND_PORT=5000
#                ✅ Configuration nginx générée
```

---

## 🔧 Variables d'Environnement

| Variable        | Défaut | Description                     | Modifiable |
|-----------------|--------|---------------------------------|------------|
| MYSQL_PORT      | 3306   | Port MySQL sur l'hôte           | ✅ Oui      |
| EXPRESS_PORT    | 3000   | Port backend Express            | ✅ Oui      |
| FRONTEND_PORT   | 80     | Port frontend React             | ✅ Oui      |
| JWT_SECRET      | weak   | Secret pour tokens JWT          | ⚠️ Changer  |
| MYSQL_PASSWORD  | admin  | Mot de passe MySQL              | ⚠️ Changer  |

**Important** : Quand vous changez `EXPRESS_PORT`, le frontend s'adapte **automatiquement** grâce au système de template nginx.

---

## 🎯 Comment Ça Fonctionne

### Avant (Problème)

```nginx
# nginx.conf - PORT CODÉ EN DUR
location /api {
    proxy_pass http://backend:3000;  ❌ Fixe !
}
```

**Conséquence** : Si vous changez `EXPRESS_PORT=5000`, nginx cherche toujours le backend sur le port 3000 → 502 Bad Gateway

### Après (Solution)

```nginx
# nginx.conf.template - VARIABLE
location /api {
    proxy_pass http://backend:${BACKEND_PORT};  ✅ Dynamique !
}
```

**Au démarrage du conteneur** :
1. `docker-entrypoint.sh` lit `${BACKEND_PORT}` depuis l'environnement
2. Remplace dans le template : `${BACKEND_PORT}` → `5000`
3. Génère `/etc/nginx/conf.d/default.conf` avec le bon port
4. Démarre nginx

**Résultat** : nginx sait toujours où trouver le backend, peu importe le port configuré.

---

## 📚 Documentation

| Fichier                    | Contenu                                           |
|----------------------------|---------------------------------------------------|
| **QUICKSTART.md**          | Démarrage rapide en 3 minutes                     |
| **CONFIGURATION_PORTS.md** | Guide complet multi-environnements, debug, etc.   |
| **.env.example**           | Toutes les variables avec commentaires            |
| **.env.linux**             | Exemple pour Linux avec Grafana                   |

---

## 🐛 Troubleshooting Rapide

### "Port already allocated"

```bash
# Changer le port dans .env
nano .env
# Modifier : EXPRESS_PORT=5000

# Rebuild
docker-compose down && docker-compose up -d --build
```

### "502 Bad Gateway" sur /api

```bash
# Vérifier que nginx a la bonne config
docker exec frontend-react cat /etc/nginx/conf.d/default.conf | grep proxy_pass

# Si incorrect, rebuild le frontend
docker-compose up -d --build frontend
```

### Changements dans .env non pris en compte

```bash
# Rebuild complet
docker-compose down
docker-compose up -d --build
```

---

## 💡 Bonnes Pratiques

### Sécurité

```bash
# Générer un JWT_SECRET fort
openssl rand -base64 32

# Ajouter dans .env
JWT_SECRET=VotreCléGénérée...
```

### Git

```bash
# .env est déjà dans .gitignore
# ✅ Ne jamais committer .env (contient des secrets)
# ✅ Toujours committer .env.example (documentation)
```

### Nouvelle Machine

1. `git pull`
2. `cp .env.example .env`
3. Modifier les ports si nécessaire
4. `docker-compose up -d --build`
5. `./test-config.sh`

---

## 🎉 Résumé

| Avant                              | Après                                  |
|------------------------------------|----------------------------------------|
| ❌ Ports codés en dur              | ✅ Configuration via .env              |
| ❌ Modifier nginx.conf à chaque fois | ✅ Un seul fichier à modifier          |
| ❌ Risque d'incohérence            | ✅ Synchronisation automatique         |
| ❌ Configuration différente par machine | ✅ Portable entre toutes les machines  |

**Votre projet est maintenant production-ready et multi-environnements !**

---

**Besoin d'aide ?**
- Quick start : Voir `QUICKSTART.md`
- Documentation complète : Voir `CONFIGURATION_PORTS.md`
- Test automatique : Lancer `./test-config.sh`
