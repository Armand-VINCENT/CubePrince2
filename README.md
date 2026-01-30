# Le Petit Prince - Expérience Immersive VR

Une expérience WebVR immersive inspirée de l'œuvre d'Antoine de Saint-Exupéry, construite avec A-Frame et optimisée pour la réalité virtuelle.

## 🌟 Description

Cette expérience interactive transporte les utilisateurs à travers trois mondes distincts inspirés de l'univers du Petit Prince, avec des animations, des effets sonores et des interactions immersives.

## 🎮 Trois Mondes à Explorer

### 1. Le Désert

- **Point de départ** : L'aventure commence dans un désert avec un avion crashé
- **Transitions** :
  - 👆 **Manuelle** : Cliquer sur l'avion pour voyager immédiatement vers la lune
  - ⏰ **Automatique** : Après **20 secondes** dans le désert, transition automatique vers la lune
- **Ambiance** : Cycle jour/nuit automatique avec transition de couleurs du ciel
- **Audio** : Son du vent (WindSFX.m4a)

### 2. La Surface de la Lune

- **Événements** :
  - Animation "Golden Hour" avec transition de couleurs progressive (bleu nuit → gris violet → orange doré)
  - Apparition progressive de 40 étoiles scintillantes (optimisées VR)
  - Passage d'un avion dans le ciel avec son spatial dynamique
  - Rose interactive qui déclenche la transition vers le monde suivant
- **Transitions** :
  - 👆 **Manuelle** : Cliquer sur la rose (après que l'avion ait disparu) pour voyager immédiatement vers le champ de fleurs
  - ⏰ **Automatique** : **5 secondes après la disparition de l'avion** (soit 75s après l'arrivée sur la lune), transition automatique vers le champ de fleurs
- **Audio** :
  - StarsSong.m4a (musique principale, 27 secondes)
  - SpaceSFX.mp3 (ambiance spatiale en boucle)
  - SFXAirplane.m4a (son de l'avion avec volume dynamique basé sur la distance)
  - Magical_SFX.m4a (activation de la rose)
- **Effets** : Texte poétique animé, lumière clignotante sur l'avion

### 3. Le Champ de Fleurs

- **Éléments** :
  - Sphère herbeuse avec texture terrestre
  - Renard interactif (Foxv2.glb) avec son et cooldown de 3 secondes
  - Écharpe rotative HERMÈS x Le petit prince
  - Ballons animés traversant le ciel
  - Soleil avec effet de glow
- **Audio** :
  - FlowerOST.mp3 (musique florale en boucle)
  - Foxsfx.mp3 (interaction avec le renard)

## 🎨 Caractéristiques Techniques

### Optimisations VR

- **Étoiles** : 40 sphères émissives avec animations d'intensité, **sans lumières ponctuelles** (réduction majeure de la charge GPU)
- **Animations** : Fréquence réduite (30fps pour golden hour, 20fps pour texte) pour fluidité VR
- **Transitions de couleur** : Simplifiées à 3 étapes au lieu de 7
- **Apparition des étoiles** : Système de batch processing (2 étoiles par mise à jour)

### Audio Spatial

- Son de l'avion avec **volume dynamique** :
  - Volume varie de **0.2** (aux limites du ciel) à **1.0** (au plus proche de la rose)
  - Calcul en temps réel de la distance 3D
  - Mise à jour toutes les 100ms pour transition fluide

### Interactions

- **Compatible Web + VR** : Système de cursor-listener avec debounce (100ms)
- **Hitbox invisibles** : Pour captures de clics précises sur modèles 3D
- **Events supportés** : click (souris), triggerdown (contrôleurs VR)

### ⏰ Système de Transitions Hybride

L'expérience propose **deux modes de navigation** pour s'adapter à tous les utilisateurs :

#### Transitions Manuelles (Interaction)

- **Avantage** : L'utilisateur contrôle le rythme de l'expérience
- **Désert → Lune** : Clic sur l'avion
- **Lune → Fleurs** : Clic sur la rose (après passage de l'avion)

#### Transitions Automatiques (Temporelles)

- **Avantage** : L'expérience progresse automatiquement, même sans interaction
- **Désert → Lune** : Après **20 secondes** dans le désert
- **Lune → Fleurs** : **5 secondes** après la disparition de l'avion (75s total)

#### Logique de Priorité

- Si l'utilisateur **interagit avant** le timer, la transition se fait immédiatement et le timer est annulé
- Si l'utilisateur **n'interagit pas**, la transition se fait automatiquement au délai prévu
- Les timers sont **annulés** dès qu'une interaction manuelle est détectée

## 🛠️ Technologies Utilisées

- **A-Frame** : Framework WebVR
- **Three.js** : Rendu 3D (sous-jacent à A-Frame)
- **Vite** : Build tool et serveur de développement
- **GLTF/GLB** : Modèles 3D optimisés

## 📁 Structure du Projet

```
CubePrince2/
├── index.html              # Scène A-Frame et structure HTML
├── src/
│   ├── main.js            # Logique principale, interactions, animations
│   └── style.css          # Styles CSS
├── public/
│   ├── models/            # Modèles 3D (.glb)
│   │   ├── Airplane.glb
│   │   ├── Desert.glb
│   │   ├── Moon.glb
│   │   ├── Rose.glb
│   │   ├── Foxv2.glb
│   │   ├── scarf.glb
│   │   ├── Balloons.glb
│   │   ├── Sun.glb
│   │   └── Clouds.glb / Clouds2.glb / Clouds3.glb
│   ├── textures/          # Textures
│   │   ├── MoonTextureCartoon.jpg
│   │   └── EarthTexture.jpg
│   └── audio/             # Fichiers sonores
│       ├── WindSFX.m4a
│       ├── StarsSong.m4a
│       ├── SpaceSFX.mp3
│       ├── SFXAirplane.m4a
│       ├── Magical_SFX.m4a
│       ├── FlowerOST.mp3
│       └── Foxsfx.mp3
├── package.json
└── vite.config.js
```

## 🚀 Installation et Lancement

### Prérequis

- Node.js (v14 ou supérieur)
- npm ou yarn

### Installation

```bash
npm install
```

### Développement

```bash
npm run dev
```

L'application sera accessible sur `http://localhost:5173`

### Build Production

```bash
npm run build
```

## 🎯 Séquence d'Événements

### Scénario avec Interactions Manuelles

1. **Écran de démarrage** (0s)
   - Clic sur "Commencer l'expérience"
   - Démarrage du son du vent
   - ⏰ **Timer 20s lancé** pour transition auto désert→lune

2. **Monde Désert** (0s - variable)
   - Cycle jour/nuit automatique (30s par cycle)
   - 👆 Clic sur l'avion → Téléportation immédiate sur la lune (annule le timer)
   - ⏰ OU après 20s sans interaction → Téléportation automatique sur la lune

3. **Monde Lune** (0s - ~75s)
   - `0s` : Début de StarsSong.m4a
   - `0-35s` : Apparition progressive des étoiles (batch de 2)
   - `0-15s` : Animation golden hour
   - `15s` : Activation de la rose (son magique + texte)
   - `27s` : Fin de StarsSong → Début de SpaceSFX
   - `27-35s` : Transition ciel vers noir
   - `50s` : Avion traverse le ciel (20s de vol)
   - `50-70s` : Son de l'avion avec volume dynamique
   - `70s` : Avion disparaît, ⏰ **Timer 5s lancé** pour transition auto lune→fleurs
   - `70s+` : Rose cliquable
   - 👆 Clic sur la rose → Transition immédiate vers fleurs (annule le timer)
   - ⏰ OU `75s` (70s + 5s) → Transition automatique vers fleurs

4. **Monde Fleurs** (après transition)
   - Téléportation au sommet de la sphère
   - FlowerOST.mp3 en boucle
   - Renard interactif avec cooldown 3s
   - Ballons animés (30s de traversée)

### Scénario 100% Automatique (sans interaction)

- **0-20s** : Monde Désert
- **20-95s** : Monde Lune (20s + 75s)
- **95s+** : Monde Fleurs

## 🎨 Palette de Couleurs

### Désert

- Jour : `#87CEEB` (Bleu ciel)
- Nuit : `#191970` (Bleu nuit)
- Ambiance : `#F4A460` (Sable doré)

### Lune

- Initial : `#1C1C3C` (Bleu nuit profond)
- Transition : `#7A6A72` (Gris violet)
- Golden Hour : `#FF8C42` (Orange doré)
- Final : `#000000` (Noir spatial)

### Fleurs

- Ciel : `#4979a7` (Bleu lumineux)
- Sphère : `#7CFC00` (Vert gazon)
- Texte : `#FFD700` (Or)

## ⚡ Performances VR

### Optimisations Critiques

- ❌ **Supprimé** : 40 lumières ponctuelles (économie GPU majeure)
- ✅ **Ajouté** : Matériaux émissifs avec animations d'intensité
- ⏱️ **Réduit** : Fréquence des animations (60fps → 30fps/20fps)
- 📦 **Batching** : Traitement groupé des étoiles (40 setTimeout → 1 setInterval)

### Conseils pour Performances Optimales

- Utiliser un casque VR avec GPU dédié (Quest 2, Quest 3, Valve Index, etc.)
- Fermer les applications en arrière-plan
- Utiliser le mode développeur de Chrome pour monitorer les FPS

## 🔧 Configuration

### Vite Config (vite.config.js)

```javascript
export default {
  // Configuration de base Vite
};
```

### Package.json

- Scripts disponibles : `dev`, `build`, `preview`

## 🎵 Crédits Audio

- **WindSFX.m4a** : Ambiance désert
- **StarsSong.m4a** : Musique principale (27s)
- **SpaceSFX.mp3** : Ambiance spatiale
- **SFXAirplane.m4a** : Son d'avion
- **Magical_SFX.m4a** : Activation magique
- **FlowerOST.mp3** : Musique florale
- **Foxsfx.mp3** : Interaction renard

## 🎨 Crédits Visuels

- Modèles 3D : Format GLTF/GLB optimisés pour WebVR
- Textures : Style cartoon adapté pour VR
- Collaboration : **HERMÈS x Le petit prince**

## 📝 License

Projet éducatif inspiré de "Le Petit Prince" d'Antoine de Saint-Exupéry.

## 🤝 Contribution

Ce projet est une expérience immersive artistique. Pour toute question ou suggestion, n'hésitez pas à ouvrir une issue.

---

**Développé avec ❤️ pour une expérience VR immersive du Petit Prince**
