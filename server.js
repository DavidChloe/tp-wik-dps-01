const http = require('http');
const os = require('os');

const PORT = process.env.PORT || 3000;
const INSTANCE_ID = process.env.INSTANCE_ID || 'default';

let pingCount = 0;
const startTime = Date.now();

const server = http.createServer((req, res) => {
  if (req.method === 'GET' && req.url === '/ping') {
    pingCount++;
    console.log(`[ping] hostname=${os.hostname()}`);
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ status: 'ok'}));
    return;
  }
  else if (req.method === 'GET' && req.url === '/stats') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      pingCount,
      uptimeSeconds: Math.floor((Date.now() - startTime) / 1000),
      instanceId: INSTANCE_ID,
      hostname: os.hostname(),
    }));
    return;
  }
  else {
    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({}));
  }
});

server.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
