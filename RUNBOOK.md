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

## Consulter les logs (le "pourquoi" de la panne)

Le monitoring dit QUE le site est tombé ; les logs disent POURQUOI. Tous les logs
sont sur le serveur Gandi dans `/lamp0/var/log/`, accessibles en SFTP avec le même
identifiant que le déploiement (voir `deploy.sh`) :

```bash
# Télécharger un log (remplacer <id> par l'identifiant Gandi de deploy.sh)
sftp <id>@sftp.sd3.gpaas.net:/lamp0/var/log/apache/error.log .

# Ou consulter les dernières lignes sans tout télécharger
echo "get /lamp0/var/log/apache/error.log /tmp/error.log" | sftp <id>@sftp.sd3.gpaas.net && tail -50 /tmp/error.log
```

| Log | Chemin | Utile pour |
|---|---|---|
| Erreurs Apache | `/lamp0/var/log/apache/error.log` | Erreurs 500, .htaccess cassé, rewrite |
| Accès Apache | `/lamp0/var/log/apache/access.log` | Qui appelle quoi, codes HTTP, pics de trafic |
| Erreurs PHP | `/lamp0/var/log/www/www-error.log` et `fpm.log` | Exceptions PHP, `error_log()` de l'API (dont "Erreur PDO API") |
| Cron / sync Spider-VO | `/lamp0/var/log/cron/user.log` | La sync quotidienne a-t-elle tourné et réussi ? |
| Erreurs MySQL | `/lamp0/var/log/db/error.log` | Base qui redémarre, table corrompue |
| Requêtes lentes MySQL | `/lamp0/var/log/db/slow-queries.log` | Site lent sans être tombé |

Réflexe : en cas d'erreur 500 sur l'API, regarder d'abord `www/www-error.log`
(l'API y écrit le détail des erreurs PDO), puis `db/error.log`.

Côté applicatif, la table MySQL `admin_activity_log` trace toutes les actions admin
(qui a modifié quoi et quand) — consultable via l'espace admin ou la console MySQL Gandi.

### Erreurs JavaScript côté visiteurs (Sentry)

Les crashs React et erreurs JS dans le navigateur des visiteurs (invisibles dans les
logs serveur) sont remontés à Sentry : https://bilalfym.sentry.io (projet
`javascript-react`, événements uniquement en production). Chaque nouvelle erreur
déclenche un email. L'initialisation est dans `JDC/src/main.jsx` ; le DSN est une
clé publique d'envoi, sa présence dans le code est normale et sans risque.

### Workflows planifiés désactivés par GitHub (règle des 60 jours)

**Symptôme** : email « The "Surveillance du site" workflow in BilalAlfayoumi/jdcauto has been
disabled » (idem pour « Sync Spider-VO » et « Backup MySQL »), ou bandeau GitHub Actions
« Scheduled workflows are disabled automatically after 60 days of repository inactivity ».

**Cause** : sur un dépôt public, GitHub coupe les déclencheurs `schedule` (cron) de **tous**
les workflows après **60 jours sans activité du dépôt**. Les *exécutions* de workflows ne
comptent pas comme activité : seul un **push** (nouveau commit) réinitialise le compteur.
Un dépôt sans commit pendant 2 mois perd donc sa surveillance, ses backups et sa sync.

**Solution en place (permanente)** : `.github/workflows/keepalive.yml`, déclenché le 1er de
chaque mois, fait deux choses :

1. il pousse un commit sur `master` (mise à jour de `.github/keepalive.txt`) → activité du
   dépôt garantie tous les 30 jours, soit 30 jours de marge avant la coupure des 60 jours ;
2. il réactive via l'API (`PUT /actions/workflows/<fichier>/enable`) **tous** les workflows du
   dépôt, ce qui répare un workflow désactivé manuellement ou par inactivité.

`deploy.sh` fait un `git pull --rebase` avant de pousser, pour ne pas être bloqué par ce
commit automatique.

**Vérifier que tout est actif** :

```bash
gh workflow list --all          # attendu : "active" pour les 4 workflows
gh run list --workflow=keepalive.yml --limit 5
```

**Réparer à la main** (si un workflow est repassé en `disabled_inactivity`) :

```bash
gh workflow enable "Surveillance du site"
gh workflow enable "Sync Spider-VO"
gh workflow enable "Backup MySQL"
# … ou forcer le workflow de maintien :
gh workflow run keepalive.yml
```

**Ne pas supprimer** `.github/workflows/keepalive.yml` ni `.github/keepalive.txt` : sans eux,
la désactivation revient au bout de 60 jours. Il n'existe aucun réglage GitHub pour désactiver
cette politique sur un dépôt public.

### Tokens et secrets (le dépôt GitHub est public)

Aucun secret ne doit se trouver dans le code. Chaque token vit à deux endroits :

| Token | Côté serveur (Gandi) | Côté CI (GitHub) |
|---|---|---|
| Sync Spider-VO | `htdocs/config/sync_token.local.php` | secret `SYNC_TOKEN` (workflow `deploy.yml`) |
| Sauvegarde MySQL | `htdocs/config/backup_token.local.php` | secret `BACKUP_TOKEN` (workflow `backup.yml`) |
| Flux Spider-VO (URL + clé de compte) | `htdocs/config/spider_vo.local.php` | — (le serveur s'en sert pour la sync) |
| Admin (login) | `htdocs/config/admin_auth.local.php` | — |
| reCAPTCHA (anti-robot) | variable d'environnement `RECAPTCHA_SECRET_KEY` | clé de site dans le code (publique) |

Les fichiers `htdocs/config/*.local.php` sont **non versionnés** (`.gitignore`) : ils existent
en local et sur le serveur, et doivent être déposés en SFTP après toute modification —
le déploiement git (rsync) ne les transporte pas.

**Historique (2026-10-06)** : le token de sync, l'URL du flux Spider-VO et un hash bcrypt
du mot de passe admin étaient présents dans le dépôt public. Ils ont été retirés du code,
le token de sync et le mot de passe admin ont été changés. Un secret publié reste gravé
dans l'historique git : **toute valeur ayant séjourné dans le dépôt doit être considérée
comme compromise et régénérée à la source** (c'est pourquoi l'URL du flux Spider-VO doit
être régénérée dans le compte Spider-VO — elle est encore celle de l'ancien code).
Vérifier aussi régulièrement : `.env` et `htdocs/config/*.local.php` ne doivent jamais
apparaître dans `git status`.

**Rotation d'un token** (ex. `SYNC_TOKEN`) :

```bash
# 1. Nouveau token
openssl rand -hex 32

# 2. Fichier serveur (SFTP)
sftp <id>@sftp.sd3.gpaas.net
  put htdocs/config/sync_token.local.php /vhosts/www.jdcauto.fr/htdocs/config/sync_token.local.php
  chmod 640 /vhosts/www.jdcauto.fr/htdocs/config/sync_token.local.php

# 3. Secret GitHub
gh secret set SYNC_TOKEN --body "<nouveau token>"

# 4. Vérifier : 200 avec le bon token, 403 sinon
curl -s -o /dev/null -w "%{http_code}\n" -H "X-Sync-Token: <nouveau token>" \
  https://www.jdcauto.fr/sync/spider_vo_sync.php
```

Le token est accepté en en-tête `X-Sync-Token` (recommandé : il n'apparaît pas dans les
logs Apache) ou en `?token=` (compatibilité). Un token en paramètre d'URL s'écrit en clair
dans `access.log` : à éviter pour les appels automatisés.

## Rappels d'architecture

- `htdocs/` est ce que Gandi sert (build React + API PHP + sync).
- La sync Spider-VO tourne par cron sur le serveur Gandi (quotidien 6h) et via GitHub Actions.
- Le rsync de déploiement Gandi **ne supprime pas** les fichiers existants sur le serveur.
- Tout endpoint PHP sensible doit envoyer `Cache-Control: no-store` (piège Varnish).

### Fichiers orphelins sur le serveur (à vérifier après chaque nettoyage)

Le déploiement Gandi **ne supprime rien** : tout fichier retiré du dépôt reste servi.
C'est ainsi qu'un installateur `htdocs/install/setup.php` est resté exécutable
publiquement pendant des mois (n'importe quel visiteur pouvait relancer une
installation et réinjecter des véhicules de test), et que 9 scripts de debug
(`api/debug.php`, `api/view_contacts.php`, `api/remove_duplicates.php`…) sont restés
accessibles. Tous ont été supprimés le 2026-10-06 et sauvegardés localement dans
`_sauvegardes-serveur/orphelins-20261006/` (dossier non versionné). `htdocs/.htaccess`
bloque désormais ces chemins (`RedirectMatch 404`).

**Après toute suppression de fichier dans `htdocs/`, vérifier le serveur** :

```bash
sftp <id>@sftp.sd3.gpaas.net
  ls -l /vhosts/www.jdcauto.fr/htdocs
  ls -l /vhosts/www.jdcauto.fr/htdocs/api
  ls -l /vhosts/www.jdcauto.fr/htdocs/sync
```

Comparer avec `git ls-files htdocs/` : tout `.php` présent sur le serveur et absent du
dépôt est un reliquat à supprimer (ou à réintégrer volontairement au dépôt).
`maintenance.html` est conservé volontairement (page de maintenance manuelle).

## Points de sécurité assumés / à surveiller

- **`htdocs/uploads/` est PUBLIC.** Ce dossier sert le contenu du site (visuels des
  tarifs, modèles CERFA) : tout fichier qui y est déposé est téléchargeable par
  n'importe qui, sans authentification (noms rendus imprévisibles + `uploads/.htaccess`
  interdit l'exécution de scripts). **Ne jamais y déposer de document client**
  (carte grise, pièce d'identité, devis signé) : pour cela il faudrait un dossier hors
  docroot servi par un endpoint admin authentifié — non implémenté à ce jour.
- **Hash du mot de passe admin dans l'historique public** (`git log -p` du commit
  `0bbb21b`) : il correspond à l'ancien mot de passe. Tant que le mot de passe n'est pas
  changé, il reste théoriquement cassable hors ligne (bcrypt coût 10). Pour changer :
  générer un hash (`php -r 'echo password_hash("...", PASSWORD_BCRYPT, ["cost"=>12]);'`),
  le coller dans `htdocs/config/admin_auth.local.php`, puis `put` en SFTP (procédure
  complète dans « Tokens et secrets »).
- **CSP** : déployée en `Content-Security-Policy-Report-Only` (n'indique rien côté
  serveur — les violations s'affichent dans la console du navigateur). Après quelques
  jours sans violation, remplacer l'en-tête par `Content-Security-Policy` pour activer
  le blocage réel.
- **Configuration MySQL choisie via l'en-tête `Host`** (`shouldUseEnvironmentDbConfig()`) :
  un client qui envoie `Host: php.exemple` force le chemin « environnement » et peut
  provoquer une erreur de connexion sur sa propre requête. Impact limité (auto-déni de
  service), laissé tel quel car la production définit `USE_ENV_DB_CONFIG`.
