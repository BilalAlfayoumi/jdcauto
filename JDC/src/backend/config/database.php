<?php
/**
 * Configuration base de données MySQL - Gandi
 * JDC Auto - Intégration Spider-VO
 */

class DatabaseConfig {
    
    // Configuration Gandi MySQL (à adapter avec vos vraies infos)
    private static $host = 'localhost'; // ou l'adresse fournie par Gandi
    private static $dbname = 'jdcauto_prod'; // nom de votre base
    private static $username = 'root'; // utilisateur Gandi
    private static $password = ''; // mot de passe Gandi
    
    private static $connection = null;
    
    /**
     * Obtenir la connexion PDO à la base de données
     */
    public static function getConnection() {
        if (self::$connection === null) {
            try {
                $dsn = "mysql:host=" . self::$host . ";dbname=" . self::$dbname . ";charset=utf8mb4";
                
                self::$connection = new PDO($dsn, self::$username, self::$password, [
                    PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                    PDO::ATTR_EMULATE_PREPARES => false,
                    PDO::MYSQL_ATTR_INIT_COMMAND => "SET NAMES utf8mb4"
                ]);
                
            } catch (PDOException $e) {
                error_log("Erreur connexion base de données: " . $e->getMessage());
                throw new Exception("Impossible de se connecter à la base de données: " . $e->getMessage());
            }
        }
        
        return self::$connection;
    }
    
    /**
     * Test de connexion
     */
    public static function testConnection() {
        try {
            $pdo = self::getConnection();
            $stmt = $pdo->query("SELECT 1");
            return true;
        } catch (Exception $e) {
            return false;
        }
    }
}

/**
 * Configuration Spider-VO
 */
class SpiderVOConfig {
    
    // URL du flux XML Spider-VO (remplacer par votre vraie URL)
    const XML_FEED_URL = 'https://www.spider-vo.com/export.xml'; // À adapter
    
    // Authentification si nécessaire
    const XML_USERNAME = ''; // Si requis
    const XML_PASSWORD = ''; // Si requis
    
    // Options de synchronisation
    const SYNC_TIMEOUT = 300; // 5 minutes timeout
    const SYNC_RETRIES = 3;
    
    // Configuration photos
    const PHOTOS_MAX_PER_VEHICLE = 50;
    
    // Logs
    const LOG_FILE = __DIR__ . '/../logs/sync.log';
    
    /**
     * Logger pour synchronisation
     */
    public static function log($message, $level = 'INFO') {
        $timestamp = date('Y-m-d H:i:s');
        $logMessage = "[$timestamp] [$level] $message" . PHP_EOL;
        
        // Créer le dossier de logs s'il n'existe pas
        $logDir = dirname(self::LOG_FILE);
        if (!is_dir($logDir)) {
            mkdir($logDir, 0755, true);
        }
        
        file_put_contents(self::LOG_FILE, $logMessage, FILE_APPEND | LOCK_EX);
        
        // Afficher aussi dans la sortie si en mode CLI
        if (php_sapi_name() === 'cli') {
            echo $logMessage;
        }
    }
}
?>
