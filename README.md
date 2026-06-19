# Ping Server

Serveur HTTP minimaliste Node.js sans aucune dépendance externe, avec load balancing nginx.

## Prérequis

- Node.js >= 20.6.0
- Docker & Docker Compose

## Installation

```bash
git clone <url-du-repo>
cd tp-wik-dps-03
cp .env.example .env
```

## Configuration

Modifier le fichier `.env` pour ajuster le port d'écoute et le nom du serveur :

```env
PORT=3000
INSTANCE_ID=server-1
```

| Variable      | Description         | Défaut     |
|---------------|---------------------|------------|
| `PORT`        | Port d'écoute HTTP  | `3000`     |
| `INSTANCE_ID` | Nom du serveur      | `default`  |

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

Le rapport complet est disponible dans [`scout-report.txt`](./scout-report.txt).

Résumé du dernier scan (image `ping-server:single` — `node:20.6-alpine`) :

| Sévérité | Nombre |
|----------|--------|
| CRITICAL | 1      |
| HIGH     | 19     |
| MEDIUM   | 17     |
| LOW      | 5      |

37 vulnérabilités détectées dans 14 packages (principalement `openssl`, `tar`, `minimatch` issus de la base Alpine 3.18 et des outils npm intégrés à Node.js).

## Docker Compose — Load Balancer

Le fichier `docker-compose.yaml` déploie plusieurs instances de l'API derrière un reverse proxy nginx.

### Lancement avec 3 répliques

```bash
docker compose up --scale api=3 -d
```

Seul nginx est exposé sur le port `8080`. Les instances `api` ne sont pas accessibles directement depuis l'hôte.

### Observer l'équilibrage de charge

```bash
# Envoyer plusieurs requêtes
for i in {1..9}; do curl http://localhost:8080/ping; done

# Suivre les logs — les hostnames alternent entre les 3 instances
docker compose logs -f api
```

Chaque requête `/ping` loggue le hostname du conteneur qui l'a traitée :
```
api-1  | [ping] hostname=a3f2c1d4e5b6
api-2  | [ping] hostname=b7e8f9a0c1d2
api-3  | [ping] hostname=c4d5e6f7a8b9
```

### Arrêt

```bash
docker compose down
```

## Endpoints

### `GET /ping`

Vérifie que le serveur est opérationnel. Loggue le hostname du conteneur à chaque appel.

**Réponse — 200 OK**
```json
{
  "status": "ok"
}
```

### `GET /stats`

Statistiques de l'instance courante.

**Réponse — 200 OK**
```json
{
  "pingCount": 5,
  "uptimeSeconds": 42,
  "instanceId": "server-1"
}
```

### Toute autre route

**Réponse — 404 Not Found**
```json
{}
```

## Exemples

```bash
curl http://localhost:8080/ping
# {"status":"ok"}

curl http://localhost:8080/stats
# {"pingCount":3,"uptimeSeconds":12,"instanceId":"api"}

curl http://localhost:8080/unknown
# {}
```

## Architecture

```
.
├── server.js              # Serveur HTTP (module natif `http`)
├── nginx.conf             # Configuration nginx (load balancer)
├── docker-compose.yaml    # Orchestration nginx + api (scalable)
├── Dockerfile             # Image single-stage optimisée
├── Dockerfile.multistage  # Image multi-stage (build + production)
├── package.json           # Métadonnées et scripts
├── package-lock.json      # Lockfile npm
├── .dockerignore
├── .env                   # Variables d'environnement (non versionné)
├── .env.example           # Template des variables d'environnement
├── .gitignore
└── README.md
```

Aucune dépendance externe — le chargement du fichier `.env` est assuré par le flag natif `--env-file` de Node.js (disponible depuis la version 20.6.0).
