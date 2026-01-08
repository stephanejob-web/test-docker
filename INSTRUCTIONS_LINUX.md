# 🐧 Instructions pour votre Machine Linux au Travail

## Contexte

Votre machine Linux a déjà :
- **MySQL** sur le port 3306
- **Grafana** sur le port 3000
- Probablement **PHP** qui utilise aussi des ports standards

---

## ✅ Solution Prête à l'Emploi

J'ai préparé un fichier `.env.linux` qui évite tous ces conflits.

---

## 🚀 Procédure de Déploiement sur Linux

### 1. Pusher les Changements depuis Mac

Sur votre **Mac** (maintenant) :

```bash
# Vérifier les fichiers modifiés
git status

# Ajouter tous les nouveaux fichiers
git add .

# Committer
git commit -m "feat: configuration multi-environnements avec ports dynamiques

- Ajout nginx.conf.template avec variables d'environnement
- Ajout docker-entrypoint.sh pour génération dynamique de la config
- Modification docker-compose.yml pour passer BACKEND_PORT au frontend
- Ajout FRONTEND_PORT configurable
- Documentation complète (QUICKSTART, CONFIGURATION_PORTS, etc.)
- Script de test automatique
- Templates .env pour différents environnements

Résout le problème de ports codés en dur dans nginx.
Permet de changer de machine sans modifier le code."

# Pusher vers la branche bdd
git push origin bdd
```

---

### 2. Sur la Machine Linux (au Travail)

```bash
# 1. Aller dans le dossier du projet
cd /chemin/vers/test-docker

# 2. Pull les changements
git pull origin bdd

# 3. Arrêter les anciens conteneurs
docker-compose down -v

# 4. Copier la configuration Linux
cp .env.linux .env

# 5. Vérifier la configuration
cat .env
# Devrait montrer :
# MYSQL_PORT=3307
# EXPRESS_PORT=5000
# FRONTEND_PORT=8080

# 6. Builder et démarrer
docker-compose up -d --build

# 7. Suivre les logs pour voir le démarrage
docker-compose logs -f
```

**Ce que vous devriez voir** :

```
frontend-react | 🔧 Configuration nginx avec BACKEND_PORT=5000
frontend-react | ✅ Configuration nginx générée:
frontend-react | ...
frontend-react | proxy_pass http://backend:5000;
```

---

### 3. Tester que Tout Fonctionne

```bash
# Lancer le script de test
chmod +x test-config.sh
./test-config.sh
```

**Résultat attendu** :

```
==================================================
  Test de Configuration Multi-Environnements
==================================================

📋 Configuration détectée :
   - MYSQL_PORT      = 3307
   - EXPRESS_PORT    = 5000
   - FRONTEND_PORT   = 8080

1️⃣  Vérification des conteneurs...
   ✅ Frontend running
   ✅ Backend running
   ✅ MySQL running

2️⃣  Vérification de la configuration nginx...
   ✅ Nginx correctement configuré
      proxy_pass http://backend:5000;

3️⃣  Test backend direct (port 5000)...
   ✅ Backend accessible

4️⃣  Test frontend (port 8080)...
   ✅ Frontend accessible

5️⃣  Test proxy nginx (frontend → backend)...
   ✅ Proxy nginx fonctionne
      Frontend (port 8080) → Backend (port 5000)

6️⃣  Vérification des ports exposés...

NAMES              PORTS
frontend-react     0.0.0.0:8080->80/tcp
backend-express    0.0.0.0:5000->5000/tcp
mysql-db           0.0.0.0:3307->3306/tcp

==================================================
  ✅ Tous les tests sont passés !
==================================================

🌐 Accès :
   - Frontend : http://localhost:8080
   - API      : http://localhost:5000/api
   - MySQL    : localhost:3307
```

---

### 4. Accéder à l'Application

Ouvrir un navigateur sur la machine Linux :

- **Frontend** : http://localhost:8080
- **API** : http://localhost:5000/api/public/churches

---

## 🔍 Vérifications Manuelles

### Vérifier que nginx utilise le bon port

```bash
docker exec frontend-react cat /etc/nginx/conf.d/default.conf | grep proxy_pass
```

**Résultat attendu** :
```
proxy_pass http://backend:5000;
```

### Tester l'API depuis le terminal

```bash
# Via le frontend (proxy nginx)
curl http://localhost:8080/api/public/churches | jq

# Directement sur le backend
curl http://localhost:5000/api/public/churches | jq
```

### Voir les logs en temps réel

```bash
# Tous les services
docker-compose logs -f

# Seulement le backend
docker logs -f backend-express

# Seulement le frontend
docker logs -f frontend-react
```

---

## 🎯 Ports Utilisés sur Linux

| Service          | Port Interne | Port Hôte | Conflit Évité |
|------------------|--------------|-----------|---------------|
| **MySQL**        | 3306         | **3307**  | MySQL système |
| **Backend**      | 5000         | **5000**  | Grafana       |
| **Frontend**     | 80           | **8080**  | Apache/Nginx  |

**Aucun conflit possible** avec vos services existants !

---

## 🐛 En Cas de Problème

### Les conteneurs ne démarrent pas

```bash
# Voir les erreurs
docker-compose logs

# Vérifier les ports en conflit
sudo netstat -tulpn | grep -E ':(3307|5000|8080)'

# Si un port est occupé, modifier .env
nano .env
# Changer le port en conflit

# Rebuild
docker-compose down
docker-compose up -d --build
```

### "502 Bad Gateway" sur /api

```bash
# 1. Vérifier nginx
docker exec frontend-react cat /etc/nginx/conf.d/default.conf | grep proxy_pass

# 2. Vérifier que le backend tourne
docker ps | grep backend

# 3. Vérifier les logs backend
docker logs backend-express

# 4. Rebuild si nécessaire
docker-compose up -d --build frontend
```

### Le frontend ne charge pas

```bash
# Vérifier les logs
docker logs frontend-react

# Rebuild
docker-compose up -d --build frontend

# Vérifier que nginx a démarré
docker exec frontend-react ps aux | grep nginx
```

---

## 📝 Commandes Utiles

```bash
# Redémarrer un service spécifique
docker-compose restart backend
docker-compose restart frontend

# Rebuild un seul service
docker-compose up -d --build backend
docker-compose up -d --build frontend

# Voir les ressources utilisées
docker stats

# Accéder à MySQL
docker exec -it mysql-db mysql -uadmin -padmin light_church

# Shell dans un conteneur
docker exec -it backend-express sh
docker exec -it frontend-react sh

# Nettoyer complètement
docker-compose down -v
docker system prune -a
```

---

## 🎉 Résumé

Votre projet sur **Linux** utilise maintenant :

```
✅ MySQL sur le port 3307   (au lieu de 3306)
✅ Backend sur le port 5000 (au lieu de 3000)
✅ Frontend sur le port 8080 (au lieu de 80)
```

**Aucune modification de code nécessaire**, juste un fichier `.env` différent !

---

## 🔄 Retour sur Mac

Quand vous revenez sur votre **Mac** :

```bash
# Garder .env.linux pour Linux
git add .env.linux
git commit -m "docs: ajout config Linux"
git push

# Sur Mac, utiliser la config par défaut
cp .env.example .env
# Ou restaurer votre ancien .env avec les ports standards
```

**Le même projet fonctionne sur les deux machines sans conflit !**

---

**Besoin d'aide ?** Consultez `CONFIGURATION_PORTS.md` pour plus de détails.
