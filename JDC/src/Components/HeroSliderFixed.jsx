import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { ChevronRight, ChevronLeft, ChevronDown, Search } from 'lucide-react';
import ImageWithAnimation from './ImageWithAnimation';
import { useQuery } from '@tanstack/react-query';

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

export default function HeroSliderFixed() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  
  // Fetch real vehicles data from API
  const { data: allVehicles = [] } = useQuery({
    queryKey: ['vehicles', 'hero-search'],
    queryFn: async () => {
      const response = await fetch('/api/index.php?action=vehicles&limit=100');
      if (!response.ok) throw new Error('Erreur API');
      const data = await response.json();
      if (!data.success) throw new Error(data.error || 'Erreur API');
      return data.data || [];
    },
    staleTime: 0,
    cacheTime: 0,
  });
  
  // Calculate real data from vehicles
  const availableCount = allVehicles.length;
  
  // Get unique brands from real vehicles
  const uniqueBrands = [...new Set(allVehicles.map(v => v.brand || v.marque))].filter(Boolean).sort();
  
  // Get unique models for selected brand
  const uniqueModels = searchFilters.brand
    ? [...new Set(allVehicles
        .filter(v => (v.brand || v.marque) === searchFilters.brand)
        .map(v => v.model || v.modele)
      )].filter(Boolean).sort()
    : [];
  
  // Calculate price range from real vehicles
  const priceRange = allVehicles.length > 0 
    ? {
        min: Math.min(...allVehicles.map(v => v.price || parseFloat(v.prix_vente || 0))),
        max: Math.max(...allVehicles.map(v => v.price || parseFloat(v.prix_vente || 0)))
      }
    : { min: 0, max: 100000 };
  
  // Generate price options based on real data
  const priceOptions = [];
  if (priceRange.max > 0) {
    const step = Math.ceil(priceRange.max / 5);
    for (let i = step; i <= priceRange.max; i += step) {
      priceOptions.push(i);
    }
    // Add max price if not already included
    if (priceOptions[priceOptions.length - 1] < priceRange.max) {
      priceOptions.push(priceRange.max);
    }
  } else {
    // Fallback prices
    priceOptions.push(10000, 15000, 20000, 30000, 50000);
  }
  
  // Search filters state
  const [searchFilters, setSearchFilters] = useState({
    brand: '',
    model: '',
    maxPrice: ''
  });
  
  const handleSearch = () => {
    const params = new URLSearchParams();
    if (searchFilters.brand) params.set('brand', searchFilters.brand);
    if (searchFilters.model) params.set('model', searchFilters.model);
    if (searchFilters.maxPrice) params.set('maxPrice', searchFilters.maxPrice);
    
    const queryString = params.toString();
    window.location.href = createPageUrl('Vehicles') + (queryString ? `?${queryString}` : '');
  };
  
  const handleBrandChange = (brand) => {
    setSearchFilters(prev => ({
      ...prev,
      brand,
      model: ''
    }));
  };

  useEffect(() => {
    const interval = setInterval(() => {
      setIsTransitioning(true);
      setTimeout(() => {
        setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
        setIsTransitioning(false);
      }, 400);
    }, 3500);

    return () => clearInterval(interval);
  }, []);

  const goToSlide = (index) => {
    if (index === currentSlide || !heroSlides[index]) return;
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

  // Protection contre undefined
  const currentSlideData = heroSlides[currentSlide] || heroSlides[0];

  return (
    <>
      <div className="relative">
        <section className="relative h-[400px] sm:h-[450px] md:h-[500px] lg:h-[550px] flex items-start pt-4 sm:pt-8 md:pt-12 overflow-hidden">
          {/* Slides */}
          {heroSlides.map((slide, index) => (
            <div
              key={index}
              className={`absolute inset-0 transition-opacity duration-700 ${
                index === currentSlide ? 'opacity-100 z-10' : 'opacity-0 z-0'
              }`}
            >
              <div className="absolute inset-0">
                <img 
                  src={slide.image}
                  alt={slide.title}
                  className="w-full h-full object-cover"
                  loading={index === 0 ? 'eager' : 'lazy'}
                />
                <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-black/30" />
              </div>
            </div>
          ))}

          {/* Content */}
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-white z-20 w-full pt-4 md:pt-8 flex flex-col h-full">
            <div className="max-w-3xl flex-1">
              <div
                className={`transition-all duration-700 ${
                  isTransitioning ? 'opacity-0 translate-y-4' : 'opacity-100 translate-y-0'
                }`}
              >
                <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold mb-2 sm:mb-3 leading-tight">
                  {currentSlideData?.title || 'JDC Auto'}
                </h1>
                <p className="text-sm sm:text-base md:text-lg text-gray-200">
                  {currentSlideData?.subtitle || 'Votre partenaire automobile'}
                </p>
              </div>
            </div>
          </div>

          {/* Navigation Arrows */}
          <button
            onClick={prevSlide}
            className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 z-30 p-2 sm:p-3 bg-white/10 backdrop-blur-sm hover:bg-white/20 text-white rounded-full transition-all duration-300"
            aria-label="Slide précédent"
          >
            <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>
          <button
            onClick={nextSlide}
            className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 z-30 p-2 sm:p-3 bg-white/10 backdrop-blur-sm hover:bg-white/20 text-white rounded-full transition-all duration-300"
            aria-label="Slide suivant"
          >
            <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>

          {/* Dots Indicator */}
          <div className="absolute bottom-4 sm:bottom-6 md:bottom-8 lg:bottom-32 left-1/2 -translate-x-1/2 z-30 flex gap-2">
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

          {/* Search Bar - Desktop only */}
          <div className="hidden lg:block absolute bottom-0 left-0 right-0 z-30 px-4 pb-6">
            <div className="max-w-6xl mx-auto">
              <div className="flex justify-between items-center mb-3 px-2">
                <div className="text-white font-semibold text-base">
                  {availableCount} DISPONIBLES
                </div>
                <Link
                  to={createPageUrl('Vehicles')}
                  className="text-white font-semibold text-base hover:text-red-400 transition-colors flex items-center gap-1"
                >
                  VOIR TOUS LES VÉHICULES
                  <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
              
              <div className="bg-white rounded-2xl shadow-2xl p-5 border border-gray-100">
                <div className="grid grid-cols-4 gap-4">
                  <select 
                    value={searchFilters.brand}
                    onChange={(e) => handleBrandChange(e.target.value)}
                    className="w-full px-4 py-3 bg-gray-100 border-0 rounded-xl text-gray-700 font-medium focus:outline-none focus:ring-2 focus:ring-red-600"
                  >
                    <option value="">Marque</option>
                    {uniqueBrands.map(brand => (
                      <option key={brand} value={brand}>{brand}</option>
                    ))}
                  </select>
                  
                  <select 
                    value={searchFilters.model}
                    onChange={(e) => setSearchFilters(prev => ({ ...prev, model: e.target.value }))}
                    className="w-full px-4 py-3 bg-gray-100 border-0 rounded-xl text-gray-700 font-medium focus:outline-none focus:ring-2 focus:ring-red-600"
                    disabled={!searchFilters.brand}
                  >
                    <option value="">Modèle</option>
                    {uniqueModels.map(model => (
                      <option key={model} value={model}>{model}</option>
                    ))}
                  </select>
                  
                  <select 
                    value={searchFilters.maxPrice}
                    onChange={(e) => setSearchFilters(prev => ({ ...prev, maxPrice: e.target.value }))}
                    className="w-full px-4 py-3 bg-gray-100 border-0 rounded-xl text-gray-700 font-medium focus:outline-none focus:ring-2 focus:ring-red-600"
                  >
                    <option value="">Prix maxi.</option>
                    {priceOptions.map(price => (
                      <option key={price} value={price}>{price.toLocaleString('fr-FR')} €</option>
                    ))}
                  </select>
                  
                  <button
                    onClick={handleSearch}
                    className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-xl transition-all duration-300 flex items-center justify-center gap-2"
                  >
                    <Search className="w-4 h-4" />
                    Rechercher
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Search Bar - Mobile Version (outside section, full width breakout) */}
        <div className="lg:hidden relative left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] w-screen bg-white py-4 sm:py-6 border-t border-gray-100">
          <div className="px-4 sm:px-6">
            <div className="flex justify-between items-center mb-3">
              <div className="text-gray-900 font-semibold text-sm">
                {availableCount} DISPONIBLES
              </div>
              <Link
                to={createPageUrl('Vehicles')}
                className="text-gray-900 font-semibold text-sm hover:text-red-600 transition-colors flex items-center gap-1"
              >
                VOIR TOUS LES VÉHICULES
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
            
            <div className="bg-gray-50 rounded-xl shadow-lg p-4 border border-gray-200 max-w-md mx-auto">
              <div className="space-y-3">
                <select 
                  value={searchFilters.brand}
                  onChange={(e) => handleBrandChange(e.target.value)}
                  className="w-full px-4 py-3 bg-white border border-gray-200 rounded-lg text-gray-700 font-medium focus:outline-none focus:ring-2 focus:ring-red-600"
                >
                  <option value="">Marque</option>
                  {uniqueBrands.map(brand => (
                    <option key={brand} value={brand}>{brand}</option>
                  ))}
                </select>
                
                <select 
                  value={searchFilters.model}
                  onChange={(e) => setSearchFilters(prev => ({ ...prev, model: e.target.value }))}
                  className="w-full px-4 py-3 bg-white border border-gray-200 rounded-lg text-gray-700 font-medium focus:outline-none focus:ring-2 focus:ring-red-600 disabled:bg-gray-100 disabled:text-gray-400"
                  disabled={!searchFilters.brand}
                >
                  <option value="">Modèle</option>
                  {uniqueModels.map(model => (
                    <option key={model} value={model}>{model}</option>
                  ))}
                </select>
                
                <select 
                  value={searchFilters.maxPrice}
                  onChange={(e) => setSearchFilters(prev => ({ ...prev, maxPrice: e.target.value }))}
                  className="w-full px-4 py-3 bg-white border border-gray-200 rounded-lg text-gray-700 font-medium focus:outline-none focus:ring-2 focus:ring-red-600"
                >
                  <option value="">Prix maxi.</option>
                  {priceOptions.map(price => (
                    <option key={price} value={price}>{price.toLocaleString('fr-FR')} €</option>
                  ))}
                </select>
                
                <button
                  onClick={handleSearch}
                  className="w-full px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg transition-all duration-300 flex items-center justify-center gap-2"
                >
                  <Search className="w-4 h-4" />
                  Rechercher
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
