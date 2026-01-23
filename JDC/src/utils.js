/**
 * Crée une URL pour une page donnée
 * @param {string} pageName - Nom de la page (ex: 'Vehicles', 'Home', 'Contact')
 * @returns {string} - URL de la page (ex: '/vehicles', '/home', '/contact')
 */
export function createPageUrl(pageName) {
  // Convertit le nom de la page en minuscules et ajoute un slash
  const normalizedName = pageName.toLowerCase();
  
  // Gestion des cas spéciaux
  const routeMap = {
    'home': '/',
    'vehicles': '/vehicles',
    'vehicledetail': '/vehicle-detail',
    'tradein': '/trade-in',
    'contact': '/contact',
    'administrative': '/administrative',
  };
  
  return routeMap[normalizedName] || `/${normalizedName}`;
}

