<?php
/**
 * Script de diagnostic pour les photos
 * Vérifie pourquoi les photos ne sont pas importées
 */

ini_set('display_errors', 1);
error_reporting(E_ALL);

echo "<!DOCTYPE html>\n<html><head><title>Debug Photos</title>";
echo "<style>body{font-family:monospace;max-width:1200px;margin:20px auto;} .success{color:#059669;} .error{color:#dc2626;} .info{color:#0284c7;} pre{background:#f5f5f5;padding:10px;overflow-x:auto;}</style></head><body>";
echo "<h1>🔍 Diagnostic Photos</h1>\n";

// Vérifier fichier XML
$xmlFile = __DIR__ . '/../../export.xml';
echo "<h2>📄 Fichier XML</h2>\n";
if (file_exists($xmlFile)) {
    $size = filesize($xmlFile);
    echo "<p class='success'>✅ Fichier trouvé: " . basename($xmlFile) . " (" . number_format($size) . " bytes)</p>\n";
    
    // Charger XML
    $xml = @simplexml_load_file($xmlFile);
    if ($xml) {
        echo "<p class='success'>✅ XML chargé avec succès</p>\n";
        
        // Vérifier premier véhicule
        if (isset($xml->vehicule[0])) {
            $first = $xml->vehicule[0];
            $ref = (string)$first->reference;
            echo "<h3>Premier véhicule: $ref</h3>\n";
            
            // Vérifier structure photos
            echo "<h4>Structure photos:</h4>\n";
            echo "<pre>";
            if (isset($first->photos)) {
                echo "✅ Élément &lt;photos&gt; existe\n";
                echo "Type: " . gettype($first->photos) . "\n";
                echo "Nombre d'enfants: " . count($first->photos->children()) . "\n";
                
                if (isset($first->photos->photo)) {
                    echo "✅ Élément &lt;photo&gt; existe\n";
                    $photoCount = count($first->photos->photo);
                    echo "Nombre de photos: $photoCount\n\n";
                    
                    // Afficher 3 premières photos
                    echo "=== 3 premières photos ===\n";
                    for ($i = 0; $i < min(3, $photoCount); $i++) {
                        $photo = $first->photos->photo[$i];
                        echo "\nPhoto " . ($i + 1) . ":\n";
                        echo "  Type: " . gettype($photo) . "\n";
                        echo "  Contenu brut: " . htmlspecialchars(substr((string)$photo, 0, 100)) . "\n";
                        echo "  Contenu complet: " . htmlspecialchars((string)$photo) . "\n";
                        
                        // Vérifier attributs
                        if (isset($photo['url'])) {
                            echo "  Attribut url: " . htmlspecialchars((string)$photo['url']) . "\n";
                        }
                        
                        // Vérifier enfants
                        if (isset($photo->url)) {
                            echo "  Élément url: " . htmlspecialchars((string)$photo->url) . "\n";
                        }
                        
                        // Test extraction comme dans import_spider_vo.php
                        $photoUrl = trim((string)$photo);
                        if (empty($photoUrl) && isset($photo['url'])) {
                            $photoUrl = trim((string)$photo['url']);
                        }
                        if (empty($photoUrl) && isset($photo->url)) {
                            $photoUrl = trim((string)$photo->url);
                        }
                        
                        echo "  URL extraite: " . ($photoUrl ? htmlspecialchars($photoUrl) : "❌ VIDE") . "\n";
                        echo "  URL valide: " . (strpos($photoUrl, 'http') === 0 ? "✅ OUI" : "❌ NON") . "\n";
                    }
                } else {
                    echo "❌ Élément &lt;photo&gt; n'existe pas\n";
                    echo "Enfants de &lt;photos&gt;: " . implode(', ', array_map(function($child) {
                        return $child->getName();
                    }, $first->photos->children())) . "\n";
                }
            } else {
                echo "❌ Élément &lt;photos&gt; n'existe pas\n";
                echo "Enfants du véhicule: " . implode(', ', array_map(function($child) {
                    return $child->getName();
                }, $first->children())) . "\n";
            }
            echo "</pre>\n";
            
            // Afficher XML brut du premier véhicule (limité)
            echo "<h4>XML brut (premier véhicule, tronqué):</h4>\n";
            echo "<pre>" . htmlspecialchars(substr($first->asXML(), 0, 2000)) . "...</pre>\n";
            
        } else {
            echo "<p class='error'>❌ Aucun véhicule trouvé dans XML</p>\n";
        }
    } else {
        echo "<p class='error'>❌ Erreur chargement XML: " . libxml_get_last_error() . "</p>\n";
    }
} else {
    echo "<p class='error'>❌ Fichier XML non trouvé: $xmlFile</p>\n";
}

// Vérifier base de données
echo "<h2>💾 Base de données</h2>\n";
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
    
    // Compter photos
    $stmt = $pdo->query("SELECT COUNT(*) as total FROM vehicle_photos");
    $totalPhotos = $stmt->fetch()['total'];
    echo "<p class='" . ($totalPhotos > 0 ? 'success' : 'error') . "'>📸 Photos en base: $totalPhotos</p>\n";
    
    // Afficher quelques photos
    if ($totalPhotos > 0) {
        $stmt = $pdo->query("SELECT v.reference, vp.photo_url FROM vehicle_photos vp JOIN vehicles v ON vp.vehicle_id = v.id LIMIT 5");
        echo "<h4>Exemples de photos en base:</h4>\n";
        echo "<ul>\n";
        foreach ($stmt->fetchAll() as $row) {
            echo "<li>{$row['reference']}: " . htmlspecialchars(substr($row['photo_url'], 0, 80)) . "...</li>\n";
        }
        echo "</ul>\n";
    }
    
} catch (PDOException $e) {
    echo "<p class='error'>❌ Erreur connexion DB: " . htmlspecialchars($e->getMessage()) . "</p>\n";
}

echo "<p><a href='import_spider_vo.php'>🔄 Réimporter</a> | <a href='check_data.php'>📊 Vérifier données</a> | <a href='/'>🏠 Retour</a></p>\n";
echo "</body></html>";

?>


