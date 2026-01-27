<?php
/**
 * Page pour voir les messages de contact reçus
 * ⚠️ À protéger par mot de passe en production !
 */

require_once __DIR__ . '/index.php';

class GandiDatabaseConfig {
    private static $host = 'localhost';
    private static $dbname = 'jdcauto';
    private static $username = 'root';
    private static $password = '';
    
    public static function getConnection() {
        $dsn = "mysql:host=" . self::$host . ";dbname=" . self::$dbname . ";charset=utf8mb4";
        return new PDO($dsn, self::$username, self::$password, [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC
        ]);
    }
}

header('Content-Type: text/html; charset=utf-8');

try {
    $pdo = GandiDatabaseConfig::getConnection();
    
    // Vérifier si la table existe
    $tableExists = false;
    $result = $pdo->query("SHOW TABLES LIKE 'contact_requests'");
    if ($result->rowCount() > 0) {
        $tableExists = true;
    }
    
    if (!$tableExists) {
        echo "<!DOCTYPE html><html><head><title>Messages de contact</title>";
        echo "<style>body{font-family:Arial,sans-serif;max-width:1200px;margin:20px auto;padding:20px;}</style></head><body>";
        echo "<h1>📧 Messages de contact</h1>";
        echo "<p style='color:red;'>❌ La table contact_requests n'existe pas encore.</p>";
        echo "<p>Envoyez un premier message via le formulaire de contact pour créer la table automatiquement.</p>";
        echo "</body></html>";
        exit;
    }
    
    // Récupérer tous les messages
    $stmt = $pdo->query("SELECT * FROM contact_requests ORDER BY created_at DESC");
    $messages = $stmt->fetchAll();
    
    echo "<!DOCTYPE html><html><head><title>Messages de contact</title>";
    echo "<style>
        body{font-family:Arial,sans-serif;max-width:1200px;margin:20px auto;padding:20px;background:#f5f5f5;}
        h1{color:#dc2626;}
        .message{background:white;border-radius:8px;padding:20px;margin-bottom:20px;box-shadow:0 2px 4px rgba(0,0,0,0.1);}
        .message-header{display:flex;justify-content:space-between;align-items:center;margin-bottom:15px;padding-bottom:15px;border-bottom:2px solid #e5e5e5;}
        .message-type{display:inline-block;padding:4px 12px;border-radius:4px;font-size:12px;font-weight:bold;}
        .type-achat{background:#fee2e2;color:#991b1b;}
        .type-carte_grise{background:#dbeafe;color:#1e40af;}
        .message-info{display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:15px;margin-bottom:15px;}
        .info-item strong{display:block;color:#666;font-size:12px;margin-bottom:4px;}
        .info-item span{color:#333;font-size:14px;}
        .message-text{background:#f9fafb;padding:15px;border-radius:6px;border-left:4px solid #dc2626;margin-top:15px;}
        .message-date{color:#999;font-size:12px;}
        .stats{background:white;padding:20px;border-radius:8px;margin-bottom:20px;box-shadow:0 2px 4px rgba(0,0,0,0.1);}
        .stats-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:15px;text-align:center;}
        .stat-item{padding:15px;background:#f9fafb;border-radius:6px;}
        .stat-number{font-size:32px;font-weight:bold;color:#dc2626;}
        .stat-label{font-size:14px;color:#666;margin-top:5px;}
    </style></head><body>";
    
    echo "<h1>📧 Messages de contact reçus</h1>";
    
    // Statistiques
    $total = count($messages);
    $achat = count(array_filter($messages, fn($m) => $m['type'] === 'achat'));
    $carteGrise = count(array_filter($messages, fn($m) => $m['type'] === 'carte_grise'));
    $nouveaux = count(array_filter($messages, fn($m) => $m['status'] === 'new'));
    
    echo "<div class='stats'>";
    echo "<div class='stats-grid'>";
    echo "<div class='stat-item'><div class='stat-number'>$total</div><div class='stat-label'>Total</div></div>";
    echo "<div class='stat-item'><div class='stat-number'>$achat</div><div class='stat-label'>Achat</div></div>";
    echo "<div class='stat-item'><div class='stat-number'>$carteGrise</div><div class='stat-label'>Carte grise</div></div>";
    echo "<div class='stat-item'><div class='stat-number'>$nouveaux</div><div class='stat-label'>Nouveaux</div></div>";
    echo "</div></div>";
    
    if (empty($messages)) {
        echo "<p style='text-align:center;padding:40px;color:#666;'>Aucun message reçu pour le moment.</p>";
    } else {
        foreach ($messages as $msg) {
            $typeClass = $msg['type'] === 'achat' ? 'type-achat' : 'type-carte_grise';
            $typeLabel = $msg['type'] === 'achat' ? '🚗 Achat de véhicule' : '📄 Carte grise';
            
            echo "<div class='message'>";
            echo "<div class='message-header'>";
            echo "<div>";
            echo "<span class='message-type $typeClass'>$typeLabel</span>";
            echo "<h3 style='margin:10px 0 0 0;'>" . htmlspecialchars($msg['first_name'] . ' ' . $msg['last_name']) . "</h3>";
            echo "</div>";
            echo "<div class='message-date'>" . date('d/m/Y H:i', strtotime($msg['created_at'])) . "</div>";
            echo "</div>";
            
            echo "<div class='message-info'>";
            echo "<div class='info-item'><strong>Email</strong><span>" . htmlspecialchars($msg['email']) . "</span></div>";
            echo "<div class='info-item'><strong>Téléphone</strong><span>" . htmlspecialchars($msg['phone']) . "</span></div>";
            echo "<div class='info-item'><strong>Statut</strong><span>" . htmlspecialchars($msg['status']) . "</span></div>";
            if ($msg['subject']) {
                echo "<div class='info-item'><strong>Sujet</strong><span>" . htmlspecialchars($msg['subject']) . "</span></div>";
            }
            echo "</div>";
            
            echo "<div class='message-text'>";
            echo "<strong>Message:</strong><br>";
            echo nl2br(htmlspecialchars($msg['message']));
            echo "</div>";
            
            echo "</div>";
        }
    }
    
    echo "</body></html>";
    
} catch (Exception $e) {
    echo "<!DOCTYPE html><html><head><title>Erreur</title></head><body>";
    echo "<h1>❌ Erreur</h1>";
    echo "<p>" . htmlspecialchars($e->getMessage()) . "</p>";
    echo "</body></html>";
}

