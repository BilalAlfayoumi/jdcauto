# Guide d'optimisation du build

## Problème résolu
Le build se bloquait à cause de iCloud Drive qui ralentit les opérations de fichiers.

## Solutions implémentées

### 1. Configuration Vite optimisée (`vite.config.js`)
- ✅ Désactivation du sourcemap en production
- ✅ Limitation des chunks manuels
- ✅ Exclusion des dossiers inutiles du watch
- ✅ Optimisation des dépendances

### 2. Scripts npm optimisés (`package.json`)
- `npm run build` - Build standard avec plus de mémoire
- `npm run build:fast` - Build rapide
- `npm run build:clean` - Nettoyage + build

### 3. Script shell (`build-optimized.sh`)
Script de build avec nettoyage automatique et gestion d'erreurs.

## Utilisation

### Option 1 : Build standard (recommandé)
```bash
cd JDC
npm run build
```

### Option 2 : Build avec nettoyage
```bash
cd JDC
npm run build:clean
```

### Option 3 : Script optimisé
```bash
cd JDC
./build-optimized.sh
```

## Si le build se bloque encore

1. **Vérifier les processus Node**
   ```bash
   ps aux | grep node
   ```

2. **Tuer les processus bloqués**
   ```bash
   pkill -f "vite build"
   ```

3. **Nettoyer complètement**
   ```bash
   cd JDC
   rm -rf node_modules/.vite dist
   npm run build:clean
   ```

4. **Alternative : Build sur le serveur**
   Les modifications sont automatiquement buildées lors du déploiement :
   ```bash
   git push gandi master
   ssh a1ec35a4-fabe-11f0-b829-00163e816020@git.sd3.gpaas.net deploy www.jdcauto.fr.git
   ```

## Optimisations appliquées

- ✅ Limitation mémoire Node.js (4GB)
- ✅ Workers Vite limités à 1
- ✅ Exclusion des dossiers inutiles
- ✅ Chunking optimisé
- ✅ Sourcemap désactivé en production

## Notes

- Le build peut prendre 2-5 minutes avec iCloud Drive
- Si le build se bloque, utilisez l'option "build sur serveur"
- Les fichiers sont automatiquement synchronisés avec iCloud

