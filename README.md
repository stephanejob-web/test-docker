# 🚀 Documentation du Projet (Docker)

Ce fichier explique comment lancer l'application et gérer le cycle de développement.

## 🏁 Lancer l'application

Pour démarrer le projet (Backend + Frontend + Base de données), exécutez à la racine :

```bash
docker-compose up -d --build
```

Cette commande va :
1.  Construire les images Docker.
2.  Lancer les conteneurs en arrière-plan.

### Accès
-   **Frontend** : [http://localhost](http://localhost) (Port 80)
-   **Backend API** : [http://localhost:3000](http://localhost:3000)

---

## 🔄 Développement & Rebuild

**❓ Dois-je reconstruire (rebuild) à chaque changement de code ?**

**OUI.**
La configuration Docker actuelle copie votre code dans les images au moment de la construction ("build"). Il n'y a pas de "hot-reload" (synchronisation en direct) configuré dans ce mode Docker.

### Comment appliquer mes changements ?

Dès que vous modifiez un fichier (`.js`, `.tsx`, `.css`, etc.), vous devez relancer la construction :

1.  **Pour tout mettre à jour (recommandé)** :
    ```bash
    docker-compose up -d --build
    ```

2.  **Pour mettre à jour uniquement le Frontend** (plus rapide si vous ne touchez qu'au React) :
    ```bash
    docker-compose up -d --build frontend
    ```

3.  **Pour mettre à jour uniquement le Backend** :
    ```bash
    docker-compose up -d --build backend
    ```

---

## 🛠 Commandes Utiles

-   **Arrêter l'application** : `docker-compose down`
-   **Voir les logs (erreurs, console)** : `docker-compose logs -f`
-   **Voir les logs d'un service précis** : `docker-compose logs -f backend` ou `frontend`
