# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Projet

Site web pour **JDC Auto**, un concessionnaire automobile. Le frontend React se trouve dans `JDC/`, le backend PHP dans `htdocs/`.

## Commandes

Toutes les commandes s'exécutent depuis le dossier `JDC/` :

```bash
npm run dev          # Serveur de développement (Vite, port 5173)
npm run build        # Build production
npm run build:clean  # Nettoie dist + node_modules/.vite, puis build
npm run lint         # ESLint
npm run preview      # Prévisualiser le build
```

Pour le développement local avec le backend PHP :

```bash
# Dans htdocs/, lancer un serveur PHP sur le port 8000
php -S localhost:8000 -t htdocs/
```

## Déploiement

```bash
./deploy.sh   # Build + copie dist → htdocs/ + commit + push origin + push gandi + déploie
```

Le dossier `htdocs/` est ce que Gandi sert. Après un `npm run build`, copier `JDC/dist/*` dans `htdocs/`.

- Remote `origin` : GitHub
- Remote `gandi` : Gandi (déploiement SSH)

## Architecture

```
Spider-VO (XML) → PHP Sync → MySQL Gandi → API PHP → React Frontend
```

### Frontend (`JDC/src/`)

- **`App.jsx`** : Routeur React. Routes publiques + routes admin (`/admin/*`).
- **`Pages/`** : Pages principales — `Home`, `Vehicles`, `VehicleDetail`, `Contact`, `TradeIn`, `Administrative`, ainsi que les pages admin (`AdminLanding`, `AdminVehicles`, `AdminCarteGrise`).
- **`Components/`** : Composants partagés — `Layout`, `VehicleCard`, `VehicleListItem`, `HeroSlider`, `AdminShell`, `AdminErrorBoundary`, etc.
- **`api/vehiclesClient.js`** : Client HTTP vers l'API PHP véhicules. En dev, pointe vers `localhost:8000/api` ; en prod, vers `https://www.jdcauto.fr/api`.
- **`api/adminClient.js`** : Client HTTP vers l'API admin PHP (`/api/index.php?action=...`). Gère le token CSRF (header `X-CSRF-Token` sur les POST).
- **`hooks/`** : Hooks React (`useHeroScroll`, `useParallax`, `useScrollAnimation`, `use-mobile`).
- **`data/`** : Données statiques pour la page carte grise (`carteGriseContent.js`, `carteGrisePricing.js`).
- **`ui/`** : Composants UI basés sur Radix UI / shadcn (répertoire généré, ne pas modifier manuellement).

Stack : React 19, React Router 7, TanStack Query, Tailwind CSS 3, Radix UI, Vite 7.

### Backend (`htdocs/`)

- **`htdocs/api/index.php`** : Point d'entrée unique de l'API REST PHP (`?action=...`). Contient la config MySQL Gandi, la gestion de session admin, et le token CSRF.
- **`htdocs/sync/`** : Scripts PHP de synchronisation du flux XML Spider-VO vers MySQL.
- **`htdocs/config/`** : Configuration locale (ex. `admin_auth.local.php` non versionné pour les credentials admin).
- **`htdocs/uploads/`** : Fichiers uploadés (documents carte grise, etc.).

### Admin

L'espace admin (`/admin`) utilise une session PHP côté serveur. Le login appelle `?action=admin_login`, puis les requêtes sensibles envoient `X-CSRF-Token`. Les credentials par défaut sont configurables via `ADMIN_USERNAME` / `ADMIN_PASSWORD_HASH` ou `htdocs/config/admin_auth.local.php` (non versionné).

## Points importants

- Le build React produit des assets dans `JDC/dist/`. Ce dossier est **commité** (nécessaire pour Gandi).
- `htdocs/` reflète le contenu de `JDC/dist/` après déploiement.
- Les photos des véhicules proviennent de Spider-VO (URLs externes).
- La synchronisation Spider-VO est planifiée via cron sur le serveur Gandi (quotidien à 6h).
