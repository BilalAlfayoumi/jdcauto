<?php
/**
 * Script de vérification des doublons
 * Vérifie les véhicules en double dans le XML et la base
 */

ini_set('display_errors', 1);
error_reporting(E_ALL);

echo "<!DOCTYPE html>\n<html><head><title>Vérification Doublons</title>";
echo "<style>body{font-family:monospace;max-width:1400px;margin:20px auto;} .success{color:#059669;} .error{color:#dc2626;} .info{color:#0284c7;} .warning{color:#d97706;} table{border-collapse:collapse;width:100%;margin:20px 0;} th,td{border:1px solid #ccc;padding:8px;text-align:left;} th{background:#f5f5f5;}</style></head><body>";
echo "<h1>🔍 Vérification Doublons - JDC Auto</h1>\n";

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

// Vérifier AUDI SQ5 dans la base
echo "<h2>📊 AUDI SQ5 dans la base de données</h2>\n";
$stmt = $pdo->query("
    SELECT id, reference, marque, modele, version, prix_vente, kilometrage, annee, energie, etat
    FROM vehicles 
    WHERE marque = 'AUDI' AND modele = 'SQ5'
    ORDER BY reference
");
$audiSq5 = $stmt->fetchAll(PDO::FETCH_ASSOC);

echo "<p class='info'>📈 Total AUDI SQ5 en base: <strong>" . count($audiSq5) . "</strong></p>\n";

if (count($audiSq5) > 0) {
    echo "<table>\n";
    echo "<tr><th>ID</th><th>Référence</th><th>Version</th><th>Prix</th><th>Km</th><th>Année</th><th>Énergie</th><th>État</th></tr>\n";
    foreach ($audiSq5 as $vehicle) {
        $isUnique = true;
        echo "<tr>";
        echo "<td>{$vehicle['id']}</td>";
        echo "<td><strong>{$vehicle['reference']}</strong></td>";
        echo "<td>" . htmlspecialchars(substr($vehicle['version'] ?? '', 0, 50)) . "...</td>";
        echo "<td>" . number_format($vehicle['prix_vente'], 0, ',', ' ') . " €</td>";
        echo "<td>" . number_format($vehicle['kilometrage'], 0, ',', ' ') . " km</td>";
        echo "<td>{$vehicle['annee']}</td>";
        echo "<td>{$vehicle['energie']}</td>";
        echo "<td>{$vehicle['etat']}</td>";
        echo "</tr>\n";
    }
    echo "</table>\n";
}

// Vérifier dans le XML
echo "<h2>📄 AUDI SQ5 dans le XML</h2>\n";
$xmlFile = __DIR__ . '/../../export.xml';
if (file_exists($xmlFile)) {
    $xml = @simplexml_load_file($xmlFile);
    if ($xml) {
        $xmlAudiSq5 = [];
        foreach ($xml->vehicule as $vehiculeXML) {
            $marque = trim((string)$vehiculeXML->marque);
            $modele = trim((string)$vehiculeXML->modele);
            if ($marque === 'AUDI' && $modele === 'SQ5') {
                $xmlAudiSq5[] = [
                    'reference' => trim((string)$vehiculeXML->reference),
                    'version' => trim((string)$vehiculeXML->version),
                    'prix' => trim((string)$vehiculeXML->prix_vente),
                    'km' => trim((string)$vehiculeXML->kilometrage),
                    'annee' => trim((string)$vehiculeXML->annee),
                    'energie' => trim((string)$vehiculeXML->energie),
                ];
            }
        }
        
        echo "<p class='info'>📈 Total AUDI SQ5 dans XML: <strong>" . count($xmlAudiSq5) . "</strong></p>\n";
        
        if (count($xmlAudiSq5) > 0) {
            echo "<table>\n";
            echo "<tr><th>Référence</th><th>Version</th><th>Prix</th><th>Km</th><th>Année</th><th>Énergie</th></tr>\n";
            foreach ($xmlAudiSq5 as $vehicle) {
                echo "<tr>";
                echo "<td><strong>{$vehicle['reference']}</strong></td>";
                echo "<td>" . htmlspecialchars(substr($vehicle['version'], 0, 50)) . "...</td>";
                echo "<td>{$vehicle['prix']} €</td>";
                echo "<td>{$vehicle['km']} km</td>";
                echo "<td>{$vehicle['annee']}</td>";
                echo "<td>{$vehicle['energie']}</td>";
                echo "</tr>\n";
            }
            echo "</table>\n";
        }
    }
}

// Vérifier autres doublons potentiels
echo "<h2>🔍 Autres doublons potentiels (même marque + modèle)</h2>\n";
$stmt = $pdo->query("
    SELECT marque, modele, COUNT(*) as count
    FROM vehicles
    GROUP BY marque, modele
    HAVING count > 1
    ORDER BY count DESC, marque, modele
");
$duplicates = $stmt->fetchAll(PDO::FETCH_ASSOC);

if (count($duplicates) > 0) {
    echo "<table>\n";
    echo "<tr><th>Marque</th><th>Modèle</th><th>Nombre</th></tr>\n";
    foreach ($duplicates as $dup) {
        $class = $dup['count'] > 5 ? 'warning' : 'info';
        echo "<tr class='$class'>";
        echo "<td><strong>{$dup['marque']}</strong></td>";
        echo "<td><strong>{$dup['modele']}</strong></td>";
        echo "<td><strong>{$dup['count']}</strong></td>";
        echo "</tr>\n";
    }
    echo "</table>\n";
    echo "<p class='info'>ℹ️ Ces doublons sont normaux si les véhicules ont des références différentes (versions, années, kilométrages différents).</p>\n";
} else {
    echo "<p class='success'>✅ Aucun doublon trouvé</p>\n";
}

// Vérifier références uniques
echo "<h2>🔑 Vérification références uniques</h2>\n";
$stmt = $pdo->query("
    SELECT reference, COUNT(*) as count
    FROM vehicles
    GROUP BY reference
    HAVING count > 1
");
$duplicateRefs = $stmt->fetchAll(PDO::FETCH_ASSOC);

if (count($duplicateRefs) > 0) {
    echo "<p class='error'>⚠️ ATTENTION: Références en double trouvées (anormal !)</p>\n";
    echo "<table>\n";
    echo "<tr><th>Référence</th><th>Nombre</th></tr>\n";
    foreach ($duplicateRefs as $dup) {
        echo "<tr>";
        echo "<td><strong>{$dup['reference']}</strong></td>";
        echo "<td><strong>{$dup['count']}</strong></td>";
        echo "</tr>\n";
    }
    echo "</table>\n";
} else {
    echo "<p class='success'>✅ Toutes les références sont uniques</p>\n";
}

echo "<p><a href='check_data.php'>📊 Vérifier données</a> | <a href='/'>🏠 Retour au site</a></p>\n";
echo "</body></html>";

?>

