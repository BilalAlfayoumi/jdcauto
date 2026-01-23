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
  Mail
} from 'lucide-react';

export default function VehicleDetail() {
  const urlParams = new URLSearchParams(window.location.search);
  const vehicleId = urlParams.get('id');

  const { data: vehicle, isLoading } = useQuery({
    queryKey: ['vehicle', vehicleId],
    queryFn: async () => {
      const vehicles = await base44.entities.Vehicle.filter({ id: vehicleId });
      return vehicles[0];
    },
    enabled: !!vehicleId,
  });

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
            {/* Image */}
            <div className="bg-white rounded-lg shadow-md overflow-hidden mb-6">
              <ImageWithAnimation
                src={vehicle.image_url || 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=1200&auto=format&fit=crop'}
                alt={`${vehicle.brand} ${vehicle.model}`}
                className="w-full h-96"
                animation="zoom-in"
              />
            </div>

            {/* Details */}
            <div className="bg-white rounded-lg shadow-md p-8">
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                {vehicle.brand} {vehicle.model}
              </h1>

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
                  href="tel:0612345678"
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
    </div>
  );
}