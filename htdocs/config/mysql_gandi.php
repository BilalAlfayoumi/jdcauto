<?php
/**
 * Configuration MySQL spécifique Gandi
 * Optimisée pour l'hébergement web Gandi
 */

class GandiMySQL {
    
    // Configuration selon documentation Gandi
    private static $config = [
        'host' => 'localhost',
        'dbname' => 'jdcauto', 
        'username' => 'root',
        'password' => '',
        'charset' => 'utf8mb4',
        'options' => [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES => false,
            PDO::ATTR_PERSISTENT => false,
            PDO::MYSQL_ATTR_INIT_COMMAND => "SET NAMES utf8mb4, sql_mode = 'STRICT_TRANS_TABLES'"
        ]
    ];
    
    private static $connection = null;
    
    /**
     * Connexion sécurisée avec retry
     */
    public static function connect() {
        if (self::$connection !== null) {
            return self::$connection;
        }
        
        $maxRetries = 3;
        $retryDelay = 1; // seconde
        
        for ($i = 0; $i < $maxRetries; $i++) {
            try {
                $dsn = sprintf(
                    "mysql:host=%s;dbname=%s;charset=%s",
                    self::$config['host'],
                    self::$config['dbname'], 
                    self::$config['charset']
                );
                
                self::$connection = new PDO(
                    $dsn,
                    self::$config['username'],
                    self::$config['password'],
                    self::$config['options']
                );
                
                // Test de la connexion
                self::$connection->query("SELECT 1");
                
                return self::$connection;
                
            } catch (PDOException $e) {
                if ($i === $maxRetries - 1) {
                    // Dernière tentative échouée
                    error_log("Connexion MySQL échouée après $maxRetries tentatives: " . $e->getMessage());
                    throw new Exception("Base de données temporairement indisponible");
                }
                
                // Attendre avant retry
                sleep($retryDelay);
            }
        }
        
        return null;
    }
    
    /**
     * Test simple de connexion
     */
    public static function test() {
        try {
            $pdo = self::connect();
            return [
                'success' => true,
                'message' => 'Connexion MySQL Gandi réussie',
                'server_info' => $pdo->getAttribute(PDO::ATTR_SERVER_INFO)
            ];
        } catch (Exception $e) {
            return [
                'success' => false,
                'message' => $e->getMessage()
            ];
        }
    }
    
    /**
     * Créer la base si elle n'existe pas
     */
    public static function createDatabaseIfNotExists() {
        try {
            // Connexion sans spécifier de base
            $dsn = sprintf(
                "mysql:host=%s;charset=%s",
                self::$config['host'],
                self::$config['charset']
            );
            
            $pdo = new PDO(
                $dsn,
                self::$config['username'],
                self::$config['password'],
                self::$config['options']
            );
            
            // Créer la base
            $sql = "CREATE DATABASE IF NOT EXISTS `" . self::$config['dbname'] . "` 
                    CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci";
            
            $pdo->exec($sql);
            
            return true;
            
        } catch (Exception $e) {
            error_log("Erreur création base: " . $e->getMessage());
            return false;
        }
    }
}

// Test rapide si appelé directement
if (basename($_SERVER['PHP_SELF']) === basename(__FILE__)) {
    header('Content-Type: application/json');
    echo json_encode(GandiMySQL::test(), JSON_UNESCAPED_UNICODE);
}

?>
