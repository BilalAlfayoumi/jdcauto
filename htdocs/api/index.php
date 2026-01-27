<?php
/**
 * Point d'entrée API JDC Auto
 * Déployé sur Gandi dans htdocs/api/
 */

// Configuration de base
error_reporting(E_ALL);
ini_set('display_errors', 0); // Désactiver en production
ini_set('log_errors', 1);

// Auto-loader simple pour les classes
spl_autoload_register(function ($className) {
    $paths = [
        __DIR__ . '/classes/',
        __DIR__ . '/config/',
        __DIR__ . '/sync/'
    ];
    
    foreach ($paths as $path) {
        $file = $path . str_replace('\\', '/', $className) . '.php';
        if (file_exists($file)) {
            require_once $file;
            return;
        }
    }
});

// Inclure les fichiers nécessaires
require_once __DIR__ . '/config/database.php';

/**
 * Configuration base de données pour Gandi
 * ⚠️ À ADAPTER avec vos vraies informations Gandi
 */
class GandiDatabaseConfig {
    private static $host = 'mysql-jdcauto.gpaas.net'; // À adapter
    private static $dbname = 'jdcauto'; // À adapter  
    private static $username = 'votre-user'; // À adapter
    private static $password = 'votre-password'; // À adapter
    
    private static $connection = null;
    
    public static function getConnection() {
        if (self::$connection === null) {
            try {
                $dsn = "mysql:host=" . self::$host . ";dbname=" . self::$dbname . ";charset=utf8mb4";
                
                self::$connection = new PDO($dsn, self::$username, self::$password, [
                    PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                    PDO::ATTR_EMULATE_PREPARES => false
                ]);
                
            } catch (PDOException $e) {
                error_log("Erreur BDD Gandi: " . $e->getMessage());
                http_response_code(500);
                echo json_encode(['error' => 'Service temporairement indisponible']);
                exit;
            }
        }
        
        return self::$connection;
    }
}

/**
 * API REST simplifiée pour véhicules
 */
class SimpleVehiclesAPI {
    
    private $pdo;
    
    public function __construct() {
        $this->pdo = GandiDatabaseConfig::getConnection();
    }
    
    public function handleRequest() {
        // CORS pour React
        header('Content-Type: application/json; charset=utf-8');
        header('Access-Control-Allow-Origin: *');
        header('Access-Control-Allow-Methods: GET, OPTIONS');
        header('Access-Control-Allow-Headers: Content-Type');
        
        if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
            http_response_code(200);
            exit;
        }
        
        $action = $_GET['action'] ?? 'vehicles';
        
        try {
            switch ($action) {
                case 'vehicles':
                    return $this->getVehicles();
                case 'vehicle':
                    return $this->getVehicle();
                case 'brands':
                    return $this->getBrands();
                case 'search':
                    return $this->search();
                default:
                    return $this->error('Action non reconnue', 404);
            }
        } catch (Exception $e) {
            error_log("Erreur API: " . $e->getMessage());
            return $this->error('Erreur serveur', 500);
        }
    }
    
    private function getVehicles() {
        $limit = min((int)($_GET['limit'] ?? 12), 50);
        $status = $_GET['status'] ?? 'Disponible';
        
        // Requête simple pour commencer
        $sql = "
            SELECT 
                id,
                reference,
                marque,
                modele, 
                version,
                prix_vente,
                kilometrage,
                annee,
                energie,
                typeboite,
                carrosserie,
                etat,
                couleurexterieur,
                description,
                finition
            FROM vehicles 
            WHERE etat = ? 
            ORDER BY date_modif DESC 
            LIMIT ?
        ";
        
        $stmt = $this->pdo->prepare($sql);
        $stmt->execute([$status, $limit]);
        $vehicles = $stmt->fetchAll();
        
        // Récupérer une photo pour chaque véhicule
        foreach ($vehicles as &$vehicle) {
            $photoStmt = $this->pdo->prepare("
                SELECT photo_url 
                FROM vehicle_photos 
                WHERE vehicle_id = ? 
                ORDER BY photo_order 
                LIMIT 1
            ");
            $photoStmt->execute([$vehicle['id']]);
            $photo = $photoStmt->fetch();
            
            // Format pour compatibilité React
            $vehicle['price'] = (float)$vehicle['prix_vente'];
            $vehicle['mileage'] = (int)$vehicle['kilometrage'];
            $vehicle['year'] = (int)$vehicle['annee'];
            $vehicle['fuel_type'] = $vehicle['energie'];
            $vehicle['gearbox'] = $vehicle['typeboite'] === 'A' ? 'Automatique' : 'Manuelle';
            $vehicle['brand'] = $vehicle['marque'];
            $vehicle['model'] = $vehicle['modele'];
            $vehicle['status'] = $vehicle['etat'];
            $vehicle['category'] = $vehicle['carrosserie'];
            $vehicle['image_url'] = $photo['photo_url'] ?? '';
        }
        
        return $this->success($vehicles);
    }
    
    private function getVehicle() {
        $id = (int)($_GET['id'] ?? 0);
        
        if (!$id) {
            return $this->error('ID véhicule requis', 400);
        }
        
        // Requête véhicule complet
        $sql = "SELECT * FROM vehicles WHERE id = ?";
        $stmt = $this->pdo->prepare($sql);
        $stmt->execute([$id]);
        $vehicle = $stmt->fetch();
        
        if (!$vehicle) {
            return $this->error('Véhicule non trouvé', 404);
        }
        
        // Récupérer toutes les photos
        $stmt = $this->pdo->prepare("
            SELECT photo_url 
            FROM vehicle_photos 
            WHERE vehicle_id = ? 
            ORDER BY photo_order
        ");
        $stmt->execute([$id]);
        $photos = $stmt->fetchAll(PDO::FETCH_COLUMN);
        $vehicle['photos'] = $photos;
        $vehicle['image_url'] = $photos[0] ?? '';
        
        // Format pour React
        $vehicle['price'] = (float)$vehicle['prix_vente'];
        $vehicle['mileage'] = (int)$vehicle['kilometrage'];
        $vehicle['year'] = (int)$vehicle['annee'];
        $vehicle['fuel_type'] = $vehicle['energie'];
        $vehicle['gearbox'] = $vehicle['typeboite'] === 'A' ? 'Automatique' : 'Manuelle';
        $vehicle['brand'] = $vehicle['marque'];
        $vehicle['model'] = $vehicle['modele'];
        $vehicle['status'] = $vehicle['etat'];
        $vehicle['category'] = $vehicle['carrosserie'];
        
        return $this->success($vehicle);
    }
    
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
        
        return $this->success($brands);
    }
    
    private function search() {
        $query = $_GET['q'] ?? '';
        $limit = min((int)($_GET['limit'] ?? 10), 20);
        
        if (strlen($query) < 3) {
            return $this->error('Recherche trop courte', 400);
        }
        
        // Recherche simple sur marque et modèle
        $sql = "
            SELECT 
                id, marque, modele, prix_vente, annee, kilometrage, carrosserie
            FROM vehicles 
            WHERE etat = 'Disponible' 
              AND (marque LIKE ? OR modele LIKE ? OR description LIKE ?)
            ORDER BY prix_vente ASC
            LIMIT ?
        ";
        
        $searchTerm = "%$query%";
        $stmt = $this->pdo->prepare($sql);
        $stmt->execute([$searchTerm, $searchTerm, $searchTerm, $limit]);
        $results = $stmt->fetchAll();
        
        return $this->success($results);
    }
    
    private function success($data) {
        echo json_encode([
            'success' => true,
            'data' => $data,
            'timestamp' => date('c')
        ], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
        exit;
    }
    
    private function error($message, $code = 400) {
        http_response_code($code);
        echo json_encode([
            'success' => false,
            'error' => $message,
            'timestamp' => date('c')
        ], JSON_UNESCAPED_UNICODE);
        exit;
    }
}

// Point d'entrée
$api = new SimpleVehiclesAPI();
$api->handleRequest();

?>
