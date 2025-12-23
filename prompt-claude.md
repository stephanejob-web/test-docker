# 🚀 Feuille de Route : Amélioration du Dashboard Superadmin & Pasteur

**Environnement :** `http://localhost/dashboard`  
**Objectif :** Optimisation de l'UX, correction de bugs critiques et gestion de la logique métier pastorale.

---

## 📊 Tâche 1 – Dashboard : Statistiques & Graphiques
Ajouter des indicateurs visuels sur la page d'accueil (Superadmin) pour une vue d'ensemble rapide.
- **Graphiques interactifs :** Utiliser une bibliothèque type Chart.js ou Recharts.
- **Data :** - Répartition des églises par ville (Bar Chart).
   - État des événements : *À venir, En cours, Terminés* (Pie Chart).
- **Interactivité :** Tooltips au survol et design moderne (mode sombre/clair compatible).

## ⏳ Tâche 2 – Feedback de Chargement (UX)
Améliorer le ressenti utilisateur lors de la navigation.
- **Implémentation :** Ajouter un `Loader` (spinner ou skeleton) sur les onglets :
   - Utilisateurs
   - Églises
   - Événements
- **Déclencheur :** Apparaît dès l'appel API et disparaît une fois le `state` mis à jour.

## 👥 Tâche 3 – Gestion des Utilisateurs
Optimiser le contrôle des comptes.
- **Recherche :** Barre de recherche en temps réel par nom ou email.
- **Filtrage :** Menu déroulant par statut : `Pending` (En attente), `Accepted` (Accepté), `Rejected` (Rejeté).
- **Raccourci :** Bouton "Voir l'église" sur chaque ligne utilisateur pour un accès direct aux détails de l'organisation liée.

## ⛪ Tâche 4 – Gestion des Églises (`/admin/churches`)
- **Affichage :** Ajouter la colonne **Ville** dans le tableau principal.
- **Filtres Avancés :** - Recherche par Pasteur.
   - Recherche multi-critères (Nom, Ville, Dénomination).

## 📅 Tâche 5 – Gestion des Événements
- **Workflow de Statut :** Permettre aux admins de modifier manuellement le champ `STATUS` de la table `events`.
- **Cycle de vie :** Bouton d'action pour passer de : *À venir ➔ En cours ➔ Terminé*.

## 🛠️ Tâche 6 – Correction des Paramètres (`/admin/settings`)
*Correction des bugs bloquants identifiés en console.*
- **6.1 Dénominations :** Réparer l'erreur XHR lors de la création (Vérifier le endpoint API et la validation CSRF/Payload).
- **6.2 Langues :** Activer la fonction `Edit` pour modifier les entrées existantes.
- **6.3 Activités :** Activer la fonction `Edit` pour les types d'activités.

---

## 🏗️ Tâche 8 – Logique d'Accessibilité (Compte Pasteur)
Empêcher la création d'événements "orphelins".
- **Composant :** Bouton "Créer un nouvel événement" (SVG Plus).
- **Logique :** Si `church_id` est nul ou inexistant pour le pasteur, le bouton doit être **masqué ou désactivé** avec une infobulle explicative.

## ⚠️ Tâche 9 – Debug & Édition d'Église
- **Bug de validation :** Résoudre le problème où l'église est enregistrée en BDD mais marquée comme "Incomplète" sur l'interface.
- **Vérification :** S'assurer que les champs `Nom, Dénomination, Adresse, Téléphone, GPS` sont bien détectés par le front-end.
- **Fonctionnalité :** Ajouter un bouton **"Modifier mon église"** pour permettre la mise à jour des informations après création.

## 🌍 Tâche 10 – Internationalisation des Horaires
Dans `dashboard/my-church` > Onglet **Horaires** :
- Remplacer les jours anglais par les jours français :
   - *Lundi, Mardi, Mercredi, Jeudi, Vendredi, Samedi, Dimanche*.

---

## Tâche 11 – Compte des pasteurs

### Emplacement
- Dashboard : `/dashboard/my-church`
- Onglets : **Détails & Infos**

### Fonctionnalités
- Permettre au **pasteur d’ajouter une photo de profil**.
- Si aucune photo n’est ajoutée, afficher automatiquement un **avatar par défaut**.

### Avatar par défaut
- Généré à partir des **initiales du prénom et du nom** du pasteur.
  - Exemple : *Cyrille Pouget* → **CP**
- Design :
  - Avatar **esthétique et moderne**
  - Fond coloré harmonisé avec le thème du dashboard
  - Typographie claire et lisible
- L’avatar doit rester **cohérent avec l’identité visuelle globale** de l’application.

### Objectif
Garantir qu’un pasteur dispose toujours d’une représentation visuelle professionnelle, avec ou sans photo de profil.
j

## 🎯 Objectifs Généraux
1. Rendre le dashboard **complet et interactif**.
2. Éliminer les **bugs bloquants** dans les paramètres.
3. Améliorer la **navigation métier** pour les pasteurs.