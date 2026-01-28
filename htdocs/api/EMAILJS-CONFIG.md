# 📧 Configuration EmailJS

EmailJS est une solution **gratuite** (200 emails/mois) qui permet d'envoyer des emails directement depuis le frontend React, sans avoir besoin de configurer un serveur SMTP.

## ✅ Avantages EmailJS

- ✅ **Gratuit** : 200 emails/mois
- ✅ **Simple** : Configuration en 5 minutes
- ✅ **Frontend uniquement** : Pas besoin de backend
- ✅ **Fiable** : Service professionnel
- ✅ **Sécurisé** : Clés publiques/privées

## 🚀 Configuration étape par étape

### Étape 1 : Créer un compte EmailJS

1. Aller sur https://www.emailjs.com/
2. Cliquer sur **"Sign Up Free"**
3. Créer un compte (gratuit)
4. Vérifier votre email

### Étape 2 : Créer un service email

1. Dans le dashboard EmailJS, aller dans **"Email Services"**
2. Cliquer sur **"Add New Service"**
3. Choisir votre fournisseur email :
   - **Gmail** (recommandé si vous avez Gmail)
   - **Outlook**
   - **Yahoo**
   - Ou un autre service SMTP
4. Suivre les instructions pour connecter votre compte email
5. **Notez le Service ID** (ex: `service_xxxxx`)

### Étape 3 : Créer des templates d'email

#### Template 1 : Achat de véhicule

1. Aller dans **"Email Templates"**
2. Cliquer sur **"Create New Template"**
3. Nom : "Contact Achat"
4. **Template ID** : Notez-le (ex: `template_achat`)
5. **Contenu du template** :

```
Sujet: Nouvelle demande de contact - Achat de véhicule

Bonjour,

Vous avez reçu une nouvelle demande de contact pour un achat de véhicule.

Informations du contact:
- Nom: {{from_name}}
- Email: {{from_email}}
- Téléphone: {{phone}}

Message:
{{message}}

Type: {{type}}

---
Cet email a été envoyé depuis le formulaire de contact JDC Auto.
```

6. Cliquer sur **"Save"**

#### Template 2 : Carte grise

1. Créer un nouveau template
2. Nom : "Contact Carte Grise"
3. **Template ID** : Notez-le (ex: `template_carte_grise`)
4. **Contenu du template** :

```
Sujet: Nouvelle demande de contact - Carte grise & Immatriculation

Bonjour,

Vous avez reçu une nouvelle demande de contact pour une carte grise.

Informations du contact:
- Nom: {{from_name}}
- Email: {{from_email}}
- Téléphone: {{phone}}

Message:
{{message}}

Type: {{type}}

---
Cet email a été envoyé depuis le formulaire de contact JDC Auto.
```

5. Cliquer sur **"Save"**

### Étape 4 : Récupérer votre Public Key

1. Aller dans **"Account"** → **"General"**
2. Trouver **"Public Key"** (User ID)
3. **Copier la clé** (ex: `xxxxxxxxxxxxx`)

### Étape 5 : Configurer dans le code

Ouvrir le fichier : `JDC/src/Pages/Contact.jsx`

Trouver la section `EMAILJS_CONFIG` (ligne ~50) et remplacer :

```javascript
const EMAILJS_CONFIG = {
  SERVICE_ID: 'service_xxxxx', // ⚠️ REMPLACER par votre Service ID
  TEMPLATE_ID_ACHAT: 'template_achat', // ⚠️ REMPLACER par votre Template ID
  TEMPLATE_ID_CARTE_GRISE: 'template_carte_grise', // ⚠️ REMPLACER par votre Template ID
  PUBLIC_KEY: 'xxxxxxxxxxxxx' // ⚠️ REMPLACER par votre Public Key
};
```

**Et aussi** modifier l'email de destination (ligne ~70) :

```javascript
to_email: 'votre-email@example.com' // ⚠️ REMPLACER par votre email
```

### Étape 6 : Tester

1. Rebuild le projet : `npm run build`
2. Déployer sur le site
3. Envoyer un message via le formulaire de contact
4. Vérifier que l'email arrive bien

## 📝 Variables disponibles dans les templates

Dans vos templates EmailJS, vous pouvez utiliser ces variables :

- `{{from_name}}` : Nom complet (Prénom + Nom)
- `{{from_email}}` : Email du contact
- `{{phone}}` : Téléphone
- `{{message}}` : Message
- `{{subject}}` : Sujet
- `{{type}}` : Type de demande (Achat / Carte grise)

## 🔒 Sécurité

- ✅ La **Public Key** peut être exposée (c'est normal)
- ✅ Les **Service ID** et **Template ID** peuvent être exposés
- ⚠️ Ne jamais exposer votre **Private Key** (si vous en avez une)

## 💰 Tarifs

- **Gratuit** : 200 emails/mois
- **Starter** : $15/mois → 1000 emails/mois
- **Business** : $35/mois → 10 000 emails/mois

Pour un site comme JDC Auto, le plan gratuit (200/mois) devrait suffire largement.

## 🆘 Dépannage

### L'email n'arrive pas

1. Vérifier que le Service est bien connecté dans EmailJS
2. Vérifier les logs dans la console du navigateur
3. Vérifier les logs dans le dashboard EmailJS
4. Vérifier que les IDs sont corrects dans le code

### Erreur "Invalid Public Key"

- Vérifier que la Public Key est correcte
- Vérifier qu'elle est bien dans le dashboard EmailJS

### Erreur "Template not found"

- Vérifier que les Template ID sont corrects
- Vérifier que les templates existent dans EmailJS

## 📞 Support

- Documentation : https://www.emailjs.com/docs/
- Support : support@emailjs.com

