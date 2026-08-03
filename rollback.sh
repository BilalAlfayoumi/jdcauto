#!/bin/bash

# Script de rollback : restaure le site tel qu'il était à un déploiement précédent.
# Usage:
#   ./rollback.sh              → restaure l'avant-dernier tag deploy-*
#   ./rollback.sh deploy-XXXX  → restaure le tag indiqué
#
# Crée un nouveau commit (l'historique avance, rien n'est réécrit),
# puis push vers Gandi et déploie.

set -e

cd "$(dirname "$0")"

# Lister les tags de déploiement disponibles
TAGS=$(git tag -l 'deploy-*' --sort=-creatordate)

if [ -z "$TAGS" ]; then
    echo "❌ Aucun tag de déploiement trouvé (deploy-*)."
    echo "   Les tags sont créés automatiquement par ./deploy.sh"
    exit 1
fi

echo "📋 Derniers déploiements:"
echo "$TAGS" | head -10

if [ -n "$1" ]; then
    TARGET_TAG="$1"
    if ! git rev-parse "$TARGET_TAG" >/dev/null 2>&1; then
        echo "❌ Tag introuvable: $TARGET_TAG"
        exit 1
    fi
else
    # Sans argument : avant-dernier déploiement (le dernier étant celui qui pose problème)
    TARGET_TAG=$(echo "$TAGS" | sed -n '2p')
    if [ -z "$TARGET_TAG" ]; then
        echo "❌ Un seul déploiement taggé, impossible de déterminer le précédent."
        echo "   Précisez le tag: ./rollback.sh <tag>"
        exit 1
    fi
fi

echo ""
echo "⏪ Rollback vers: $TARGET_TAG ($(git log -1 --format='%ci' "$TARGET_TAG"))"
read -p "Confirmer le rollback? (y/n) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    exit 1
fi

# Restaurer l'arborescence complète du tag (nouveau commit, pas de réécriture d'historique)
git checkout "$TARGET_TAG" -- .
git add -A

if git diff --staged --quiet; then
    echo "ℹ️  Aucune différence avec $TARGET_TAG — rien à restaurer."
    exit 0
fi

git commit -m "Rollback: restauration de $TARGET_TAG"

CURRENT_BRANCH=$(git branch --show-current)

echo "⬆️  Push vers GitHub..."
git push origin "$CURRENT_BRANCH" || echo "⚠️  Erreur push GitHub (peut être ignorée)"

echo "⬆️  Push vers Gandi..."
git push gandi "$CURRENT_BRANCH"

echo "🚀 Déploiement sur le serveur..."
ssh a1ec35a4-fabe-11f0-b829-00163e816020@git.sd3.gpaas.net deploy www.jdcauto.fr.git

echo "✅ Rollback terminé — le site est revenu à l'état de $TARGET_TAG"
echo "🌐 Vérifiez https://www.jdcauto.fr"
