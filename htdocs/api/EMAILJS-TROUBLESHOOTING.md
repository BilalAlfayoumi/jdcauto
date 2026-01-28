# 🔧 Dépannage EmailJS - Erreur 412

## ❌ Erreur 412 (Precondition Failed)

L'erreur 412 signifie généralement que la configuration EmailJS est incorrecte.

## ✅ Checklist de vérification

### 1. Vérifier le Service ID

Dans EmailJS Dashboard → Email Services :
- ✅ Service Brevo : `service_a099ehl` doit être **actif** et **connecté**
- ✅ Vérifier que le service est bien lié à votre compte Brevo

### 2. Vérifier le Template ID

Dans EmailJS Dashboard → Email Templates :
- ✅ Template `template_sq3rlfb` doit **exister**
- ✅ Template doit être **associé au service** `service_a099ehl`
- ✅ Template doit être **publié** (pas en brouillon)

**Comment vérifier l'association :**
1. Ouvrir le template `template_sq3rlfb`
2. Vérifier dans "Service" qu'il est bien lié à `service_a099ehl`
3. Si ce n'est pas le cas, changer le service dans les paramètres du template

### 3. Vérifier la Public Key

Dans EmailJS Dashboard → Account → General :
- ✅ Public Key doit être : `AQaaMiMFeiYBqPjIr`
- ✅ Vérifier qu'elle correspond bien à celle dans le code

### 4. Vérifier les variables du template

Le template doit utiliser ces variables (exactement comme écrit) :
- `{{from_name}}`
- `{{from_email}}`
- `{{phone}}`
- `{{message}}`
- `{{subject}}`
- `{{type}}`

**Important :** Les noms de variables sont sensibles à la casse !

### 5. Vérifier la configuration du service Brevo

Dans EmailJS Dashboard → Email Services → service_a099ehl :
- ✅ Le service doit être **connecté** à Brevo
- ✅ L'email "From" doit être configuré
- ✅ Vérifier que Brevo accepte les emails depuis ce service

## 🔍 Diagnostic dans la console

Ouvrir la console du navigateur (F12) et vérifier les logs :

```
📧 Envoi EmailJS avec: {
  serviceId: 'service_a099ehl',
  templateId: 'template_sq3rlfb',
  publicKey: 'AQaaM...',
  params: {...}
}
```

Si vous voyez cette erreur :
```
❌ Erreur EmailJS détaillée: {
  message: "...",
  status: 412,
  ...
}
```

## 🛠️ Solutions

### Solution 1 : Réassocier le template au service

1. Aller dans Email Templates
2. Ouvrir `template_sq3rlfb`
3. Dans "Service", sélectionner `service_a099ehl`
4. Sauvegarder

### Solution 2 : Vérifier que le service est actif

1. Aller dans Email Services
2. Vérifier que `service_a099ehl` est **actif** (pas désactivé)
3. Si désactivé, le réactiver

### Solution 3 : Recréer le template

Si le problème persiste :

1. Créer un nouveau template
2. L'associer à `service_a099ehl`
3. Utiliser les mêmes variables
4. Mettre à jour le Template ID dans le code

### Solution 4 : Utiliser le service Gmail

Si Brevo ne fonctionne pas, essayer Gmail :

Dans `JDC/src/Pages/Contact.jsx`, changer :
```javascript
SERVICE_ID: 'service_uxxnivr', // Service Gmail
```

## 📝 Configuration correcte du template

**Sujet :**
```
Nouvelle demande de contact - {{type}}
```

**Corps :**
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

**Paramètres :**
- **Service** : `service_a099ehl` (Brevo)
- **To Email** : `belallfym@gmail.com`
- **From Name** : `JDC Auto`
- **From Email** : (celui configuré dans le service Brevo)

## 🆘 Si rien ne fonctionne

1. Vérifier les logs dans EmailJS Dashboard → Logs
2. Vérifier que le compte EmailJS est actif
3. Vérifier que vous n'avez pas dépassé la limite (200 emails/mois gratuit)
4. Contacter le support EmailJS : support@emailjs.com

## ✅ Test rapide

Pour tester rapidement, vous pouvez utiliser l'API EmailJS directement dans la console :

```javascript
emailjs.send(
  'service_a099ehl',
  'template_sq3rlfb',
  {
    from_name: 'Test',
    from_email: 'test@example.com',
    phone: '0123456789',
    message: 'Message test',
    subject: 'Test',
    type: 'Test'
  },
  'AQaaMiMFeiYBqPjIr'
).then(
  (response) => console.log('✅ Succès:', response),
  (error) => console.error('❌ Erreur:', error)
);
```

