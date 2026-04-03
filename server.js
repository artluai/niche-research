const http = require('http');
const fs = require('fs');
const https = require('https');
const path = require('path');

const server = http.createServer((req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  // Serve index.html
  if (req.url === '/' || req.url === '/index.html') {
    const filePath = path.join(__dirname, 'index.html');
    res.writeHead(200, { 'Content-Type': 'text/html' });
    fs.createReadStream(filePath).pipe(res);
    return;
  }

  // Proxy DataForSEO API POST calls
  if (req.url.startsWith('/api/') && req.method === 'POST') {
    const apiPath = '/v3/' + req.url.replace('/api/', '');
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      const options = {
        hostname: 'api.dataforseo.com',
        path: apiPath,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': req.headers['authorization'],
          'Content-Length': Buffer.byteLength(body)
        }
      };
      const proxy = https.request(options, apiRes => {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        apiRes.pipe(res);
      });
      proxy.on('error', err => {
        res.writeHead(500);
        res.end(JSON.stringify({ error: err.message }));
      });
      proxy.write(body);
      proxy.end();
    });
    return;
  }

  // Proxy DataForSEO API GET calls (e.g. /api/dataforseo_labs/categories)
  if (req.url.startsWith('/api/') && req.method === 'GET') {
    const apiPath = '/v3/' + req.url.replace('/api/', '');
    const options = {
      hostname: 'api.dataforseo.com',
      path: apiPath,
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': req.headers['authorization']
      }
    };
    const proxy = https.request(options, apiRes => {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      apiRes.pipe(res);
    });
    proxy.on('error', err => {
      res.writeHead(500);
      res.end(JSON.stringify({ error: err.message }));
    });
    proxy.end();
    return;
  }

  res.writeHead(404);
  res.end('Not found');
});

const PORT = 3000;
server.listen(PORT, () => {
  console.log(`Keyword Pipeline running at http://localhost:${PORT}`);
  console.log('Press Ctrl+C to stop');
});