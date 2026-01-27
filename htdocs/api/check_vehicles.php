<?php
/**
 * Script de diagnostic - Vérification des véhicules dans la base
 */

// Configuration base de données Gandi
define('DB_HOST', 'localhost');
define('DB_NAME', 'jdcauto');
define('DB_USER', 'root');
define('DB_PASS', '');

header('Content-Type: text/html; charset=utf-8');
?>
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Diagnostic Véhicules - JDC Auto</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif;
            background: #f3f4f6;
            padding: 20px;
            color: #1f2937;
        }
        .container {
            max-width: 1200px;
            margin: 0 auto;
            background: white;
            padding: 30px;
            border-radius: 10px;
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
        }
        h1 {
            color: #dc2626;
            margin-bottom: 20px;
            font-size: 2em;
        }
        .stat-box {
            background: #f9fafb;
            border: 2px solid #e5e7eb;
            padding: 20px;
            margin: 15px 0;
            border-radius: 8px;
        }
        .stat-box h2 {
            color: #dc2626;
            margin-bottom: 10px;
            font-size: 1.3em;
        }
        .stat {
            display: inline-block;
            background: #dc2626;
            color: white;
            padding: 5px 15px;
            border-radius: 5px;
            font-weight: bold;
            margin: 5px 5px 5px 0;
        }
        table {
            width: 100%;
            border-collapse: collapse;
            margin: 20px 0;
        }
        th, td {
            padding: 12px;
            text-align: left;
            border-bottom: 1px solid #e5e7eb;
        }
        th {
            background: #dc2626;
            color: white;
            font-weight: bold;
        }
        tr:hover {
            background: #f9fafb;
        }
        .error {
            background: #fee;
            border: 2px solid #dc2626;
            color: #991b1b;
            padding: 15px;
            border-radius: 8px;
            margin: 15px 0;
        }
        .success {
            background: #f0fdf4;
            border: 2px solid #10b981;
            color: #065f46;
            padding: 15px;
            border-radius: 8px;
            margin: 15px 0;
        }
        .warning {
            background: #fffbeb;
            border: 2px solid #f59e0b;
            color: #92400e;
            padding: 15px;
            border-radius: 8px;
            margin: 15px 0;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>🔍 Diagnostic Véhicules - JDC Auto</h1>
        
        <?php
        try {
            $pdo = new PDO(
                "mysql:host=" . DB_HOST . ";dbname=" . DB_NAME . ";charset=utf8mb4",
                DB_USER,
                DB_PASS,
                [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION]
            );
            
            echo '<div class="success">✅ Connexion à la base de données réussie</div>';
            
            // Statistiques générales
            $stmt = $pdo->query("SELECT COUNT(*) as total FROM vehicles");
            $total = $stmt->fetch(PDO::FETCH_ASSOC)['total'];
            
            $stmt = $pdo->query("SELECT COUNT(*) as total FROM vehicles WHERE etat = 'Disponible'");
            $disponibles = $stmt->fetch(PDO::FETCH_ASSOC)['total'];
            
            $stmt = $pdo->query("SELECT COUNT(DISTINCT marque) as total FROM vehicles");
            $marques = $stmt->fetch(PDO::FETCH_ASSOC)['total'];
            
            echo '<div class="stat-box">';
            echo '<h2>📊 Statistiques générales</h2>';
            echo '<p><span class="stat">Total: ' . $total . '</span>';
            echo '<span class="stat" style="background: #10b981;">Disponibles: ' . $disponibles . '</span>';
            echo '<span class="stat" style="background: #3b82f6;">Marques: ' . $marques . '</span></p>';
            echo '</div>';
            
            // Recherche PORSCHE et LAMBORGHINI
            echo '<div class="stat-box">';
            echo '<h2>🔎 Recherche PORSCHE et LAMBORGHINI</h2>';
            
            $stmt = $pdo->prepare("SELECT * FROM vehicles WHERE marque IN ('PORSCHE', 'LAMBORGHINI') ORDER BY id DESC");
            $stmt->execute();
            $luxe = $stmt->fetchAll(PDO::FETCH_ASSOC);
            
            if (count($luxe) > 0) {
                echo '<div class="success">✅ ' . count($luxe) . ' véhicule(s) PORSCHE/LAMBORGHINI trouvé(s) dans la base</div>';
                echo '<table>';
                echo '<tr><th>ID</th><th>Marque</th><th>Modèle</th><th>Prix</th><th>Km</th><th>Année</th><th>État</th><th>Créé le</th></tr>';
                foreach ($luxe as $v) {
                    $etatClass = $v['etat'] === 'Disponible' ? 'success' : 'warning';
                    echo '<tr>';
                    echo '<td>' . htmlspecialchars($v['id']) . '</td>';
                    echo '<td><strong>' . htmlspecialchars($v['marque']) . '</strong></td>';
                    echo '<td>' . htmlspecialchars($v['modele']) . '</td>';
                    echo '<td>' . number_format($v['prix_vente'] ?? 0, 0, ',', ' ') . ' €</td>';
                    echo '<td>' . number_format($v['kilometrage'] ?? 0, 0, ',', ' ') . ' km</td>';
                    echo '<td>' . htmlspecialchars($v['annee'] ?? 'N/A') . '</td>';
                    echo '<td><span class="' . $etatClass . '">' . htmlspecialchars($v['etat'] ?? 'N/A') . '</span></td>';
                    echo '<td>' . htmlspecialchars($v['created_at'] ?? 'N/A') . '</td>';
                    echo '</tr>';
                }
                echo '</table>';
            } else {
                echo '<div class="error">❌ Aucun véhicule PORSCHE ou LAMBORGHINI trouvé dans la base de données</div>';
            }
            echo '</div>';
            
            // Vérification API
            echo '<div class="stat-box">';
            echo '<h2>🌐 Test API</h2>';
            
            $apiUrl = 'https://www.jdcauto.fr/api/index.php?action=vehicles&limit=100';
            $ch = curl_init($apiUrl);
            curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
            curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
            $apiResponse = curl_exec($ch);
            $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
            curl_close($ch);
            
            if ($httpCode === 200) {
                $apiData = json_decode($apiResponse, true);
                if ($apiData && isset($apiData['data'])) {
                    $apiVehicles = $apiData['data'];
                    $porscheLamborghini = array_filter($apiVehicles, function($v) {
                        return in_array(strtoupper($v['brand'] ?? ''), ['PORSCHE', 'LAMBORGHINI']);
                    });
                    
                    echo '<div class="success">✅ API répond correctement (' . count($apiVehicles) . ' véhicules retournés)</div>';
                    
                    if (count($porscheLamborghini) > 0) {
                        echo '<div class="success">✅ ' . count($porscheLamborghini) . ' véhicule(s) PORSCHE/LAMBORGHINI dans la réponse API</div>';
                    } else {
                        echo '<div class="warning">⚠️ Aucun véhicule PORSCHE/LAMBORGHINI dans la réponse API</div>';
                    }
                } else {
                    echo '<div class="error">❌ Réponse API invalide</div>';
                }
            } else {
                echo '<div class="error">❌ Erreur API (HTTP ' . $httpCode . ')</div>';
            }
            echo '</div>';
            
            // Toutes les marques présentes
            echo '<div class="stat-box">';
            echo '<h2>📋 Toutes les marques dans la base</h2>';
            $stmt = $pdo->query("SELECT marque, COUNT(*) as count, COUNT(CASE WHEN etat = 'Disponible' THEN 1 END) as disponibles FROM vehicles GROUP BY marque ORDER BY count DESC");
            $marquesList = $stmt->fetchAll(PDO::FETCH_ASSOC);
            
            echo '<table>';
            echo '<tr><th>Marque</th><th>Total</th><th>Disponibles</th></tr>';
            foreach ($marquesList as $m) {
                echo '<tr>';
                echo '<td><strong>' . htmlspecialchars($m['marque']) . '</strong></td>';
                echo '<td>' . $m['count'] . '</td>';
                echo '<td>' . $m['disponibles'] . '</td>';
                echo '</tr>';
            }
            echo '</table>';
            echo '</div>';
            
            // Vérification des dernières modifications
            echo '<div class="stat-box">';
            echo '<h2>🕐 Dernières modifications (30 dernières minutes)</h2>';
            $stmt = $pdo->query("SELECT id, marque, modele, etat, updated_at, created_at FROM vehicles WHERE updated_at >= DATE_SUB(NOW(), INTERVAL 30 MINUTE) OR created_at >= DATE_SUB(NOW(), INTERVAL 30 MINUTE) ORDER BY updated_at DESC, created_at DESC LIMIT 20");
            $recent = $stmt->fetchAll(PDO::FETCH_ASSOC);
            
            if (count($recent) > 0) {
                echo '<table>';
                echo '<tr><th>ID</th><th>Marque</th><th>Modèle</th><th>État</th><th>Créé</th><th>Modifié</th></tr>';
                foreach ($recent as $r) {
                    echo '<tr>';
                    echo '<td>' . htmlspecialchars($r['id']) . '</td>';
                    echo '<td><strong>' . htmlspecialchars($r['marque']) . '</strong></td>';
                    echo '<td>' . htmlspecialchars($r['modele']) . '</td>';
                    echo '<td>' . htmlspecialchars($r['etat']) . '</td>';
                    echo '<td>' . htmlspecialchars($r['created_at']) . '</td>';
                    echo '<td>' . htmlspecialchars($r['updated_at'] ?? 'N/A') . '</td>';
                    echo '</tr>';
                }
                echo '</table>';
            } else {
                echo '<p>Aucune modification récente (30 dernières minutes)</p>';
            }
            echo '</div>';
            
            // Vérification logs de synchronisation
            echo '<div class="stat-box">';
            echo '<h2>📝 Derniers logs de synchronisation</h2>';
            try {
                $stmt = $pdo->query("SELECT * FROM sync_logs ORDER BY created_at DESC LIMIT 10");
                $logs = $stmt->fetchAll(PDO::FETCH_ASSOC);
                
                if (count($logs) > 0) {
                    echo '<table>';
                    echo '<tr><th>Date</th><th>Type</th><th>Message</th><th>Véhicules ajoutés</th><th>Véhicules mis à jour</th></tr>';
                    foreach ($logs as $log) {
                        echo '<tr>';
                        echo '<td>' . htmlspecialchars($log['created_at']) . '</td>';
                        echo '<td>' . htmlspecialchars($log['sync_type'] ?? 'N/A') . '</td>';
                        echo '<td>' . htmlspecialchars($log['message'] ?? 'N/A') . '</td>';
                        echo '<td>' . ($log['vehicles_added'] ?? 0) . '</td>';
                        echo '<td>' . ($log['vehicles_updated'] ?? 0) . '</td>';
                        echo '</tr>';
                    }
                    echo '</table>';
                } else {
                    echo '<p>Aucun log de synchronisation trouvé</p>';
                }
            } catch (PDOException $e) {
                echo '<div class="warning">⚠️ Table sync_logs non trouvée ou erreur: ' . htmlspecialchars($e->getMessage()) . '</div>';
            }
            echo '</div>';
            
        } catch (PDOException $e) {
            echo '<div class="error">❌ Erreur de connexion: ' . htmlspecialchars($e->getMessage()) . '</div>';
        }
        ?>
        
        <div class="stat-box">
            <h2>🔗 Liens utiles</h2>
            <p>
                <a href="/api/index.php?action=vehicles&limit=100" target="_blank">Test API direct</a> |
                <a href="/api/test.php" target="_blank">Test base de données</a> |
                <a href="/sync/check_data.php" target="_blank">Vérifier données import</a>
            </p>
        </div>
    </div>
</body>
</html>

