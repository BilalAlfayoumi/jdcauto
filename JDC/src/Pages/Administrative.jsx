import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { useParallax } from '../hooks/useParallax';
import AnimatedSection from '../Components/AnimatedSection';
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
  const { opacity, translateY } = useParallax();
  const [isLoaded, setIsLoaded] = useState(false);
  
  useEffect(() => {
    setIsLoaded(true);
  }, []);
  
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
      {/* Hero Section avec image dynamique et effets de scroll */}
      <div className="relative h-[90vh] min-h-[600px] overflow-hidden">
        {/* Image de fond avec effets de parallaxe et fade-out */}
        <div 
          className="absolute inset-0 w-full h-[120%] bg-cover bg-center bg-no-repeat transition-all duration-1000 ease-out"
          style={{
            backgroundImage: 'url(/jdcauto-2.jpg)',
            opacity: isLoaded ? opacity : 0,
            transform: isLoaded ? `translateY(${translateY}px) scale(1)` : 'translateY(0px) scale(1.1)',
            transition: 'opacity 0.8s ease-out, transform 0.8s ease-out',
            willChange: 'opacity, transform'
          }}
        >
          {/* Overlay gradient pour améliorer la lisibilité */}
          <div 
            className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/80 transition-opacity duration-1000"
            style={{
              opacity: isLoaded ? 1 : 0
            }}
          />
        </div>

        {/* Contenu hero */}
        <div className="relative z-10 h-full flex items-center justify-center">
          <div className="max-w-7xl mx-auto px-4 text-center">
            <div 
              className="max-w-4xl mx-auto transition-all duration-1000 ease-out"
              style={{
                opacity: isLoaded ? 1 : 0,
                transform: isLoaded ? 'scale(1) translateY(0)' : 'scale(0.8) translateY(30px)',
                transition: 'opacity 0.8s ease-out 0.2s, transform 0.8s cubic-bezier(0.34, 1.56, 0.64, 1) 0.2s'
              }}
            >
              <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight">
                Carte grise & démarches administratives
              </h1>
              <p 
                className="text-xl md:text-2xl lg:text-3xl text-gray-200 mb-10 font-light transition-all duration-1000 ease-out"
                style={{
                  opacity: isLoaded ? 1 : 0,
                  transform: isLoaded ? 'translateY(0)' : 'translateY(20px)',
                  transition: 'opacity 0.8s ease-out 0.4s, transform 0.8s ease-out 0.4s'
                }}
              >
                Nous gérons toutes vos démarches administratives en toute simplicité
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Introduction */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        <AnimatedSection animation="fade-up">
          <div className="bg-white rounded-lg shadow-md p-8 mb-12">
            <div className="max-w-3xl mx-auto text-center">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Des démarches simplifiées et rapides
              </h2>
              <p className="text-lg text-gray-700 leading-relaxed mb-6">
                Chez <strong>JDC Auto</strong>, nous avons un <strong>point carte grise</strong> qui vous permettra d'établir votre nouvelle carte grise en <strong>15 minutes</strong>. Nous prenons en charge l'ensemble de vos démarches administratives liées à votre véhicule. Fini les complications et les files d'attente : nous nous occupons de tout pour que vous puissiez profiter rapidement de votre nouvelle voiture.
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
        </AnimatedSection>

        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          {services.map((service, index) => (
            <AnimatedSection key={index} animation="fade-up" delay={index * 100}>
              <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow">
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
            </AnimatedSection>
          ))}
        </div>

        {/* Process Section */}
        <AnimatedSection animation="fade-up">
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
                <AnimatedSection key={index} animation="fade-up" delay={index * 100}>
                  <div className="text-center">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-red-600 text-white rounded-full text-2xl font-bold mb-4">
                      {item.step}
                    </div>
                    <h4 className="text-lg font-bold text-gray-900 mb-2">{item.title}</h4>
                    <p className="text-sm text-gray-600">{item.desc}</p>
                  </div>
                </AnimatedSection>
              ))}
            </div>
          </div>
        </AnimatedSection>

        {/* Documents Required */}
        <AnimatedSection animation="fade-up">
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
        </AnimatedSection>

        {/* Pricing */}
        <AnimatedSection animation="fade-up">
          <div className="bg-white rounded-lg shadow-md p-8 mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-6 text-center">
              Tarifs transparents
            </h2>
            <div className="max-w-4xl mx-auto">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                  {
                    title: 'Carte grise',
                    price: 'À partir de 50€',
                    desc: '+ taxes régionales',
                    popular: false
                  },
                  {
                    title: 'Pack complet',
                    price: '120€',
                    desc: 'Toutes démarches incluses',
                    popular: true
                  },
                  {
                    title: 'Changement titulaire',
                    price: '75€',
                    desc: '+ taxes régionales',
                    popular: false
                  }
                ].map((item, index) => (
                  <AnimatedSection key={index} animation="fade-up" delay={index * 100}>
                    <div className={`border-2 ${item.popular ? 'border-red-600 bg-red-50' : 'border-gray-200 hover:border-red-600'} rounded-lg p-6 text-center transition-colors`}>
                      {item.popular && (
                        <div className="inline-block bg-red-600 text-white text-xs font-bold px-3 py-1 rounded-full mb-2">
                          POPULAIRE
                        </div>
                      )}
                      <h3 className="text-xl font-bold text-gray-900 mb-2">{item.title}</h3>
                      <div className="text-3xl font-bold text-red-600 mb-4">{item.price}</div>
                      <p className="text-sm text-gray-600">{item.desc}</p>
                    </div>
                  </AnimatedSection>
                ))}
              </div>
              <p className="text-center text-gray-600 text-sm mt-6">
                Les tarifs affichés sont TTC et ne comprennent pas les taxes régionales qui varient selon votre département.
              </p>
            </div>
          </div>
        </AnimatedSection>

        {/* CTA */}
        <AnimatedSection animation="fade-up">
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
                href="tel:+33556973752"
                className="px-8 py-4 bg-black hover:bg-gray-900 text-white font-semibold rounded-md transition-colors inline-flex items-center gap-2"
              >
                <Phone className="w-5 h-5" />
                +33 5 56 97 37 52
              </a>
            </div>
          </div>
        </AnimatedSection>
      </div>
    </div>
  );
}