# ✅ Configuration EmailJS - Étapes finales

## 📋 Ce qui est déjà fait

✅ Services créés :
- **Brevo** : `service_a099ehl`
- **Gmail** : `service_uxxnivr` (backup)

✅ Template créé :
- **Template ID** : `template_sq3rlfb`

✅ Code configuré :
- Service Brevo configuré par défaut
- Template `template_sq3rlfb` utilisé pour les deux formulaires

## 🔧 Étapes finales à faire

### Étape 1 : Récupérer votre Public Key

1. Aller sur https://dashboard.emailjs.com/
2. Cliquer sur **"Account"** → **"General"**
3. Trouver **"Public Key"** (User ID)
4. **Copier la clé** (ex: `xxxxxxxxxxxxx`)

### Étape 2 : Configurer le template dans EmailJS

1. Aller dans **"Email Templates"**
2. Cliquer sur votre template `template_sq3rlfb`
3. Configurer le template avec ces variables :

**Sujet de l'email :**
```
Nouvelle demande de contact - {{type}}
```

**Corps de l'email :**
```
Bonjour,

Vous avez reçu une nouvelle demande de contact depuis le site JDC Auto.

Type de demande : {{type}}

Informations du contact :
- Nom : {{from_name}}
- Email : {{from_email}}
- Téléphone : {{phone}}

Message :
{{message}}

Sujet : {{subject}}

---
Cet email a été envoyé depuis le formulaire de contact JDC Auto.
```

4. **Important** : Dans les paramètres du template, configurer :
   - **To Email** : `belallfym@gmail.com` (ou votre email)
   - **From Name** : `JDC Auto`
   - **From Email** : L'email configuré dans votre service Brevo

5. Cliquer sur **"Save"**

### Étape 3 : Mettre à jour le code

Ouvrir le fichier : `JDC/src/Pages/Contact.jsx`

Trouver la ligne ~62 et remplacer :

```javascript
PUBLIC_KEY: 'VOTRE_PUBLIC_KEY_ICI' // ⚠️ À récupérer dans EmailJS → Account → General
```

Par :

```javascript
PUBLIC_KEY: 'VOTRE_PUBLIC_KEY_ICI' // Remplacez par votre Public Key récupérée
```

**Exemple :**
```javascript
PUBLIC_KEY: 'abc123xyz789' // Votre Public Key
```

### Étape 4 : Rebuild et déployer

```bash
cd JDC
npm run build
cd ..
cp -r JDC/dist/* htdocs/
git add -A
git commit -m "✅ Configuration EmailJS finale"
git push gandi master
```

### Étape 5 : Tester

1. Aller sur votre site : https://www.jdcauto.fr/contact
2. Remplir le formulaire "Achat de véhicule"
3. Envoyer
4. Vérifier que l'email arrive bien dans votre boîte mail

## 🔄 Changer de service (Brevo → Gmail)

Si vous voulez utiliser Gmail au lieu de Brevo, modifiez dans `Contact.jsx` :

```javascript
SERVICE_ID: 'service_uxxnivr', // Service Gmail
```

## 📝 Variables disponibles dans le template

Dans votre template EmailJS, vous pouvez utiliser :

- `{{from_name}}` : Nom complet (Prénom + Nom)
- `{{from_email}}` : Email du contact
- `{{phone}}` : Téléphone
- `{{message}}` : Message
- `{{subject}}` : Sujet
- `{{type}}` : Type de demande ("Achat de véhicule" ou "Carte grise & Immatriculation")

## 🆘 Dépannage

### L'email n'arrive pas

1. Vérifier que le service Brevo est bien connecté dans EmailJS
2. Vérifier les logs dans la console du navigateur (F12)
3. Vérifier les logs dans EmailJS → Dashboard → Logs
4. Vérifier que la Public Key est correcte

### Erreur "Invalid Public Key"

- Vérifier que la Public Key est correcte
- Vérifier qu'elle est bien dans Account → General

### Erreur "Template not found"

- Vérifier que le Template ID `template_sq3rlfb` existe
- Vérifier qu'il est bien associé au service `service_a099ehl`

## ✅ Checklist finale

- [ ] Public Key récupérée et ajoutée dans le code
- [ ] Template configuré avec les bonnes variables
- [ ] Email de destination configuré dans le template
- [ ] Code rebuild et déployé
- [ ] Test effectué et email reçu

Une fois tout fait, les emails seront envoyés automatiquement via EmailJS ! 🎉

