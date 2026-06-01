# Ping Server

Serveur HTTP minimaliste Node.js sans aucune dépendance externe.

## Prérequis

- Node.js >= 20.6.0

## Installation

```bash
git clone <url-du-repo>
cd ping-server
cp .env.example .env
```

## Configuration

Modifier le fichier `.env` pour ajuster le port d'écoute :

```env
PORT=3000
```

| Variable | Description          | Défaut |
|----------|----------------------|--------|
| `PORT`   | Port d'écoute HTTP   | `3000` |

## Démarrage

**Production :**
```bash
npm start
```

**Développement** (rechargement automatique) :
```bash
npm run dev
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

### Toute autre route

Toute requête dont la méthode n'est pas `GET` ou dont l'URL n'est pas `/ping` retourne une erreur 404.

**Réponse — 404 Not Found**
```json
{
  "error": "Not Found"
}
```

## Exemples

```bash
# Ping
curl http://localhost:3000/ping
# {"status":"ok","message":"pong"}

# Route inconnue
curl http://localhost:3000/autre
# {"error":"Not Found"}

# Mauvaise méthode
curl -X POST http://localhost:3000/ping
# {"error":"Not Found"}
```

## Architecture

```
.
├── server.js       # Serveur HTTP (module natif `http`)
├── package.json    # Métadonnées et scripts
├── .env            # Variables d'environnement (non versionné)
├── .env.example    # Template des variables d'environnement
├── .gitignore
└── README.md
```

Aucune dépendance externe — le chargement du fichier `.env` est assuré par le flag natif `--env-file` de Node.js (disponible depuis la version 20.6.0).
