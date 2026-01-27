<?php
/**
 * Script de test - Parsing XML Spider-VO
 * Valide le fichier export.xml et affiche les données extraites
 */

ini_set('display_errors', 1);
error_reporting(E_ALL);

echo "<!DOCTYPE html>\n<html><head><title>Test Parsing XML Spider-VO</title>";
echo "<style>body{font-family:monospace;max-width:1200px;margin:20px auto;} table{border-collapse:collapse;width:100%;} th,td{border:1px solid #ccc;padding:8px;text-align:left;} .success{color:#059669;} .error{color:#dc2626;}</style></head><body>";

echo "<h1>🧪 Test Parsing XML Spider-VO</h1>\n";

// Chemin vers le fichier XML
$xmlFile = __DIR__ . '/../../export.xml';

if (!file_exists($xmlFile)) {
    echo "<div class='error'>";
    echo "<p>❌ Fichier export.xml non trouvé: $xmlFile</p>";
    echo "<p>Placez votre fichier export.xml à la racine du projet</p>";
    echo "</div></body></html>";
    exit;
}

echo "<p class='success'>✅ Fichier XML trouvé: " . basename($xmlFile) . " (" . number_format(filesize($xmlFile)) . " bytes)</p>\n";

try {
    // Charger et parser le XML
    $xmlContent = file_get_contents($xmlFile);
    
    libxml_use_internal_errors(true);
    $xml = simplexml_load_string($xmlContent);
    
    if ($xml === false) {
        $errors = libxml_get_errors();
        throw new Exception("Erreur parsing XML: " . implode(", ", array_map(fn($e) => trim($e->message), $errors)));
    }
    
    $totalVehicles = count($xml->vehicule);
    echo "<p class='success'>✅ XML parsé avec succès - $totalVehicles véhicules trouvés</p>\n";
    
    // Analyser les 5 premiers véhicules
    echo "<h2>📊 Analyse des véhicules (5 premiers)</h2>\n";
    echo "<table>\n";
    echo "<tr><th>Référence</th><th>Marque</th><th>Modèle</th><th>Prix</th><th>Km</th><th>Année</th><th>État</th><th>Photos</th></tr>\n";
    
    $count = 0;
    foreach ($xml->vehicule as $vehicule) {
        if ($count >= 5) break;
        
        // Extraction des données
        $reference = trim((string)$vehicule->reference);
        $marque = trim((string)$vehicule->marque);
        $modele = trim((string)$vehicule->modele);
        $prix = trim((string)$vehicule->prix_vente);
        $km = number_format((int)trim((string)$vehicule->kilometrage));
        $annee = trim((string)$vehicule->annee);
        $etat = trim((string)$vehicule->etat);
        
        // Compter les photos
        $photosCount = isset($vehicule->photos->photo) ? count($vehicule->photos->photo) : 0;
        
        echo "<tr>";
        echo "<td>$reference</td>";
        echo "<td>$marque</td>";
        echo "<td>$modele</td>";
        echo "<td>" . number_format((float)str_replace(',', '.', $prix)) . " €</td>";
        echo "<td>$km km</td>";
        echo "<td>$annee</td>";
        echo "<td>$etat</td>";
        echo "<td>$photosCount photos</td>";
        echo "</tr>\n";
        
        $count++;
    }
    
    echo "</table>\n";
    
    // Statistiques générales
    echo "<h2>📈 Statistiques XML</h2>\n";
    
    $stats = [
        'total' => $totalVehicles,
        'disponibles' => 0,
        'marques' => [],
        'prix_moyen' => 0,
        'avec_photos' => 0
    ];
    
    $prixTotal = 0;
    $prixCount = 0;
    
    foreach ($xml->vehicule as $vehicule) {
        $etat = trim((string)$vehicule->etat);
        $marque = trim((string)$vehicule->marque);
        $prix = (float)str_replace(',', '.', trim((string)$vehicule->prix_vente));
        
        if ($etat === 'Disponible') $stats['disponibles']++;
        if ($marque) $stats['marques'][$marque] = ($stats['marques'][$marque] ?? 0) + 1;
        if ($prix > 0) { $prixTotal += $prix; $prixCount++; }
        if (isset($vehicule->photos->photo)) $stats['avec_photos']++;
    }
    
    $stats['prix_moyen'] = $prixCount > 0 ? $prixTotal / $prixCount : 0;
    
    echo "<ul>";
    echo "<li><strong>Total véhicules:</strong> {$stats['total']}</li>";
    echo "<li><strong>Disponibles:</strong> {$stats['disponibles']}</li>";
    echo "<li><strong>Avec photos:</strong> {$stats['avec_photos']}</li>";
    echo "<li><strong>Prix moyen:</strong> " . number_format($stats['prix_moyen'], 0) . " €</li>";
    echo "</ul>";
    
    // Top marques
    arsort($stats['marques']);
    echo "<h3>🏆 Top marques</h3>\n<ul>";
    foreach (array_slice($stats['marques'], 0, 8) as $marque => $count) {
        echo "<li><strong>$marque:</strong> $count véhicules</li>";
    }
    echo "</ul>";
    
    // Exemple de données extraites
    if (isset($xml->vehicule[0])) {
        $premier = $xml->vehicule[0];
        
        echo "<h2>🔍 Exemple de données extraites</h2>\n";
        echo "<h3>Premier véhicule: " . trim((string)$premier->marque) . " " . trim((string)$premier->modele) . "</h3>\n";
        
        $donnees = [
            'Référence' => trim((string)$premier->reference),
            'Titre' => trim((string)$premier->titre),
            'Prix vente' => number_format((float)str_replace(',', '.', trim((string)$premier->prix_vente))) . " €",
            'Kilométrage' => number_format((int)trim((string)$premier->kilometrage)) . " km",
            'Année' => trim((string)$premier->annee),
            'Énergie' => trim((string)$premier->energie),
            'Boîte' => trim((string)$premier->typeboite) === 'A' ? 'Automatique' : 'Manuelle',
            'Couleur' => trim((string)$premier->couleurexterieur),
            'Carrosserie' => trim((string)$premier->carrosserie),
            'Places' => trim((string)$premier->nbrplace),
            'Puissance' => trim((string)$premier->puissancedyn) . " ch",
            'État' => trim((string)$premier->etat)
        ];
        
        echo "<table>\n";
        foreach ($donnees as $label => $valeur) {
            echo "<tr><td><strong>$label</strong></td><td>$valeur</td></tr>\n";
        }
        echo "</table>\n";
        
        // Photos du premier véhicule
        if (isset($premier->photos->photo)) {
            echo "<h4>📷 Photos disponibles (" . count($premier->photos->photo) . ")</h4>\n";
            echo "<div style='display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:10px;max-height:300px;overflow-y:auto;'>";
            
            $photoCount = 0;
            foreach ($premier->photos->photo as $photo) {
                if ($photoCount >= 6) break; // Limiter l'affichage
                $photoUrl = trim((string)$photo);
                echo "<img src='$photoUrl' style='width:100%;height:120px;object-fit:cover;border:1px solid #ccc;' alt='Photo véhicule' onError='this.style.display=\"none\"'>";
                $photoCount++;
            }
            echo "</div>\n";
        }
    }
    
    echo "<hr>";
    echo "<div class='success'>";
    echo "<h2>🎉 Test de parsing réussi !</h2>";
    echo "<p><strong>Le fichier XML Spider-VO est parfaitement compatible.</strong></p>";
    echo "<p>Vous pouvez maintenant procéder à l'installation complète.</p>";
    echo "</div>";
    
    echo "<h3>🔗 Liens utiles</h3>";
    echo "<ul>";
    echo "<li><a href='../install/setup.php'>🛠️ Installer la base de données</a></li>";
    echo "<li><a href='../api/index.php?action=vehicles&limit=3'>🔌 Tester l'API</a></li>";
    echo "<li><a href='../../'>🏠 Retour au site</a></li>";
    echo "</ul>";
    
} catch (Exception $e) {
    echo "<div class='error'>";
    echo "<h2>❌ Erreur de parsing</h2>";
    echo "<p>" . htmlspecialchars($e->getMessage()) . "</p>";
    echo "</div>";
}

echo "</body></html>";
?>
