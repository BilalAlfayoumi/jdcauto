# 📧 Template EmailJS pour Contact Véhicule

## 🎨 Template HTML avec Informations Véhicule

Ce template est spécialement conçu pour les demandes de contact depuis la page de détail d'un véhicule. Il inclut toutes les informations du véhicule pour que vous sachiez immédiatement de quel véhicule il s'agit.

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
                🚗 Demande de Contact Véhicule
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

          <!-- Photo et infos véhicule -->
          {{#if vehicle_image}}
          <tr>
            <td style="padding: 30px 40px 20px 40px; background-color: #f9fafb; border-bottom: 1px solid #e5e7eb;">
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                <tr>
                  <td width="150" style="vertical-align: top; padding-right: 20px;">
                    <img src="{{vehicle_image}}" alt="{{vehicle_brand}} {{vehicle_model}}" style="width: 150px; height: 100px; object-fit: cover; border-radius: 8px; border: 2px solid #e5e7eb;" />
                  </td>
                  <td style="vertical-align: top;">
                    <h2 style="margin: 0 0 10px 0; color: #1f2937; font-size: 22px; font-weight: 700;">
                      {{vehicle_brand}} {{vehicle_model}}
                    </h2>
                    <div style="color: #dc2626; font-size: 24px; font-weight: 700; margin-bottom: 10px;">
                      {{vehicle_price}}
                    </div>
                    <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="font-size: 13px; color: #6b7280;">
                      {{#if vehicle_reference}}
                      <tr>
                        <td style="padding: 3px 0;"><strong>Référence:</strong></td>
                        <td style="padding: 3px 0; padding-left: 10px;">{{vehicle_reference}}</td>
                      </tr>
                      {{/if}}
                      <tr>
                        <td style="padding: 3px 0;"><strong>Année:</strong></td>
                        <td style="padding: 3px 0; padding-left: 10px;">{{vehicle_year}}</td>
                      </tr>
                      <tr>
                        <td style="padding: 3px 0;"><strong>Kilométrage:</strong></td>
                        <td style="padding: 3px 0; padding-left: 10px;">{{vehicle_mileage}}</td>
                      </tr>
                      <tr>
                        <td style="padding: 3px 0;"><strong>Carburant:</strong></td>
                        <td style="padding: 3px 0; padding-left: 10px;">{{vehicle_fuel}}</td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          {{/if}}

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

          <!-- Message avec infos véhicule -->
          <tr>
            <td style="padding: 0 40px 30px 40px;">
              <div style="background-color: #f9fafb; border-left: 4px solid #dc2626; padding: 20px; border-radius: 8px; margin-top: 10px;">
                <h3 style="margin: 0 0 12px 0; color: #1f2937; font-size: 16px; font-weight: 600;">
                  💬 Message
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

## ⚠️ Note importante

EmailJS utilise des variables simples `{{variable}}` et ne supporte pas les conditions `{{#if}}`. 

**Version simplifiée sans conditions :**

```html
<!-- Photo et infos véhicule -->
<tr>
  <td style="padding: 30px 40px 20px 40px; background-color: #f9fafb; border-bottom: 1px solid #e5e7eb;">
    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
      <tr>
        <td width="150" style="vertical-align: top; padding-right: 20px;">
          <img src="{{vehicle_image}}" alt="{{vehicle_brand}} {{vehicle_model}}" style="width: 150px; height: 100px; object-fit: cover; border-radius: 8px; border: 2px solid #e5e7eb;" />
        </td>
        <td style="vertical-align: top;">
          <h2 style="margin: 0 0 10px 0; color: #1f2937; font-size: 22px; font-weight: 700;">
            {{vehicle_brand}} {{vehicle_model}}
          </h2>
          <div style="color: #dc2626; font-size: 24px; font-weight: 700; margin-bottom: 10px;">
            {{vehicle_price}}
          </div>
          <div style="font-size: 13px; color: #6b7280; line-height: 1.8;">
            <div><strong>Référence:</strong> {{vehicle_reference}}</div>
            <div><strong>Année:</strong> {{vehicle_year}}</div>
            <div><strong>Kilométrage:</strong> {{vehicle_mileage}}</div>
            <div><strong>Carburant:</strong> {{vehicle_fuel}}</div>
          </div>
        </td>
      </tr>
    </table>
  </td>
</tr>
```

## 📝 Variables utilisées

- `{{from_name}}` : Nom complet
- `{{from_email}}` : Email
- `{{phone}}` : Téléphone
- `{{message}}` : Message (contient déjà les infos véhicule)
- `{{subject}}` : Sujet
- `{{type}}` : Type de demande
- `{{vehicle_image}}` : URL de la photo principale
- `{{vehicle_reference}}` : Référence véhicule
- `{{vehicle_brand}}` : Marque
- `{{vehicle_model}}` : Modèle
- `{{vehicle_price}}` : Prix formaté
- `{{vehicle_year}}` : Année
- `{{vehicle_mileage}}` : Kilométrage
- `{{vehicle_fuel}}` : Carburant

## 🎯 Utilisation

1. Aller dans EmailJS Dashboard → Email Templates
2. Ouvrir le template `template_sq3rlfb`
3. Remplacer le contenu par le template ci-dessus
4. Sauvegarder

Le message contiendra automatiquement toutes les infos du véhicule grâce au code JavaScript qui les inclut dans la variable `{{message}}`.

