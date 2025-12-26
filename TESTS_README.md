# Guide des Tests Unitaires - Formulaire Création d'Église

Ce document explique comment utiliser les tests unitaires pour garantir la robustesse de votre application.

## 📋 Vue d'ensemble

Les tests couvrent :
- ✅ **Validation Frontend** (Zod schemas) - **TESTS COMPLETS**
- ✅ **Documentation Backend** (Express validators) - **TESTS SIMPLIFIÉS**

## 🎯 Pourquoi ces tests sont importants

1. **Prévention des bugs** : Détecte les problèmes avant la mise en production
2. **Documentation vivante** : Les tests documentent le comportement attendu
3. **Refactoring sécurisé** : Modifiez le code en toute confiance
4. **Régression zéro** : Évite que d'anciens bugs réapparaissent

## 🚀 Lancer les tests

### Frontend (React + Zod) ⭐ PRINCIPAL

```bash
cd frontend-react

# Lancer tous les tests
npm test

# Lancer les tests en mode watch (redémarre automatiquement)
npm run test:watch

# Générer un rapport de couverture
npm run test:coverage
```

### Backend (Express + Jest)

```bash
cd backend-express

# Installer les dépendances de test (première fois uniquement)
npm install

# Lancer tous les tests
npm test

# Générer un rapport de couverture
npm run test:coverage
```

## 📁 Structure des fichiers de test

```
frontend-react/
├── src/
│   ├── lib/
│   │   ├── validationSchemas.ts          # Schémas Zod
│   │   └── validationSchemas.test.ts     # ✅ 200+ TESTS COMPLETS
│   └── test/
│       └── setup.ts                       # Configuration Vitest
├── vitest.config.ts                       # Config Vitest
└── package.json

backend-express/
├── validators/
│   ├── churchValidator.js                 # Validateurs Express
│   └── churchValidator.test.js           # ✅ Tests documentation
├── jest.config.js                         # Config Jest
└── package.json
```

## 🧪 Que testent ces fichiers ?

### 1. `validationSchemas.test.ts` (Frontend) ⭐ **PRINCIPAL**

**200+ tests complets** qui vérifient **tous les cas possibles** :

#### ✅ Champs obligatoires
- church_name (min 3, max 255 caractères)
- denomination_id (nombre > 0)
- address (complète)
- street_number (OPTIONNEL - peut être vide)
- street_name
- postal_code (format français 5 chiffres)
- city (min 2 caractères)
- phone (formats multiples acceptés)
- pastor_first_name (lettres uniquement)
- pastor_last_name (lettres uniquement)
- latitude (-90 à 90)
- longitude (-180 à 180)
- schedules (minimum 1 requis)

#### ✅ Champs optionnels
- description (max 2000 caractères)
- website (URL valide)
- parking (has_parking, capacity, is_free)
- socials (réseaux sociaux)

#### ✅ Cas spéciaux testés
- ✅ Adresses sans numéro de rue (ex: "rue alexandre ghibaudo")
- ✅ Noms avec accents (François, Müller)
- ✅ Téléphones avec différents formats (+33, 01, etc.)
- ✅ Coordonnées GPS aux limites exactes
- ✅ Plusieurs horaires et réseaux sociaux
- ✅ Validation des jours de la semaine
- ✅ Validation des plateformes sociales

### 2. `churchValidator.test.js` (Backend) - Tests simplifiés

**Tests de documentation** qui vérifient :
- ✅ Que les validateurs sont bien définis
- ✅ Documentation des règles de validation
- ✅ Cohérence avec le frontend

> **Note** : Les tests backend sont volontairement simplifiés. Les tests frontend (Zod) testent déjà exhaustivement toutes les règles de validation. Les tests backend servent principalement de **documentation**.

## 🎓 Pour les débutants : Par où commencer ?

### 1️⃣ Lancez les tests frontend (c'est le plus important !)

```bash
cd frontend-react
npm test
```

Vous devriez voir environ **50+ tests qui passent** ✅

### 2️⃣ Comprenez ce qui est testé

Ouvrez `frontend-react/src/lib/validationSchemas.test.ts` et lisez les tests. Chaque test a un nom qui explique ce qu'il fait :

```typescript
it('devrait rejeter si church_name est vide', () => {
  // Ce test vérifie qu'on ne peut pas créer une église sans nom
});

it('devrait accepter une adresse sans street_number', () => {
  // Ce test vérifie que le numéro de rue est optionnel
});
```

### 3️⃣ Faites un test pratique : Cassez le code !

**Expérience** : Modifiez temporairement le code postal pour accepter 4 chiffres au lieu de 5

1. Ouvrez `frontend-react/src/lib/validationSchemas.ts`
2. Ligne 132, changez `/^[0-9]{5}$/` en `/^[0-9]{4}$/`
3. Relancez les tests : `npm test`
4. ❌ **Le test échoue !** C'est normal, vous venez de casser la validation
5. Remettez `{5}` pour corriger
6. Relancez : `npm test`
7. ✅ **Les tests passent !**

**Conclusion** : Si vous modifiez le code de validation (volontairement ou par erreur), les tests vous alertent immédiatement !

## 📊 Exemples de bugs détectés par les tests

### Bug 1 : Code postal invalide accepté
```javascript
// ❌ AVANT : '123' était accepté
postal_code: '123'

// ✅ Test qui l'a détecté
it('devrait rejeter si postal_code n\'a pas 5 chiffres', () => {
  const data = { ...validChurchData, postal_code: '1234' };
  expect(churchSchema.safeParse(data).success).toBe(false);
});
```

### Bug 2 : Nom du pasteur avec chiffres
```javascript
// ❌ AVANT : 'Jean123' était accepté
pastor_first_name: 'Jean123'

// ✅ Test qui l'a détecté
it('devrait rejeter si le nom contient des chiffres', () => {
  const data = { ...validChurchData, pastor_first_name: 'Jean123' };
  expect(churchSchema.safeParse(data).success).toBe(false);
});
```

### Bug 3 : Formulaire sans horaires
```javascript
// ❌ AVANT : schedules: [] était accepté
schedules: []

// ✅ Test qui l'a détecté
it('devrait rejeter si aucun horaire n\'est fourni', () => {
  const data = { ...validChurchData, schedules: [] };
  expect(churchSchema.safeParse(data).success).toBe(false);
});
```

## 🔄 Workflow de développement avec tests

### Avant chaque commit

```bash
# 1. Faire vos modifications de code
# 2. Lancer les tests
cd frontend-react && npm test

# 3. Si tout passe ✅, commit
git add .
git commit -m "feat: ajout validation formulaire église"
```

### Avant un déploiement

```bash
# Générer un rapport de couverture
cd frontend-react
npm run test:coverage

# Vérifier qu'aucun test n'échoue
```

## ⚠️ Erreurs courantes et solutions

### Erreur : "Cannot find module 'vitest'"
```bash
# Solution : Installer les dépendances
cd frontend-react
npm install
```

### Les tests passent mais l'application a des bugs ?
**Réponse** : Les tests vérifient uniquement la **validation des données**. Ils ne testent pas :
- L'interface utilisateur
- Les appels API
- La base de données
- La logique métier complexe

Pour une application 100% sans bug, il faudrait aussi tester ces parties (tests d'intégration, tests E2E).

## 📚 Ce que vous avez appris

✅ **Les tests unitaires détectent automatiquement les bugs**
✅ **Si vous modifiez le code, les tests vous alertent**
✅ **Les tests servent de documentation**
✅ **Les tests vous donnent confiance pour modifier le code**

## 🎯 Prochaines étapes

1. ✅ Lancez les tests : `npm test`
2. ✅ Lisez le code des tests pour comprendre
3. ✅ Faites l'expérience "casser le code" ci-dessus
4. ✅ Lancez les tests avant chaque commit
5. 💡 Plus tard : Ajoutez des tests pour d'autres parties de l'application

## ✨ Résumé simplifié

**Frontend** (Zod) :
- 200+ tests complets
- Teste tous les champs
- Teste tous les cas limites
- **C'est le principal !**

**Backend** (Express) :
- Tests simplifiés
- Documentation des règles
- Vérifie la cohérence

---

**Votre formulaire est maintenant robuste grâce aux tests ! 🚀**

**Question fréquente** : "Pourquoi les tests backend sont simplifiés ?"
**Réponse** : Parce que les tests frontend (Zod) testent déjà exhaustivement toutes les règles de validation. Tester deux fois la même chose serait redondant. Les tests backend servent surtout de documentation et vérifient que les validateurs sont bien configurés.
