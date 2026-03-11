<?php

return [
    // En production, définissez ADMIN_USERNAME et soit ADMIN_PASSWORD_HASH, soit ADMIN_PASSWORD.
    // Pour un secret hors dépôt, créez htdocs/config/admin_auth.local.php sur le serveur.
    'username' => null,
    'password' => null,
    'password_hash' => null,
    'session_timeout_minutes' => 30,
];
