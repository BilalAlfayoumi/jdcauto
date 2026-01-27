# 🔄 Synchronisation Spider-VO - Guide Complet

## 📥 Import Initial

### Import des 35 véhicules depuis export.xml

**URL :** `https://www.jdcauto.fr/sync/import_spider_vo.php`

**Ce script va :**
- ✅ Parser le fichier `export.xml`
- ✅ Importer/mettre à jour les 35 véhicules
- ✅ Importer toutes les photos associées
- ✅ Afficher les statistiques détaillées

**⚠️ Important :**
- Le script remplace les véhicules fictifs par les véhicules réels
- Les véhicules existants sont mis à jour (par référence)
- Les nouveaux véhicules sont ajoutés

## 🔄 Synchronisation Automatique

### Option 1 : Cron Job Gandi (Recommandé)

**Via l'interface Gandi :**
1. Connectez-vous à votre espace Gandi
2. Allez dans **Hébergement Web** → **www.jdcauto.fr**
3. Section **Cron Jobs**
4. Créez un nouveau cron job :

```
# Synchronisation Spider-VO quotidienne à 3h du matin
0 3 * * * curl -s https://www.jdcauto.fr/sync/import_spider_vo.php > /dev/null 2>&1
```

**Ou via SSH :**
```bash
# Éditer crontab
crontab -e

# Ajouter cette ligne pour synchronisation quotidienne à 3h
0 3 * * * curl -s https://www.jdcauto.fr/sync/import_spider_vo.php > /dev/null 2>&1
```

### Option 2 : Synchronisation depuis URL Spider-VO

**Modifier le script pour utiliser l'URL Spider-VO :**

Dans `import_spider_vo.php`, remplacer :
```php
$xmlFile = __DIR__ . '/../../export.xml';
$xml = simplexml_load_file($xmlFile);
```

Par :
```php
// Charger depuis URL Spider-VO
$xmlUrl = 'https://votre-url-spider-vo.com/export.xml';
$xmlContent = file_get_contents($xmlUrl);
$xml = simplexml_load_string($xmlContent);
```

## 📊 Vérification

### Vérifier l'import

**API Test :**
- `https://www.jdcauto.fr/api/test.php` - Structure base
- `https://www.jdcauto.fr/api/index.php?action=vehicles&limit=5` - Liste véhicules

**Site :**
- `https://www.jdcauto.fr` - Vérifier affichage des véhicules

## 🔧 Configuration Avancée

### Fréquence de synchronisation

**Quotidienne (recommandé) :**
```
0 3 * * *  # Tous les jours à 3h
```

**Toutes les 6 heures :**
```
0 */6 * * *  # Toutes les 6 heures
```

**Hebdomadaire :**
```
0 3 * * 1  # Tous les lundis à 3h
```

### Logs de synchronisation

Les logs sont visibles dans :
- Interface Gandi → Logs
- Ou via SSH : `tail -f /var/log/cron.log`

## ⚠️ Sécurité

**Après import initial :**
1. ✅ Vérifier que l'import fonctionne
2. ✅ Tester l'affichage sur le site
3. ⚠️ **SUPPRIMER** le fichier `install/setup.php` (sécurité)
4. ⚠️ Protéger `sync/` avec `.htaccess` si nécessaire

## 📝 Notes

- Le script utilise une transaction pour garantir l'intégrité
- Les photos sont supprimées et réimportées à chaque sync
- Les véhicules non présents dans le XML ne sont **PAS** supprimés automatiquement
- Pour supprimer les véhicules obsolètes, utiliser un script séparé

