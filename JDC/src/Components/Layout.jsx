import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { Phone, Mail, MapPin, Menu, X, Facebook, Instagram, Linkedin, Twitter } from 'lucide-react';

export default function Layout({ children }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  // Déterminer la page actuelle basée sur l'URL
  const getCurrentPageName = () => {
    const path = location.pathname;
    if (path === '/' || path === '/home') return 'Home';
    if (path === '/vehicles') return 'Vehicles';
    if (path === '/trade-in') return 'TradeIn';
    if (path === '/administrative') return 'Administrative';
    if (path === '/contact') return 'Contact';
    return '';
  };

  const currentPageName = getCurrentPageName();

  const navigation = [
    { name: 'Accueil', page: 'Home' },
    { name: 'Acheter nos véhicules d\'occasion', page: 'Vehicles' },
    { name: 'Reprise de voiture', page: 'TradeIn' },
    { name: 'Carte grise & démarches administratives', page: 'Administrative' },
    { name: 'Contact', page: 'Contact' }
  ];

  return (
    <div className="min-h-screen flex flex-col bg-white">
      {/* Top Bar */}
      <div className="bg-gradient-to-r from-gray-900 to-black text-white py-2.5 px-4 border-b border-gray-800">
        <div className="max-w-7xl mx-auto flex flex-wrap justify-between items-center text-sm">
          <div className="flex items-center gap-6">
            <a href="tel:0556973752" className="flex items-center gap-2 hover:text-red-500 transition-all duration-300 group">
              <Phone className="w-4 h-4 group-hover:scale-110 transition-transform" />
              <span className="font-medium">05 56 97 37 52</span>
            </a>
            <a href="mailto:jdcauto33@orange.fr" className="hidden sm:flex items-center gap-2 hover:text-red-500 transition-all duration-300 group">
              <Mail className="w-4 h-4 group-hover:scale-110 transition-transform" />
              <span className="font-medium">jdcauto33@orange.fr</span>
            </a>
          </div>
          <div className="hidden md:flex items-center gap-2 text-xs text-gray-300">
            <MapPin className="w-4 h-4 text-red-500" />
            <span>Lun-Ven: 9h-19h | Sam: 9h-18h</span>
          </div>
        </div>
      </div>

      {/* Main Header */}
      <header className="bg-white shadow-lg sticky top-0 z-50 backdrop-blur-sm bg-white/95 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            {/* Logo */}
            <Link 
              to={createPageUrl('Home')} 
              onClick={() => {
                window.scrollTo({ top: 0, behavior: 'instant' });
              }}
              className="flex items-center group"
            >
              <img 
                src="/LOGO.jpg" 
                alt="JDC Auto" 
                className="h-12 sm:h-16 object-contain transition-transform duration-300 group-hover:scale-105"
                onError={(e) => {
                  console.error('Logo image failed to load');
                  e.target.style.display = 'none';
                }}
              />
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center gap-1">
              {navigation.map((item) => (
                <Link
                  key={item.page}
                  to={createPageUrl(item.page)}
                  onClick={() => {
                    window.scrollTo({ top: 0, behavior: 'instant' });
                  }}
                  className={`relative px-4 py-2 text-sm font-semibold transition-all duration-300 rounded-lg group ${
                    currentPageName === item.page
                      ? 'text-red-600 bg-red-50'
                      : 'text-gray-700 hover:text-red-600 hover:bg-gray-50'
                  }`}
                >
                  <span className="relative z-10">{item.name}</span>
                  {currentPageName === item.page && (
                    <span className="absolute inset-0 bg-red-50 rounded-lg -z-0" />
                  )}
                  <span className={`absolute bottom-1 left-1/2 transform -translate-x-1/2 w-0 h-0.5 bg-red-600 transition-all duration-300 rounded-full ${
                    currentPageName === item.page ? 'w-3/4' : 'group-hover:w-3/4'
                  }`} />
                </Link>
              ))}
            </nav>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2.5 rounded-lg text-gray-700 hover:text-red-600 hover:bg-gray-100 transition-all duration-300 active:scale-95"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? (
                <X className="w-6 h-6 transition-transform duration-300 rotate-90" />
              ) : (
                <Menu className="w-6 h-6 transition-transform duration-300" />
              )}
            </button>
          </div>

          {/* Mobile Navigation */}
          <div className={`lg:hidden overflow-hidden transition-all duration-300 ease-in-out ${
            mobileMenuOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
          }`}>
            <nav className="pb-4 pt-2 border-t border-gray-200">
              {navigation.map((item, index) => (
                <Link
                  key={item.page}
                  to={createPageUrl(item.page)}
                  onClick={() => {
                    setMobileMenuOpen(false);
                    window.scrollTo({ top: 0, behavior: 'instant' });
                  }}
                  className={`block py-3 px-4 mx-2 rounded-lg text-sm font-semibold transition-all duration-300 ${
                    currentPageName === item.page
                      ? 'text-red-600 bg-red-50'
                      : 'text-gray-700 hover:text-red-600 hover:bg-gray-50'
                  }`}
                  style={{
                    animationDelay: `${index * 50}ms`
                  }}
                >
                  {item.name}
                </Link>
              ))}
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-white mt-16">
        <div className="max-w-7xl mx-auto px-4 py-12">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* About */}
            <div>
              <img 
                src="/LOGO.jpg" 
                alt="JDC Auto" 
                className="h-12 mb-4 object-contain"
                onError={(e) => {
                  console.error('Logo image failed to load in footer');
                  e.target.style.display = 'none';
                }}
              />
              <p className="text-gray-400 text-sm leading-relaxed mb-6">
                Mandataire depuis plus de 30 ans en Aquitaine. Garage automobile multimarque à Mérignac depuis 2003. Services : vente, reprise, financement, LOA, mécanique, carrosserie, carte grise. +99% de satisfaction client, près de 16 000 véhicules livrés.
              </p>
              {/* Social Media */}
              <div className="flex gap-4">
                <a 
                  href="https://facebook.com" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="w-10 h-10 bg-gray-800 hover:bg-red-600 rounded-lg flex items-center justify-center transition-all duration-300 group"
                  aria-label="Facebook"
                >
                  <Facebook className="w-5 h-5 text-gray-400 group-hover:text-white transition-colors" />
                </a>
                <a 
                  href="https://instagram.com" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="w-10 h-10 bg-gray-800 hover:bg-red-600 rounded-lg flex items-center justify-center transition-all duration-300 group"
                  aria-label="Instagram"
                >
                  <Instagram className="w-5 h-5 text-gray-400 group-hover:text-white transition-colors" />
                </a>
                <a 
                  href="https://linkedin.com" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="w-10 h-10 bg-gray-800 hover:bg-red-600 rounded-lg flex items-center justify-center transition-all duration-300 group"
                  aria-label="LinkedIn"
                >
                  <Linkedin className="w-5 h-5 text-gray-400 group-hover:text-white transition-colors" />
                </a>
                <a 
                  href="https://twitter.com" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="w-10 h-10 bg-gray-800 hover:bg-red-600 rounded-lg flex items-center justify-center transition-all duration-300 group"
                  aria-label="Twitter"
                >
                  <Twitter className="w-5 h-5 text-gray-400 group-hover:text-white transition-colors" />
                </a>
              </div>
            </div>

            {/* Contact */}
            <div>
              <h4 className="text-lg font-semibold mb-4">Contact</h4>
              <div className="space-y-3 text-sm text-gray-400">
                <div className="flex items-start gap-2">
                  <MapPin className="w-4 h-4 mt-1 flex-shrink-0" />
                  <span>123 Avenue de la République<br />33000 Bordeaux</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 flex-shrink-0" />
                  <a href="tel:0556973752" className="hover:text-red-500 transition-colors">05 56 97 37 52</a>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 flex-shrink-0" />
                  <a href="mailto:jdcauto33@orange.fr" className="hover:text-red-500 transition-colors">jdcauto33@orange.fr</a>
                </div>
              </div>
            </div>

            {/* Horaires */}
            <div>
              <h4 className="text-lg font-semibold mb-4">Horaires d'ouverture</h4>
              <div className="space-y-2 text-sm text-gray-400">
                <p><span className="text-white">Du lundi au samedi:</span> 08H00 - 12H00 & 14H00-19H30</p>
                <p><span className="text-white">Le samedi:</span> Sur rendez-vous</p>
              </div>
            </div>

            {/* Liens rapides */}
            <div>
              <h4 className="text-lg font-semibold mb-4">Liens rapides</h4>
              <nav className="space-y-2 text-sm text-gray-400">
                <Link to={createPageUrl('Vehicles')} className="block hover:text-red-500 transition-colors">
                  Nos véhicules
                </Link>
                <Link to={createPageUrl('TradeIn')} className="block hover:text-red-500 transition-colors">
                  Reprise de voiture
                </Link>
                <Link to={createPageUrl('Administrative')} className="block hover:text-red-500 transition-colors">
                  Carte grise
                </Link>
                <Link to={createPageUrl('Contact')} className="block hover:text-red-500 transition-colors">
                  Contact
                </Link>
              </nav>
            </div>
          </div>

          {/* Bottom Footer */}
          <div className="border-t border-gray-800 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center text-sm text-gray-400">
            <p>© 2024 JDC AUTO - Tous droits réservés</p>
            <div className="flex gap-6 mt-4 md:mt-0">
              <a href="#" className="hover:text-red-500 transition-colors">Mentions légales</a>
              <a href="#" className="hover:text-red-500 transition-colors">CGV</a>
              <a href="#" className="hover:text-red-500 transition-colors">Politique de confidentialité</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

