
# 📌 Cahier des charges – Amélioration base de données & dashboards

## Contexte général
L’application dispose d’une base de données et de plusieurs tableaux de bord (administrateur et utilisateur).
Des évolutions récentes nécessitent :
- une **mise à jour des données existantes**,
- une **amélioration de l’expérience utilisateur (UX/UI)**,
- l’ajout de **statistiques et graphiques pertinents** pour le suivi de l’activité.

---

## 🗄️ Tâche 1 – Base de données

### 🎯 Objectif
Mettre à jour et fiabiliser les données de la table `church_details`, suite à l’ajout de nouveaux champs liés à l’adresse.

### 🧱 Nouveaux champs ajoutés
La table `church_details` contient désormais les champs suivants :
- `street_number`
- `street_name`
- `postal_code`
- `city`

Ces champs doivent être **correctement renseignés** pour tous les enregistrements.

### ✅ Actions attendues
- Générer des **données réalistes et cohérentes** pour les nouveaux champs.
- Si nécessaire :
  - Dropper la base de données existante
  - La recréer proprement
  - Réinjecter des données de test propres et cohérentes
- Générer des **données de test complètes** afin de valider le bon fonctionnement de l’application.

### ⚙️ Contraintes techniques
- Générer **500 enregistrements minimum**
- Respecter les **relations entre les tables** (clés étrangères, cohérence logique)
- Les adresses doivent être **réalistes** (numéros, rues, codes postaux, villes crédibles)
- Les données doivent permettre de **simuler un cas réel d’utilisation**

### 🏁 Résultat attendu
- Une **base de données fonctionnelle**
- Des **données exploitables** pour tester et comprendre le comportement de l’application

---

## 📊 Tâche 2 – Dashboard Administrateur

### 🎯 Objectif
Améliorer l’interface du tableau de bord administrateur afin d’offrir une meilleure visibilité sur l’activité de l’application.

### 📈 Librairie imposée
Utiliser la librairie **MUI X Charts** :
👉 https://mui.com/x/react-charts/

### 📌 Indicateurs et statistiques à afficher
Le dashboard administrateur doit afficher clairement :

- 📍 **Nombre total d’églises enregistrées**
- 👤 **Liste ou compteur des utilisateurs en attente de validation**
- 📅 **Nombre d’événements en cours**
- 🔜 **Nombre d’événements à venir**
- 🏙️ **Distribution des églises par ville**, visualisée via un **graphique en barres**

### 🧭 Contraintes UX
- Les informations doivent être **facilement accessibles**
- Les graphiques doivent être **lisibles, esthétiques et pertinents**
- Le dashboard doit servir d’outil de **pilotage rapide** pour l’administrateur

---

## 📄 Tâche 3 – Dashboard Utilisateur (Églises & Événements)

### 🎯 Objectif
Améliorer la **pagination** des listes (églises, événements) pour une meilleure expérience utilisateur.

### 📌 Composant imposé
Remplacer la pagination existante par le composant MUI suivant :

```jsx
<Pagination count={10} variant="outlined" />
<Pagination count={10} variant="outlined" color="primary" />
<Pagination count={10} variant="outlined" color="secondary" />
<Pagination count={10} variant="outlined" disabled />
```

⚙️ Attentes
Pagination claire et intuitive

Bonne gestion des pages (navigation fluide)

Intégration cohérente avec le design existant

## 🪟 Tâche 4 – Dashboard Utilisateur : Détails d’une église

### 🎯 Objectif
Améliorer l’affichage des informations d’une église via une **fenêtre modale** accessible depuis le bouton **“Voir l’église”**.

### 🖱️ Comportement attendu
- Au clic sur le bouton **“Voir l’église”** :
  - Une **modale s’ouvre**.
  - Elle affiche **toutes les informations de l’église**.
  - Elle affiche également la **liste des événements associés** à cette église.

### 🧩 Problèmes à corriger
- Certaines informations ne sont **pas visibles** actuellement.
- Le contenu dépasse la **hauteur de l’écran**, rendant la lecture difficile.

### ✅ Améliorations attendues
- La modale doit être **scrollable** pour afficher tout le contenu.
- Le contenu doit être **structuré et lisible**.
- Les événements liés à l’église doivent être **clairement identifiables**.

### 🏁 Résultat attendu
- Application plus **réaliste**, **robuste** et **facile à tester**.
- Tableaux de bord plus **clairs**, **modernes** et **informatiques**.
- **Amélioration significative de l’expérience utilisateur** pour les administrateurs et les utilisateurs finaux.


## 🗂️ Tâche 5 – Dashboard : Ajout d’un Drawer dans le menu latéral

### 🎯 Objectif
Améliorer la navigation dans le tableau de bord en ajoutant un **drawer** (panneau coulissant) dans le menu situé à gauche de la page.

### 📌 Page concernée
- URL : `http://localhost/dashboard/`

### 📈 Composant à utiliser
- Librairie : **Material-UI (MUI)**
- Documentation officielle : [MUI Drawer](https://mui.com/material-ui/react-drawer/)

### ✅ Comportement attendu
- Le drawer doit :
  - Pouvoir **s’ouvrir et se fermer** facilement.
  - Contenir le **menu de navigation** du dashboard.
  - Être intégré de manière **cohérente avec le design existant**.
- Navigation fluide et intuitive pour l’utilisateur.
- Compatible avec les autres composants du dashboard.

### ⚙️ Contraintes techniques
- Utiliser les **meilleures pratiques MUI** pour l’accessibilité et la réactivité.
- Le drawer doit **s’adapter aux différentes tailles d’écran** (responsive design).
- Les éléments du menu doivent être **clairs et hiérarchisés**.

### 🏁 Résultat attendu
- Navigation améliorée dans le tableau de bord.
- Menu latéral plus **moderne et interactif** grâce au drawer.
- Expérience utilisateur simplifiée pour accéder aux différentes sections du dashboard.
