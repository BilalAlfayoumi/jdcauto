/**
 * Client Base44 pour l'API
 * Cette classe simule l'API Base44 pour le développement
 * À remplacer par le vrai client Base44 quand il sera disponible
 */

// Données mock pour les tests
const mockVehicles = [
  {
    id: '1',
    brand: 'Renault',
    model: 'Clio V',
    year: 2021,
    price: 14990,
    mileage: 35000,
    fuel_type: 'Essence',
    gearbox: 'Manuelle',
    status: 'Disponible',
    description: 'Renault Clio V en excellent état, très bien entretenue. Première main, carnet d\'entretien complet.',
    image_url: 'https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=800&auto=format&fit=crop'
  },
  {
    id: '2',
    brand: 'Peugeot',
    model: '208',
    year: 2022,
    price: 16990,
    mileage: 28000,
    fuel_type: 'Essence',
    gearbox: 'Automatique',
    status: 'Disponible',
    description: 'Peugeot 208 récente, très peu kilométrée. Équipements modernes, garantie constructeur.',
    image_url: 'https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=800&auto=format&fit=crop'
  },
  {
    id: '3',
    brand: 'BMW',
    model: 'Série 3',
    year: 2020,
    price: 32900,
    mileage: 45000,
    fuel_type: 'Diesel',
    gearbox: 'Automatique',
    status: 'Disponible',
    description: 'BMW Série 3 premium, finition M Sport. Véhicule de prestige, entretien BMW.',
    image_url: 'https://images.unsplash.com/photo-1555215695-3004980ad54e?w=800&auto=format&fit=crop'
  },
  {
    id: '4',
    brand: 'Mercedes',
    model: 'Classe A',
    year: 2021,
    price: 28900,
    mileage: 32000,
    fuel_type: 'Essence',
    gearbox: 'Automatique',
    status: 'Disponible',
    description: 'Mercedes Classe A récente, finition AMG Line. Équipements haut de gamme.',
    image_url: 'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=800&auto=format&fit=crop'
  },
  {
    id: '5',
    brand: 'Audi',
    model: 'A3',
    year: 2020,
    price: 24900,
    mileage: 38000,
    fuel_type: 'Diesel',
    gearbox: 'Automatique',
    status: 'Disponible',
    description: 'Audi A3 Sportback, finition S Line. Technologie Audi connectée, très bien équipée.',
    image_url: 'https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=800&auto=format&fit=crop'
  },
  {
    id: '6',
    brand: 'Citroën',
    model: 'C3',
    year: 2021,
    price: 12900,
    mileage: 40000,
    fuel_type: 'Essence',
    gearbox: 'Manuelle',
    status: 'Disponible',
    description: 'Citroën C3 en très bon état, idéale pour la ville. Consommation réduite.',
    image_url: 'https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=800&auto=format&fit=crop'
  },
  {
    id: '7',
    brand: 'Volkswagen',
    model: 'Golf',
    year: 2022,
    price: 21900,
    mileage: 25000,
    fuel_type: 'Essence',
    gearbox: 'Automatique',
    status: 'Disponible',
    description: 'Volkswagen Golf récente, très peu kilométrée. Qualité allemande, garantie constructeur.',
    image_url: 'https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=800&auto=format&fit=crop'
  },
  {
    id: '8',
    brand: 'Ford',
    model: 'Focus',
    year: 2020,
    price: 17900,
    mileage: 42000,
    fuel_type: 'Diesel',
    gearbox: 'Manuelle',
    status: 'Disponible',
    description: 'Ford Focus, excellent rapport qualité/prix. Confortable et économique.',
    image_url: 'https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=800&auto=format&fit=crop'
  },
  {
    id: '9',
    brand: 'Toyota',
    model: 'Yaris',
    year: 2021,
    price: 15900,
    mileage: 30000,
    fuel_type: 'Hybride',
    gearbox: 'Automatique',
    status: 'Disponible',
    description: 'Toyota Yaris hybride, très économique. Technologie Toyota, faible consommation.',
    image_url: 'https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=800&auto=format&fit=crop'
  },
  {
    id: '10',
    brand: 'Opel',
    model: 'Corsa',
    year: 2020,
    price: 13900,
    mileage: 36000,
    fuel_type: 'Essence',
    gearbox: 'Manuelle',
    status: 'Disponible',
    description: 'Opel Corsa en excellent état, idéale pour un premier véhicule. Fiable et économique.',
    image_url: 'https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=800&auto=format&fit=crop'
  },
  {
    id: '11',
    brand: 'Nissan',
    model: 'Micra',
    year: 2021,
    price: 11900,
    mileage: 28000,
    fuel_type: 'Essence',
    gearbox: 'Manuelle',
    status: 'Réservé',
    description: 'Nissan Micra récente, parfaite pour la ville. Compacte et maniable.',
    image_url: 'https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=800&auto=format&fit=crop'
  },
  {
    id: '12',
    brand: 'Fiat',
    model: '500',
    year: 2022,
    price: 14900,
    mileage: 20000,
    fuel_type: 'Essence',
    gearbox: 'Manuelle',
    status: 'Disponible',
    description: 'Fiat 500 récente, très peu kilométrée. Design italien, parfaite pour la ville.',
    image_url: 'https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=800&auto=format&fit=crop'
  }
];

class Base44Client {
  constructor() {
    this.entities = {
      Vehicle: {
        /**
         * Liste tous les véhicules
         * @param {string} sortBy - Critère de tri (ex: '-created_date')
         * @returns {Promise<Array>}
         */
        async list(sortBy = '-created_date') {
          // TODO: Remplacer par un vrai appel API
          // Paramètres réservés pour utilisation future
          void sortBy;
          console.warn('Base44 API not configured. Using mock data.');
          
          // Simuler un délai réseau
          await new Promise(resolve => setTimeout(resolve, 300));
          
          // Trier les véhicules selon le critère
          let sortedVehicles = [...mockVehicles];
          if (sortBy === '-created_date' || sortBy === '-year') {
            sortedVehicles.sort((a, b) => b.year - a.year);
          } else if (sortBy === 'price') {
            sortedVehicles.sort((a, b) => a.price - b.price);
          } else if (sortBy === '-price') {
            sortedVehicles.sort((a, b) => b.price - a.price);
          }
          
          return sortedVehicles;
        },
        
        /**
         * Filtre les véhicules selon des critères
         * @param {Object} filters - Critères de filtrage
         * @param {string} sortBy - Critère de tri
         * @param {number} limit - Nombre maximum de résultats
         * @returns {Promise<Array>}
         */
        async filter(filters = {}, sortBy = '-created_date', limit = null) {
          // TODO: Remplacer par un vrai appel API
          // Paramètres réservés pour utilisation future
          void filters;
          void sortBy;
          void limit;
          console.warn('Base44 API not configured. Using mock data.');
          
          // Simuler un délai réseau
          await new Promise(resolve => setTimeout(resolve, 300));
          
          // Filtrer les véhicules
          let filteredVehicles = [...mockVehicles];
          
          // Filtrer par statut si fourni
          if (filters.status) {
            filteredVehicles = filteredVehicles.filter(v => v.status === filters.status);
          }
          
          // Filtrer par ID si fourni
          if (filters.id) {
            filteredVehicles = filteredVehicles.filter(v => v.id === filters.id);
            return filteredVehicles.length > 0 ? [filteredVehicles[0]] : [];
          }
          
          // Trier les véhicules
          if (sortBy === '-created_date' || sortBy === '-year') {
            filteredVehicles.sort((a, b) => b.year - a.year);
          } else if (sortBy === 'price') {
            filteredVehicles.sort((a, b) => a.price - b.price);
          } else if (sortBy === '-price') {
            filteredVehicles.sort((a, b) => b.price - a.price);
          }
          
          // Limiter le nombre de résultats
          if (limit && limit > 0) {
            filteredVehicles = filteredVehicles.slice(0, limit);
          }
          
          return filteredVehicles;
        },
        
        /**
         * Crée une nouvelle entité (pour les formulaires de contact)
         * @param {Object} data - Données à créer
         * @returns {Promise<Object>}
         */
        async create(data) {
          // TODO: Remplacer par un vrai appel API
          console.warn('Base44 API not configured. Using mock data.');
          
          // Simuler un délai réseau
          await new Promise(resolve => setTimeout(resolve, 500));
          
          // Retourner les données avec un ID généré
          return {
            id: Date.now().toString(),
            ...data,
            created_at: new Date().toISOString()
          };
        }
      },
      
      ContactRequest: {
        /**
         * Crée une demande de contact
         * @param {Object} data - Données du formulaire de contact
         * @returns {Promise<Object>}
         */
        async create(data) {
          // TODO: Remplacer par un vrai appel API
          console.warn('Base44 API not configured. Using mock data.');
          
          // Simuler un délai réseau
          await new Promise(resolve => setTimeout(resolve, 500));
          
          // Retourner les données avec un ID généré
          return {
            id: Date.now().toString(),
            ...data,
            created_at: new Date().toISOString(),
            status: 'pending'
          };
        }
      }
    };
  }
}

export const base44 = new Base44Client();
