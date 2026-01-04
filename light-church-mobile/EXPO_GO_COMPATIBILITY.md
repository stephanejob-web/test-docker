# Compatibilité Expo Go

## Problème résolu

Depuis Expo SDK 53, **les notifications push ne fonctionnent plus dans Expo Go**. Ce projet utilise Expo SDK 54.

## Solution implémentée

Le service `pushNotificationService.ts` détecte automatiquement l'environnement :

### Dans Expo Go (mode dégradé)
- ✅ L'app démarre sans erreur
- ✅ Le `device_id` est créé pour tracker les intérêts
- ✅ Les utilisateurs peuvent marquer "Ça m'intéresse"
- ❌ Pas de vraies notifications push
- ⚠️ Warning dans la console : "Push notifications not available in Expo Go"

### Dans Development Build (mode complet)
- ✅ Notifications push complètes
- ✅ Demande de permissions
- ✅ Enregistrement du token Expo
- ✅ Réception des notifications

## Comment tester avec vraies notifications

### Option 1 : Development Build local

```bash
# Installer EAS CLI
npm install -g eas-cli

# Se connecter
eas login

# Créer un build de dev pour Android
eas build --profile development --platform android

# Pour iOS (nécessite compte Apple Developer)
eas build --profile development --platform ios
```

Une fois le build téléchargé, installez-le sur votre appareil et testez avec les vraies notifications.

### Option 2 : Preview Build (test beta)

```bash
# Build de preview (plus proche de production)
eas build --profile preview --platform android
```

### Option 3 : Production Build

```bash
# Build de production complet
eas build --profile production --platform all
```

## Développement quotidien

Pour le **développement quotidien**, Expo Go est suffisant :
- Navigation fonctionne
- Cartes fonctionnent
- API fonctionne
- Interface fonctionne
- Système d'intérêt fonctionne (sans notifications)

Les **notifications réelles** sont testables uniquement en build natif.

## Configuration requise pour builds

Dans `app.json`, ajoutez votre Expo Project ID :

```json
{
  "expo": {
    "extra": {
      "eas": {
        "projectId": "votre-project-id"
      }
    }
  }
}
```

Et dans `.env` :

```env
EXPO_PUBLIC_PROJECT_ID=votre-project-id
```

## Code technique

Le service détecte Expo Go via :

```typescript
import Constants from 'expo-constants';

const isExpoGo = Constants.appOwnership === 'expo';

if (!isExpoGo) {
  // Charger expo-notifications seulement si pas dans Expo Go
  Notifications = require('expo-notifications');
}
```

Cette approche permet :
- **Zéro erreur** dans Expo Go
- **Compatibilité totale** avec development/production builds
- **Graceful degradation** du service de notifications
