<?php
/**
 * Script pour ajouter la colonne "titre" à la table vehicles si elle n'existe pas
 * À exécuter une seule fois
 */

header('Content-Type: text/html; charset=utf-8');
?>
<!DOCTYPE html>
<html>
<head>
    <title>🔧 Ajout colonne titre</title>
    <style>
        body { font-family: monospace; max-width: 800px; margin: 20px auto; padding: 20px; }
        .success { color: #059669; font-weight: bold; }
        .error { color: #dc2626; font-weight: bold; }
        .info { color: #0284c7; }
    </style>
</head>
<body>
    <h1>🔧 Ajout colonne titre</h1>
    
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

// Vérifier si la colonne existe
$checkColumn = $pdo->query("SHOW COLUMNS FROM vehicles LIKE 'titre'");
if ($checkColumn->rowCount() > 0) {
    echo '<p class="info">ℹ️ La colonne "titre" existe déjà. Aucune action requise.</p>';
    echo '<p><a href="/">🏠 Retour au site</a></p>';
    echo '</body></html>';
    exit;
}

// Ajouter la colonne
try {
    $sql = "ALTER TABLE vehicles ADD COLUMN titre TEXT DEFAULT NULL AFTER version";
    $pdo->exec($sql);
    echo '<p class="success">✅ Colonne "titre" ajoutée avec succès à la table "vehicles".</p>';
    echo '<p class="info">ℹ️ La colonne est maintenant prête pour stocker les titres complets des véhicules.</p>';
} catch (PDOException $e) {
    echo '<p class="error">❌ Erreur lors de l\'ajout de la colonne: ' . htmlspecialchars($e->getMessage()) . '</p>';
}

echo '<p><a href="/">🏠 Retour au site</a></p>';
echo '</body></html>';
?>

