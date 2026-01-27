/**
 * Client JDC Auto pour l'API Spider-VO
 * Interface avec l'API PHP backend pour données véhicules réelles
 * Remplace les données mock par l'intégration Spider-VO
 */

// Configuration API selon environnement
const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? '/api/index.php'  // URL relative en production (Gandi)
  : 'http://localhost:8080/api/index.php';  // URL locale pour dev

/**
 * Client API pour véhicules réels Spider-VO
 */
class JDCAutoAPIClient {
  constructor() {
    this.baseURL = API_BASE_URL;
  }
  
  /**
   * Requête HTTP générique avec gestion d'erreurs
   */
  async request(params = {}) {
    const url = new URL(this.baseURL, window.location.origin);
    
    // Ajouter paramètres
    Object.keys(params).forEach(key => {
      if (params[key] !== undefined && params[key] !== null) {
        url.searchParams.append(key, params[key]);
      }
    });
    
    try {
      const response = await fetch(url.toString(), {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.error || 'Erreur API inconnue');
      }
      
      return data.data;
      
    } catch (error) {
      console.error('Erreur API JDC Auto:', error);
      
      // Mode dégradé avec données par défaut en cas d'erreur
      if (params.action === 'vehicles') {
        console.warn('Mode dégradé: utilisation de données par défaut');
        return this.getFallbackVehicles();
      }
      
      throw error;
    }
  }
  
  /**
   * Interface compatible avec l'ancien système base44
   */
  entities = {
    Vehicle: {
      /**
       * Filtre les véhicules - Compatible avec: base44.entities.Vehicle.filter()
       */
      async filter(filters = {}, sortBy = '-created_date', limit = null) {
        const params = {
          action: 'vehicles',
          limit: limit || 50,
          sort: this.parseSortBy(sortBy)
        };
        
        // Appliquer filtres
        if (filters.status === 'Disponible') {
          params.status = 'Disponible';
        }
        
        if (filters.marque) params.marque = filters.marque;
        if (filters.modele) params.modele = filters.modele;
        if (filters.category) params.category = filters.category;
        
        try {
          const vehicles = await this.request(params);
          
          // Transformation pour compatibilité totale
          return vehicles.map(vehicle => ({
            ...vehicle,
            // Champs attendus par les composants React
            id: vehicle.id?.toString() || vehicle.reference,
            brand: vehicle.marque,
            model: vehicle.modele,
            price: parseFloat(vehicle.prix_vente || 0),
            mileage: parseInt(vehicle.kilometrage || 0),
            year: parseInt(vehicle.annee || new Date().getFullYear()),
            fuel_type: vehicle.energie || 'Essence',
            gearbox: vehicle.typeboite === 'A' ? 'Automatique' : 'Manuelle',
            status: vehicle.etat || 'Disponible',
            description: vehicle.description || `${vehicle.marque} ${vehicle.modele}`,
            image_url: vehicle.image_url || this.getPlaceholderImage(vehicle.marque),
            category: vehicle.carrosserie || 'Berline'
          }));
          
        } catch (error) {
          console.error('Erreur filter():', error);
          return this.getFallbackVehicles(limit);
        }
      },
      
      /**
       * Liste tous les véhicules - Compatible avec: base44.entities.Vehicle.list()
       */
      async list(sortBy = '-created_date', limit = null) {
        return await this.entities.Vehicle.filter({}, sortBy, limit);
      }
    }
  };
  
  /**
   * Parser le format sortBy
   */
  parseSortBy(sortBy) {
    const sortMap = {
      '-created_date': 'date_modif_DESC',
      'created_date': 'date_modif_ASC',
      '-year': 'annee_DESC',
      'year': 'annee_ASC',
      'price': 'prix_vente_ASC',
      '-price': 'prix_vente_DESC'
    };
    
    return sortMap[sortBy] || 'date_modif_DESC';
  }
  
  /**
   * Image placeholder par marque
   */
  getPlaceholderImage(marque = '') {
    const brand = marque.toLowerCase();
    const imageMap = {
      'renault': 'https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=800&auto=format&fit=crop',
      'peugeot': 'https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=800&auto=format&fit=crop',
      'bmw': 'https://images.unsplash.com/photo-1555215695-3004980ad54e?w=800&auto=format&fit=crop',
      'mercedes': 'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=800&auto=format&fit=crop',
      'audi': 'https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=800&auto=format&fit=crop'
    };
    
    return imageMap[brand] || 'https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=800&auto=format&fit=crop';
  }
  
  /**
   * Données de secours en cas d'erreur API
   */
  getFallbackVehicles(limit = 3) {
    console.warn('🚨 Mode dégradé: utilisation de données de secours');
    
    const fallbackData = [
      {
        id: 'fallback-1',
        reference: 'JDC-001',
        brand: 'RENAULT',
        model: 'CLIO V',
        marque: 'RENAULT',
        modele: 'CLIO V',
        price: 14990,
        prix_vente: 14990,
        mileage: 35000,
        kilometrage: 35000,
        year: 2021,
        annee: 2021,
        fuel_type: 'Essence',
        energie: 'ESSENCE',
        gearbox: 'Manuelle',
        status: 'Disponible',
        etat: 'Disponible',
        description: 'Véhicule de démonstration - API indisponible',
        image_url: 'https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=800&auto=format&fit=crop',
        category: 'Citadine',
        carrosserie: 'BERLINE'
      },
      {
        id: 'fallback-2',
        reference: 'JDC-002',
        brand: 'BMW',
        model: 'Série 3',
        marque: 'BMW',
        modele: 'SERIE 3',
        price: 32900,
        prix_vente: 32900,
        mileage: 45000,
        kilometrage: 45000,
        year: 2020,
        annee: 2020,
        fuel_type: 'Diesel',
        energie: 'DIESEL',
        gearbox: 'Automatique',
        status: 'Disponible',
        etat: 'Disponible',
        description: 'Véhicule de démonstration - API indisponible',
        image_url: 'https://images.unsplash.com/photo-1555215695-3004980ad54e?w=800&auto=format&fit=crop',
        category: 'Berline',
        carrosserie: 'BERLINE'
      },
      {
        id: 'fallback-3',
        reference: 'JDC-003',
        brand: 'MERCEDES',
        model: 'Classe A',
        marque: 'MERCEDES',
        modele: 'CLASSE A',
        price: 28900,
        prix_vente: 28900,
        mileage: 32000,
        kilometrage: 32000,
        year: 2021,
        annee: 2021,
        fuel_type: 'Essence',
        energie: 'ESSENCE',
        gearbox: 'Automatique',
        status: 'Disponible',
        etat: 'Disponible',
        description: 'Véhicule de démonstration - API indisponible',
        image_url: 'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=800&auto=format&fit=crop',
        category: 'Compacte',
        carrosserie: 'BERLINE'
      }
    ];
    
    return fallbackData.slice(0, limit || 3);
  }
}

// Export pour compatibilité
export const base44 = new JDCAutoAPIClient();