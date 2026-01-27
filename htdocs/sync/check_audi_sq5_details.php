<?php
/**
 * Vérification détaillée des AUDI SQ5
 * Compare tous les champs pour détecter les vrais doublons
 */

ini_set('display_errors', 1);
error_reporting(E_ALL);

echo "<!DOCTYPE html>\n<html><head><title>Détails AUDI SQ5</title>";
echo "<style>body{font-family:monospace;max-width:1600px;margin:20px auto;} .success{color:#059669;} .error{color:#dc2626;} .info{color:#0284c7;} .warning{color:#d97706;} table{border-collapse:collapse;width:100%;margin:20px 0;font-size:12px;} th,td{border:1px solid #ccc;padding:6px;text-align:left;} th{background:#f5f5f5;position:sticky;top:0;} .duplicate{background:#fee2e2;}</style></head><body>";
echo "<h1>🔍 Analyse détaillée AUDI SQ5</h1>\n";

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

// Récupérer tous les AUDI SQ5 avec tous les détails disponibles
$stmt = $pdo->query("
    SELECT id, reference, reference_externe, marque, modele, version, 
           prix_vente, kilometrage, annee, energie, typeboite, 
           couleurexterieur, carrosserie, nbrplace, nbrporte,
           etat, description, finition, date_mec
    FROM vehicles 
    WHERE marque = 'AUDI' AND modele = 'SQ5'
    ORDER BY reference
");
$vehicles = $stmt->fetchAll(PDO::FETCH_ASSOC);

echo "<h2>📊 Détails complets des 9 AUDI SQ5</h2>\n";
echo "<p class='info'>Comparaison de tous les champs pour détecter les vrais doublons</p>\n";

if (count($vehicles) > 0) {
    echo "<div style='overflow-x:auto;'>";
    echo "<table>\n";
    echo "<tr><th>ID</th><th>Réf</th><th>Réf Ext</th><th>Version</th><th>Prix</th><th>Km</th><th>Année</th><th>Énergie</th><th>Boîte</th><th>Couleur</th><th>Carrosserie</th><th>Places</th><th>Portes</th><th>État</th><th>Date MEC</th></tr>\n";
    
    // Comparer avec le premier pour détecter les doublons
    $firstVehicle = $vehicles[0];
    $duplicateGroups = [];
    
    foreach ($vehicles as $index => $vehicle) {
        $isDuplicate = false;
        $duplicateClass = '';
        
        // Vérifier si identique au premier (sauf référence)
        if ($index > 0) {
            $samePrice = $vehicle['prix_vente'] == $firstVehicle['prix_vente'];
            $sameKm = $vehicle['kilometrage'] == $firstVehicle['kilometrage'];
            $sameYear = $vehicle['annee'] == $firstVehicle['annee'];
            $sameVersion = $vehicle['version'] == $firstVehicle['version'];
            // Si toutes les caractéristiques principales sont identiques, probable doublon
            if ($samePrice && $sameKm && $sameYear && $sameVersion) {
                $isDuplicate = true;
                $duplicateClass = 'duplicate';
            }
        }
        
        echo "<tr class='$duplicateClass'>";
        echo "<td>{$vehicle['id']}</td>";
        echo "<td><strong>{$vehicle['reference']}</strong></td>";
        echo "<td>" . htmlspecialchars($vehicle['reference_externe'] ?? '') . "</td>";
        echo "<td>" . htmlspecialchars(substr($vehicle['version'] ?? '', 0, 40)) . "...</td>";
        echo "<td>" . number_format($vehicle['prix_vente'], 0, ',', ' ') . " €</td>";
        echo "<td>" . number_format($vehicle['kilometrage'], 0, ',', ' ') . " km</td>";
        echo "<td>{$vehicle['annee']}</td>";
        echo "<td>{$vehicle['energie']}</td>";
        echo "<td>{$vehicle['typeboite']}</td>";
        echo "<td>{$vehicle['couleurexterieur']}</td>";
        echo "<td>{$vehicle['carrosserie']}</td>";
        echo "<td>{$vehicle['nbrplace']}</td>";
        echo "<td>{$vehicle['nbrporte']}</td>";
        echo "<td>{$vehicle['etat']}</td>";
        echo "<td>{$vehicle['date_mec']}</td>";
        echo "</tr>\n";
    }
    echo "</table>\n";
    echo "</div>\n";
    
    // Analyse des doublons
    echo "<h2>🔍 Analyse des doublons</h2>\n";
    
    // Grouper par caractéristiques identiques
    $groups = [];
    foreach ($vehicles as $vehicle) {
        $key = md5(
            $vehicle['prix_vente'] . '|' . 
            $vehicle['kilometrage'] . '|' . 
            $vehicle['annee'] . '|' . 
            ($vehicle['version'] ?? '') . '|' .
            ($vehicle['couleurexterieur'] ?? '') . '|' .
            ($vehicle['date_mec'] ?? '')
        );
        
        if (!isset($groups[$key])) {
            $groups[$key] = [];
        }
        $groups[$key][] = $vehicle;
    }
    
    $duplicateCount = 0;
    foreach ($groups as $key => $group) {
        if (count($group) > 1) {
            $duplicateCount += count($group) - 1; // -1 car on garde un exemplaire
            echo "<p class='warning'>⚠️ Groupe de " . count($group) . " véhicules identiques :</p>\n";
            echo "<ul>\n";
            foreach ($group as $v) {
                echo "<li>Référence: <strong>{$v['reference']}</strong> (ID: {$v['id']})";
                if (!empty($v['reference_externe'])) {
                    echo " - Réf externe: {$v['reference_externe']}";
                }
                if (!empty($v['date_mec'])) {
                    echo " - Date MEC: {$v['date_mec']}";
                }
                echo "</li>\n";
            }
            echo "</ul>\n";
        }
    }
    
    if ($duplicateCount > 0) {
        echo "<p class='error'>❌ Total doublons détectés: <strong>$duplicateCount</strong> véhicules à supprimer</p>\n";
        echo "<p class='info'>💡 Solution: Créer un script pour supprimer les doublons en gardant le premier de chaque groupe.</p>\n";
    } else {
        echo "<p class='success'>✅ Aucun doublon détecté - tous les véhicules sont différents</p>\n";
    }
}

echo "<p><a href='check_duplicates.php'>🔙 Retour vérification doublons</a> | <a href='/'>🏠 Retour au site</a></p>\n";
echo "</body></html>";

?>

