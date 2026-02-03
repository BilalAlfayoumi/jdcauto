<?php
/**
 * Script de test pour marquer un véhicule comme "Vendu"
 * Pour tester l'affichage des véhicules vendus
 */

header('Content-Type: application/json');

require_once __DIR__ . '/../config/mysql_gandi.php';

try {
    $pdo = GandiMySQL::connect();
    
    if (!$pdo) {
        throw new Exception('Impossible de se connecter à la base de données');
    }
    
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

