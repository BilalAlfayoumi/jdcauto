<?php
/**
 * Script d'import Spider-VO depuis export.xml
 * Importe les 35 véhicules réels dans la base MySQL Gandi
 */

ini_set('display_errors', 1);
error_reporting(E_ALL);
set_time_limit(300); // 5 minutes

echo "<!DOCTYPE html>\n<html><head><title>Import Spider-VO</title>";
echo "<style>body{font-family:monospace;max-width:1200px;margin:20px auto;line-height:1.6;} .success{color:#059669;} .error{color:#dc2626;} .info{color:#0284c7;}</style></head><body>";
echo "<h1>🚗 Import Spider-VO - JDC Auto</h1>\n";

// Configuration MySQL Gandi
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
    echo "<p class='success'>✅ Connexion MySQL réussie</p>\n";
} catch (PDOException $e) {
    echo "<p class='error'>❌ Erreur connexion: " . htmlspecialchars($e->getMessage()) . "</p></body></html>";
    exit;
}

// Chemin vers export.xml
$xmlFile = __DIR__ . '/../../export.xml';

if (!file_exists($xmlFile)) {
    echo "<p class='error'>❌ Fichier export.xml non trouvé: $xmlFile</p></body></html>";
    exit;
}

echo "<p class='info'>📄 Fichier XML trouvé: " . basename($xmlFile) . " (" . number_format(filesize($xmlFile)) . " bytes)</p>\n";

// Parser XML
libxml_use_internal_errors(true);
$xml = simplexml_load_file($xmlFile);

if ($xml === false) {
    $errors = libxml_get_errors();
    echo "<p class='error'>❌ Erreur parsing XML:</p><pre>" . htmlspecialchars(implode("\n", array_map(fn($e) => $e->message, $errors))) . "</pre></body></html>";
    exit;
}

$totalVehicles = count($xml->vehicule);
echo "<p class='success'>✅ XML parsé - $totalVehicles véhicules trouvés</p>\n";

// Fonction helper pour extraire CDATA
$getCdata = function($element) {
    return $element ? trim((string)$element) : null;
};

// Statistiques
$imported = 0;
$updated = 0;
$errors = 0;
$photosImported = 0;

echo "<h2>📊 Import en cours...</h2>\n";
echo "<table border='1' cellpadding='5' style='border-collapse:collapse;width:100%;'>\n";
echo "<tr><th>Référence</th><th>Marque</th><th>Modèle</th><th>Prix</th><th>Action</th><th>Photos</th></tr>\n";

$pdo->beginTransaction();

try {
    foreach ($xml->vehicule as $vehiculeXML) {
        try {
            // Extraire données
            $reference = $getCdata($vehiculeXML->reference) ?: 'REF-' . uniqid();
            $marque = $getCdata($vehiculeXML->marque) ?: 'INCONNU';
            $modele = $getCdata($vehiculeXML->modele) ?: 'Modèle';
            $version = $getCdata($vehiculeXML->version);
            $prix_vente = (float)str_replace(',', '.', $getCdata($vehiculeXML->prix_vente) ?: '0');
            $kilometrage = (int)($getCdata($vehiculeXML->kilometrage) ?: 0);
            $annee = (int)($getCdata($vehiculeXML->annee) ?: date('Y'));
            $energie = $getCdata($vehiculeXML->energie) ?: 'ESSENCE';
            $typeboite = $getCdata($vehiculeXML->typeboite);
            $carrosserie = $getCdata($vehiculeXML->carrosserie) ?: 'BERLINE';
            $etat = $getCdata($vehiculeXML->etat) ?: 'Disponible';
            // Extraire description - nettoyer les balises HTML et espaces
            $description = $getCdata($vehiculeXML->description);
            if ($description) {
                // Nettoyer les balises <br /> et espaces multiples
                $description = preg_replace('/<br\s*\/?>/i', "\n", $description);
                $description = preg_replace('/\s+/', ' ', $description);
                $description = trim($description);
            }
            $couleurexterieur = $getCdata($vehiculeXML->couleurexterieur);
            $nbrplace = $getCdata($vehiculeXML->nbrplace) ? (int)$getCdata($vehiculeXML->nbrplace) : null;
            $nbrporte = $getCdata($vehiculeXML->nbrporte) ? (int)$getCdata($vehiculeXML->nbrporte) : null;
            $puissancedyn = $getCdata($vehiculeXML->puissancedyn);
            $finition = $getCdata($vehiculeXML->finition);
            
            // Vérifier si existe déjà
            $stmt = $pdo->prepare("SELECT id FROM vehicles WHERE reference = ?");
            $stmt->execute([$reference]);
            $existing = $stmt->fetch();
            
            if ($existing) {
                // Mise à jour - FORCER mise à jour de toutes les colonnes
                $sql = "
                    UPDATE vehicles SET
                        marque = ?, modele = ?, version = ?, prix_vente = ?, kilometrage = ?,
                        annee = ?, energie = ?, typeboite = ?, carrosserie = ?, etat = ?,
                        description = ?, couleurexterieur = ?, nbrplace = ?, nbrporte = ?,
                        puissancedyn = ?, finition = ?, updated_at = NOW()
                    WHERE reference = ?
                ";
                $stmt = $pdo->prepare($sql);
                $stmt->execute([
                    $marque, $modele, $version, $prix_vente, $kilometrage,
                    $annee, $energie, $typeboite, $carrosserie, $etat,
                    $description, $couleurexterieur, $nbrplace, $nbrporte,
                    $puissancedyn, $finition, $reference
                ]);
                $vehicleId = $existing['id'];
                $action = "<span class='info'>🔄 Mis à jour</span>";
                $updated++;
            } else {
                // Insertion
                $sql = "
                    INSERT INTO vehicles 
                    (reference, marque, modele, version, prix_vente, kilometrage, annee, energie, 
                     typeboite, carrosserie, etat, description, couleurexterieur, nbrplace, 
                     nbrporte, puissancedyn, finition, created_at, updated_at) 
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
                ";
                $pdo->prepare($sql)->execute([
                    $reference, $marque, $modele, $version, $prix_vente, $kilometrage,
                    $annee, $energie, $typeboite, $carrosserie, $etat, $description,
                    $couleurexterieur, $nbrplace, $nbrporte, $puissancedyn, $finition
                ]);
                $vehicleId = $pdo->lastInsertId();
                $action = "<span class='success'>✅ Ajouté</span>";
                $imported++;
            }
            
            // Importer photos - Structure XML: <photos><photo>URL</photo></photos>
            $photoOrder = 0;
            $photosToImport = [];
            
            // Vérifier si photos existent dans XML
            if (isset($vehiculeXML->photos) && isset($vehiculeXML->photos->photo)) {
                // SimpleXML retourne toujours un tableau même pour un seul élément
                foreach ($vehiculeXML->photos->photo as $photoElement) {
                    // Extraire l'URL - peut être dans le contenu CDATA ou attribut
                    $photoUrl = null;
                    
                    // Méthode 1: Contenu direct (CDATA) - comme dans test_xml_parsing.php
                    $photoUrl = trim((string)$photoElement);
                    
                    // Méthode 2: Si vide, essayer attribut url
                    if (empty($photoUrl) && isset($photoElement['url'])) {
                        $photoUrl = trim((string)$photoElement['url']);
                    }
                    
                    // Méthode 3: Si vide, essayer élément url enfant
                    if (empty($photoUrl) && isset($photoElement->url)) {
                        $photoUrl = trim((string)$photoElement->url);
                    }
                    
                    // Valider l'URL
                    if (!empty($photoUrl)) {
                        $photoUrl = trim($photoUrl);
                        
                        // Vérifier que c'est une URL valide (http/https)
                        if (strpos($photoUrl, 'http://') === 0 || strpos($photoUrl, 'https://') === 0) {
                            $photosToImport[] = [
                                'url' => $photoUrl,
                                'order' => $photoOrder++
                            ];
                        }
                    }
                }
            }
            
            // Supprimer anciennes photos SEULEMENT si on a de nouvelles photos à importer
            if (count($photosToImport) > 0) {
                try {
                    // Supprimer anciennes photos
                    $deleteStmt = $pdo->prepare("DELETE FROM vehicle_photos WHERE vehicle_id = ?");
                    $deleteStmt->execute([$vehicleId]);
                    $deletedCount = $deleteStmt->rowCount();
                    
                    // Insérer les nouvelles photos
                    $photoStmt = $pdo->prepare("
                        INSERT INTO vehicle_photos (vehicle_id, photo_url, photo_order, created_at)
                        VALUES (?, ?, ?, NOW())
                    ");
                    
                    $insertedCount = 0;
                    foreach ($photosToImport as $photo) {
                        try {
                            $result = $photoStmt->execute([$vehicleId, $photo['url'], $photo['order']]);
                            if ($result) {
                                $photosImported++;
                                $insertedCount++;
                            } else {
                                $errorInfo = $photoStmt->errorInfo();
                                echo "<!-- Erreur insertion photo véhicule $vehicleId (ordre {$photo['order']}): " . htmlspecialchars($errorInfo[2] ?? 'Erreur inconnue') . " -->\n";
                                error_log("Erreur insertion photo véhicule $vehicleId: " . print_r($errorInfo, true));
                            }
                        } catch (PDOException $e) {
                            // Afficher erreur pour debug
                            echo "<!-- Erreur PDO photo véhicule $vehicleId (ordre {$photo['order']}): " . htmlspecialchars($e->getMessage()) . " -->\n";
                            error_log("Erreur PDO import photo pour véhicule $vehicleId: " . $e->getMessage());
                        }
                    }
                    
                    // Log pour debug
                    if ($insertedCount < count($photosToImport)) {
                        echo "<!-- ATTENTION: Seulement $insertedCount/" . count($photosToImport) . " photos insérées pour véhicule $vehicleId -->\n";
                    }
                } catch (PDOException $e) {
                    echo "<!-- Erreur suppression photos véhicule $vehicleId: " . htmlspecialchars($e->getMessage()) . " -->\n";
                    error_log("Erreur suppression photos pour véhicule $vehicleId: " . $e->getMessage());
                }
            } else {
                // Log si pas de photos à importer
                echo "<!-- Pas de photos à importer pour véhicule $vehicleId (référence: $reference) -->\n";
            }
            
            $photoCount = count($photosToImport);
            $photoInfo = $photoCount > 0 ? "<span class='success'>📸 $photoCount</span>" : "<span class='error'>❌ 0</span>";
            echo "<tr><td>$reference</td><td>$marque</td><td>$modele</td><td>" . number_format($prix_vente, 0, ',', ' ') . " €</td><td>$action</td><td>$photoInfo</td></tr>\n";
            
        } catch (Exception $e) {
            $errors++;
            echo "<tr><td colspan='6' class='error'>❌ Erreur: " . htmlspecialchars($e->getMessage()) . "</td></tr>\n";
        }
    }
    
    $pdo->commit();
    
    echo "</table>\n";
    
    echo "<h2>✅ Import terminé</h2>\n";
    echo "<p class='success'>✅ Ajoutés: $imported véhicules</p>\n";
    echo "<p class='info'>🔄 Mis à jour: $updated véhicules</p>\n";
    echo "<p class='info'>📸 Photos importées: $photosImported</p>\n";
    if ($errors > 0) {
        echo "<p class='error'>❌ Erreurs: $errors</p>\n";
    }
    
    // Compter total
    $stmt = $pdo->query("SELECT COUNT(*) as total FROM vehicles WHERE etat = 'Disponible'");
    $total = $stmt->fetch()['total'];
    echo "<p class='success'><strong>📊 Total véhicules disponibles: $total</strong></p>\n";
    
    echo "<p><a href='/api/test.php'>🔍 Vérifier l'API</a> | <a href='/'>🏠 Retour au site</a></p>\n";
    
} catch (Exception $e) {
    $pdo->rollBack();
    echo "<p class='error'>❌ Erreur critique: " . htmlspecialchars($e->getMessage()) . "</p>\n";
    echo "<pre>" . htmlspecialchars($e->getTraceAsString()) . "</pre>\n";
}

echo "</body></html>";

?>

