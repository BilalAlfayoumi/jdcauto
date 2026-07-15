# RUNBOOK — Que faire si le site tombe en panne

Guide de dépannage rapide pour https://www.jdcauto.fr

## Comment je suis averti

- **GitHub Actions** : le workflow "Surveillance du site" (`.github/workflows/healthcheck.yml`) teste le site et l'API toutes les 10 minutes. S'il échoue, GitHub envoie un email automatique au propriétaire du repo.
- Vérifier que les notifications sont actives : GitHub → Settings → Notifications → Actions → "Send notifications for failed workflows only".
- Complément recommandé : un monitor UptimeRobot (gratuit) sur la page d'accueil et l'API pour recevoir aussi des notifications push mobiles.

## Diagnostic en 30 secondes

1. Ouvrir le site en **navigation privée** (élimine le cache navigateur) : https://www.jdcauto.fr
2. Tester l'API directement : https://www.jdcauto.fr/api/index.php?action=carte_grise_content
3. Conclure :

| Constat | Diagnostic |
|---|---|
| Site OK en privé, cassé en normal | Cache navigateur/Varnish, attendre ~2 min |
| Site OK mais API en erreur | Problème MySQL Gandi |
| Tout est KO | Hébergeur Gandi ou mauvais déploiement |
| Cassé juste après un déploiement | Mauvais déploiement → rollback |

## Remèdes

### 1. Mauvais déploiement → rollback (2-3 minutes)

```bash
./rollback.sh            # restaure l'avant-dernier tag deploy-* et redéploie
./rollback.sh <tag>      # ou un tag précis, ex. deploy-20260716-012910
git tag | grep deploy-   # lister les tags disponibles
```

### 2. Problème MySQL / API en erreur 500

1. Vérifier l'état des services Gandi : https://status.gandi.net
2. Si Gandi est OK, regarder les logs via la console Gandi (admin.gandi.net → Simple Hosting).
3. En dernier recours, restaurer le backup quotidien :
   - Les dumps chiffrés sont dans les artefacts du workflow "Backup MySQL" (GitHub → Actions, conservés 30 jours).
   - Déchiffrement : `gpg --batch --passphrase "$TOKEN" -d fichier.sql.gz.gpg > backup.sql.gz` (le token est dans `htdocs/config/backup_token.local.php`, non versionné, présent en local et sur le serveur).
   - Import via la console MySQL Gandi.

### 3. Panne hébergeur Gandi

- Vérifier https://status.gandi.net
- Rien à faire côté code : attendre le rétablissement ou contacter le support Gandi depuis admin.gandi.net.

### 4. Page blanche / ancienne version chez certains visiteurs

- Cache navigateur ou Varnish (TTL ~2 min). Attendre 2 minutes puis recharger avec Cmd+Shift+R.
- Si le problème persiste pour tout le monde, vérifier que `htdocs/index.html` référence bien les bundles présents dans `htdocs/assets/`.

### 5. Redéployer manuellement (sans rebuild)

```bash
git push gandi master
ssh <identifiant>@git.sd3.gpaas.net deploy www.jdcauto.fr.git   # voir deploy.sh
```

## Rappels d'architecture

- `htdocs/` est ce que Gandi sert (build React + API PHP + sync).
- La sync Spider-VO tourne par cron sur le serveur Gandi (quotidien 6h) et via GitHub Actions.
- Le rsync de déploiement Gandi **ne supprime pas** les fichiers existants sur le serveur.
- Tout endpoint PHP sensible doit envoyer `Cache-Control: no-store` (piège Varnish).
