#!/bin/bash

# Script pour build hors d'iCloud Drive
set -e

echo "🚀 Build hors d'iCloud Drive..."

# Créer un dossier temporaire
TEMP_DIR="/tmp/jdcauto-build-$$"
echo "📦 Copie du projet dans $TEMP_DIR..."

# Copier uniquement ce qui est nécessaire pour le build
mkdir -p "$TEMP_DIR/JDC"
cd "/Users/bilalfym/Library/Mobile Documents/com~apple~CloudDocs/jdcauto"

# Copier les fichiers nécessaires
cp -r JDC/package*.json "$TEMP_DIR/JDC/"
cp -r JDC/vite.config.js "$TEMP_DIR/JDC/"
cp -r JDC/tailwind.config.js "$TEMP_DIR/JDC/"
cp -r JDC/postcss.config.js "$TEMP_DIR/JDC/"
cp -r JDC/index.html "$TEMP_DIR/JDC/"
cp -r JDC/src "$TEMP_DIR/JDC/"
cp -r JDC/public "$TEMP_DIR/JDC/" 2>/dev/null || true

echo "✅ Copie terminée"

# Installer les dépendances et build
cd "$TEMP_DIR/JDC"
echo "📦 Installation des dépendances..."
npm install --silent 2>&1 | tail -5

echo "🔨 Build en cours..."
NODE_OPTIONS="--max-old-space-size=4096" VITE_MAX_WORKERS=1 npm run build

# Vérifier que le build a réussi
if [ ! -f "dist/index.html" ]; then
    echo "❌ Build échoué!"
    rm -rf "$TEMP_DIR"
    exit 1
fi

echo "✅ Build terminé!"

# Copier les fichiers buildés dans htdocs
cd "/Users/bilalfym/Library/Mobile Documents/com~apple~CloudDocs/jdcauto"
echo "📋 Copie des fichiers dans htdocs..."
rm -rf htdocs/assets htdocs/index.html
cp -r "$TEMP_DIR/JDC/dist"/* htdocs/

echo "✅ Fichiers copiés!"

# Nettoyer
rm -rf "$TEMP_DIR"
echo "🧹 Nettoyage terminé"

echo "✅ Tout est prêt! Vous pouvez maintenant commit et push htdocs/"

