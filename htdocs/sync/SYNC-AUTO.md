# 🔄 Synchronisation Automatique Spider-VO

## 📋 Comment ça fonctionne

Lorsqu'un client ajoute une voiture sur son compte Spider-VO, elle sera **automatiquement importée** sur votre site si vous configurez un **Cron Job**.

## ⚙️ Configuration Requise

### 1. Obtenir l'URL du flux XML Spider-VO

1. Connectez-vous à votre compte Spider-VO
2. Allez dans **Paramètres** → **Export/Flux XML**
3. Copiez l'URL du flux XML (ex: `https://votre-compte.spider-vo.com/export.xml`)
4. Cette URL contient **tous les véhicules** de votre compte, mis à jour en temps réel

### 2. Configurer l'URL dans le script

**Fichier :** `htdocs/sync/spider_vo_sync.php`

**Ligne 20 :** Remplacez :
```php
$spiderVoXmlUrl = 'https://votre-compte.spider-vo.com/export.xml';
```

Par votre vraie URL Spider-VO.

### 3. Configurer le Cron Job sur Gandi

#### Option A : Via l'interface Gandi (Recommandé)

1. Connectez-vous à votre espace Gandi
2. Allez dans **Hébergement Web** → **www.jdcauto.fr**
3. Section **Tâches planifiées (Cron Jobs)**
4. Cliquez sur **Ajouter une tâche**
5. Configurez :

**Commande :**
```bash
/usr/bin/php /srv/data/web/vhosts/www.jdcauto.fr/htdocs/sync/spider_vo_sync.php
```

**Fréquence :**
- **Quotidienne à 3h** : `0 3 * * *`
- **Toutes les 6 heures** : `0 */6 * * *`
- **Toutes les heures** : `0 * * * *`

#### Option B : Via SSH

```bash
# Se connecter en SSH
ssh a1ec35a4-fabe-11f0-b829-00163e816020@git.sd3.gpaas.net

# Éditer crontab
crontab -e

# Ajouter cette ligne (synchronisation quotidienne à 3h)
0 3 * * * /usr/bin/php /srv/data/web/vhosts/www.jdcauto.fr/htdocs/sync/spider_vo_sync.php >> /srv/data/web/vhosts/www.jdcauto.fr/logs/sync.log 2>&1
```

## 🔄 Fonctionnement

1. **Le Cron Job s'exécute** à l'heure configurée
2. **Le script charge** le flux XML depuis Spider-VO
3. **Le script compare** avec la base de données
4. **Nouveaux véhicules** → Ajoutés automatiquement
5. **Véhicules modifiés** → Mis à jour automatiquement
6. **Photos** → Importées automatiquement

## 📊 Vérification

### Tester manuellement

**URL :** `https://www.jdcauto.fr/sync/spider_vo_sync.php`

Cette page affiche le résultat de la synchronisation.

### Vérifier les logs

Si vous avez configuré les logs (Option B), consultez :
```bash
tail -f /srv/data/web/vhosts/www.jdcauto.fr/logs/sync.log
```

### Vérifier les véhicules

**API :** `https://www.jdcauto.fr/api/index.php?action=vehicles&limit=10`

## ⚠️ Important

1. **URL Spider-VO** : Doit être configurée dans `spider_vo_sync.php`
2. **Cron Job** : Doit être configuré pour que ce soit automatique
3. **Fréquence** : Recommandé 1 fois par jour (évite surcharge serveur)
4. **Sécurité** : L'URL Spider-VO peut nécessiter une authentification

## 🔐 Authentification Spider-VO (si nécessaire)

Si votre flux XML nécessite une authentification, modifiez le script :

```php
$context = stream_context_create([
    'http' => [
        'timeout' => 300,
        'user_agent' => 'JDC-Auto-Sync/1.0',
        'header' => [
            'Authorization: Basic ' . base64_encode('username:password')
        ]
    ]
]);
```

## 📝 Résumé

✅ **Avec Cron Job configuré** : Les nouvelles voitures sont importées automatiquement  
❌ **Sans Cron Job** : Il faut exécuter manuellement `spider_vo_sync.php`

