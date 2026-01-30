<?php
/**
 * Page de diagnostic complète pour JDC Auto
 * Affiche toutes les informations système et erreurs PHP
 */

// Activer l'affichage des erreurs
error_reporting(E_ALL);
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);

header('Content-Type: text/html; charset=utf-8');
?>
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>🔍 Diagnostic JDC Auto</title>
    <style>
        body {
            font-family: 'Courier New', monospace;
            max-width: 1200px;
            margin: 20px auto;
            padding: 20px;
            background: #1a1a1a;
            color: #e0e0e0;
            line-height: 1.6;
        }
        h1 { color: #4ade80; }
        h2 { color: #60a5fa; margin-top: 30px; border-bottom: 2px solid #3b82f6; padding-bottom: 10px; }
        .success { color: #4ade80; }
        .error { color: #f87171; }
        .warning { color: #fbbf24; }
        .info { color: #60a5fa; }
        pre {
            background: #2d2d2d;
            padding: 15px;
            border-radius: 5px;
            overflow-x: auto;
            border-left: 4px solid #3b82f6;
        }
        .section {
            background: #252525;
            padding: 20px;
            margin: 20px 0;
            border-radius: 8px;
            border: 1px solid #404040;
        }
        table {
            width: 100%;
            border-collapse: collapse;
            margin: 15px 0;
        }
        th, td {
            padding: 10px;
            text-align: left;
            border-bottom: 1px solid #404040;
        }
        th {
            background: #1e3a8a;
            color: #e0e0e0;
        }
        .test-result {
            padding: 10px;
            margin: 10px 0;
            border-radius: 5px;
        }
        .test-ok { background: #065f46; }
        .test-fail { background: #7f1d1d; }
    </style>
</head>
<body>
    <h1>🔍 Diagnostic Complet - JDC Auto</h1>
    <p class="info">Page générée le <?php echo date('Y-m-d H:i:s'); ?></p>

    <!-- 1. Informations PHP -->
    <div class="section">
        <h2>📋 Informations PHP</h2>
        <table>
            <tr><th>Paramètre</th><th>Valeur</th></tr>
            <tr><td>Version PHP</td><td class="info"><?php echo phpversion(); ?></td></tr>
            <tr><td>Serveur</td><td><?php echo $_SERVER['SERVER_SOFTWARE'] ?? 'N/A'; ?></td></tr>
            <tr><td>Document Root</td><td><?php echo $_SERVER['DOCUMENT_ROOT'] ?? 'N/A'; ?></td></tr>
            <tr><td>Script Path</td><td><?php echo __FILE__; ?></td></tr>
            <tr><td>Working Directory</td><td><?php echo getcwd(); ?></td></tr>
        </table>
    </div>

    <!-- 2. Extensions PHP -->
    <div class="section">
        <h2>🔌 Extensions PHP</h2>
        <?php
        $required = ['pdo', 'pdo_mysql', 'xml', 'json', 'mbstring'];
        echo "<table><tr><th>Extension</th><th>Status</th></tr>";
        foreach ($required as $ext) {
            $loaded = extension_loaded($ext);
            $status = $loaded ? '<span class="success">✅ Chargée</span>' : '<span class="error">❌ Manquante</span>';
            echo "<tr><td>$ext</td><td>$status</td></tr>";
        }
        echo "</table>";
        ?>
    </div>

    <!-- 3. Structure des fichiers -->
    <div class="section">
        <h2>📁 Structure des fichiers</h2>
        <?php
        $files = [
            'api/index.php' => 'API principale',
            'api/config/database.php' => 'Config base de données',
            'install/setup.php' => 'Script installation',
            'config/mysql_gandi.php' => 'Config MySQL Gandi',
            'export.xml' => 'Fichier XML Spider-VO',
            '../export.xml' => 'Fichier XML (niveau parent)'
        ];
        
        echo "<table><tr><th>Fichier</th><th>Description</th><th>Status</th></tr>";
        foreach ($files as $file => $desc) {
            $fullPath = __DIR__ . '/' . $file;
            $exists = file_exists($fullPath);
            $status = $exists 
                ? '<span class="success">✅ Existe</span>' 
                : '<span class="error">❌ Manquant</span>';
            $size = $exists ? ' (' . number_format(filesize($fullPath)) . ' bytes)' : '';
            echo "<tr><td>$file</td><td>$desc</td><td>$status$size</td></tr>";
        }
        echo "</table>";
        ?>
    </div>

    <!-- 4. Test connexion MySQL -->
    <div class="section">
        <h2>🗄️ Test Connexion MySQL</h2>
        <?php
        $configs = [
            ['host' => 'localhost', 'db' => 'jdcauto', 'user' => 'root', 'pass' => ''],
            ['host' => '127.0.0.1', 'db' => 'jdcauto', 'user' => 'root', 'pass' => ''],
        ];
        
        foreach ($configs as $config) {
            echo "<h3>Test: {$config['host']} / {$config['db']}</h3>";
            try {
                // Test sans base d'abord
                $dsn = "mysql:host={$config['host']};charset=utf8mb4";
                $pdo = new PDO($dsn, $config['user'], $config['pass'], [
                    PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                    PDO::ATTR_TIMEOUT => 5
                ]);
                
                echo "<div class='test-result test-ok'>✅ Connexion MySQL réussie (sans base)</div>";
                
                // Lister les bases disponibles
                $stmt = $pdo->query("SHOW DATABASES");
                $databases = $stmt->fetchAll(PDO::FETCH_COLUMN);
                echo "<p class='info'>Bases disponibles: " . implode(', ', $databases) . "</p>";
                
                // Tester avec la base
                if (in_array($config['db'], $databases)) {
                    $dsn2 = "mysql:host={$config['host']};dbname={$config['db']};charset=utf8mb4";
                    $pdo2 = new PDO($dsn2, $config['user'], $config['pass'], [
                        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION
                    ]);
                    echo "<div class='test-result test-ok'>✅ Connexion à la base '{$config['db']}' réussie</div>";
                    
                    // Compter les tables
                    $stmt = $pdo2->query("SHOW TABLES");
                    $tables = $stmt->fetchAll(PDO::FETCH_COLUMN);
                    echo "<p class='info'>Tables existantes: " . (count($tables) > 0 ? implode(', ', $tables) : 'Aucune') . "</p>";
                } else {
                    echo "<div class='test-result test-fail'>⚠️ Base '{$config['db']}' n'existe pas encore</div>";
                }
                
            } catch (PDOException $e) {
                echo "<div class='test-result test-fail'>❌ Erreur: " . htmlspecialchars($e->getMessage()) . "</div>";
            } catch (Exception $e) {
                echo "<div class='test-result test-fail'>❌ Erreur: " . htmlspecialchars($e->getMessage()) . "</div>";
            }
        }
        ?>
    </div>

    <!-- 5. Test parsing XML -->
    <div class="section">
        <h2>📄 Test Parsing XML</h2>
        <?php
        $xmlFiles = [
            __DIR__ . '/export.xml',
            __DIR__ . '/../export.xml',
            dirname(__DIR__) . '/export.xml'
        ];
        
        foreach ($xmlFiles as $xmlFile) {
            if (file_exists($xmlFile)) {
                echo "<p class='success'>✅ Fichier trouvé: $xmlFile</p>";
                echo "<p class='info'>Taille: " . number_format(filesize($xmlFile)) . " bytes</p>";
                
                try {
                    libxml_use_internal_errors(true);
                    $xml = simplexml_load_file($xmlFile);
                    
                    if ($xml === false) {
                        echo "<p class='error'>❌ Erreur parsing XML:</p>";
                        foreach (libxml_get_errors() as $error) {
                            echo "<pre>" . htmlspecialchars($error->message) . "</pre>";
                        }
                    } else {
                        echo "<p class='success'>✅ XML valide et parsable</p>";
                        if (isset($xml->vehicule)) {
                            echo "<p class='info'>Véhicules trouvés: " . count($xml->vehicule) . "</p>";
                        }
                    }
                } catch (Exception $e) {
                    echo "<p class='error'>❌ Exception: " . htmlspecialchars($e->getMessage()) . "</p>";
                }
                break;
            }
        }
        
        if (!file_exists($xmlFiles[0]) && !file_exists($xmlFiles[1]) && !file_exists($xmlFiles[2])) {
            echo "<p class='error'>❌ Aucun fichier export.xml trouvé</p>";
        }
        ?>
    </div>

    <!-- 6. Test API -->
    <div class="section">
        <h2>🔌 Test API</h2>
        <?php
        $apiFile = __DIR__ . '/api/index.php';
        if (file_exists($apiFile)) {
            echo "<p class='success'>✅ Fichier API trouvé</p>";
            
            // Essayer d'inclure et voir les erreurs
            ob_start();
            try {
                // Simuler une requête
                $_GET['action'] = 'test';
                include $apiFile;
                $output = ob_get_clean();
                echo "<p class='info'>Sortie API:</p><pre>" . htmlspecialchars(substr($output, 0, 500)) . "</pre>";
            } catch (Throwable $e) {
                ob_end_clean();
                echo "<p class='error'>❌ Erreur lors du chargement de l'API:</p>";
                echo "<pre>" . htmlspecialchars($e->getMessage()) . "\n" . htmlspecialchars($e->getTraceAsString()) . "</pre>";
            }
        } else {
            echo "<p class='error'>❌ Fichier API non trouvé: $apiFile</p>";
        }
        ?>
    </div>

    <!-- 7. Permissions fichiers -->
    <div class="section">
        <h2>🔐 Permissions</h2>
        <?php
        $dirs = [__DIR__, __DIR__ . '/api', __DIR__ . '/install', __DIR__ . '/config'];
        echo "<table><tr><th>Dossier</th><th>Lisible</th><th>Écriture</th><th>Permissions</th></tr>";
        foreach ($dirs as $dir) {
            if (is_dir($dir)) {
                $readable = is_readable($dir) ? '<span class="success">✅</span>' : '<span class="error">❌</span>';
                $writable = is_writable($dir) ? '<span class="success">✅</span>' : '<span class="error">❌</span>';
                $perms = substr(sprintf('%o', fileperms($dir)), -4);
                echo "<tr><td>$dir</td><td>$readable</td><td>$writable</td><td>$perms</td></tr>";
            }
        }
        echo "</table>";
        ?>
    </div>

    <!-- 8. Variables d'environnement -->
    <div class="section">
        <h2>🌍 Variables d'environnement</h2>
        <pre><?php
        $envVars = ['DB_HOST', 'DB_NAME', 'DB_USER', 'DB_PASS', 'MYSQL_HOST', 'MYSQL_DATABASE'];
        foreach ($envVars as $var) {
            $value = getenv($var);
            if ($value !== false) {
                echo "$var = " . ($var === 'DB_PASS' || $var === 'DB_PASS' ? '***' : $value) . "\n";
            }
        }
        ?></pre>
    </div>

    <div class="section">
        <h2>📝 Actions recommandées</h2>
        <ol>
            <li>Vérifier que MySQL est activé dans votre hébergement Gandi</li>
            <li>Créer la base de données <code>jdcauto</code> si elle n'existe pas</li>
            <li>Vérifier que le fichier <code>export.xml</code> est bien déployé</li>
            <li>Exécuter <a href="install/setup.php" style="color: #60a5fa;">install/setup.php</a> pour initialiser la base</li>
        </ol>
    </div>

</body>
</html>


