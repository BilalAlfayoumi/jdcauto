<?php
/**
 * Script pour vérifier les états des véhicules dans le flux Spider-VO et la base de données
 */

header('Content-Type: application/json');

require_once __DIR__ . '/../config/mysql_gandi.php';

$results = [
    'spider_vo_flux' => [],
    'database' => [],
    'analysis' => []
];

try {
    $pdo = GandiMySQL::connect();
    
    if (!$pdo) {
        throw new Exception('Impossible de se connecter à la base de données');
    }
    
    // 1. Vérifier les états dans la base de données
    $stmt = $pdo->query("SELECT etat, COUNT(*) as count FROM vehicles GROUP BY etat ORDER BY count DESC");
    $dbStates = $stmt->fetchAll(PDO::FETCH_ASSOC);
    $results['database'] = $dbStates;
    
    // 2. Charger le flux XML Spider-VO
    $spiderVoXmlUrl = 'https://www.spider-vo.net/export,st2div6b0860458b-fbb07722e1-03df2748e1-6e82247ae0.html';
    
    $context = stream_context_create([
        'http' => [
            'timeout' => 30,
            'user_agent' => 'JDC-Auto-Check/1.0',
            'method' => 'GET'
        ]
    ]);
    
    $xmlContent = @file_get_contents($spiderVoXmlUrl, false, $context);
    
    if ($xmlContent === false) {
        $results['spider_vo_flux']['error'] = 'Impossible de charger le flux XML Spider-VO';
    } else {
        $xml = @simplexml_load_string($xmlContent);
        
        if ($xml) {
            // Compter les véhicules par état dans le flux XML
            $statesInXml = [];
            
            // Fonction helper pour extraire CDATA
            $getCdata = function($element) {
                if ($element === null) return null;
                $dom = new DOMDocument();
                $dom->loadXML($element->asXML());
                return trim($dom->textContent);
            };
            
            // Gérer les deux structures possibles
            if (isset($xml->vehicules)) {
                $vehicles = $xml->vehicules->vehicule ?? [];
            } else {
                $vehicles = $xml->vehicule ?? [];
            }
            
            foreach ($vehicles as $vehiculeXML) {
                $etat = $getCdata($vehiculeXML->etat);
                if (empty($etat)) {
                    $etat = 'Non spécifié';
                }
                
                if (!isset($statesInXml[$etat])) {
                    $statesInXml[$etat] = 0;
                }
                $statesInXml[$etat]++;
            }
            
            $results['spider_vo_flux']['total_vehicles'] = count($vehicles);
            $results['spider_vo_flux']['states'] = $statesInXml;
            
            // Exemples de véhicules par état (max 3 par état)
            $examples = [];
            foreach ($vehicles as $vehiculeXML) {
                $etat = $getCdata($vehiculeXML->etat);
                if (empty($etat)) {
                    $etat = 'Non spécifié';
                }
                
                if (!isset($examples[$etat]) || count($examples[$etat]) < 3) {
                    $reference = $getCdata($vehiculeXML->reference);
                    $marque = $getCdata($vehiculeXML->marque);
                    $modele = $getCdata($vehiculeXML->modele);
                    
                    if (!isset($examples[$etat])) {
                        $examples[$etat] = [];
                    }
                    
                    $examples[$etat][] = [
                        'reference' => $reference,
                        'marque' => $marque,
                        'modele' => $modele,
                        'etat' => $etat
                    ];
                }
            }
            
            $results['spider_vo_flux']['examples'] = $examples;
        } else {
            $results['spider_vo_flux']['error'] = 'Erreur parsing XML';
        }
    }
    
    // 3. Analyse
    $dbStatesList = array_column($dbStates, 'etat');
    $xmlStatesList = isset($results['spider_vo_flux']['states']) ? array_keys($results['spider_vo_flux']['states']) : [];
    
    $results['analysis'] = [
        'database_states' => $dbStatesList,
        'xml_states' => $xmlStatesList,
        'has_sold_in_db' => in_array('Vendu', $dbStatesList),
        'has_reserved_in_db' => in_array('Réservé', $dbStatesList),
        'has_sold_in_xml' => in_array('Vendu', $xmlStatesList),
        'has_reserved_in_xml' => in_array('Réservé', $xmlStatesList),
        'recommendation' => ''
    ];
    
    // Recommandation
    if (empty($xmlStatesList) || (count($xmlStatesList) === 1 && $xmlStatesList[0] === 'Disponible')) {
        $results['analysis']['recommendation'] = 'Le flux Spider-VO ne contient que des véhicules "Disponible". Spider-VO ne renvoie probablement que les véhicules disponibles dans leur flux XML. Les véhicules vendus/réservés ne sont pas inclus dans le flux.';
    } else {
        $results['analysis']['recommendation'] = 'Le flux Spider-VO contient des véhicules avec différents états. Le script de synchronisation devrait les importer correctement.';
    }
    
    echo json_encode($results, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);
    
} catch (Exception $e) {
    echo json_encode([
        'error' => $e->getMessage()
    ], JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);
}

