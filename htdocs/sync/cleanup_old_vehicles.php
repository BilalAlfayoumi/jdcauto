<?php
// Script désactivé — tâche accomplie
http_response_code(410);
die(json_encode(['error' => 'Script désactivé']));

$host     = 'localhost';
$dbname   = 'jdcauto';
$username = 'root';
$password = '';

$pdo = new PDO(
    "mysql:host=$host;dbname=$dbname;charset=utf8mb4",
    $username,
    $password,
    [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION]
);

$references = [
    '1553-0000073', '1553-0000096', '1553-0000101', '1553-0000129',
    '1553-0000135', '1553-0000150', '1553-0000153', '1553-0000155',
    '1553-0000156', '1553-0000160', '1553-0000161', '1553-0000001',
    '1553-0000089', '1553-0000116', '1553-0000158',
];

$ph = implode(',', array_fill(0, count($references), '?'));
$ids = $pdo->prepare("SELECT id FROM vehicles WHERE reference IN ($ph)");
$ids->execute($references);
$vehicleIds = array_map('intval', $ids->fetchAll(PDO::FETCH_COLUMN));

if (empty($vehicleIds)) {
    header('Content-Type: application/json');
    die(json_encode(['message' => 'Aucun véhicule trouvé', 'deleted' => 0]));
}

$idPh = implode(',', array_fill(0, count($vehicleIds), '?'));

$pdo->beginTransaction();
$pdo->prepare("DELETE FROM vehicle_photos WHERE vehicle_id IN ($idPh)")->execute($vehicleIds);
if ($pdo->query("SHOW TABLES LIKE 'vehicle_options'")->rowCount() > 0) {
    $pdo->prepare("DELETE FROM vehicle_options WHERE vehicle_id IN ($idPh)")->execute($vehicleIds);
}
$stmt = $pdo->prepare("DELETE FROM vehicles WHERE id IN ($idPh)");
$stmt->execute($vehicleIds);
$pdo->commit();

header('Content-Type: application/json');
echo json_encode(['success' => true, 'deleted' => $stmt->rowCount(), 'ids' => $vehicleIds]);
