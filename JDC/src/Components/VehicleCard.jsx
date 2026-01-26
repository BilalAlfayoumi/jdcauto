import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { Fuel, Gauge, Settings, Calendar } from 'lucide-react';
import ImageWithAnimation from './ImageWithAnimation';

export default function VehicleCard({ vehicle, index = 0 }) {
  return (
    <div className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-shadow duration-300 group">
      {/* Image */}
      <Link
        to={createPageUrl('VehicleDetail') + `?id=${vehicle.id}`}
        className="relative overflow-hidden aspect-[4/3] block group/image"
      >
        <ImageWithAnimation
          src={vehicle.image_url || 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=800&auto=format&fit=crop'}
          alt={`${vehicle.brand} ${vehicle.model}`}
          className="w-full h-full group-hover:scale-110 transition-transform duration-500"
          animation="zoom-in"
          delay={index * 100}
        />
        {/* Overlay "Voir" au hover */}
        <div className="absolute inset-0 bg-black/0 group-hover/image:bg-black/40 transition-all duration-300 flex items-center justify-center opacity-0 group-hover/image:opacity-100">
          <span className="text-white font-bold text-lg md:text-xl bg-red-600 px-6 py-3 rounded-lg shadow-lg transform scale-95 group-hover/image:scale-100 transition-transform duration-300">
            Voir
          </span>
        </div>
        {vehicle.status === 'Réservé' && (
          <div className="absolute top-4 left-4 bg-yellow-500 text-white px-3 py-1 rounded-full text-xs font-semibold z-10">
            RÉSERVÉ
          </div>
        )}
        {vehicle.status === 'Vendu' && (
          <div className="absolute top-4 left-4 bg-gray-500 text-white px-3 py-1 rounded-full text-xs font-semibold z-10">
            VENDU
          </div>
        )}
      </Link>

      {/* Content */}
      <div className="p-5">
        {/* Title */}
        <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-red-600 transition-colors">
          {vehicle.brand} {vehicle.model}
        </h3>

        {/* Price */}
        <div className="text-2xl font-bold text-red-600 mb-4">
          {vehicle.price.toLocaleString('fr-FR')} €
        </div>

        {/* Details Grid */}
        <div className="grid grid-cols-2 gap-3 mb-4 text-sm text-gray-600">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-gray-400" />
            <span>{vehicle.year}</span>
          </div>
          <div className="flex items-center gap-2">
            <Gauge className="w-4 h-4 text-gray-400" />
            <span>{vehicle.mileage.toLocaleString('fr-FR')} km</span>
          </div>
          <div className="flex items-center gap-2">
            <Fuel className="w-4 h-4 text-gray-400" />
            <span>{vehicle.fuel_type}</span>
          </div>
          <div className="flex items-center gap-2">
            <Settings className="w-4 h-4 text-gray-400" />
            <span>{vehicle.gearbox}</span>
          </div>
        </div>

        {/* Button */}
        <Link
          to={createPageUrl('VehicleDetail') + `?id=${vehicle.id}`}
          className="block w-full bg-black text-white text-center py-3 rounded-md hover:bg-red-600 transition-colors font-semibold"
        >
          Voir le véhicule
        </Link>
      </div>
    </div>
  );
}