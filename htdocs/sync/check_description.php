<?php
/**
 * Script pour vérifier le contenu exact de la description dans Spider-VO XML
 * Compare avec ce qui est dans la base de données
 */

$host = 'localhost';
$dbname = 'jdcauto';
$username = 'root';
$password = '';

header('Content-Type: text/html; charset=utf-8');
?>
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <title>Vérification Description Spider-VO</title>
    <style>
        body { font-family: monospace; max-width: 1400px; margin: 20px auto; padding: 20px; background: #f3f4f6; }
        .container { background: white; padding: 30px; border-radius: 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
        h1 { color: #dc2626; }
        h2 { color: #059669; margin-top: 30px; border-bottom: 2px solid #059669; padding-bottom: 10px; }
        .section { margin: 20px 0; padding: 20px; background: #f9fafb; border-left: 4px solid #dc2626; }
        .description-box { 
            background: #1f2937; 
            color: #f9fafb; 
            padding: 20px; 
            border-radius: 8px; 
            white-space: pre-wrap; 
            font-family: 'Courier New', monospace;
            font-size: 13px;
            line-height: 1.6;
            max-height: 600px;
            overflow-y: auto;
        }
        .success { color: #059669; font-weight: bold; }
        .error { color: #dc2626; font-weight: bold; }
        .info { color: #0284c7; }
        .warning { color: #f59e0b; }
        table { width: 100%; border-collapse: collapse; margin: 20px 0; }
        th, td { padding: 12px; text-align: left; border: 1px solid #e5e7eb; }
        th { background: #dc2626; color: white; }
        .diff { background: #fef3c7; }
    </style>
</head>
<body>
    <div class="container">
        <h1>🔍 Vérification Description Spider-VO</h1>
        
        <?php
        try {
            $pdo = new PDO(
                "mysql:host=$host;dbname=$dbname;charset=utf8mb4",
                $username,
                $password,
                [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION]
            );
            echo '<p class="success">✅ Connexion à la base de données réussie</p>';
        } catch (PDOException $e) {
            echo '<p class="error">❌ Erreur connexion: ' . htmlspecialchars($e->getMessage()) . '</p></body></html>';
            exit;
        }
        
        // URL Spider-VO
        $spiderVoXmlUrl = 'https://www.spider-vo.net/export,st2div6b0860458b-fbb07722e1-03df2748e1-6e82247ae0.html';
        
        echo '<div class="section">';
        echo '<h2>📥 Chargement XML depuis Spider-VO</h2>';
        
        $context = stream_context_create([
            'http' => [
                'timeout' => 300,
                'user_agent' => 'JDC-Auto-Check/1.0',
                'method' => 'GET'
            ]
        ]);
        
        $xmlContent = @file_get_contents($spiderVoXmlUrl, false, $context);
        
        if ($xmlContent === false) {
            echo '<p class="error">❌ Impossible de charger le flux XML depuis Spider-VO</p>';
            exit;
        }
        
        $xml = @simplexml_load_string($xmlContent);
        if (!$xml) {
            echo '<p class="error">❌ Erreur parsing XML</p>';
            exit;
        }
        
        echo '<p class="success">✅ XML chargé avec succès (' . number_format(strlen($xmlContent)) . ' bytes)</p>';
        
        // Fonction helper pour extraire CDATA
        $getCdata = function($element) {
            if ($element === null) return null;
            $dom = new DOMDocument();
            $dom->loadXML($element->asXML());
            return trim($dom->textContent);
        };
        
        // Trouver FIAT DUCATO
        $vehicles = isset($xml->vehicules) ? $xml->vehicules->vehicule : $xml->vehicule;
        $fiatDucato = null;
        
        foreach ($vehicles as $v) {
            $marque = $getCdata($v->marque);
            $modele = $getCdata($v->modele);
            if (strtoupper($marque) === 'FIAT' && strtoupper($modele) === 'DUCATO') {
                $fiatDucato = $v;
                break;
            }
        }
        
        if (!$fiatDucato) {
            echo '<p class="error">❌ FIAT DUCATO non trouvé dans le XML</p>';
            echo '<p class="info">Véhicules disponibles:</p><ul>';
            $count = 0;
            foreach ($vehicles as $v) {
                if ($count++ > 10) break;
                echo '<li>' . htmlspecialchars($getCdata($v->marque) . ' ' . $getCdata($v->modele)) . '</li>';
            }
            echo '</ul></div></body></html>';
            exit;
        }
        
        $reference = $getCdata($fiatDucato->reference);
        echo '<p class="success">✅ FIAT DUCATO trouvé (Référence: ' . htmlspecialchars($reference) . ')</p>';
        echo '</div>';
        
        // Description depuis XML
        echo '<div class="section">';
        echo '<h2>📄 Description dans XML Spider-VO (BRUTE)</h2>';
        $descriptionXML = $getCdata($fiatDucato->description);
        echo '<p class="info">Longueur: ' . strlen($descriptionXML) . ' caractères</p>';
        echo '<div class="description-box">' . htmlspecialchars($descriptionXML) . '</div>';
        echo '</div>';
        
        // Description après nettoyage (comme dans l'import)
        echo '<div class="section">';
        echo '<h2>🧹 Description après nettoyage (comme import)</h2>';
        $descriptionCleaned = $descriptionXML;
        if ($descriptionCleaned) {
            $descriptionCleaned = preg_replace('/<br\s*\/?>/i', "\n", $descriptionCleaned);
            $descriptionCleaned = preg_replace('/<\/p>/i', "\n", $descriptionCleaned);
            $descriptionCleaned = preg_replace('/<p[^>]*>/i', "", $descriptionCleaned);
            $descriptionCleaned = preg_replace('/<\/div>/i', "\n", $descriptionCleaned);
            $descriptionCleaned = preg_replace('/<div[^>]*>/i', "", $descriptionCleaned);
            $descriptionCleaned = strip_tags($descriptionCleaned);
            $descriptionCleaned = preg_replace('/\n{3,}/', "\n\n", $descriptionCleaned);
            $descriptionCleaned = preg_replace('/[ \t]+/m', ' ', $descriptionCleaned);
            $descriptionCleaned = preg_replace('/^[ \t]+/m', '', $descriptionCleaned);
            $descriptionCleaned = preg_replace('/[ \t]+$/m', '', $descriptionCleaned);
            $descriptionCleaned = trim($descriptionCleaned);
        }
        echo '<p class="info">Longueur: ' . strlen($descriptionCleaned) . ' caractères</p>';
        echo '<div class="description-box">' . htmlspecialchars($descriptionCleaned) . '</div>';
        echo '</div>';
        
        // Description dans la base de données
        echo '<div class="section">';
        echo '<h2>💾 Description dans la base de données</h2>';
        $stmt = $pdo->prepare("SELECT description FROM vehicles WHERE reference = ?");
        $stmt->execute([$reference]);
        $dbVehicle = $stmt->fetch();
        
        if ($dbVehicle) {
            $descriptionDB = $dbVehicle['description'];
            echo '<p class="info">Longueur: ' . strlen($descriptionDB) . ' caractères</p>';
            echo '<div class="description-box">' . htmlspecialchars($descriptionDB) . '</div>';
            
            // Comparaison
            if ($descriptionDB === $descriptionCleaned) {
                echo '<p class="success">✅ Les descriptions correspondent parfaitement</p>';
            } else {
                echo '<p class="warning">⚠️ Différences détectées entre XML nettoyé et base de données</p>';
                echo '<p class="info">Différence de longueur: ' . abs(strlen($descriptionDB) - strlen($descriptionCleaned)) . ' caractères</p>';
            }
        } else {
            echo '<p class="error">❌ Véhicule non trouvé dans la base de données</p>';
        }
        echo '</div>';
        
        // Vérifier si PRIX HT/TTC et ÉQUIPEMENTS sont dans la description XML
        echo '<div class="section">';
        echo '<h2>🔎 Recherche mots-clés dans description XML</h2>';
        $keywords = ['PRIX HT', 'PRIX TTC', 'OPTIONS', 'ÉQUIPEMENTS', 'EQUIPEMENTS', 'Audio', 'Conduite', 'Extérieur', 'Intérieur', 'Sécurité'];
        echo '<table>';
        echo '<tr><th>Mot-clé</th><th>Présent</th><th>Position</th></tr>';
        foreach ($keywords as $keyword) {
            $pos = stripos($descriptionXML, $keyword);
            $found = $pos !== false;
            $color = $found ? 'success' : 'error';
            $text = $found ? '✅ Oui' : '❌ Non';
            echo '<tr>';
            echo '<td><strong>' . htmlspecialchars($keyword) . '</strong></td>';
            echo '<td class="' . $color . '">' . $text . '</td>';
            echo '<td>' . ($found ? 'Position ' . $pos : '-') . '</td>';
            echo '</tr>';
        }
        echo '</table>';
        echo '</div>';
        
        // Afficher les autres champs du véhicule
        echo '<div class="section">';
        echo '<h2>📋 Autres informations du véhicule (XML)</h2>';
        echo '<table>';
        echo '<tr><th>Champ</th><th>Valeur</th></tr>';
        $fields = ['reference', 'marque', 'modele', 'version', 'prix_vente', 'kilometrage', 'annee', 'energie', 'typeboite', 'carrosserie', 'etat', 'couleurexterieur', 'nbrplace', 'nbrporte', 'puissancedyn', 'puissance_fiscale', 'finition', 'date_mec'];
        foreach ($fields as $field) {
            $value = $getCdata($fiatDucato->$field);
            echo '<tr>';
            echo '<td><strong>' . htmlspecialchars($field) . '</strong></td>';
            echo '<td>' . htmlspecialchars($value ?: 'N/A') . '</td>';
            echo '</tr>';
        }
        echo '</table>';
        echo '</div>';
        
        ?>
        
        <div class="section">
            <h2>💡 Conclusion</h2>
            <p>Cette page permet de vérifier si les informations détaillées (PRIX HT/TTC, ÉQUIPEMENTS) sont présentes dans le XML Spider-VO ou si elles ont été ajoutées manuellement sur Le Bon Coin.</p>
            <p><strong>Si les mots-clés sont présents dans le XML :</strong> Les informations viennent de Spider-VO et peuvent être importées.</p>
            <p><strong>Si les mots-clés sont absents du XML :</strong> Les informations ont été ajoutées manuellement sur Le Bon Coin et ne sont pas disponibles via Spider-VO.</p>
        </div>
        
        <p><a href="/">🏠 Retour au site</a></p>
    </div>
</body>
</html>

