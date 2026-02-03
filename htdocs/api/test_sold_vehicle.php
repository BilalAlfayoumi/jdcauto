<?php
/**
 * Script de test pour marquer un véhicule comme "Vendu"
 * Pour tester l'affichage des véhicules vendus
 */

require_once __DIR__ . '/../config/mysql_gandi.php';

try {
    $pdo = new PDO(
        "mysql:host=" . DB_HOST . ";dbname=" . DB_NAME . ";charset=utf8mb4",
        DB_USER,
        DB_PASS,
        [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION]
    );
    
    // Récupérer le premier véhicule disponible
    $stmt = $pdo->query("SELECT id, marque, modele, etat FROM vehicles WHERE etat = 'Disponible' LIMIT 1");
    $vehicle = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if ($vehicle) {
        // Marquer comme "Vendu"
        $updateStmt = $pdo->prepare("UPDATE vehicles SET etat = 'Vendu' WHERE id = ?");
        $updateStmt->execute([$vehicle['id']]);
        
        echo json_encode([
            'success' => true,
            'message' => "Véhicule #{$vehicle['id']} ({$vehicle['marque']} {$vehicle['modele']}) marqué comme 'Vendu'",
            'vehicle' => [
                'id' => $vehicle['id'],
                'marque' => $vehicle['marque'],
                'modele' => $vehicle['modele'],
                'ancien_etat' => $vehicle['etat'],
                'nouvel_etat' => 'Vendu'
            ]
        ]);
    } else {
        echo json_encode([
            'success' => false,
            'message' => 'Aucun véhicule disponible trouvé'
        ]);
    }
    
} catch (PDOException $e) {
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage()
    ]);
}

