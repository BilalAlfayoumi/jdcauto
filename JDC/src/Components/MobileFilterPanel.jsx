import React from 'react';
import { X, Filter } from 'lucide-react';

export default function MobileFilterPanel({
  isOpen,
  onClose,
  filters,
  setFilters,
  onApply,
  onReset,
  priceRange,
  yearRange,
  uniqueBrands,
  uniqueModels = [],
  toggleFuelType,
  toggleGearbox
}) {
  if (!isOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/50 z-50 transition-opacity duration-300"
        onClick={onClose}
      />

      {/* Filter Panel */}
      <div
        className={`fixed bottom-0 left-0 right-0 bg-white rounded-t-2xl shadow-2xl z-50 max-h-[90vh] overflow-y-auto transition-transform duration-300 ease-out ${
          isOpen ? 'translate-y-0' : 'translate-y-full'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between z-10">
          <div className="flex items-center gap-3">
            <Filter className="w-6 h-6 text-red-600" />
            <h2 className="text-xl font-bold text-gray-900">Filtres</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            aria-label="Fermer"
          >
            <X className="w-6 h-6 text-gray-600" />
          </button>
        </div>

        {/* Filter Content */}
        <div className="px-6 py-6 space-y-6">
          {/* Marque */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              1. Marque
            </label>
            <select
              value={filters.brand}
              onChange={(e) => setFilters({ ...filters, brand: e.target.value, model: '' })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600 text-base"
            >
              <option value="">Toutes les marques</option>
              {uniqueBrands.map(brand => (
                <option key={brand} value={brand}>{brand}</option>
              ))}
            </select>
          </div>

          {/* Modèle */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              2. Modèle
            </label>
            <select
              value={filters.model}
              onChange={(e) => setFilters({ ...filters, model: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600 text-base disabled:bg-gray-100 disabled:cursor-not-allowed"
              disabled={!filters.brand}
            >
              <option value="">Tous les modèles</option>
              {uniqueModels.map(model => (
                <option key={model} value={model}>{model}</option>
              ))}
            </select>
            {!filters.brand && (
              <p className="text-xs text-gray-500 mt-1">Sélectionnez d'abord une marque</p>
            )}
          </div>

          {/* Prix */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              3. Prix ({filters.minPrice.toLocaleString('fr-FR')} € - {(filters.maxPrice || priceRange.max || 0).toLocaleString('fr-FR')} €)
            </label>
            <div className="space-y-4">
              <div>
                <label className="block text-xs text-gray-600 mb-2">Prix minimum</label>
                <input
                  type="range"
                  min={priceRange.min}
                  max={priceRange.max}
                  step="1000"
                  value={filters.minPrice}
                  onChange={(e) => setFilters({ ...filters, minPrice: parseInt(e.target.value) })}
                  className="w-full accent-red-600"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-600 mb-2">Prix maximum</label>
                <input
                  type="range"
                  min={priceRange.min}
                  max={priceRange.max}
                  step="1000"
                  value={filters.maxPrice || priceRange.max || 0}
                  onChange={(e) => setFilters({ ...filters, maxPrice: parseInt(e.target.value) })}
                  className="w-full accent-red-600"
                />
              </div>
            </div>
          </div>

          {/* Kilométrage */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              4. Kilométrage maximum
            </label>
            <input
              type="number"
              value={filters.maxMileage || ''}
              onChange={(e) => setFilters({ ...filters, maxMileage: e.target.value ? parseInt(e.target.value) : null })}
              placeholder="Ex: 50000"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600 text-base"
            />
          </div>

          {/* Année */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              5. Année ({filters.minYear} - {filters.maxYear})
            </label>
            <div className="space-y-4">
              <div>
                <label className="block text-xs text-gray-600 mb-2">Année minimum</label>
                <input
                  type="range"
                  min={yearRange.min}
                  max={yearRange.max}
                  value={filters.minYear}
                  onChange={(e) => setFilters({ ...filters, minYear: parseInt(e.target.value) })}
                  className="w-full accent-red-600"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-600 mb-2">Année maximum</label>
                <input
                  type="range"
                  min={yearRange.min}
                  max={yearRange.max}
                  value={filters.maxYear}
                  onChange={(e) => setFilters({ ...filters, maxYear: parseInt(e.target.value) })}
                  className="w-full accent-red-600"
                />
              </div>
            </div>
          </div>

          {/* Carburant */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              6. Carburant
            </label>
            <div className="space-y-3">
              {['Essence', 'Diesel', 'Hybride', 'Électrique', 'GPL'].map(fuel => (
                <label key={fuel} className="flex items-center gap-3 cursor-pointer group p-3 rounded-lg hover:bg-gray-50 transition-colors">
                  <input
                    type="checkbox"
                    checked={filters.fuelTypes.includes(fuel)}
                    onChange={() => toggleFuelType(fuel)}
                    className="w-5 h-5 text-red-600 border-gray-300 rounded focus:ring-red-500"
                  />
                  <span className="text-base text-gray-700 group-hover:text-red-600 transition-colors">
                    {fuel}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Boîte de vitesse */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              7. Boîte de vitesse
            </label>
            <div className="space-y-3">
              {['Manuelle', 'Automatique'].map(gearbox => (
                <label key={gearbox} className="flex items-center gap-3 cursor-pointer group p-3 rounded-lg hover:bg-gray-50 transition-colors">
                  <input
                    type="checkbox"
                    checked={filters.gearboxes.includes(gearbox)}
                    onChange={() => toggleGearbox(gearbox)}
                    className="w-5 h-5 text-red-600 border-gray-300 rounded focus:ring-red-500"
                  />
                  <span className="text-base text-gray-700 group-hover:text-red-600 transition-colors">
                    {gearbox}
                  </span>
                </label>
              ))}
            </div>
          </div>

        </div>

        {/* Footer Actions */}
        <div className="sticky bottom-0 bg-white border-t border-gray-200 px-6 py-4 flex gap-3 z-10">
          <button
            onClick={onReset}
            className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-colors"
          >
            Réinitialiser
          </button>
          <button
            onClick={onApply}
            className="flex-1 px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg transition-colors shadow-lg"
          >
            Appliquer les filtres
          </button>
        </div>
      </div>
    </>
  );
}

