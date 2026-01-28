# 📧 Configuration Email de Destination EmailJS

## ✅ Modification effectuée dans le code

L'email de destination a été mis à jour dans le code pour utiliser `jdcauto33@orange.fr` :

- ✅ `Contact.jsx` : `to_email: 'jdcauto33@orange.fr'`
- ✅ `VehicleDetail.jsx` : `to_email: 'jdcauto33@orange.fr'`
- ✅ `TradeIn.jsx` : `to_email: 'jdcauto33@orange.fr'`

## 🔧 Configuration dans EmailJS Dashboard

### Option 1 : Utiliser la variable `to_email` dans le template (Recommandé)

1. Aller dans **EmailJS Dashboard** → **Email Templates**
2. Ouvrir chaque template :
   - `template_sq3rlfb` (Contact et VehicleDetail)
   - `template_ti3q0oj` (Reprise)

3. Dans le champ **"To Email"**, utiliser la variable :
   ```
   {{to_email}}
   ```

4. **Sauvegarder** le template

### Option 2 : Configurer directement l'email dans le template

1. Aller dans **EmailJS Dashboard** → **Email Templates**
2. Ouvrir chaque template
3. Dans le champ **"To Email"**, entrer directement :
   ```
   jdcauto33@orange.fr
   ```

4. **Sauvegarder** le template

## 📋 Templates à mettre à jour

### Template `template_sq3rlfb`
- Utilisé pour : Contact (Achat et Carte grise) + VehicleDetail
- **To Email** : `{{to_email}}` ou `jdcauto33@orange.fr`

### Template `template_ti3q0oj`
- Utilisé pour : Reprise de véhicule
- **To Email** : `{{to_email}}` ou `jdcauto33@orange.fr`

## ⚠️ Important : Service EmailJS

Le service EmailJS actuel est **Gmail** (`service_uxxnivr`).

**Si vous voulez envoyer vers un email Orange (`jdcauto33@orange.fr`) :**

### Option A : Utiliser le service Gmail existant
- Le service Gmail peut envoyer vers n'importe quel email (Gmail, Orange, etc.)
- Il suffit de configurer `to_email` dans le template
- ✅ **C'est la solution la plus simple**

### Option B : Créer un nouveau service SMTP générique
1. Aller dans **EmailJS Dashboard** → **Email Services**
2. Cliquer sur **"Add New Service"**
3. Choisir **"SMTP"** ou **"Custom SMTP Server"**
4. Configurer avec les paramètres SMTP d'Orange :
   - **SMTP Server** : `smtp.orange.fr`
   - **SMTP Port** : `465` (SSL) ou `587` (TLS)
   - **SMTP Username** : `jdcauto33@orange.fr`
   - **SMTP Password** : (mot de passe du compte Orange)
5. **Sauvegarder** le service
6. Mettre à jour les templates pour utiliser ce nouveau service

## 🧪 Test

1. Remplir un formulaire de contact
2. Envoyer
3. Vérifier que l'email arrive bien à `jdcauto33@orange.fr`

## 📝 Note

- L'email `to_email` est maintenant passé dans le code comme variable
- Si vous utilisez `{{to_email}}` dans le template, l'email sera automatiquement `jdcauto33@orange.fr`
- Si vous mettez directement `jdcauto33@orange.fr` dans le template, cela fonctionnera aussi

