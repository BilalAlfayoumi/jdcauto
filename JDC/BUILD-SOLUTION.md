# Solution pour éviter les blocages de build avec iCloud Drive

## Problème
Le build se bloque fréquemment à cause d'iCloud Drive qui ralentit les opérations de fichiers.

## Solutions

### Solution 1 : Script de build optimisé (Recommandé)
Utilisez le script `build-and-deploy.sh` qui gère mieux les blocages :

```bash
cd JDC
./build-and-deploy.sh
```

Ce script :
- Nettoie les caches avant le build
- Utilise des options optimisées (mémoire, workers)
- Gère les timeouts
- Copie automatiquement dans htdocs
- Commit et déploie automatiquement

### Solution 2 : Build directement sur le serveur
Au lieu de build localement, vous pouvez push le code source et laisser le serveur Gandi faire le build :

```bash
# 1. Commit les modifications sources
git add JDC/src/
git commit -m "Vos modifications"
git push gandi master

# 2. Le serveur Gandi build automatiquement lors du déploiement
ssh a1ec35a4-fabe-11f0-b829-00163e816020@git.sd3.gpaas.net deploy www.jdcauto.fr.git
```

**Note** : Cette méthode nécessite que le serveur Gandi ait Node.js et npm installés.

### Solution 3 : Copier le projet hors d'iCloud Drive (Temporaire)
Pour les builds importants, copiez temporairement le projet hors d'iCloud :

```bash
# Copier hors d'iCloud
cp -r ~/Library/Mobile\ Documents/com~apple~CloudDocs/jdcauto ~/jdcauto-temp

# Build dans le dossier temporaire
cd ~/jdcauto-temp/JDC
npm run build

# Copier le résultat dans le projet iCloud
cp -r dist/* ~/Library/Mobile\ Documents/com~apple~CloudDocs/jdcauto/htdocs/

# Nettoyer
rm -rf ~/jdcauto-temp
```

### Solution 4 : Build en arrière-plan
Lancez le build en arrière-plan et laissez-le tourner :

```bash
cd JDC
nohup npm run build > build.log 2>&1 &
```

Puis vérifiez le résultat plus tard :
```bash
tail -f build.log
```

## Recommandation
Pour les modifications banales, utilisez **Solution 2** (build sur le serveur) pour éviter les blocages locaux.

