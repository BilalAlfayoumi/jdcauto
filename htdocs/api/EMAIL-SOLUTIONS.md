# 📧 Solutions gratuites pour l'envoi d'emails

## 🎯 Solutions recommandées (GRATUITES)

### 1. **SendGrid** ⭐ RECOMMANDÉ
- **Gratuit** : 100 emails/jour (3000/mois)
- **Très fiable** : Service professionnel utilisé par de grandes entreprises
- **Facile** : API simple et bien documentée
- **Inscription** : https://sendgrid.com/free/
- **Configuration** : 5 minutes

### 2. **Mailgun**
- **Gratuit** : 5000 emails/mois pendant 3 mois
- **Puis payant** : ~$35/mois
- **Très fiable** : Service professionnel
- **Inscription** : https://www.mailgun.com/pricing
- **Note** : Payant après 3 mois

### 3. **Amazon SES** (Simple Email Service)
- **Gratuit** : 62 000 emails/mois pendant 12 mois
- **Puis** : $0.10 pour 1000 emails
- **Très fiable** : Infrastructure Amazon
- **Inscription** : https://aws.amazon.com/ses/
- **Note** : Nécessite compte AWS (gratuit)

### 4. **SMTP Gmail** (si vous avez Gmail)
- **Gratuit** : Illimité
- **Limite** : 500 emails/jour
- **Nécessite** : Compte Gmail + mot de passe d'application
- **Note** : Peut être bloqué si trop d'emails

### 5. **Postmark**
- **Gratuit** : 100 emails/mois
- **Très fiable** : Service professionnel
- **Inscription** : https://postmarkapp.com/pricing
- **Note** : Limite assez basse

## 🚀 Configuration SendGrid (RECOMMANDÉ)

### Étape 1 : Créer un compte
1. Aller sur https://sendgrid.com/free/
2. Créer un compte gratuit
3. Vérifier votre email

### Étape 2 : Créer une clé API
1. Dans SendGrid, aller dans **Settings** → **API Keys**
2. Cliquer sur **Create API Key**
3. Nom : "JDC Auto"
4. Permissions : **Full Access** (ou **Restricted Access** avec seulement "Mail Send")
5. Copier la clé API (elle ne sera affichée qu'une fois !)

### Étape 3 : Configurer dans le code
Modifier `htdocs/api/index.php` :
```php
// Configuration SendGrid
define('SENDGRID_API_KEY', 'VOTRE_CLE_API_ICI');
define('SENDGRID_FROM_EMAIL', 'contact@jdcauto.fr');
define('SENDGRID_FROM_NAME', 'JDC Auto');
```

### Étape 4 : Tester
Envoyer un email de test via le formulaire de contact.

## 📝 Configuration SMTP Gmail (ALTERNATIVE)

### Étape 1 : Activer l'authentification à 2 facteurs
1. Aller sur https://myaccount.google.com/security
2. Activer l'authentification à 2 facteurs

### Étape 2 : Créer un mot de passe d'application
1. Aller sur https://myaccount.google.com/apppasswords
2. Sélectionner "Mail" et "Autre (nom personnalisé)"
3. Nom : "JDC Auto"
4. Copier le mot de passe généré (16 caractères)

### Étape 3 : Configurer dans le code
Modifier `htdocs/api/index.php` :
```php
// Configuration SMTP Gmail
define('SMTP_HOST', 'smtp.gmail.com');
define('SMTP_PORT', 587);
define('SMTP_USER', 'votre-email@gmail.com');
define('SMTP_PASS', 'votre-mot-de-passe-application');
```

## ✅ Solution actuelle (sans email)

Actuellement, les messages sont stockés en base de données et peuvent être consultés via :
- **URL** : `https://www.jdcauto.fr/api/view_contacts.php`
- **Avantage** : Aucun coût, fonctionne toujours
- **Inconvénient** : Consultation manuelle

## 🎯 Recommandation

Pour votre site, je recommande **SendGrid** car :
- ✅ Gratuit et généreux (100/jour = 3000/mois)
- ✅ Très fiable
- ✅ Facile à configurer
- ✅ Pas de limite de temps (contrairement à Mailgun)
- ✅ Support en français disponible

## 📞 Besoin d'aide ?

Dites-moi quelle solution vous préférez et je l'implémente pour vous !


