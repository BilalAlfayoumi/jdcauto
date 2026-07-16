# 🔒 Configuration Google reCAPTCHA

## 📋 Introduction

Google reCAPTCHA v2 "Je ne suis pas un robot" a été intégré dans tous les formulaires de contact pour protéger contre les spams et les bots.

## ✅ Formulaires protégés

- ✅ Page Contact - Formulaire "Achat de véhicule"
- ✅ Page Contact - Formulaire "Carte grise & Immatriculation"
- ✅ Page VehicleDetail - Formulaire de contact véhicule (modal)
- ✅ Page TradeIn - Formulaire de reprise

## 🔑 Obtenir vos clés reCAPTCHA

### 1. Créer un compte Google reCAPTCHA

1. Aller sur : https://www.google.com/recaptcha/admin/create
2. Se connecter avec votre compte Google

### 2. Enregistrer un nouveau site

**Label** : `JDC Auto - www.jdcauto.fr`

**Type de reCAPTCHA** : `reCAPTCHA v2` → `"Je ne suis pas un robot"`

**Domaines** :
- `www.jdcauto.fr`
- `jdcauto.fr` (sans www, optionnel)

**Propriétaires** : Votre email

### 3. Accepter les conditions

Cocher "J'accepte les Conditions d'utilisation de l'API reCAPTCHA"

### 4. Soumettre

Vous recevrez :
- **Site Key** (clé publique) : `6Lc...` (à utiliser dans le code)
- **Secret Key** (clé privée) : `6Lc...` (à garder secrète, pour validation serveur)

## 🔧 Configuration dans le code

### Étape 1 : Remplacer la clé de test

Actuellement, une clé de test Google est utilisée :
```javascript
const RECAPTCHA_SITE_KEY = '6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI'; // Clé de test
```

**À remplacer dans ces fichiers** :
1. `JDC/src/Pages/Contact.jsx` (ligne ~50)
2. `JDC/src/Pages/VehicleDetail.jsx` (ligne ~50)
3. `JDC/src/Pages/TradeIn.jsx` (ligne ~40)

**Par votre Site Key** :
```javascript
const RECAPTCHA_SITE_KEY = 'VOTRE_SITE_KEY_ICI';
```

### Étape 2 : Rebuild et déployer

```bash
cd JDC
npm run build
cd ..
cp -r JDC/dist/* htdocs/
git add -A
git commit -m "🔒 Configuration reCAPTCHA avec clé de production"
git push gandi master
ssh a1ec35a4-fabe-11f0-b829-00163e816020@git.sd3.gpaas.net deploy www.jdcauto.fr.git
```

## 🧪 Test

1. Aller sur https://www.jdcauto.fr/contact
2. Remplir un formulaire
3. Vérifier que le widget reCAPTCHA apparaît
4. Cocher "Je ne suis pas un robot"
5. Envoyer le formulaire

## ⚠️ Important

- La clé de test (`6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI`) fonctionne mais affiche un message "reCAPTCHA test key"
- Pour la production, utilisez votre propre clé
- La Secret Key n'est pas nécessaire côté client (seulement pour validation serveur si vous voulez vérifier côté backend)

## 🔍 Vérification

Après configuration, vérifiez que :
- ✅ Le widget reCAPTCHA s'affiche dans tous les formulaires
- ✅ L'envoi est bloqué si reCAPTCHA n'est pas complété
- ✅ Le message d'erreur s'affiche : "Veuillez compléter la vérification 'Je ne suis pas un robot'"
- ✅ L'envoi fonctionne après avoir complété reCAPTCHA

## 📝 Notes

- reCAPTCHA v2 nécessite une interaction utilisateur (cocher la case)
- Le widget se réinitialise automatiquement après chaque envoi
- Compatible avec tous les navigateurs modernes
- Fonctionne sur mobile et desktop

