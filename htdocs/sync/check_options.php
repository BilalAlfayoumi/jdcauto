<?php
/**
 * Script de test pour vérifier les options/équipements dans le XML Spider-VO
 * Affiche tous les champs disponibles pour un véhicule, notamment les options
 */

header('Content-Type: text/html; charset=utf-8');
?>
<!DOCTYPE html>
<html>
<head>
    <title>🔍 Vérification Options Spider-VO</title>
    <style>
        body { font-family: monospace; max-width: 1400px; margin: 20px auto; padding: 20px; background: #f5f5f5; }
        .success { color: #059669; font-weight: bold; }
        .error { color: #dc2626; font-weight: bold; }
        .info { color: #0284c7; }
        .section { background: white; padding: 20px; margin: 20px 0; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
        h1 { color: #1f2937; }
        h2 { color: #374151; border-bottom: 2px solid #e5e7eb; padding-bottom: 10px; }
        table { width: 100%; border-collapse: collapse; margin: 15px 0; }
        th, td { border: 1px solid #e5e7eb; padding: 10px; text-align: left; }
        th { background: #f3f4f6; font-weight: bold; }
        .options-box { background: #f9fafb; padding: 15px; border-left: 4px solid #3b82f6; margin: 10px 0; white-space: pre-wrap; font-family: monospace; }
        .highlight { background: #fef3c7; padding: 2px 4px; border-radius: 3px; }
    </style>
</head>
<body>
    <h1>🔍 Vérification Options Spider-VO</h1>
    
<?php
// Configuration
$host = 'localhost';
$dbname = 'jdcauto';
$username = 'root';
$password = '';

// URL Spider-VO
$spiderVoXmlUrl = 'https://www.spider-vo.net/export,st2div6b0860458b-fbb07722e1-03df2748e1-6e82247ae0.html';
$xmlFile = __DIR__ . '/../../export.xml';

// Fonction helper pour extraire CDATA
$getCdata = function($element) {
    if ($element === null) return null;
    $dom = new DOMDocument();
    $dom->loadXML($element->asXML());
    return trim($dom->textContent);
};

try {
    // Connexion DB
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

// Charger XML
echo '<div class="section">';
echo '<h2>📥 Chargement XML depuis Spider-VO</h2>';

if (file_exists($xmlFile)) {
    echo '<p class="info">ℹ️ Utilisation du fichier local: export.xml</p>';
    $xml = @simplexml_load_file($xmlFile);
} else {
    echo '<p class="info">ℹ️ Chargement depuis URL Spider-VO...</p>';
    $context = stream_context_create([
        'http' => [
            'timeout' => 300,
            'user_agent' => 'JDC-Auto-Sync/1.0',
            'method' => 'GET'
        ]
    ]);
    
    $xmlContent = @file_get_contents($spiderVoXmlUrl, false, $context);
    
    if ($xmlContent === false) {
        echo '<p class="error">❌ Impossible de charger le flux XML depuis Spider-VO</p></div></body></html>';
        exit;
    }
    
    $xml = @simplexml_load_string($xmlContent);
}

if (!$xml) {
    echo '<p class="error">❌ Erreur parsing XML</p></div></body></html>';
    exit;
}

echo '<p class="success">✅ XML chargé avec succès</p>';
echo '</div>';

// Trouver un véhicule (DACIA SANDERO si possible, sinon le premier)
$vehicles = isset($xml->vehicules) ? $xml->vehicules->vehicule : $xml->vehicule;
$testVehicle = null;

foreach ($vehicles as $v) {
    $marque = $getCdata($v->marque);
    $modele = $getCdata($v->modele);
    if (strtoupper($marque) === 'DACIA' && strtoupper($modele) === 'SANDERO') {
        $testVehicle = $v;
        break;
    }
}

if (!$testVehicle && count($vehicles) > 0) {
    $testVehicle = $vehicles[0];
    echo '<p class="info">ℹ️ DACIA SANDERO non trouvé, utilisation du premier véhicule disponible</p>';
}

if (!$testVehicle) {
    echo '<p class="error">❌ Aucun véhicule trouvé dans le XML</p></body></html>';
    exit;
}

$reference = $getCdata($testVehicle->reference);
$marque = $getCdata($testVehicle->marque);
$modele = $getCdata($testVehicle->modele);

echo '<div class="section">';
echo '<h2>🚗 Véhicule de test</h2>';
echo '<p class="success">✅ Véhicule trouvé: <strong>' . htmlspecialchars($marque . ' ' . $modele) . '</strong> (Référence: ' . htmlspecialchars($reference) . ')</p>';
echo '</div>';

// Afficher TOUS les champs disponibles dans le XML
echo '<div class="section">';
echo '<h2>📋 Tous les champs disponibles dans le XML</h2>';
echo '<table>';
echo '<tr><th>Champ XML</th><th>Valeur</th><th>Type</th></tr>';

$optionsFound = false;
$equipementsFound = false;

foreach ($testVehicle->children() as $child) {
    $fieldName = $child->getName();
    $fieldValue = $getCdata($child);
    $isOption = false;
    
    // Détecter les champs liés aux options
    if (stripos($fieldName, 'option') !== false || 
        stripos($fieldName, 'equipement') !== false ||
        stripos($fieldName, 'equipment') !== false) {
        $isOption = true;
        $optionsFound = true;
        if (stripos($fieldName, 'equipement') !== false) {
            $equipementsFound = true;
        }
    }
    
    $rowClass = $isOption ? 'style="background: #fef3c7;"' : '';
    $highlight = $isOption ? '<span class="highlight">OPTION</span>' : '';
    
    echo '<tr ' . $rowClass . '>';
    echo '<td><strong>' . htmlspecialchars($fieldName) . '</strong> ' . $highlight . '</td>';
    echo '<td>' . htmlspecialchars($fieldValue ?: 'N/A') . '</td>';
    echo '<td>' . (strlen($fieldValue) > 100 ? 'Long (' . strlen($fieldValue) . ' chars)' : 'Court') . '</td>';
    echo '</tr>';
}

echo '</table>';
echo '</div>';

// Recherche spécifique des options
echo '<div class="section">';
echo '<h2>🔎 Recherche spécifique: Options/Équipements</h2>';

$optionFields = [];
foreach ($testVehicle->children() as $child) {
    $fieldName = $child->getName();
    $fieldValue = $getCdata($child);
    
    if (stripos($fieldName, 'option') !== false || 
        stripos($fieldName, 'equipement') !== false ||
        stripos($fieldName, 'equipment') !== false) {
        $optionFields[$fieldName] = $fieldValue;
    }
}

if (count($optionFields) > 0) {
    echo '<p class="success">✅ ' . count($optionFields) . ' champ(s) d\'options trouvé(s):</p>';
    foreach ($optionFields as $fieldName => $fieldValue) {
        echo '<div class="options-box">';
        echo '<strong>' . htmlspecialchars($fieldName) . ':</strong><br>';
        echo htmlspecialchars($fieldValue);
        echo '</div>';
    }
} else {
    echo '<p class="error">❌ Aucun champ d\'options trouvé avec les noms: option, equipement, equipment</p>';
    echo '<p class="info">ℹ️ Les options pourraient être dans un autre champ ou format</p>';
}

echo '</div>';

// Vérifier la structure XML complète
echo '<div class="section">';
echo '<h2>🔬 Structure XML complète (premiers niveaux)</h2>';
echo '<pre style="background: #f9fafb; padding: 15px; border-radius: 5px; overflow-x: auto;">';
echo htmlspecialchars($testVehicle->asXML());
echo '</pre>';
echo '</div>';

// Vérifier si les options sont dans un sous-élément
echo '<div class="section">';
echo '<h2>🌳 Structure hiérarchique (sous-éléments)</h2>';

$hasSubElements = false;
foreach ($testVehicle->children() as $child) {
    if ($child->children()->count() > 0) {
        $hasSubElements = true;
        echo '<div style="margin: 10px 0; padding: 10px; background: #f9fafb; border-left: 4px solid #3b82f6;">';
        echo '<strong>' . htmlspecialchars($child->getName()) . '</strong> (contient ' . $child->children()->count() . ' sous-éléments):<br>';
        echo '<pre style="margin-top: 10px; font-size: 11px;">' . htmlspecialchars($child->asXML()) . '</pre>';
        echo '</div>';
    }
}

if (!$hasSubElements) {
    echo '<p class="info">ℹ️ Aucun sous-élément trouvé (structure plate)</p>';
}

echo '</div>';

// Conclusion
echo '<div class="section">';
echo '<h2>💡 Conclusion</h2>';

if ($optionsFound || $equipementsFound) {
    echo '<p class="success">✅ Des champs d\'options ont été trouvés dans le XML!</p>';
    echo '<p class="info">ℹ️ Il faut maintenant modifier <code>spider_vo_sync.php</code> pour extraire ces champs.</p>';
} else {
    echo '<p class="error">❌ Aucun champ d\'options trouvé avec les noms standards.</p>';
    echo '<p class="info">ℹ️ Les options pourraient être:</p>';
    echo '<ul>';
    echo '<li>Dans un champ avec un nom différent (vérifiez le tableau ci-dessus)</li>';
    echo '<li>Dans un sous-élément XML (vérifiez la structure hiérarchique)</li>';
    echo '<li>Dans la description (format texte libre)</li>';
    echo '</ul>';
}

echo '</div>';

echo '<p><a href="/">🏠 Retour au site</a></p>';
echo '</body></html>';
?>

