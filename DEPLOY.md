# Guide de déploiement - JDC Auto

Ce guide explique comment déployer le site JDC Auto sur l'hébergeur Gandi.

## Configuration Git

Le remote Gandi a été configuré avec les informations suivantes :
- **Remote name**: `gandi`
- **URL**: `git+ssh://a1ec35a4-fabe-11f0-b829-00163e816020@git.sd3.gpaas.net/www.jdcauto.fr.git`

## Méthode 1 : Script de déploiement automatique (Recommandé)

Utilisez le script `deploy.sh` pour automatiser tout le processus :

```bash
./deploy.sh
```

Ce script va :
1. ✅ Construire le projet (npm run build)
2. ✅ Copier `JDC/dist` vers `htdocs/`
3. ✅ Committer les changements
4. ✅ Pousser vers GitHub (origin)
5. ✅ Pousser vers Gandi
6. ✅ Déployer sur le serveur

## Méthode 2 : Déploiement manuel

### Étape 1 : Construire le projet

```bash
cd JDC
npm run build
cp -R dist/. ../htdocs/
cd ..
```

### Étape 2 : Committer et pousser les changements

```bash
git add -A
git commit -m "Deploy: $(date +'%Y-%m-%d %H:%M:%S')"
git push origin main
git push gandi main
```

### Étape 3 : Déployer sur le serveur

```bash
ssh a1ec35a4-fabe-11f0-b829-00163e816020@git.sd3.gpaas.net deploy www.jdcauto.fr.git
```

## Authentification SSH

Pour la première utilisation, vous devrez :
1. Créer un jeton d'accès personnel sur votre interface Gandi
2. Utiliser ce jeton comme mot de passe lors de la connexion SSH

## Vérification

Après le déploiement, votre site devrait être disponible sur :
- **URL**: https://www.jdcauto.fr

## Remotes Git configurés

- `origin`: GitHub (https://github.com/BilalAlfayoumi/jdcauto.git)
- `gandi`: Gandi (git+ssh://a1ec35a4-fabe-11f0-b829-00163e816020@git.sd3.gpaas.net/jdcauto.fr.git)

## Notes importantes

- Le dossier `dist` doit être commité pour que Gandi puisse déployer le site
- Le site publié par Gandi sert le dossier `htdocs`, donc il faut toujours recopier `JDC/dist/*` dans `htdocs/` avant le push
- Assurez-vous d'être sur la branche `main` avant de déployer
- Le script de déploiement vérifie automatiquement la branche actuelle
- Avant de déployer l'admin, configurez son identifiant et idéalement un hash de mot de passe via `ADMIN_USERNAME` / `ADMIN_PASSWORD_HASH`, ou via un fichier serveur non versionné `htdocs/config/admin_auth.local.php`
