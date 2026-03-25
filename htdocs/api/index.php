<?php
/**
 * Point d'entrée API JDC Auto
 * Déployé sur Gandi dans htdocs/api/
 */

// Configuration de base
error_reporting(E_ALL);
ini_set('display_errors', 0); // Désactiver en production
ini_set('log_errors', 1);
ini_set('session.use_strict_mode', '1');
ini_set('session.use_only_cookies', '1');
ini_set('session.cookie_httponly', '1');

if (session_status() === PHP_SESSION_NONE) {
    session_name('jdcauto_admin');
    session_start([
        'cookie_httponly' => true,
        'cookie_samesite' => 'Strict',
        'cookie_secure' => (
            (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off')
            || (isset($_SERVER['SERVER_PORT']) && (int)$_SERVER['SERVER_PORT'] === 443)
        ),
        'use_strict_mode' => true,
    ]);
}

// Auto-loader simple pour les classes (optionnel)
spl_autoload_register(function ($className) {
    $paths = [
        __DIR__ . '/classes/',
        __DIR__ . '/config/',
        __DIR__ . '/sync/'
    ];
    
    foreach ($paths as $path) {
        $file = $path . str_replace('\\', '/', $className) . '.php';
        if (file_exists($file)) {
            require_once $file;
            return;
        }
    }
});

// Note: Configuration base de données intégrée ci-dessous (pas besoin d'inclure)

/**
 * ============================================
 * CONFIGURATION EMAIL
 * ============================================
 * 
 * Choisissez UNE méthode ci-dessous et décommentez-la :
 * 
 * OPTION 1: SendGrid (RECOMMANDÉ - Gratuit 100/jour)
 * - Créez un compte sur https://sendgrid.com/free/
 * - Créez une clé API dans Settings → API Keys
 * - Décommentez les lignes ci-dessous et ajoutez votre clé
 */
// define('SENDGRID_API_KEY', 'SG.VOTRE_CLE_API_ICI');
// define('SENDGRID_FROM_EMAIL', 'contact@jdcauto.fr');
// define('SENDGRID_FROM_NAME', 'JDC Auto');

/**
 * OPTION 2: SMTP Gmail (Gratuit 500/jour)
 * - Activez l'authentification à 2 facteurs sur votre compte Gmail
 * - Créez un mot de passe d'application: https://myaccount.google.com/apppasswords
 * - Décommentez les lignes ci-dessous
 */
// define('SMTP_GMAIL_USER', 'votre-email@gmail.com');
// define('SMTP_GMAIL_PASS', 'votre-mot-de-passe-application-16-caracteres');

/**
 * OPTION 3: SMTP Générique (Pour tout serveur SMTP)
 * - Décommentez et configurez selon votre serveur
 */
// define('SMTP_HOST', 'smtp.votre-serveur.com');
// define('SMTP_PORT', 587);
// define('SMTP_USER', 'votre-utilisateur');
// define('SMTP_PASS', 'votre-mot-de-passe');
// define('SMTP_ENCRYPTION', 'tls'); // 'tls' ou 'ssl'
// define('SMTP_FROM_EMAIL', 'contact@jdcauto.fr');
// define('SMTP_FROM_NAME', 'JDC Auto');

/**
 * Configuration base de données pour Gandi
 * ✅ CONFIGURÉ avec les paramètres Gandi
 */
class GandiDatabaseConfig {
    private static $connection = null;

    private static function shouldUseEnvironmentConfig() {
        $host = $_SERVER['HTTP_HOST'] ?? '';
        $forced = getenv('USE_ENV_DB_CONFIG');

        if ($forced !== false) {
            return in_array(strtolower((string)$forced), ['1', 'true', 'yes', 'on'], true);
        }

        return strpos($host, 'localhost') !== false
            || strpos($host, '127.0.0.1') !== false
            || strpos($host, 'php') !== false;
    }

    private static function getConfig() {
        if (!self::shouldUseEnvironmentConfig()) {
            return [
                'host' => 'localhost',
                'dbname' => 'jdcauto',
                'username' => 'root',
                'password' => ''
            ];
        }

        return [
            'host' => getenv('DB_HOST') ?: 'localhost',
            'dbname' => getenv('DB_NAME') ?: 'jdcauto',
            'username' => getenv('DB_USER') ?: 'root',
            'password' => getenv('DB_PASSWORD') ?: ''
        ];
    }
    
    public static function getConnection() {
        if (self::$connection === null) {
            $config = self::getConfig();

            try {
                // Essayer d'abord avec la base, sinon sans base pour créer
                $dsn = "mysql:host=" . $config['host'] . ";dbname=" . $config['dbname'] . ";charset=utf8mb4";
                
                self::$connection = new PDO($dsn, $config['username'], $config['password'], [
                    PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                    PDO::ATTR_EMULATE_PREPARES => false,
                    PDO::ATTR_TIMEOUT => 5
                ]);
                
            } catch (PDOException $e) {
                // Si la base n'existe pas, essayer sans base
                if (strpos($e->getMessage(), 'Unknown database') !== false) {
                    try {
                        $dsn = "mysql:host=" . $config['host'] . ";charset=utf8mb4";
                        $tempPdo = new PDO($dsn, $config['username'], $config['password'], [
                            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                            PDO::ATTR_TIMEOUT => 5
                        ]);
                        
                        // Créer la base
                        $tempPdo->exec("CREATE DATABASE IF NOT EXISTS `" . $config['dbname'] . "` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci");
                        
                        // Réessayer avec la base
                        $dsn = "mysql:host=" . $config['host'] . ";dbname=" . $config['dbname'] . ";charset=utf8mb4";
                        self::$connection = new PDO($dsn, $config['username'], $config['password'], [
                            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                            PDO::ATTR_EMULATE_PREPARES => false
                        ]);
                        
                    } catch (PDOException $e2) {
                        error_log("Erreur BDD Gandi (création): " . $e2->getMessage());
                        throw $e2;
                    }
                } else {
                    error_log("Erreur BDD Gandi: " . $e->getMessage());
                    throw $e;
                }
            }
        }
        
        return self::$connection;
    }
}

/**
 * API REST simplifiée pour véhicules et contact
 */
class SimpleVehiclesAPI {
    
    private $pdo;
    private const LOGIN_ATTEMPT_WINDOW_SECONDS = 900;
    private const LOGIN_MAX_ATTEMPTS = 5;
    private const SESSION_ROTATE_INTERVAL_SECONDS = 900;
    private const VEHICLE_IMAGE_PROXY_HOST_SUFFIXES = [
        'edge.scw.cloud',
        's3.fr-par.scw.cloud',
    ];
    
    public function __construct() {
        try {
            $this->pdo = GandiDatabaseConfig::getConnection();
        } catch (Exception $e) {
            // Si pas de connexion, on continue quand même pour retourner une erreur propre
            $this->pdo = null;
        }
    }
    
    public function handleRequest() {
        $this->applySecurityHeaders();
        $this->applyCorsHeaders();

        if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
            http_response_code(200);
            exit;
        }
        
        $action = $_GET['action'] ?? ($_POST['action'] ?? 'vehicles');

        if ($action === 'vehicle_image') {
            return $this->proxyVehicleImage();
        }

        header('Content-Type: application/json; charset=utf-8');
        
        try {
            switch ($action) {
                case 'vehicles':
                    return $this->getVehicles();
                case 'vehicle':
                    return $this->getVehicle();
                case 'vehicle_image':
                    return $this->proxyVehicleImage();
                case 'brands':
                    return $this->getBrands();
                case 'search':
                    return $this->search();
                case 'carte_grise_pricing':
                    return $this->getCarteGrisePricing();
                case 'carte_grise_content':
                    return $this->getCarteGriseContent();
                case 'contact':
                    return $this->createContactRequest();
                case 'admin_session':
                    return $this->getAdminSession();
                case 'admin_login':
                    return $this->adminLogin();
                case 'admin_logout':
                    return $this->adminLogout();
                case 'admin_carte_grise_pricing':
                    return $this->saveCarteGrisePricing();
                case 'admin_carte_grise_content':
                    return $this->saveCarteGriseContent();
                case 'admin_upload_carte_grise_file':
                    return $this->uploadCarteGriseFile();
                case 'admin_vehicles':
                    return $this->getAdminVehicles();
                case 'admin_vehicle_status':
                    return $this->updateVehicleStatus();
                case 'admin_activity':
                    return $this->getAdminActivity();
                default:
                    return $this->error('Action non reconnue', 404);
            }
        } catch (PDOException $e) {
            error_log("Erreur PDO API: " . $e->getMessage() . " | Code: " . $e->getCode());
            return $this->error('Erreur base de données', 500);
        } catch (Exception $e) {
            error_log("Erreur API: " . $e->getMessage() . " | Trace: " . $e->getTraceAsString());
            return $this->error('Erreur serveur', 500);
        }
    }

    private function getRequestData() {
        $json = file_get_contents('php://input');
        $data = json_decode($json, true);

        if (is_array($data)) {
            return $data;
        }

        return $_POST;
    }

    private function encodeVehicleImageSource($url) {
        return rtrim(strtr(base64_encode((string)$url), '+/', '-_'), '=');
    }

    private function decodeVehicleImageSource($encodedUrl) {
        $encodedUrl = trim((string)$encodedUrl);
        if ($encodedUrl === '') {
            return '';
        }

        $padding = strlen($encodedUrl) % 4;
        if ($padding > 0) {
            $encodedUrl .= str_repeat('=', 4 - $padding);
        }

        $decoded = base64_decode(strtr($encodedUrl, '-_', '+/'), true);
        return $decoded !== false ? trim($decoded) : '';
    }

    private function getVehicleImageDefaultPath() {
        return realpath(__DIR__ . '/../jdcauto-1.jpg') ?: (__DIR__ . '/../jdcauto-1.jpg');
    }

    private function outputDefaultVehicleImage() {
        $defaultPath = $this->getVehicleImageDefaultPath();
        if (!is_file($defaultPath) || !is_readable($defaultPath)) {
            http_response_code(404);
            exit;
        }

        header('Content-Type: image/jpeg');
        header('Cache-Control: public, max-age=300');
        header('Content-Length: ' . filesize($defaultPath));
        readfile($defaultPath);
        exit;
    }

    private function isAllowedVehicleImageHost($host) {
        $host = strtolower(trim((string)$host));
        if ($host === '') {
            return false;
        }

        foreach (self::VEHICLE_IMAGE_PROXY_HOST_SUFFIXES as $suffix) {
            $suffix = strtolower(trim((string)$suffix));
            if ($host === $suffix || substr($host, -strlen('.' . $suffix)) === '.' . $suffix) {
                return true;
            }
        }

        return false;
    }

    private function normalizeVehicleImageUrl($url) {
        $url = trim((string)$url);
        if ($url === '') {
            return '';
        }

        $parsedUrl = parse_url($url);
        if (!is_array($parsedUrl) || empty($parsedUrl['scheme']) || empty($parsedUrl['host'])) {
            return '';
        }

        $scheme = strtolower((string)$parsedUrl['scheme']);
        if (!in_array($scheme, ['http', 'https'], true)) {
            return '';
        }

        if (!$this->isAllowedVehicleImageHost((string)$parsedUrl['host'])) {
            return '';
        }

        return $url;
    }

    private function buildVehicleDeduplicationKey($vehicle) {
        $parts = [
            strtoupper(trim((string)($vehicle['marque'] ?? ''))),
            strtoupper(trim((string)($vehicle['modele'] ?? ''))),
            number_format((float)($vehicle['prix_vente'] ?? 0), 2, '.', ''),
            (string)(int)($vehicle['kilometrage'] ?? 0),
            (string)(int)($vehicle['annee'] ?? 0),
            strtoupper(trim((string)($vehicle['version'] ?? ''))),
            strtoupper(trim((string)($vehicle['couleurexterieur'] ?? ''))),
        ];

        return implode('|', $parts);
    }

    private function deduplicateVehicleRows($vehicles) {
        $uniqueVehicles = [];
        $seenKeys = [];

        foreach ($vehicles as $vehicle) {
            $dedupeKey = $this->buildVehicleDeduplicationKey($vehicle);
            if (isset($seenKeys[$dedupeKey])) {
                continue;
            }

            $seenKeys[$dedupeKey] = true;
            $uniqueVehicles[] = $vehicle;
        }

        return $uniqueVehicles;
    }

    private function proxyVehicleImage() {
        $encodedSource = $_GET['src'] ?? '';
        $sourceUrl = $this->decodeVehicleImageSource($encodedSource);

        if ($sourceUrl === '') {
            error_log('[JDC-ImageProxy] Empty source URL (encoded: ' . $encodedSource . ')');
            return $this->outputDefaultVehicleImage();
        }

        $parsedUrl = parse_url($sourceUrl);
        if (!is_array($parsedUrl) || empty($parsedUrl['scheme']) || empty($parsedUrl['host'])) {
            error_log('[JDC-ImageProxy] Invalid URL format: ' . $sourceUrl);
            return $this->outputDefaultVehicleImage();
        }

        if (!in_array(strtolower((string)$parsedUrl['scheme']), ['http', 'https'], true)) {
            error_log('[JDC-ImageProxy] Non-http scheme rejected: ' . $sourceUrl);
            return $this->outputDefaultVehicleImage();
        }

        if (!$this->isAllowedVehicleImageHost((string)$parsedUrl['host'])) {
            error_log('[JDC-ImageProxy] Host not in whitelist: ' . $parsedUrl['host'] . ' (url: ' . $sourceUrl . ')');
            return $this->outputDefaultVehicleImage();
        }

        $ch = curl_init($sourceUrl);
        curl_setopt_array($ch, [
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_FOLLOWLOCATION => true,
            CURLOPT_TIMEOUT => 12,
            CURLOPT_CONNECTTIMEOUT => 5,
            CURLOPT_MAXREDIRS => 3,
            CURLOPT_USERAGENT => 'JDC-Auto-ImageProxy/1.0',
            CURLOPT_HTTPHEADER => ['Accept: image/*'],
            CURLOPT_HEADER => true,
        ]);

        $response = curl_exec($ch);
        $httpCode = (int)curl_getinfo($ch, CURLINFO_HTTP_CODE);
        $headerSize = (int)curl_getinfo($ch, CURLINFO_HEADER_SIZE);
        $contentType = (string)curl_getinfo($ch, CURLINFO_CONTENT_TYPE);
        $curlError = curl_errno($ch);
        curl_close($ch);

        if ($response === false || $curlError !== 0 || $httpCode < 200 || $httpCode >= 300 || $headerSize <= 0) {
            error_log('[JDC-ImageProxy] Fetch failed — url: ' . $sourceUrl . ' | http_code: ' . $httpCode . ' | curl_errno: ' . $curlError);
            return $this->outputDefaultVehicleImage();
        }

        $body = substr($response, $headerSize);
        if ($body === false || $body === '') {
            return $this->outputDefaultVehicleImage();
        }

        if ($contentType === '' || stripos($contentType, 'image/') !== 0) {
            $contentType = 'image/jpeg';
        }

        header('Content-Type: ' . $contentType);
        header('Cache-Control: public, max-age=86400');
        header('Content-Length: ' . strlen($body));
        echo $body;
        exit;
    }

    private function isHttpsRequest() {
        return (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off')
            || (isset($_SERVER['SERVER_PORT']) && (int)$_SERVER['SERVER_PORT'] === 443)
            || (isset($_SERVER['HTTP_X_FORWARDED_PROTO']) && $_SERVER['HTTP_X_FORWARDED_PROTO'] === 'https');
    }

    private function applySecurityHeaders() {
        header('X-Frame-Options: SAMEORIGIN');
        header('X-Content-Type-Options: nosniff');
        header('Referrer-Policy: same-origin');
        header('Permissions-Policy: geolocation=(), microphone=(), camera=()');
        if ($this->isHttpsRequest()) {
            header('Strict-Transport-Security: max-age=31536000; includeSubDomains');
        }
    }

    private function applyCorsHeaders() {
        header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
        header('Access-Control-Allow-Headers: Content-Type, X-CSRF-Token');

        $origin = $_SERVER['HTTP_ORIGIN'] ?? '';
        if ($origin === '') {
            return;
        }

        $allowedOrigins = [
            'http://localhost:5173',
            'http://127.0.0.1:5173',
            'http://localhost:8000',
            'http://127.0.0.1:8000',
        ];

        $scheme = $this->isHttpsRequest() ? 'https' : 'http';
        $host = $_SERVER['HTTP_HOST'] ?? '';
        if ($host !== '') {
            $allowedOrigins[] = $scheme . '://' . $host;
        }

        if (in_array($origin, $allowedOrigins, true)) {
            header('Access-Control-Allow-Origin: ' . $origin);
            header('Vary: Origin');
            header('Access-Control-Allow-Credentials: true');
        }
    }

    private function isLocalRequest() {
        $host = $_SERVER['HTTP_HOST'] ?? '';
        return strpos($host, 'localhost') !== false
            || strpos($host, '127.0.0.1') !== false
            || strpos($host, 'php') !== false;
    }

    private function getAdminConfig() {
        $config = [
            'username' => getenv('ADMIN_USERNAME') ?: null,
            'password' => getenv('ADMIN_PASSWORD') ?: null,
            'password_hash' => getenv('ADMIN_PASSWORD_HASH') ?: null,
            'session_timeout_minutes' => getenv('ADMIN_SESSION_TIMEOUT_MINUTES') ?: null,
        ];

        $configFiles = [
            __DIR__ . '/../config/admin_auth.php',
            __DIR__ . '/../config/admin_auth.local.php',
        ];

        foreach ($configFiles as $configFile) {
            if (file_exists($configFile)) {
                $fileConfig = require $configFile;
                if (is_array($fileConfig)) {
                    if (empty($config['username']) && !empty($fileConfig['username'])) {
                        $config['username'] = (string)$fileConfig['username'];
                    }
                    if (empty($config['password']) && !empty($fileConfig['password'])) {
                        $config['password'] = (string)$fileConfig['password'];
                    }
                    if (empty($config['password_hash']) && !empty($fileConfig['password_hash'])) {
                        $config['password_hash'] = (string)$fileConfig['password_hash'];
                    }
                    if (empty($config['session_timeout_minutes']) && !empty($fileConfig['session_timeout_minutes'])) {
                        $config['session_timeout_minutes'] = (int)$fileConfig['session_timeout_minutes'];
                    }
                }
            }
        }

        $config['session_timeout_minutes'] = max(5, (int)($config['session_timeout_minutes'] ?: 30));

        return $config;
    }

    private function getAdminUsername() {
        $config = $this->getAdminConfig();
        return $config['username'] ?: null;
    }

    private function getAdminPassword() {
        $config = $this->getAdminConfig();
        return $config['password'] ?: null;
    }

    private function getAdminPasswordHash() {
        $config = $this->getAdminConfig();
        return $config['password_hash'] ?: null;
    }

    private function getAdminSessionTimeoutMinutes() {
        $config = $this->getAdminConfig();
        return (int)($config['session_timeout_minutes'] ?? 30);
    }

    private function getCurrentAdminUsername() {
        return trim((string)($_SESSION['admin_username'] ?? ''));
    }

    private function getRequestFingerprint() {
        $userAgent = (string)($_SERVER['HTTP_USER_AGENT'] ?? 'unknown');
        return hash('sha256', $userAgent);
    }

    private function issueCsrfToken() {
        if (empty($_SESSION['admin_csrf_token'])) {
            $_SESSION['admin_csrf_token'] = bin2hex(random_bytes(32));
        }

        return $_SESSION['admin_csrf_token'];
    }

    private function getCsrfToken() {
        return trim((string)($_SESSION['admin_csrf_token'] ?? ''));
    }

    private function validateCsrfToken() {
        $sessionToken = $this->getCsrfToken();
        $requestToken = trim((string)($_SERVER['HTTP_X_CSRF_TOKEN'] ?? ''));

        if ($sessionToken === '' || $requestToken === '' || !hash_equals($sessionToken, $requestToken)) {
            $this->error('Jeton CSRF invalide', 403);
        }
    }

    private function isAdminSessionExpired() {
        if (empty($_SESSION['admin_authenticated'])) {
            return false;
        }

        $lastActivity = $_SESSION['admin_last_activity'] ?? null;
        if (empty($lastActivity)) {
            return true;
        }

        return (time() - (int)$lastActivity) > ($this->getAdminSessionTimeoutMinutes() * 60);
    }

    private function shouldRotateSessionId() {
        $lastRotation = (int)($_SESSION['admin_last_rotation'] ?? 0);
        if ($lastRotation <= 0) {
            return true;
        }

        return (time() - $lastRotation) >= self::SESSION_ROTATE_INTERVAL_SECONDS;
    }

    private function rotateSessionIdIfNeeded($force = false) {
        if ($force || $this->shouldRotateSessionId()) {
            session_regenerate_id(true);
            $_SESSION['admin_last_rotation'] = time();
        }
    }

    private function clearAdminSession() {
        unset(
            $_SESSION['admin_authenticated'],
            $_SESSION['admin_authenticated_at'],
            $_SESSION['admin_last_activity'],
            $_SESSION['admin_last_rotation'],
            $_SESSION['admin_username'],
            $_SESSION['admin_fingerprint'],
            $_SESSION['admin_csrf_token']
        );
    }

    private function touchAdminSession() {
        $_SESSION['admin_last_activity'] = time();
    }

    private function isAdminAuthenticated() {
        if (empty($_SESSION['admin_authenticated'])) {
            return false;
        }

        $expectedFingerprint = trim((string)($_SESSION['admin_fingerprint'] ?? ''));
        if ($expectedFingerprint === '' || !hash_equals($expectedFingerprint, $this->getRequestFingerprint())) {
            $this->clearAdminSession();
            return false;
        }

        if ($this->isAdminSessionExpired()) {
            $this->clearAdminSession();
            return false;
        }

        return true;
    }

    private function requireAdminAuth() {
        if (!$this->isAdminAuthenticated()) {
            $this->error('Authentification requise', 401);
        }

        if ($_SERVER['REQUEST_METHOD'] === 'POST') {
            $this->validateCsrfToken();
        }

        $this->touchAdminSession();
        $this->rotateSessionIdIfNeeded();
    }

    private function ensureSettingsTableExists() {
        $sql = "CREATE TABLE IF NOT EXISTS site_settings (
            setting_key VARCHAR(190) PRIMARY KEY,
            setting_value LONGTEXT NOT NULL,
            updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci";

        $this->pdo->exec($sql);
    }

    private function ensureAdminActivityTableExists() {
        $sql = "CREATE TABLE IF NOT EXISTS admin_activity_log (
            id INT AUTO_INCREMENT PRIMARY KEY,
            admin_username VARCHAR(190) NOT NULL,
            action_type VARCHAR(100) NOT NULL,
            target_type VARCHAR(100) NOT NULL,
            target_id VARCHAR(190) DEFAULT NULL,
            summary VARCHAR(255) NOT NULL,
            metadata LONGTEXT DEFAULT NULL,
            created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
            KEY idx_admin_activity_created_at (created_at),
            KEY idx_admin_activity_target (target_type, target_id)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci";

        $this->pdo->exec($sql);
    }

    private function ensureAdminLoginAttemptsTableExists() {
        $sql = "CREATE TABLE IF NOT EXISTS admin_login_attempts (
            id INT AUTO_INCREMENT PRIMARY KEY,
            ip_address VARCHAR(64) NOT NULL,
            username_attempted VARCHAR(190) DEFAULT NULL,
            success TINYINT(1) NOT NULL DEFAULT 0,
            created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
            KEY idx_admin_login_attempts_ip_created (ip_address, created_at)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci";

        $this->pdo->exec($sql);
    }

    private function ensureVehicleAdminColumns() {
        $columns = $this->pdo->query("SHOW COLUMNS FROM vehicles")->fetchAll(PDO::FETCH_COLUMN);

        if (!in_array('manual_status_override', $columns, true)) {
            $this->pdo->exec("ALTER TABLE vehicles ADD COLUMN manual_status_override VARCHAR(50) NULL AFTER etat");
        }

        if (!in_array('synced_status', $columns, true)) {
            $this->pdo->exec("ALTER TABLE vehicles ADD COLUMN synced_status VARCHAR(50) NULL AFTER manual_status_override");
            $this->pdo->exec("UPDATE vehicles SET synced_status = etat WHERE synced_status IS NULL");
        }
    }

    private function ensureAdminSchema() {
        if ($this->pdo === null) {
            $this->error('Base de données non configurée', 503);
        }

        $this->ensureSettingsTableExists();
        $this->ensureAdminActivityTableExists();
        $this->ensureAdminLoginAttemptsTableExists();
        $this->ensureVehicleAdminColumns();
    }

    private function getClientIpAddress() {
        foreach (['HTTP_CF_CONNECTING_IP', 'HTTP_X_FORWARDED_FOR', 'REMOTE_ADDR'] as $header) {
            if (empty($_SERVER[$header])) {
                continue;
            }

            $rawValue = (string)$_SERVER[$header];
            $ip = trim(explode(',', $rawValue)[0]);
            if ($ip !== '') {
                return substr($ip, 0, 64);
            }
        }

        return 'unknown';
    }

    private function isLoginRateLimited($ipAddress) {
        if ($this->pdo === null) {
            return false;
        }

        $this->ensureAdminLoginAttemptsTableExists();

        $stmt = $this->pdo->prepare("
            SELECT COUNT(*)
            FROM admin_login_attempts
            WHERE ip_address = ?
              AND success = 0
              AND created_at >= (NOW() - INTERVAL ? SECOND)
        ");
        $stmt->execute([$ipAddress, self::LOGIN_ATTEMPT_WINDOW_SECONDS]);

        return (int)$stmt->fetchColumn() >= self::LOGIN_MAX_ATTEMPTS;
    }

    private function recordLoginAttempt($ipAddress, $usernameAttempted, $success) {
        if ($this->pdo === null) {
            return;
        }

        $this->ensureAdminLoginAttemptsTableExists();

        $stmt = $this->pdo->prepare("
            INSERT INTO admin_login_attempts (ip_address, username_attempted, success, created_at)
            VALUES (?, ?, ?, NOW())
        ");
        $stmt->execute([
            $ipAddress,
            $usernameAttempted !== '' ? $usernameAttempted : null,
            $success ? 1 : 0,
        ]);
    }

    private function verifyAdminPassword($plainPassword) {
        $passwordHash = $this->getAdminPasswordHash();
        if (!empty($passwordHash)) {
            return password_verify($plainPassword, $passwordHash);
        }

        $configuredPassword = $this->getAdminPassword();
        if ($configuredPassword === null) {
            return false;
        }

        return hash_equals($configuredPassword, $plainPassword);
    }

    private function logAdminActivity($actionType, $targetType, $targetId, $summary, $metadata = null) {
        if ($this->pdo === null) {
            return;
        }

        $this->ensureAdminActivityTableExists();

        $encodedMetadata = null;
        if ($metadata !== null) {
            $encodedMetadata = json_encode($metadata, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
        }

        $stmt = $this->pdo->prepare("
            INSERT INTO admin_activity_log (admin_username, action_type, target_type, target_id, summary, metadata, created_at)
            VALUES (?, ?, ?, ?, ?, ?, NOW())
        ");
        $stmt->execute([
            $this->getCurrentAdminUsername() ?: 'admin',
            trim((string)$actionType),
            trim((string)$targetType),
            $targetId !== null ? trim((string)$targetId) : null,
            trim((string)$summary),
            $encodedMetadata,
        ]);
    }

    private function getSettingValue($key) {
        $this->ensureSettingsTableExists();

        $stmt = $this->pdo->prepare("SELECT setting_value FROM site_settings WHERE setting_key = ?");
        $stmt->execute([$key]);
        $row = $stmt->fetch();

        return $row['setting_value'] ?? null;
    }

    private function setSettingValue($key, $value) {
        $this->ensureSettingsTableExists();

        $stmt = $this->pdo->prepare("
            INSERT INTO site_settings (setting_key, setting_value, updated_at)
            VALUES (?, ?, NOW())
            ON DUPLICATE KEY UPDATE setting_value = VALUES(setting_value), updated_at = NOW()
        ");
        $stmt->execute([$key, $value]);
    }

    private function getAdminSession() {
        $configured = $this->getAdminUsername() !== null
            && ($this->getAdminPassword() !== null || $this->getAdminPasswordHash() !== null);

        return $this->success([
            'authenticated' => $this->isAdminAuthenticated(),
            'configured' => $configured,
            'username' => $this->isAdminAuthenticated() ? $this->getCurrentAdminUsername() : null,
            'session_timeout_minutes' => $this->getAdminSessionTimeoutMinutes(),
            'csrf_token' => $this->issueCsrfToken(),
            'last_activity_at' => !empty($_SESSION['admin_last_activity'])
                ? date('c', (int)$_SESSION['admin_last_activity'])
                : null,
        ]);
    }

    private function adminLogin() {
        if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
            return $this->error('Méthode non autorisée. Utilisez POST.', 405);
        }

        $configuredUsername = $this->getAdminUsername();
        $configuredPassword = $this->getAdminPassword();
        $configuredPasswordHash = $this->getAdminPasswordHash();
        if ($configuredUsername === null || ($configuredPassword === null && $configuredPasswordHash === null)) {
            return $this->error('Identifiants admin non configurés sur le serveur', 500);
        }

        $data = $this->getRequestData();
        $username = trim((string)($data['username'] ?? ''));
        $password = trim((string)($data['password'] ?? ''));
        $ipAddress = $this->getClientIpAddress();

        $this->validateCsrfToken();

        if ($this->isLoginRateLimited($ipAddress)) {
            return $this->error('Trop de tentatives de connexion. Réessayez plus tard.', 429);
        }

        if ($username === '') {
            return $this->error('Identifiant requis', 400);
        }

        if ($password === '') {
            return $this->error('Mot de passe requis', 400);
        }

        if (!hash_equals($configuredUsername, $username) || !$this->verifyAdminPassword($password)) {
            $this->recordLoginAttempt($ipAddress, $username, false);
            return $this->error('Identifiants invalides', 401);
        }

        session_regenerate_id(true);
        $_SESSION['admin_authenticated'] = true;
        $_SESSION['admin_authenticated_at'] = date('c');
        $_SESSION['admin_username'] = $configuredUsername;
        $_SESSION['admin_fingerprint'] = $this->getRequestFingerprint();
        $_SESSION['admin_last_rotation'] = time();
        $this->touchAdminSession();
        $csrfToken = $this->issueCsrfToken();
        $this->recordLoginAttempt($ipAddress, $username, true);

        $this->logAdminActivity('login', 'session', null, 'Connexion administrateur', [
            'username' => $configuredUsername,
        ]);

        return $this->success([
            'authenticated' => true,
            'username' => $configuredUsername,
            'csrf_token' => $csrfToken,
        ]);
    }

    private function adminLogout() {
        if ($this->isAdminAuthenticated()) {
            $this->logAdminActivity('logout', 'session', null, 'Déconnexion administrateur', [
                'username' => $this->getCurrentAdminUsername(),
            ]);
        }

        $this->clearAdminSession();
        $_SESSION = [];
        if (session_id() !== '') {
            session_regenerate_id(true);
            session_destroy();
        }

        return $this->success([
            'authenticated' => false
        ]);
    }

    private function getCarteGrisePricing() {
        if ($this->pdo === null) {
            return $this->success(null);
        }

        $contentValue = $this->getSettingValue('carte_grise_content');
        if ($contentValue !== null) {
            $content = json_decode($contentValue, true);
            if (is_array($content) && isset($content['pricingItems']) && is_array($content['pricingItems'])) {
                return $this->success($content['pricingItems']);
            }
        }

        $value = $this->getSettingValue('carte_grise_pricing');
        if ($value === null) {
            return $this->success(null);
        }

        $decoded = json_decode($value, true);
        if (!is_array($decoded)) {
            return $this->success(null);
        }

        return $this->success($decoded);
    }

    private function getCarteGriseContent() {
        if ($this->pdo === null) {
            return $this->success(null);
        }

        $value = $this->getSettingValue('carte_grise_content');
        if ($value === null) {
            return $this->success(null);
        }

        $decoded = json_decode($value, true);
        if (!is_array($decoded)) {
            return $this->success(null);
        }

        return $this->success($decoded);
    }

    private function saveCarteGrisePricing() {
        $this->requireAdminAuth();
        $this->ensureAdminSchema();

        if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
            return $this->error('Méthode non autorisée. Utilisez POST.', 405);
        }

        $data = $this->getRequestData();
        $items = $data['items'] ?? null;

        if (!is_array($items) || count($items) === 0) {
            return $this->error('Liste de tarifs invalide', 400);
        }

        $sanitized = [];
        foreach ($items as $item) {
            $sanitized[] = [
                'id' => trim((string)($item['id'] ?? '')),
                'title' => trim((string)($item['title'] ?? '')),
                'subtitle' => trim((string)($item['subtitle'] ?? '')),
                'price' => trim((string)($item['price'] ?? '')),
                'note' => trim((string)($item['note'] ?? '')),
                'popular' => !empty($item['popular'])
            ];
        }

        foreach ($sanitized as $item) {
            if ($item['id'] === '' || $item['title'] === '' || $item['price'] === '') {
                return $this->error('Chaque tarif doit avoir un identifiant, un titre et un prix', 400);
            }
        }

        $this->setSettingValue('carte_grise_pricing', json_encode($sanitized, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES));

        return $this->success([
            'message' => 'Tarifs mis à jour',
            'items' => $sanitized
        ]);
    }

    private function normalizeCarteGriseContent($content) {
        if (!is_array($content)) {
            $this->error('Contenu carte grise invalide', 400);
        }

        $pricingItems = [];
        foreach (($content['pricingItems'] ?? []) as $item) {
            $pricingItems[] = [
                'id' => trim((string)($item['id'] ?? '')),
                'title' => trim((string)($item['title'] ?? '')),
                'subtitle' => trim((string)($item['subtitle'] ?? '')),
                'price' => trim((string)($item['price'] ?? '')),
                'note' => trim((string)($item['note'] ?? '')),
                'popular' => !empty($item['popular']),
            ];
        }

        $documentSections = [];
        foreach (($content['documentSections'] ?? []) as $section) {
            $items = [];
            foreach (($section['items'] ?? []) as $line) {
                $line = trim((string)$line);
                if ($line !== '') {
                    $items[] = $line;
                }
            }

            $cerfaCards = [];
            foreach (($section['cerfaCards'] ?? []) as $card) {
                $fileMeta = $card['fileMeta'] ?? null;
                if (!is_array($fileMeta)) {
                    $fileMeta = [];
                }

                $cerfaCards[] = [
                    'id' => trim((string)($card['id'] ?? '')),
                    'title' => trim((string)($card['title'] ?? '')),
                    'badge' => trim((string)($card['badge'] ?? '')),
                    'fileUrl' => trim((string)($card['fileUrl'] ?? '')),
                    'downloadFilename' => trim((string)($card['downloadFilename'] ?? '')),
                    'fileMeta' => [
                        'mimeType' => trim((string)($fileMeta['mimeType'] ?? '')),
                        'size' => (int)($fileMeta['size'] ?? 0),
                        'extension' => trim((string)($fileMeta['extension'] ?? '')),
                        'isImage' => !empty($fileMeta['isImage']),
                    ],
                ];
            }

            $documentSections[] = [
                'id' => trim((string)($section['id'] ?? '')),
                'title' => trim((string)($section['title'] ?? '')),
                'items' => $items,
                'infoText' => trim((string)($section['infoText'] ?? '')),
                'cerfaTitle' => trim((string)($section['cerfaTitle'] ?? '')),
                'cerfaCards' => $cerfaCards,
            ];
        }

        return [
            'pricingItems' => $pricingItems,
            'documentSections' => $documentSections,
        ];
    }

    private function saveCarteGriseContent() {
        $this->requireAdminAuth();
        $this->ensureAdminSchema();

        if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
            return $this->error('Méthode non autorisée. Utilisez POST.', 405);
        }

        $data = $this->getRequestData();
        $content = $this->normalizeCarteGriseContent($data['content'] ?? null);

        $this->setSettingValue('carte_grise_content', json_encode($content, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES));
        $this->logAdminActivity('save', 'carte_grise', 'content', 'Mise à jour du contenu carte grise', [
            'pricing_items_count' => count($content['pricingItems']),
            'document_sections_count' => count($content['documentSections']),
        ]);

        return $this->success([
            'message' => 'Contenu carte grise mis à jour',
            'content' => $content,
        ]);
    }

    private function uploadCarteGriseFile() {
        $this->requireAdminAuth();
        $this->ensureAdminSchema();

        if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
            return $this->error('Méthode non autorisée. Utilisez POST.', 405);
        }

        if (!isset($_FILES['file'])) {
            return $this->error('Fichier requis', 400);
        }

        $file = $_FILES['file'];
        if (($file['error'] ?? UPLOAD_ERR_NO_FILE) !== UPLOAD_ERR_OK) {
            return $this->error('Erreur lors de l\'upload du fichier', 400);
        }

        $originalName = basename((string)$file['name']);
        $extension = strtolower(pathinfo($originalName, PATHINFO_EXTENSION));
        $allowed = ['png', 'jpg', 'jpeg', 'webp', 'pdf'];

        if (!in_array($extension, $allowed, true)) {
            return $this->error('Format de fichier non autorisé', 400);
        }

        $uploadDir = dirname(__DIR__) . '/uploads/carte-grise';
        if (!is_dir($uploadDir) && !mkdir($uploadDir, 0775, true) && !is_dir($uploadDir)) {
            return $this->error('Impossible de créer le dossier d\'upload', 500);
        }

        $safeName = preg_replace('/[^A-Za-z0-9._-]/', '-', pathinfo($originalName, PATHINFO_FILENAME));
        $safeName = trim($safeName, '-');
        if ($safeName === '') {
            $safeName = 'cerfa';
        }

        $filename = $safeName . '-' . date('YmdHis') . '.' . $extension;
        $targetPath = $uploadDir . '/' . $filename;

        if (!move_uploaded_file($file['tmp_name'], $targetPath)) {
            return $this->error('Impossible de déplacer le fichier uploadé', 500);
        }

        $mimeType = '';
        if (function_exists('mime_content_type')) {
            $mimeType = (string)(mime_content_type($targetPath) ?: '');
        }
        if ($mimeType === '') {
            $mimeType = $extension === 'pdf' ? 'application/pdf' : 'image/' . ($extension === 'jpg' ? 'jpeg' : $extension);
        }

        $fileSize = (int)filesize($targetPath);
        $isImage = in_array($extension, ['png', 'jpg', 'jpeg', 'webp'], true);

        $this->logAdminActivity('upload', 'carte_grise_file', $filename, 'Import d\'un fichier CERFA', [
            'filename' => $filename,
            'mime_type' => $mimeType,
            'size' => $fileSize,
        ]);

        return $this->success([
            'public_url' => '/uploads/carte-grise/' . $filename,
            'filename' => $filename,
            'mime_type' => $mimeType,
            'size' => $fileSize,
            'extension' => $extension,
            'is_image' => $isImage,
        ]);
    }

    private function getAdminVehicles() {
        $this->requireAdminAuth();
        $this->ensureAdminSchema();

        $page = max((int)($_GET['page'] ?? 1), 1);
        $perPage = min(max((int)($_GET['per_page'] ?? 24), 1), 100);
        $offset = ($page - 1) * $perPage;
        $status = trim((string)($_GET['status'] ?? ''));
        $query = trim((string)($_GET['q'] ?? ''));
        $brand = trim((string)($_GET['brand'] ?? ''));
        $model = trim((string)($_GET['model'] ?? ''));
        $year = (int)($_GET['year'] ?? 0);
        $sort = trim((string)($_GET['sort'] ?? 'updated_desc'));

        $whereParts = ["1=1"];
        $params = [];

        if ($status !== '' && $status !== 'all') {
            $whereParts[] = "etat = ?";
            $params[] = $status;
        }

        if ($query !== '') {
            $escapedQuery = str_replace(['\\', '%', '_'], ['\\\\', '\%', '\_'], $query);
            $queryLike = '%' . preg_replace('/\s+/', '%', $escapedQuery) . '%';
            $whereParts[] = "(
                reference LIKE ? ESCAPE '\\\\'
                OR marque LIKE ? ESCAPE '\\\\'
                OR modele LIKE ? ESCAPE '\\\\'
                OR version LIKE ? ESCAPE '\\\\'
                OR CONCAT_WS(' ', marque, modele) LIKE ? ESCAPE '\\\\'
                OR CONCAT_WS(' ', marque, modele, version) LIKE ? ESCAPE '\\\\'
            )";
            $params[] = $queryLike;
            $params[] = $queryLike;
            $params[] = $queryLike;
            $params[] = $queryLike;
            $params[] = $queryLike;
            $params[] = $queryLike;
        }

        if ($brand !== '') {
            $whereParts[] = "marque = ?";
            $params[] = $brand;
        }

        if ($model !== '') {
            $whereParts[] = "modele = ?";
            $params[] = $model;
        }

        if ($year > 0) {
            $whereParts[] = "annee = ?";
            $params[] = $year;
        }

        $whereSql = implode(' AND ', $whereParts);
        $orderBy = "updated_at DESC, id DESC";
        switch ($sort) {
            case 'price_asc':
                $orderBy = "prix_vente ASC, id DESC";
                break;
            case 'price_desc':
                $orderBy = "prix_vente DESC, id DESC";
                break;
            case 'year_asc':
                $orderBy = "annee ASC, id DESC";
                break;
            case 'year_desc':
                $orderBy = "annee DESC, id DESC";
                break;
            case 'brand_asc':
                $orderBy = "marque ASC, modele ASC, id DESC";
                break;
        }

        $countStmt = $this->pdo->prepare("SELECT COUNT(*) FROM vehicles WHERE {$whereSql}");
        $countStmt->execute($params);
        $total = (int)$countStmt->fetchColumn();

        $sql = "SELECT id, reference, marque, modele, version, prix_vente, kilometrage, annee, energie, typeboite, carrosserie, etat, manual_status_override, synced_status, updated_at
                FROM vehicles
                WHERE {$whereSql}
                ORDER BY {$orderBy}
                LIMIT ? OFFSET ?";

        $stmt = $this->pdo->prepare($sql);
        $statementParams = $params;
        $statementParams[] = $perPage;
        $statementParams[] = $offset;

        foreach ($statementParams as $index => $value) {
            $stmt->bindValue($index + 1, $value, is_int($value) ? PDO::PARAM_INT : PDO::PARAM_STR);
        }
        $stmt->execute();
        $vehicles = $stmt->fetchAll();

        foreach ($vehicles as &$vehicle) {
            $photoStmt = $this->pdo->prepare("
                SELECT photo_url
                FROM vehicle_photos
                WHERE vehicle_id = ?
                ORDER BY photo_order
                LIMIT 1
            ");
            $photoStmt->execute([$vehicle['id']]);
            $photo = $photoStmt->fetch();

            $vehicle['image_url'] = $photo['photo_url'] ?? '';
            $vehicle['price'] = isset($vehicle['prix_vente']) ? (float)$vehicle['prix_vente'] : 0;
            $vehicle['mileage'] = isset($vehicle['kilometrage']) ? (int)$vehicle['kilometrage'] : 0;
            $vehicle['year'] = isset($vehicle['annee']) ? (int)$vehicle['annee'] : 0;
            $vehicle['fuel_type'] = $vehicle['energie'] ?? '';
            $vehicle['gearbox'] = (isset($vehicle['typeboite']) && $vehicle['typeboite'] === 'A') ? 'Automatique' : 'Manuelle';
            $vehicle['brand'] = $vehicle['marque'] ?? '';
            $vehicle['model'] = $vehicle['modele'] ?? '';
            $vehicle['status'] = $vehicle['etat'] ?? 'Disponible';
            $vehicle['manual_override_active'] = !empty($vehicle['manual_status_override']);
        }

        $brands = $this->pdo->query("SELECT DISTINCT marque FROM vehicles WHERE marque <> '' ORDER BY marque ASC")->fetchAll(PDO::FETCH_COLUMN);
        $years = $this->pdo->query("SELECT DISTINCT annee FROM vehicles WHERE annee IS NOT NULL AND annee > 0 ORDER BY annee DESC")->fetchAll(PDO::FETCH_COLUMN);

        $modelParams = [];
        $modelsSql = "SELECT DISTINCT modele FROM vehicles";
        if ($brand !== '') {
            $modelsSql .= " WHERE marque = ?";
            $modelParams[] = $brand;
        }
        $modelsSql .= " ORDER BY modele ASC";
        $modelsStmt = $this->pdo->prepare($modelsSql);
        $modelsStmt->execute($modelParams);
        $models = $modelsStmt->fetchAll(PDO::FETCH_COLUMN);

        return $this->success([
            'items' => $vehicles,
            'pagination' => [
                'page' => $page,
                'per_page' => $perPage,
                'total' => $total,
                'total_pages' => max(1, (int)ceil($total / $perPage)),
            ],
            'filters' => [
                'brands' => $brands,
                'models' => $models,
                'years' => array_map('intval', $years),
            ],
        ]);
    }

    private function updateVehicleStatus() {
        $this->requireAdminAuth();
        $this->ensureAdminSchema();

        if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
            return $this->error('Méthode non autorisée. Utilisez POST.', 405);
        }

        $data = $this->getRequestData();
        $vehicleId = (int)($data['vehicle_id'] ?? 0);
        $status = trim((string)($data['status'] ?? ''));

        if ($vehicleId <= 0) {
            return $this->error('Véhicule invalide', 400);
        }

        $allowedStatuses = ['Disponible', 'Vendu', 'Réservé', 'AUTO'];
        if (!in_array($status, $allowedStatuses, true)) {
            return $this->error('Statut invalide', 400);
        }

        $stmt = $this->pdo->prepare("SELECT id, synced_status FROM vehicles WHERE id = ?");
        $stmt->execute([$vehicleId]);
        $vehicle = $stmt->fetch();

        if (!$vehicle) {
            return $this->error('Véhicule non trouvé', 404);
        }

        if ($status === 'AUTO') {
            $finalStatus = $vehicle['synced_status'] ?: 'Disponible';
            $update = $this->pdo->prepare("
                UPDATE vehicles
                SET manual_status_override = NULL, etat = ?, updated_at = NOW()
                WHERE id = ?
            ");
            $update->execute([$finalStatus, $vehicleId]);
        } else {
            $finalStatus = $status;
            $update = $this->pdo->prepare("
                UPDATE vehicles
                SET manual_status_override = ?, etat = ?, updated_at = NOW()
                WHERE id = ?
            ");
            $update->execute([$status, $finalStatus, $vehicleId]);
        }

        $this->logAdminActivity('update_status', 'vehicle', (string)$vehicleId, 'Changement de statut véhicule', [
            'vehicle_id' => $vehicleId,
            'status' => $finalStatus,
            'mode' => $status === 'AUTO' ? 'auto' : 'manual',
        ]);

        return $this->success([
            'message' => 'Statut mis à jour',
            'status' => $finalStatus
        ]);
    }

    private function getAdminActivity() {
        $this->requireAdminAuth();
        $this->ensureAdminSchema();

        $limit = min(max((int)($_GET['limit'] ?? 20), 1), 100);
        $targetType = trim((string)($_GET['target_type'] ?? ''));

        $sql = "SELECT id, admin_username, action_type, target_type, target_id, summary, metadata, created_at
                FROM admin_activity_log";
        $params = [];

        if ($targetType !== '') {
            $sql .= " WHERE target_type = ?";
            $params[] = $targetType;
        }

        $sql .= " ORDER BY created_at DESC, id DESC LIMIT ?";
        $params[] = $limit;

        $stmt = $this->pdo->prepare($sql);
        foreach ($params as $index => $value) {
            $stmt->bindValue($index + 1, $value, is_int($value) ? PDO::PARAM_INT : PDO::PARAM_STR);
        }
        $stmt->execute();
        $rows = $stmt->fetchAll();

        foreach ($rows as &$row) {
            $row['metadata'] = !empty($row['metadata']) ? json_decode($row['metadata'], true) : null;
        }

        return $this->success($rows);
    }
    
    private function getVehicles() {
        if ($this->pdo === null) {
            return $this->error('Base de données non configurée. Veuillez exécuter install/setup.php', 503);
        }
        
        $limit = min((int)($_GET['limit'] ?? 12), 100);
        $queryLimit = min(max($limit * 4, $limit), 500);
        $status = $_GET['status'] ?? 'Disponible';
        
        // Vérifier si la table existe
        try {
            $checkTable = $this->pdo->query("SHOW TABLES LIKE 'vehicles'");
            if ($checkTable->rowCount() === 0) {
                return $this->error('Base de données non initialisée. Veuillez exécuter install/setup.php', 503);
            }
        } catch (PDOException $e) {
            return $this->error('Erreur base de données: ' . $e->getMessage(), 500);
        }
        
        // Requête simple pour commencer - avec gestion colonnes manquantes
        try {
            // Vérifier les colonnes disponibles
            $columnsStmt = $this->pdo->query("SHOW COLUMNS FROM vehicles");
            $availableColumns = $columnsStmt->fetchAll(PDO::FETCH_COLUMN);
            
            // Construire la requête avec seulement les colonnes existantes
            $selectFields = [];
            $wantedFields = [
                'id', 'reference', 'marque', 'modele', 'version', 
                'prix_vente', 'kilometrage', 'annee', 'energie', 
                'typeboite', 'carrosserie', 'etat', 'couleurexterieur', 
                'description', 'finition', 'date_modif', 'date_creation', 'updated_at'
            ];
            
            foreach ($wantedFields as $field) {
                if (in_array($field, $availableColumns)) {
                    $selectFields[] = $field;
                }
            }
            
            if (empty($selectFields)) {
                return $this->error('Aucune colonne valide trouvée dans la table vehicles', 500);
            }
            
            // Vérifier si la colonne etat existe
            $hasEtat = in_array('etat', $availableColumns);
            $hasDateModif = in_array('date_modif', $availableColumns);
            
            // Récupérer tous les véhicules individuellement (sans groupement)
            // Chaque véhicule est unique, même s'il a la même marque et modèle
            $vehiclesSql = "SELECT " . implode(', ', $selectFields) . " 
                           FROM vehicles";
            
            if ($hasEtat && $status !== 'all') {
                $vehiclesSql .= " WHERE etat = ?";
            }
            
            // Utiliser updated_at si disponible, sinon date_modif, sinon id
            if (in_array('updated_at', $availableColumns)) {
                $vehiclesSql .= " ORDER BY updated_at DESC, id DESC";
            } else if ($hasDateModif) {
                $vehiclesSql .= " ORDER BY date_modif DESC, id DESC";
            } else if (in_array('id', $availableColumns)) {
                $vehiclesSql .= " ORDER BY id DESC";
            }
            
            $vehiclesSql .= " LIMIT ?";
            
            $vehiclesStmt = $this->pdo->prepare($vehiclesSql);
            if ($hasEtat && $status !== 'all') {
                $vehiclesStmt->execute([$status, $queryLimit]);
            } else {
                $vehiclesStmt->execute([$queryLimit]);
            }
            $vehicles = $this->deduplicateVehicleRows($vehiclesStmt->fetchAll());
            $vehicles = array_slice($vehicles, 0, $limit);
            
            // Chaque véhicule est unique, donc quantity = 1
            foreach ($vehicles as &$vehicle) {
                $vehicle['quantity'] = 1;
            }
            
        } catch (PDOException $e) {
            error_log("Erreur requête getVehicles: " . $e->getMessage());
            throw $e;
        }
        
        // Récupérer une photo pour chaque véhicule (si table existe)
        foreach ($vehicles as &$vehicle) {
            try {
                // Vérifier si la table vehicle_photos existe
                $checkPhotos = $this->pdo->query("SHOW TABLES LIKE 'vehicle_photos'");
                if ($checkPhotos->rowCount() > 0 && isset($vehicle['id'])) {
                    $photoStmt = $this->pdo->prepare("
                        SELECT photo_url 
                        FROM vehicle_photos 
                        WHERE vehicle_id = ? 
                        ORDER BY photo_order 
                        LIMIT 1
                    ");
                    $photoStmt->execute([$vehicle['id']]);
                    $photo = $photoStmt->fetch();
                    $vehicle['image_url'] = $this->normalizeVehicleImageUrl($photo['photo_url'] ?? '');
                } else {
                    $vehicle['image_url'] = '';
                }
            } catch (PDOException $e) {
                // Si erreur photos, continuer sans photo
                $vehicle['image_url'] = '';
            }
            
            // Format pour compatibilité React (avec valeurs par défaut)
            $vehicle['price'] = isset($vehicle['prix_vente']) ? (float)$vehicle['prix_vente'] : 0;
            $vehicle['mileage'] = isset($vehicle['kilometrage']) ? (int)$vehicle['kilometrage'] : 0;
            $vehicle['year'] = isset($vehicle['annee']) ? (int)$vehicle['annee'] : 0;
            $vehicle['fuel_type'] = $vehicle['energie'] ?? '';
            $vehicle['gearbox'] = (isset($vehicle['typeboite']) && $vehicle['typeboite'] === 'A') ? 'Automatique' : 'Manuelle';
            $vehicle['brand'] = $vehicle['marque'] ?? '';
            $vehicle['model'] = $vehicle['modele'] ?? '';
            $vehicle['status'] = $vehicle['etat'] ?? 'Disponible';
            $vehicle['category'] = $vehicle['carrosserie'] ?? '';
            $vehicle['quantity'] = isset($vehicle['quantity']) ? (int)$vehicle['quantity'] : 1;
        }
        
        return $this->success($vehicles);
    }
    
    private function getVehicle() {
        $id = (int)($_GET['id'] ?? 0);
        
        if (!$id) {
            return $this->error('ID véhicule requis', 400);
        }
        
        // Requête véhicule complet
        $sql = "SELECT * FROM vehicles WHERE id = ?";
        $stmt = $this->pdo->prepare($sql);
        $stmt->execute([$id]);
        $vehicle = $stmt->fetch();
        
        if (!$vehicle) {
            return $this->error('Véhicule non trouvé', 404);
        }
        
        // Chaque véhicule est unique, donc quantity = 1
        $vehicle['quantity'] = 1;
        
        // Récupérer toutes les photos
        $stmt = $this->pdo->prepare("
            SELECT photo_url 
            FROM vehicle_photos 
            WHERE vehicle_id = ? 
            ORDER BY photo_order
        ");
        $stmt->execute([$id]);
        $photos = $stmt->fetchAll(PDO::FETCH_COLUMN);
        $vehicle['photos'] = array_values(array_filter(array_map([$this, 'normalizeVehicleImageUrl'], $photos)));
        $vehicle['image_url'] = $vehicle['photos'][0] ?? '';
        
        // Format pour React
        $vehicle['price'] = (float)$vehicle['prix_vente'];
        $vehicle['mileage'] = (int)$vehicle['kilometrage'];
        $vehicle['year'] = (int)$vehicle['annee'];
        $vehicle['fuel_type'] = $vehicle['energie'];
        $vehicle['gearbox'] = $vehicle['typeboite'] === 'A' ? 'Automatique' : 'Manuelle';
        $vehicle['brand'] = $vehicle['marque'];
        $vehicle['model'] = $vehicle['modele'];
        $vehicle['status'] = $vehicle['etat'];
        $vehicle['category'] = $vehicle['carrosserie'];
        
        // Champs supplémentaires
        $vehicle['color'] = $vehicle['couleurexterieur'] ?? null;
        $vehicle['doors'] = isset($vehicle['nbrporte']) ? (int)$vehicle['nbrporte'] : null;
        $vehicle['seats'] = isset($vehicle['nbrplace']) ? (int)$vehicle['nbrplace'] : null;
        $vehicle['power'] = $vehicle['puissancedyn'] ?? null;
        $vehicle['fiscal_power'] = $vehicle['puissance_fiscale'] ?? null;
        $vehicle['first_registration'] = $vehicle['date_mec'] ?? null;
        $vehicle['version'] = $vehicle['version'] ?? null;
        $vehicle['finition'] = $vehicle['finition'] ?? null;
        $vehicle['title'] = $vehicle['titre'] ?? null; // Titre complet du véhicule
        
        // Récupérer les options (si la table existe)
        try {
            $checkTable = $this->pdo->query("SHOW TABLES LIKE 'vehicle_options'");
            if ($checkTable->rowCount() > 0) {
                $optionsStmt = $this->pdo->prepare("
                    SELECT option_nom 
                    FROM vehicle_options 
                    WHERE vehicle_id = ?
                    ORDER BY id
                ");
                $optionsStmt->execute([$id]);
                $options = $optionsStmt->fetchAll(PDO::FETCH_COLUMN);
                $vehicle['options'] = $options;
            } else {
                $vehicle['options'] = [];
            }
        } catch (PDOException $e) {
            $vehicle['options'] = [];
        }
        
        return $this->success($vehicle);
    }
    
    private function getBrands() {
        $sql = "
            SELECT marque as brand, COUNT(*) as count 
            FROM vehicles 
            WHERE etat = 'Disponible' 
            GROUP BY marque 
            ORDER BY marque
        ";
        
        $stmt = $this->pdo->query($sql);
        $brands = $stmt->fetchAll();
        
        return $this->success($brands);
    }
    
    private function search() {
        $query = $_GET['q'] ?? '';
        $limit = min((int)($_GET['limit'] ?? 10), 20);
        
        if (strlen($query) < 3) {
            return $this->error('Recherche trop courte', 400);
        }
        
        // Recherche simple sur marque et modèle
        $sql = "
            SELECT 
                id, marque, modele, prix_vente, annee, kilometrage, carrosserie
            FROM vehicles 
            WHERE etat = 'Disponible' 
              AND (marque LIKE ? OR modele LIKE ? OR description LIKE ?)
            ORDER BY prix_vente ASC
            LIMIT ?
        ";
        
        $searchTerm = "%$query%";
        $stmt = $this->pdo->prepare($sql);
        $stmt->execute([$searchTerm, $searchTerm, $searchTerm, $limit]);
        $results = $stmt->fetchAll();
        
        return $this->success($results);
    }
    
    private function success($data) {
        echo json_encode([
            'success' => true,
            'data' => $data,
            'timestamp' => date('c')
        ], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
        exit;
    }
    
    /**
     * Créer une demande de contact
     */
    private function createContactRequest() {
        if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
            return $this->error('Méthode non autorisée. Utilisez POST.', 405);
        }
        
        $data = $this->getRequestData();
        
        // Validation des champs requis
        $required = ['first_name', 'last_name', 'email', 'phone', 'message', 'type'];
        foreach ($required as $field) {
            if (empty($data[$field])) {
                return $this->error("Le champ '$field' est requis", 400);
            }
        }
        
        // Validation email
        if (!filter_var($data['email'], FILTER_VALIDATE_EMAIL)) {
            return $this->error('Email invalide', 400);
        }

        // Validation reCAPTCHA côté serveur
        $recaptchaToken = $data['recaptcha'] ?? '';
        if (!$this->verifyRecaptcha($recaptchaToken)) {
            return $this->error('Vérification reCAPTCHA échouée', 400);
        }

        try {
            // Vérifier si la table existe, sinon la créer
            $this->ensureContactTableExists();

            // Rate limiting : max 5 messages par IP par heure
            $ip = $_SERVER['REMOTE_ADDR'] ?? '';
            $rateStmt = $this->pdo->prepare(
                "SELECT COUNT(*) FROM contact_requests WHERE ip_address = ? AND created_at > DATE_SUB(NOW(), INTERVAL 1 HOUR)"
            );
            $rateStmt->execute([$ip]);
            if ((int)$rateStmt->fetchColumn() >= 5) {
                return $this->error('Trop de messages envoyés. Réessayez dans 1 heure.', 429);
            }

            // Insérer la demande de contact
            $sql = "INSERT INTO contact_requests
                    (first_name, last_name, email, phone, message, type, subject, ip_address, created_at)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())";
            
            $stmt = $this->pdo->prepare($sql);
            $stmt->execute([
                $data['first_name'],
                $data['last_name'],
                $data['email'],
                $data['phone'],
                $data['message'],
                $data['type'],
                $data['subject'] ?? 'Demande de contact',
                $ip
            ]);
            
            $contactId = $this->pdo->lastInsertId();
            
            // Optionnel: Envoyer un email (si configuré)
            $this->sendContactEmail($data);
            
            return $this->success([
                'id' => $contactId,
                'message' => 'Votre message a été envoyé avec succès'
            ]);
            
        } catch (PDOException $e) {
            error_log("Erreur création contact: " . $e->getMessage());
            return $this->error('Erreur lors de l\'enregistrement du message', 500);
        }
    }
    
    /**
     * Récupérer tous les messages de contact (pour API)
     */
    private function getContacts() {
        try {
            $this->ensureContactTableExists();
            
            $limit = isset($_GET['limit']) ? (int)$_GET['limit'] : 100;
            $status = $_GET['status'] ?? null;
            
            $sql = "SELECT * FROM contact_requests";
            $params = [];
            
            if ($status) {
                $sql .= " WHERE status = ?";
                $params[] = $status;
            }
            
            $sql .= " ORDER BY created_at DESC LIMIT ?";
            $params[] = $limit;
            
            $stmt = $this->pdo->prepare($sql);
            $stmt->execute($params);
            $contacts = $stmt->fetchAll();
            
            return $this->success($contacts);
            
        } catch (PDOException $e) {
            error_log("Erreur récupération contacts: " . $e->getMessage());
            return $this->error('Erreur lors de la récupération des messages', 500);
        }
    }
    
    /**
     * S'assurer que la table contact_requests existe
     */
    private function ensureContactTableExists() {
        $sql = "CREATE TABLE IF NOT EXISTS contact_requests (
            id INT AUTO_INCREMENT PRIMARY KEY,
            first_name VARCHAR(100) NOT NULL,
            last_name VARCHAR(100) NOT NULL,
            email VARCHAR(255) NOT NULL,
            phone VARCHAR(20) NOT NULL,
            message TEXT NOT NULL,
            type VARCHAR(50) NOT NULL,
            subject VARCHAR(255),
            status VARCHAR(20) DEFAULT 'new',
            ip_address VARCHAR(45) DEFAULT NULL,
            created_at DATETIME NOT NULL,
            updated_at DATETIME DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
            INDEX idx_email (email),
            INDEX idx_type (type),
            INDEX idx_status (status),
            INDEX idx_created_at (created_at),
            INDEX idx_ip_address (ip_address)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci";

        $this->pdo->exec($sql);

        // Ajouter la colonne ip_address si elle n'existe pas encore (migration)
        $cols = $this->pdo->query("SHOW COLUMNS FROM contact_requests LIKE 'ip_address'")->rowCount();
        if ($cols === 0) {
            $this->pdo->exec("ALTER TABLE contact_requests ADD COLUMN ip_address VARCHAR(45) DEFAULT NULL, ADD INDEX idx_ip_address (ip_address)");
        }
    }

    private function verifyRecaptcha(string $token): bool {
        $secretKey = getenv('RECAPTCHA_SECRET_KEY') ?: '';
        // Si pas de clé configurée, on skip la vérification (dev/local)
        if (empty($secretKey)) {
            return true;
        }
        if (empty($token)) {
            return false;
        }
        $response = @file_get_contents(
            'https://www.google.com/recaptcha/api/siteverify?secret=' . urlencode($secretKey) . '&response=' . urlencode($token)
        );
        if ($response === false) {
            return false;
        }
        $result = json_decode($response, true);
        return !empty($result['success']);
    }
    
    /**
     * Envoyer un email de notification
     * 
     * Supporte plusieurs méthodes :
     * 1. SendGrid (API) - Gratuit 100/jour ⭐ RECOMMANDÉ
     * 2. SMTP Gmail - Gratuit 500/jour
     * 3. SMTP Générique - Pour tout serveur SMTP
     * 
     * Configuration dans les constantes en haut du fichier
     */
    private function sendContactEmail($data) {
        // Email de destination (modifiez selon vos besoins)
        $toEmail = 'belallfym@gmail.com'; // ⚠️ REMPLACER par votre email
        $toName = 'JDC Auto';
        
        // Sujet de l'email
        $subject = 'Nouvelle demande de contact - ' . ($data['type'] ?? 'Contact');
        
        // Corps de l'email
        $message = "Nouvelle demande de contact reçue\n\n";
        $message .= "Type: " . ($data['type'] ?? 'N/A') . "\n";
        $message .= "Nom: " . ($data['first_name'] ?? '') . " " . ($data['last_name'] ?? '') . "\n";
        $message .= "Email: " . ($data['email'] ?? '') . "\n";
        $message .= "Téléphone: " . ($data['phone'] ?? '') . "\n";
        if (!empty($data['subject'])) {
            $message .= "Sujet: " . $data['subject'] . "\n";
        }
        $message .= "\nMessage:\n" . ($data['message'] ?? '');
        
        // Essayer SendGrid d'abord
        if (defined('SENDGRID_API_KEY') && !empty(SENDGRID_API_KEY)) {
            return $this->sendViaSendGrid($toEmail, $toName, $subject, $message);
        }
        
        // Sinon essayer SMTP Gmail
        if (defined('SMTP_GMAIL_USER') && !empty(SMTP_GMAIL_USER)) {
            return $this->sendViaSMTPGmail($toEmail, $toName, $subject, $message);
        }
        
        // Sinon essayer SMTP générique
        if (defined('SMTP_HOST') && !empty(SMTP_HOST)) {
            return $this->sendViaSMTP($toEmail, $toName, $subject, $message);
        }
        
        // Si aucune méthode configurée, juste logger
        error_log("📧 Email non envoyé - Aucune méthode configurée");
        error_log("📧 Message stocké en base (ID: " . ($data['id'] ?? 'N/A') . ")");
        error_log("📧 Consultez les messages via: /api/view_contacts.php");
        error_log("📧 Pour activer l'email, voir EMAIL-SOLUTIONS.md");
        
        return false;
    }
    
    /**
     * Envoyer via SendGrid API
     */
    private function sendViaSendGrid($toEmail, $toName, $subject, $message) {
        if (!defined('SENDGRID_API_KEY') || empty(SENDGRID_API_KEY)) {
            return false;
        }
        
        $fromEmail = defined('SENDGRID_FROM_EMAIL') ? SENDGRID_FROM_EMAIL : 'contact@jdcauto.fr';
        $fromName = defined('SENDGRID_FROM_NAME') ? SENDGRID_FROM_NAME : 'JDC Auto';
        
        $data = [
            'personalizations' => [[
                'to' => [[
                    'email' => $toEmail,
                    'name' => $toName
                ]]
            ]],
            'from' => [
                'email' => $fromEmail,
                'name' => $fromName
            ],
            'subject' => $subject,
            'content' => [[
                'type' => 'text/plain',
                'value' => $message
            ]]
        ];
        
        $ch = curl_init('https://api.sendgrid.com/v3/mail/send');
        curl_setopt($ch, CURLOPT_POST, true);
        curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
        curl_setopt($ch, CURLOPT_HTTPHEADER, [
            'Authorization: Bearer ' . SENDGRID_API_KEY,
            'Content-Type: application/json'
        ]);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        
        $response = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);
        
        if ($httpCode >= 200 && $httpCode < 300) {
            error_log("✅ Email envoyé via SendGrid à $toEmail");
            return true;
        } else {
            error_log("❌ Erreur SendGrid (HTTP $httpCode): $response");
            return false;
        }
    }
    
    /**
     * Envoyer via SMTP Gmail
     */
    private function sendViaSMTPGmail($toEmail, $toName, $subject, $message) {
        if (!defined('SMTP_GMAIL_USER') || !defined('SMTP_GMAIL_PASS')) {
            return false;
        }
        
        return $this->sendViaSMTP(
            $toEmail,
            $toName,
            $subject,
            $message,
            'smtp.gmail.com',
            587,
            SMTP_GMAIL_USER,
            SMTP_GMAIL_PASS,
            'tls'
        );
    }
    
    /**
     * Envoyer via SMTP générique
     */
    private function sendViaSMTP($toEmail, $toName, $subject, $message, $host = null, $port = null, $username = null, $password = null, $encryption = 'tls') {
        // Utiliser les constantes si les paramètres ne sont pas fournis
        if ($host === null) {
            if (!defined('SMTP_HOST')) return false;
            $host = SMTP_HOST;
            $port = defined('SMTP_PORT') ? SMTP_PORT : 587;
            $username = defined('SMTP_USER') ? SMTP_USER : '';
            $password = defined('SMTP_PASS') ? SMTP_PASS : '';
            $encryption = defined('SMTP_ENCRYPTION') ? SMTP_ENCRYPTION : 'tls';
        }
        
        $fromEmail = defined('SMTP_FROM_EMAIL') ? SMTP_FROM_EMAIL : 'contact@jdcauto.fr';
        $fromName = defined('SMTP_FROM_NAME') ? SMTP_FROM_NAME : 'JDC Auto';
        
        try {
            // Connexion au serveur SMTP
            $socket = @fsockopen($host, $port, $errno, $errstr, 30);
            if (!$socket) {
                error_log("❌ Erreur connexion SMTP: $errstr ($errno)");
                return false;
            }
            
            // Lire la réponse initiale
            $response = fgets($socket, 515);
            if (substr($response, 0, 3) !== '220') {
                error_log("❌ Erreur SMTP initial: $response");
                fclose($socket);
                return false;
            }
            
            // EHLO
            fputs($socket, "EHLO $host\r\n");
            $response = fgets($socket, 515);
            
            // STARTTLS si nécessaire
            if ($encryption === 'tls') {
                fputs($socket, "STARTTLS\r\n");
                $response = fgets($socket, 515);
                if (substr($response, 0, 3) === '220') {
                    stream_socket_enable_crypto($socket, true, STREAM_CRYPTO_METHOD_TLS_CLIENT);
                    fputs($socket, "EHLO $host\r\n");
                    $response = fgets($socket, 515);
                }
            }
            
            // Authentification
            if (!empty($username)) {
                fputs($socket, "AUTH LOGIN\r\n");
                $response = fgets($socket, 515);
                
                fputs($socket, base64_encode($username) . "\r\n");
                $response = fgets($socket, 515);
                
                fputs($socket, base64_encode($password) . "\r\n");
                $response = fgets($socket, 515);
                
                if (substr($response, 0, 3) !== '235') {
                    error_log("❌ Erreur authentification SMTP: $response");
                    fclose($socket);
                    return false;
                }
            }
            
            // FROM
            fputs($socket, "MAIL FROM: <$fromEmail>\r\n");
            $response = fgets($socket, 515);
            
            // TO
            fputs($socket, "RCPT TO: <$toEmail>\r\n");
            $response = fgets($socket, 515);
            
            // DATA
            fputs($socket, "DATA\r\n");
            $response = fgets($socket, 515);
            
            // Headers et corps
            $emailData = "From: $fromName <$fromEmail>\r\n";
            $emailData .= "To: $toName <$toEmail>\r\n";
            $emailData .= "Subject: $subject\r\n";
            $emailData .= "Content-Type: text/plain; charset=UTF-8\r\n";
            $emailData .= "\r\n";
            $emailData .= $message;
            $emailData .= "\r\n.\r\n";
            
            fputs($socket, $emailData);
            $response = fgets($socket, 515);
            
            // QUIT
            fputs($socket, "QUIT\r\n");
            fclose($socket);
            
            if (substr($response, 0, 3) === '250') {
                error_log("✅ Email envoyé via SMTP à $toEmail");
                return true;
            } else {
                error_log("❌ Erreur envoi SMTP: $response");
                return false;
            }
            
        } catch (Exception $e) {
            error_log("❌ Exception SMTP: " . $e->getMessage());
            return false;
        }
    }
    
    private function error($message, $code = 400) {
        http_response_code($code);
        echo json_encode([
            'success' => false,
            'error' => $message,
            'timestamp' => date('c')
        ], JSON_UNESCAPED_UNICODE);
        exit;
    }
}

// Point d'entrée
$api = new SimpleVehiclesAPI();
$api->handleRequest();

?>
