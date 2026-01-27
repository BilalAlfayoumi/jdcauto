<?php
/**
 * Point d'entrée API JDC Auto
 * Déployé sur Gandi dans htdocs/api/
 */

// Configuration de base
error_reporting(E_ALL);
ini_set('display_errors', 0); // Désactiver en production
ini_set('log_errors', 1);

// Auto-loader simple pour les classes (optionnel)
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

// Note: Configuration base de données intégrée ci-dessous (pas besoin d'inclure)

/**
 * Configuration base de données pour Gandi
 * ✅ CONFIGURÉ avec les paramètres Gandi
 */
class GandiDatabaseConfig {
    private static $host = 'localhost'; // Gandi utilise localhost
    private static $dbname = 'jdcauto'; // Base de données principale
    private static $username = 'root'; // Utilisateur Gandi par défaut
    private static $password = ''; // Mot de passe vide par défaut Gandi
    
    private static $connection = null;
    
    public static function getConnection() {
        if (self::$connection === null) {
            try {
                // Essayer d'abord avec la base, sinon sans base pour créer
                $dsn = "mysql:host=" . self::$host . ";dbname=" . self::$dbname . ";charset=utf8mb4";
                
                self::$connection = new PDO($dsn, self::$username, self::$password, [
                    PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                    PDO::ATTR_EMULATE_PREPARES => false,
                    PDO::ATTR_TIMEOUT => 5
                ]);
                
            } catch (PDOException $e) {
                // Si la base n'existe pas, essayer sans base
                if (strpos($e->getMessage(), 'Unknown database') !== false) {
                    try {
                        $dsn = "mysql:host=" . self::$host . ";charset=utf8mb4";
                        $tempPdo = new PDO($dsn, self::$username, self::$password, [
                            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                            PDO::ATTR_TIMEOUT => 5
                        ]);
                        
                        // Créer la base
                        $tempPdo->exec("CREATE DATABASE IF NOT EXISTS `" . self::$dbname . "` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci");
                        
                        // Réessayer avec la base
                        $dsn = "mysql:host=" . self::$host . ";dbname=" . self::$dbname . ";charset=utf8mb4";
                        self::$connection = new PDO($dsn, self::$username, self::$password, [
                            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                            PDO::ATTR_EMULATE_PREPARES => false
                        ]);
                        
                    } catch (PDOException $e2) {
                        error_log("Erreur BDD Gandi (création): " . $e2->getMessage());
                        throw $e2;
                    }
                } else {
                    error_log("Erreur BDD Gandi: " . $e->getMessage());
                    throw $e;
                }
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
        try {
            $this->pdo = GandiDatabaseConfig::getConnection();
        } catch (Exception $e) {
            // Si pas de connexion, on continue quand même pour retourner une erreur propre
            $this->pdo = null;
        }
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
        } catch (PDOException $e) {
            error_log("Erreur PDO API: " . $e->getMessage() . " | Code: " . $e->getCode());
            // En mode debug, retourner l'erreur détaillée
            $debug = $_GET['debug'] ?? false;
            $message = $debug ? $e->getMessage() : 'Erreur base de données';
            return $this->error($message, 500);
        } catch (Exception $e) {
            error_log("Erreur API: " . $e->getMessage() . " | Trace: " . $e->getTraceAsString());
            $debug = $_GET['debug'] ?? false;
            $message = $debug ? $e->getMessage() : 'Erreur serveur';
            return $this->error($message, 500);
        }
    }
    
    private function getVehicles() {
        if ($this->pdo === null) {
            return $this->error('Base de données non configurée. Veuillez exécuter install/setup.php', 503);
        }
        
        $limit = min((int)($_GET['limit'] ?? 12), 50);
        $status = $_GET['status'] ?? 'Disponible';
        
        // Vérifier si la table existe
        try {
            $checkTable = $this->pdo->query("SHOW TABLES LIKE 'vehicles'");
            if ($checkTable->rowCount() === 0) {
                return $this->error('Base de données non initialisée. Veuillez exécuter install/setup.php', 503);
            }
        } catch (PDOException $e) {
            return $this->error('Erreur base de données: ' . $e->getMessage(), 500);
        }
        
        // Requête simple pour commencer - avec gestion colonnes manquantes
        try {
            // Vérifier les colonnes disponibles
            $columnsStmt = $this->pdo->query("SHOW COLUMNS FROM vehicles");
            $availableColumns = $columnsStmt->fetchAll(PDO::FETCH_COLUMN);
            
            // Construire la requête avec seulement les colonnes existantes
            $selectFields = [];
            $wantedFields = [
                'id', 'reference', 'marque', 'modele', 'version', 
                'prix_vente', 'kilometrage', 'annee', 'energie', 
                'typeboite', 'carrosserie', 'etat', 'couleurexterieur', 
                'description', 'finition', 'date_modif', 'date_creation'
            ];
            
            foreach ($wantedFields as $field) {
                if (in_array($field, $availableColumns)) {
                    $selectFields[] = $field;
                }
            }
            
            if (empty($selectFields)) {
                return $this->error('Aucune colonne valide trouvée dans la table vehicles', 500);
            }
            
            // Vérifier si la colonne etat existe
            $hasEtat = in_array('etat', $availableColumns);
            $hasDateModif = in_array('date_modif', $availableColumns);
            
            // D'abord, obtenir les groupes (marque + modèle) avec leur quantité
            $groupSql = "SELECT marque, modele, COUNT(*) as quantity
                        FROM vehicles";
            
            if ($hasEtat) {
                $groupSql .= " WHERE etat = ?";
            }
            
            $groupSql .= " GROUP BY marque, modele";
            
            if ($hasDateModif) {
                $groupSql .= " ORDER BY MAX(date_modif) DESC";
            } else if (in_array('id', $availableColumns)) {
                $groupSql .= " ORDER BY MAX(id) DESC";
            }
            
            $groupSql .= " LIMIT ?";
            
            $groupStmt = $this->pdo->prepare($groupSql);
            if ($hasEtat) {
                $groupStmt->execute([$status, $limit]);
            } else {
                $groupStmt->execute([$limit]);
            }
            $groups = $groupStmt->fetchAll();
            
            // Pour chaque groupe, récupérer le véhicule représentatif
            $vehicles = [];
            foreach ($groups as $group) {
                $representativeSql = "SELECT " . implode(', ', $selectFields) . " 
                                      FROM vehicles 
                                      WHERE marque = ? AND modele = ?";
                if ($hasEtat) {
                    $representativeSql .= " AND etat = ?";
                }
                if ($hasDateModif) {
                    $representativeSql .= " ORDER BY date_modif DESC";
                } else if (in_array('id', $availableColumns)) {
                    $representativeSql .= " ORDER BY id DESC";
                }
                $representativeSql .= " LIMIT 1";
                
                $repStmt = $this->pdo->prepare($representativeSql);
                if ($hasEtat) {
                    $repStmt->execute([$group['marque'], $group['modele'], $status]);
                } else {
                    $repStmt->execute([$group['marque'], $group['modele']]);
                }
                $representative = $repStmt->fetch();
                
                if ($representative) {
                    $representative['quantity'] = (int)$group['quantity'];
                    $vehicles[] = $representative;
                }
            }
            
        } catch (PDOException $e) {
            error_log("Erreur requête getVehicles: " . $e->getMessage());
            throw $e;
        }
        
        // Récupérer une photo pour chaque véhicule (si table existe)
        foreach ($vehicles as &$vehicle) {
            try {
                // Vérifier si la table vehicle_photos existe
                $checkPhotos = $this->pdo->query("SHOW TABLES LIKE 'vehicle_photos'");
                if ($checkPhotos->rowCount() > 0 && isset($vehicle['id'])) {
                    $photoStmt = $this->pdo->prepare("
                        SELECT photo_url 
                        FROM vehicle_photos 
                        WHERE vehicle_id = ? 
                        ORDER BY photo_order 
                        LIMIT 1
                    ");
                    $photoStmt->execute([$vehicle['id']]);
                    $photo = $photoStmt->fetch();
                    $vehicle['image_url'] = $photo['photo_url'] ?? '';
                } else {
                    $vehicle['image_url'] = '';
                }
            } catch (PDOException $e) {
                // Si erreur photos, continuer sans photo
                $vehicle['image_url'] = '';
            }
            
            // Format pour compatibilité React (avec valeurs par défaut)
            $vehicle['price'] = isset($vehicle['prix_vente']) ? (float)$vehicle['prix_vente'] : 0;
            $vehicle['mileage'] = isset($vehicle['kilometrage']) ? (int)$vehicle['kilometrage'] : 0;
            $vehicle['year'] = isset($vehicle['annee']) ? (int)$vehicle['annee'] : 0;
            $vehicle['fuel_type'] = $vehicle['energie'] ?? '';
            $vehicle['gearbox'] = (isset($vehicle['typeboite']) && $vehicle['typeboite'] === 'A') ? 'Automatique' : 'Manuelle';
            $vehicle['brand'] = $vehicle['marque'] ?? '';
            $vehicle['model'] = $vehicle['modele'] ?? '';
            $vehicle['status'] = $vehicle['etat'] ?? 'Disponible';
            $vehicle['category'] = $vehicle['carrosserie'] ?? '';
            $vehicle['quantity'] = isset($vehicle['quantity']) ? (int)$vehicle['quantity'] : 1;
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
