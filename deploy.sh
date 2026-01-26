#!/bin/bash

# Script de déploiement pour Gandi
# Usage: ./deploy.sh

set -e  # Arrêter en cas d'erreur

echo "🚀 Début du déploiement..."

# Aller dans le dossier du projet
cd "$(dirname "$0")/JDC"

# Vérifier que nous sommes sur la branche main
CURRENT_BRANCH=$(git branch --show-current)
if [ "$CURRENT_BRANCH" != "main" ]; then
    echo "⚠️  Vous n'êtes pas sur la branche main. Branche actuelle: $CURRENT_BRANCH"
    read -p "Continuer quand même? (y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

# Build du projet
echo "📦 Construction du projet..."
npm run build

# Retourner à la racine pour les commits Git
cd ..

# Ajouter les fichiers modifiés
echo "📝 Ajout des fichiers modifiés..."
git add -A

# Vérifier s'il y a des changements à committer
if git diff --staged --quiet; then
    echo "ℹ️  Aucun changement à committer."
else
    echo "💾 Commit des changements..."
    git commit -m "Deploy: $(date +'%Y-%m-%d %H:%M:%S')" || echo "Aucun changement à committer"
fi

# Push vers GitHub (origin)
echo "⬆️  Push vers GitHub..."
git push origin main || echo "⚠️  Erreur lors du push vers GitHub (peut être ignorée)"

# Push vers Gandi
echo "⬆️  Push vers Gandi..."
git push gandi main || {
    echo "❌ Erreur lors du push vers Gandi"
    exit 1
}

# Déploiement sur le serveur Gandi
echo "🚀 Déploiement sur le serveur..."
ssh a1ec35a4-fabe-11f0-b829-00163e816020@git.sd3.gpaas.net deploy jdcauto.fr.git || {
    echo "❌ Erreur lors du déploiement"
    exit 1
}

echo "✅ Déploiement terminé avec succès!"
echo "🌐 Votre site devrait être disponible sur https://jdcauto.fr"

