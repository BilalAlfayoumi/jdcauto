<?php
http_response_code(410);
header('Content-Type: application/json');
echo json_encode([
    'error' => 'Ce script est obsolète. Utiliser spider_vo_sync.php avec le token approprié.',
    'deprecated' => true
]);
