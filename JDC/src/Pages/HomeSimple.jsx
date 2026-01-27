import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../utils';
import HeroSliderFixed from '../Components/HeroSliderFixed';

export default function HomeSimple() {
  return (
    <div className="bg-white min-h-screen">
      {/* Hero Slider Fixed - avec optimisations mobile */}
      <HeroSliderFixed />
      
      {/* Navigation Simple */}
      <section className="max-w-4xl mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Link
            to={createPageUrl('Vehicles')}  
            className="bg-red-50 hover:bg-red-100 p-6 rounded-xl border-2 border-red-200 hover:border-red-400 transition-all text-center"
          >
            <h3 className="text-xl font-bold text-red-600 mb-2">🚗 Nos Véhicules</h3>
            <p className="text-gray-600">Découvrez notre sélection</p>
          </Link>
          
          <Link
            to={createPageUrl('Contact')}  
            className="bg-blue-50 hover:bg-blue-100 p-6 rounded-xl border-2 border-blue-200 hover:border-blue-400 transition-all text-center"
          >
            <h3 className="text-xl font-bold text-blue-600 mb-2">📞 Contact</h3>
            <p className="text-gray-600">Nous contacter</p>
          </Link>
          
          <Link
            to={createPageUrl('TradeIn')}  
            className="bg-green-50 hover:bg-green-100 p-6 rounded-xl border-2 border-green-200 hover:border-green-400 transition-all text-center"
          >
            <h3 className="text-xl font-bold text-green-600 mb-2">💰 Reprise</h3>
            <p className="text-gray-600">Estimer votre véhicule</p>
          </Link>
        </div>
      </section>

      {/* Status technique */}
      <section className="bg-gray-50 py-12">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">📊 État technique</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-green-100 p-4 rounded-lg">
              <strong className="text-green-800">✅ React Router</strong>
              <p className="text-green-600">Navigation fonctionnelle</p>
            </div>
            <div className="bg-green-100 p-4 rounded-lg">
              <strong className="text-green-800">✅ Tailwind CSS</strong>
              <p className="text-green-600">Styles chargés</p>
            </div>
            <div className="bg-green-100 p-4 rounded-lg">
              <strong className="text-green-800">✅ HeroSlider</strong>
              <p className="text-green-600">Version corrigée active</p>
            </div>
            <div className="bg-orange-100 p-4 rounded-lg">
              <strong className="text-orange-800">📱 Mobile</strong>
              <p className="text-orange-600">Optimisations prêtes</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}