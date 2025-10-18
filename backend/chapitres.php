<?php
require_once __DIR__ . '/config.php';
require_once __DIR__ . '/fonctions.php';

$method = $_SERVER['REQUEST_METHOD'];
$pdo = db();

try {
    if ($method === 'GET') {
        $id_matiere = isset($_GET['id_matiere']) ? (int)$_GET['id_matiere'] : 0;
        if ($id_matiere <= 0) json_error('id_matiere requis', 422);

        $stmt = $pdo->prepare(
            'SELECT ID_CHAPITRE, NOM_CHAPITRE, CHEMIN_FICHIER, ID_MATIERE
             FROM T_CHAPITRE
             WHERE ID_MATIERE = ?
             ORDER BY ID_CHAPITRE DESC'
        );
        $stmt->execute([$id_matiere]);
        json_response(['ok' => true, 'data' => $stmt->fetchAll()]);
    }

    if ($method === 'POST') {
        $data = $_POST ?: get_json_input();
        required($data, ['nom_chapitre', 'id_matiere']); // image optionnelle

        $nom_chapitre = trim($data['nom_chapitre'] ?? '');
        $id_matiere   = (int)($data['id_matiere'] ?? 0);
        $chemin       = isset($data['chemin_fichier']) ? trim((string)$data['chemin_fichier']) : null;

        if ($nom_chapitre === '' || $id_matiere <= 0) {
            json_error('Champs invalides: nom_chapitre et id_matiere requis', 422);
        }

        if ($chemin === null || $chemin === '') {
            $stmt = $pdo->prepare('INSERT INTO T_CHAPITRE (NOM_CHAPITRE, ID_MATIERE) VALUES (?, ?)');
            $stmt->execute([$nom_chapitre, $id_matiere]);
        } else {
            $stmt = $pdo->prepare('INSERT INTO T_CHAPITRE (NOM_CHAPITRE, CHEMIN_FICHIER, ID_MATIERE) VALUES (?, ?, ?)');
            $stmt->execute([$nom_chapitre, $chemin, $id_matiere]);
        }

        json_response(['ok' => true, 'id' => $pdo->lastInsertId()]);
    }

    if ($method === 'DELETE') {
        parse_str($_SERVER['QUERY_STRING'] ?? '', $qs);
        $id = isset($qs['id']) ? (int)$qs['id'] : 0;
        if ($id <= 0) json_error('ID invalide', 400);

        $stmt = $pdo->prepare('DELETE FROM T_CHAPITRE WHERE ID_CHAPITRE = ?');
        $stmt->execute([$id]);

        json_response(['ok' => true]);
    }

    json_error('Méthode non supportée', 405);
} catch (PDOException $e) {
    json_error('Erreur SQL: ' . $e->getMessage(), 500);
}
