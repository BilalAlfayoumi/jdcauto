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

function shouldUseEnvironmentDbConfig() {
    $host = $_SERVER['HTTP_HOST'] ?? '';
    $forced = getenv('USE_ENV_DB_CONFIG');

    if ($forced !== false) {
        return in_array(strtolower((string)$forced), ['1', 'true', 'yes', 'on'], true);
    }

    if (php_sapi_name() === 'cli') {
        return true;
    }

    return strpos($host, 'localhost') !== false
        || strpos($host, '127.0.0.1') !== false
        || strpos($host, 'php') !== false;
}

// Configuration
if (shouldUseEnvironmentDbConfig()) {
    $host = getenv('DB_HOST') ?: 'localhost';
    $dbname = getenv('DB_NAME') ?: 'jdcauto';
    $username = getenv('DB_USER') ?: 'root';
    $password = getenv('DB_PASSWORD') ?: '';
} else {
    $host = 'localhost';
    $dbname = 'jdcauto';
    $username = 'root';
    $password = '';
}

// ⚠️ IMPORTANT : URL du flux XML Spider-VO
// URL fournie par Spider-VO dans votre compte
$spiderVoXmlUrl = getenv('SPIDER_VO_XML_URL');
if ($spiderVoXmlUrl === false) {
    $spiderVoXmlUrl = 'https://www.spider-vo.net/export,st2div6b0860458b-fbb07722e1-03df2748e1-6e82247ae0.html';
}

// Si pas d'URL configurée, utiliser le fichier local en fallback
$xmlFile = getenv('SPIDER_VO_XML_FILE') ?: (__DIR__ . '/../../export.xml');
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

function buildVehicleDuplicateGroups(PDO $pdo) {
    $duplicatesSql = "
        SELECT 
            marque,
            modele,
            prix_vente,
            kilometrage,
            annee,
            COALESCE(version, '') AS version_normalized,
            COALESCE(couleurexterieur, '') AS couleur_normalized,
            COUNT(*) AS duplicate_count
        FROM vehicles
        GROUP BY 
            marque,
            modele,
            prix_vente,
            kilometrage,
            annee,
            COALESCE(version, ''),
            COALESCE(couleurexterieur, '')
        HAVING COUNT(*) > 1
        ORDER BY duplicate_count DESC
    ";

    return $pdo->query($duplicatesSql)->fetchAll(PDO::FETCH_ASSOC);
}

function mergeDuplicateVehicles(PDO $pdo) {
    $duplicateGroups = buildVehicleDuplicateGroups($pdo);
    if (empty($duplicateGroups)) {
        return [
            'groups_merged' => 0,
            'vehicles_removed' => 0,
            'photos_merged' => 0,
            'options_merged' => 0,
        ];
    }

    $hasVehicleOptions = $pdo->query("SHOW TABLES LIKE 'vehicle_options'")->rowCount() > 0;
    $groupsMerged = 0;
    $vehiclesRemoved = 0;
    $photosMerged = 0;
    $optionsMerged = 0;

    foreach ($duplicateGroups as $group) {
        $vehiclesSql = "
            SELECT id, reference, manual_status_override, synced_status, etat, updated_at
            FROM vehicles
            WHERE marque = ?
              AND modele = ?
              AND prix_vente = ?
              AND kilometrage = ?
              AND annee = ?
              AND COALESCE(version, '') = ?
              AND COALESCE(couleurexterieur, '') = ?
            ORDER BY
              CASE WHEN manual_status_override IS NOT NULL AND manual_status_override <> '' THEN 1 ELSE 0 END DESC,
              updated_at DESC,
              id DESC
        ";

        $vehiclesStmt = $pdo->prepare($vehiclesSql);
        $vehiclesStmt->execute([
            $group['marque'],
            $group['modele'],
            $group['prix_vente'],
            $group['kilometrage'],
            $group['annee'],
            $group['version_normalized'],
            $group['couleur_normalized'],
        ]);
        $duplicateVehicles = $vehiclesStmt->fetchAll(PDO::FETCH_ASSOC);

        if (count($duplicateVehicles) < 2) {
            continue;
        }

        $keepVehicle = $duplicateVehicles[0];
        $removeVehicles = array_slice($duplicateVehicles, 1);
        $allIds = array_map('intval', array_column($duplicateVehicles, 'id'));
        $removeIds = array_map('intval', array_column($removeVehicles, 'id'));
        $placeholders = implode(',', array_fill(0, count($allIds), '?'));
        $removePlaceholders = implode(',', array_fill(0, count($removeIds), '?'));

        try {
            $pdo->beginTransaction();

            $photosStmt = $pdo->prepare("
                SELECT photo_url
                FROM vehicle_photos
                WHERE vehicle_id IN ($placeholders)
                ORDER BY vehicle_id DESC, photo_order ASC
            ");
            $photosStmt->execute($allIds);
            $mergedPhotoUrls = [];
            foreach ($photosStmt->fetchAll(PDO::FETCH_COLUMN) as $photoUrl) {
                $photoUrl = trim((string)$photoUrl);
                if ($photoUrl !== '' && !in_array($photoUrl, $mergedPhotoUrls, true)) {
                    $mergedPhotoUrls[] = $photoUrl;
                }
            }

            $pdo->prepare("DELETE FROM vehicle_photos WHERE vehicle_id = ?")->execute([(int)$keepVehicle['id']]);
            if (!empty($mergedPhotoUrls)) {
                $insertPhotoStmt = $pdo->prepare("
                    INSERT INTO vehicle_photos (vehicle_id, photo_url, photo_order)
                    VALUES (?, ?, ?)
                ");
                foreach ($mergedPhotoUrls as $index => $photoUrl) {
                    $insertPhotoStmt->execute([(int)$keepVehicle['id'], $photoUrl, $index]);
                    $photosMerged++;
                }
            }

            if ($hasVehicleOptions) {
                $optionsStmt = $pdo->prepare("
                    SELECT option_nom
                    FROM vehicle_options
                    WHERE vehicle_id IN ($placeholders)
                    ORDER BY vehicle_id DESC, id ASC
                ");
                $optionsStmt->execute($allIds);
                $mergedOptions = [];
                foreach ($optionsStmt->fetchAll(PDO::FETCH_COLUMN) as $optionName) {
                    $optionName = trim((string)$optionName);
                    if ($optionName !== '' && !in_array($optionName, $mergedOptions, true)) {
                        $mergedOptions[] = $optionName;
                    }
                }

                $pdo->prepare("DELETE FROM vehicle_options WHERE vehicle_id = ?")->execute([(int)$keepVehicle['id']]);
                if (!empty($mergedOptions)) {
                    $insertOptionStmt = $pdo->prepare("
                        INSERT INTO vehicle_options (vehicle_id, option_nom, montant)
                        VALUES (?, ?, 0.00)
                    ");
                    foreach ($mergedOptions as $optionName) {
                        $insertOptionStmt->execute([(int)$keepVehicle['id'], $optionName]);
                        $optionsMerged++;
                    }
                }
            }

            $deletePhotosStmt = $pdo->prepare("DELETE FROM vehicle_photos WHERE vehicle_id IN ($removePlaceholders)");
            $deletePhotosStmt->execute($removeIds);

            if ($hasVehicleOptions) {
                $deleteOptionsStmt = $pdo->prepare("DELETE FROM vehicle_options WHERE vehicle_id IN ($removePlaceholders)");
                $deleteOptionsStmt->execute($removeIds);
            }

            $deleteVehiclesStmt = $pdo->prepare("DELETE FROM vehicles WHERE id IN ($removePlaceholders)");
            $deleteVehiclesStmt->execute($removeIds);

            $pdo->commit();
            $groupsMerged++;
            $vehiclesRemoved += count($removeIds);
        } catch (Throwable $exception) {
            if ($pdo->inTransaction()) {
                $pdo->rollBack();
            }
            logMessage("Nettoyage doublons impossible pour {$group['marque']} {$group['modele']}: " . $exception->getMessage(), 'error');
        }
    }

    return [
        'groups_merged' => $groupsMerged,
        'vehicles_removed' => $vehiclesRemoved,
        'photos_merged' => $photosMerged,
        'options_merged' => $optionsMerged,
    ];
}

function removeStaleAvailableVehicles(PDO $pdo, array $processedReferences) {
    $processedReferences = array_values(array_unique(array_filter(array_map('trim', $processedReferences))));
    if (empty($processedReferences)) {
        return 0;
    }

    $hasVehicleOptions = $pdo->query("SHOW TABLES LIKE 'vehicle_options'")->rowCount() > 0;
    $placeholders = implode(',', array_fill(0, count($processedReferences), '?'));

    $sql = "
        SELECT id
        FROM vehicles
        WHERE reference NOT IN ($placeholders)
          AND (manual_status_override IS NULL OR manual_status_override = '')
    ";

    $stmt = $pdo->prepare($sql);
    $stmt->execute($processedReferences);
    $staleIds = array_map('intval', $stmt->fetchAll(PDO::FETCH_COLUMN));

    if (empty($staleIds)) {
        return 0;
    }

    $deletePlaceholders = implode(',', array_fill(0, count($staleIds), '?'));

    $pdo->beginTransaction();
    try {
        $deletePhotosStmt = $pdo->prepare("DELETE FROM vehicle_photos WHERE vehicle_id IN ($deletePlaceholders)");
        $deletePhotosStmt->execute($staleIds);

        if ($hasVehicleOptions) {
            $deleteOptionsStmt = $pdo->prepare("DELETE FROM vehicle_options WHERE vehicle_id IN ($deletePlaceholders)");
            $deleteOptionsStmt->execute($staleIds);
        }

        $deleteVehiclesStmt = $pdo->prepare("DELETE FROM vehicles WHERE id IN ($deletePlaceholders)");
        $deleteVehiclesStmt->execute($staleIds);

        $pdo->commit();
        return count($staleIds);
    } catch (Throwable $exception) {
        if ($pdo->inTransaction()) {
            $pdo->rollBack();
        }
        throw $exception;
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

$vehicleColumns = $pdo->query("SHOW COLUMNS FROM vehicles")->fetchAll(PDO::FETCH_COLUMN);
if (!in_array('manual_status_override', $vehicleColumns, true)) {
    $pdo->exec("ALTER TABLE vehicles ADD COLUMN manual_status_override VARCHAR(50) NULL AFTER etat");
}
if (!in_array('synced_status', $vehicleColumns, true)) {
    $pdo->exec("ALTER TABLE vehicles ADD COLUMN synced_status VARCHAR(50) NULL AFTER manual_status_override");
    $pdo->exec("UPDATE vehicles SET synced_status = etat WHERE synced_status IS NULL");
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

// Compter véhicules (gérer les deux structures possibles)
if (isset($xml->vehicules)) {
    $vehicles = $xml->vehicules->vehicule ?? [];
} else {
    $vehicles = $xml->vehicule ?? [];
}
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
$duplicatesSkipped = 0;
$processedReferences = [];

logMessage("Début de l'import...", 'info');

foreach ($vehicles as $vehiculeXML) {
    try {
        $reference = $getCdata($vehiculeXML->reference);
        if (empty($reference)) continue;
        $processedReferences[] = $reference;
        
        // Extraire données
        $marque = $getCdata($vehiculeXML->marque) ?: '';
        $modele = $getCdata($vehiculeXML->modele) ?: '';
        $version = $getCdata($vehiculeXML->version);
        $titre = $getCdata($vehiculeXML->titre); // Titre complet du véhicule
        $prix_vente = (float)str_replace(',', '.', str_replace(' ', '', $getCdata($vehiculeXML->prix_vente) ?: '0'));
        $kilometrage = (int)str_replace(' ', '', $getCdata($vehiculeXML->kilometrage) ?: '0');
        $annee = (int)($getCdata($vehiculeXML->annee) ?: date('Y'));
        $energie = $getCdata($vehiculeXML->energie) ?: 'ESSENCE';
        $typeboite = $getCdata($vehiculeXML->typeboite);
        $carrosserie = $getCdata($vehiculeXML->carrosserie) ?: 'BERLINE';
        // Récupérer l'état depuis Spider-VO (peut être "Disponible", "Vendu", "Réservé", etc.)
        // Si pas d'état dans le XML, on garde l'état existant en base, sinon "Disponible" par défaut
        $xmlEtat = $getCdata($vehiculeXML->etat);
        if (empty($xmlEtat)) {
            $checkStmt = $pdo->prepare("SELECT etat, synced_status, manual_status_override FROM vehicles WHERE reference = ?");
            $checkStmt->execute([$reference]);
            $existing = $checkStmt->fetch();
            $xmlEtat = $existing['synced_status'] ?? ($existing['etat'] ?? 'Disponible');
        }
        
        // Description complète - préserver la structure
        $description = $getCdata($vehiculeXML->description);
        if ($description) {
            // Remplacer les <br> par des sauts de ligne
            $description = preg_replace('/<br\s*\/?>/i', "\n", $description);
            // Remplacer les balises HTML restantes par des sauts de ligne ou espaces
            $description = preg_replace('/<\/p>/i', "\n", $description);
            $description = preg_replace('/<p[^>]*>/i', "", $description);
            $description = preg_replace('/<\/div>/i', "\n", $description);
            $description = preg_replace('/<div[^>]*>/i', "", $description);
            // Supprimer les autres balises HTML mais garder le texte
            $description = strip_tags($description);
            // Normaliser les sauts de ligne multiples (max 2 sauts consécutifs)
            $description = preg_replace('/\n{3,}/', "\n\n", $description);
            // Nettoyer les espaces en début/fin de ligne mais garder les sauts de ligne
            $description = preg_replace('/[ \t]+/m', ' ', $description); // Espaces multiples sur une ligne
            $description = preg_replace('/^[ \t]+/m', '', $description); // Espaces en début de ligne
            $description = preg_replace('/[ \t]+$/m', '', $description); // Espaces en fin de ligne
            $description = trim($description);
        }
        
        $couleurexterieur = $getCdata($vehiculeXML->couleurexterieur);
        $nbrplace = $getCdata($vehiculeXML->nbrplace) ? (int)$getCdata($vehiculeXML->nbrplace) : null;
        $nbrporte = $getCdata($vehiculeXML->nbrporte) ? (int)$getCdata($vehiculeXML->nbrporte) : null;
        $puissancedyn = $getCdata($vehiculeXML->puissancedyn);
        $puissance_fiscale = $getCdata($vehiculeXML->puissance_fiscale);
        $finition = $getCdata($vehiculeXML->finition);
        $date_mec = $getCdata($vehiculeXML->date_mec);
        
        // Extraire les options/équipements
        $options = [];
        
        // Chercher le champ "equipements" ou "equipements OPTION" (peut avoir différents noms)
        // Parcourir tous les champs pour trouver celui qui contient "equipements" ou "OPTION"
        foreach ($vehiculeXML->children() as $child) {
            $fieldName = $child->getName();
            $fieldValue = $getCdata($child);
            
            // Chercher les champs contenant "equipement" ou "option" (insensible à la casse)
            if (stripos($fieldName, 'equipement') !== false || 
                stripos($fieldName, 'option') !== false ||
                stripos($fieldValue, 'OPTION') !== false) {
                
                if (!empty($fieldValue)) {
                    // Si c'est une liste séparée par des retours à la ligne, virgules, ou points-virgules
                    $optionList = preg_split('/[\n\r]+/', $fieldValue);
                    foreach ($optionList as $opt) {
                        // Nettoyer chaque ligne
                        $opt = trim($opt);
                        // Ignorer les lignes vides ou qui sont juste des séparateurs
                        if (!empty($opt) && 
                            $opt !== '-' && 
                            $opt !== ':' && 
                            strlen($opt) > 2 &&
                            stripos($opt, 'OPTIONS ET ÉQUIPEMENTS') === false &&
                            stripos($opt, 'ÉQUIPEMENTS') === false) {
                            $options[] = $opt;
                        }
                    }
                }
            }
        }
        
        // Essayer aussi les structures XML classiques
        // Structure 1: <options><option>...</option></options>
        if (isset($vehiculeXML->options) && isset($vehiculeXML->options->option)) {
            foreach ($vehiculeXML->options->option as $optionElement) {
                $optionName = $getCdata($optionElement);
                if (!empty($optionName)) {
                    $options[] = $optionName;
                }
            }
        }
        
        // Structure 2: <equipements><equipement>...</equipement></equipements>
        if (isset($vehiculeXML->equipements) && isset($vehiculeXML->equipements->equipement)) {
            foreach ($vehiculeXML->equipements->equipement as $equipementElement) {
                $equipementName = $getCdata($equipementElement);
                if (!empty($equipementName)) {
                    $options[] = $equipementName;
                }
            }
        }
        
        // Structure 3: <option> (champ direct, peut être une liste séparée)
        if (isset($vehiculeXML->option)) {
            $optionField = $getCdata($vehiculeXML->option);
            if (!empty($optionField)) {
                $optionList = preg_split('/[,;\n\r]+/', $optionField);
                foreach ($optionList as $opt) {
                    $opt = trim($opt);
                    if (!empty($opt)) {
                        $options[] = $opt;
                    }
                }
            }
        }
        
        // Structure 4: <equipement> (champ direct)
        if (isset($vehiculeXML->equipement)) {
            $equipementField = $getCdata($vehiculeXML->equipement);
            if (!empty($equipementField)) {
                $equipementList = preg_split('/[,;\n\r]+/', $equipementField);
                foreach ($equipementList as $eq) {
                    $eq = trim($eq);
                    if (!empty($eq)) {
                        $options[] = $eq;
                    }
                }
            }
        }
        
        // Dédupliquer les options
        $options = array_unique($options);
        $options = array_values($options); // Réindexer
        
        // Vérifier si existe par référence
        $existingStmt = $pdo->prepare("SELECT id, manual_status_override, synced_status FROM vehicles WHERE reference = ?");
        $existingStmt->execute([$reference]);
        $existing = $existingStmt->fetch();
        
        // Si pas trouvé par référence, vérifier les doublons par critères multiples
        if (!$existing) {
            // Critères pour détecter un doublon :
            // - Marque + Modèle + Prix + Kilométrage + Année doivent être identiques
            // - Version doit être identique (si disponible)
            // - Couleur extérieure doit être identique (si disponible)
            $duplicateSql = "
                SELECT id, manual_status_override, synced_status FROM vehicles 
                WHERE marque = ? 
                  AND modele = ? 
                  AND prix_vente = ? 
                  AND kilometrage = ? 
                  AND annee = ?
            ";
            $duplicateParams = [$marque, $modele, $prix_vente, $kilometrage, $annee];
            
            // Ajouter version si disponible
            if (!empty($version)) {
                $duplicateSql .= " AND version = ?";
                $duplicateParams[] = $version;
            } else {
                $duplicateSql .= " AND (version IS NULL OR version = '')";
            }
            
            // Ajouter couleur extérieure si disponible
            if (!empty($couleurexterieur)) {
                $duplicateSql .= " AND couleurexterieur = ?";
                $duplicateParams[] = $couleurexterieur;
            } else {
                $duplicateSql .= " AND (couleurexterieur IS NULL OR couleurexterieur = '')";
            }
            
            $duplicateSql .= " LIMIT 1";
            
            $duplicateStmt = $pdo->prepare($duplicateSql);
            $duplicateStmt->execute($duplicateParams);
            $duplicate = $duplicateStmt->fetch();
            
            if ($duplicate) {
                // Doublon trouvé - utiliser l'ID existant et mettre à jour avec la nouvelle référence
                logMessage("⚠️ Doublon détecté pour $marque $modele (prix: $prix_vente €, km: $kilometrage, année: $annee) - Référence: $reference - Fusion avec véhicule existant", 'info');
                $existing = $duplicate;
                $duplicatesSkipped++;
                // Mettre à jour la référence pour garder la plus récente
                $updateRefStmt = $pdo->prepare("UPDATE vehicles SET reference = ? WHERE id = ?");
                $updateRefStmt->execute([$reference, $existing['id']]);
            }
        }
        
        // Vérifier si la colonne titre existe
        $columnsStmt = $pdo->query("SHOW COLUMNS FROM vehicles LIKE 'titre'");
        $hasTitre = $columnsStmt->rowCount() > 0;
        
        // Statut géré uniquement par l'admin : conserver l'état actuel pour les véhicules existants,
        // toujours "Disponible" pour les nouveaux véhicules ajoutés depuis Spider-VO.
        $finalEtat = $existing ? ($existing['etat'] ?? 'Disponible') : 'Disponible';

        if ($existing) {
            // Mise à jour (utiliser ID pour gérer les doublons détectés)
            $vehicleId = $existing['id'];
            if ($hasTitre) {
                $sql = "
                    UPDATE vehicles SET
                        reference = ?, marque = ?, modele = ?, version = ?, titre = ?, prix_vente = ?, kilometrage = ?,
                        annee = ?, energie = ?, typeboite = ?, carrosserie = ?, etat = ?, synced_status = ?,
                        description = ?, couleurexterieur = ?, nbrplace = ?, nbrporte = ?,
                        puissancedyn = ?, puissance_fiscale = ?, finition = ?, date_mec = ?, updated_at = NOW()
                    WHERE id = ?
                ";
                $pdo->prepare($sql)->execute([
                    $reference, $marque, $modele, $version, $titre, $prix_vente, $kilometrage,
                    $annee, $energie, $typeboite, $carrosserie, $finalEtat, $xmlEtat,
                    $description, $couleurexterieur, $nbrplace, $nbrporte,
                    $puissancedyn, $puissance_fiscale, $finition, $date_mec, $vehicleId
                ]);
            } else {
                $sql = "
                    UPDATE vehicles SET
                        reference = ?, marque = ?, modele = ?, version = ?, prix_vente = ?, kilometrage = ?,
                        annee = ?, energie = ?, typeboite = ?, carrosserie = ?, etat = ?, synced_status = ?,
                        description = ?, couleurexterieur = ?, nbrplace = ?, nbrporte = ?,
                        puissancedyn = ?, puissance_fiscale = ?, finition = ?, date_mec = ?, updated_at = NOW()
                    WHERE id = ?
                ";
                $pdo->prepare($sql)->execute([
                    $reference, $marque, $modele, $version, $prix_vente, $kilometrage,
                    $annee, $energie, $typeboite, $carrosserie, $finalEtat, $xmlEtat,
                    $description, $couleurexterieur, $nbrplace, $nbrporte,
                    $puissancedyn, $puissance_fiscale, $finition, $date_mec, $vehicleId
                ]);
            }
            $updated++;
        } else {
            // Insertion
            if ($hasTitre) {
                $sql = "
                    INSERT INTO vehicles 
                    (reference, marque, modele, version, titre, prix_vente, kilometrage, annee, energie, 
                     typeboite, carrosserie, etat, synced_status, description, couleurexterieur, nbrplace, 
                     nbrporte, puissancedyn, puissance_fiscale, finition, date_mec, created_at, updated_at) 
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
                ";
                $pdo->prepare($sql)->execute([
                    $reference, $marque, $modele, $version, $titre, $prix_vente, $kilometrage,
                    $annee, $energie, $typeboite, $carrosserie, $finalEtat, $xmlEtat, $description,
                    $couleurexterieur, $nbrplace, $nbrporte, $puissancedyn, $puissance_fiscale, $finition, $date_mec
                ]);
            } else {
                $sql = "
                    INSERT INTO vehicles 
                    (reference, marque, modele, version, prix_vente, kilometrage, annee, energie, 
                     typeboite, carrosserie, etat, synced_status, description, couleurexterieur, nbrplace, 
                     nbrporte, puissancedyn, puissance_fiscale, finition, date_mec, created_at, updated_at) 
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
                ";
                $pdo->prepare($sql)->execute([
                    $reference, $marque, $modele, $version, $prix_vente, $kilometrage,
                    $annee, $energie, $typeboite, $carrosserie, $finalEtat, $xmlEtat, $description,
                    $couleurexterieur, $nbrplace, $nbrporte, $puissancedyn, $puissance_fiscale, $finition, $date_mec
                ]);
            }
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
        
        // Importer options/équipements dans la table vehicle_options (si elle existe)
        if (!empty($options)) {
            try {
                // Vérifier si la table vehicle_options existe
                $checkTable = $pdo->query("SHOW TABLES LIKE 'vehicle_options'");
                if ($checkTable->rowCount() > 0) {
                    // Supprimer anciennes options
                    $pdo->prepare("DELETE FROM vehicle_options WHERE vehicle_id = ?")->execute([$vehicleId]);
                    
                    // Insérer nouvelles options
                    $optionStmt = $pdo->prepare("
                        INSERT INTO vehicle_options (vehicle_id, option_nom, montant)
                        VALUES (?, ?, 0.00)
                    ");
                    
                    foreach ($options as $option) {
                        try {
                            $optionStmt->execute([$vehicleId, $option]);
                        } catch (PDOException $e) {
                            // Ignorer erreur option individuelle
                        }
                    }
                } else {
                    // Si la table n'existe pas, ajouter les options à la description
                    if (!empty($options)) {
                        $optionsText = "\n\nOPTIONS ET ÉQUIPEMENTS :\n" . implode("\n", array_map(function($opt) {
                            return "- " . $opt;
                        }, $options));
                        $newDescription = ($description ?: '') . $optionsText;
                        
                        $pdo->prepare("UPDATE vehicles SET description = ? WHERE id = ?")->execute([$newDescription, $vehicleId]);
                    }
                }
            } catch (PDOException $e) {
                // Si erreur, ignorer (table peut ne pas exister)
                logMessage("Note: Options non importées (table vehicle_options peut ne pas exister): " . $e->getMessage(), 'info');
            }
        }
        
    } catch (Exception $e) {
        $errors++;
        logMessage("Erreur véhicule $reference: " . $e->getMessage(), 'error');
    }
}

$duplicateCleanup = mergeDuplicateVehicles($pdo);
if ($duplicateCleanup['groups_merged'] > 0) {
    logMessage("Nettoyage doublons en base: {$duplicateCleanup['groups_merged']} groupes fusionnés", 'info');
    logMessage("Doublons supprimés: {$duplicateCleanup['vehicles_removed']} véhicules", 'info');
}

// Suppression automatique désactivée : les véhicules restent sur le site indéfiniment.
// Le statut est géré manuellement par l'admin (Disponible / Réservé / Vendu).

// Résumé
logMessage("Import terminé", 'success');
logMessage("Ajoutés: $imported véhicules", 'info');
logMessage("Mis à jour: $updated véhicules", 'info');
if ($duplicatesSkipped > 0) {
    logMessage("Doublons évités: $duplicatesSkipped véhicules (fusionnés avec véhicules existants)", 'info');
}
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
