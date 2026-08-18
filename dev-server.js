/**
 * Servidor de Desenvolvimento Local Node.js
 * Executa arquivos estáticos e a API Serverless /api/subscribe com envio server-to-server para o n8n
 */

import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import subscribeHandler from './api/subscribe.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = 3000;

const MIME_TYPES = {
  '.html': 'text/html; charset=UTF-8',
  '.css': 'text/css; charset=UTF-8',
  '.js': 'text/javascript; charset=UTF-8',
  '.json': 'application/json; charset=UTF-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.svg': 'image/svg+xml',
  '.txt': 'text/plain; charset=UTF-8',
  '.xml': 'application/xml; charset=UTF-8',
  '.ico': 'image/x-icon',
  '.webmanifest': 'application/manifest+json; charset=UTF-8'
};

const server = http.createServer(async (req, res) => {
  const parsedUrl = new URL(req.url, `http://localhost:${PORT}`);
  let pathname = parsedUrl.pathname;

  // Rota Serverless /api/subscribe
  if (pathname === '/api/subscribe') {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', async () => {
      try {
        req.body = body ? JSON.parse(body) : {};
      } catch (e) {
        req.body = {};
      }

      // Adiciona helpers compatíveis com Vercel (res.status e res.json)
      res.status = (code) => {
        res.statusCode = code;
        return res;
      };
      res.json = (data) => {
        res.setHeader('Content-Type', 'application/json; charset=UTF-8');
        res.end(JSON.stringify(data));
        return res;
      };

      try {
        await subscribeHandler(req, res);
      } catch (err) {
        console.error('Erro na execução do handler:', err);
        res.statusCode = 500;
        res.setHeader('Content-Type', 'application/json; charset=UTF-8');
        res.end(JSON.stringify({ success: false, message: err.message }));
      }
    });
    return;
  }

  // Servir arquivos estáticos
  if (pathname === '/') pathname = '/index.html';
  const filePath = path.join(__dirname, decodeURIComponent(pathname));

  fs.stat(filePath, (err, stats) => {
    if (err || !stats.isFile()) {
      res.statusCode = 404;
      res.setHeader('Content-Type', 'text/plain; charset=UTF-8');
      res.end('404 Not Found');
      return;
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';

    res.writeHead(200, { 'Content-Type': contentType });
    fs.createReadStream(filePath).pipe(res);
  });
});

server.listen(PORT, () => {
  console.log(`\n✨ Servidor local Gabriela Lopes rodando em: http://localhost:${PORT}`);
  console.log(`📡 Rota API ativa: http://localhost:${PORT}/api/subscribe -> n8n\n`);
});
