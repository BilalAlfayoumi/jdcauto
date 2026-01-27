<?php
/**
 * Script de synchronisation automatique Spider-VO
 * Peut être exécuté en CLI (Cron Job) ou via HTTP
 * Charge le flux XML depuis l'URL Spider-VO
 */

// Mode CLI ou HTTP
$isCLI = php_sapi_name() === 'cli';

if (!$isCLI) {
    header('Content-Type: text/html; charset=utf-8');
    echo "<!DOCTYPE html>\n<html><head><title>Synchronisation Spider-VO</title>";
    echo "<style>body{font-family:monospace;max-width:1200px;margin:20px auto;} .success{color:#059669;} .error{color:#dc2626;} .info{color:#0284c7;}</style></head><body>";
    echo "<h1>🔄 Synchronisation Spider-VO</h1>\n";
}

// Configuration
$host = 'localhost';
$dbname = 'jdcauto';
$username = 'root';
$password = '';

// ⚠️ IMPORTANT : Remplacer par votre vraie URL Spider-VO
// L'URL doit être fournie par Spider-VO dans votre compte
$spiderVoXmlUrl = 'https://votre-compte.spider-vo.com/export.xml'; // À CONFIGURER

// Si pas d'URL configurée, utiliser le fichier local en fallback
$xmlFile = __DIR__ . '/../../export.xml';
$useLocalFile = empty($spiderVoXmlUrl) || $spiderVoXmlUrl === 'https://votre-compte.spider-vo.com/export.xml';

function logMessage($message, $type = 'info') {
    global $isCLI;
    $timestamp = date('Y-m-d H:i:s');
    $prefix = $type === 'error' ? '❌' : ($type === 'success' ? '✅' : 'ℹ️');
    
    if ($isCLI) {
        echo "[$timestamp] $prefix $message\n";
    } else {
        $class = $type === 'error' ? 'error' : ($type === 'success' ? 'success' : 'info');
        echo "<p class='$class'>$prefix $message</p>\n";
    }
}

try {
    $pdo = new PDO(
        "mysql:host=$host;dbname=$dbname;charset=utf8mb4",
        $username,
        $password,
        [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION]
    );
    logMessage("Connexion MySQL réussie", 'success');
} catch (PDOException $e) {
    logMessage("Erreur connexion: " . $e->getMessage(), 'error');
    exit(1);
}

// Charger le XML
logMessage("Chargement du flux XML Spider-VO...", 'info');

if ($useLocalFile && file_exists($xmlFile)) {
    logMessage("Utilisation du fichier local: export.xml", 'info');
    $xml = @simplexml_load_file($xmlFile);
    if (!$xml) {
        logMessage("Erreur parsing XML local", 'error');
        exit(1);
    }
} else {
    // Charger depuis URL Spider-VO
    logMessage("Chargement depuis URL: $spiderVoXmlUrl", 'info');
    
    $context = stream_context_create([
        'http' => [
            'timeout' => 300, // 5 minutes
            'user_agent' => 'JDC-Auto-Sync/1.0',
            'method' => 'GET'
        ]
    ]);
    
    $xmlContent = @file_get_contents($spiderVoXmlUrl, false, $context);
    
    if ($xmlContent === false) {
        logMessage("Impossible de charger le flux XML depuis Spider-VO", 'error');
        logMessage("Vérifiez que l'URL est correcte et accessible", 'error');
        exit(1);
    }
    
    $xml = @simplexml_load_string($xmlContent);
    if (!$xml) {
        logMessage("Erreur parsing XML depuis Spider-VO", 'error');
        exit(1);
    }
    
    logMessage("XML chargé avec succès (" . number_format(strlen($xmlContent)) . " bytes)", 'success');
}

// Compter véhicules
$vehicles = $xml->vehicule ?? [];
$totalVehicles = count($vehicles);
logMessage("Véhicules trouvés dans le flux: $totalVehicles", 'info');

if ($totalVehicles === 0) {
    logMessage("Aucun véhicule dans le flux XML", 'error');
    exit(1);
}

// Fonction helper pour extraire CDATA
$getCdata = function($element) {
    if ($element === null) return null;
    $dom = new DOMDocument();
    $dom->loadXML($element->asXML());
    return trim($dom->textContent);
};

// Statistiques
$imported = 0;
$updated = 0;
$errors = 0;
$photosImported = 0;

logMessage("Début de l'import...", 'info');

foreach ($vehicles as $vehiculeXML) {
    try {
        $reference = $getCdata($vehiculeXML->reference);
        if (empty($reference)) continue;
        
        // Extraire données
        $marque = $getCdata($vehiculeXML->marque) ?: '';
        $modele = $getCdata($vehiculeXML->modele) ?: '';
        $version = $getCdata($vehiculeXML->version);
        $prix_vente = (float)str_replace(',', '.', str_replace(' ', '', $getCdata($vehiculeXML->prix_vente) ?: '0'));
        $kilometrage = (int)str_replace(' ', '', $getCdata($vehiculeXML->kilometrage) ?: '0');
        $annee = (int)($getCdata($vehiculeXML->annee) ?: date('Y'));
        $energie = $getCdata($vehiculeXML->energie) ?: 'ESSENCE';
        $typeboite = $getCdata($vehiculeXML->typeboite);
        $carrosserie = $getCdata($vehiculeXML->carrosserie) ?: 'BERLINE';
        $etat = $getCdata($vehiculeXML->etat) ?: 'Disponible';
        
        // Description nettoyée
        $description = $getCdata($vehiculeXML->description);
        if ($description) {
            $description = preg_replace('/<br\s*\/?>/i', "\n", $description);
            $description = preg_replace('/\s+/', ' ', $description);
            $description = trim($description);
        }
        
        $couleurexterieur = $getCdata($vehiculeXML->couleurexterieur);
        $nbrplace = $getCdata($vehiculeXML->nbrplace) ? (int)$getCdata($vehiculeXML->nbrplace) : null;
        $nbrporte = $getCdata($vehiculeXML->nbrporte) ? (int)$getCdata($vehiculeXML->nbrporte) : null;
        $puissancedyn = $getCdata($vehiculeXML->puissancedyn);
        $finition = $getCdata($vehiculeXML->finition);
        $date_mec = $getCdata($vehiculeXML->date_mec);
        
        // Vérifier si existe
        $existing = $pdo->prepare("SELECT id FROM vehicles WHERE reference = ?")->execute([$reference]);
        $existing = $pdo->prepare("SELECT id FROM vehicles WHERE reference = ?");
        $existing->execute([$reference]);
        $existing = $existing->fetch();
        
        if ($existing) {
            // Mise à jour
            $sql = "
                UPDATE vehicles SET
                    marque = ?, modele = ?, version = ?, prix_vente = ?, kilometrage = ?,
                    annee = ?, energie = ?, typeboite = ?, carrosserie = ?, etat = ?,
                    description = ?, couleurexterieur = ?, nbrplace = ?, nbrporte = ?,
                    puissancedyn = ?, finition = ?, date_mec = ?, updated_at = NOW()
                WHERE reference = ?
            ";
            $pdo->prepare($sql)->execute([
                $marque, $modele, $version, $prix_vente, $kilometrage,
                $annee, $energie, $typeboite, $carrosserie, $etat,
                $description, $couleurexterieur, $nbrplace, $nbrporte,
                $puissancedyn, $finition, $date_mec, $reference
            ]);
            $vehicleId = $existing['id'];
            $updated++;
        } else {
            // Insertion
            $sql = "
                INSERT INTO vehicles 
                (reference, marque, modele, version, prix_vente, kilometrage, annee, energie, 
                 typeboite, carrosserie, etat, description, couleurexterieur, nbrplace, 
                 nbrporte, puissancedyn, finition, date_mec, created_at, updated_at) 
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
            ";
            $pdo->prepare($sql)->execute([
                $reference, $marque, $modele, $version, $prix_vente, $kilometrage,
                $annee, $energie, $typeboite, $carrosserie, $etat, $description,
                $couleurexterieur, $nbrplace, $nbrporte, $puissancedyn, $finition, $date_mec
            ]);
            $vehicleId = $pdo->lastInsertId();
            $imported++;
        }
        
        // Importer photos
        $photoOrder = 0;
        $photosToImport = [];
        
        if (isset($vehiculeXML->photos) && isset($vehiculeXML->photos->photo)) {
            foreach ($vehiculeXML->photos->photo as $photoElement) {
                $photoUrl = trim((string)$photoElement);
                
                if (!empty($photoUrl) && (strpos($photoUrl, 'http://') === 0 || strpos($photoUrl, 'https://') === 0)) {
                    $photosToImport[] = [
                        'url' => $photoUrl,
                        'order' => $photoOrder++
                    ];
                }
            }
        }
        
        // Supprimer anciennes photos et insérer nouvelles
        if (count($photosToImport) > 0) {
            $pdo->prepare("DELETE FROM vehicle_photos WHERE vehicle_id = ?")->execute([$vehicleId]);
            
            $photoStmt = $pdo->prepare("
                INSERT INTO vehicle_photos (vehicle_id, photo_url, photo_order)
                VALUES (?, ?, ?)
            ");
            
            foreach ($photosToImport as $photo) {
                try {
                    $photoStmt->execute([$vehicleId, $photo['url'], $photo['order']]);
                    $photosImported++;
                } catch (PDOException $e) {
                    // Ignorer erreur photo individuelle
                }
            }
        }
        
    } catch (Exception $e) {
        $errors++;
        logMessage("Erreur véhicule $reference: " . $e->getMessage(), 'error');
    }
}

// Résumé
logMessage("Import terminé", 'success');
logMessage("Ajoutés: $imported véhicules", 'info');
logMessage("Mis à jour: $updated véhicules", 'info');
logMessage("Photos importées: $photosImported", 'info');
if ($errors > 0) {
    logMessage("Erreurs: $errors", 'error');
}

// Compter total
$countStmt = $pdo->query("SELECT COUNT(*) as total FROM vehicles");
$total = $countStmt->fetch()['total'];
logMessage("Total véhicules disponibles: $total", 'success');

if (!$isCLI) {
    echo "<p><a href='/'>🏠 Retour au site</a></p>\n";
    echo "</body></html>";
}

exit(0);

?>

