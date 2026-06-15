'use strict';
/* channelblock.zlef.fr — landing page + extension download.
   100% static: serves public/, including the packaged extension builds.
   The only dynamic bit is an anonymous, aggregate usage-stats endpoint. */
const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = Number(process.env.PORT || 10049);
const ROOT = path.join(__dirname, 'public');

/* ── anonymous, aggregate usage stats ───────────────────────────────────────
   Extensions POST an anonymous snapshot { v, features{}, usage{channels,hidden} }.
   We aggregate per UTC day. No identifier is sent or stored, no IP is recorded,
   no URLs/browsing data — only counts. The aggregate is public at /api/stats. */
const DATA_DIR = path.join(__dirname, 'data');
const STATS_FILE = path.join(DATA_DIR, 'stats.json');
const FEATS = ['enabled', 'hideBlocked', 'showButtons', 'blockShorts', 'guardPage'];
const CORS = {
  'access-control-allow-origin': '*',
  'access-control-allow-methods': 'POST, GET, OPTIONS',
  'access-control-allow-headers': 'content-type',
};
let STATS = { since: new Date().toISOString().slice(0, 10), totals: { pings: 0, channels: 0, hidden: 0 }, days: {} };
try { fs.mkdirSync(DATA_DIR, { recursive: true }); STATS = JSON.parse(fs.readFileSync(STATS_FILE, 'utf8')); } catch (_) {}
let writeTimer = null;
const persist = () => { clearTimeout(writeTimer); writeTimer = setTimeout(() => fs.writeFile(STATS_FILE, JSON.stringify(STATS), () => {}), 1500); };
const intOf = (n) => { n = Number(n); return Number.isFinite(n) ? Math.max(0, Math.min(1e6, Math.floor(n))) : 0; };
function recordPing(p) {
  if (!p || typeof p !== 'object') return;
  const day = new Date().toISOString().slice(0, 10);
  const d = STATS.days[day] || (STATS.days[day] = { pings: 0, features: {}, channels: 0, hidden: 0 });
  d.pings++; STATS.totals.pings++;
  const f = p.features || {};
  FEATS.forEach((k) => { if (f[k]) d.features[k] = (d.features[k] || 0) + 1; });
  const u = p.usage || {};
  const c = intOf(u.channels), h = intOf(u.hidden);
  d.channels += c; d.hidden += h; STATS.totals.channels += c; STATS.totals.hidden += h;
  persist();
}

const MIME = {
  '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8', '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg',
  '.ico': 'image/x-icon', '.zip': 'application/zip', '.xpi': 'application/x-xpinstall',
  '.mp4': 'video/mp4', '.woff2': 'font/woff2',
};

const server = http.createServer((req, res) => {
  try {
    let p = decodeURIComponent(new URL(req.url, 'http://x').pathname);

    if (p.startsWith('/api/')) {
      if (req.method === 'OPTIONS') { res.writeHead(204, CORS); return res.end(); }
      if (p === '/api/collect' && req.method === 'POST') {
        let body = '', tooBig = false;
        req.on('data', (c) => { body += c; if (body.length > 8192) { tooBig = true; req.destroy(); } });
        req.on('end', () => {
          if (!tooBig) { try { recordPing(JSON.parse(body)); } catch (_) {} }
          res.writeHead(204, CORS); res.end();
        });
        return;
      }
      if (p === '/api/stats' && (req.method === 'GET' || req.method === 'HEAD')) {
        res.writeHead(200, Object.assign({ 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' }, CORS));
        return res.end(JSON.stringify(STATS));
      }
      res.writeHead(404, CORS); return res.end('not found');
    }

    if (p === '/') p = '/index.html';
    if (!path.extname(p) && fs.existsSync(path.join(ROOT, p + '.html'))) p += '.html';
    const file = path.normalize(path.join(ROOT, p));
    if (!file.startsWith(ROOT)) { res.writeHead(403); return res.end('forbidden'); }

    fs.stat(file, (err, st) => {
      if (err || !st.isFile()) { res.writeHead(404, { 'content-type': 'text/plain' }); return res.end('not found'); }
      const ext = path.extname(file).toLowerCase();
      const type = MIME[ext] || 'application/octet-stream';
      const cache = ext === '.html' ? 'no-cache' : 'public, max-age=3600';
      const headers = { 'content-type': type, 'cache-control': cache, 'content-length': st.size };
      if (ext === '.zip') headers['content-disposition'] = 'attachment; filename="channelblock.zip"';
      if (ext === '.xpi') headers['content-disposition'] = 'attachment; filename="channelblock-firefox.xpi"';
      res.writeHead(200, headers);
      fs.createReadStream(file).pipe(res);
    });
  } catch (e) {
    res.writeHead(500); res.end('error');
  }
});
server.listen(PORT, '127.0.0.1', () => console.log(`channelblock.zlef.fr (static) on 127.0.0.1:${PORT}`));
