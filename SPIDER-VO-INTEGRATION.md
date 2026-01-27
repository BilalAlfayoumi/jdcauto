# 🚗 Guide d'intégration Spider-VO - JDC Auto

Ce guide détaille l'intégration complète du flux XML Spider-VO dans votre site JDC Auto hébergé chez Gandi.

## 📋 Vue d'ensemble

**AVANT :** Site avec données fictives/mock  
**APRÈS :** Site connecté au stock réel Spider-VO via API PHP/MySQL

### Architecture finale :
```
Spider-VO (XML) → Script PHP Sync → MySQL Gandi → API PHP → React Frontend
```

---

## 🔧 Étape 1: Configuration Base de Données Gandi

### 1.1 Accès à votre base MySQL Gandi

1. **Interface Gandi** → **Hébergement Web** → **www.jdcauto.fr**
2. **Base de données** → **MySQL**
3. **Noter les informations** :
   - Host : `mysql-xxxxx.gpaas.net`
   - Base : `votre-nom-base`
   - User : `votre-user`
   - Password : `votre-password`

### 1.2 Mise à jour configuration

**Fichier à modifier :** `htdocs/api/index.php`

```php
// ⚠️ REMPLACER par vos vraies informations Gandi
const DB_HOST = 'mysql-xxxxx.gpaas.net';  // Votre host MySQL
const DB_NAME = 'votre-nom-base';          // Nom de votre base
const DB_USER = 'votre-user';              // Votre utilisateur
const DB_PASS = 'votre-password';          // Votre mot de passe
```

---

## 🚀 Étape 2: Installation et Test

### 2.1 Déployer les fichiers backend

**Fichiers à uploader sur Gandi** (via FTP ou interface) :

```
htdocs/
├── api/
│   └── index.php              (API REST pour React)
├── install/
│   └── setup.php              (Script d'installation)
└── sync/
    ├── spider_vo_sync.php     (Script de synchronisation)
    └── test_sync.php          (Test du parsing XML)
```

### 2.2 Exécuter l'installation

1. **Aller sur :** `https://www.jdcauto.fr/install/setup.php`
2. **Suivre les étapes** automatiques :
   - ✅ Création base de données
   - ✅ Création des tables
   - ✅ Import des données de test  
   - ✅ Test de l'API
3. **⚠️ Supprimer** le dossier `install/` après succès

### 2.3 Test API

**URL de test :** `https://www.jdcauto.fr/api/index.php?action=vehicles&limit=5`

**Réponse attendue :**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "marque": "RENAULT",
      "modele": "CAPTUR", 
      "prix_vente": "9790.00",
      "etat": "Disponible"
    }
  ]
}
```

---

## 🔄 Étape 3: Synchronisation Spider-VO

### 3.1 Configuration du flux XML

**Fichier :** `htdocs/sync/spider_vo_sync.php`

```php
// ⚠️ Remplacer par votre vraie URL Spider-VO
const XML_FEED_URL = 'https://www.spider-vo.com/votre-flux.xml';
```

### 3.2 Test de synchronisation manuelle

1. **Aller sur :** `https://www.jdcauto.fr/sync/test_sync.php`
2. **Vérifier** que les véhicules s'importent correctement
3. **Noter** les statistiques de synchronisation

### 3.3 Automatisation (Cron Job)

**Dans l'interface Gandi** → **Tâches planifiées** → **Ajouter** :

```bash
# Synchronisation quotidienne à 6h du matin
0 6 * * * /usr/bin/php /srv/data/web/vhosts/www.jdcauto.fr/htdocs/sync/spider_vo_sync.php
```

---

## ⚛️ Étape 4: Modification Front-end React

### 4.1 Mise à jour déjà effectuée

✅ **Fichier modifié :** `JDC/src/api/base44Client.js`
- Suppression des données mock
- Interface avec API PHP réelle
- Mode dégradé en cas d'erreur

### 4.2 Rebuild et déploiement React

```bash
cd JDC
npm run build
cd ..
cp -r JDC/dist/* htdocs/
git add -A
git commit -m "Intégration Spider-VO: Remplacement données mock par API réelle"
git push gandi master
ssh a1ec35a4-fabe-11f0-b829-00163e816020@git.sd3.gpaas.net deploy www.jdcauto.fr.git
```

---

## 🧪 Étape 5: Tests de Production

### 5.1 Test intégration complète

1. **Page d'accueil** → Vérifier que les véhicules réels s'affichent
2. **Page véhicules** → Test filtres marque/modèle/prix  
3. **Recherche** → Test barre de recherche mobile
4. **Performance** → Temps de chargement acceptable

### 5.2 Vérifications critiques

- ✅ **Plus de données fictives** affichées
- ✅ **Prix réels** formatés correctement (toLocaleString)
- ✅ **Photos** véhicules depuis Spider-VO
- ✅ **Stock à jour** avec statut Disponible/Réservé
- ✅ **Filtres fonctionnels** marque/modèle/prix

---

## 📊 Étape 6: Monitoring et Maintenance

### 6.1 Surveillance synchronisation

**URL monitoring :** `https://www.jdcauto.fr/api/index.php?action=stats`

**Surveiller :**
- Dernière synchronisation réussie
- Nombre de véhicules disponibles
- Erreurs de parsing XML

### 6.2 Logs de synchronisation

**Fichier :** `htdocs/sync/logs/sync.log`  
**Consulter** régulièrement pour détecter les erreurs

---

## 🔒 Étape 7: Sécurisation

### 7.1 Suppression fichiers sensibles

```bash
# ⚠️ OBLIGATOIRE après installation
rm -rf htdocs/install/
```

### 7.2 Protection des fichiers sync

**Fichier :** `htdocs/sync/.htaccess`
```apache
# Bloquer accès web aux scripts de sync
Deny from all
```

---

## 🚨 Résolution des problèmes courants

### Erreur "Connexion base de données échouée"
- ✅ Vérifier paramètres MySQL Gandi
- ✅ Tester depuis phpMyAdmin Gandi
- ✅ Vérifier permissions utilisateur

### Erreur "Flux XML inaccessible"  
- ✅ Vérifier URL Spider-VO
- ✅ Contrôler whitelist IP chez Spider-VO
- ✅ Tester avec curl depuis serveur Gandi

### Véhicules ne s'affichent pas côté React
- ✅ Tester API: `/api/index.php?action=vehicles`
- ✅ Vérifier Console F12 pour erreurs CORS
- ✅ Contrôler format données JSON

### Performance lente
- ✅ Ajouter index MySQL manquants
- ✅ Optimiser requêtes avec EXPLAIN
- ✅ Mettre en cache côté PHP

---

## ✅ Checklist de validation finale

- [ ] **Base MySQL créée** et tables présentes
- [ ] **API PHP** accessible et répond JSON correct
- [ ] **Synchronisation** fonctionne avec XML réel
- [ ] **Front-end React** affiche véhicules réels
- [ ] **Recherche mobile** utilise vraies données
- [ ] **Filtres** marque/modèle fonctionnels
- [ ] **Prix formatage** correct (pas d'erreur toLocaleString)
- [ ] **Photos** véhicules chargées depuis Spider-VO
- [ ] **Cron job** configuré pour sync automatique
- [ ] **Données mock** complètement supprimées
- [ ] **Logs** de sync activés et surveillés
- [ ] **Fichiers install/** supprimés

---

## 🎯 Résultat final attendu

**Un site JDC Auto professionnel** avec :

- ✅ **Stock réel Spider-VO** toujours à jour
- ✅ **Performance optimale** (base MySQL locale)
- ✅ **SEO préservé** (pas de requêtes client-side)
- ✅ **Robustesse** (mode dégradé en cas d'erreur)
- ✅ **Optimisations mobile** conservées
- ✅ **Architecture maintenable** PHP/MySQL/React

**Votre site affichera automatiquement tous les véhicules réels de votre stock, avec mise à jour quotidienne !** 🌟

---

*Dernière mise à jour: 27 janvier 2026*
