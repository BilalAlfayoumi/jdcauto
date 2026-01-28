# 📧 Template EmailJS pour Reprise de Véhicule

## 🎨 Template HTML pour template_hxzoerj

Copiez ce code dans votre template EmailJS (`template_hxzoerj`) :

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
          
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%); padding: 30px 40px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700; letter-spacing: -0.5px;">
                🔄 Demande de Reprise de Véhicule
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

          <!-- Informations du véhicule à reprendre -->
          <tr>
            <td style="padding: 30px 40px 20px 40px; background-color: #f9fafb; border-bottom: 1px solid #e5e7eb;">
              <h2 style="margin: 0 0 20px 0; color: #1f2937; font-size: 20px; font-weight: 600; border-bottom: 2px solid #e5e7eb; padding-bottom: 10px;">
                🚗 Véhicule à Reprendre
              </h2>
              
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                <tr>
                  <td style="padding: 10px 0; border-bottom: 1px solid #f3f4f6;">
                    <div style="display: flex; justify-content: space-between;">
                      <span style="color: #6b7280; font-size: 14px; font-weight: 500;">Marque</span>
                      <span style="color: #1f2937; font-size: 14px; font-weight: 600;">{{vehicle_brand}}</span>
                    </div>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 10px 0; border-bottom: 1px solid #f3f4f6;">
                    <div style="display: flex; justify-content: space-between;">
                      <span style="color: #6b7280; font-size: 14px; font-weight: 500;">Modèle</span>
                      <span style="color: #1f2937; font-size: 14px; font-weight: 600;">{{vehicle_model}}</span>
                    </div>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 10px 0; border-bottom: 1px solid #f3f4f6;">
                    <div style="display: flex; justify-content: space-between;">
                      <span style="color: #6b7280; font-size: 14px; font-weight: 500;">Version/Finition</span>
                      <span style="color: #1f2937; font-size: 14px; font-weight: 600;">{{vehicle_version}}</span>
                    </div>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 10px 0; border-bottom: 1px solid #f3f4f6;">
                    <div style="display: flex; justify-content: space-between;">
                      <span style="color: #6b7280; font-size: 14px; font-weight: 500;">Année</span>
                      <span style="color: #1f2937; font-size: 14px; font-weight: 600;">{{vehicle_year}}</span>
                    </div>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 10px 0; border-bottom: 1px solid #f3f4f6;">
                    <div style="display: flex; justify-content: space-between;">
                      <span style="color: #6b7280; font-size: 14px; font-weight: 500;">Kilométrage</span>
                      <span style="color: #1f2937; font-size: 14px; font-weight: 600;">{{vehicle_mileage}}</span>
                    </div>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 10px 0;">
                    <div style="display: flex; justify-content: space-between;">
                      <span style="color: #6b7280; font-size: 14px; font-weight: 500;">Carburant</span>
                      <span style="color: #1f2937; font-size: 14px; font-weight: 600;">{{vehicle_fuel}}</span>
                    </div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Projet du client -->
          <tr>
            <td style="padding: 30px 40px 20px 40px; background-color: #fef2f2; border-bottom: 1px solid #fee2e2;">
              <h2 style="margin: 0 0 20px 0; color: #1f2937; font-size: 20px; font-weight: 600; border-bottom: 2px solid #e5e7eb; padding-bottom: 10px;">
                📋 Projet du Client
              </h2>
              
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                <tr>
                  <td style="padding: 10px 0; border-bottom: 1px solid #f3f4f6;">
                    <div style="display: flex; justify-content: space-between;">
                      <span style="color: #6b7280; font-size: 14px; font-weight: 500;">Délai de vente souhaité</span>
                      <span style="color: #1f2937; font-size: 14px; font-weight: 600;">{{sell_delay}}</span>
                    </div>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 10px 0;">
                    <div style="display: flex; justify-content: space-between;">
                      <span style="color: #6b7280; font-size: 14px; font-weight: 500;">Projet d'achat</span>
                      <span style="color: #1f2937; font-size: 14px; font-weight: 600;">{{buying_project}}</span>
                    </div>
                  </td>
                </tr>
              </table>
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
                          {{civility}} {{from_name}}
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
                  <td style="padding: 12px 0;">
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
              </table>
            </td>
          </tr>

          <!-- Message -->
          <tr>
            <td style="padding: 0 40px 30px 40px;">
              <div style="background-color: #f9fafb; border-left: 4px solid #dc2626; padding: 20px; border-radius: 8px; margin-top: 10px;">
                <h3 style="margin: 0 0 12px 0; color: #1f2937; font-size: 16px; font-weight: 600;">
                  💬 Détails de la Demande
                </h3>
                <div style="color: #374151; font-size: 15px; line-height: 1.6; white-space: pre-wrap; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
{{message}}
                </div>
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
                Cet email a été envoyé depuis le formulaire de reprise du site<br>
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

- `{{from_name}}` : Nom complet
- `{{from_email}}` : Email
- `{{phone}}` : Téléphone
- `{{message}}` : Message avec détails véhicule
- `{{subject}}` : Sujet
- `{{type}}` : Type de demande ("Reprise de véhicule")
- `{{civility}}` : Civilité (M / Mme)
- `{{vehicle_brand}}` : Marque
- `{{vehicle_model}}` : Modèle
- `{{vehicle_version}}` : Version/Finition
- `{{vehicle_year}}` : Année
- `{{vehicle_mileage}}` : Kilométrage
- `{{vehicle_fuel}}` : Carburant
- `{{sell_delay}}` : Délai de vente souhaité
- `{{buying_project}}` : Projet d'achat

## ✅ Utilisation

1. Aller dans EmailJS Dashboard → Email Templates
2. Créer un nouveau template ou ouvrir `template_hxzoerj`
3. **Coller** le code HTML ci-dessus
4. Vérifier que le template est associé au service `service_uxxnivr` (Gmail)
5. **Sauvegarder**

## 🎯 Résultat

Vous recevrez des emails avec :
- Toutes les informations du véhicule à reprendre
- Le projet du client (délai, achat)
- Les coordonnées du client
- Un design professionnel aux couleurs JDC Auto

