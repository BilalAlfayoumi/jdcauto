<?php
/**
 * Script pour créer la table vehicle_options si elle n'existe pas
 * À exécuter une seule fois pour ajouter la table des options
 */

header('Content-Type: text/html; charset=utf-8');
?>
<!DOCTYPE html>
<html>
<head>
    <title>🔧 Création table vehicle_options</title>
    <style>
        body { font-family: monospace; max-width: 800px; margin: 20px auto; padding: 20px; }
        .success { color: #059669; font-weight: bold; }
        .error { color: #dc2626; font-weight: bold; }
        .info { color: #0284c7; }
    </style>
</head>
<body>
    <h1>🔧 Création table vehicle_options</h1>
    
<?php
// Configuration
$host = 'localhost';
$dbname = 'jdcauto';
$username = 'root';
$password = '';

try {
    $pdo = new PDO(
        "mysql:host=$host;dbname=$dbname;charset=utf8mb4",
        $username,
        $password,
        [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION]
    );
    echo '<p class="success">✅ Connexion à la base de données réussie</p>';
} catch (PDOException $e) {
    echo '<p class="error">❌ Erreur connexion: ' . htmlspecialchars($e->getMessage()) . '</p></body></html>';
    exit;
}

// Vérifier si la table existe déjà
$checkTable = $pdo->query("SHOW TABLES LIKE 'vehicle_options'");
if ($checkTable->rowCount() > 0) {
    echo '<p class="info">ℹ️ La table vehicle_options existe déjà. Aucune action requise.</p>';
    echo '<p><a href="/">🏠 Retour au site</a></p>';
    echo '</body></html>';
    exit;
}

// Créer la table
try {
    $sql = "
    CREATE TABLE vehicle_options (
        id INT AUTO_INCREMENT PRIMARY KEY,
        vehicle_id INT NOT NULL,
        option_nom TEXT NOT NULL,
        montant DECIMAL(8,2) DEFAULT 0.00,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        
        FOREIGN KEY (vehicle_id) REFERENCES vehicles(id) ON DELETE CASCADE,
        INDEX idx_vehicle (vehicle_id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    ";
    
    $pdo->exec($sql);
    echo '<p class="success">✅ Table vehicle_options créée avec succès!</p>';
    echo '<p class="info">ℹ️ La table est maintenant prête pour stocker les options des véhicules.</p>';
} catch (PDOException $e) {
    echo '<p class="error">❌ Erreur lors de la création de la table: ' . htmlspecialchars($e->getMessage()) . '</p>';
    
    // Si l'erreur est due à la clé étrangère (table vehicles n'existe pas ou structure différente)
    if (strpos($e->getMessage(), 'FOREIGN KEY') !== false) {
        echo '<p class="info">ℹ️ Tentative de création sans clé étrangère...</p>';
        try {
            $sql = "
            CREATE TABLE vehicle_options (
                id INT AUTO_INCREMENT PRIMARY KEY,
                vehicle_id INT NOT NULL,
                option_nom TEXT NOT NULL,
                montant DECIMAL(8,2) DEFAULT 0.00,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                
                INDEX idx_vehicle (vehicle_id)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
            ";
            
            $pdo->exec($sql);
            echo '<p class="success">✅ Table vehicle_options créée sans clé étrangère (structure alternative)</p>';
        } catch (PDOException $e2) {
            echo '<p class="error">❌ Erreur: ' . htmlspecialchars($e2->getMessage()) . '</p>';
        }
    }
}

echo '<p><a href="/">🏠 Retour au site</a></p>';
echo '</body></html>';
?>

