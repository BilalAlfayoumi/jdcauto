<?php
/**
 * Script de suppression des doublons
 * Supprime les véhicules en double en gardant un exemplaire de chaque groupe
 */

ini_set('display_errors', 1);
error_reporting(E_ALL);

echo "<!DOCTYPE html>\n<html><head><title>Suppression Doublons</title>";
echo "<style>body{font-family:monospace;max-width:1200px;margin:20px auto;} .success{color:#059669;} .error{color:#dc2626;} .info{color:#0284c7;} .warning{color:#d97706;} table{border-collapse:collapse;width:100%;margin:20px 0;} th,td{border:1px solid #ccc;padding:8px;text-align:left;} th{background:#f5f5f5;}</style></head><body>";
echo "<h1>🧹 Suppression des Doublons - JDC Auto</h1>\n";

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

// Vérifier si action confirmée
$action = $_GET['action'] ?? 'preview';
$confirmed = $action === 'confirm';

if (!$confirmed) {
    echo "<p class='warning'>⚠️ Mode PREVIEW - Aucune suppression ne sera effectuée</p>\n";
    echo "<p class='info'>Pour confirmer la suppression, ajoutez <code>?action=confirm</code> à l'URL</p>\n";
} else {
    echo "<p class='error'>⚠️ Mode CONFIRMÉ - Les doublons seront supprimés !</p>\n";
}

// Récupérer tous les véhicules
$stmt = $pdo->query("
    SELECT id, reference, marque, modele, version, prix_vente, kilometrage, annee, 
           energie, typeboite, couleurexterieur, carrosserie, nbrplace, nbrporte, date_mec
    FROM vehicles
    ORDER BY marque, modele, id DESC
");
$allVehicles = $stmt->fetchAll(PDO::FETCH_ASSOC);

// Grouper par caractéristiques identiques
$groups = [];
foreach ($allVehicles as $vehicle) {
    // Créer une clé unique basée sur les caractéristiques principales
    $key = md5(
        $vehicle['marque'] . '|' .
        $vehicle['modele'] . '|' .
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

// Identifier les groupes avec doublons
$duplicateGroups = [];
foreach ($groups as $key => $group) {
    if (count($group) > 1) {
        // Trier par ID décroissant pour garder le premier (ID le plus élevé = le plus récent)
        usort($group, function($a, $b) {
            return $b['id'] - $a['id'];
        });
        
        $duplicateGroups[$key] = $group;
    }
}

echo "<h2>📊 Analyse des doublons</h2>\n";
echo "<p class='info'>Groupes de doublons trouvés: <strong>" . count($duplicateGroups) . "</strong></p>\n";

$totalDuplicates = 0;
$vehiclesToDelete = [];

foreach ($duplicateGroups as $key => $group) {
    $keep = $group[0]; // Garder le premier (ID le plus élevé)
    $delete = array_slice($group, 1); // Supprimer les autres
    
    $totalDuplicates += count($delete);
    
    echo "<h3>🔍 Groupe: {$keep['marque']} {$keep['modele']}</h3>\n";
    echo "<p class='success'>✅ À garder: Référence <strong>{$keep['reference']}</strong> (ID: {$keep['id']})</p>\n";
    echo "<p class='error'>❌ À supprimer: " . count($delete) . " véhicule(s)</p>\n";
    
    echo "<table>\n";
    echo "<tr><th>ID</th><th>Référence</th><th>Prix</th><th>Km</th><th>Année</th></tr>\n";
    foreach ($delete as $v) {
        echo "<tr>";
        echo "<td>{$v['id']}</td>";
        echo "<td><strong>{$v['reference']}</strong></td>";
        echo "<td>" . number_format($v['prix_vente'], 0, ',', ' ') . " €</td>";
        echo "<td>" . number_format($v['kilometrage'], 0, ',', ' ') . " km</td>";
        echo "<td>{$v['annee']}</td>";
        echo "</tr>\n";
        
        $vehiclesToDelete[] = $v['id'];
    }
    echo "</table>\n";
}

echo "<h2>📈 Résumé</h2>\n";
echo "<p class='info'>Total véhicules à supprimer: <strong>$totalDuplicates</strong></p>\n";

if ($confirmed && $totalDuplicates > 0) {
    echo "<h2>🗑️ Suppression en cours...</h2>\n";
    
    $deleted = 0;
    $errors = 0;
    
    // Supprimer les doublons (les photos seront supprimées automatiquement grâce à ON DELETE CASCADE)
    foreach ($vehiclesToDelete as $vehicleId) {
        try {
            $deleteStmt = $pdo->prepare("DELETE FROM vehicles WHERE id = ?");
            $deleteStmt->execute([$vehicleId]);
            $deleted++;
            echo "<p class='success'>✅ Véhicule ID $vehicleId supprimé</p>\n";
        } catch (PDOException $e) {
            $errors++;
            echo "<p class='error'>❌ Erreur suppression véhicule ID $vehicleId: " . htmlspecialchars($e->getMessage()) . "</p>\n";
        }
    }
    
    echo "<h2>✅ Suppression terminée</h2>\n";
    echo "<p class='success'>✅ Véhicules supprimés: $deleted</p>\n";
    if ($errors > 0) {
        echo "<p class='error'>❌ Erreurs: $errors</p>\n";
    }
    
    // Compter véhicules restants
    $countStmt = $pdo->query("SELECT COUNT(*) as total FROM vehicles");
    $count = $countStmt->fetch();
    echo "<p class='info'>📊 Véhicules restants: <strong>{$count['total']}</strong></p>\n";
    
} elseif ($totalDuplicates > 0) {
    echo "<h2>🚀 Confirmer la suppression</h2>\n";
    echo "<p class='warning'>⚠️ Pour supprimer les $totalDuplicates doublons, cliquez sur le lien ci-dessous :</p>\n";
    echo "<p><a href='?action=confirm' style='background:#dc2626;color:white;padding:10px 20px;text-decoration:none;border-radius:5px;'>🗑️ Confirmer la suppression des doublons</a></p>\n";
} else {
    echo "<p class='success'>✅ Aucun doublon détecté - Base de données propre !</p>\n";
}

echo "<p><a href='check_duplicates.php'>🔙 Retour vérification doublons</a> | <a href='check_data.php'>📊 Vérifier données</a> | <a href='/'>🏠 Retour au site</a></p>\n";
echo "</body></html>";

?>


