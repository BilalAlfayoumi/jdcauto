/**
 * Client API pour véhicules JDC Auto
 * Interface avec l'API PHP backend pour données Spider-VO
 */

// Configuration API (à adapter selon votre hébergement Gandi)
const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? 'https://www.jdcauto.fr/api'  // URL production Gandi
  : 'http://localhost:8000/api';   // URL développement local

class VehiclesClient {
  constructor() {
    this.baseURL = API_BASE_URL;
  }
  
  /**
   * Requête HTTP générique
   */
  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    
    try {
      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers
        },
        ...options
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
      console.error(`Erreur API ${endpoint}:`, error);
      throw error;
    }
  }
  
  /**
   * Récupérer liste des véhicules avec filtres
   */
  async getVehicles(filters = {}, page = 1, limit = 12) {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...Object.fromEntries(
        Object.entries(filters).filter(([_, value]) => value && value !== '')
      )
    });
    
    return await this.request(`/vehicles?${params}`);
  }
  
  /**
   * Récupérer détail d'un véhicule
   */
  async getVehicle(id) {
    return await this.request(`/vehicle?id=${id}`);
  }
  
  /**
   * Récupérer les marques disponibles
   */
  async getBrands() {
    return await this.request('/brands');
  }
  
  /**
   * Récupérer modèles pour une marque
   */
  async getModels(brand) {
    if (!brand) throw new Error('Marque requise');
    return await this.request(`/models?brand=${encodeURIComponent(brand)}`);
  }
  
  /**
   * Recherche textuelle
   */
  async search(query, limit = 10) {
    if (!query || query.length < 3) {
      throw new Error('Recherche trop courte (minimum 3 caractères)');
    }
    
    return await this.request(`/search?q=${encodeURIComponent(query)}&limit=${limit}`);
  }
  
  /**
   * Statistiques du stock
   */
  async getStats() {
    return await this.request('/stats');
  }
  
  /**
   * Méthodes compatibles avec l'ancien base44Client (pour transition)
   */
  entities = {
    Vehicle: {
      /**
       * Compatible avec: base44.entities.Vehicle.filter()
       */
      async filter(filters = {}, sortBy = '-date_modif', limit = null) {
        const [sortColumn, sortOrder] = this.parseSortBy(sortBy);
        
        const apiFilters = this.transformFilters(filters);
        
        const result = await this.getVehicles(
          apiFilters, 
          1, 
          limit || 50
        );
        
        return result.vehicles || [];
      },
      
      /**
       * Compatible avec: base44.entities.Vehicle.list()
       */
      async list(sortBy = '-date_modif', limit = null) {
        return await this.filter({}, sortBy, limit);
      },
      
      /**
       * Parser le format sortBy de l'ancien système
       */
      parseSortBy(sortBy) {
        if (sortBy.startsWith('-')) {
          return [sortBy.substring(1), 'DESC'];
        }
        return [sortBy, 'ASC'];
      },
      
      /**
       * Transformer les filtres vers format API
       */
      transformFilters(filters) {
        const apiFilters = {};
        
        if (filters.status === 'Disponible') {
          // Géré automatiquement par l'API
        }
        
        if (filters.marque) apiFilters.marque = filters.marque;
        if (filters.modele) apiFilters.modele = filters.modele;
        if (filters.prix_max) apiFilters.prix_max = parseInt(filters.prix_max);
        if (filters.annee_min) apiFilters.annee_min = parseInt(filters.annee_min);
        if (filters.energie) apiFilters.energie = filters.energie;
        if (filters.category) apiFilters.carrosserie = filters.category;
        
        return apiFilters;
      }
    }
  };
}

// Export de l'instance
export const vehiclesAPI = new VehiclesClient();

// Remplacement de base44 pour compatibilité
export const base44 = vehiclesAPI;

