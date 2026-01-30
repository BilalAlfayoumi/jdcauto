<?php
/**
 * Script de synchronisation Spider-VO → MySQL
 * JDC Auto - Intégration flux XML officiel
 */

require_once __DIR__ . '/../config/database.php';

class SpiderVOSync {
    
    private $pdo;
    private $syncLogId;
    
    public function __construct() {
        $this->pdo = DatabaseConfig::getConnection();
    }
    
    /**
     * Synchronisation complète depuis le XML Spider-VO
     */
    public function syncFromXML($xmlFile = null) {
        $startTime = microtime(true);
        SpiderVOConfig::log("Début de synchronisation Spider-VO");
        
        // Créer log de synchronisation
        $this->createSyncLog();
        
        try {
            // Charger le XML
            $xmlData = $this->loadXMLData($xmlFile);
            
            // Parser et synchroniser
            $results = $this->parseAndSyncVehicles($xmlData);
            
            // Supprimer véhicules non présents dans le XML
            $removed = $this->removeObsoleteVehicles($results['references']);
            $results['removed'] = $removed;
            
            // Finaliser le log
            $executionTime = microtime(true) - $startTime;
            $this->completeSyncLog('SUCCESS', $results, $executionTime);
            
            SpiderVOConfig::log("Synchronisation terminée avec succès");
            return $results;
            
        } catch (Exception $e) {
            $executionTime = microtime(true) - $startTime;
            $this->completeSyncLog('ERROR', [], $executionTime, $e->getMessage());
            SpiderVOConfig::log("Erreur synchronisation: " . $e->getMessage(), 'ERROR');
            throw $e;
        }
    }
    
    /**
     * Charger les données XML
     */
    private function loadXMLData($xmlFile = null) {
        if ($xmlFile && file_exists($xmlFile)) {
            // Utiliser fichier local pour test
            $xmlContent = file_get_contents($xmlFile);
            SpiderVOConfig::log("XML chargé depuis fichier local: $xmlFile");
        } else {
            // Charger depuis URL Spider-VO
            $context = stream_context_create([
                'http' => [
                    'timeout' => SpiderVOConfig::SYNC_TIMEOUT,
                    'user_agent' => 'JDC-Auto-Sync/1.0'
                ]
            ]);
            
            $xmlContent = file_get_contents(SpiderVOConfig::XML_FEED_URL, false, $context);
            
            if ($xmlContent === false) {
                throw new Exception("Impossible de récupérer le flux XML Spider-VO");
            }
            
            SpiderVOConfig::log("XML chargé depuis Spider-VO: " . strlen($xmlContent) . " bytes");
        }
        
        // Parser le XML
        libxml_use_internal_errors(true);
        $xml = simplexml_load_string($xmlContent);
        
        if ($xml === false) {
            $errors = libxml_get_errors();
            $errorMsg = "Erreur parsing XML: " . implode(", ", array_map(fn($e) => $e->message, $errors));
            throw new Exception($errorMsg);
        }
        
        return $xml;
    }
    
    /**
     * Parser et synchroniser les véhicules
     */
    private function parseAndSyncVehicles($xml) {
        $processed = 0;
        $added = 0;
        $updated = 0;
        $references = [];
        
        foreach ($xml->vehicule as $vehiculeXML) {
            try {
                $vehicleData = $this->parseVehicleXML($vehiculeXML);
                $references[] = $vehicleData['reference'];
                
                // Vérifier si le véhicule existe
                $existingId = $this->getVehicleId($vehicleData['reference']);
                
                if ($existingId) {
                    // Mise à jour
                    $this->updateVehicle($existingId, $vehicleData);
                    $updated++;
                } else {
                    // Nouveau véhicule
                    $newId = $this->insertVehicle($vehicleData);
                    $added++;
                }
                
                $processed++;
                
                // Log de progression
                if ($processed % 10 == 0) {
                    SpiderVOConfig::log("Traité: $processed véhicules");
                }
                
            } catch (Exception $e) {
                SpiderVOConfig::log("Erreur véhicule {$vehicleData['reference']}: " . $e->getMessage(), 'WARN');
            }
        }
        
        return [
            'processed' => $processed,
            'added' => $added,
            'updated' => $updated,
            'references' => $references
        ];
    }
    
    /**
     * Parser les données d'un véhicule XML
     */
    private function parseVehicleXML($vehiculeXML) {
        // Fonction helper pour extraire valeur CDATA
        $getCdata = function($element) {
            return $element ? trim((string)$element) : null;
        };
        
        $getNumeric = function($element) {
            $val = trim((string)$element);
            return $val !== '' ? (float)str_replace(',', '.', $val) : null;
        };
        
        $getInt = function($element) {
            $val = trim((string)$element);
            return $val !== '' ? (int)$val : null;
        };
        
        // Extraction des données principales
        $data = [
            'reference' => $getCdata($vehiculeXML->reference),
            'reference_externe' => $getCdata($vehiculeXML->reference_externe),
            'marque' => $getCdata($vehiculeXML->marque),
            'modele' => $getCdata($vehiculeXML->modele),
            'version' => $getCdata($vehiculeXML->version),
            'titre' => $getCdata($vehiculeXML->titre),
            
            'annee' => $getInt($vehiculeXML->annee),
            'kilometrage' => $getInt($vehiculeXML->kilometrage),
            'energie' => $getCdata($vehiculeXML->energie),
            'typeboite' => $getCdata($vehiculeXML->typeboite),
            'nbrvitesse' => $getInt($vehiculeXML->nbrvitesse),
            'couleurexterieur' => $getCdata($vehiculeXML->couleurexterieur),
            'couleurinterieur' => $getCdata($vehiculeXML->couleurinterieur),
            'carrosserie' => $getCdata($vehiculeXML->carrosserie),
            
            'prix_vente' => $getNumeric($vehiculeXML->prix_vente),
            'prix_neuf' => $getNumeric($vehiculeXML->prix_neuf),
            'prix_marchand' => $getNumeric($vehiculeXML->prix_marchand),
            
            'puissance_fiscale' => $getInt($vehiculeXML->puissance_fiscale),
            'puissancedyn' => $getInt($vehiculeXML->puissancedyn),
            'puissancekw' => $getInt($vehiculeXML->puissancekw),
            'cylindree' => $getInt($vehiculeXML->cylindree),
            'emissions_co2' => $getInt($vehiculeXML->emissions_co2),
            'conso_moyenne' => $getNumeric($vehiculeXML->conso_moyenne),
            'nbrplace' => $getInt($vehiculeXML->nbrplace),
            'nbrporte' => $getInt($vehiculeXML->nbrporte),
            
            'etat' => $getCdata($vehiculeXML->etat) ?: 'Disponible',
            'disponibilite' => $getCdata($vehiculeXML->disponibilite),
            'description' => $getCdata($vehiculeXML->description),
            'finition' => $getCdata($vehiculeXML->finition),
            
            'date_mec' => $getCdata($vehiculeXML->date_mec) ?: null,
            'date_creation' => $getCdata($vehiculeXML->date_creation) ?: null,
            'date_modif' => $getCdata($vehiculeXML->date_modif) ?: null
        ];
        
        // Extraction photos
        $data['photos'] = [];
        if (isset($vehiculeXML->photos->photo)) {
            foreach ($vehiculeXML->photos->photo as $index => $photo) {
                $photoUrl = trim((string)$photo);
                if (!empty($photoUrl)) {
                    $data['photos'][] = [
                        'url' => $photoUrl,
                        'order' => $index
                    ];
                }
            }
        }
        
        // Extraction équipements
        $data['equipements'] = [];
        if (isset($vehiculeXML->equipements->equipement)) {
            foreach ($vehiculeXML->equipements->equipement as $equipement) {
                $nom = trim((string)$equipement);
                $montant = (float)($equipement['montant'] ?? 0);
                
                if (!empty($nom)) {
                    $data['equipements'][] = [
                        'nom' => $nom,
                        'montant' => $montant
                    ];
                }
            }
        }
        
        // Extraction options
        $data['options'] = [];
        if (isset($vehiculeXML->options->option)) {
            foreach ($vehiculeXML->options->option as $option) {
                $nom = trim((string)$option);
                $montant = (float)($option['montant'] ?? 0);
                
                if (!empty($nom)) {
                    $data['options'][] = [
                        'nom' => $nom,
                        'montant' => $montant
                    ];
                }
            }
        }
        
        return $data;
    }
    
    /**
     * Vérifier si un véhicule existe
     */
    private function getVehicleId($reference) {
        $stmt = $this->pdo->prepare("SELECT id FROM vehicles WHERE reference = ?");
        $stmt->execute([$reference]);
        $result = $stmt->fetch();
        return $result ? $result['id'] : null;
    }
    
    /**
     * Insérer un nouveau véhicule
     */
    private function insertVehicle($data) {
        // Préparer les données pour insertion
        $vehicleData = $data;
        unset($vehicleData['photos'], $vehicleData['equipements'], $vehicleData['options']);
        
        // Construire la requête d'insertion
        $columns = array_keys($vehicleData);
        $placeholders = str_repeat('?,', count($columns) - 1) . '?';
        $sql = "INSERT INTO vehicles (" . implode(',', $columns) . ") VALUES ($placeholders)";
        
        $this->pdo->beginTransaction();
        
        try {
            // Insérer véhicule principal
            $stmt = $this->pdo->prepare($sql);
            $stmt->execute(array_values($vehicleData));
            $vehicleId = $this->pdo->lastInsertId();
            
            // Insérer photos
            $this->insertVehiclePhotos($vehicleId, $data['photos']);
            
            // Insérer équipements
            $this->insertVehicleEquipements($vehicleId, $data['equipements']);
            
            // Insérer options
            $this->insertVehicleOptions($vehicleId, $data['options']);
            
            $this->pdo->commit();
            
            return $vehicleId;
            
        } catch (Exception $e) {
            $this->pdo->rollBack();
            throw $e;
        }
    }
    
    /**
     * Mettre à jour un véhicule existant
     */
    private function updateVehicle($vehicleId, $data) {
        // Préparer les données pour mise à jour
        $vehicleData = $data;
        unset($vehicleData['photos'], $vehicleData['equipements'], $vehicleData['options']);
        
        // Construire la requête de mise à jour
        $setClause = implode(' = ?, ', array_keys($vehicleData)) . ' = ?';
        $sql = "UPDATE vehicles SET $setClause WHERE id = ?";
        
        $this->pdo->beginTransaction();
        
        try {
            // Mettre à jour véhicule principal
            $stmt = $this->pdo->prepare($sql);
            $values = array_values($vehicleData);
            $values[] = $vehicleId;
            $stmt->execute($values);
            
            // Supprimer anciennes photos/équipements/options
            $this->pdo->prepare("DELETE FROM vehicle_photos WHERE vehicle_id = ?")->execute([$vehicleId]);
            $this->pdo->prepare("DELETE FROM vehicle_equipements WHERE vehicle_id = ?")->execute([$vehicleId]);
            $this->pdo->prepare("DELETE FROM vehicle_options WHERE vehicle_id = ?")->execute([$vehicleId]);
            
            // Réinsérer nouvelles données
            $this->insertVehiclePhotos($vehicleId, $data['photos']);
            $this->insertVehicleEquipements($vehicleId, $data['equipements']);
            $this->insertVehicleOptions($vehicleId, $data['options']);
            
            $this->pdo->commit();
            
        } catch (Exception $e) {
            $this->pdo->rollBack();
            throw $e;
        }
    }
    
    /**
     * Insérer photos d'un véhicule
     */
    private function insertVehiclePhotos($vehicleId, $photos) {
        if (empty($photos)) return;
        
        $stmt = $this->pdo->prepare("
            INSERT INTO vehicle_photos (vehicle_id, photo_url, photo_order) 
            VALUES (?, ?, ?)
        ");
        
        foreach ($photos as $photo) {
            $stmt->execute([$vehicleId, $photo['url'], $photo['order']]);
        }
    }
    
    /**
     * Insérer équipements d'un véhicule
     */
    private function insertVehicleEquipements($vehicleId, $equipements) {
        if (empty($equipements)) return;
        
        $stmt = $this->pdo->prepare("
            INSERT INTO vehicle_equipements (vehicle_id, equipement_nom, montant) 
            VALUES (?, ?, ?)
        ");
        
        foreach ($equipements as $equipement) {
            $stmt->execute([$vehicleId, $equipement['nom'], $equipement['montant']]);
        }
    }
    
    /**
     * Insérer options d'un véhicule
     */
    private function insertVehicleOptions($vehicleId, $options) {
        if (empty($options)) return;
        
        $stmt = $this->pdo->prepare("
            INSERT INTO vehicle_options (vehicle_id, option_nom, montant) 
            VALUES (?, ?, ?)
        ");
        
        foreach ($options as $option) {
            $stmt->execute([$vehicleId, $option['nom'], $option['montant']]);
        }
    }
    
    /**
     * Supprimer véhicules obsolètes
     */
    private function removeObsoleteVehicles($currentReferences) {
        if (empty($currentReferences)) return 0;
        
        // Placeholders pour la requête
        $placeholders = str_repeat('?,', count($currentReferences) - 1) . '?';
        
        // Marquer comme non disponibles au lieu de supprimer
        $sql = "UPDATE vehicles SET etat = 'Sorti' WHERE reference NOT IN ($placeholders)";
        $stmt = $this->pdo->prepare($sql);
        $stmt->execute($currentReferences);
        
        $removed = $stmt->rowCount();
        SpiderVOConfig::log("Véhicules marqués comme sortis: $removed");
        
        return $removed;
    }
    
    /**
     * Créer log de synchronisation
     */
    private function createSyncLog() {
        $stmt = $this->pdo->prepare("
            INSERT INTO sync_logs (sync_date, status) 
            VALUES (NOW(), 'RUNNING')
        ");
        $stmt->execute();
        $this->syncLogId = $this->pdo->lastInsertId();
    }
    
    /**
     * Finaliser log de synchronisation
     */
    private function completeSyncLog($status, $results, $executionTime, $errorMessage = null) {
        $stmt = $this->pdo->prepare("
            UPDATE sync_logs 
            SET status = ?, 
                vehicles_processed = ?, 
                vehicles_added = ?, 
                vehicles_updated = ?, 
                vehicles_removed = ?,
                execution_time = ?,
                error_message = ?
            WHERE id = ?
        ");
        
        $stmt->execute([
            $status,
            $results['processed'] ?? 0,
            $results['added'] ?? 0,
            $results['updated'] ?? 0,
            $results['removed'] ?? 0,
            $executionTime,
            $errorMessage,
            $this->syncLogId
        ]);
    }
    
    /**
     * Obtenir statistiques
     */
    public function getStats() {
        $stats = [];
        
        // Comptage par statut
        $stmt = $this->pdo->query("
            SELECT etat, COUNT(*) as count 
            FROM vehicles 
            GROUP BY etat
        ");
        $stats['by_status'] = $stmt->fetchAll();
        
        // Comptage par marque
        $stmt = $this->pdo->query("
            SELECT marque, COUNT(*) as count 
            FROM vehicles 
            WHERE etat = 'Disponible'
            GROUP BY marque 
            ORDER BY count DESC 
            LIMIT 10
        ");
        $stats['by_brand'] = $stmt->fetchAll();
        
        // Total
        $stmt = $this->pdo->query("SELECT COUNT(*) as total FROM vehicles");
        $stats['total'] = $stmt->fetch()['total'];
        
        // Dernière sync
        $stmt = $this->pdo->query("
            SELECT * FROM sync_logs 
            ORDER BY sync_date DESC 
            LIMIT 1
        ");
        $stats['last_sync'] = $stmt->fetch();
        
        return $stats;
    }
}

// Utilisation si appelé directement
if (php_sapi_name() === 'cli' || basename($_SERVER['PHP_SELF']) === basename(__FILE__)) {
    
    try {
        $sync = new SpiderVOSync();
        
        // Utiliser fichier local pour test, sinon URL Spider-VO
        $xmlFile = __DIR__ . '/../../export.xml';
        
        echo "🚀 Démarrage synchronisation Spider-VO...\n";
        
        $results = $sync->syncFromXML(file_exists($xmlFile) ? $xmlFile : null);
        
        echo "✅ Synchronisation terminée:\n";
        echo "   - Véhicules traités: {$results['processed']}\n";
        echo "   - Nouveaux: {$results['added']}\n"; 
        echo "   - Mis à jour: {$results['updated']}\n";
        echo "   - Retirés: {$results['removed']}\n";
        
        // Afficher statistiques
        $stats = $sync->getStats();
        echo "\n📊 Statistiques stock:\n";
        echo "   - Total véhicules: {$stats['total']}\n";
        
        foreach ($stats['by_status'] as $status) {
            echo "   - {$status['etat']}: {$status['count']}\n";
        }
        
    } catch (Exception $e) {
        echo "❌ Erreur: " . $e->getMessage() . "\n";
        exit(1);
    }
}

?>

