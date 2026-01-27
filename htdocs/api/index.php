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
 * API REST simplifiée pour véhicules et contact
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
        header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
        header('Access-Control-Allow-Headers: Content-Type');
        
        if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
            http_response_code(200);
            exit;
        }
        
        $action = $_GET['action'] ?? ($_POST['action'] ?? 'vehicles');
        
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
                case 'contact':
                    return $this->createContactRequest();
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
        
        // Calculer la quantité disponible pour ce modèle
        $quantitySql = "SELECT COUNT(*) as quantity FROM vehicles WHERE marque = ? AND modele = ?";
        $hasEtat = in_array('etat', array_keys($vehicle));
        if ($hasEtat) {
            $quantitySql .= " AND etat = ?";
        }
        $quantityStmt = $this->pdo->prepare($quantitySql);
        if ($hasEtat && isset($vehicle['etat'])) {
            $quantityStmt->execute([$vehicle['marque'], $vehicle['modele'], $vehicle['etat']]);
        } else {
            $quantityStmt->execute([$vehicle['marque'], $vehicle['modele']]);
        }
        $quantityResult = $quantityStmt->fetch();
        $vehicle['quantity'] = isset($quantityResult['quantity']) ? (int)$quantityResult['quantity'] : 1;
        
        // Calculer la quantité disponible pour ce modèle
        $quantitySql = "SELECT COUNT(*) as quantity FROM vehicles WHERE marque = ? AND modele = ?";
        $hasEtat = in_array('etat', array_keys($vehicle));
        if ($hasEtat && isset($vehicle['etat'])) {
            $quantitySql .= " AND etat = ?";
        }
        $quantityStmt = $this->pdo->prepare($quantitySql);
        if ($hasEtat && isset($vehicle['etat'])) {
            $quantityStmt->execute([$vehicle['marque'], $vehicle['modele'], $vehicle['etat']]);
        } else {
            $quantityStmt->execute([$vehicle['marque'], $vehicle['modele']]);
        }
        $quantityResult = $quantityStmt->fetch();
        $vehicle['quantity'] = isset($quantityResult['quantity']) ? (int)$quantityResult['quantity'] : 1;
        
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
    
    /**
     * Créer une demande de contact
     */
    private function createContactRequest() {
        if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
            return $this->error('Méthode non autorisée. Utilisez POST.', 405);
        }
        
        // Lire les données JSON du body
        $json = file_get_contents('php://input');
        $data = json_decode($json, true);
        
        if (!$data) {
            // Essayer avec $_POST si JSON échoue
            $data = $_POST;
        }
        
        // Validation des champs requis
        $required = ['first_name', 'last_name', 'email', 'phone', 'message', 'type'];
        foreach ($required as $field) {
            if (empty($data[$field])) {
                return $this->error("Le champ '$field' est requis", 400);
            }
        }
        
        // Validation email
        if (!filter_var($data['email'], FILTER_VALIDATE_EMAIL)) {
            return $this->error('Email invalide', 400);
        }
        
        try {
            // Vérifier si la table existe, sinon la créer
            $this->ensureContactTableExists();
            
            // Insérer la demande de contact
            $sql = "INSERT INTO contact_requests 
                    (first_name, last_name, email, phone, message, type, subject, created_at) 
                    VALUES (?, ?, ?, ?, ?, ?, ?, NOW())";
            
            $stmt = $this->pdo->prepare($sql);
            $stmt->execute([
                $data['first_name'],
                $data['last_name'],
                $data['email'],
                $data['phone'],
                $data['message'],
                $data['type'],
                $data['subject'] ?? 'Demande de contact'
            ]);
            
            $contactId = $this->pdo->lastInsertId();
            
            // Optionnel: Envoyer un email (si configuré)
            $this->sendContactEmail($data);
            
            return $this->success([
                'id' => $contactId,
                'message' => 'Votre message a été envoyé avec succès'
            ]);
            
        } catch (PDOException $e) {
            error_log("Erreur création contact: " . $e->getMessage());
            return $this->error('Erreur lors de l\'enregistrement du message', 500);
        }
    }
    
    /**
     * Récupérer tous les messages de contact (pour API)
     */
    private function getContacts() {
        try {
            $this->ensureContactTableExists();
            
            $limit = isset($_GET['limit']) ? (int)$_GET['limit'] : 100;
            $status = $_GET['status'] ?? null;
            
            $sql = "SELECT * FROM contact_requests";
            $params = [];
            
            if ($status) {
                $sql .= " WHERE status = ?";
                $params[] = $status;
            }
            
            $sql .= " ORDER BY created_at DESC LIMIT ?";
            $params[] = $limit;
            
            $stmt = $this->pdo->prepare($sql);
            $stmt->execute($params);
            $contacts = $stmt->fetchAll();
            
            return $this->success($contacts);
            
        } catch (PDOException $e) {
            error_log("Erreur récupération contacts: " . $e->getMessage());
            return $this->error('Erreur lors de la récupération des messages', 500);
        }
    }
    
    /**
     * S'assurer que la table contact_requests existe
     */
    private function ensureContactTableExists() {
        $sql = "CREATE TABLE IF NOT EXISTS contact_requests (
            id INT AUTO_INCREMENT PRIMARY KEY,
            first_name VARCHAR(100) NOT NULL,
            last_name VARCHAR(100) NOT NULL,
            email VARCHAR(255) NOT NULL,
            phone VARCHAR(20) NOT NULL,
            message TEXT NOT NULL,
            type VARCHAR(50) NOT NULL,
            subject VARCHAR(255),
            status VARCHAR(20) DEFAULT 'new',
            created_at DATETIME NOT NULL,
            updated_at DATETIME DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
            INDEX idx_email (email),
            INDEX idx_type (type),
            INDEX idx_status (status),
            INDEX idx_created_at (created_at)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci";
        
        $this->pdo->exec($sql);
    }
    
    /**
     * Envoyer un email de notification via SMTP Gandi
     * 
     * CONFIGURATION REQUISE:
     * 1. Créer une boîte mail dans votre panel Gandi (ex: contact@jdcauto.fr)
     * 2. Récupérer le mot de passe de cette boîte mail
     * 3. Modifier les constantes ci-dessous avec vos identifiants
     */
    private function sendContactEmail($data) {
        // ⚙️ CONFIGURATION - À MODIFIER AVEC VOS IDENTIFIANTS GANDI
        // Créez une boîte mail dans votre panel Gandi (ex: contact@jdcauto.fr)
        $smtp_host = 'mail.gandi.net'; // Serveur SMTP Gandi
        $smtp_port = 587; // Port SMTP (587 pour TLS, 465 pour SSL)
        $smtp_username = 'contact@jdcauto.fr'; // ⚠️ REMPLACER par votre boîte mail Gandi
        $smtp_password = 'VOTRE_MOT_DE_PASSE'; // ⚠️ REMPLACER par le mot de passe de la boîte mail
        
        // Email de destination - TEST avec belallfym@gmail.com, puis remettre jdcauto33@orange.fr
        $to = 'belallfym@gmail.com'; // TODO: Remettre 'jdcauto33@orange.fr' après tests
        $subject = 'Nouvelle demande de contact - ' . ($data['subject'] ?? 'Site JDC Auto');
        
        $message = "Nouvelle demande de contact reçue:\n\n";
        $message .= "Type: " . ($data['type'] === 'achat' ? 'Achat de véhicule' : 'Carte grise') . "\n";
        $message .= "Nom: " . $data['first_name'] . " " . $data['last_name'] . "\n";
        $message .= "Email: " . $data['email'] . "\n";
        $message .= "Téléphone: " . $data['phone'] . "\n\n";
        $message .= "Message:\n" . $data['message'] . "\n";
        
        // Essayer d'abord avec mail() native (peut fonctionner si configuré)
        $headers = "From: " . $smtp_username . "\r\n";
        $headers .= "Reply-To: " . $data['email'] . "\r\n";
        $headers .= "Content-Type: text/plain; charset=UTF-8\r\n";
        
        error_log("📧 Tentative envoi email à: $to");
        error_log("📧 Sujet: $subject");
        
        $result = @mail($to, $subject, $message, $headers);
        
        if ($result) {
            error_log("✅ Email envoyé avec succès via mail() à: $to");
            return true;
        }
        
        // Si mail() échoue, essayer avec SMTP manuel
        error_log("⚠️ mail() a échoué, tentative SMTP manuel...");
        return $this->sendEmailViaSMTP($smtp_host, $smtp_port, $smtp_username, $smtp_password, $to, $subject, $message, $data['email']);
    }
    
    /**
     * Envoyer un email via SMTP manuel (si mail() ne fonctionne pas)
     */
    private function sendEmailViaSMTP($host, $port, $username, $password, $to, $subject, $message, $replyTo) {
        // Vérifier si les identifiants sont configurés
        if ($password === 'VOTRE_MOT_DE_PASSE' || empty($username) || empty($password)) {
            error_log("❌ SMTP non configuré - Veuillez configurer les identifiants dans sendContactEmail()");
            return false;
        }
        
        try {
            // Connexion SMTP
            $socket = @fsockopen($host, $port, $errno, $errstr, 10);
            if (!$socket) {
                error_log("❌ Impossible de se connecter au serveur SMTP $host:$port - $errstr ($errno)");
                return false;
            }
            
            // Lire la réponse initiale
            $response = fgets($socket, 515);
            if (substr($response, 0, 3) !== '220') {
                error_log("❌ Réponse SMTP inattendue: $response");
                fclose($socket);
                return false;
            }
            
            // EHLO
            fputs($socket, "EHLO " . $host . "\r\n");
            $response = fgets($socket, 515);
            
            // STARTTLS si port 587
            if ($port == 587) {
                fputs($socket, "STARTTLS\r\n");
                $response = fgets($socket, 515);
                if (substr($response, 0, 3) === '220') {
                    stream_socket_enable_crypto($socket, true, STREAM_CRYPTO_METHOD_TLS_CLIENT);
                    fputs($socket, "EHLO " . $host . "\r\n");
                    $response = fgets($socket, 515);
                }
            }
            
            // Authentification
            fputs($socket, "AUTH LOGIN\r\n");
            $response = fgets($socket, 515);
            
            fputs($socket, base64_encode($username) . "\r\n");
            $response = fgets($socket, 515);
            
            fputs($socket, base64_encode($password) . "\r\n");
            $response = fgets($socket, 515);
            
            if (substr($response, 0, 3) !== '235') {
                error_log("❌ Échec authentification SMTP: $response");
                fclose($socket);
                return false;
            }
            
            // Envoi de l'email
            fputs($socket, "MAIL FROM: <" . $username . ">\r\n");
            $response = fgets($socket, 515);
            
            fputs($socket, "RCPT TO: <" . $to . ">\r\n");
            $response = fgets($socket, 515);
            
            fputs($socket, "DATA\r\n");
            $response = fgets($socket, 515);
            
            $emailData = "From: " . $username . "\r\n";
            $emailData .= "To: " . $to . "\r\n";
            $emailData .= "Reply-To: " . $replyTo . "\r\n";
            $emailData .= "Subject: " . $subject . "\r\n";
            $emailData .= "Content-Type: text/plain; charset=UTF-8\r\n";
            $emailData .= "\r\n";
            $emailData .= $message . "\r\n";
            $emailData .= ".\r\n";
            
            fputs($socket, $emailData);
            $response = fgets($socket, 515);
            
            if (substr($response, 0, 3) === '250') {
                error_log("✅ Email envoyé avec succès via SMTP à: $to");
                fputs($socket, "QUIT\r\n");
                fclose($socket);
                return true;
            } else {
                error_log("❌ Échec envoi email SMTP: $response");
                fclose($socket);
                return false;
            }
            
        } catch (Exception $e) {
            error_log("❌ Erreur SMTP: " . $e->getMessage());
            return false;
        }
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
