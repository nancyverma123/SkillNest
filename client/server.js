// SkillNest web server: server-side renders the React app (SSR) and serves the built assets.
//   npm run dev    → SSR with Vite dev middleware (hot reload)
//   npm run build  → builds dist/client (browser) and dist/server (SSR bundle)
//   npm start      → production SSR server (used on Railway)
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import express from 'express';
import compression from 'compression';

const isProd = process.env.NODE_ENV === 'production' || process.argv.includes('--prod');
const port = Number(process.env.PORT) || 5173;
const root = path.dirname(fileURLToPath(import.meta.url));
// API base used by the SSR server for data loading. On Railway, prefer the private-network URL.
const apiBase = (process.env.API_URL || process.env.VITE_API_URL || 'http://localhost:5000/api').replace(/\/$/, '');

const escapeHtml = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
// JSON safe to embed inside <script>: stops "</script>" and HTML comment injection from course content.
const serialize = (data) => JSON.stringify(data)
  .replace(/</g, '\\u003c').replace(/>/g, '\\u003e').replace(/&/g, '\\u0026')
  .replace(/\u2028/g, '\\u2028').replace(/\u2029/g, '\\u2029');

function fillTemplate(template, { html = '', head, data } = {}) {
  let out = template
    .replace('<!--app-html-->', html)
    .replace('<!--app-data-->', data ? `<script>window.__INITIAL_DATA__=${serialize(data)}</script>` : '');
  if (head) {
    out = out
      .replace(/<title>[\s\S]*?<\/title>/, `<title>${escapeHtml(head.title)}</title>`)
      .replace(/<meta name="description" content="[^"]*"\s*\/?>/, `<meta name="description" content="${escapeHtml(head.description)}" />`);
  }
  return out;
}

const app = express();
app.disable('x-powered-by');
app.set('trust proxy', 1);
app.use(compression());
app.use((req, res, next) => {
  res.set({ 'X-Content-Type-Options': 'nosniff', 'Referrer-Policy': 'strict-origin-when-cross-origin', 'X-Frame-Options': 'SAMEORIGIN' });
  next();
});
app.get('/health', (req, res) => res.json({ status: 'ok' }));

let vite;
let prodTemplate;
let prodRender;
if (isProd) {
  prodTemplate = await fs.readFile(path.join(root, 'dist/client/index.html'), 'utf-8');
  prodRender = (await import('./dist/server/entry-server.js')).render;
  // Hashed build assets can be cached forever; missing assets 404 instead of falling through to SSR.
  app.use('/assets', express.static(path.join(root, 'dist/client/assets'), { immutable: true, maxAge: '1y', fallthrough: false }));
  app.use(express.static(path.join(root, 'dist/client'), { index: false, maxAge: '1h' }));
} else {
  const { createServer } = await import('vite');
  vite = await createServer({ root, server: { middlewareMode: true }, appType: 'custom' });
  app.use(vite.middlewares);
}

app.use('*', async (req, res) => {
  const url = req.originalUrl;
  let template = prodTemplate;
  try {
    let render = prodRender;
    if (!isProd) {
      template = await vite.transformIndexHtml(url, await fs.readFile(path.join(root, 'index.html'), 'utf-8'));
      render = (await vite.ssrLoadModule('/src/entry-server.jsx')).render;
    }
    const result = await render(url, { apiBase });
    if (result.redirect) return res.redirect(302, result.redirect);
    res.status(result.status).set({ 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-cache' }).send(fillTemplate(template, result));
  } catch (e) {
    vite?.ssrFixStacktrace(e);
    console.error('[ssr] render failed, serving client-rendered shell:', e);
    // Graceful fallback: the browser renders the app itself, so the site stays usable.
    if (!template) return res.status(500).send('Internal Server Error');
    res.status(200).set({ 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-cache' }).send(fillTemplate(template));
  }
});

app.listen(port, () => console.log(`SkillNest web (${isProd ? 'production' : 'development'} SSR) on http://localhost:${port} → API ${apiBase}`));
