# Ping Server — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Serveur HTTP Node.js minimaliste avec `GET /ping → 200 JSON` et `* → 404 JSON`, port configurable via `.env`, zéro dépendance externe.

**Architecture:** Le handler HTTP est isolé dans `app.js` (exporté, testable) ; `server.js` est le seul point d'entrée (lit `PORT`, démarre l'écoute). Les tests utilisent `node:test` + `node:assert` (stdlib Node.js 18+). Le port `.env` est chargé par le flag natif `--env-file` (Node.js 20.6+).

**Tech Stack:** Node.js 20.6+ (stdlib uniquement : `node:http`, `node:test`, `node:assert`). Aucune dépendance `npm`.

---

## Fichiers créés ou modifiés

| Fichier | Rôle | Action |
|---|---|---|
| `.gitignore` | Exclut `.env` et `node_modules/` | Existant |
| `package.json` | Scripts `start`, `dev`, `test` | Modifier (ajouter `test`) |
| `.env` | `PORT=3000` (non versionné) | Existant |
| `.env.example` | Template public | Existant |
| `app.js` | Handler HTTP pur, exporté | **Créer** |
| `server.js` | Point d'entrée : lit PORT, démarre | **Modifier** |
| `server.test.js` | Tests `node:test` | **Créer** |
| `README.md` | Documentation | Existant |

---

## Task 1 : Initialiser le dépôt git

**Files:**
- (aucun fichier modifié — setup git uniquement)

- [ ] **Step 1 : Initialiser git et committer .gitignore**

```bash
git init
git add .gitignore
git commit -m "chore: init repository"
```

Expected output :
```
Initialized empty Git repository in .git/
[main (root-commit) ...] chore: init repository
 1 file changed, 2 insertions(+)
```

---

## Task 2 : Committer la structure du projet

**Files:**
- Commit: `package.json`, `.env.example`

- [ ] **Step 1 : Stager et committer la configuration du projet**

```bash
git add package.json .env.example
git commit -m "chore: add package.json and env template"
```

Expected :
```
[main ...] chore: add package.json and env template
 2 files changed
```

---

## Task 3 : Refactoriser — extraire le handler dans app.js

Objectif : rendre le handler HTTP testable en l'isolant du point d'entrée.

**Files:**
- Create: `app.js`
- Modify: `server.js`

- [ ] **Step 1 : Créer `app.js` avec le handler exporté**

```javascript
// app.js
const http = require('http');

function createServer() {
  return http.createServer((req, res) => {
    if (req.method === 'GET' && req.url === '/ping') {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ status: 'ok', message: 'pong' }));
      return;
    }
    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Not Found' }));
  });
}

module.exports = { createServer };
```

- [ ] **Step 2 : Mettre à jour `server.js` pour utiliser `app.js`**

```javascript
// server.js
const { createServer } = require('./app');

const PORT = process.env.PORT || 3000;

createServer().listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
```

- [ ] **Step 3 : Vérifier que le serveur démarre toujours**

```bash
node --env-file=.env server.js
```

Expected :
```
Server listening on port 3000
```

Stopper avec `Ctrl+C`.

- [ ] **Step 4 : Committer le refactoring**

```bash
git add app.js server.js
git commit -m "refactor: extract HTTP handler to app.js for testability"
```

---

## Task 4 : TDD — GET /ping retourne 200 JSON

**Files:**
- Create: `server.test.js`
- Modify: `package.json` (ajouter script `test`)

- [ ] **Step 1 : Ajouter le script `test` dans `package.json`**

```json
{
  "name": "TP_WIK_DPS_01",
  "version": "1.0.0",
  "description": "Serveur HTTP minimaliste Node.js — zéro dépendance externe",
  "main": "server.js",
  "scripts": {
    "start": "node --env-file=.env server.js",
    "dev": "node --watch --env-file=.env server.js",
    "test": "node --test server.test.js"
  },
  "engines": {
    "node": ">=20.6.0"
  }
}
```

- [ ] **Step 2 : Créer `server.test.js` avec le test GET /ping**

```javascript
// server.test.js
const { test, before, after } = require('node:test');
const assert = require('node:assert/strict');
const http = require('node:http');
const { createServer } = require('./app');

let server;
let port;

before(async () => {
  server = createServer();
  await new Promise((resolve) => server.listen(0, resolve));
  port = server.address().port;
});

after(async () => {
  await new Promise((resolve) => server.close(resolve));
});

function request(method, path) {
  return new Promise((resolve, reject) => {
    const req = http.request(
      { method, hostname: 'localhost', port, path },
      (res) => {
        let body = '';
        res.on('data', (chunk) => body += chunk);
        res.on('end', () => resolve({ status: res.statusCode, body: JSON.parse(body) }));
      }
    );
    req.on('error', reject);
    req.end();
  });
}

test('GET /ping retourne 200 avec le JSON pong', async () => {
  const { status, body } = await request('GET', '/ping');
  assert.equal(status, 200);
  assert.deepEqual(body, { status: 'ok', message: 'pong' });
});
```

- [ ] **Step 3 : Lancer le test**

```bash
npm test
```

Expected :
```
▶ GET /ping retourne 200 avec le JSON pong
  ✔ GET /ping retourne 200 avec le JSON pong (Xms)
ℹ tests 1
ℹ pass 1
ℹ fail 0
```

- [ ] **Step 4 : Committer**

```bash
git add server.test.js package.json
git commit -m "test: add GET /ping returns 200 JSON"
```

---

## Task 5 : TDD — Toute autre route retourne 404

**Files:**
- Modify: `server.test.js` (ajouter les tests 404)

- [ ] **Step 1 : Ajouter les tests 404 dans `server.test.js`**

Ajouter après le test existant :

```javascript
test('GET /autre retourne 404', async () => {
  const { status, body } = await request('GET', '/autre');
  assert.equal(status, 404);
  assert.deepEqual(body, { error: 'Not Found' });
});

test('POST /ping retourne 404', async () => {
  const { status, body } = await request('POST', '/ping');
  assert.equal(status, 404);
  assert.deepEqual(body, { error: 'Not Found' });
});

test('DELETE /ping retourne 404', async () => {
  const { status, body } = await request('DELETE', '/ping');
  assert.equal(status, 404);
  assert.deepEqual(body, { error: 'Not Found' });
});

test('GET / retourne 404', async () => {
  const { status, body } = await request('GET', '/');
  assert.equal(status, 404);
  assert.deepEqual(body, { error: 'Not Found' });
});
```

- [ ] **Step 2 : Lancer tous les tests**

```bash
npm test
```

Expected :
```
✔ GET /ping retourne 200 avec le JSON pong
✔ GET /autre retourne 404
✔ POST /ping retourne 404
✔ DELETE /ping retourne 404
✔ GET / retourne 404
ℹ tests 5
ℹ pass 5
ℹ fail 0
```

- [ ] **Step 3 : Committer**

```bash
git add server.test.js
git commit -m "test: add 404 for all non-GET-ping requests"
```

---

## Task 6 : Committer la documentation

**Files:**
- Commit: `README.md`

- [ ] **Step 1 : Stager et committer**

```bash
git add README.md
git commit -m "docs: add README with usage, endpoints, and configuration"
```

---

## Task 7 : Vérification end-to-end

- [ ] **Step 1 : Lancer tous les tests**

```bash
npm test
```

Expected : 5 tests, 5 pass, 0 fail.

- [ ] **Step 2 : Démarrer le serveur en production**

```bash
npm start
```

Expected : `Server listening on port 3000`

- [ ] **Step 3 : Tester GET /ping**

```bash
curl -s http://localhost:3000/ping
```

Expected : `{"status":"ok","message":"pong"}`

- [ ] **Step 4 : Tester une route inconnue**

```bash
curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/autre
```

Expected : `404`

- [ ] **Step 5 : Tester une mauvaise méthode**

```bash
curl -s -X POST http://localhost:3000/ping
```

Expected : `{"error":"Not Found"}`

- [ ] **Step 6 : Tester le changement de port**

Modifier `.env` : `PORT=4000`, puis :

```bash
npm start
```

Expected : `Server listening on port 4000`

Stopper avec `Ctrl+C`, remettre `PORT=3000`.

- [ ] **Step 7 : Vérifier l'historique git**

```bash
git log --oneline
```

Expected :
```
xxxxxxx docs: add README with usage, endpoints, and configuration
xxxxxxx test: add 404 for all non-GET-ping requests
xxxxxxx test: add GET /ping returns 200 JSON
xxxxxxx refactor: extract HTTP handler to app.js for testability
xxxxxxx chore: add package.json and env template
xxxxxxx chore: init repository
```
