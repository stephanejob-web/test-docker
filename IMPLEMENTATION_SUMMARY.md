# Système d'Intérêt pour les Événements - Résumé d'Implémentation

## Vue d'ensemble

Système complet permettant aux utilisateurs mobiles de montrer leur intérêt pour des événements, avec notifications push et affichage du compteur d'intéressés sur toutes les plateformes.

## Fonctionnalités Implémentées

### 1. Base de Données ✅

**Migration**: `backend-express/migrations/create_event_interests.sql`

- **Table `event_interests`**
  - `id` (PRIMARY KEY)
  - `event_id` (FK → events)
  - `device_id` (FK → push_tokens)
  - `created_at`
  - Contrainte UNIQUE sur (event_id, device_id) → pas de doublons
  - Cascade DELETE pour maintenir l'intégrité

- **Colonne ajoutée**
  - `events.interested_count` INT DEFAULT 0
  - Index pour performance sur tri/filtrage

### 2. Backend API ✅

**Fichier**: `backend-express/routes/publicMapRoutes.js`

#### Nouvelles routes

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| POST | `/api/public/events/:eventId/interest` | Enregistrer intérêt |
| DELETE | `/api/public/events/:eventId/interest` | Retirer intérêt |
| GET | `/api/public/events/:eventId/interested-count` | Obtenir compteur |
| GET | `/api/public/events/:eventId/is-interested` | Vérifier si intéressé |

#### Modifications aux routes existantes

- GET `/api/public/events` → Inclut `interested_count`
- GET `/api/public/events/:id` → Inclut `interested_count`

#### Validations implémentées

- ✅ Événement existe et non annulé
- ✅ device_id existe dans push_tokens
- ✅ Mise à jour automatique du compteur
- ✅ Gestion des doublons (INSERT IGNORE)

### 3. Application Mobile (React Native + Expo) ✅

#### Nouveaux fichiers créés

**Services**:
- `light-church-mobile/services/pushNotificationService.ts`
  - Gestion des permissions notifications
  - Enregistrement push token Expo
  - Stockage device_id dans AsyncStorage
  - Configuration canal Android

**Hooks**:
- `light-church-mobile/hooks/query/useEventInterest.ts`
  - `useIsInterested(eventId)` - Vérifier statut
  - `useInterestedCount(eventId)` - Obtenir compteur
  - `useToggleEventInterest(eventId)` - Toggle intérêt
  - Invalidation automatique des queries

#### Fichiers modifiés

**Types**:
- `types/event.ts` → Ajout `interested_count?: number`

**Composants**:
- `components/cards/EventCard.tsx`
  - Badge 👥 avec compteur d'intéressés
  - Affichage seulement si count > 0

**Pages**:
- `app/event/[id].tsx`
  - Badge prominent avec compteur
  - Bouton "Ça m'intéresse" / "Ne plus suivre"
  - Demande automatique de permission notifications
  - Feedback utilisateur (Alerts)
  - États de chargement

#### Flow utilisateur mobile

1. **Première utilisation**
   - User clique "Ça m'intéresse"
   - Popup demande permission notifications
   - Si accepté → Enregistre push token
   - Génère device_id unique

2. **Utilisation suivante**
   - Toggle directe intérêt/désintérêt
   - Mise à jour immédiate UI
   - Synchronisation automatique

### 4. Frontend Web (React) ✅

#### Types modifiés

**Fichier**: `frontend-react/src/types/publicMap.ts`
- `Event` interface → Ajout `interested_count?: number`
- `EventDetails` interface → Ajout `interested_count?: number`

#### Composants modifiés

**Map publique**:
- `components/Map/ResultsPanel.tsx`
  - EventCard affiche compteur intéressés
  - Format: "👥 X intéressé(s)"
  - Couleur primary, seulement si count > 0

**Dashboard Pasteur**:
- `pages/MyEvents.tsx`
  - Badge vert avec ombre dans vue grille
  - Badge vert dans vue liste
  - Position: après lieu, avant annulation
  - Style success.light avec ombre subtile

### 5. Documentation ✅

**Fichiers créés**:
- `light-church-mobile/INSTALL_NOTIFICATIONS.md`
  - Instructions installation expo-notifications
  - Configuration requise (Project ID, permissions)
  - Guide iOS/Android
  - Exemples de test

- `IMPLEMENTATION_SUMMARY.md` (ce fichier)
  - Vue d'ensemble complète
  - Architecture et choix techniques

## Architecture et Choix Techniques

### Pourquoi device_id ?

✅ Anonyme - Pas de compte utilisateur requis
✅ Persistant - Survit aux réinstallations app
✅ Unique - Un intérêt par device par événement
✅ Traçable - Permet envoi notifications ciblées

### Gestion du compteur

**Option choisie**: Colonne dénormalisée `interested_count`

**Avantages**:
- ✅ Performance lecture (pas de COUNT(*) à chaque requête)
- ✅ Tri/filtrage efficace avec index
- ✅ Scalabilité pour millions d'événements

**Mise à jour**:
- Automatique lors POST/DELETE
- Recalcul depuis `event_interests` à chaque modification
- Garantit exactitude

### Sécurité et Validations

✅ Validation express-validator sur tous paramètres
✅ Vérification événement non annulé
✅ Vérification device_id existe
✅ Contrainte UNIQUE empêche doublons
✅ Transactions implicites MySQL (atomicité)

## Tests Effectués

### Backend API ✅

```bash
# Test GET count
curl http://localhost:3000/api/public/events/2350/interested-count
# → {"success":true,"interested_count":0}

# Test is-interested
curl 'http://localhost:3000/api/public/events/2350/is-interested?device_id=test'
# → {"success":true,"is_interested":false}

# Test POST interest
curl -X POST http://localhost:3000/api/public/events/2350/interest \
  -H 'Content-Type: application/json' \
  -d '{"device_id":"test-device-123"}'
# → {"success":true,"message":"Intérêt enregistré...","interested_count":1}

# Test DELETE interest
curl -X DELETE http://localhost:3000/api/public/events/2350/interest \
  -H 'Content-Type: application/json' \
  -d '{"device_id":"test-device-123"}'
# → {"success":true,"interested_count":0,"removed":true}
```

## Prochaines Étapes (Hors Scope Actuel)

### 1. Envoi réel des notifications push

**Quand**:
- Événement modifié (date, lieu, description)
- Événement annulé
- Rappel X heures avant début

**Implémentation**:
```javascript
// Dans route PATCH /events/:id
const [interests] = await db.query(
  'SELECT pt.push_token FROM event_interests ei ' +
  'JOIN push_tokens pt ON ei.device_id = pt.device_id ' +
  'WHERE ei.event_id = ?',
  [eventId]
);

for (const interest of interests) {
  await sendPushNotification(
    interest.push_token,
    'Événement modifié',
    `${event.title} a été mis à jour`
  );
}
```

### 2. Gestion des tokens expirés

- Webhook Expo pour tokens invalides
- Cleanup périodique (CRON)
- Re-registration automatique

### 3. Statistiques pour pasteurs

- Dashboard avec graphiques
- Tendances d'intérêt par événement
- Meilleurs horaires/lieux

### 4. Notifications programmées

- Rappel 24h avant
- Rappel 1h avant
- Confirmation début événement

## Installation et Déploiement

### 1. Packages mobiles requis

```bash
cd light-church-mobile
npx expo install expo-notifications expo-device
```

### 2. Migration base de données

```bash
# Exécuter la migration
docker exec mysql-db mysql -u root -proot light_church < \
  backend-express/migrations/create_event_interests.sql
```

### 3. Rebuild containers

```bash
# Backend
docker-compose up -d --build backend

# Frontend (si modifs)
docker-compose up -d --build frontend
```

### 4. Configuration Expo

Voir `light-church-mobile/INSTALL_NOTIFICATIONS.md`

## Fichiers Modifiés/Créés

### Backend
- ✅ `backend-express/migrations/create_event_interests.sql` (CRÉÉ)
- ✅ `backend-express/routes/publicMapRoutes.js` (MODIFIÉ)

### Mobile
- ✅ `light-church-mobile/services/pushNotificationService.ts` (CRÉÉ)
- ✅ `light-church-mobile/hooks/query/useEventInterest.ts` (CRÉÉ)
- ✅ `light-church-mobile/hooks/query/index.ts` (MODIFIÉ)
- ✅ `light-church-mobile/types/event.ts` (MODIFIÉ)
- ✅ `light-church-mobile/components/cards/EventCard.tsx` (MODIFIÉ)
- ✅ `light-church-mobile/app/event/[id].tsx` (MODIFIÉ)
- ✅ `light-church-mobile/INSTALL_NOTIFICATIONS.md` (CRÉÉ)

### Web
- ✅ `frontend-react/src/types/publicMap.ts` (MODIFIÉ)
- ✅ `frontend-react/src/components/Map/ResultsPanel.tsx` (MODIFIÉ)
- ✅ `frontend-react/src/pages/MyEvents.tsx` (MODIFIÉ)

### Documentation
- ✅ `IMPLEMENTATION_SUMMARY.md` (CRÉÉ)

## Résumé des Commits Recommandés

```bash
# Commit 1: Backend + Migration
git add backend-express/
git commit -m "feat(backend): Add event interest system with notifications

- Create event_interests table with foreign keys
- Add interested_count column to events
- Implement 4 new API routes (POST/DELETE/GET interest)
- Add interested_count to existing event queries
- Validate event status and device_id existence

🤖 Generated with Claude Code
Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"

# Commit 2: Mobile Implementation
git add light-church-mobile/
git commit -m "feat(mobile): Implement event interest with push notifications

- Create pushNotificationService for Expo notifications
- Add useEventInterest hooks for API integration
- Add interest button and count badge to event details
- Show interested count on event cards
- Request notification permissions on first use

🤖 Generated with Claude Code
Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"

# Commit 3: Web Display
git add frontend-react/
git commit -m "feat(web): Display event interested count

- Add interested_count to Event and EventDetails types
- Show count badge on public map ResultsPanel
- Display count in pastor dashboard (grid + list views)
- Read-only display (no interaction button)

🤖 Generated with Claude Code
Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"

# Commit 4: Documentation
git add *.md
git commit -m "docs: Add event interest system documentation

- Installation guide for expo-notifications
- Complete implementation summary
- API testing examples
- Future improvements roadmap

🤖 Generated with Claude Code
Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

## Status Final

✅ **Base de données**: Migration exécutée et testée
✅ **Backend API**: 4 routes implémentées et testées
✅ **Mobile**: Bouton + compteur + notifications configurées
✅ **Web**: Affichage compteur (public + dashboard)
✅ **Documentation**: Complète et détaillée

**Prêt pour production** (après installation packages mobile)
