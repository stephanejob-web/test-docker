# Guide de Gestion des Erreurs

Ce guide explique comment utiliser le système de gestion d'erreurs intelligent dans Light Church Mobile.

## Vue d'ensemble

Le système gère automatiquement les erreurs réseau et serveur avec des toasts non-intrusifs, tout en laissant les composants gérer les erreurs spécifiques (400, 404, etc.).

## Architecture

### 1. Toast Automatique (Intercepteur Axios)

**Localisation** : `hooks/useAxiosInterceptor.ts`

Le hook configure automatiquement les intercepteurs Axios pour afficher des toasts selon le type d'erreur :

#### Erreurs gérées automatiquement :

| Type d'erreur | Comportement | Action | Throttling |
|---------------|--------------|--------|------------|
| **Pas de réseau** (`ERR_NETWORK`) | Toast rouge : "Aucune connexion réseau" | Bouton "Réessayer" | Max 1 toutes les 5s |
| **Timeout** | Toast rouge : "Le serveur ne répond pas" | Bouton "Réessayer" | Max 1 toutes les 5s |
| **Erreur 500+** | Toast rouge avec message du serveur | Aucune | Max 1 toutes les 5s |
| **Erreur 401** (routes non-publiques) | Toast warning : "Session expirée" | Aucune | Max 1 toutes les 5s |

**Note** : Le throttling évite le spam de toasts si plusieurs requêtes échouent simultanément (ex: au démarrage de l'app).

#### Erreurs NON gérées automatiquement (gérées par les composants) :

- **400** : Bad Request (erreurs de validation)
- **403** : Forbidden
- **404** : Not Found
- Autres erreurs client

### 2. Composant ErrorScreen

**Localisation** : `components/ErrorScreen.tsx`

Écran d'erreur complet pour les échecs critiques (ex: impossible de charger les données au démarrage).

## Utilisation

### Toast Automatique (déjà configuré)

Les toasts fonctionnent automatiquement grâce à `useAxiosInterceptor` dans `app/_layout.tsx`. **Rien à faire dans vos composants !**

```typescript
// ✅ Les erreurs réseau sont gérées automatiquement
const { data } = useQuery({
  queryKey: ['churches'],
  queryFn: async () => {
    const response = await api.get('/public/churches');
    return response.data;
  },
});
// Si pas de réseau → Toast "Aucune connexion réseau" apparaît automatiquement
```

### Toast Manuel (erreurs spécifiques)

Pour afficher un toast manuellement dans votre composant :

```typescript
import { useToast } from '@/contexts/ToastContext';

function MyComponent() {
  const { showError, showSuccess, showWarning, showInfo } = useToast();

  const handleSubmit = async () => {
    try {
      const response = await api.post('/events', data);
      showSuccess('Événement créé avec succès !');
    } catch (error) {
      // Les erreurs réseau sont déjà gérées automatiquement
      // Gérer les erreurs métier (400, 404, etc.)
      if (error.response?.status === 404) {
        showError('Événement introuvable');
      } else if (error.response?.status === 400) {
        const message = error.response.data.message || 'Données invalides';
        showWarning(message);
      }
    }
  };
}
```

### ErrorScreen (erreurs critiques)

Pour les écrans qui doivent charger des données essentielles au démarrage :

```typescript
import { ErrorScreen } from '@/components/ErrorScreen';
import { useQuery } from '@tanstack/react-query';

function CriticalDataScreen() {
  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['critical-data'],
    queryFn: fetchCriticalData,
    retry: false, // Ne pas retry automatiquement
  });

  if (isLoading) {
    return <ActivityIndicator />;
  }

  // Afficher ErrorScreen pour les erreurs critiques
  if (isError) {
    return (
      <ErrorScreen
        title="Impossible de charger les données"
        message="Vérifiez votre connexion internet et réessayez."
        onRetry={() => refetch()}
        icon="cloud-offline"
      />
    );
  }

  return <YourNormalUI data={data} />;
}
```

### ErrorScreen personnalisé

```typescript
<ErrorScreen
  title="Événement introuvable"
  message="Cet événement n'existe plus ou a été supprimé."
  onRetry={() => router.back()}
  icon="calendar-outline"
/>
```

## Exemples de Scénarios

### Scénario 1 : Liste d'églises

```typescript
function ChurchListScreen() {
  const { data, isLoading } = useQuery({
    queryKey: ['churches'],
    queryFn: () => api.get('/public/churches'),
  });

  // ✅ Les erreurs réseau affichent automatiquement un toast
  // ✅ Pas besoin de gérer les erreurs ici

  if (isLoading) return <Loader />;
  return <ChurchList churches={data} />;
}
```

### Scénario 2 : Détail d'un événement (404 possible)

```typescript
function EventDetailScreen({ id }) {
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['event', id],
    queryFn: () => api.get(`/public/events/${id}`),
  });

  if (isLoading) return <Loader />;

  // Gérer le 404 spécifiquement
  if (isError && error.response?.status === 404) {
    return (
      <ErrorScreen
        title="Événement introuvable"
        message="Cet événement n'existe plus."
        onRetry={() => router.back()}
      />
    );
  }

  // Les autres erreurs (réseau, 500) affichent déjà un toast
  if (isError) return null;

  return <EventDetails event={data} />;
}
```

### Scénario 3 : Formulaire avec validation

```typescript
function CreateEventForm() {
  const { showError, showSuccess } = useToast();
  const mutation = useMutation({
    mutationFn: (data) => api.post('/events', data),
    onSuccess: () => {
      showSuccess('Événement créé !');
    },
    onError: (error) => {
      // Les erreurs réseau/serveur affichent déjà un toast
      // Gérer uniquement les erreurs de validation (400)
      if (error.response?.status === 400) {
        const message = error.response.data.message || 'Données invalides';
        showError(message);
      }
    },
  });

  return <Form onSubmit={mutation.mutate} />;
}
```

## Bonnes Pratiques

### ✅ À FAIRE

1. **Laisser le toast automatique gérer les erreurs réseau** (pas de code supplémentaire)
2. **Utiliser ErrorScreen pour les écrans critiques** (ex: données essentielles au démarrage)
3. **Gérer manuellement les 400/404** dans les composants (erreurs métier)
4. **Afficher des messages clairs** : "Événement introuvable" > "Erreur 404"

### ❌ À ÉVITER

1. **Ne pas afficher de toast pour les 400/404** (laissez le composant gérer)
2. **Ne pas dupliquer la gestion réseau** (déjà gérée automatiquement)
3. **Ne pas utiliser ErrorScreen pour de petites erreurs** (utilisez les toasts)
4. **Ne pas bloquer l'UI** si ce n'est pas critique

## Types de Toasts Disponibles

```typescript
const { showError, showSuccess, showWarning, showInfo } = useToast();

// Erreur (rouge) - 4 secondes
showError('Message d\'erreur');

// Erreur avec action
showError('Aucune connexion réseau', {
  label: 'Réessayer',
  onPress: () => refetch(),
});

// Succès (vert) - 2.5 secondes
showSuccess('Opération réussie !');

// Avertissement (jaune) - 3.5 secondes
showWarning('Attention : données incomplètes');

// Information (bleu) - 3 secondes
showInfo('Nouvelles données disponibles');
```

## Configuration

### Throttling des Toasts

Par défaut : **5 secondes** (configuré dans `hooks/useAxiosInterceptor.ts`)

```typescript
const THROTTLE_DELAY = 5000; // 5 secondes
```

Cela signifie que si 10 requêtes échouent en même temps, vous ne verrez qu'**un seul toast**, pas 10 !

### Timeout API

Par défaut : **10 secondes** (configuré dans `constants/config.ts`)

```typescript
export const API_CONFIG = {
  BASE_URL: process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000/api',
  TIMEOUT: 10000, // 10 seconds
};
```

### Durée des Toasts

Configurée dans `contexts/ToastContext.tsx` :

- Error : 4 secondes
- Success : 2.5 secondes
- Warning : 3.5 secondes
- Info : 3 secondes

## Désactiver la Gestion Automatique

Si vous voulez gérer une erreur spécifique manuellement sans toast automatique, vous pouvez désactiver l'intercepteur pour cette requête :

```typescript
// Option 1 : Utiliser un flag custom dans la config
const response = await api.get('/endpoint', {
  skipInterceptor: true, // À implémenter si besoin
});

// Option 2 : Créer une instance axios séparée sans intercepteurs
import axios from 'axios';
const customApi = axios.create({ baseURL: API_CONFIG.BASE_URL });
```

## Debugging

Pour voir les erreurs détaillées dans la console :

1. Les erreurs réseau sont loguées dans `useAxiosInterceptor`
2. Les erreurs de composants apparaissent dans React DevTools
3. Utilisez `console.log(error.response)` pour inspecter les erreurs API

---

**Créé le** : 2026-01-12
**Dernière mise à jour** : 2026-01-12
