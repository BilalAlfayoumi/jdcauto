# 🧪 Test Rapide de Synchronisation Spider-VO

## ⚠️ Limitation Anacron Gandi

**Intervalle minimum : 1 heure**

Anacron sur Gandi ne permet pas d'exécuter des tâches plus fréquemment que toutes les heures. Pour tester rapidement, utilisez les méthodes ci-dessous.

---

## 🚀 Méthode 1 : Test Manuel via URL (Recommandé)

### Exécuter la synchronisation manuellement

**URL :** `https://www.jdcauto.fr/sync/spider_vo_sync.php`

1. Ouvrez cette URL dans votre navigateur
2. La synchronisation s'exécute immédiatement
3. Vous voyez les résultats en temps réel
4. Vous pouvez rafraîchir la page pour réexécuter

**Avantages :**
- ✅ Exécution immédiate
- ✅ Résultats visibles instantanément
- ✅ Pas de limite de fréquence
- ✅ Parfait pour les tests

---

## 🔄 Méthode 2 : Script de Test Automatique (Alternative)

Si vous voulez vraiment tester automatiquement toutes les minutes, vous pouvez créer un script JavaScript qui appelle l'URL toutes les minutes.

**⚠️ Attention :** Cette méthode n'est pas recommandée pour la production, seulement pour les tests.

### Créer un fichier de test HTML

Créez `htdocs/sync/test-auto.html` :

```html
<!DOCTYPE html>
<html>
<head>
    <title>Test Synchronisation Auto</title>
    <style>
        body { font-family: monospace; padding: 20px; }
        .status { padding: 10px; margin: 10px 0; border-radius: 5px; }
        .success { background: #d4edda; color: #155724; }
        .error { background: #f8d7da; color: #721c24; }
        .info { background: #d1ecf1; color: #0c5460; }
    </style>
</head>
<body>
    <h1>🔄 Test Synchronisation Automatique</h1>
    <div id="status"></div>
    <div id="log"></div>
    
    <script>
        let intervalId;
        let count = 0;
        
        function runSync() {
            count++;
            const statusDiv = document.getElementById('status');
            const logDiv = document.getElementById('log');
            
            statusDiv.innerHTML = `<div class="status info">⏳ Synchronisation #${count} en cours...</div>`;
            
            fetch('/sync/spider_vo_sync.php')
                .then(response => response.text())
                .then(data => {
                    const timestamp = new Date().toLocaleTimeString();
                    logDiv.innerHTML = `<div class="status success">✅ [${timestamp}] Synchronisation #${count} terminée</div>` + logDiv.innerHTML;
                    statusDiv.innerHTML = `<div class="status success">✅ Dernière sync: ${timestamp} (Total: ${count})</div>`;
                })
                .catch(error => {
                    const timestamp = new Date().toLocaleTimeString();
                    logDiv.innerHTML = `<div class="status error">❌ [${timestamp}] Erreur: ${error.message}</div>` + logDiv.innerHTML;
                    statusDiv.innerHTML = `<div class="status error">❌ Erreur à ${timestamp}</div>`;
                });
        }
        
        // Démarrer toutes les minutes
        function start() {
            runSync(); // Exécuter immédiatement
            intervalId = setInterval(runSync, 60000); // Puis toutes les 60 secondes
        }
        
        // Arrêter
        function stop() {
            if (intervalId) {
                clearInterval(intervalId);
                document.getElementById('status').innerHTML = '<div class="status info">⏸️ Arrêté</div>';
            }
        }
        
        // Boutons
        document.body.innerHTML += `
            <button onclick="start()" style="padding: 10px 20px; margin: 10px; background: #28a745; color: white; border: none; border-radius: 5px; cursor: pointer;">▶️ Démarrer</button>
            <button onclick="stop()" style="padding: 10px 20px; margin: 10px; background: #dc3545; color: white; border: none; border-radius: 5px; cursor: pointer;">⏸️ Arrêter</button>
        `;
    </script>
</body>
</html>
```

**Utilisation :**
1. Accédez à : `https://www.jdcauto.fr/sync/test-auto.html`
2. Cliquez sur "Démarrer"
3. La synchronisation s'exécute immédiatement, puis toutes les minutes
4. Cliquez sur "Arrêter" pour arrêter

**⚠️ Important :** Supprimez ce fichier après vos tests !

---

## ⏰ Méthode 3 : Anacron - Intervalle Minimum (1 heure)

Pour la production, configurez Anacron avec l'intervalle minimum :

```bash
1@hourly 0 spider_vo_sync php -f /srv/data/web/vhosts/www.jdcauto.fr/htdocs/sync/spider_vo_sync.php
```

**Exécution :** Toutes les heures (intervalle minimum sur Gandi)

---

## 📊 Comparaison des Méthodes

| Méthode | Fréquence | Usage | Recommandé |
|---------|-----------|-------|------------|
| **URL manuelle** | À la demande | Tests | ✅ Oui |
| **Script HTML auto** | Toutes les minutes | Tests uniquement | ⚠️ Tests seulement |
| **Anacron 1h** | Toutes les heures | Production | ✅ Oui |
| **Anacron quotidien** | Une fois par jour | Production | ✅ Oui |

---

## 🎯 Recommandation pour les Tests

1. **Test initial :** Utilisez l'URL manuelle
   ```
   https://www.jdcauto.fr/sync/spider_vo_sync.php
   ```

2. **Test répété :** Rafraîchissez la page plusieurs fois

3. **Vérification :** Consultez le site pour voir les véhicules mis à jour
   ```
   https://www.jdcauto.fr
   ```

4. **Production :** Configurez Anacron avec `@daily` ou `1@hourly`

---

## ⚠️ Avertissements

- **Ne pas surcharger le serveur :** Évitez les synchronisations trop fréquentes en production
- **Limite processus :** Sur hébergement S (2 processus max), chaque sync occupe un processus
- **Spider-VO :** Vérifiez que Spider-VO n'a pas de limite de requêtes sur leur API

---

## ✅ Checklist Test

- [ ] Test manuel via URL réussi
- [ ] Vérification des véhicules sur le site
- [ ] Vérification des photos
- [ ] Configuration Anacron pour production
- [ ] Suppression des fichiers de test


