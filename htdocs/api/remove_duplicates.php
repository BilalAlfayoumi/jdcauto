<?php
/**
 * Script pour supprimer les doublons existants dans la base de données
 * Compare plusieurs critères pour identifier les vrais doublons
 */

header('Content-Type: application/json');

require_once __DIR__ . '/../config/mysql_gandi.php';

try {
    $pdo = GandiMySQL::connect();
    
    if (!$pdo) {
        throw new Exception('Impossible de se connecter à la base de données');
    }
    
    // Trouver les doublons
    // Critères : Marque + Modèle + Prix + Kilométrage + Année + Version + Couleur
    $duplicatesSql = "
        SELECT 
            marque, modele, prix_vente, kilometrage, annee, 
            COALESCE(version, '') as version,
            COALESCE(couleurexterieur, '') as couleur,
            COUNT(*) as count,
            GROUP_CONCAT(id ORDER BY id) as ids,
            GROUP_CONCAT(`reference` ORDER BY id) as refs
        FROM vehicles
        GROUP BY marque, modele, prix_vente, kilometrage, annee, 
                 COALESCE(version, ''), COALESCE(couleurexterieur, '')
        HAVING COUNT(*) > 1
        ORDER BY count DESC
    ";
    
    $duplicatesStmt = $pdo->query($duplicatesSql);
    $duplicates = $duplicatesStmt->fetchAll(PDO::FETCH_ASSOC);
    
    $totalDuplicates = 0;
    $removed = 0;
    $results = [];
    
    foreach ($duplicates as $dup) {
        $ids = explode(',', $dup['ids']);
        $references = explode(',', $dup['refs']);
        
        // Garder le premier ID (le plus ancien), supprimer les autres
        $keepId = $ids[0];
        $removeIds = array_slice($ids, 1);
        
        $totalDuplicates += count($removeIds);
        
        // Supprimer les doublons (garder seulement le premier)
        foreach ($removeIds as $removeId) {
            try {
                // Supprimer les photos associées
                $pdo->prepare("DELETE FROM vehicle_photos WHERE vehicle_id = ?")->execute([$removeId]);
                
                // Supprimer les options associées
                $pdo->prepare("DELETE FROM vehicle_options WHERE vehicle_id = ?")->execute([$removeId]);
                
                // Supprimer le véhicule
                $pdo->prepare("DELETE FROM vehicles WHERE id = ?")->execute([$removeId]);
                
                $removed++;
            } catch (PDOException $e) {
                // Ignorer erreur individuelle
            }
        }
        
        $results[] = [
            'marque' => $dup['marque'],
            'modele' => $dup['modele'],
            'prix' => $dup['prix_vente'],
            'kilometrage' => $dup['kilometrage'],
            'annee' => $dup['annee'],
            'version' => $dup['version'],
            'couleur' => $dup['couleur'],
            'count' => $dup['count'],
            'kept_id' => $keepId,
            'removed_ids' => $removeIds,
            'kept_reference' => $references[0],
            'removed_references' => array_slice($references, 1)
        ];
    }
    
    echo json_encode([
        'success' => true,
        'total_duplicates_found' => count($duplicates),
        'total_vehicles_removed' => $removed,
        'details' => $results
    ], JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);
    
} catch (Exception $e) {
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage()
    ], JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);
}

