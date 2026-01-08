# Architecture de la Solution Multi-Environnements

## Vue d'Ensemble

Cette solution permet de **changer les ports de tous les services** simplement en modifiant le fichier `.env`, sans toucher au code.

---

## 🏗️ Architecture Complète

```
┌─────────────────────────────────────────────────────────────────┐
│                    FICHIER .env (SOURCE UNIQUE)                 │
│                                                                 │
│    MYSQL_PORT=3307                                              │
│    EXPRESS_PORT=5000                                            │
│    FRONTEND_PORT=8080                                           │
│    JWT_SECRET=...                                               │
└─────────────────┬───────────────────────────────────────────────┘
                  │
                  │ Variables d'environnement
                  │
                  ▼
┌─────────────────────────────────────────────────────────────────┐
│                     DOCKER-COMPOSE.YML                          │
│                                                                 │
│  mysql:                                                         │
│    ports: "${MYSQL_PORT:-3306}:3306"                            │
│                                                                 │
│  backend:                                                       │
│    environment:                                                 │
│      PORT: ${EXPRESS_PORT:-3000}                                │
│    ports: "${EXPRESS_PORT:-3000}:${EXPRESS_PORT:-3000}"         │
│                                                                 │
│  frontend:                                                      │
│    environment:                                                 │
│      BACKEND_PORT: ${EXPRESS_PORT:-3000}  ← Transmet le port    │
│    ports: "${FRONTEND_PORT:-80}:80"                             │
└─────────────────┬───────────────────────────────────────────────┘
                  │
                  │
        ┌─────────┴─────────┬─────────────────┐
        │                   │                 │
        ▼                   ▼                 ▼
┌──────────────┐    ┌──────────────┐  ┌──────────────┐
│    MySQL     │    │   Backend    │  │   Frontend   │
│  Container   │    │  Container   │  │  Container   │
│              │    │              │  │              │
│  Port 3306   │    │  Port 5000   │  │  Port 80     │
│  (interne)   │    │  (interne +  │  │  (interne)   │
│              │    │   externe)   │  │              │
│  Exposé sur  │    │              │  │  Exposé sur  │
│  hôte: 3307  │    │  Exposé sur  │  │  hôte: 8080  │
│              │    │  hôte: 5000  │  │              │
└──────────────┘    └──────────────┘  └──────┬───────┘
                                             │
                                             │
                                             ▼
                                    ┌──────────────────┐
                                    │ docker-entrypoint│
                                    │      .sh         │
                                    │                  │
                                    │ BACKEND_PORT=5000│
                                    │ (depuis env)     │
                                    └────────┬─────────┘
                                             │
                                             ▼
                                    ┌──────────────────┐
                                    │ nginx.conf       │
                                    │   .template      │
                                    │                  │
                                    │ ${BACKEND_PORT}  │
                                    └────────┬─────────┘
                                             │
                                      envsubst (substitution)
                                             │
                                             ▼
                                    ┌──────────────────┐
                                    │ /etc/nginx/conf.d│
                                    │  /default.conf   │
                                    │                  │
                                    │ proxy_pass http: │
                                    │ //backend:5000   │
                                    └──────────────────┘
```

---

## 🔄 Flux de Configuration au Démarrage

### 1. Lecture du .env

```bash
# Docker Compose lit le fichier .env
EXPRESS_PORT=5000
FRONTEND_PORT=8080
```

### 2. Démarrage du Backend

```bash
# Le backend reçoit PORT=5000
# Il écoute sur le port 5000 (interne et externe)
docker-compose up backend
→ Backend écoute sur 0.0.0.0:5000
```

### 3. Démarrage du Frontend

```bash
# Le frontend reçoit BACKEND_PORT=5000 (via environment)
docker-compose up frontend
→ Démarre le conteneur
→ Lance docker-entrypoint.sh
```

### 4. Génération de la Config Nginx

```bash
# docker-entrypoint.sh s'exécute
#!/bin/sh
BACKEND_PORT=${BACKEND_PORT:-3000}  # Lit depuis l'environnement = 5000

# Substitue ${BACKEND_PORT} dans le template
envsubst '${BACKEND_PORT}' < nginx.conf.template > default.conf

# default.conf contient maintenant :
# proxy_pass http://backend:5000;

# Démarre nginx
nginx -g 'daemon off;'
```

### 5. Résultat Final

```
Utilisateur → http://localhost:8080/api/churches
                      ↓
              Frontend (nginx)
                      ↓
              Lit : /etc/nginx/conf.d/default.conf
                      ↓
              Voit : proxy_pass http://backend:5000;
                      ↓
              Proxie vers → Backend:5000 (réseau Docker interne)
                      ↓
              Backend traite la requête
                      ↓
              Retourne la réponse
                      ↓
              Utilisateur reçoit les données
```

---

## 🌍 Comparaison Multi-Environnements

### Environnement 1 : Mac (Développement)

```
┌────────────────┐
│   .env (Mac)   │
│                │
│ MYSQL=3306     │
│ EXPRESS=3000   │
│ FRONTEND=80    │
└────────┬───────┘
         │
         ▼
┌─────────────────────────────────────┐
│  Ports Exposés sur l'Hôte           │
│                                     │
│  localhost:80    → Frontend         │
│  localhost:3000  → Backend          │
│  localhost:3306  → MySQL            │
│                                     │
│  nginx.conf généré :                │
│  proxy_pass http://backend:3000     │
└─────────────────────────────────────┘
```

### Environnement 2 : Linux (Conflits Grafana, MySQL)

```
┌────────────────┐
│  .env (Linux)  │
│                │
│ MYSQL=3307     │ ← Évite MySQL système (3306)
│ EXPRESS=5000   │ ← Évite Grafana (3000)
│ FRONTEND=8080  │ ← Port alternatif
└────────┬───────┘
         │
         ▼
┌─────────────────────────────────────┐
│  Ports Exposés sur l'Hôte           │
│                                     │
│  localhost:8080  → Frontend         │
│  localhost:5000  → Backend          │
│  localhost:3307  → MySQL            │
│                                     │
│  nginx.conf généré :                │
│  proxy_pass http://backend:5000     │ ← Adapté !
└─────────────────────────────────────┘
```

**Même code, configuration différente !**

---

## 🔑 Points Clés de la Solution

### 1. Single Source of Truth

```
.env (UN SEUL FICHIER)
    ↓
Tous les services s'adaptent automatiquement
```

### 2. Génération Dynamique

```
Template nginx.conf.template
    +
Variable BACKEND_PORT
    ↓
envsubst (substitution)
    ↓
Configuration finale nginx
```

### 3. Réseau Docker Interne

```
Frontend (nginx) → backend:5000
                   ↑
                   Nom du service (résolution DNS Docker)
```

Le port `5000` dans nginx correspond au port **interne** du conteneur backend, qui écoute toujours sur le port configuré via `PORT` env variable.

### 4. Valeurs Par Défaut

```yaml
# docker-compose.yml
ports:
  - "${EXPRESS_PORT:-3000}:${EXPRESS_PORT:-3000}"
    #              ↑                    ↑
    #      Si .env manque       Port interne = port externe
```

Si `.env` est absent, les ports par défaut (3000) sont utilisés.

---

## 🎯 Avantages de cette Architecture

| Aspect            | Avant                        | Après                          |
|-------------------|------------------------------|--------------------------------|
| **Portabilité**   | ❌ Code à modifier           | ✅ .env seulement              |
| **Maintenance**   | ❌ Risque d'oubli            | ✅ Centralisé                  |
| **Scalabilité**   | ❌ Difficile                 | ✅ Ajouter variables facilement|
| **Sécurité**      | ❌ Secrets éparpillés        | ✅ .env gitignored             |
| **Multi-env**     | ❌ Branches/fichiers multiples| ✅ Un .env par environnement  |
| **Onboarding**    | ❌ Doc complexe              | ✅ cp .env.example .env        |

---

## 📐 Diagramme de Séquence

```
User               Frontend           Nginx           Backend          MySQL
  │                  Container         Config          Container        Container
  │                     │                │               │                │
  │   GET /api/...     │                │               │                │
  ├───────────────────>│                │               │                │
  │                    │                │               │                │
  │                    │  Lit config    │               │                │
  │                    ├───────────────>│               │                │
  │                    │                │               │                │
  │                    │  proxy_pass    │               │                │
  │                    │  backend:5000  │               │                │
  │                    │<───────────────┤               │                │
  │                    │                                │                │
  │                    │   Forward request              │                │
  │                    ├──────────────────────────────>│                │
  │                    │                                │                │
  │                    │                                │  SELECT ...   │
  │                    │                                ├──────────────>│
  │                    │                                │                │
  │                    │                                │  Result       │
  │                    │                                │<──────────────┤
  │                    │                                │                │
  │                    │   Response                     │                │
  │                    │<───────────────────────────────┤                │
  │                    │                                │                │
  │   Response         │                                │                │
  │<───────────────────┤                                │                │
  │                    │                                │                │
```

---

## 🧩 Fichiers de la Solution

```
frontend-react/
├── nginx.conf.template       🔧 Template avec ${BACKEND_PORT}
│   location /api {
│       proxy_pass http://backend:${BACKEND_PORT};
│   }
│
├── docker-entrypoint.sh      ⚙️  Script exécuté au démarrage
│   #!/bin/sh
│   BACKEND_PORT=${BACKEND_PORT:-3000}
│   envsubst < template > config
│   nginx -g 'daemon off;'
│
└── Dockerfile                🐳 Copie template + script, utilise ENTRYPOINT
    COPY nginx.conf.template /etc/nginx/conf.d/
    COPY docker-entrypoint.sh /
    RUN chmod +x /docker-entrypoint.sh
    ENTRYPOINT ["/docker-entrypoint.sh"]
```

```
docker-compose.yml            🐳 Passe BACKEND_PORT au frontend
frontend:
  environment:
    BACKEND_PORT: ${EXPRESS_PORT:-3000}
  ports:
    - "${FRONTEND_PORT:-80}:80"
```

```
.env                          ⚙️  Configuration de l'environnement
EXPRESS_PORT=5000
FRONTEND_PORT=8080
MYSQL_PORT=3307
```

---

## 🎓 Principe : 12-Factor App

Cette solution suit le principe **III. Config** des [12-Factor Apps](https://12factor.net/config) :

> **Store config in the environment**
>
> An app's config is everything that is likely to vary between deploys
> (staging, production, developer environments, etc).

**Avantages** :
- Séparation stricte code/config
- Configuration via variables d'environnement
- Aucun secret dans le code
- Multi-environnements sans modification du code

---

## 📊 Récapitulatif

```
🎯 Objectif     : Projet portable entre machines
🔑 Solution     : Configuration via .env + template dynamique
🏗️  Architecture : Docker Compose + Nginx + envsubst
📦 Livrables    : Template + Script + Docs
✅ Résultat     : Zéro modification de code requise
```

**La même image Docker fonctionne partout, seule la configuration change !**
