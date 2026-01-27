import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../utils';
import ImageWithAnimation from '../Components/ImageWithAnimation';
import { 
  Calendar, 
  Gauge, 
  Fuel, 
  Settings, 
  Palette,
  Users,
  DoorOpen,
  ChevronLeft,
  Phone,
  Mail,
  X,
  ChevronRight
} from 'lucide-react';

export default function VehicleDetail() {
  const urlParams = new URLSearchParams(window.location.search);
  const vehicleId = urlParams.get('id');
  const [selectedPhotoIndex, setSelectedPhotoIndex] = React.useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = React.useState(false);
  const [lightboxPhotoIndex, setLightboxPhotoIndex] = React.useState(0);

  const { data: vehicle, isLoading } = useQuery({
    queryKey: ['vehicle', vehicleId],
    queryFn: async () => {
      if (!vehicleId) return null;
      // Utiliser l'action vehicle?id= directement
      const response = await fetch(`/api/index.php?action=vehicle&id=${vehicleId}`);
      if (!response.ok) throw new Error('Véhicule non trouvé');
      const data = await response.json();
      if (!data.success) throw new Error(data.error || 'Erreur API');
      
      // Transformation pour compatibilité
      const v = data.data;
      return {
        ...v,
        id: v.id?.toString() || v.reference,
        brand: v.brand || v.marque,
        model: v.model || v.modele,
        price: v.price || parseFloat(v.prix_vente || 0),
        mileage: v.mileage || parseInt(v.kilometrage || 0),
        year: v.year || parseInt(v.annee || new Date().getFullYear()),
        fuel_type: v.fuel_type || v.energie,
        gearbox: v.gearbox || (v.typeboite === 'A' ? 'Automatique' : 'Manuelle'),
        status: v.status || v.etat,
        category: v.category || v.carrosserie,
        image_url: v.image_url || v.photos?.[0] || '',
        photos: v.photos || []
      };
    },
    enabled: !!vehicleId,
  });

  // Keyboard navigation for lightbox
  React.useEffect(() => {
    if (!isLightboxOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setIsLightboxOpen(false);
        return;
      }

      if (!vehicle?.photos || vehicle.photos.length <= 1) return;

      if (e.key === 'ArrowLeft') {
        setLightboxPhotoIndex(prev => prev > 0 ? prev - 1 : vehicle.photos.length - 1);
      } else if (e.key === 'ArrowRight') {
        setLightboxPhotoIndex(prev => prev < vehicle.photos.length - 1 ? prev + 1 : 0);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isLightboxOpen, vehicle?.photos]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600" />
      </div>
    );
  }

  if (!vehicle) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Véhicule non trouvé</h1>
          <Link to={createPageUrl('Vehicles')} className="text-red-600 hover:text-red-700">
            Retour aux véhicules
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Back Button */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <Link
            to={createPageUrl('Vehicles')}
            className="inline-flex items-center gap-2 text-gray-600 hover:text-red-600 transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
            Retour aux véhicules
          </Link>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Image Gallery */}
            <div className="bg-white rounded-lg shadow-md overflow-hidden mb-6">
              {/* Main Image */}
              <div className="relative cursor-pointer group" onClick={() => {
                setLightboxPhotoIndex(selectedPhotoIndex);
                setIsLightboxOpen(true);
              }}>
                <ImageWithAnimation
                  src={vehicle.photos && vehicle.photos.length > 0 
                    ? vehicle.photos[selectedPhotoIndex] 
                    : vehicle.image_url || 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=1200&auto=format&fit=crop'}
                  alt={`${vehicle.brand} ${vehicle.model} - Photo ${selectedPhotoIndex + 1}`}
                  className="w-full h-96 object-cover group-hover:opacity-90 transition-opacity"
                  animation="zoom-in"
                />
                {/* Overlay hint on hover */}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
                  <div className="bg-white/90 text-gray-900 px-4 py-2 rounded-lg font-semibold text-sm">
                    Cliquez pour agrandir
                  </div>
                </div>
                {/* Navigation arrows if multiple photos */}
                {vehicle.photos && vehicle.photos.length > 1 && (
                  <>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedPhotoIndex(prev => prev > 0 ? prev - 1 : vehicle.photos.length - 1);
                      }}
                      className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-3 rounded-full transition-all z-10"
                      aria-label="Photo précédente"
                    >
                      <ChevronLeft className="w-6 h-6" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedPhotoIndex(prev => prev < vehicle.photos.length - 1 ? prev + 1 : 0);
                      }}
                      className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-3 rounded-full transition-all z-10"
                      aria-label="Photo suivante"
                    >
                      <ChevronRight className="w-6 h-6" />
                    </button>
                    {/* Photo counter */}
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/50 text-white px-4 py-2 rounded-full text-sm font-semibold z-10">
                      {selectedPhotoIndex + 1} / {vehicle.photos.length}
                    </div>
                  </>
                )}
              </div>
              
              {/* Thumbnail Gallery */}
              {vehicle.photos && vehicle.photos.length > 1 && (
                <div className="p-4 bg-gray-50 border-t">
                  <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                    {vehicle.photos.map((photo, index) => (
                      <button
                        key={index}
                        onClick={() => {
                          setSelectedPhotoIndex(index);
                          setLightboxPhotoIndex(index);
                          setIsLightboxOpen(true);
                        }}
                        className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all cursor-pointer ${
                          selectedPhotoIndex === index
                            ? 'border-red-600 ring-2 ring-red-300'
                            : 'border-gray-300 hover:border-red-400'
                        }`}
                      >
                        <img
                          src={photo}
                          alt={`${vehicle.brand} ${vehicle.model} - Miniature ${index + 1}`}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.target.src = 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=200&auto=format&fit=crop';
                          }}
                        />
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Details */}
            <div className="bg-white rounded-lg shadow-md p-8">
              <div className="flex items-center gap-3 mb-4 flex-wrap">
                <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
                  {vehicle.brand} {vehicle.model}
                </h1>
                {vehicle.quantity > 1 && (
                  <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold bg-green-100 text-green-800 border-2 border-green-300">
                    {vehicle.quantity} exemplaires disponibles
                  </span>
                )}
              </div>

              {/* Specs Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
                <div className="flex flex-col items-center p-4 bg-gray-50 rounded-lg">
                  <Calendar className="w-8 h-8 text-red-600 mb-2" />
                  <span className="text-sm text-gray-600">Année</span>
                  <span className="text-lg font-bold text-gray-900">{vehicle.year}</span>
                </div>
                <div className="flex flex-col items-center p-4 bg-gray-50 rounded-lg">
                  <Gauge className="w-8 h-8 text-red-600 mb-2" />
                  <span className="text-sm text-gray-600">Kilométrage</span>
                  <span className="text-lg font-bold text-gray-900">{vehicle.mileage.toLocaleString('fr-FR')} km</span>
                </div>
                <div className="flex flex-col items-center p-4 bg-gray-50 rounded-lg">
                  <Fuel className="w-8 h-8 text-red-600 mb-2" />
                  <span className="text-sm text-gray-600">Carburant</span>
                  <span className="text-lg font-bold text-gray-900">{vehicle.fuel_type}</span>
                </div>
                <div className="flex flex-col items-center p-4 bg-gray-50 rounded-lg">
                  <Settings className="w-8 h-8 text-red-600 mb-2" />
                  <span className="text-sm text-gray-600">Boîte</span>
                  <span className="text-lg font-bold text-gray-900">{vehicle.gearbox}</span>
                </div>
              </div>

              {/* Additional Details */}
              {(vehicle.color || vehicle.doors || vehicle.seats) && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8 pb-8 border-b">
                  {vehicle.color && (
                    <div className="flex items-center gap-3">
                      <Palette className="w-5 h-5 text-gray-400" />
                      <div>
                        <span className="text-sm text-gray-600">Couleur</span>
                        <p className="font-semibold text-gray-900">{vehicle.color}</p>
                      </div>
                    </div>
                  )}
                  {vehicle.doors && (
                    <div className="flex items-center gap-3">
                      <DoorOpen className="w-5 h-5 text-gray-400" />
                      <div>
                        <span className="text-sm text-gray-600">Portes</span>
                        <p className="font-semibold text-gray-900">{vehicle.doors}</p>
                      </div>
                    </div>
                  )}
                  {vehicle.seats && (
                    <div className="flex items-center gap-3">
                      <Users className="w-5 h-5 text-gray-400" />
                      <div>
                        <span className="text-sm text-gray-600">Places</span>
                        <p className="font-semibold text-gray-900">{vehicle.seats}</p>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Description */}
              {vehicle.description && (
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">Description</h2>
                  <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                    {vehicle.description}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6 sticky top-24">
              {/* Price */}
              <div className="mb-6 pb-6 border-b">
                <div className="text-4xl font-bold text-red-600 mb-2">
                  {vehicle.price.toLocaleString('fr-FR')} €
                </div>
                {vehicle.status === 'Disponible' && (
                  <span className="inline-block px-3 py-1 bg-green-100 text-green-800 text-sm font-semibold rounded-full">
                    Disponible
                  </span>
                )}
                {vehicle.status === 'Réservé' && (
                  <span className="inline-block px-3 py-1 bg-yellow-100 text-yellow-800 text-sm font-semibold rounded-full">
                    Réservé
                  </span>
                )}
              </div>

              {/* Contact */}
              <div className="space-y-4 mb-6">
                <h3 className="text-lg font-bold text-gray-900">Intéressé par ce véhicule ?</h3>
                <a
                  href="tel:0556973752"
                  className="flex items-center justify-center gap-2 w-full px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-md transition-colors"
                >
                  <Phone className="w-5 h-5" />
                  Appeler maintenant
                </a>
                <Link
                  to={createPageUrl('Contact')}
                  className="flex items-center justify-center gap-2 w-full px-6 py-3 bg-black hover:bg-gray-800 text-white font-semibold rounded-md transition-colors"
                >
                  <Mail className="w-5 h-5" />
                  Envoyer un message
                </Link>
              </div>

              {/* Guarantees */}
              <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                <h4 className="font-bold text-gray-900">Nos garanties</h4>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li className="flex items-start gap-2">
                    <span className="text-red-600 font-bold">✓</span>
                    <span>Garantie minimum 6 mois</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-red-600 font-bold">✓</span>
                    <span>Véhicule contrôlé et certifié</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-red-600 font-bold">✓</span>
                    <span>Reprise de votre ancien véhicule</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-red-600 font-bold">✓</span>
                    <span>Démarches administratives incluses</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-red-600 font-bold">✓</span>
                    <span>Solutions de financement</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Lightbox Modal */}
      {isLightboxOpen && vehicle && (
        <div 
          className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center p-4"
          onClick={() => setIsLightboxOpen(false)}
        >
          {/* Close Button */}
          <button
            onClick={() => setIsLightboxOpen(false)}
            className="absolute top-4 right-4 text-white hover:text-gray-300 transition-colors z-50 bg-black/50 hover:bg-black/70 p-3 rounded-full"
            aria-label="Fermer"
          >
            <X className="w-6 h-6" />
          </button>

          {/* Image Container */}
          <div 
            className="relative max-w-7xl w-full h-full flex items-center justify-center"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={
                vehicle.photos && vehicle.photos.length > 0
                  ? vehicle.photos[lightboxPhotoIndex]
                  : vehicle.image_url || 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=1200&auto=format&fit=crop'
              }
              alt={`${vehicle.brand} ${vehicle.model} - Photo ${lightboxPhotoIndex + 1}`}
              className="max-w-full max-h-full object-contain"
            />

            {/* Navigation Arrows */}
            {vehicle.photos && vehicle.photos.length > 1 && (
              <>
                <button
                  onClick={() => setLightboxPhotoIndex(prev => prev > 0 ? prev - 1 : vehicle.photos.length - 1)}
                  className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/10 hover:bg-white/20 text-white p-4 rounded-full transition-all backdrop-blur-sm"
                  aria-label="Photo précédente"
                >
                  <ChevronLeft className="w-8 h-8" />
                </button>
                <button
                  onClick={() => setLightboxPhotoIndex(prev => prev < vehicle.photos.length - 1 ? prev + 1 : 0)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/10 hover:bg-white/20 text-white p-4 rounded-full transition-all backdrop-blur-sm"
                  aria-label="Photo suivante"
                >
                  <ChevronRight className="w-8 h-8" />
                </button>

                {/* Photo Counter */}
                <div className="absolute bottom-8 left-1/2 -translate-x-1/2 bg-black/50 text-white px-6 py-3 rounded-full text-base font-semibold backdrop-blur-sm">
                  {lightboxPhotoIndex + 1} / {vehicle.photos.length}
                </div>
              </>
            )}

            {/* Keyboard Navigation Hint */}
            {vehicle.photos && vehicle.photos.length > 1 && (
              <div className="absolute bottom-8 right-8 text-white/70 text-sm">
                Utilisez les flèches pour naviguer
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}