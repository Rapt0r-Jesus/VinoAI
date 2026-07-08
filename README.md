# 🍷 VinoAI — Wine Recognition through Artificial Intelligence

> Scannez une étiquette de vin, découvrez tout ce qu'il y a à savoir.

**Holberton School — First Year Project**  
**Développeur :** Dorian Oufer  
**Période :** Mai → Juillet 2026

---

## 📱 Présentation

VinoAI est une application mobile qui permet à n'importe quel utilisateur de photographier une bouteille de vin et de recevoir instantanément une fiche complète : nom, millésime, région, cépages, appellation, notes de dégustation et accords mets-vins.

Pas besoin de connaissances en oenologie — l'IA fait tout le travail.

---

## ✨ Fonctionnalités

- 📸 **Scan par photo** — pointe la caméra vers une étiquette, l'IA lit et interprète le label
- 🍇 **Fiche vin complète** — nom, millésime, région, cépages, appellation, producteur
- 📝 **Notes de dégustation** — générées par Claude si absentes de la base de données
- 🍽️ **Accords mets-vins** — suggestions automatiques adaptées au vin scanné
- 💾 **Ma cave** — sauvegarde locale des vins scannés (SQLite, fonctionne hors ligne)
- 🔍 **Recherche dans l'historique** — retrouve un vin sauvegardé par nom, région ou cépage
- ⚡ **Cache intelligent** — les résultats sont mis en cache 24h pour des réponses instantanées

---

## 🏗️ Architecture

```
vinoai/
├── client/                  # Application mobile React Native / Expo
│   ├── App.js               # Point d'entrée, navigation, init SQLite
│   ├── database.js          # SQLite client (tables wines + user_notes)
│   └── screens/
│       ├── CameraScreen.js  # Capture photo + appel back-end
│       ├── ResultScreen.js  # Affichage fiche vin + sauvegarde
│       └── HistoryScreen.js # Liste des vins sauvegardés
│
└── server/                  # API REST Node.js / Express
    ├── server.js            # Point d'entrée Express
    ├── routes/
    │   └── scan.js          # POST /scan, GET /wines/search, GET /health
    ├── controllers/
    │   ├── VisionController.js  # Orchestration Claude Vision
    │   └── WineController.js    # Orchestration cache + GrapeMinds
    ├── services/
    │   ├── ClaudeService.js     # Appels Claude Vision API
    │   ├── GrapeMindsService.js # Appels GrapeMinds API + fallback Claude
    │   ├── CacheService.js      # Cache SQLite serveur (TTL 24h)
    │   └── ResponseBuilder.js   # Normalisation et merge des données
    └── tests/               # Tests Jest + Supertest (27 tests, 93% pass)
```

### Flux de données

```
📱 Photo bouteille
    ↓
🖥️  POST /api/v1/scan (base64)
    ↓
🤖 Claude Vision API → extrait {name, vintage, producer, region}
    ↓
🔍 Cache SQLite → hit (< 200ms) ou miss
    ↓
🍷 GrapeMinds API → cépages, région, flavor profile
    ↓
✨ Claude (fallback) → génère tasting notes + food pairings si manquants
    ↓
📱 ResultScreen affiche la fiche complète
```

---

## 🛠️ Stack technique

| Couche | Technologie | Rôle |
|--------|-------------|------|
| Mobile | React Native + Expo | UI cross-platform iOS & Android |
| Back-end | Node.js + Express | API REST, orchestration |
| IA Vision | Claude Vision API (claude-sonnet-4-6) | Lecture et interprétation du label |
| Base de données vin | GrapeMinds API | Cépages, appellations, tasting notes |
| IA Texte | Claude API (fallback) | Génération tasting notes manquantes |
| Stockage local client | SQLite via expo-sqlite | Cave personnelle, hors ligne |
| Stockage local serveur | SQLite (cache.db) | Cache des réponses API (TTL 24h) |
| Tests | Jest + Supertest | 27 tests unitaires et d'intégration |

---

## 🚀 Installation et lancement

### Prérequis

- Node.js >= 18
- npm >= 9
- Expo Go installé sur ton téléphone (iOS ou Android)
- Clés API : [Anthropic Claude](https://console.anthropic.com) et [GrapeMinds](https://grapeminds.fr/api/dashboard)

### 1. Cloner le projet

```bash
git clone https://github.com/Rapt0r-Jesus/VinoAI.git
cd VinoAI/vinoai
```

### 2. Configurer le back-end

```bash
cd server
npm install
cp .env.example .env
```

Remplis le fichier `.env` :

```env
CLAUDE_API_KEY=sk-ant-api03-...
GRAPEMINDS_API_KEY=GML...
PORT=3000
```

Lance le serveur :

```bash
npm run dev
```

Le serveur démarre sur `http://localhost:3000`.

### 3. Configurer le client mobile

```bash
cd ../client
npm install
```

Dans `screens/CameraScreen.js`, remplace l'IP par celle de ta machine :

```javascript
const API_URL = 'http://TON_IP_LOCALE:3000/api/v1/scan';
```

> Pour trouver ton IP sur Windows : `ipconfig` → "Adresse IPv4"

Lance l'app :

```bash
npx expo start
```

Scanne le QR code avec Expo Go sur ton téléphone. Ton téléphone et ton PC doivent être sur le même réseau Wi-Fi.

---

## 🔌 API Endpoints

### `POST /api/v1/scan`
Analyse une photo d'étiquette de vin.

**Body :**
```json
{
  "image": "base64_encoded_image",
  "format": "jpeg"
}
```

**Réponse 200 :**
```json
{
  "name": "Château La Lagune",
  "vintage": 2009,
  "producer": "Château La Lagune",
  "region": "Haut-Médoc",
  "grape": "Cabernet Sauvignon, Merlot, Cabernet Franc",
  "appellation": "Médoc",
  "tasting_notes": "Robe rubis profonde, notes de fruits noirs...",
  "food_pairings": ["Agneau rôti", "Canard confit", "Fromages affinés"],
  "grapeminds_id": "134743"
}
```

### `GET /api/v1/wines/search?q={query}`
Recherche textuelle dans la base GrapeMinds.

### `GET /api/v1/health`
Vérifie que le serveur est opérationnel.

---

## 🧪 Tests

```bash
cd server
npm test
```

**Résultats :** 25/27 tests passés (93%)

| Suite | Tests | Statut |
|-------|-------|--------|
| ClaudeService.test.js | 4/4 | ✅ PASS |
| VisionController.test.js | 4/4 | ✅ PASS |
| WineController.test.js | 4/4 | ✅ PASS |
| CacheService.test.js | 4/4 | ✅ PASS |
| ResponseBuilder.test.js | 4/4 | ✅ PASS |
| scan.test.js | 5/5 | ✅ PASS |
| GrapeMindsService.test.js | 0/2 | ❌ Mocks à mettre à jour |

---

## 📁 Variables d'environnement

| Variable | Description | Où l'obtenir |
|----------|-------------|--------------|
| `CLAUDE_API_KEY` | Clé API Anthropic Claude | [console.anthropic.com](https://console.anthropic.com) |
| `GRAPEMINDS_API_KEY` | Clé API GrapeMinds | [grapeminds.fr/api/dashboard](https://grapeminds.fr/api/dashboard) |
| `PORT` | Port du serveur (défaut: 3000) | — |

> ⚠️ Ne jamais commiter le fichier `.env` — il est dans le `.gitignore`.

---

## 🌿 Branching strategy (Git Flow)

```
main          → code stable, toujours déployable
develop       → intégration de toutes les features
feature/T-XX  → une branche par tâche, mergée via Pull Request
fix/*         → corrections de bugs
```

---

## 📊 Statut du projet

- [x] Camera + Claude Vision API (lecture étiquette)
- [x] GrapeMinds API (données vin)
- [x] ResultScreen (affichage fiche complète)
- [x] Save to my cellar (SQLite local)
- [x] HistoryScreen (liste des vins sauvegardés)
- [ ] NotesScreen (rating + commentaire personnel)
- [ ] Déploiement production (Railway)
- [ ] UI polish final

---

## 👤 Auteur

**Dorian Oufer**  
Holberton School — First Year Student  
GitHub : [@Rapt0r-Jesus](https://github.com/Rapt0r-Jesus)

---

*VinoAI — Holberton School First Year Project — 2026*
