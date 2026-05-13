<?php
// Script usage unique — supprimer après utilisation
if (($_GET['token'] ?? '') !== 'jdcauto_sync_2024_secret') {
    http_response_code(403);
    die(json_encode(['error' => 'Interdit']));
}

require_once __DIR__ . '/../config/mysql_gandi.php';
$pdo = GandiDatabaseConfig::getConnection();

$references = [
    '1553-0000073', // FIAT DUCATO
    '1553-0000096', // VOLKSWAGEN PASSAT
    '1553-0000101', // RENAULT CLIO
    '1553-0000129', // RENAULT TWINGO
    '1553-0000135', // VOLKSWAGEN POLO
    '1553-0000150', // MINI MINI
    '1553-0000153', // PORSCHE 911
    '1553-0000155', // BMW SERIE 1
    '1553-0000156', // LAMBORGHINI URUS
    '1553-0000160', // PEUGEOT 308
    '1553-0000161', // RENAULT CAPTUR
    '1553-0000001', // AUDI RS Q3
    '1553-0000089', // BMW SERIE 1
    '1553-0000116', // TOYOTA YARIS
    '1553-0000158', // CITROEN C3
];

$placeholders = implode(',', array_fill(0, count($references), '?'));

$ids = $pdo->prepare("SELECT id FROM vehicles WHERE reference IN ($placeholders)");
$ids->execute($references);
$vehicleIds = array_map('intval', $ids->fetchAll(PDO::FETCH_COLUMN));

if (empty($vehicleIds)) {
    die(json_encode(['message' => 'Aucun véhicule trouvé', 'deleted' => 0]));
}

$idPlaceholders = implode(',', array_fill(0, count($vehicleIds), '?'));

$pdo->beginTransaction();
$pdo->prepare("DELETE FROM vehicle_photos WHERE vehicle_id IN ($idPlaceholders)")->execute($vehicleIds);
$pdo->prepare("DELETE FROM vehicle_options WHERE vehicle_id IN ($idPlaceholders)")->execute($vehicleIds);
$stmt = $pdo->prepare("DELETE FROM vehicles WHERE id IN ($idPlaceholders)");
$stmt->execute($vehicleIds);
$pdo->commit();

header('Content-Type: application/json');
echo json_encode(['success' => true, 'deleted' => $stmt->rowCount(), 'ids' => $vehicleIds]);
