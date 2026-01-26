import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import VehicleCard from '../Components/VehicleCard';
import VehicleListItem from '../Components/VehicleListItem';
import MobileFilterPanel from '../Components/MobileFilterPanel';
import { 
  Filter, 
  X, 
  Grid3x3, 
  List, 
  Car, 
  Truck, 
  Package,
  ChevronDown,
  TrendingUp,
  TrendingDown
} from 'lucide-react';

export default function Vehicles() {
  // Read URL parameters
  const urlParams = new URLSearchParams(window.location.search);
  const urlCategory = urlParams.get('category');
  const urlBrand = urlParams.get('brand');
  const urlModel = urlParams.get('model');
  const urlMaxPrice = urlParams.get('maxPrice');
  
  const [selectedCategory, setSelectedCategory] = useState(urlCategory || 'all');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
  const [sortBy, setSortBy] = useState('recent'); // 'recent', 'price-asc', 'price-desc', 'year-asc', 'year-desc', 'mileage-asc', 'mileage-desc'
  
  const [filters, setFilters] = useState({
    brand: urlBrand || '',
    model: urlModel || '',
    minPrice: 0,
    maxPrice: urlMaxPrice ? parseInt(urlMaxPrice) : 100000,
    minYear: 2010,
    maxYear: new Date().getFullYear(),
    maxMileage: null,
    fuelTypes: [],
    gearboxes: []
  });

  const [tempFilters, setTempFilters] = useState(filters); // Pour le panneau mobile
  
  // Initialize filters from URL on mount
  useEffect(() => {
    if (urlCategory) setSelectedCategory(urlCategory);
    if (urlBrand) setFilters(prev => ({ ...prev, brand: urlBrand }));
    if (urlModel) setFilters(prev => ({ ...prev, model: urlModel }));
    if (urlMaxPrice) setFilters(prev => ({ ...prev, maxPrice: parseInt(urlMaxPrice) }));
  }, []); // Only on mount
  const [showFilters, setShowFilters] = useState(true);
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const vehiclesPerPage = 12;

  // Fetch all vehicles
  const { data: allVehicles = [], isLoading } = useQuery({
    queryKey: ['vehicles'],
    queryFn: () => base44.entities.Vehicle.list('-created_date'),
  });

  // Get price and year ranges from data
  const priceRange = allVehicles.length > 0 ? {
    min: Math.min(...allVehicles.map(v => v.price)),
    max: Math.max(...allVehicles.map(v => v.price))
  } : { min: 0, max: 100000 };

  const yearRange = allVehicles.length > 0 ? {
    min: Math.min(...allVehicles.map(v => v.year)),
    max: Math.max(...allVehicles.map(v => v.year))
  } : { min: 2010, max: new Date().getFullYear() };

  // Get unique brands
  const uniqueBrands = [...new Set(allVehicles.map(v => v.brand))].sort();

  // Get unique models for selected brand
  const uniqueModels = filters.brand
    ? [...new Set(allVehicles.filter(v => v.brand === filters.brand).map(v => v.model))].sort()
    : [];

  // Get mileage range
  const mileageRange = allVehicles.length > 0 ? {
    min: Math.min(...allVehicles.map(v => v.mileage)),
    max: Math.max(...allVehicles.map(v => v.mileage))
  } : { min: 0, max: 200000 };

  // Categories
  const categories = [
    { id: 'all', name: 'Tous', icon: Car },
    { id: 'Voiture', name: 'Voitures', icon: Car },
    { id: 'Camion', name: 'Camions', icon: Truck },
    { id: 'Utilitaire', name: 'Utilitaires', icon: Package }
  ];

  // Filter vehicles
  const filteredVehicles = allVehicles.filter(vehicle => {
    if (vehicle.status !== 'Disponible') return false;
    // Utiliser selectedCategory pour la catégorie (géré séparément)
    if (selectedCategory !== 'all' && vehicle.category !== selectedCategory) return false;
    if (filters.brand && vehicle.brand !== filters.brand) return false;
    if (filters.model && vehicle.model !== filters.model) return false;
    if (vehicle.price < filters.minPrice) return false;
    if (filters.maxPrice && vehicle.price > filters.maxPrice) return false;
    if (vehicle.year < filters.minYear || vehicle.year > filters.maxYear) return false;
    if (filters.maxMileage && vehicle.mileage > filters.maxMileage) return false;
    if (filters.fuelTypes.length > 0 && !filters.fuelTypes.includes(vehicle.fuel_type)) return false;
    if (filters.gearboxes.length > 0 && !filters.gearboxes.includes(vehicle.gearbox)) return false;
    return true;
  });

  // Sort vehicles
  const sortedVehicles = [...filteredVehicles].sort((a, b) => {
    switch (sortBy) {
      case 'price-asc': return a.price - b.price;
      case 'price-desc': return b.price - a.price;
      case 'year-asc': return a.year - b.year;
      case 'year-desc': return b.year - a.year;
      case 'mileage-asc': return a.mileage - b.mileage;
      case 'mileage-desc': return b.mileage - a.mileage;
      default: return 0; // recent (already sorted by API)
    }
  });

  // Pagination
  const totalPages = Math.ceil(sortedVehicles.length / vehiclesPerPage);
  const startIndex = (currentPage - 1) * vehiclesPerPage;
  const paginatedVehicles = sortedVehicles.slice(startIndex, startIndex + vehiclesPerPage);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [filters, selectedCategory, sortBy]);

  const toggleFuelType = (fuelType) => {
    setFilters(prev => ({
      ...prev,
      fuelTypes: prev.fuelTypes.includes(fuelType)
        ? prev.fuelTypes.filter(f => f !== fuelType)
        : [...prev.fuelTypes, fuelType]
    }));
  };

  const toggleGearbox = (gearbox) => {
    setFilters(prev => ({
      ...prev,
      gearboxes: prev.gearboxes.includes(gearbox)
        ? prev.gearboxes.filter(g => g !== gearbox)
        : [...prev.gearboxes, gearbox]
    }));
  };

  const resetFilters = () => {
    const resetFiltersState = {
      brand: '',
      model: '',
      minPrice: priceRange.min,
      maxPrice: priceRange.max,
      minYear: yearRange.min,
      maxYear: yearRange.max,
      maxMileage: null,
      fuelTypes: [],
      gearboxes: [],
      category: 'all'
    };
    setFilters(resetFiltersState);
    setTempFilters(resetFiltersState);
    setSelectedCategory('all');
  };

  // Gestion du panneau mobile
  const openMobileFilter = () => {
    // Copier les filtres actuels dans tempFilters avec la catégorie
    setTempFilters({
      ...filters,
      category: selectedCategory
    });
    setIsMobileFilterOpen(true);
  };

  const closeMobileFilter = () => {
    setIsMobileFilterOpen(false);
  };

  const applyMobileFilters = () => {
    // Appliquer les filtres (sans category qui est géré séparément)
    const { category, ...filtersToApply } = tempFilters;
    setFilters(filtersToApply);
    if (category) {
      setSelectedCategory(category);
    }
    setIsMobileFilterOpen(false);
  };

  const resetMobileFilters = () => {
    const resetFiltersState = {
      brand: '',
      model: '',
      minPrice: priceRange.min,
      maxPrice: priceRange.max,
      minYear: yearRange.min,
      maxYear: yearRange.max,
      maxMileage: null,
      fuelTypes: [],
      gearboxes: [],
      category: 'all'
    };
    setTempFilters(resetFiltersState);
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Categories */}
      <div className="bg-white shadow-md py-6 sticky top-[73px] z-40">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-wrap justify-center gap-4">
            {categories.map((category) => {
              const Icon = category.icon;
              const isActive = selectedCategory === category.id;
              return (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`flex items-center gap-3 px-6 py-3 rounded-lg font-semibold transition-all transform hover:scale-105 ${
                    isActive
                      ? 'bg-red-600 text-white shadow-lg'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span>{category.name}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filters Sidebar - Desktop only */}
          <aside className="hidden lg:block lg:w-80">
            <div className="bg-white rounded-lg shadow-md p-6 sticky top-48">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                  <Filter className="w-5 h-5" />
                  Filtres
                </h2>
                <button
                  onClick={resetFilters}
                  className="text-red-600 hover:text-red-700 text-sm font-medium"
                >
                  Réinitialiser
                </button>
              </div>

              <div className="space-y-6">
                {/* Marque */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Marque
                  </label>
                  <select
                    value={filters.brand}
                    onChange={(e) => setFilters({ ...filters, brand: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-600"
                  >
                    <option value="">Toutes les marques</option>
                    {uniqueBrands.map(brand => (
                      <option key={brand} value={brand}>{brand}</option>
                    ))}
                  </select>
                </div>

                {/* Prix */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Prix ({filters.minPrice.toLocaleString('fr-FR')} € - {filters.maxPrice.toLocaleString('fr-FR')} €)
                  </label>
                  <div className="space-y-3">
                    <input
                      type="range"
                      min={priceRange.min}
                      max={priceRange.max}
                      step="1000"
                      value={filters.minPrice}
                      onChange={(e) => setFilters({ ...filters, minPrice: parseInt(e.target.value) })}
                      className="w-full accent-red-600"
                    />
                    <input
                      type="range"
                      min={priceRange.min}
                      max={priceRange.max}
                      step="1000"
                      value={filters.maxPrice}
                      onChange={(e) => setFilters({ ...filters, maxPrice: parseInt(e.target.value) })}
                      className="w-full accent-red-600"
                    />
                  </div>
                </div>

                {/* Année */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Année ({filters.minYear} - {filters.maxYear})
                  </label>
                  <div className="space-y-3">
                    <input
                      type="range"
                      min={yearRange.min}
                      max={yearRange.max}
                      value={filters.minYear}
                      onChange={(e) => setFilters({ ...filters, minYear: parseInt(e.target.value) })}
                      className="w-full accent-red-600"
                    />
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

                {/* Carburant */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    Carburant
                  </label>
                  <div className="space-y-2">
                    {['Essence', 'Diesel', 'Hybride', 'Électrique', 'GPL'].map(fuel => (
                      <label key={fuel} className="flex items-center gap-2 cursor-pointer group">
                        <input
                          type="checkbox"
                          checked={filters.fuelTypes.includes(fuel)}
                          onChange={() => toggleFuelType(fuel)}
                          className="w-4 h-4 text-red-600 border-gray-300 rounded focus:ring-red-500"
                        />
                        <span className="text-sm text-gray-700 group-hover:text-red-600 transition-colors">
                          {fuel}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Boîte de vitesse */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    Boîte de vitesse
                  </label>
                  <div className="space-y-2">
                    {['Manuelle', 'Automatique'].map(gearbox => (
                      <label key={gearbox} className="flex items-center gap-2 cursor-pointer group">
                        <input
                          type="checkbox"
                          checked={filters.gearboxes.includes(gearbox)}
                          onChange={() => toggleGearbox(gearbox)}
                          className="w-4 h-4 text-red-600 border-gray-300 rounded focus:ring-red-500"
                        />
                        <span className="text-sm text-gray-700 group-hover:text-red-600 transition-colors">
                          {gearbox}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </aside>

          {/* Main Content */}
          <div className="flex-1">
            {/* Mobile Filter Button - Fixed above content */}
            <div className="lg:hidden mb-6 sticky top-[140px] z-30">
              <button
                onClick={openMobileFilter}
                className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl shadow-xl transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98]"
              >
                <Filter className="w-6 h-6" />
                <span className="text-lg">Filtrer</span>
              </button>
            </div>

            {/* Toolbar */}
            <div className="bg-white rounded-lg shadow-md p-4 mb-6 flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <span className="text-gray-700 font-medium">
                  {sortedVehicles.length} véhicule{sortedVehicles.length > 1 ? 's' : ''}
                </span>
              </div>

              <div className="flex items-center gap-4">
                {/* Sort */}
                <div className="relative">
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="appearance-none px-4 py-2 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-600 bg-white cursor-pointer"
                  >
                    <option value="recent">Plus récents</option>
                    <option value="price-asc">Prix croissant</option>
                    <option value="price-desc">Prix décroissant</option>
                    <option value="year-asc">Année croissante</option>
                    <option value="year-desc">Année décroissante</option>
                    <option value="mileage-asc">Km croissant</option>
                    <option value="mileage-desc">Km décroissant</option>
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                </div>

                {/* View Mode */}
                <div className="flex gap-2 border border-gray-300 rounded-md p-1">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-2 rounded transition-colors ${
                      viewMode === 'grid' ? 'bg-red-600 text-white' : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    <Grid3x3 className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-2 rounded transition-colors ${
                      viewMode === 'list' ? 'bg-red-600 text-white' : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    <List className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>

            {isLoading ? (
              <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-4'}>
                {[...Array(9)].map((_, i) => (
                  <div key={i} className="bg-gray-200 animate-pulse rounded-lg h-96" />
                ))}
              </div>
            ) : sortedVehicles.length === 0 ? (
              <div className="bg-white rounded-lg shadow-md p-12 text-center">
                <Car className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 text-lg font-medium mb-2">
                  Aucun véhicule ne correspond à vos critères
                </p>
                <p className="text-gray-500 mb-6">
                  Essayez de modifier vos filtres pour voir plus de résultats
                </p>
                <button
                  onClick={resetFilters}
                  className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-md transition-colors"
                >
                  Réinitialiser les filtres
                </button>
              </div>
            ) : (
              <>
                {/* Vehicle Grid/List */}
                {viewMode === 'grid' ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                    {paginatedVehicles.map((vehicle) => (
                      <VehicleCard key={vehicle.id} vehicle={vehicle} />
                    ))}
                  </div>
                ) : (
                  <div className="space-y-4 mb-8">
                    {paginatedVehicles.map((vehicle) => (
                      <VehicleListItem key={vehicle.id} vehicle={vehicle} />
                    ))}
                  </div>
                )}

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex justify-center items-center gap-2">
                    <button
                      onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                      disabled={currentPage === 1}
                      className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      Précédent
                    </button>
                    
                    {[...Array(totalPages)].map((_, i) => (
                      <button
                        key={i}
                        onClick={() => setCurrentPage(i + 1)}
                        className={`px-4 py-2 rounded-md transition-colors ${
                          currentPage === i + 1
                            ? 'bg-red-600 text-white'
                            : 'border border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        {i + 1}
                      </button>
                    ))}

                    <button
                      onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                      disabled={currentPage === totalPages}
                      className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      Suivant
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Filter Panel */}
      <MobileFilterPanel
        isOpen={isMobileFilterOpen}
        onClose={closeMobileFilter}
        filters={tempFilters}
        setFilters={setTempFilters}
        onApply={applyMobileFilters}
        onReset={resetMobileFilters}
        priceRange={priceRange}
        yearRange={yearRange}
        uniqueBrands={uniqueBrands}
        uniqueModels={tempFilters.brand ? uniqueModels : []}
        toggleFuelType={(fuelType) => {
          setTempFilters(prev => ({
            ...prev,
            fuelTypes: prev.fuelTypes.includes(fuelType)
              ? prev.fuelTypes.filter(f => f !== fuelType)
              : [...prev.fuelTypes, fuelType]
          }));
        }}
        toggleGearbox={(gearbox) => {
          setTempFilters(prev => ({
            ...prev,
            gearboxes: prev.gearboxes.includes(gearbox)
              ? prev.gearboxes.filter(g => g !== gearbox)
              : [...prev.gearboxes, gearbox]
          }));
        }}
      />
    </div>
  );
}