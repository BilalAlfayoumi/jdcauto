<?php
/**
 * Sauvegarde complète de la base MySQL (dump SQL gzippé).
 * - CLI : php db_backup.php > backup.sql.gz
 * - HTTP : GET /sync/db_backup.php avec header X-Backup-Token (ou ?token=)
 *
 * Le token est lu depuis htdocs/config/backup_token.local.php (non versionné).
 * Sans ce fichier, l'accès HTTP est refusé — jamais de token par défaut,
 * car le dump contient des données sensibles (contacts, logs admin).
 */

$isCLI = php_sapi_name() === 'cli';

if (!$isCLI) {
    $tokenFile = __DIR__ . '/../config/backup_token.local.php';
    $backupToken = '';
    if (file_exists($tokenFile)) {
        $loaded = require $tokenFile;
        if (is_string($loaded)) {
            $backupToken = $loaded;
        } elseif (is_array($loaded) && isset($loaded['token'])) {
            $backupToken = (string)$loaded['token'];
        }
    }
    if ($backupToken === '') {
        $backupToken = (string)getenv('BACKUP_SECRET_TOKEN');
    }

    if ($backupToken === '') {
        http_response_code(503);
        header('Content-Type: text/plain');
        exit('Backup non configuré (token absent)');
    }

    $providedToken = $_SERVER['HTTP_X_BACKUP_TOKEN'] ?? ($_GET['token'] ?? '');
    if (!hash_equals($backupToken, (string)$providedToken)) {
        http_response_code(403);
        header('Content-Type: text/plain');
        exit('Access denied');
    }
}

// Configuration DB : même logique que spider_vo_sync.php
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

if (shouldUseEnvironmentDbConfig()) {
    $dbHost = getenv('DB_HOST') ?: 'localhost';
    $dbName = getenv('DB_NAME') ?: 'jdcauto';
    $dbUser = getenv('DB_USER') ?: 'root';
    $dbPass = getenv('DB_PASSWORD') ?: '';
} else {
    $dbHost = 'localhost';
    $dbName = 'jdcauto';
    $dbUser = 'root';
    $dbPass = '';
}

try {
    $pdo = new PDO(
        "mysql:host=$dbHost;dbname=$dbName;charset=utf8mb4",
        $dbUser,
        $dbPass,
        [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION]
    );
} catch (PDOException $e) {
    if (!$isCLI) {
        http_response_code(500);
        header('Content-Type: text/plain');
    }
    exit('Erreur connexion base de données');
}

$lines = [];
$lines[] = "-- JDC Auto - Sauvegarde base `$dbName`";
$lines[] = "-- Date: " . date('Y-m-d H:i:s');
$lines[] = "SET NAMES utf8mb4;";
$lines[] = "SET FOREIGN_KEY_CHECKS=0;";
$lines[] = "";

$tables = $pdo->query("SHOW TABLES")->fetchAll(PDO::FETCH_COLUMN);

foreach ($tables as $table) {
    $createRow = $pdo->query("SHOW CREATE TABLE `$table`")->fetch(PDO::FETCH_NUM);
    $lines[] = "DROP TABLE IF EXISTS `$table`;";
    $lines[] = $createRow[1] . ";";
    $lines[] = "";

    $stmt = $pdo->query("SELECT * FROM `$table`");
    $batch = [];
    $columns = null;

    while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
        if ($columns === null) {
            $columns = '`' . implode('`, `', array_keys($row)) . '`';
        }
        $values = array_map(function ($value) use ($pdo) {
            if ($value === null) {
                return 'NULL';
            }
            return $pdo->quote((string)$value);
        }, array_values($row));
        $batch[] = '(' . implode(', ', $values) . ')';

        // Insertions par paquets de 100 lignes pour limiter la taille des requêtes
        if (count($batch) >= 100) {
            $lines[] = "INSERT INTO `$table` ($columns) VALUES\n" . implode(",\n", $batch) . ";";
            $batch = [];
        }
    }

    if (!empty($batch)) {
        $lines[] = "INSERT INTO `$table` ($columns) VALUES\n" . implode(",\n", $batch) . ";";
    }
    $lines[] = "";
}

$lines[] = "SET FOREIGN_KEY_CHECKS=1;";
$lines[] = "-- Fin de la sauvegarde (" . count($tables) . " tables)";

$sql = implode("\n", $lines);
$gz = gzencode($sql, 9);

if (!$isCLI) {
    header('Content-Type: application/gzip');
    header('Content-Disposition: attachment; filename="jdcauto-db-' . date('Y-m-d-His') . '.sql.gz"');
    header('Content-Length: ' . strlen($gz));
}

echo $gz;
