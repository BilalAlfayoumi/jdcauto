import React from 'react';
import AnimatedSection from '../Components/AnimatedSection';
import { FileText, AlertCircle } from 'lucide-react';

export default function CGV() {
  return (
    <div className="bg-gray-50 min-h-screen py-12">
      <div className="max-w-4xl mx-auto px-4">
        <AnimatedSection animation="fade-up">
          <div className="bg-white rounded-xl shadow-lg p-8 md:p-12">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
                <FileText className="w-6 h-6 text-red-600" />
              </div>
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900">Conditions générales de vente</h1>
            </div>

            <div className="prose prose-gray max-w-none space-y-8">
              {/* Préambule */}
              <section>
                <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-6">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                    <p className="text-blue-800 text-sm">
                      Les présentes conditions générales de vente s'appliquent à toutes les ventes de véhicules 
                      d'occasion effectuées par JDC AUTO. Toute commande implique l'acceptation sans réserve de 
                      ces conditions générales.
                    </p>
                  </div>
                </div>
              </section>

              {/* Article 1 */}
              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Article 1 - Objet</h2>
                <p className="text-gray-700 leading-relaxed">
                  Les présentes conditions générales de vente ont pour objet de définir les conditions et modalités 
                  de vente des véhicules d'occasion proposés par JDC AUTO, situé au 93 Av. de Magudas, 33700 Mérignac, France.
                </p>
              </section>

              {/* Article 2 */}
              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Article 2 - Prix</h2>
                <p className="text-gray-700 leading-relaxed">
                  Les prix des véhicules sont indiqués en euros, toutes taxes comprises (TTC). Les prix sont valables 
                  tant qu'ils sont visibles sur le site et peuvent être modifiés à tout moment sans préavis.
                </p>
                <p className="text-gray-700 leading-relaxed mt-4">
                  Les prix ne comprennent pas les frais de carte grise, d'immatriculation, ni les éventuels frais 
                  de livraison, sauf mention contraire.
                </p>
              </section>

              {/* Article 3 */}
              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Article 3 - Commande</h2>
                <p className="text-gray-700 leading-relaxed">
                  Toute commande de véhicule doit être confirmée par un acompte ou un versement intégral selon les 
                  modalités convenues entre les parties. La vente ne sera définitive qu'après signature du contrat 
                  de vente et paiement du solde.
                </p>
              </section>

              {/* Article 4 */}
              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Article 4 - Garantie</h2>
                <p className="text-gray-700 leading-relaxed">
                  Conformément à la législation en vigueur, tous les véhicules d'occasion vendus par JDC AUTO bénéficient 
                  d'une garantie légale de conformité et d'une garantie contre les vices cachés.
                </p>
                <p className="text-gray-700 leading-relaxed mt-4">
                  Une garantie commerciale supplémentaire peut être proposée selon les conditions spécifiques à chaque véhicule.
                </p>
              </section>

              {/* Article 5 */}
              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Article 5 - Livraison</h2>
                <p className="text-gray-700 leading-relaxed">
                  La livraison du véhicule s'effectue au siège de JDC AUTO ou à l'adresse convenue, selon les modalités 
                  convenues entre les parties. Les délais de livraison sont indicatifs et ne sauraient engager la 
                  responsabilité de JDC AUTO en cas de retard.
                </p>
              </section>

              {/* Article 6 */}
              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Article 6 - Paiement</h2>
                <p className="text-gray-700 leading-relaxed">
                  Le paiement peut s'effectuer par virement bancaire, chèque ou espèces dans les limites légales. 
                  Un financement peut être proposé par nos partenaires financiers selon les conditions en vigueur.
                </p>
              </section>

              {/* Article 7 */}
              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Article 7 - Droit de rétractation</h2>
                <p className="text-gray-700 leading-relaxed">
                  Conformément à la législation en vigueur, le client dispose d'un droit de rétractation de 14 jours 
                  à compter de la signature du contrat de vente, sous réserve des conditions légales applicables.
                </p>
              </section>

              {/* Article 8 */}
              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Article 8 - Réclamations</h2>
                <p className="text-gray-700 leading-relaxed">
                  Toute réclamation doit être adressée par écrit à JDC AUTO à l'adresse suivante : 
                  93 Av. de Magudas, 33700 Mérignac, France, ou par email à jdcauto33@orange.fr
                </p>
              </section>

              {/* Article 9 */}
              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Article 9 - Droit applicable</h2>
                <p className="text-gray-700 leading-relaxed">
                  Les présentes conditions générales de vente sont régies par le droit français. Tout litige relatif 
                  à leur interprétation et/ou à leur exécution relève des tribunaux français.
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

