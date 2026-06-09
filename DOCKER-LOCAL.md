# Environnement Docker local

Cette stack sert a tester le site en local avant de deployer sur Gandi.

## Services

- `frontend`: Vite sur `http://localhost:5173`
- `php`: API PHP/Apache sur `http://localhost:8000`
- `db`: MySQL sur `localhost:3307`

Le front Vite proxy automatiquement `/api` et `/sync` vers le conteneur PHP.

## Demarrage

Depuis la racine du projet :

```bash
docker compose up --build -d db php frontend
```

Puis ouvre :

- Front public : `http://localhost:5173`
- API test : `http://localhost:8000/api/index.php?action=vehicles&limit=5`
- Admin : `http://localhost:5173/admin`

## Charger le stock local

Le fichier `export.xml` du depot peut etre importe dans la base locale.

```bash
docker compose run --rm sync
```

Le service `sync` lit :

- `DB_HOST`, `DB_NAME`, `DB_USER`, `DB_PASSWORD`
- `SPIDER_VO_XML_URL`
- `SPIDER_VO_XML_FILE`

Dans `docker-compose.yml`, `SPIDER_VO_XML_URL` est vide pour forcer l'import local depuis `/workspace/export.xml`.

## Connexion admin locale

- URL : `http://localhost:5173/admin`
- Identifiant local Docker : `admin`
- Mot de passe local Docker : `admin123`

En production, configure le mot de passe admin via :

- la variable d'environnement `ADMIN_USERNAME`,
- de préférence la variable d'environnement `ADMIN_PASSWORD_HASH`,
- la variable d'environnement `ADMIN_PASSWORD`, ou
- le fichier `htdocs/config/admin_auth.php`
- ou mieux un fichier non versionné `htdocs/config/admin_auth.local.php`

## Verifications recommandees

1. Ouvrir `http://localhost:5173/vehicles`
2. Verifier que la liste charge bien depuis l'API
3. Tester un detail vehicule
4. Lancer `http://localhost:8000/api/test_sold_vehicle.php`
5. Revenir sur la liste et verifier l'effet du changement de statut
6. Revenir a l'etat initial avec `http://localhost:8000/api/reset_vehicle_to_available.php`

## Reinitialiser la base locale

```bash
docker compose down
rm -rf .docker/mysql-data
docker compose up --build -d db php frontend
docker compose run --rm sync
```

## Notes

- Les fichiers modifies en prod ne sont pas deployes par cette stack.
- La prod Gandi continue d'utiliser ses valeurs par defaut si aucune variable d'environnement n'est definie.
