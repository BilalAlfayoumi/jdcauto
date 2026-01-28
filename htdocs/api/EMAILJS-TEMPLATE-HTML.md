# 📧 Template EmailJS - Design Professionnel JDC Auto

## 🎨 Template HTML à copier dans EmailJS

Copiez ce code dans votre template EmailJS (`template_sq3rlfb`) :

```html
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
  <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #f5f5f5; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="600" style="max-width: 600px; background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); overflow: hidden;">
          
          <!-- Header avec logo et titre -->
          <tr>
            <td style="background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%); padding: 30px 40px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700; letter-spacing: -0.5px;">
                🚗 Nouvelle Demande de Contact
              </h1>
              <p style="margin: 10px 0 0 0; color: #fee2e2; font-size: 14px; font-weight: 400;">
                JDC Auto - Mérignac
              </p>
            </td>
          </tr>

          <!-- Type de demande -->
          <tr>
            <td style="padding: 25px 40px 20px 40px; background-color: #fef2f2; border-bottom: 2px solid #fee2e2;">
              <div style="display: inline-block; background-color: #dc2626; color: #ffffff; padding: 8px 16px; border-radius: 20px; font-size: 13px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">
                {{type}}
              </div>
            </td>
          </tr>

          <!-- Informations du contact -->
          <tr>
            <td style="padding: 30px 40px;">
              <h2 style="margin: 0 0 20px 0; color: #1f2937; font-size: 20px; font-weight: 600; border-bottom: 2px solid #e5e7eb; padding-bottom: 10px;">
                📋 Informations du Contact
              </h2>
              
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                <tr>
                  <td style="padding: 12px 0; border-bottom: 1px solid #f3f4f6;">
                    <div style="display: flex; align-items: center;">
                      <div style="width: 40px; height: 40px; background-color: #fee2e2; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin-right: 15px; flex-shrink: 0;">
                        <span style="font-size: 20px;">👤</span>
                      </div>
                      <div style="flex: 1;">
                        <div style="color: #6b7280; font-size: 12px; font-weight: 500; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 4px;">
                          Nom complet
                        </div>
                        <div style="color: #1f2937; font-size: 16px; font-weight: 600;">
                          {{from_name}}
                        </div>
                      </div>
                    </div>
                  </td>
                </tr>
                
                <tr>
                  <td style="padding: 12px 0; border-bottom: 1px solid #f3f4f6;">
                    <div style="display: flex; align-items: center;">
                      <div style="width: 40px; height: 40px; background-color: #fee2e2; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin-right: 15px; flex-shrink: 0;">
                        <span style="font-size: 20px;">📧</span>
                      </div>
                      <div style="flex: 1;">
                        <div style="color: #6b7280; font-size: 12px; font-weight: 500; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 4px;">
                          Email
                        </div>
                        <div style="color: #1f2937; font-size: 16px; font-weight: 600;">
                          <a href="mailto:{{from_email}}" style="color: #dc2626; text-decoration: none;">{{from_email}}</a>
                        </div>
                      </div>
                    </div>
                  </td>
                </tr>
                
                <tr>
                  <td style="padding: 12px 0; border-bottom: 1px solid #f3f4f6;">
                    <div style="display: flex; align-items: center;">
                      <div style="width: 40px; height: 40px; background-color: #fee2e2; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin-right: 15px; flex-shrink: 0;">
                        <span style="font-size: 20px;">📞</span>
                      </div>
                      <div style="flex: 1;">
                        <div style="color: #6b7280; font-size: 12px; font-weight: 500; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 4px;">
                          Téléphone
                        </div>
                        <div style="color: #1f2937; font-size: 16px; font-weight: 600;">
                          <a href="tel:{{phone}}" style="color: #dc2626; text-decoration: none;">{{phone}}</a>
                        </div>
                      </div>
                    </div>
                  </td>
                </tr>
                
                <tr>
                  <td style="padding: 12px 0;">
                    <div style="display: flex; align-items: center;">
                      <div style="width: 40px; height: 40px; background-color: #fee2e2; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin-right: 15px; flex-shrink: 0;">
                        <span style="font-size: 20px;">📝</span>
                      </div>
                      <div style="flex: 1;">
                        <div style="color: #6b7280; font-size: 12px; font-weight: 500; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 4px;">
                          Sujet
                        </div>
                        <div style="color: #1f2937; font-size: 16px; font-weight: 600;">
                          {{subject}}
                        </div>
                      </div>
                    </div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Message -->
          <tr>
            <td style="padding: 0 40px 30px 40px;">
              <div style="background-color: #f9fafb; border-left: 4px solid #dc2626; padding: 20px; border-radius: 8px; margin-top: 10px;">
                <h3 style="margin: 0 0 12px 0; color: #1f2937; font-size: 16px; font-weight: 600;">
                  💬 Message
                </h3>
                <p style="margin: 0; color: #374151; font-size: 15px; line-height: 1.6; white-space: pre-wrap; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
{{message}}
                </p>
              </div>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f9fafb; padding: 25px 40px; border-top: 1px solid #e5e7eb; text-align: center;">
              <p style="margin: 0 0 10px 0; color: #6b7280; font-size: 13px; line-height: 1.5;">
                <strong style="color: #1f2937;">JDC Auto</strong><br>
                93 Av. de Magudas, 33700 Mérignac<br>
                Tél: +33 5 56 97 37 52
              </p>
              <p style="margin: 15px 0 0 0; color: #9ca3af; font-size: 11px; line-height: 1.4;">
                Cet email a été envoyé depuis le formulaire de contact du site<br>
                <a href="https://www.jdcauto.fr" style="color: #dc2626; text-decoration: none;">www.jdcauto.fr</a>
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
```

## 📝 Variables utilisées

Le template utilise ces variables (à configurer dans EmailJS) :
- `{{from_name}}` : Nom complet du contact
- `{{from_email}}` : Email du contact
- `{{phone}}` : Téléphone du contact
- `{{message}}` : Message du contact
- `{{subject}}` : Sujet de la demande
- `{{type}}` : Type de demande ("Achat de véhicule" ou "Carte grise & Immatriculation")

## 🎨 Caractéristiques du design

✅ **Design moderne et professionnel**
- Couleurs JDC Auto (rouge #dc2626)
- Typographie claire et lisible
- Espacement harmonieux

✅ **Responsive**
- S'adapte aux mobiles
- Largeur maximale 600px
- Padding adaptatif

✅ **Accessible**
- Contraste élevé
- Liens cliquables (email, téléphone)
- Structure sémantique

✅ **Professionnel**
- Header avec gradient rouge
- Badge pour le type de demande
- Icônes pour chaque information
- Footer avec coordonnées

## 📋 Instructions

1. Aller dans EmailJS Dashboard → Email Templates
2. Ouvrir le template `template_sq3rlfb`
3. **Supprimer** tout le contenu actuel
4. **Coller** le code HTML ci-dessus
5. Vérifier que les variables `{{...}}` sont bien présentes
6. **Sauvegarder**

## ✨ Résultat

Vous recevrez des emails avec :
- Un design moderne et professionnel
- Toutes les informations bien organisées
- Les couleurs de votre marque (rouge JDC Auto)
- Un format facile à lire sur mobile et desktop

