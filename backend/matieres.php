<?php
require_once __DIR__ . '/config.php';
require_once __DIR__ . '/fonctions.php';

$method = $_SERVER['REQUEST_METHOD'];
$pdo = db();

try {
    if ($method === 'GET') {
        // Lister toutes les matières
        $stmt = $pdo->query('SELECT ID_MATIERE, NOM_MATIERE FROM T_MATIERE ORDER BY NOM_MATIERE');
        json_response(['ok' => true, 'data' => $stmt->fetchAll()]);
    }

    if ($method === 'POST') {
        $data = $_POST ?: get_json_input();
        required($data, ['nom_matiere']);
        $stmt = $pdo->prepare('INSERT INTO T_MATIERE (NOM_MATIERE) VALUES (?)');
        $stmt->execute([$data['nom_matiere']]);
        json_response(['ok' => true, 'id' => $pdo->lastInsertId()]);
    }

    if ($method === 'PUT') {
        parse_str($_SERVER['QUERY_STRING'] ?? '', $qs);
        $id = isset($qs['id']) ? (int)$qs['id'] : 0;
        if ($id <= 0) json_error('ID invalide', 400);
        $data = get_json_input();
        required($data, ['nom_matiere']);
        $stmt = $pdo->prepare('UPDATE T_MATIERE SET NOM_MATIERE=? WHERE ID_MATIERE=?');
        $stmt->execute([$data['nom_matiere'], $id]);
        json_response(['ok' => true]);
    }

    if ($method === 'DELETE') {
        parse_str($_SERVER['QUERY_STRING'] ?? '', $qs);
        $id = isset($qs['id']) ? (int)$qs['id'] : 0;
        if ($id <= 0) json_error('ID invalide', 400);
        $stmt = $pdo->prepare('DELETE FROM T_MATIERE WHERE ID_MATIERE=?');
        $stmt->execute([$id]);
        json_response(['ok' => true]);
    }

    json_error('Méthode non supportée', 405);
} catch (PDOException $e) {
    json_error('Erreur SQL: ' . $e->getMessage(), 500);
}
