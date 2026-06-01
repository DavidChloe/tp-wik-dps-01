const http = require('http');

const PORT = process.env.PORT || 3000;
const INSTANCE_ID = process.env.INSTANCE_ID || 'default';

let pingCount = 0;
const startTime = Date.now();

const server = http.createServer((req, res) => {
  if (req.method === 'GET' && req.url === '/ping') {
    pingCount++;
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ status: 'ok', message: 'pong' }));
    return;
  }

  if (req.method === 'GET' && req.url === '/stats') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      pingCount,
      uptimeSeconds: Math.floor((Date.now() - startTime) / 1000),
      instanceId: INSTANCE_ID,
    }));
    return;
  }

  res.writeHead(404, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ error: 'Not Found' }));
});

server.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
