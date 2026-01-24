import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import HeroSlider from '../Components/HeroSlider';
import VehicleCarousel from '../Components/VehicleCarousel';
import AnimatedSection from '../Components/AnimatedSection';
import { 
  Shield, 
  Award, 
  Lock, 
  Heart, 
  Star, 
  TrendingDown,
  Car,
  FileText,
  Handshake,
  CreditCard,
  ChevronRight,
  Search,
  CheckCircle,
  Users,
  Clock
} from 'lucide-react';

export default function Home() {
  // Fetch featured vehicles
  const { data: vehicles = [], isLoading } = useQuery({
    queryKey: ['vehicles-featured'],
    queryFn: () => base44.entities.Vehicle.filter({ status: 'Disponible' }, '-created_date', 8),
  });

  return (
    <div className="bg-white">
      {/* Hero Slider */}
      <HeroSlider />

      {/* Search Bar - Below Hero */}
      <AnimatedSection animation="fade-up" className="max-w-5xl mx-auto px-4 -mt-8 relative z-30">
        <div className="bg-white rounded-xl shadow-2xl p-6 border border-gray-100">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <select className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600 transition-all">
              <option value="">Marque</option>
              <option>Renault</option>
              <option>Peugeot</option>
              <option>Citroën</option>
              <option>BMW</option>
              <option>Mercedes</option>
              <option>Audi</option>
            </select>
            <select className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600 transition-all">
              <option value="">Modèle</option>
            </select>
            <select className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600 transition-all">
              <option value="">Prix maxi.</option>
              <option value="10000">10 000 €</option>
              <option value="15000">15 000 €</option>
              <option value="20000">20 000 €</option>
              <option value="30000">30 000 €</option>
            </select>
            <Link
              to={createPageUrl('Vehicles')}
              className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg transition-all duration-300 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              <Search className="w-5 h-5" />
              Rechercher
            </Link>
          </div>
        </div>
      </AnimatedSection>

      {/* Featured Vehicles Carousel */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <AnimatedSection animation="fade-up">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
              Véhicules à la une
            </h2>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              Découvrez notre sélection de véhicules d'occasion contrôlés et garantis
            </p>
          </div>
        </AnimatedSection>

        <AnimatedSection animation="fade-up" delay={200}>
          <VehicleCarousel vehicles={vehicles} isLoading={isLoading} />
        </AnimatedSection>

        <AnimatedSection animation="fade-up" delay={400} className="text-center mt-12">
          <Link
            to={createPageUrl('Vehicles')}
            className="inline-flex items-center gap-2 px-8 py-4 bg-black hover:bg-red-600 text-white font-semibold rounded-lg transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
          >
            Voir tous les véhicules
            <ChevronRight className="w-5 h-5" />
          </Link>
        </AnimatedSection>
      </section>

      {/* Trust & Reassurance Section */}
      <section className="bg-gradient-to-b from-gray-50 to-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimatedSection animation="fade-up">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
                Pourquoi choisir JDC Auto ?
              </h2>
              <p className="text-gray-600 text-lg max-w-2xl mx-auto">
                Votre satisfaction et votre confiance sont notre priorité
              </p>
            </div>
          </AnimatedSection>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              { 
                icon: Award, 
                title: 'Professionnalisme', 
                desc: 'Une équipe d\'experts automobile à votre service',
                color: 'text-blue-600 bg-blue-50'
              },
              { 
                icon: Shield, 
                title: 'Garantie 6 mois minimum', 
                desc: 'Tous nos véhicules sont garantis et contrôlés',
                color: 'text-green-600 bg-green-50'
              },
              { 
                icon: Lock, 
                title: 'Achat sécurisé', 
                desc: 'Transactions sécurisées et transparentes',
                color: 'text-purple-600 bg-purple-50'
              },
              { 
                icon: Heart, 
                title: 'Accompagnement personnalisé', 
                desc: 'Des milliers de clients satisfaits',
                color: 'text-pink-600 bg-pink-50'
              },
              { 
                icon: Star, 
                title: 'Meilleur rapport qualité/prix', 
                desc: 'Véhicules contrôlés et prix justes',
                color: 'text-yellow-600 bg-yellow-50'
              },
              { 
                icon: TrendingDown, 
                title: 'Prix compétitifs', 
                desc: 'Les meilleurs prix du marché',
                color: 'text-red-600 bg-red-50'
              }
            ].map((item, index) => (
              <AnimatedSection 
                key={index} 
                animation="fade-up" 
                delay={index * 100}
              >
                <div className="bg-white p-8 rounded-xl shadow-md hover:shadow-xl transition-all duration-300 text-center group border border-gray-100 hover:border-red-200">
                  <div className={`inline-flex items-center justify-center w-16 h-16 ${item.color} rounded-2xl mb-6 group-hover:scale-110 transition-transform duration-300`}>
                    <item.icon className="w-8 h-8" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-red-600 transition-colors">
                    {item.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed">{item.desc}</p>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <AnimatedSection animation="fade-up">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
              Nos services
            </h2>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              Un accompagnement complet pour votre projet automobile
            </p>
          </div>
        </AnimatedSection>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            {
              icon: Car,
              title: 'Garantie des véhicules',
              desc: 'Garantie minimum de 6 mois sur tous nos véhicules d\'occasion',
              link: 'Vehicles',
              features: ['Contrôle technique', 'Garantie mécanique', 'Assistance 24/7']
            },
            {
              icon: Handshake,
              title: 'Reprise de véhicules',
              desc: 'Estimation gratuite et rapide de votre véhicule en quelques minutes',
              link: 'TradeIn',
              features: ['Estimation gratuite', 'Reprise immédiate', 'Paiement sécurisé']
            },
            {
              icon: FileText,
              title: 'Démarches administratives',
              desc: 'Gestion complète de votre carte grise et de toutes les formalités',
              link: 'Administrative',
              features: ['Carte grise', 'Changement de propriétaire', 'Démarches en ligne']
            },
            {
              icon: CreditCard,
              title: 'Solutions de financement',
              desc: 'Crédit auto, LOA et LLD adaptés à votre budget et votre projet',
              link: 'Contact',
              features: ['Crédit auto', 'LOA / LLD', 'Simulation gratuite']
            }
          ].map((service, index) => (
            <AnimatedSection 
              key={index} 
              animation="zoom-in" 
              delay={index * 150}
            >
              <Link
                to={createPageUrl(service.link)}
                className="bg-white p-8 rounded-xl shadow-md hover:shadow-2xl transition-all duration-300 border-2 border-transparent hover:border-red-600 group h-full flex flex-col"
              >
                <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-2xl mb-6 group-hover:bg-red-600 transition-colors duration-300">
                  <service.icon className="w-8 h-8 text-red-600 group-hover:text-white transition-colors" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-red-600 transition-colors">
                  {service.title}
                </h3>
                <p className="text-gray-600 text-sm mb-6 flex-grow">
                  {service.desc}
                </p>
                <ul className="space-y-2">
                  {service.features.map((feature, idx) => (
                    <li key={idx} className="flex items-center gap-2 text-sm text-gray-600">
                      <CheckCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </Link>
            </AnimatedSection>
          ))}
        </div>
      </section>

      {/* About Section */}
      <section className="relative text-white py-20 overflow-hidden min-h-[500px]">
        {/* Background Image */}
        <div className="absolute inset-0 z-0">
          <img
            src="/jdcauto-2.jpg"
            alt="JDC Auto"
            className="w-full h-full object-cover"
            style={{ minHeight: '100%' }}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/60 to-black/70 z-0" />
        </div>

        {/* Content */}
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 z-10">
          <AnimatedSection animation="fade-up">
            <div className="max-w-4xl mx-auto text-center">
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-8">
                À propos de JDC Auto
              </h2>
              <div className="space-y-6 text-lg text-gray-200 leading-relaxed">
                <p>
                  <strong className="text-white">JDC Auto</strong> est une agence de transaction automobile qui se positionne comme un <strong className="text-white">intermédiaire de confiance</strong> entre acheteurs et vendeurs de véhicules d'occasion.
                </p>
                <p>
                  Notre mission est de vous accompagner dans l'achat ou la vente de votre véhicule en toute <strong className="text-white">sécurité et transparence</strong>. Nous prenons en charge toutes les démarches administratives pour vous garantir une transaction sereine.
                </p>
                <p>
                  Avec JDC Auto, bénéficiez d'un service professionnel, de véhicules contrôlés et d'une <strong className="text-white">garantie minimum de 6 mois</strong> sur tous nos véhicules.
                </p>
              </div>
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-red-600 to-red-700 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <AnimatedSection animation="zoom-in">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
              Prêt à trouver votre prochain véhicule ?
            </h2>
            <p className="text-xl mb-10 text-red-100 max-w-2xl mx-auto">
              Contactez-nous dès maintenant pour plus d'informations ou pour une estimation gratuite
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Link
                to={createPageUrl('Contact')}
                className="px-8 py-4 bg-white text-red-600 hover:bg-gray-100 font-semibold rounded-lg transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
              >
                Nous contacter
              </Link>
              <a
                href="tel:0556973752"
                className="px-8 py-4 bg-black/20 backdrop-blur-sm hover:bg-black/30 text-white font-semibold rounded-lg transition-all duration-300 border-2 border-white/30 hover:border-white/50"
              >
                Appeler maintenant
              </a>
            </div>
          </AnimatedSection>
        </div>
      </section>
    </div>
  );
}
