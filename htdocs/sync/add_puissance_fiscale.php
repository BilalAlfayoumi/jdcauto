<?php
/**
 * Script pour ajouter la colonne puissance_fiscale à la table vehicles
 */

$host = 'localhost';
$dbname = 'jdcauto';
$username = 'root';
$password = '';

header('Content-Type: text/html; charset=utf-8');
?>
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <title>Ajout colonne puissance_fiscale</title>
    <style>
        body { font-family: monospace; max-width: 800px; margin: 20px auto; padding: 20px; }
        .success { color: #059669; }
        .error { color: #dc2626; }
        .info { color: #0284c7; }
    </style>
</head>
<body>
    <h1>🔧 Ajout colonne puissance_fiscale</h1>
    
    <?php
    try {
        $pdo = new PDO(
            "mysql:host=$host;dbname=$dbname;charset=utf8mb4",
            $username,
            $password,
            [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION]
        );
        
        echo '<p class="info">✅ Connexion à la base de données réussie</p>';
        
        // Vérifier si la colonne existe
        $checkCol = $pdo->query("SHOW COLUMNS FROM vehicles LIKE 'puissance_fiscale'");
        if ($checkCol->rowCount() > 0) {
            echo '<p class="info">ℹ️ La colonne puissance_fiscale existe déjà</p>';
        } else {
            // Ajouter la colonne
            $pdo->exec("ALTER TABLE vehicles ADD COLUMN puissance_fiscale VARCHAR(20) DEFAULT NULL AFTER puissancedyn");
            echo '<p class="success">✅ Colonne puissance_fiscale ajoutée avec succès</p>';
        }
        
        // Vérifier les autres colonnes importantes
        $columns = $pdo->query("SHOW COLUMNS FROM vehicles")->fetchAll(PDO::FETCH_COLUMN);
        $required = ['nbrporte', 'nbrplace', 'puissancedyn', 'date_mec', 'finition', 'version'];
        $missing = array_diff($required, $columns);
        
        if (count($missing) > 0) {
            echo '<p class="error">⚠️ Colonnes manquantes: ' . implode(', ', $missing) . '</p>';
        } else {
            echo '<p class="success">✅ Toutes les colonnes requises sont présentes</p>';
        }
        
    } catch (PDOException $e) {
        echo '<p class="error">❌ Erreur: ' . htmlspecialchars($e->getMessage()) . '</p>';
    }
    ?>
    
    <p><a href="/">🏠 Retour au site</a></p>
</body>
</html>

