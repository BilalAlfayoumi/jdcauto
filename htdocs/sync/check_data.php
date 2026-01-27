<?php
/**
 * Script de vérification des données importées
 * Vérifie photos et descriptions
 */

ini_set('display_errors', 1);
error_reporting(E_ALL);

echo "<!DOCTYPE html>\n<html><head><title>Vérification Données</title>";
echo "<style>body{font-family:monospace;max-width:1200px;margin:20px auto;} .success{color:#059669;} .error{color:#dc2626;} .info{color:#0284c7;} table{border-collapse:collapse;width:100%;} th,td{border:1px solid #ccc;padding:8px;}</style></head><body>";
echo "<h1>🔍 Vérification Données Importées</h1>\n";

// Configuration MySQL
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
} catch (PDOException $e) {
    echo "<p class='error'>❌ Erreur connexion: " . htmlspecialchars($e->getMessage()) . "</p></body></html>";
    exit;
}

// Compter véhicules
$stmt = $pdo->query("SELECT COUNT(*) as total FROM vehicles");
$total = $stmt->fetch()['total'];

echo "<p class='info'>📊 Total véhicules: $total</p>\n";

// Vérifier photos
$stmt = $pdo->query("SELECT COUNT(*) as total FROM vehicle_photos");
$totalPhotos = $stmt->fetch()['total'];

echo "<p class='" . ($totalPhotos > 0 ? 'success' : 'error') . "'>📸 Total photos: $totalPhotos</p>\n";

// Vérifier descriptions
$stmt = $pdo->query("
    SELECT COUNT(*) as total, 
           COUNT(DISTINCT description) as unique_desc
    FROM vehicles 
    WHERE description IS NOT NULL AND description != ''
");
$descStats = $stmt->fetch();

echo "<p class='info'>📝 Descriptions: {$descStats['total']} total, {$descStats['unique_desc']} uniques</p>\n";

// Afficher 10 premiers véhicules avec leurs données
echo "<h2>📋 Échantillon véhicules (10 premiers)</h2>\n";
echo "<table>\n";
echo "<tr><th>ID</th><th>Réf</th><th>Marque</th><th>Modèle</th><th>Description (100 chars)</th><th>Photos</th></tr>\n";

$stmt = $pdo->query("
    SELECT v.id, v.reference, v.marque, v.modele, v.description,
           COUNT(vp.id) as photo_count
    FROM vehicles v
    LEFT JOIN vehicle_photos vp ON v.id = vp.vehicle_id
    GROUP BY v.id
    ORDER BY v.id DESC
    LIMIT 10
");

foreach ($stmt->fetchAll() as $row) {
    $desc = substr($row['description'] ?? '', 0, 100);
    $photoCount = (int)$row['photo_count'];
    $photoStatus = $photoCount > 0 ? "<span class='success'>✅ $photoCount</span>" : "<span class='error'>❌ 0</span>";
    
    echo "<tr>";
    echo "<td>{$row['id']}</td>";
    echo "<td>{$row['reference']}</td>";
    echo "<td>{$row['marque']}</td>";
    echo "<td>{$row['modele']}</td>";
    echo "<td>" . htmlspecialchars($desc) . "...</td>";
    echo "<td>$photoStatus</td>";
    echo "</tr>\n";
}

echo "</table>\n";

// Vérifier si descriptions sont identiques
$stmt = $pdo->query("
    SELECT description, COUNT(*) as count
    FROM vehicles
    WHERE description IS NOT NULL AND description != ''
    GROUP BY description
    HAVING count > 1
    ORDER BY count DESC
    LIMIT 5
");

$duplicates = $stmt->fetchAll();
if (count($duplicates) > 0) {
    echo "<h2 class='error'>⚠️ Descriptions dupliquées</h2>\n";
    echo "<table>\n";
    echo "<tr><th>Description</th><th>Nombre</th></tr>\n";
    foreach ($duplicates as $dup) {
        echo "<tr><td>" . htmlspecialchars(substr($dup['description'], 0, 150)) . "...</td><td>{$dup['count']}</td></tr>\n";
    }
    echo "</table>\n";
}

// Vérifier structure XML
echo "<h2>🔍 Vérification structure XML</h2>\n";
$xmlFile = __DIR__ . '/../../export.xml';
if (file_exists($xmlFile)) {
    $xml = simplexml_load_file($xmlFile);
    if ($xml) {
        $firstVehicle = $xml->vehicule[0];
        echo "<p class='info'>Premier véhicule XML:</p>\n";
        echo "<ul>\n";
        echo "<li>Référence: " . htmlspecialchars((string)$firstVehicle->reference) . "</li>\n";
        echo "<li>Description: " . htmlspecialchars(substr((string)$firstVehicle->description, 0, 100)) . "...</li>\n";
        
        if (isset($firstVehicle->photos->photo)) {
            $photoCount = count($firstVehicle->photos->photo);
            echo "<li>Photos XML: $photoCount</li>\n";
            if ($photoCount > 0) {
                echo "<li>Première photo: " . htmlspecialchars(substr((string)$firstVehicle->photos->photo[0], 0, 80)) . "...</li>\n";
            }
        } else {
            echo "<li class='error'>❌ Pas de photos dans XML</li>\n";
        }
        echo "</ul>\n";
    }
}

echo "<p><a href='import_spider_vo.php'>🔄 Réimporter les données</a> | <a href='/'>🏠 Retour au site</a></p>\n";
echo "</body></html>";

?>

