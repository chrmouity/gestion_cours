# gestion_cours

Projet minimal (PHP + MySQL + HTML/JS) pour gérer des matières et leurs chapitres (images).

## Installation rapide
1. Importer `schema.sql` dans phpMyAdmin (ou exécuter le script SQL).
2. Placer le dossier `gestion_cours` sous votre serveur (ex: `htdocs/` de XAMPP).
3. Adapter les constantes DB dans `backend/config.php` si besoin.
4. Ouvrir `frontend/index.html` dans le navigateur via `http://localhost/gestion_cours/frontend/`.

## Endpoints
- `backend/matieres.php`  (GET, POST, PUT?id=, DELETE?id=)
- `backend/chapitres.php` (GET?id_matiere=, POST, DELETE?id=)
- `backend/upload.php`    (POST multipart; champ `fichier`)

