import React from 'react';
import AnimatedSection from '../Components/AnimatedSection';
import { Shield, Lock, Eye, UserCheck, Mail } from 'lucide-react';

export default function PolitiqueConfidentialite() {
  return (
    <div className="bg-gray-50 min-h-screen py-12">
      <div className="max-w-4xl mx-auto px-4">
        <AnimatedSection animation="fade-up">
          <div className="bg-white rounded-xl shadow-lg p-8 md:p-12">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
                <Shield className="w-6 h-6 text-red-600" />
              </div>
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900">Politique de confidentialité</h1>
            </div>

            <div className="prose prose-gray max-w-none space-y-8">
              {/* Introduction */}
              <section>
                <p className="text-gray-700 leading-relaxed">
                  JDC AUTO s'engage à protéger la confidentialité des informations personnelles que vous nous confiez. 
                  La présente politique de confidentialité explique comment nous collectons, utilisons et protégeons 
                  vos données personnelles conformément au Règlement Général sur la Protection des Données (RGPD).
                </p>
              </section>

              {/* Collecte des données */}
              <section>
                <div className="flex items-start gap-3 mb-4">
                  <Lock className="w-6 h-6 text-red-600 mt-1 flex-shrink-0" />
                  <h2 className="text-2xl font-bold text-gray-900">1. Collecte des données personnelles</h2>
                </div>
                <p className="text-gray-700 leading-relaxed mb-4">
                  Nous collectons les données personnelles suivantes lorsque vous utilisez nos services :
                </p>
                <ul className="list-disc list-inside space-y-2 text-gray-700 ml-6">
                  <li>Nom et prénom</li>
                  <li>Adresse email</li>
                  <li>Numéro de téléphone</li>
                  <li>Adresse postale (si nécessaire pour la livraison)</li>
                  <li>Informations relatives aux véhicules qui vous intéressent</li>
                  <li>Données de navigation (cookies, adresse IP)</li>
                </ul>
              </section>

              {/* Utilisation des données */}
              <section>
                <div className="flex items-start gap-3 mb-4">
                  <Eye className="w-6 h-6 text-red-600 mt-1 flex-shrink-0" />
                  <h2 className="text-2xl font-bold text-gray-900">2. Utilisation des données</h2>
                </div>
                <p className="text-gray-700 leading-relaxed mb-4">
                  Vos données personnelles sont utilisées pour :
                </p>
                <ul className="list-disc list-inside space-y-2 text-gray-700 ml-6">
                  <li>Traiter vos demandes de contact et de renseignements</li>
                  <li>Vous contacter concernant les véhicules qui vous intéressent</li>
                  <li>Gérer les commandes et les transactions</li>
                  <li>Améliorer nos services et votre expérience utilisateur</li>
                  <li>Vous envoyer des communications commerciales (avec votre consentement)</li>
                  <li>Respecter nos obligations légales et réglementaires</li>
                </ul>
              </section>

              {/* Conservation des données */}
              <section>
                <div className="flex items-start gap-3 mb-4">
                  <Lock className="w-6 h-6 text-red-600 mt-1 flex-shrink-0" />
                  <h2 className="text-2xl font-bold text-gray-900">3. Conservation des données</h2>
                </div>
                <p className="text-gray-700 leading-relaxed">
                  Vos données personnelles sont conservées pendant la durée nécessaire aux finalités pour lesquelles 
                  elles ont été collectées, conformément aux obligations légales et réglementaires applicables.
                </p>
              </section>

              {/* Partage des données */}
              <section>
                <div className="flex items-start gap-3 mb-4">
                  <UserCheck className="w-6 h-6 text-red-600 mt-1 flex-shrink-0" />
                  <h2 className="text-2xl font-bold text-gray-900">4. Partage des données</h2>
                </div>
                <p className="text-gray-700 leading-relaxed">
                  JDC AUTO ne vend, ne loue ni ne partage vos données personnelles à des tiers, sauf dans les cas suivants :
                </p>
                <ul className="list-disc list-inside space-y-2 text-gray-700 ml-6 mt-4">
                  <li>Avec votre consentement explicite</li>
                  <li>Pour répondre à une obligation légale ou réglementaire</li>
                  <li>Avec nos partenaires de financement (si vous sollicitez un financement)</li>
                  <li>Avec nos prestataires de services (hébergement, maintenance) sous contrat de confidentialité</li>
                </ul>
              </section>

              {/* Vos droits */}
              <section>
                <div className="flex items-start gap-3 mb-4">
                  <Shield className="w-6 h-6 text-red-600 mt-1 flex-shrink-0" />
                  <h2 className="text-2xl font-bold text-gray-900">5. Vos droits</h2>
                </div>
                <p className="text-gray-700 leading-relaxed mb-4">
                  Conformément au RGPD, vous disposez des droits suivants concernant vos données personnelles :
                </p>
                <ul className="list-disc list-inside space-y-2 text-gray-700 ml-6">
                  <li><strong>Droit d'accès :</strong> Vous pouvez demander l'accès à vos données personnelles</li>
                  <li><strong>Droit de rectification :</strong> Vous pouvez demander la correction de vos données inexactes</li>
                  <li><strong>Droit à l'effacement :</strong> Vous pouvez demander la suppression de vos données</li>
                  <li><strong>Droit à la portabilité :</strong> Vous pouvez demander la récupération de vos données</li>
                  <li><strong>Droit d'opposition :</strong> Vous pouvez vous opposer au traitement de vos données</li>
                  <li><strong>Droit à la limitation :</strong> Vous pouvez demander la limitation du traitement</li>
                </ul>
                <div className="bg-gray-50 p-4 rounded-lg mt-4">
                  <div className="flex items-start gap-3">
                    <Mail className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-semibold text-gray-900 mb-1">Pour exercer vos droits :</p>
                      <p className="text-gray-700">
                        Contactez-nous par email à <a href="mailto:jdcauto33@orange.fr" className="text-red-600 hover:underline">jdcauto33@orange.fr</a> 
                        ou par courrier à : JDC AUTO, 93 Av. de Magudas, 33700 Mérignac, France
                      </p>
                    </div>
                  </div>
                </div>
              </section>

              {/* Cookies */}
              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">6. Cookies</h2>
                <p className="text-gray-700 leading-relaxed">
                  Notre site utilise des cookies pour améliorer votre expérience de navigation. Vous pouvez configurer 
                  votre navigateur pour refuser les cookies, mais cela peut affecter certaines fonctionnalités du site.
                </p>
              </section>

              {/* Sécurité */}
              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">7. Sécurité des données</h2>
                <p className="text-gray-700 leading-relaxed">
                  JDC AUTO met en œuvre toutes les mesures techniques et organisationnelles appropriées pour protéger 
                  vos données personnelles contre tout accès non autorisé, perte, destruction ou altération.
                </p>
              </section>

              {/* Modifications */}
              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">8. Modifications de la politique</h2>
                <p className="text-gray-700 leading-relaxed">
                  JDC AUTO se réserve le droit de modifier la présente politique de confidentialité à tout moment. 
                  Les modifications seront publiées sur cette page avec indication de la date de mise à jour.
                </p>
              </section>

              {/* Contact */}
              <section className="pt-6 border-t border-gray-200">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">9. Contact</h2>
                <p className="text-gray-700 leading-relaxed">
                  Pour toute question concernant cette politique de confidentialité ou le traitement de vos données 
                  personnelles, vous pouvez nous contacter à l'adresse : jdcauto33@orange.fr
                </p>
              </section>

              {/* Dernière mise à jour */}
              <section className="pt-6 border-t border-gray-200">
                <p className="text-sm text-gray-500">
                  Dernière mise à jour : {new Date().toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric' })}
                </p>
              </section>
            </div>
          </div>
        </AnimatedSection>
      </div>
    </div>
  );
}

