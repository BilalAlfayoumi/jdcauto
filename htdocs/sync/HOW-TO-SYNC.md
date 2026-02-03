# 🔄 Comment lancer la synchronisation Spider-VO

## 🚀 Méthode 1 : Synchronisation manuelle (via navigateur)

**C'est la méthode la plus simple !**

1. **Ouvrez votre navigateur**
2. **Accédez à cette URL :**
   ```
   https://www.jdcauto.fr/sync/spider_vo_sync.php
   ```
3. **Attendez la fin de la synchronisation** (quelques secondes à quelques minutes selon le nombre de véhicules)
4. **Vérifiez les résultats** affichés à l'écran

**✅ Avantages :**
- Simple et rapide
- Vous voyez les résultats en temps réel
- Pas besoin de configuration

**⚠️ Note :** Vous pouvez lancer cette synchronisation aussi souvent que vous voulez. Elle mettra à jour uniquement les véhicules qui ont changé.

---

## ⏰ Méthode 2 : Synchronisation automatique (Cron Job)

Pour que la synchronisation se fasse automatiquement sans intervention :

### Option A : Via l'interface Gandi (Recommandé)

1. **Connectez-vous à votre espace Gandi**
2. **Allez dans** : Hébergement Web → www.jdcauto.fr
3. **Section** : Tâches planifiées (Cron Jobs)
4. **Cliquez sur** : Ajouter une tâche
5. **Configurez** :

**Commande :**
```bash
/usr/bin/php /srv/data/web/vhosts/www.jdcauto.fr/htdocs/sync/spider_vo_sync.php
```

**Fréquence (choisissez une option) :**
- **Quotidienne à 3h** : `0 3 * * *`
- **Toutes les 6 heures** : `0 */6 * * *`
- **Toutes les 12 heures** : `0 */12 * * *`
- **Toutes les heures** : `0 * * * *` (attention : peut surcharger le serveur)

### Option B : Via SSH

```bash
# Se connecter en SSH
ssh a1ec35a4-fabe-11f0-b829-00163e816020@git.sd3.gpaas.net

# Éditer crontab
crontab -e

# Ajouter cette ligne (synchronisation quotidienne à 3h)
0 3 * * * /usr/bin/php /srv/data/web/vhosts/www.jdcauto.fr/htdocs/sync/spider_vo_sync.php >> /srv/data/web/vhosts/www.jdcauto.fr/logs/sync.log 2>&1
```

---

## 📊 Vérification après synchronisation

### 1. Vérifier sur le site
- Accédez à : `https://www.jdcauto.fr`
- Allez sur la page "Acheter nos véhicules d'occasion"
- Vérifiez que tous les véhicules sont affichés (y compris les vendus avec badge "VENDU")

### 2. Vérifier via l'API
- Accédez à : `https://www.jdcauto.fr/api/index.php?action=vehicles&limit=100`
- Vérifiez que les véhicules avec différents états sont présents

### 3. Vérifier les statistiques
- Accédez à : `https://www.jdcauto.fr/api/check_vehicles.php`
- Consultez les statistiques détaillées

---

## ⚙️ Configuration du flux XML Spider-VO

Le script utilise l'URL configurée dans `spider_vo_sync.php` (ligne 26) :

```php
$spiderVoXmlUrl = 'https://www.spider-vo.net/export,st2div6b0860458b-fbb07722e1-03df2748e1-6e82247ae0.html';
```

**Si vous devez changer cette URL :**
1. Modifiez le fichier `htdocs/sync/spider_vo_sync.php`
2. Remplacez l'URL à la ligne 26
3. Déployez les modifications

---

## 🔍 Que fait la synchronisation ?

✅ **Importe tous les véhicules** du flux XML Spider-VO (disponibles, vendus, réservés)
✅ **Met à jour** les véhicules existants (par référence)
✅ **Ajoute** les nouveaux véhicules
✅ **Importe** toutes les photos associées
✅ **Préserve** l'état des véhicules (Vendu, Réservé, Disponible)
✅ **Affiche** les véhicules vendus avec le badge "VENDU" sur le site

---

## ❓ Questions fréquentes

**Q : Combien de temps prend la synchronisation ?**
R : Quelques secondes à quelques minutes selon le nombre de véhicules (généralement 1-2 minutes pour 50 véhicules).

**Q : Puis-je lancer la synchronisation plusieurs fois par jour ?**
R : Oui, vous pouvez la lancer aussi souvent que vous voulez. Elle ne fait que mettre à jour les données.

**Q : Les véhicules vendus seront-ils supprimés ?**
R : Non, les véhicules vendus restent dans la base de données et sont affichés avec le badge "VENDU".

**Q : Que se passe-t-il si un véhicule n'est plus dans le flux XML Spider-VO ?**
R : Le véhicule reste dans la base de données avec son dernier état connu. Il n'est pas supprimé automatiquement.

---

## 🆘 En cas de problème

Si la synchronisation échoue :
1. Vérifiez que l'URL Spider-VO est correcte
2. Vérifiez les logs d'erreur dans l'interface Gandi
3. Testez manuellement via l'URL : `https://www.jdcauto.fr/sync/spider_vo_sync.php`
4. Contactez le support si le problème persiste

