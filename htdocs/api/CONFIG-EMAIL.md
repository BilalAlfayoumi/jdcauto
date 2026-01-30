# 📧 Configuration Email - Gandi

## Ce que signifie "2 boîtes mail"

Dans votre abonnement Gandi, vous avez **2 adresses email** incluses. Par exemple :
- `contact@jdcauto.fr`
- `info@jdcauto.fr`

## Configuration requise

### 1. Créer une boîte mail dans votre panel Gandi

1. Connectez-vous à votre **panel Gandi** : https://admin.gandi.net
2. Allez dans **Email** ou **Boîtes mail**
3. Créez une nouvelle boîte mail (ex: `contact@jdcauto.fr`)
4. **Notez le mot de passe** que vous définissez

### 2. Configurer les identifiants dans le code

Ouvrez le fichier : `htdocs/api/index.php`

Trouvez la fonction `sendContactEmail()` et modifiez ces lignes :

```php
$smtp_username = 'contact@jdcauto.fr'; // ⚠️ REMPLACER par votre boîte mail Gandi
$smtp_password = 'VOTRE_MOT_DE_PASSE'; // ⚠️ REMPLACER par le mot de passe
```

### 3. Paramètres SMTP Gandi

- **Serveur SMTP** : `mail.gandi.net`
- **Port** : `587` (TLS) ou `465` (SSL)
- **Authentification** : Oui
- **Sécurité** : TLS/SSL

## Test

1. Configurez les identifiants dans `index.php`
2. Envoyez un message via le formulaire de contact
3. Vérifiez les logs dans les logs PHP de Gandi
4. Vérifiez votre boîte mail de destination

## Alternative : Utiliser PHPMailer

Si la méthode SMTP manuelle ne fonctionne pas, on peut utiliser PHPMailer (bibliothèque plus robuste).

## Sécurité

⚠️ **IMPORTANT** : Ne commitez jamais le mot de passe dans Git !
- Utilisez des variables d'environnement
- Ou créez un fichier de config non versionné


