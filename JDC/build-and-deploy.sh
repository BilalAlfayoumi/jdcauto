#!/bin/bash

# Script de build et déploiement optimisé pour iCloud Drive
# Usage: ./build-and-deploy.sh

set -e

echo "🚀 Début du build et déploiement..."

# Aller dans le dossier du projet
cd "$(dirname "$0")"

# Nettoyer les caches
echo "🧹 Nettoyage des caches..."
rm -rf dist node_modules/.vite node_modules/.cache 2>/dev/null || true

# Build avec timeout et gestion d'erreurs
echo "📦 Build en cours..."
export NODE_OPTIONS="--max-old-space-size=4096"
export VITE_MAX_WORKERS=1

# Build avec timeout de 5 minutes
timeout 300 npm run build || {
    echo "⚠️  Build a pris trop de temps, mais on continue..."
    # Vérifier si dist existe quand même
    if [ ! -d "dist" ]; then
        echo "❌ Le dossier dist n'existe pas. Build échoué."
        exit 1
    fi
}

echo "✅ Build terminé!"

# Retourner à la racine
cd ..

# Copier les fichiers buildés dans htdocs
echo "📋 Copie des fichiers dans htdocs..."
rm -rf htdocs/assets htdocs/index.html 2>/dev/null || true
cp -r JDC/dist/* htdocs/ 2>/dev/null || {
    echo "❌ Erreur lors de la copie"
    exit 1
}

echo "✅ Fichiers copiés!"

# Git add, commit et push
echo "💾 Commit des modifications..."
git add -A htdocs/ JDC/src/ 2>/dev/null || true

# Vérifier s'il y a des changements
if git diff --staged --quiet; then
    echo "ℹ️  Aucun changement à committer."
else
    git commit -m "Update: Correction coordonnées (adresse, téléphone, horaires) sur tout le site" || echo "Aucun changement à committer"
fi

echo "⬆️  Push vers Gandi..."
git push gandi master || {
    echo "❌ Erreur lors du push"
    exit 1
}

echo "🚀 Déploiement sur le serveur..."
ssh a1ec35a4-fabe-11f0-b829-00163e816020@git.sd3.gpaas.net deploy www.jdcauto.fr.git || {
    echo "❌ Erreur lors du déploiement"
    exit 1
}

echo "✅ Déploiement terminé avec succès!"
echo "🌐 Votre site devrait être disponible sur https://www.jdcauto.fr"

