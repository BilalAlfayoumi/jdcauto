import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { 
  FileText, 
  UserCheck, 
  FileSignature, 
  CreditCard,
  CheckCircle,
  Clock,
  Shield,
  Phone
} from 'lucide-react';

export default function Administrative() {
  const services = [
    {
      icon: FileText,
      title: 'Carte grise',
      description: 'Obtention ou renouvellement de votre certificat d\'immatriculation en ligne',
      details: [
        'Démarches 100% en ligne',
        'Traitement rapide sous 24-48h',
        'Envoi sécurisé de votre carte grise',
        'Suivi en temps réel'
      ]
    },
    {
      icon: UserCheck,
      title: 'Changement de propriétaire',
      description: 'Transfert de la carte grise lors de l\'achat d\'un véhicule d\'occasion',
      details: [
        'Déclaration de cession',
        'Mise à jour du certificat d\'immatriculation',
        'Conformité avec l\'ANTS',
        'Accompagnement personnalisé'
      ]
    },
    {
      icon: FileSignature,
      title: 'Certificat de cession',
      description: 'Document officiel obligatoire pour toute vente de véhicule',
      details: [
        'Rédaction conforme à la réglementation',
        'Signature électronique sécurisée',
        'Conservation légale des documents',
        'Envoi aux autorités compétentes'
      ]
    },
    {
      icon: CreditCard,
      title: 'Immatriculation',
      description: 'Première immatriculation de véhicule neuf ou importé',
      details: [
        'Véhicules neufs',
        'Véhicules importés',
        'Changement de région',
        'Plaques d\'immatriculation fournies'
      ]
    }
  ];

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="relative bg-black text-white py-16 overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0 z-0">
          <img
            src="/jdcauto-1.jpg"
            alt="JDC Auto"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/70 to-black/80 z-0" />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 z-10">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Carte grise & démarches administratives
          </h1>
          <p className="text-xl text-gray-300">
            Nous gérons toutes vos démarches administratives en toute simplicité
          </p>
        </div>
      </div>

      {/* Introduction */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="bg-white rounded-lg shadow-md p-8 mb-12">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Des démarches simplifiées et rapides
            </h2>
            <p className="text-lg text-gray-700 leading-relaxed mb-6">
              Chez <strong>JDC Auto</strong>, nous prenons en charge l'ensemble de vos démarches administratives liées à votre véhicule. Fini les complications et les files d'attente : nous nous occupons de tout pour que vous puissiez profiter rapidement de votre nouvelle voiture.
            </p>
            <div className="flex flex-wrap justify-center gap-8 mt-8">
              <div className="flex items-center gap-2 text-gray-700">
                <CheckCircle className="w-6 h-6 text-green-600" />
                <span className="font-semibold">100% en ligne</span>
              </div>
              <div className="flex items-center gap-2 text-gray-700">
                <Clock className="w-6 h-6 text-blue-600" />
                <span className="font-semibold">Rapide et efficace</span>
              </div>
              <div className="flex items-center gap-2 text-gray-700">
                <Shield className="w-6 h-6 text-red-600" />
                <span className="font-semibold">Sécurisé et conforme</span>
              </div>
            </div>
          </div>
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          {services.map((service, index) => (
            <div key={index} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow">
              <div className="bg-gradient-to-r from-red-600 to-red-700 p-6">
                <div className="flex items-center gap-4 text-white">
                  <div className="bg-white/20 p-3 rounded-lg">
                    <service.icon className="w-8 h-8" />
                  </div>
                  <h3 className="text-2xl font-bold">{service.title}</h3>
                </div>
              </div>
              <div className="p-6">
                <p className="text-gray-700 mb-4">{service.description}</p>
                <ul className="space-y-2">
                  {service.details.map((detail, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-sm text-gray-600">
                      <CheckCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
                      <span>{detail}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>

        {/* Process Section */}
        <div className="bg-white rounded-lg shadow-md p-8 mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
            Notre processus en 4 étapes
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[
              {
                step: '1',
                title: 'Collecte des documents',
                desc: 'Nous recueillons tous les documents nécessaires'
              },
              {
                step: '2',
                title: 'Vérification',
                desc: 'Contrôle de conformité et validation des informations'
              },
              {
                step: '3',
                title: 'Traitement',
                desc: 'Envoi sécurisé de votre dossier aux autorités'
              },
              {
                step: '4',
                title: 'Réception',
                desc: 'Vous recevez vos documents directement chez vous'
              }
            ].map((item, index) => (
              <div key={index} className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-red-600 text-white rounded-full text-2xl font-bold mb-4">
                  {item.step}
                </div>
                <h4 className="text-lg font-bold text-gray-900 mb-2">{item.title}</h4>
                <p className="text-sm text-gray-600">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Documents Required */}
        <div className="bg-gray-900 text-white rounded-lg p-8 mb-12">
          <h2 className="text-2xl font-bold mb-6 text-center">
            Documents généralement nécessaires
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-4xl mx-auto">
            {[
              'Pièce d\'identité en cours de validité',
              'Justificatif de domicile de moins de 6 mois',
              'Permis de conduire',
              'Certificat de cession (pour occasion)',
              'Contrôle technique de moins de 6 mois (si véhicule de plus de 4 ans)',
              'Ancienne carte grise barrée et signée',
              'Demande de certificat d\'immatriculation',
              'Certificat de conformité (si véhicule neuf ou importé)'
            ].map((doc, index) => (
              <div key={index} className="flex items-start gap-3 bg-white/10 p-4 rounded-lg">
                <CheckCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                <span className="text-sm">{doc}</span>
              </div>
            ))}
          </div>
          <p className="text-center text-gray-400 text-sm mt-6">
            * Les documents requis peuvent varier selon votre situation. Nous vous accompagnons pour constituer votre dossier.
          </p>
        </div>

        {/* Pricing */}
        <div className="bg-white rounded-lg shadow-md p-8 mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-6 text-center">
            Tarifs transparents
          </h2>
          <div className="max-w-4xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="border-2 border-gray-200 rounded-lg p-6 text-center hover:border-red-600 transition-colors">
                <h3 className="text-xl font-bold text-gray-900 mb-2">Carte grise</h3>
                <div className="text-3xl font-bold text-red-600 mb-4">À partir de 50€</div>
                <p className="text-sm text-gray-600">+ taxes régionales</p>
              </div>
              <div className="border-2 border-red-600 rounded-lg p-6 text-center bg-red-50">
                <div className="inline-block bg-red-600 text-white text-xs font-bold px-3 py-1 rounded-full mb-2">
                  POPULAIRE
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Pack complet</h3>
                <div className="text-3xl font-bold text-red-600 mb-4">120€</div>
                <p className="text-sm text-gray-600">Toutes démarches incluses</p>
              </div>
              <div className="border-2 border-gray-200 rounded-lg p-6 text-center hover:border-red-600 transition-colors">
                <h3 className="text-xl font-bold text-gray-900 mb-2">Changement titulaire</h3>
                <div className="text-3xl font-bold text-red-600 mb-4">75€</div>
                <p className="text-sm text-gray-600">+ taxes régionales</p>
              </div>
            </div>
            <p className="text-center text-gray-600 text-sm mt-6">
              Les tarifs affichés sont TTC et ne comprennent pas les taxes régionales qui varient selon votre département.
            </p>
          </div>
        </div>

        {/* CTA */}
        <div className="bg-gradient-to-r from-red-600 to-red-700 rounded-lg p-8 md:p-12 text-center text-white">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Besoin d'aide pour vos démarches ?
          </h2>
          <p className="text-xl mb-8 text-red-100">
            Notre équipe est à votre disposition pour vous accompagner
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link
              to={createPageUrl('Contact')}
              className="px-8 py-4 bg-white text-red-600 hover:bg-gray-100 font-semibold rounded-md transition-colors inline-flex items-center gap-2"
            >
              <FileText className="w-5 h-5" />
              Nous contacter
            </Link>
            <a
              href="tel:0556973752"
              className="px-8 py-4 bg-black hover:bg-gray-900 text-white font-semibold rounded-md transition-colors inline-flex items-center gap-2"
            >
              <Phone className="w-5 h-5" />
              05 56 97 37 52
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}