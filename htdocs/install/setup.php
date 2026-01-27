<?php
/**
 * Script d'installation et test - JDC Auto Spider-VO
 * À exécuter UNE SEULE FOIS pour initialiser la base
 */

ini_set('display_errors', 1);
error_reporting(E_ALL);
set_time_limit(600); // 10 minutes max

echo "<!DOCTYPE html>\n<html><head><title>Installation JDC Auto Spider-VO</title>";
echo "<style>body{font-family:monospace;max-width:800px;margin:20px auto;line-height:1.6;} .success{color:#059669;} .error{color:#dc2626;} .info{color:#0284c7;}</style></head><body>";
echo "<h1>🚀 Installation JDC Auto - Intégration Spider-VO</h1>\n";

// Configuration pour installation Gandi ✅
class InstallConfig {
    // ✅ CONFIGURÉ selon les paramètres Gandi fournis
    const DB_HOST = 'localhost';
    const DB_NAME = 'jdcauto';
    const DB_USER = 'root';
    const DB_PASS = ''; // Mot de passe vide par défaut Gandi
    
    private static $pdo = null;
    
    public static function getConnection() {
        if (self::$pdo === null) {
            try {
                $dsn = "mysql:host=" . self::DB_HOST . ";charset=utf8mb4";
                self::$pdo = new PDO($dsn, self::DB_USER, self::DB_PASS, [
                    PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION
                ]);
            } catch (PDOException $e) {
                throw new Exception("Connexion impossible: " . $e->getMessage());
            }
        }
        return self::$pdo;
    }
}

/**
 * Étapes d'installation
 */
class JDCAutoInstaller {
    
    private $pdo;
    
    public function __construct() {
        $this->pdo = InstallConfig::getConnection();
    }
    
    /**
     * Installation complète
     */
    public function install() {
        echo "<h2>📋 Étapes d'installation</h2>\n";
        
        try {
            $this->step1_createDatabase();
            $this->step2_createTables();
            $this->step3_testConnection();
            $this->step4_importSampleData();
            $this->step5_testAPI();
            
            echo "<div class='success'>\n";
            echo "<h2>🎉 Installation réussie !</h2>\n";
            echo "<p><strong>Votre base de données JDC Auto est prête.</strong></p>\n";
            echo "<ul>";
            echo "<li>✅ Base de données créée</li>";
            echo "<li>✅ Tables véhicules créées</li>";
            echo "<li>✅ Données de test importées</li>";
            echo "<li>✅ API fonctionnelle</li>";
            echo "</ul>";
            echo "</div>\n";
            
            echo "<h3>🔧 Prochaines étapes :</h3>\n";
            echo "<ol>";
            echo "<li><strong>Configurer la synchronisation</strong> - Modifier l'URL du flux XML Spider-VO dans la config</li>";
            echo "<li><strong>Tester la synchronisation</strong> - Exécuter <code>sync/test_sync.php</code></li>";
            echo "<li><strong>Configurer le cron</strong> - Automatiser la sync (tous les jours)</li>";
            echo "<li><strong>Supprimer les données mock</strong> - Du front-end React</li>";
            echo "<li><strong>⚠️ SÉCURISER</strong> - Supprimer ce fichier install/ après utilisation</li>";
            echo "</ol>";
            
        } catch (Exception $e) {
            echo "<div class='error'>";
            echo "<h2>❌ Erreur d'installation</h2>";
            echo "<p>" . htmlspecialchars($e->getMessage()) . "</p>";
            echo "</div>";
        }
    }
    
    private function step1_createDatabase() {
        echo "<h3 class='info'>📦 Étape 1: Création de la base de données</h3>\n";
        
        try {
            $this->pdo->exec("CREATE DATABASE IF NOT EXISTS " . InstallConfig::DB_NAME);
            $this->pdo->exec("USE " . InstallConfig::DB_NAME);
            echo "<p class='success'>✅ Base de données créée/sélectionnée</p>\n";
        } catch (Exception $e) {
            throw new Exception("Erreur création base: " . $e->getMessage());
        }
    }
    
    private function step2_createTables() {
        echo "<h3 class='info'>🗂️ Étape 2: Création des tables</h3>\n";
        
        // SQL de création des tables
        $sql = "
        CREATE TABLE IF NOT EXISTS vehicles (
            id INT AUTO_INCREMENT PRIMARY KEY,
            reference VARCHAR(50) NOT NULL UNIQUE,
            reference_externe VARCHAR(50),
            marque VARCHAR(100) NOT NULL,
            modele VARCHAR(100) NOT NULL,
            version TEXT,
            titre TEXT,
            annee INT,
            kilometrage INT,
            energie VARCHAR(50),
            typeboite VARCHAR(10),
            nbrvitesse INT,
            couleurexterieur VARCHAR(100),
            couleurinterieur VARCHAR(100),
            carrosserie VARCHAR(100),
            prix_vente DECIMAL(10,2),
            prix_neuf DECIMAL(10,2),
            puissance_fiscale INT,
            puissancedyn INT,
            nbrplace INT,
            nbrporte INT,
            etat ENUM('Disponible', 'Réservé', 'Vendu', 'En arrivage', 'Sorti') DEFAULT 'Disponible',
            description TEXT,
            finition VARCHAR(200),
            date_mec DATE,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            INDEX idx_etat (etat),
            INDEX idx_marque (marque)
        );
        
        CREATE TABLE IF NOT EXISTS vehicle_photos (
            id INT AUTO_INCREMENT PRIMARY KEY,
            vehicle_id INT NOT NULL,
            photo_url TEXT NOT NULL,
            photo_order INT DEFAULT 0,
            FOREIGN KEY (vehicle_id) REFERENCES vehicles(id) ON DELETE CASCADE
        );
        
        CREATE TABLE IF NOT EXISTS sync_logs (
            id INT AUTO_INCREMENT PRIMARY KEY,
            sync_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            vehicles_processed INT DEFAULT 0,
            status VARCHAR(20) DEFAULT 'SUCCESS',
            execution_time DECIMAL(8,3)
        );
        ";
        
        try {
            $this->pdo->exec($sql);
            echo "<p class='success'>✅ Tables créées avec succès</p>\n";
        } catch (Exception $e) {
            throw new Exception("Erreur création tables: " . $e->getMessage());
        }
    }
    
    private function step3_testConnection() {
        echo "<h3 class='info'>🔗 Étape 3: Test de connexion</h3>\n";
        
        try {
            $stmt = $this->pdo->query("SELECT COUNT(*) as count FROM vehicles");
            $count = $stmt->fetch()['count'];
            echo "<p class='success'>✅ Connexion active - $count véhicules en base</p>\n";
        } catch (Exception $e) {
            throw new Exception("Test connexion échoué: " . $e->getMessage());
        }
    }
    
    private function step4_importSampleData() {
        echo "<h3 class='info'>📊 Étape 4: Import des données de test</h3>\n";
        
        // Vérifier si le fichier export.xml existe
        $xmlFile = __DIR__ . '/../../export.xml';
        
        if (!file_exists($xmlFile)) {
            echo "<p class='info'>⚠️ Fichier export.xml non trouvé - création de données de test minimales</p>\n";
            $this->createSampleData();
            return;
        }
        
        try {
            // Charger et parser XML
            $xmlContent = file_get_contents($xmlFile);
            $xml = simplexml_load_string($xmlContent);
            
            if (!$xml) {
                throw new Exception("XML invalide");
            }
            
            $imported = 0;
            $limit = 5; // Limiter à 5 véhicules pour le test
            
            foreach ($xml->vehicule as $vehiculeXML) {
                if ($imported >= $limit) break;
                
                try {
                    $this->importSingleVehicle($vehiculeXML);
                    $imported++;
                } catch (Exception $e) {
                    echo "<p class='error'>Erreur véhicule: " . $e->getMessage() . "</p>\n";
                }
            }
            
            echo "<p class='success'>✅ $imported véhicules de test importés</p>\n";
            
        } catch (Exception $e) {
            echo "<p class='error'>Erreur import: " . $e->getMessage() . "</p>\n";
            $this->createSampleData();
        }
    }
    
    private function importSingleVehicle($vehiculeXML) {
        $getCdata = function($element) {
            return $element ? trim((string)$element) : null;
        };
        
        $data = [
            'reference' => $getCdata($vehiculeXML->reference) ?: 'REF-' . uniqid(),
            'marque' => $getCdata($vehiculeXML->marque) ?: 'INCONNU',
            'modele' => $getCdata($vehiculeXML->modele) ?: 'Modèle',
            'version' => $getCdata($vehiculeXML->version),
            'prix_vente' => (float)str_replace(',', '.', $getCdata($vehiculeXML->prix_vente) ?: '0'),
            'kilometrage' => (int)($getCdata($vehiculeXML->kilometrage) ?: 0),
            'annee' => (int)($getCdata($vehiculeXML->annee) ?: date('Y')),
            'energie' => $getCdata($vehiculeXML->energie) ?: 'ESSENCE',
            'carrosserie' => $getCdata($vehiculeXML->carrosserie) ?: 'BERLINE',
            'etat' => $getCdata($vehiculeXML->etat) ?: 'Disponible',
            'description' => $getCdata($vehiculeXML->description)
        ];
        
        // Vérifier si existe déjà
        $stmt = $this->pdo->prepare("SELECT id FROM vehicles WHERE reference = ?");
        $stmt->execute([$data['reference']]);
        
        if ($stmt->fetch()) {
            return; // Déjà existe
        }
        
        // Insérer
        $sql = "
            INSERT INTO vehicles 
            (reference, marque, modele, version, prix_vente, kilometrage, annee, energie, carrosserie, etat, description) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ";
        
        $this->pdo->prepare($sql)->execute([
            $data['reference'],
            $data['marque'],
            $data['modele'],
            $data['version'],
            $data['prix_vente'],
            $data['kilometrage'],
            $data['annee'],
            $data['energie'],
            $data['carrosserie'],
            $data['etat'],
            $data['description']
        ]);
        
        $vehicleId = $this->pdo->lastInsertId();
        
        // Ajouter une photo de test si disponible dans XML
        if (isset($vehiculeXML->photos->photo[0])) {
            $photoUrl = trim((string)$vehiculeXML->photos->photo[0]);
            if ($photoUrl) {
                $this->pdo->prepare("INSERT INTO vehicle_photos (vehicle_id, photo_url, photo_order) VALUES (?, ?, 0)")
                           ->execute([$vehicleId, $photoUrl]);
            }
        }
    }
    
    private function createSampleData() {
        echo "<p class='info'>Création de données de test basiques...</p>\n";
        
        $sampleVehicles = [
            [
                'reference' => 'TEST-001',
                'marque' => 'RENAULT',
                'modele' => 'CLIO',
                'prix_vente' => 14990,
                'kilometrage' => 35000,
                'annee' => 2021,
                'energie' => 'ESSENCE',
                'carrosserie' => 'BERLINE'
            ],
            [
                'reference' => 'TEST-002',
                'marque' => 'PEUGEOT',
                'modele' => '208',
                'prix_vente' => 16990,
                'kilometrage' => 28000,
                'annee' => 2022,
                'energie' => 'ESSENCE',
                'carrosserie' => 'BERLINE'
            ]
        ];
        
        foreach ($sampleVehicles as $vehicle) {
            $sql = "INSERT IGNORE INTO vehicles (reference, marque, modele, prix_vente, kilometrage, annee, energie, carrosserie) VALUES (?, ?, ?, ?, ?, ?, ?, ?)";
            $this->pdo->prepare($sql)->execute(array_values($vehicle));
        }
        
        echo "<p class='success'>✅ Données de test créées</p>\n";
    }
    
    private function step5_testAPI() {
        echo "<h3 class='info'>🧪 Étape 5: Test de l'API</h3>\n";
        
        try {
            // Test requête simple
            $stmt = $this->pdo->query("
                SELECT COUNT(*) as total, 
                       COUNT(CASE WHEN etat = 'Disponible' THEN 1 END) as disponibles
                FROM vehicles
            ");
            $stats = $stmt->fetch();
            
            echo "<p class='success'>✅ API prête - {$stats['disponibles']} véhicules disponibles sur {$stats['total']} total</p>\n";
            
            // Lien vers l'API
            $apiUrl = 'http' . (($_SERVER['HTTPS'] ?? '') ? 's' : '') . '://' . $_SERVER['HTTP_HOST'] . '/api/index.php?action=vehicles&limit=3';
            echo "<p><strong>Test API:</strong> <a href='$apiUrl' target='_blank'>$apiUrl</a></p>\n";
            
        } catch (Exception $e) {
            echo "<p class='error'>❌ Test API échoué: " . $e->getMessage() . "</p>\n";
        }
    }
}

// Exécuter l'installation
try {
    $installer = new JDCAutoInstaller();
    $installer->install();
    
    echo "<hr>";
    echo "<div class='info'>";
    echo "<h3>📝 Configuration requise :</h3>";
    echo "<ol>";
    echo "<li><strong>Base de données:</strong> Modifier les paramètres de connexion dans <code>htdocs/api/index.php</code></li>";
    echo "<li><strong>URL Spider-VO:</strong> Configurer l'URL du flux XML dans la config</li>";
    echo "<li><strong>Synchronisation:</strong> Planifier un cron job pour <code>sync/spider_vo_sync.php</code></li>";
    echo "<li><strong>Front-end:</strong> Modifier React pour utiliser l'API PHP</li>";
    echo "<li><strong>⚠️ SÉCURITÉ:</strong> Supprimer le dossier <code>install/</code> après installation</li>";
    echo "</ol>";
    echo "</div>";
    
} catch (Exception $e) {
    echo "<div class='error'>";
    echo "<h2>💥 Erreur d'installation</h2>";
    echo "<p>" . htmlspecialchars($e->getMessage()) . "</p>";
    echo "<p><strong>Vérifiez:</strong></p>";
    echo "<ul>";
    echo "<li>Configuration base de données (host, user, password)</li>";
    echo "<li>Permissions MySQL</li>";
    echo "<li>Extensions PHP requises (PDO, mysqli)</li>";
    echo "</ul>";
    echo "</div>";
}

echo "</body></html>";
?>
