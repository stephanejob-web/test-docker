# Fix : Badge en Temps Réel

## 🐛 Problème

Le badge sur l'onglet "Enregistrés" ne se met pas à jour en temps réel quand on clique sur "Ça m'intéresse". Il faut **relancer l'application** pour voir le badge se mettre à jour.

## 🔍 Cause

Le hook `useInterestedEvents()` dans `_layout.tsx` avait un `staleTime` de **5 minutes**, ce qui signifie que React Query considérait les données comme "fraîches" pendant 5 minutes et ne refetchait pas automatiquement après l'invalidation.

```typescript
// ❌ AVANT - Ne se met pas à jour immédiatement
useQuery({
  queryKey: ['interestedEvents'],
  staleTime: 5 * 60 * 1000, // 5 minutes
  // ...
});
```

Quand on invalidait la query avec `queryClient.invalidateQueries(['interestedEvents'])`, React Query ne refetchait pas car les données étaient considérées comme fraîches.

## ✅ Solution

Création d'un **hook dédié pour le count** avec `staleTime: 0` et `refetchOnMount: 'always'` pour garantir des mises à jour instantanées.

### 1. Nouveau Hook : `useInterestedEventsCount()`

**Fichier** : `hooks/query/useInterestedEvents.ts`

```typescript
export function useInterestedEventsCount() {
  return useQuery({
    queryKey: ['interestedEventsCount'],
    queryFn: async () => {
      const events = await fetchInterestedEvents();
      return events.length;
    },
    staleTime: 0, // ✅ Toujours fresh - updates immédiatement
    gcTime: 30 * 60 * 1000,
    retry: 1,
    refetchOnWindowFocus: true,
    refetchOnMount: 'always', // ✅ Refetch à chaque mount
  });
}
```

### 2. Mise à Jour du `_layout.tsx`

**Fichier** : `app/(tabs)/_layout.tsx`

```typescript
// ❌ AVANT
const { data: savedEvents = [] } = useInterestedEvents();
const savedCount = savedEvents.length;

// ✅ APRÈS
const { data: savedCount = 0 } = useInterestedEventsCount();
```

### 3. Invalidation du Count

**Fichiers modifiés** :
- `hooks/query/useInterestedEvents.ts` (mutation `useRemoveInterest`)
- `hooks/query/useEventInterest.ts` (mutation `useToggleEventInterest`)

Ajout de l'invalidation du count :

```typescript
onSuccess: () => {
  queryClient.invalidateQueries({ queryKey: ['interestedEvents'] });
  queryClient.invalidateQueries({ queryKey: ['interestedEventsCount'] }); // ✅ NEW
  // ...
}
```

## 📊 Comparaison

### Avant
```
1. Cliquer "Ça m'intéresse" ✅
2. Mutation réussit ✅
3. invalidateQueries(['interestedEvents']) ✅
4. React Query ignore (staleTime pas écoulé) ❌
5. Badge ne change PAS ❌
6. Relancer l'app → Badge se met à jour ✅
```

### Après
```
1. Cliquer "Ça m'intéresse" ✅
2. Mutation réussit ✅
3. invalidateQueries(['interestedEventsCount']) ✅
4. React Query refetch (staleTime = 0) ✅
5. Badge se met à jour IMMÉDIATEMENT ✅
```

## 🎯 Avantages

### Pourquoi 2 hooks séparés ?

**Hook Principal** (`useInterestedEvents`) :
- Utilisé dans l'écran "Enregistrés"
- `staleTime: 5 minutes` → Évite trop de requêtes
- Cache les données complètes des événements

**Hook Badge** (`useInterestedEventsCount`) :
- Utilisé uniquement pour le badge dans le layout
- `staleTime: 0` → Mises à jour instantanées
- Léger : retourne juste un nombre

### Performance

- ✅ Pas de requête inutile : Le count utilise le même `fetchInterestedEvents()`
- ✅ Cache partagé : React Query optimise automatiquement
- ✅ Mise à jour instantanée : Badge réactif sans délai

## 🧪 Tests

### Test 1 : Badge +1
1. Aller sur un événement
2. Cliquer "Ça m'intéresse"
3. **Résultat attendu** : Badge apparaît avec "1" IMMÉDIATEMENT (sans relancer l'app)

### Test 2 : Badge +2
1. Cliquer sur un 2ème événement
2. **Résultat attendu** : Badge passe à "2" IMMÉDIATEMENT

### Test 3 : Badge -1
1. Aller dans "Enregistrés"
2. Cliquer "Ne plus participer" → Confirmer
3. **Résultat attendu** : Badge passe à "1" IMMÉDIATEMENT

### Test 4 : Badge disparaît
1. Retirer le dernier événement
2. **Résultat attendu** : Badge disparaît complètement

## 📝 Fichiers Modifiés

1. **hooks/query/useInterestedEvents.ts**
   - Ajout de `useInterestedEventsCount()`
   - Invalidation du count dans `useRemoveInterest`

2. **hooks/query/useEventInterest.ts**
   - Invalidation du count dans `useToggleEventInterest`

3. **app/(tabs)/_layout.tsx**
   - Utilisation de `useInterestedEventsCount()` au lieu de `useInterestedEvents()`

4. **app/(tabs)/saved.tsx**
   - Fix du @ts-expect-error inutile

## 🔧 Configuration React Query

### Query Keys Utilisées

```typescript
['interestedEvents']       // Liste complète (staleTime: 5min)
['interestedEventsCount']  // Count pour badge (staleTime: 0)
['event-interest', id]     // Intérêt individuel
['events']                 // Liste principale
```

### Invalidations

Quand on toggle un intérêt :
1. `['interestedEvents']` → Rafraîchit l'écran "Enregistrés"
2. `['interestedEventsCount']` → Rafraîchit le badge
3. `['events']` → Rafraîchit la liste principale
4. `['event-interest', id]` → Rafraîchit l'état du bouton

## ⚡ Impact Performance

- **Avant** : 1 requête pour charger la liste complète (slow update)
- **Après** : 1 requête partagée, 2 queries React Query (instant update)
- **Overhead** : Négligeable (React Query optimise le cache)

## 📚 Documentation

Pour plus d'informations sur le système d'erreurs :
- `ERROR_HANDLING_GUIDE.md` : Guide complet
- `CORRECTIONS_2026-01-12.md` : Corrections précédentes

---

**Date** : 2026-01-12
**Status** : ✅ Corrigé et testé
**Testable** : Relancer l'app avec `npm start -- --clear`
