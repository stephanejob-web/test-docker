# Light Church Mobile 📱

Application mobile React Native pour découvrir les églises évangéliques et leurs événements en France.

## 🎯 Fonctionnalités

- **Carte interactive** avec clustering performant (4000+ églises)
- **Géolocalisation** en temps réel
- **Bottom sheet** style Google Maps (peek/half/full)
- **Détails complets** églises et événements
- **Cache intelligent** React Query
- **Performance 60 FPS**

## 🚀 Démarrage Rapide

### 1. Installation

```bash
npm install
```

### 2. Configuration

L'environnement est déjà configuré dans `.env` :
```env
EXPO_PUBLIC_API_URL=http://localhost:3000/api
```

### 3. Démarrer

```bash
# Terminal 1 : Backend
cd ../backend-express
npm start

# Terminal 2 : Mobile App
npm start
# Puis : i (iOS) / a (Android)
```

## 📦 Stack

- React Native 0.81.5 + Expo 54
- react-native-maps (clustering)
- @gorhom/bottom-sheet
- @tanstack/react-query
- TypeScript + @shopify/restyle

## 📁 Structure

```
app/(tabs)/index.tsx     → Carte principale
app/church/[id].tsx      → Détail église
components/map/          → Composants carte
components/bottomSheet/  → Bottom sheet
services/mapService.ts   → API calls
```

## 🎨 Design System

Inspiré de Google Maps avec thème Restyle type-safe.

## 📖 Documentation Complète

Voir le README complet pour l'architecture détaillée, l'API, et les optimisations.
