<?php
/**
 * Script pour remettre un véhicule vendu en "Disponible"
 */

header('Content-Type: application/json');

require_once __DIR__ . '/../config/mysql_gandi.php';

try {
    $pdo = GandiMySQL::connect();
    
    if (!$pdo) {
        throw new Exception('Impossible de se connecter à la base de données');
    }
    
    // Récupérer le premier véhicule vendu
    $stmt = $pdo->query("SELECT id, marque, modele, etat FROM vehicles WHERE etat = 'Vendu' LIMIT 1");
    $vehicle = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if ($vehicle) {
        // Remettre comme "Disponible"
        $updateStmt = $pdo->prepare("UPDATE vehicles SET etat = 'Disponible' WHERE id = ?");
        $updateStmt->execute([$vehicle['id']]);
        
        echo json_encode([
            'success' => true,
            'message' => "Véhicule #{$vehicle['id']} ({$vehicle['marque']} {$vehicle['modele']}) remis comme 'Disponible'",
            'vehicle' => [
                'id' => $vehicle['id'],
                'marque' => $vehicle['marque'],
                'modele' => $vehicle['modele'],
                'ancien_etat' => $vehicle['etat'],
                'nouvel_etat' => 'Disponible'
            ]
        ]);
    } else {
        echo json_encode([
            'success' => false,
            'message' => 'Aucun véhicule vendu trouvé'
        ]);
    }
    
} catch (Exception $e) {
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage()
    ]);
}

