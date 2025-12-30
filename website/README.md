# 🙏 Light Church - Site Web Professionnel

Site web vitrine moderne et professionnel pour l'application mobile **Light Church**.

## 📋 Table des matières

- [Aperçu](#aperçu)
- [Fonctionnalités](#fonctionnalités)
- [Structure](#structure)
- [Installation](#installation)
- [Personnalisation](#personnalisation)
- [Déploiement](#déploiement)
- [Optimisations](#optimisations)

---

## 🎯 Aperçu

Site web marketing one-page conçu pour **convertir les visiteurs** et leur donner envie de télécharger l'application Light Church.

### Caractéristiques principales:
- ✅ **Design moderne** - Inspiré des meilleures landing pages tech
- ✅ **Animations fluides** - Vanilla JavaScript, 0 dépendances
- ✅ **100% Responsive** - Mobile, tablette et desktop
- ✅ **Performance optimale** - Chargement rapide, SEO-friendly
- ✅ **Professionnel** - Mockups iPhone, gradients, micro-interactions

---

## ✨ Fonctionnalités

### Sections du site:

1. **Hero Section**
   - Titre accrocheur avec gradient
   - Statistiques impressionnantes (3000+ églises, 60 FPS)
   - Boutons de téléchargement App Store / Google Play
   - Mockup iPhone animé (effet float)

2. **Problème / Solution**
   - Identifie les pain points des utilisateurs
   - Présente Light Church comme LA solution
   - Design avec cartes et highlight box

3. **Fonctionnalités**
   - 6 features clés avec icônes
   - Animation au scroll (fade in stagger)
   - Cards avec hover effects

4. **Avantages**
   - 5 bénéfices concrets
   - Check marks avec gradient
   - Mockup secondaire

5. **Screenshots**
   - Slider horizontal avec 4 mockups
   - Auto-scroll au hover (desktop)
   - Snap scroll (mobile)

6. **Download CTA**
   - Section finale avec fond gradient
   - Gros boutons de téléchargement
   - Note de compatibilité

7. **Footer**
   - Logo et liens
   - 3 colonnes (App, Support, Légal)
   - Design dark moderne

### Animations JavaScript:

- ✅ Navbar sticky avec shadow au scroll
- ✅ Smooth scroll vers sections
- ✅ Intersection Observer pour fade-in
- ✅ Parallax sur le mockup hero
- ✅ Counter animé sur les statistiques
- ✅ Mobile menu hamburger
- ✅ Easter egg (Konami Code) 🎮

---

## 📁 Structure

```
website/
├── index.html          # Page principale
├── styles.css          # Tous les styles (modern CSS)
├── script.js           # Toutes les animations (vanilla JS)
├── README.md           # Ce fichier
└── assets/
    ├── images/         # Logo, backgrounds, etc.
    ├── icons/          # Icônes personnalisées
    └── screenshots/    # Screenshots de l'app
```

---

## 🚀 Installation

### Prérequis:
- Un navigateur moderne (Chrome, Firefox, Safari, Edge)
- Aucune dépendance nécessaire!

### Utilisation locale:

1. **Ouvrir directement le fichier**
   ```bash
   cd website/
   open index.html  # macOS
   # ou double-cliquez sur index.html
   ```

2. **Ou avec un serveur local** (recommandé):
   ```bash
   # Python 3
   python3 -m http.server 8000

   # Node.js (npx)
   npx serve

   # PHP
   php -S localhost:8000
   ```

   Puis ouvrir: `http://localhost:8000`

---

## 🎨 Personnalisation

### 1. Ajouter vos screenshots

**Important:** Remplacez les mockups placeholder par de vrais screenshots!

#### Option A: Screenshots simples
Ajoutez vos images dans `assets/screenshots/` et modifiez le CSS:

```css
/* Dans styles.css, ligne ~370 */
.map-preview {
    background: url('../assets/screenshots/map-screen.png');
    background-size: cover;
    background-position: center;
}
```

#### Option B: Mockups professionnels
Utilisez des outils comme:
- [Mockuphone](https://mockuphone.com/) - Gratuit
- [Smartmockups](https://smartmockups.com/) - Freemium
- [Figma](https://www.figma.com/) - Gratuit

Exportez vos mockups et remplacez:
```html
<!-- Dans index.html, ligne ~95 -->
<div class="screen-content">
    <img src="assets/screenshots/hero-mockup.png" alt="Light Church App">
</div>
```

### 2. Changer les couleurs

Modifiez les variables CSS dans `styles.css` (lignes 10-20):

```css
:root {
    --primary: #4285F4;          /* Couleur principale */
    --secondary: #EA4335;        /* Couleur secondaire */
    --gradient-primary: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    /* ... */
}
```

### 3. Ajouter les liens App Store / Google Play

Dans `script.js` (lignes 150-170), remplacez:

```javascript
iosButtons.forEach(btn => {
    btn.addEventListener('click', () => {
        window.location.href = 'https://apps.apple.com/YOUR_APP_ID';
    });
});

androidButtons.forEach(btn => {
    btn.addEventListener('click', () => {
        window.location.href = 'https://play.google.com/store/apps/YOUR_APP_ID';
    });
});
```

### 4. Modifier le contenu

Le contenu est dans `index.html`. Les sections principales:

- **Ligne 35:** Hero title et description
- **Ligne 92:** Statistiques (3000+, 60 FPS, 100%)
- **Ligne 145:** Problèmes identifiés
- **Ligne 185:** Fonctionnalités (6 features)
- **Ligne 300:** Avantages (5 benefits)

### 5. Ajouter un logo

```html
<!-- Dans index.html, ligne 22 -->
<div class="logo">
    <img src="assets/images/logo.png" alt="Light Church Logo" width="32" height="32">
    <span class="logo-text">Light Church</span>
</div>
```

### 6. SEO et Meta Tags

Ajoutez dans `<head>`:

```html
<!-- Open Graph (Facebook, LinkedIn) -->
<meta property="og:title" content="Light Church - Votre guide spirituel mobile">
<meta property="og:description" content="Trouvez facilement des églises et événements chrétiens près de chez vous">
<meta property="og:image" content="https://votresite.com/assets/images/og-image.png">
<meta property="og:url" content="https://votresite.com">

<!-- Twitter Card -->
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="Light Church">
<meta name="twitter:description" content="Votre guide spirituel mobile">
<meta name="twitter:image" content="https://votresite.com/assets/images/twitter-card.png">

<!-- Favicon -->
<link rel="icon" type="image/png" href="assets/icons/favicon.png">
```

---

## 🌐 Déploiement

### Option 1: Netlify (Recommandé, Gratuit)

1. Créez un compte sur [Netlify](https://www.netlify.com/)
2. Glissez-déposez le dossier `website/` sur Netlify
3. Votre site est en ligne! 🎉

**Avantages:**
- Gratuit
- HTTPS automatique
- Custom domain facile
- Déploiement en 30 secondes

### Option 2: Vercel (Gratuit)

1. Installez Vercel CLI: `npm i -g vercel`
2. Dans le dossier `website/`: `vercel`
3. Suivez les instructions

### Option 3: GitHub Pages (Gratuit)

1. Créez un repo GitHub
2. Uploadez le contenu de `website/`
3. Allez dans Settings > Pages
4. Activez GitHub Pages sur `main` branch

### Option 4: Hébergement traditionnel

Uploadez simplement tous les fichiers via FTP sur votre hébergeur.

---

## ⚡ Optimisations

### Performance actuelle:
- ✅ **0 dépendances** - Pur HTML/CSS/JS
- ✅ **Lightweight** - ~50KB total (HTML+CSS+JS)
- ✅ **60 FPS animations** - Utilise `requestAnimationFrame`
- ✅ **Lazy loading** ready

### Améliorations possibles:

#### 1. Optimiser les images

```bash
# Compresser les screenshots
# Utilisez TinyPNG, Squoosh, ou ImageOptim
```

#### 2. Minifier les fichiers

```bash
# HTML
npm install -g html-minifier
html-minifier --collapse-whitespace --remove-comments index.html -o index.min.html

# CSS
npm install -g csso-cli
csso styles.css -o styles.min.css

# JavaScript
npm install -g terser
terser script.js -o script.min.js --compress --mangle
```

#### 3. Ajouter lazy loading

```html
<!-- Pour les images -->
<img src="screenshot.png" loading="lazy" alt="...">
```

#### 4. Ajouter un service worker (PWA)

Créez `sw.js` pour mise en cache offline.

#### 5. Google Analytics

```html
<!-- Avant </head> -->
<script async src="https://www.googletagmanager.com/gtag/js?id=GA_MEASUREMENT_ID"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'GA_MEASUREMENT_ID');
</script>
```

---

## 📊 Checklist avant lancement

- [ ] Remplacer tous les mockups par de vrais screenshots
- [ ] Ajouter le logo Light Church
- [ ] Configurer les liens App Store / Google Play
- [ ] Ajouter les meta tags Open Graph / Twitter
- [ ] Optimiser et compresser les images
- [ ] Tester sur mobile (iPhone, Android)
- [ ] Tester sur tous les navigateurs
- [ ] Vérifier l'accessibilité (contraste, alt texts)
- [ ] Configurer Google Analytics
- [ ] Acheter un nom de domaine (optionnel)
- [ ] Déployer sur Netlify/Vercel
- [ ] Partager sur les réseaux sociaux! 🚀

---

## 🎨 Design System

### Couleurs utilisées:
```
Primary:    #4285F4 (Bleu Google)
Secondary:  #EA4335 (Rouge)
Success:    #34A853 (Vert)
Warning:    #FBBC04 (Jaune)
Dark:       #202124
Text:       #5F6368
```

### Typographie:
```
Font: Inter (Google Fonts)
Weights: 300, 400, 500, 600, 700, 800, 900

Hero Title:   64px / 800
Section Title: 48px / 800
Feature Title: 22px / 700
Body:         16-20px / 400-500
```

### Spacing:
```
Section padding: 100px vertical
Container max-width: 1200px
Grid gaps: 30-60px
Card padding: 30-40px
```

---

## 🐛 Troubleshooting

### Les animations ne fonctionnent pas
- Vérifiez que JavaScript est activé
- Ouvrez la console (F12) pour voir les erreurs
- Assurez-vous que `script.js` est bien chargé

### Les fonts ne s'affichent pas
- Vérifiez la connexion internet (Google Fonts)
- Alternative: téléchargez Inter et hébergez localement

### Le site n'est pas responsive
- Testez avec les DevTools (F12 > Toggle Device Toolbar)
- Vérifiez que la balise viewport est présente dans `<head>`

### Performance lente
- Optimisez et compressez les images
- Minifiez HTML/CSS/JS
- Utilisez un CDN pour les assets

---

## 📝 Notes

**Site créé avec:**
- ❤️ Passion
- ☕ Café
- 🎨 Design moderne
- 💻 Code propre

**Technologies:**
- HTML5 sémantique
- CSS3 moderne (Grid, Flexbox, Custom Properties)
- JavaScript ES6+ (Vanilla, 0 framework)
- Google Fonts (Inter)

**Compatible:**
- ✅ Chrome 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Edge 90+
- ✅ Mobile (iOS 13+, Android 8+)

---

## 🚀 Prochaines étapes

1. **Ajoutez vos vrais screenshots** - Le plus important!
2. **Testez sur mobile** - Vérifiez que tout fonctionne
3. **Déployez** - Netlify en 2 minutes
4. **Partagez** - Réseaux sociaux, église, communauté
5. **Analysez** - Google Analytics pour tracker les visiteurs
6. **Itérez** - Améliorez basé sur les retours

---

**Besoin d'aide?**

- 📧 Support: Créez une issue
- 📖 Documentation: Ce README
- 🎨 Design: Figma community
- 💬 Community: Discord, forums

---

**Bon lancement! 🙏✨**
