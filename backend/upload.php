<?php
require_once __DIR__ . '/config.php';
require_once __DIR__ . '/fonctions.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    json_error('Utiliser POST (multipart/form-data)', 405);
}
if (!isset($_FILES['fichier'])) {
    json_error('Aucun fichier reçu (champ "fichier")', 422);
}

$allowed = ['jpg','jpeg','png','gif','webp'];
$maxBytes = 5 * 1024 * 1024; // 5MB

$err = $_FILES['fichier']['error'];
if ($err !== UPLOAD_ERR_OK) {
    json_error('Erreur upload: code '.$err, 400);
}
if ($_FILES['fichier']['size'] > $maxBytes) {
    json_error('Fichier trop volumineux (>5MB)', 413);
}

$ext = strtolower(pathinfo($_FILES['fichier']['name'], PATHINFO_EXTENSION));
if (!in_array($ext, $allowed, true)) {
    json_error('Extension non autorisée. Utilise jpg, jpeg, png, gif, webp', 422);
}

$basename = preg_replace('/[^a-zA-Z0-9_-]+/', '-', pathinfo($_FILES['fichier']['name'], PATHINFO_FILENAME));
$filename = $basename . '-' . date('YmdHis') . '.' . $ext;
$target = __DIR__ . '/uploads/' . $filename;

if (!is_dir(__DIR__ . '/uploads')) { mkdir(__DIR__ . '/uploads', 0775, true); }

if (!move_uploaded_file($_FILES['fichier']['tmp_name'], $target)) {
    json_error('Impossible d'enregistrer le fichier', 500);
}

$relativeUrl = 'backend/uploads/' . $filename; // depuis la racine projet quand servi ensemble
json_response(['ok' => true, 'chemin_fichier' => $relativeUrl, 'nom' => $filename]);
