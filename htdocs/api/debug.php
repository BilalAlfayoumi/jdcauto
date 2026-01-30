<?php
/**
 * Page de debug API - Test direct
 */

error_reporting(E_ALL);
ini_set('display_errors', 1);
header('Content-Type: application/json; charset=utf-8');

// Simuler les paramètres que React envoie
$_GET['action'] = 'vehicles';
$_GET['limit'] = 5;
$_GET['status'] = 'Disponible';

echo "=== TEST API DIRECT ===\n\n";

// Inclure l'API
ob_start();
try {
    include __DIR__ . '/index.php';
    $output = ob_get_clean();
    echo "✅ API exécutée avec succès\n";
    echo "Réponse:\n";
    echo $output;
} catch (Exception $e) {
    ob_end_clean();
    echo "❌ Erreur: " . $e->getMessage() . "\n";
    echo "Trace: " . $e->getTraceAsString() . "\n";
}

?>


