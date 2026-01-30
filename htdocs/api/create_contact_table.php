<?php
/**
 * Script pour créer la table contact_requests
 * À exécuter une fois pour initialiser la table
 */

require_once __DIR__ . '/index.php';

// Utiliser la classe de configuration existante
class GandiDatabaseConfig {
    private static $host = 'localhost';
    private static $dbname = 'jdcauto';
    private static $username = 'root';
    private static $password = '';
    
    public static function getConnection() {
        $dsn = "mysql:host=" . self::$host . ";dbname=" . self::$dbname . ";charset=utf8mb4";
        return new PDO($dsn, self::$username, self::$password, [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC
        ]);
    }
}

try {
    $pdo = GandiDatabaseConfig::getConnection();
    
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
    
    $pdo->exec($sql);
    
    echo "✅ Table contact_requests créée avec succès !\n";
    echo "📊 Structure:\n";
    echo "   - id (INT, PRIMARY KEY)\n";
    echo "   - first_name, last_name, email, phone\n";
    echo "   - message (TEXT)\n";
    echo "   - type (achat/carte_grise)\n";
    echo "   - subject, status\n";
    echo "   - created_at, updated_at\n";
    
} catch (PDOException $e) {
    echo "❌ Erreur: " . $e->getMessage() . "\n";
}


