# ⚙️ Configuration Anacron pour Synchronisation Spider-VO

## 📋 Instructions Complètes

### Étape 1 : Accéder au fichier anacrontab

Vous avez **3 options** pour modifier le fichier :

#### Option A : Via le Panneau de Contrôle (Recommandé)

1. Connectez-vous à votre espace Gandi
2. Allez dans **Hébergement Web** → **www.jdcauto.fr**
3. Section **Administration et Sécurité**
4. Cliquez sur **Panneau de contrôle**
5. Rubrique **Cron** → **Edit scheduled tasks**

#### Option B : Via Console d'urgence

1. Connectez-vous à la **Console d'urgence** (section Administration et Sécurité)
2. Le fichier se trouve à : `/srv/data/etc/cron/anacrontab`
3. Éditez avec `nano` ou `vim` :
   ```bash
   nano /srv/data/etc/cron/anacrontab
   ```

#### Option C : Via SFTP

1. Connectez-vous en SFTP
2. Téléchargez le fichier : `/lamp0/etc/cron/anacrontab`
3. Éditez localement
4. Retéléversez le fichier

---

### Étape 2 : Ajouter la ligne de synchronisation

Ajoutez cette ligne à la fin de votre fichier `anacrontab` :

```bash
@daily 0 spider_vo_sync php -f /srv/data/web/vhosts/www.jdcauto.fr/htdocs/sync/spider_vo_sync.php
```

**Explication :**
- `@daily` : Exécution une fois par jour
- `0` : Timeout (ignoré par Gandi, mais requis)
- `spider_vo_sync` : Nom unique de la tâche
- `php -f` : Commande PHP pour exécuter le script
- `/srv/data/web/vhosts/www.jdcauto.fr/htdocs/sync/spider_vo_sync.php` : Chemin complet du script

---

### Étape 3 : Exemple de fichier anacrontab complet

Voici à quoi devrait ressembler votre fichier après ajout :

```bash
# For additional examples and more information regarding Anacron Tasks, please refer to our documentation :
#
# [EN] https://docs.gandi.net/en/simple_hosting/common_operations/anacron.html
# [FR] https://docs.gandi.net/fr/simple_hosting/operations_courantes/anacron.html
#
# Basic Syntax:
#
# num@period  delay(unused) name script...
#
# uncomment to purge files older than 7days in TMP
#1@daily 0 purgetmp find /srv/data/tmp -type f -mtime +7 -delete > /dev/null
#
# uncomment to export all mysql databases every day, and keep each export for one week.
#1@daily 0 mysql_backup mkdir -p /srv/data/home/mysql_backup ; mysqldump -u root --all-databases | /bin/gzip -9 > /srv/data/home/mysql_backup/`date '+%F'`.databases.sql.gz ; find /srv/data/home/mysql_backup -name '*.databases.sql.gz' -mtime +7 -delete

# Synchronisation Spider-VO - Import automatique des véhicules
@daily 0 spider_vo_sync php -f /srv/data/web/vhosts/www.jdcauto.fr/htdocs/sync/spider_vo_sync.php
```

---

## ⏰ Options de Fréquence

### Synchronisation quotidienne (recommandé)
```bash
@daily 0 spider_vo_sync php -f /srv/data/web/vhosts/www.jdcauto.fr/htdocs/sync/spider_vo_sync.php
```
**Exécution :** Une fois par jour

### Toutes les 6 heures
```bash
6@hourly 0 spider_vo_sync php -f /srv/data/web/vhosts/www.jdcauto.fr/htdocs/sync/spider_vo_sync.php
```
**Exécution :** 4 fois par jour (toutes les 6h)

### Toutes les 12 heures
```bash
12@hourly 0 spider_vo_sync php -f /srv/data/web/vhosts/www.jdcauto.fr/htdocs/sync/spider_vo_sync.php
```
**Exécution :** 2 fois par jour (toutes les 12h)

### Toutes les heures (attention : peut surcharger le serveur)
```bash
1@hourly 0 spider_vo_sync php -f /srv/data/web/vhosts/www.jdcauto.fr/htdocs/sync/spider_vo_sync.php
```
**Exécution :** 24 fois par jour

---

## ✅ Vérification

### Tester manuellement avant de configurer Anacron

1. **Test direct :**
   ```
   https://www.jdcauto.fr/sync/spider_vo_sync.php
   ```

2. **Vérifier les résultats :**
   - Les véhicules sont importés/mis à jour
   - Les photos sont synchronisées
   - Aucune erreur dans les logs

### Vérifier que la tâche Anacron fonctionne

1. **Attendre la première exécution** (selon la fréquence configurée)
2. **Vérifier les véhicules sur le site :** `https://www.jdcauto.fr`
3. **Vérifier l'API :** `https://www.jdcauto.fr/api/index.php?action=vehicles&limit=5`

---

## ⚠️ Important

1. **Processus limités :** Sur un hébergement de taille S (2 processus max), la tâche anacron occupe un processus. Évitez de configurer trop de tâches simultanées.

2. **Intervalle minimum :** 1 heure (avec la version modifiée d'anacron de Gandi)

3. **Logs :** Les erreurs PHP seront visibles dans les logs Apache de Gandi

4. **Sécurité :** Le script `spider_vo_sync.php` est sécurisé et peut être exécuté automatiquement

---

## 🔧 Dépannage

### La synchronisation ne s'exécute pas

1. **Vérifier la syntaxe** du fichier `anacrontab`
2. **Vérifier les permissions** du script PHP
3. **Tester manuellement** le script via l'URL
4. **Vérifier les logs** Apache pour les erreurs

### Erreur "Permission denied"

Le script doit être accessible en lecture :
```bash
chmod 644 /srv/data/web/vhosts/www.jdcauto.fr/htdocs/sync/spider_vo_sync.php
```

### Erreur "File not found"

Vérifiez que le chemin est correct :
```bash
ls -la /srv/data/web/vhosts/www.jdcauto.fr/htdocs/sync/spider_vo_sync.php
```

---

## 📝 Résumé

✅ **Configuration requise :**
1. Ajouter la ligne dans `anacrontab`
2. Choisir la fréquence (`@daily` recommandé)
3. Sauvegarder le fichier
4. Attendre la première exécution

✅ **Résultat :**
- Synchronisation automatique des véhicules Spider-VO
- Nouvelles voitures importées automatiquement
- Mises à jour automatiques
- Photos synchronisées

