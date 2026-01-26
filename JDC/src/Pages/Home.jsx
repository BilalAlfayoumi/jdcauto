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
  CheckCircle,
  Users,
  Clock,
  Wrench,
  Paintbrush,
  MapPin,
  Truck
} from 'lucide-react';

export default function Home() {
  // Fetch featured vehicles
  const { data: vehicles = [], isLoading } = useQuery({
    queryKey: ['vehicles-featured'],
    queryFn: () => base44.entities.Vehicle.filter({ status: 'Disponible' }, '-created_date', 8),
  });

  return (
    <div className="bg-white">
      {/* Hero Slider with integrated search bar */}
      <HeroSlider />

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
                title: '30 ans d\'expérience', 
                desc: 'Mandataire depuis plus de 30 ans en Aquitaine',
                color: 'text-blue-600 bg-blue-50'
              },
              { 
                icon: Shield, 
                title: 'Garantie 6 mois minimum', 
                desc: 'Chaque véhicule inspecté et garanti',
                color: 'text-green-600 bg-green-50'
              },
              { 
                icon: Star, 
                title: '+99% de satisfaction', 
                desc: 'Près de 16 000 véhicules livrés avec succès',
                color: 'text-yellow-600 bg-yellow-50'
              },
              { 
                icon: Heart, 
                title: '2 millions de véhicules', 
                desc: '7 200 concessions partenaires en Europe',
                color: 'text-pink-600 bg-pink-50'
              },
              { 
                icon: Car, 
                title: '10 modèles les plus vendus', 
                desc: 'Sélection des meilleures références du marché',
                color: 'text-purple-600 bg-purple-50'
              },
              { 
                icon: TrendingDown, 
                title: 'Recherche sur mesure', 
                desc: 'Nous trouvons le véhicule de vos rêves',
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
              title: 'Vente de véhicules',
              desc: '10 modèles les plus vendus en France. Recherche sur mesure si véhicule non disponible en stock',
              link: 'Vehicles',
              features: ['Garantie 6 mois minimum', 'Véhicules inspectés', '2 millions disponibles']
            },
            {
              icon: Handshake,
              title: 'Reprise de véhicules',
              desc: 'Estimation gratuite et rapide. Reprise immédiate avec paiement sécurisé',
              link: 'TradeIn',
              features: ['Estimation gratuite', 'Reprise immédiate', 'Paiement sécurisé']
            },
            {
              icon: FileText,
              title: 'Carte grise',
              desc: 'Point carte grise : établissement de votre nouvelle carte grise en 15 minutes',
              link: 'Administrative',
              features: ['Carte grise en 15 min', 'Changement de propriétaire', 'Démarches en ligne']
            },
            {
              icon: CreditCard,
              title: 'Financement & LOA',
              desc: 'Crédit auto, Location avec Option d\'Achat (LOA) adaptés à votre budget',
              link: 'Contact',
              features: ['Crédit auto', 'LOA / LLD', 'Simulation gratuite']
            },
            {
              icon: Wrench,
              title: 'Mécanique & Entretien',
              desc: 'Garage multimarque depuis 2003. Entretien, réparations, contrôle antipollution, diagnostics',
              link: 'Contact',
              features: ['Entretien véhicules', 'Réparations', 'Diagnostics électroniques']
            },
            {
              icon: Paintbrush,
              title: 'Carrosserie',
              desc: 'Services de carrosserie réalisés directement sur notre site à Mérignac',
              link: 'Contact',
              features: ['Réparation carrosserie', 'Peinture', 'Sur site']
            },
            {
              icon: MapPin,
              title: 'Vente de pneus',
              desc: 'Vente et montage de pneus avec réglage du parallélisme',
              link: 'Contact',
              features: ['Vente de pneus', 'Montage', 'Réglage parallélisme']
            },
            {
              icon: Truck,
              title: 'Dépannage & Remorquage',
              desc: 'Dépannage et remorquage de votre véhicule en cas de panne dans les plus brefs délais',
              link: 'Contact',
              features: ['Dépannage 24/7', 'Remorquage', 'Intervention rapide']
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
      <section className="bg-gray-50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Image à gauche */}
            <AnimatedSection animation="fade-right" className="order-2 lg:order-1">
              <div className="relative rounded-xl overflow-hidden shadow-2xl">
                <img
                  src="/jdcauto-1.jpg"
                  alt="JDC Auto"
                  className="w-full h-auto object-contain"
                  loading="eager"
                  decoding="async"
                  fetchpriority="high"
                />
              </div>
            </AnimatedSection>

            {/* Texte à droite */}
            <AnimatedSection animation="fade-left" className="order-1 lg:order-2">
              <div>
                <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6 text-gray-900">
                  Une relation de confiance
                </h2>
                <div className="space-y-4 text-lg text-gray-700 leading-relaxed">
                  <p>
                    Mandataire depuis plus de <strong className="text-red-600">30 ans</strong> en Aquitaine, JDC Auto propose les <strong>10 modèles les plus vendus en France</strong>. Si le véhicule de vos rêves n'est pas en stock, nous nous engageons à le trouver pour vous.
                  </p>
                  <p>
                    Chaque véhicule est inspecté et bénéficie d'une <strong>garantie minimum de 6 mois</strong>. Nous proposons également des services de reprise, financement, LOA, mécanique et carrosserie sur notre site.
                  </p>
                  <p>
                    Avec <strong>7 200 concessions partenaires</strong> et <strong>2 millions de véhicules disponibles</strong> en Europe, nous vous accompagnons dans votre projet. <strong>+99% de satisfaction client</strong> et près de <strong>16 000 véhicules livrés</strong>.
                  </p>
                </div>
              </div>
            </AnimatedSection>
          </div>
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