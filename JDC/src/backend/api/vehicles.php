<?php
/**
 * API REST pour véhicules JDC Auto
 * Endpoints pour le front-end React
 */

require_once __DIR__ . '/../config/database.php';

// Configuration CORS pour React
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// Gérer requêtes OPTIONS (preflight)
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

class VehiclesAPI {
    
    private $pdo;
    
    public function __construct() {
        $this->pdo = DatabaseConfig::getConnection();
    }
    
    /**
     * Router principal
     */
    public function handleRequest() {
        $method = $_SERVER['REQUEST_METHOD'];
        $path = $_SERVER['PATH_INFO'] ?? $_GET['path'] ?? '/';
        
        try {
            switch ($path) {
                case '/vehicles':
                case '/vehicles/':
                    return $this->getVehicles();
                    
                case '/vehicle/{id}':
                case '/vehicle':
                    return $this->getVehicleDetail();
                    
                case '/brands':
                    return $this->getBrands();
                    
                case '/models':
                    return $this->getModels();
                    
                case '/stats':
                    return $this->getStats();
                    
                case '/search':
                    return $this->searchVehicles();
                    
                default:
                    return $this->sendError('Endpoint non trouvé', 404);
            }
            
        } catch (Exception $e) {
            SpiderVOConfig::log("Erreur API: " . $e->getMessage(), 'ERROR');
            return $this->sendError('Erreur serveur: ' . $e->getMessage(), 500);
        }
    }
    
    /**
     * Liste des véhicules avec filtres
     */
    private function getVehicles() {
        $page = (int)($_GET['page'] ?? 1);
        $limit = min((int)($_GET['limit'] ?? 12), 50);
        $offset = ($page - 1) * $limit;
        
        // Filtres
        $filters = [
            'marque' => $_GET['marque'] ?? null,
            'modele' => $_GET['modele'] ?? null,
            'prix_min' => (int)($_GET['prix_min'] ?? 0),
            'prix_max' => (int)($_GET['prix_max'] ?? 0),
            'annee_min' => (int)($_GET['annee_min'] ?? 0),
            'energie' => $_GET['energie'] ?? null,
            'carrosserie' => $_GET['carrosserie'] ?? null
        ];
        
        // Construction de la requête avec filtres
        $where = ['v.etat = ?'];
        $params = ['Disponible'];
        
        if ($filters['marque']) {
            $where[] = 'v.marque = ?';
            $params[] = $filters['marque'];
        }
        
        if ($filters['modele']) {
            $where[] = 'v.modele = ?';
            $params[] = $filters['modele'];
        }
        
        if ($filters['prix_min'] > 0) {
            $where[] = 'v.prix_vente >= ?';
            $params[] = $filters['prix_min'];
        }
        
        if ($filters['prix_max'] > 0) {
            $where[] = 'v.prix_vente <= ?';
            $params[] = $filters['prix_max'];
        }
        
        if ($filters['annee_min'] > 0) {
            $where[] = 'v.annee >= ?';
            $params[] = $filters['annee_min'];
        }
        
        if ($filters['energie']) {
            $where[] = 'v.energie = ?';
            $params[] = $filters['energie'];
        }
        
        if ($filters['carrosserie']) {
            $where[] = 'v.carrosserie = ?';
            $params[] = $filters['carrosserie'];
        }
        
        $whereClause = implode(' AND ', $where);
        
        // Tri
        $orderBy = $_GET['sort'] ?? 'date_modif';
        $orderDirection = ($_GET['order'] ?? 'DESC') === 'ASC' ? 'ASC' : 'DESC';
        
        $validSortColumns = ['prix_vente', 'annee', 'kilometrage', 'date_modif', 'marque'];
        if (!in_array($orderBy, $validSortColumns)) {
            $orderBy = 'date_modif';
        }
        
        // Requête principale
        $sql = "
            SELECT 
                v.*,
                GROUP_CONCAT(vp.photo_url ORDER BY vp.photo_order SEPARATOR '|') as photos,
                COUNT(vp.id) as photos_count
            FROM vehicles v
            LEFT JOIN vehicle_photos vp ON v.id = vp.vehicle_id
            WHERE $whereClause
            GROUP BY v.id
            ORDER BY v.$orderBy $orderDirection
            LIMIT $limit OFFSET $offset
        ";
        
        $stmt = $this->pdo->prepare($sql);
        $stmt->execute($params);
        $vehicles = $stmt->fetchAll();
        
        // Post-traitement des données
        foreach ($vehicles as &$vehicle) {
            $vehicle['photos'] = $vehicle['photos'] ? explode('|', $vehicle['photos']) : [];
            $vehicle['price'] = (float)$vehicle['prix_vente'];
            $vehicle['mileage'] = (int)$vehicle['kilometrage'];
            $vehicle['year'] = (int)$vehicle['annee'];
            $vehicle['fuel_type'] = $vehicle['energie'];
            $vehicle['gearbox'] = $vehicle['typeboite'] === 'A' ? 'Automatique' : 'Manuelle';
            $vehicle['image_url'] = $vehicle['photos'][0] ?? '';
            $vehicle['status'] = $vehicle['etat'];
            $vehicle['brand'] = $vehicle['marque'];
            $vehicle['model'] = $vehicle['modele'];
            $vehicle['category'] = $vehicle['carrosserie'];
        }
        
        // Compter total pour pagination
        $countSql = "SELECT COUNT(*) as total FROM vehicles v WHERE $whereClause";
        $countStmt = $this->pdo->prepare($countSql);
        $countStmt->execute($params);
        $total = $countStmt->fetch()['total'];
        
        return $this->sendSuccess([
            'vehicles' => $vehicles,
            'pagination' => [
                'page' => $page,
                'limit' => $limit,
                'total' => (int)$total,
                'pages' => ceil($total / $limit)
            ],
            'filters_applied' => array_filter($filters)
        ]);
    }
    
    /**
     * Détail d'un véhicule
     */
    private function getVehicleDetail() {
        $id = (int)($_GET['id'] ?? 0);
        
        if (!$id) {
            return $this->sendError('ID véhicule requis', 400);
        }
        
        // Récupérer véhicule avec photos, équipements et options
        $sql = "
            SELECT v.* FROM vehicles v WHERE v.id = ?
        ";
        
        $stmt = $this->pdo->prepare($sql);
        $stmt->execute([$id]);
        $vehicle = $stmt->fetch();
        
        if (!$vehicle) {
            return $this->sendError('Véhicule non trouvé', 404);
        }
        
        // Récupérer photos
        $stmt = $this->pdo->prepare("
            SELECT photo_url FROM vehicle_photos 
            WHERE vehicle_id = ? 
            ORDER BY photo_order
        ");
        $stmt->execute([$id]);
        $vehicle['photos'] = $stmt->fetchAll(PDO::FETCH_COLUMN);
        
        // Récupérer équipements
        $stmt = $this->pdo->prepare("
            SELECT equipement_nom, montant FROM vehicle_equipements 
            WHERE vehicle_id = ?
        ");
        $stmt->execute([$id]);
        $vehicle['equipements'] = $stmt->fetchAll();
        
        // Récupérer options
        $stmt = $this->pdo->prepare("
            SELECT option_nom, montant FROM vehicle_options 
            WHERE vehicle_id = ?
        ");
        $stmt->execute([$id]);
        $vehicle['options'] = $stmt->fetchAll();
        
        // Format pour React
        $vehicle['price'] = (float)$vehicle['prix_vente'];
        $vehicle['mileage'] = (int)$vehicle['kilometrage'];
        $vehicle['year'] = (int)$vehicle['annee'];
        $vehicle['fuel_type'] = $vehicle['energie'];
        $vehicle['gearbox'] = $vehicle['typeboite'] === 'A' ? 'Automatique' : 'Manuelle';
        $vehicle['image_url'] = $vehicle['photos'][0] ?? '';
        $vehicle['status'] = $vehicle['etat'];
        $vehicle['brand'] = $vehicle['marque'];
        $vehicle['model'] = $vehicle['modele'];
        $vehicle['category'] = $vehicle['carrosserie'];
        
        return $this->sendSuccess($vehicle);
    }
    
    /**
     * Liste des marques disponibles
     */
    private function getBrands() {
        $sql = "
            SELECT marque as brand, COUNT(*) as count 
            FROM vehicles 
            WHERE etat = 'Disponible' 
            GROUP BY marque 
            ORDER BY marque
        ";
        
        $stmt = $this->pdo->query($sql);
        $brands = $stmt->fetchAll();
        
        return $this->sendSuccess($brands);
    }
    
    /**
     * Modèles pour une marque donnée
     */
    private function getModels() {
        $brand = $_GET['brand'] ?? '';
        
        if (!$brand) {
            return $this->sendError('Paramètre brand requis', 400);
        }
        
        $sql = "
            SELECT DISTINCT modele as model 
            FROM vehicles 
            WHERE marque = ? AND etat = 'Disponible'
            ORDER BY modele
        ";
        
        $stmt = $this->pdo->prepare($sql);
        $stmt->execute([$brand]);
        $models = $stmt->fetchAll(PDO::FETCH_COLUMN);
        
        return $this->sendSuccess($models);
    }
    
    /**
     * Recherche textuelle
     */
    private function searchVehicles() {
        $query = $_GET['q'] ?? '';
        $limit = min((int)($_GET['limit'] ?? 10), 50);
        
        if (strlen($query) < 3) {
            return $this->sendError('Recherche trop courte (minimum 3 caractères)', 400);
        }
        
        $sql = "
            SELECT 
                v.*,
                GROUP_CONCAT(vp.photo_url ORDER BY vp.photo_order SEPARATOR '|') as photos,
                MATCH(v.marque, v.modele, v.version, v.description) AGAINST(? IN NATURAL LANGUAGE MODE) as relevance
            FROM vehicles v
            LEFT JOIN vehicle_photos vp ON v.id = vp.vehicle_id
            WHERE v.etat = 'Disponible' 
              AND MATCH(v.marque, v.modele, v.version, v.description) AGAINST(? IN NATURAL LANGUAGE MODE)
            GROUP BY v.id
            ORDER BY relevance DESC
            LIMIT $limit
        ";
        
        $stmt = $this->pdo->prepare($sql);
        $stmt->execute([$query, $query]);
        $vehicles = $stmt->fetchAll();
        
        // Format pour React
        foreach ($vehicles as &$vehicle) {
            $vehicle['photos'] = $vehicle['photos'] ? explode('|', $vehicle['photos']) : [];
            $vehicle['price'] = (float)$vehicle['prix_vente'];
            $vehicle['mileage'] = (int)$vehicle['kilometrage'];
            $vehicle['image_url'] = $vehicle['photos'][0] ?? '';
            $vehicle['brand'] = $vehicle['marque'];
            $vehicle['model'] = $vehicle['modele'];
        }
        
        return $this->sendSuccess($vehicles);
    }
    
    /**
     * Statistiques générales
     */
    private function getStats() {
        $sync = new SpiderVOSync();
        $stats = $sync->getStats();
        return $this->sendSuccess($stats);
    }
    
    /**
     * Réponse success
     */
    private function sendSuccess($data) {
        http_response_code(200);
        echo json_encode([
            'success' => true,
            'data' => $data,
            'timestamp' => date('c')
        ], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
        exit;
    }
    
    /**
     * Réponse erreur
     */
    private function sendError($message, $code = 400) {
        http_response_code($code);
        echo json_encode([
            'success' => false,
            'error' => $message,
            'timestamp' => date('c')
        ], JSON_UNESCAPED_UNICODE);
        exit;
    }
}

// Point d'entrée API
try {
    $api = new VehiclesAPI();
    $api->handleRequest();
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => 'Erreur serveur interne'
    ]);
}

?>

