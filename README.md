# Ping Server

Serveur HTTP minimaliste Node.js sans aucune dépendance externe.

## Prérequis

- Node.js >= 20.6.0
- Docker (optionnel)

## Installation

```bash
git clone <url-du-repo>
cd TP_WIK_DPS_02
cp .env.example .env
```

## Configuration

Modifier le fichier `.env` pour ajuster le port d'écoute voulut, et le nom du serveur :

```env
PORT=3000
INSTANCE_ID=server-1
```

| Variable     | Description          | Défaut     |
|--------------|----------------------|------------|
| `PORT`       | Port d'écoute HTTP   | `3000`     |
| `INSTANCE_ID`| Nom du serveur       | `server-1` |

## Démarrage

**Production :**
```bash
npm start
```

**Développement** (rechargement automatique) :
```bash
npm run dev
```
## Docker

### Image single-stage

```bash
docker build -t ping-server:single .
docker run -p 3000:3000 -e PORT=3000 -e INSTANCE_ID=server-1 ping-server:single
```

### Image multi-stage

```bash
docker build -f Dockerfile.multistage -t ping-server:multi .
docker run -p 3000:3000 -e PORT=3000 -e INSTANCE_ID=server-1 ping-server:multi
```

> Les variables d'environnement sont passées via `-e` (le fichier `.env` n'est pas copié dans l'image).

### Scan de vulnérabilités

```bash
docker scout cves ping-server:single
```

## Endpoints

### `GET /ping`

Vérifie que le serveur est opérationnel.

**Réponse — 200 OK**
```json
{
  "status": "ok",
  "message": "pong"
}
```

### `GET /stats`

Donne les statistique du serveur (temps depuis l'allumage en seconde et le nombre de fois que GET /ping a été utilisé).

**Réponse — 200 OK**
```json
{
  "pingCount": "nombre de ping effectué",
  "uptimeSeconds": "nombre de seconde depuis l'allumage du serveur",
  "instanceId": "nom du serveur"
}
```

### Toute autre route

Toute requête dont la méthode n'est pas `GET` ou dont l'URL n'est pas `/ping` retourne une erreur 404.

**Réponse — 404 Not Found**
```json
{}
```

## Exemples

```bash
curl http://localhost:3000/ping
# {"status":"ok","message":"pong"}

curl http://localhost:3000/stats
# {"pingCount":1,"uptimeSeconds":6,"instanceId":"server-1"}

curl http://localhost:3000/unknown
```

## Architecture

```
.
├── server.js              # Serveur HTTP (module natif `http`)
├── package.json           # Métadonnées et scripts
├── package-lock.json      # Lockfile npm
├── Dockerfile             # Image single-stage optimisée
├── Dockerfile.multistage  # Image multi-stage (build + production)
├── .dockerignore
├── .env                   # Variables d'environnement (non versionné)
├── .env.example           # Template des variables d'environnement
├── .gitignore
└── README.md
```

Aucune dépendance externe — le chargement du fichier `.env` est assuré par le flag natif `--env-file` de Node.js (disponible depuis la version 20.6.0).
