import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { ChevronRight, ChevronLeft } from 'lucide-react';
import ImageWithAnimation from './ImageWithAnimation';

const heroSlides = [
  {
    image: 'https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=1920&h=1080&auto=format&fit=crop',
    title: 'JDC Auto – Achat et vente de véhicules d\'occasion en toute confiance',
    subtitle: 'Garantie • Sécurité • Accompagnement personnalisé',
    ctaPrimary: { text: 'Voir nos véhicules', link: 'Vehicles' },
    ctaSecondary: { text: 'Faire estimer ma voiture', link: 'TradeIn' }
  },
  {
    image: 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=1920&h=1080&auto=format&fit=crop',
    title: 'Votre partenaire de confiance pour l\'achat de véhicules',
    subtitle: 'Garantie minimum 6 mois • Véhicules contrôlés • Meilleur rapport qualité/prix',
    ctaPrimary: { text: 'Découvrir nos véhicules', link: 'Vehicles' },
    ctaSecondary: { text: 'Nous contacter', link: 'Contact' }
  },
  {
    image: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=1920&h=1080&auto=format&fit=crop&q=80',
    title: 'Reprise de véhicule et démarches administratives',
    subtitle: 'Estimation gratuite • Carte grise • Accompagnement complet',
    ctaPrimary: { text: 'Estimer mon véhicule', link: 'TradeIn' },
    ctaSecondary: { text: 'En savoir plus', link: 'Administrative' }
  }
];

export default function HeroSlider() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setIsTransitioning(true);
      setTimeout(() => {
        setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
        setIsTransitioning(false);
      }, 400);
    }, 3500); // Changement toutes les 3.5 secondes au lieu de 5

    return () => clearInterval(interval);
  }, []);

  const goToSlide = (index) => {
    if (index === currentSlide) return;
    setIsTransitioning(true);
    setTimeout(() => {
      setCurrentSlide(index);
      setIsTransitioning(false);
    }, 250);
  };

  const nextSlide = () => {
    goToSlide((currentSlide + 1) % heroSlides.length);
  };

  const prevSlide = () => {
    goToSlide((currentSlide - 1 + heroSlides.length) % heroSlides.length);
  };

  return (
    <section className="relative h-[600px] md:h-[700px] lg:h-[800px] flex items-center overflow-hidden">
      {/* Slides */}
      {heroSlides.map((slide, index) => (
        <div
          key={index}
          className={`absolute inset-0 transition-opacity duration-700 ${
            index === currentSlide ? 'opacity-100 z-10' : 'opacity-0 z-0'
          }`}
        >
          <div className="absolute inset-0">
            <ImageWithAnimation
              src={slide.image}
              alt={slide.title}
              className="w-full h-full"
              animation="zoom-in"
              delay={index * 200}
              forceVisible={index === currentSlide}
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-black/30" />
          </div>
        </div>
      ))}

      {/* Content */}
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-white z-20 w-full">
        <div className="max-w-3xl">
          <div
            className={`transition-all duration-700 ${
              isTransitioning ? 'opacity-0 translate-y-4' : 'opacity-100 translate-y-0'
            }`}
          >
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
              {heroSlides[currentSlide].title}
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-gray-200">
              {heroSlides[currentSlide].subtitle}
            </p>
            <div className="flex flex-wrap gap-4">
              <Link
                to={createPageUrl(heroSlides[currentSlide].ctaPrimary.link)}
                className="px-8 py-4 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg transition-all duration-300 inline-flex items-center gap-2 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
              >
                {heroSlides[currentSlide].ctaPrimary.text}
                <ChevronRight className="w-5 h-5" />
              </Link>
              <Link
                to={createPageUrl(heroSlides[currentSlide].ctaSecondary.link)}
                className="px-8 py-4 bg-white/10 backdrop-blur-sm hover:bg-white/20 text-white font-semibold rounded-lg transition-all duration-300 border-2 border-white/30 hover:border-white/50"
              >
                {heroSlides[currentSlide].ctaSecondary.text}
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Arrows */}
      <button
        onClick={prevSlide}
        className="absolute left-4 top-1/2 -translate-y-1/2 z-30 p-3 bg-white/10 backdrop-blur-sm hover:bg-white/20 text-white rounded-full transition-all duration-300 border border-white/30 hover:border-white/50"
        aria-label="Slide précédent"
      >
        <ChevronLeft className="w-6 h-6" />
      </button>
      <button
        onClick={nextSlide}
        className="absolute right-4 top-1/2 -translate-y-1/2 z-30 p-3 bg-white/10 backdrop-blur-sm hover:bg-white/20 text-white rounded-full transition-all duration-300 border border-white/30 hover:border-white/50"
        aria-label="Slide suivant"
      >
        <ChevronRight className="w-6 h-6" />
      </button>

      {/* Dots Indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-30 flex gap-2">
        {heroSlides.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`transition-all duration-300 rounded-full ${
              index === currentSlide
                ? 'w-8 h-2 bg-white'
                : 'w-2 h-2 bg-white/50 hover:bg-white/75'
            }`}
            aria-label={`Aller au slide ${index + 1}`}
          />
        ))}
      </div>
    </section>
  );
}

