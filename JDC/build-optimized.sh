#!/bin/bash

# Script de build optimisé pour éviter les blocages avec iCloud Drive

set -e

echo "🧹 Nettoyage des caches..."
rm -rf dist
rm -rf node_modules/.vite
rm -rf node_modules/.cache

echo "📦 Build en cours avec optimisations..."
export NODE_OPTIONS="--max-old-space-size=4096"
export VITE_MAX_WORKERS=1

# Build avec timeout de 10 minutes
timeout 600 npm run build || {
    echo "❌ Build a pris trop de temps ou a échoué"
    echo "💡 Essayez: npm run build:clean"
    exit 1
}

echo "✅ Build terminé avec succès!"

