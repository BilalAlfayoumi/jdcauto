<?php
/**
 * Page de test API - Diagnostic détaillé
 */

error_reporting(E_ALL);
ini_set('display_errors', 1);
header('Content-Type: application/json; charset=utf-8');

try {
    // Connexion
    $host = 'localhost';
    $dbname = 'jdcauto';
    $username = 'root';
    $password = '';
    
    $dsn = "mysql:host=$host;dbname=$dbname;charset=utf8mb4";
    $pdo = new PDO($dsn, $username, $password, [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC
    ]);
    
    $result = [
        'success' => true,
        'connection' => 'OK',
        'database' => $dbname
    ];
    
    // Vérifier les tables
    $tablesStmt = $pdo->query("SHOW TABLES");
    $tables = $tablesStmt->fetchAll(PDO::FETCH_COLUMN);
    $result['tables'] = $tables;
    
    // Si table vehicles existe, analyser sa structure
    if (in_array('vehicles', $tables)) {
        // Colonnes
        $columnsStmt = $pdo->query("SHOW COLUMNS FROM vehicles");
        $columns = $columnsStmt->fetchAll();
        $result['vehicles_columns'] = array_column($columns, 'Field');
        
        // Compter les véhicules
        $countStmt = $pdo->query("SELECT COUNT(*) as total FROM vehicles");
        $count = $countStmt->fetch();
        $result['vehicles_count'] = (int)$count['total'];
        
        // Récupérer un véhicule exemple
        if ($result['vehicles_count'] > 0) {
            $sampleStmt = $pdo->query("SELECT * FROM vehicles LIMIT 1");
            $sample = $sampleStmt->fetch();
            $result['sample_vehicle'] = $sample;
        }
        
        // Tester la requête exacte de l'API
        try {
            $testStmt = $pdo->query("
                SELECT 
                    id, marque, modele, prix_vente, kilometrage, annee, energie, 
                    typeboite, carrosserie, etat
                FROM vehicles 
                LIMIT 3
            ");
            $testVehicles = $testStmt->fetchAll();
            $result['test_query'] = [
                'success' => true,
                'count' => count($testVehicles),
                'vehicles' => $testVehicles
            ];
        } catch (PDOException $e) {
            $result['test_query'] = [
                'success' => false,
                'error' => $e->getMessage(),
                'code' => $e->getCode()
            ];
        }
    }
    
    // Si table vehicle_photos existe
    if (in_array('vehicle_photos', $tables)) {
        $photosCountStmt = $pdo->query("SELECT COUNT(*) as total FROM vehicle_photos");
        $photosCount = $photosCountStmt->fetch();
        $result['photos_count'] = (int)$photosCount['total'];
    }
    
    echo json_encode($result, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
    
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage(),
        'code' => $e->getCode(),
        'file' => $e->getFile(),
        'line' => $e->getLine()
    ], JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage(),
        'type' => get_class($e)
    ], JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
}

?>

