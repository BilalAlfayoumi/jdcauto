import React from 'react';
import AnimatedSection from '../Components/AnimatedSection';
import { FileText, Building2, Mail, MapPin, Phone } from 'lucide-react';

export default function MentionsLegales() {
  return (
    <div className="bg-gray-50 min-h-screen py-12">
      <div className="max-w-4xl mx-auto px-4">
        <AnimatedSection animation="fade-up">
          <div className="bg-white rounded-xl shadow-lg p-8 md:p-12">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
                <FileText className="w-6 h-6 text-red-600" />
              </div>
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900">Mentions légales</h1>
            </div>

            <div className="prose prose-gray max-w-none space-y-8">
              {/* Informations légales */}
              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Informations légales</h2>
                <div className="bg-gray-50 p-6 rounded-lg space-y-3">
                  <div className="flex items-start gap-3">
                    <Building2 className="w-5 h-5 text-red-600 mt-1 flex-shrink-0" />
                    <div>
                      <p className="font-semibold text-gray-900">Raison sociale :</p>
                      <p className="text-gray-700">JDC AUTO</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <MapPin className="w-5 h-5 text-red-600 mt-1 flex-shrink-0" />
                    <div>
                      <p className="font-semibold text-gray-900">Adresse :</p>
                      <p className="text-gray-700">93 Av. de Magudas<br />33700 Mérignac, France</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Phone className="w-5 h-5 text-red-600 mt-1 flex-shrink-0" />
                    <div>
                      <p className="font-semibold text-gray-900">Téléphone :</p>
                      <p className="text-gray-700">+33 5 56 97 37 52</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Mail className="w-5 h-5 text-red-600 mt-1 flex-shrink-0" />
                    <div>
                      <p className="font-semibold text-gray-900">Email :</p>
                      <p className="text-gray-700">jdcauto33@orange.fr</p>
                    </div>
                  </div>
                </div>
              </section>

              {/* Directeur de publication */}
              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">2. Directeur de publication</h2>
                <p className="text-gray-700 leading-relaxed">
                  Le directeur de la publication est le représentant légal de JDC AUTO.
                </p>
              </section>

              {/* Hébergement */}
              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">3. Hébergement</h2>
                <p className="text-gray-700 leading-relaxed">
                  Ce site est hébergé par Gandi SAS, société par actions simplifiée au capital de 2 300 000 €, 
                  immatriculée au RCS de Paris sous le numéro 423 093 459, dont le siège social est situé au 
                  63-65 boulevard Masséna, 75013 Paris, France.
                </p>
              </section>

              {/* Propriété intellectuelle */}
              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">4. Propriété intellectuelle</h2>
                <p className="text-gray-700 leading-relaxed">
                  L'ensemble de ce site relève de la législation française et internationale sur le droit d'auteur 
                  et la propriété intellectuelle. Tous les droits de reproduction sont réservés, y compris pour les 
                  documents téléchargeables et les représentations iconographiques et photographiques.
                </p>
                <p className="text-gray-700 leading-relaxed mt-4">
                  La reproduction de tout ou partie de ce site sur un support électronique quel qu'il soit est 
                  formellement interdite sauf autorisation expresse du directeur de la publication.
                </p>
              </section>

              {/* Protection des données */}
              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">5. Protection des données personnelles</h2>
                <p className="text-gray-700 leading-relaxed">
                  Conformément à la loi "Informatique et Libertés" du 6 janvier 1978 modifiée et au Règlement 
                  Général sur la Protection des Données (RGPD), vous disposez d'un droit d'accès, de rectification, 
                  de suppression et d'opposition aux données personnelles vous concernant.
                </p>
                <p className="text-gray-700 leading-relaxed mt-4">
                  Pour exercer ce droit, vous pouvez nous contacter à l'adresse : jdcauto33@orange.fr
                </p>
              </section>

              {/* Cookies */}
              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">6. Cookies</h2>
                <p className="text-gray-700 leading-relaxed">
                  Ce site utilise des cookies pour améliorer l'expérience utilisateur. En continuant à naviguer 
                  sur ce site, vous acceptez l'utilisation de cookies conformément à notre politique de confidentialité.
                </p>
              </section>

              {/* Responsabilité */}
              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">7. Responsabilité</h2>
                <p className="text-gray-700 leading-relaxed">
                  JDC AUTO s'efforce d'assurer l'exactitude et la mise à jour des informations diffusées sur ce site, 
                  dont elle se réserve le droit de corriger, à tout moment et sans préavis, le contenu. Toutefois, 
                  JDC AUTO ne peut garantir l'exactitude, la précision ou l'exhaustivité des informations mises à 
                  disposition sur ce site.
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

