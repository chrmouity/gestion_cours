<?php
// backend/config.php
// Modifie les constantes ci-dessous selon ta machine locale.
const DB_HOST = '127.0.0.1';
const DB_NAME = 'gestion_cours';
const DB_USER = 'root';
const DB_PASS = '';
const UPLOAD_DIR = __DIR__ . '/uploads'; // chemin serveur
const UPLOAD_URL_BASE = '../backend/uploads'; // chemin web relatif depuis frontend

function db(): PDO {
    static $pdo = null;
    if ($pdo === null) {
        $dsn = 'mysql:host=' . DB_HOST . ';dbname=' . DB_NAME . ';charset=utf8mb4';
        $pdo = new PDO($dsn, DB_USER, DB_PASS, [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES => false,
        ]);
    }
    return $pdo;
}
