/**
 * Yerel EVDS proxy — CORS için
 * Çalıştır: node tools/evds-proxy.mjs
 * Admin panel açıkken bu pencere açık kalsın.
 */
import http from 'http';

const PORT = 8799;
const EVDS_BASE = 'https://evds3.tcmb.gov.tr/igmevdsms-dis/';

const server = http.createServer(async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-EVDS-Key');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  if (req.method !== 'GET') {
    res.writeHead(405, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'GET only' }));
    return;
  }

  const key = req.headers['x-evds-key'];
  if (!key) {
    res.writeHead(401, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'X-EVDS-Key header gerekli' }));
    return;
  }

  const url = new URL(req.url || '/', `http://127.0.0.1:${PORT}`);
  const qs = (url.search || '').replace(/^\?/, '');
  const evdsUrl = EVDS_BASE + qs;

  try {
    const upstream = await fetch(evdsUrl, { headers: { key } });
    const body = await upstream.text();
    res.writeHead(upstream.status, { 'Content-Type': 'application/json' });
    res.end(body);
  } catch (err) {
    res.writeHead(502, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'EVDS bağlantı hatası', detail: err.message }));
  }
});

server.listen(PORT, '127.0.0.1', () => {
  console.log(`EVDS proxy: http://127.0.0.1:${PORT}`);
  console.log('Admin panelden "Simdi Guncelle" kullanabilirsiniz.');
});
