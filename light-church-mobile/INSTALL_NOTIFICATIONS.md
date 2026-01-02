# Installation des notifications push

## Packages à installer

Pour activer la fonctionnalité d'intérêt pour les événements avec notifications push, installez les packages suivants :

```bash
cd light-church-mobile
npx expo install expo-notifications expo-device
```

## Configuration requise

### 1. Project ID Expo

Assurez-vous que votre fichier `app.json` contient votre Project ID Expo :

```json
{
  "expo": {
    "extra": {
      "eas": {
        "projectId": "your-project-id-here"
      }
    }
  }
}
```

### 2. Variables d'environnement

Ajoutez dans votre fichier `.env` :

```
EXPO_PUBLIC_PROJECT_ID=your-project-id-here
```

### 3. Configuration Android (app.json)

```json
{
  "expo": {
    "android": {
      "permissions": [
        "NOTIFICATIONS"
      ],
      "googleServicesFile": "./google-services.json"
    }
  }
}
```

### 4. Configuration iOS (app.json)

```json
{
  "expo": {
    "ios": {
      "infoPlist": {
        "UIBackgroundModes": ["remote-notification"]
      }
    },
    "plugins": [
      [
        "expo-notifications",
        {
          "icon": "./assets/notification-icon.png",
          "color": "#4285F4",
          "sounds": ["./assets/notification-sound.wav"]
        }
      ]
    ]
  }
}
```

## Fonctionnalités implémentées

### Mobile (React Native + Expo)

✅ Bouton "Ça m'intéresse" sur la page détail d'événement
✅ Demande automatique de permission pour les notifications
✅ Enregistrement du device_id et push_token dans la BDD
✅ Toggle intérêt (ajouter/retirer)
✅ Affichage du compteur de personnes intéressées
✅ Badge avec nombre d'intéressés sur les cartes d'événements

### Backend API

✅ POST /api/public/events/:eventId/interest - Enregistrer intérêt
✅ DELETE /api/public/events/:eventId/interest - Retirer intérêt
✅ GET /api/public/events/:eventId/interested-count - Obtenir le compteur
✅ GET /api/public/events/:eventId/is-interested - Vérifier si intéressé

### Base de données

✅ Table `event_interests` avec foreign keys
✅ Colonne `interested_count` dans `events`
✅ Contrainte UNIQUE pour éviter les doublons

## Utilisation

1. **Sur l'événement** : L'utilisateur clique sur "Ça m'intéresse"
2. **Première fois** : Demande de permission pour les notifications
3. **Acceptation** : Enregistre le push token et le device_id
4. **Suivi** : L'utilisateur recevra des notifications si l'événement est modifié/annulé

## Prochaines étapes

- [ ] Implémenter l'envoi réel de notifications push lors de modifications d'événements
- [ ] Ajouter la logique d'envoi dans le backend quand un événement est modifié/annulé
- [ ] Tester sur un appareil physique (simulateur ne supporte pas les push)

## Tests

```bash
# Tester l'API
curl -X POST http://localhost:3000/api/public/events/2350/interest \
  -H 'Content-Type: application/json' \
  -d '{"device_id": "test-device-123"}'

# Vérifier le compteur
curl http://localhost:3000/api/public/events/2350/interested-count
```
