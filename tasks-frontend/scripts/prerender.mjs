import { chromium } from 'playwright';
import { createServer } from 'http';
import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = fileURLToPath(new URL('.', import.meta.url));
const distDir = join(__dirname, '../dist');

const solutionRoutes = [
  '/solutions/communication-with-clients',
  '/solutions/replace-telegram-chats',
  '/solutions/employee-kpi',
  '/solutions/show-efficiency-to-clients',
];

const routes = ['/', '/login', '/register', ...solutionRoutes];

function serveStatic(req, res) {
  let url = new URL(req.url, `http://${req.headers.host}`).pathname;
  if (url === '/') url = '/index.html';
  if (!url.includes('.')) url = '/index.html';

  const filePath = join(distDir, url);
  try {
    const content = readFileSync(filePath);
    const ext = url.split('.').pop();
    const contentType = {
      html: 'text/html',
      js: 'text/javascript',
      css: 'text/css',
      svg: 'image/svg+xml',
      json: 'application/json',
    }[ext] || 'application/octet-stream';
    res.writeHead(200, { 'Content-Type': contentType });
    res.end(content);
  } catch {
    res.writeHead(404);
    res.end('Not found');
  }
}

async function main() {
  const server = createServer(serveStatic);
  await new Promise((resolve) => server.listen(3456, resolve));

  const browser = await chromium.launch();
  const context = await browser.newContext();

  for (const route of routes) {
    const page = await context.newPage();
    await page.goto(`http://localhost:3456${route}`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(500);

    const html = await page.content();
    const fileName = route === '/' ? 'index.html' : `${route.slice(1).replace(/\//g, '-')}.html`;
    const filePath = join(distDir, fileName);
    writeFileSync(filePath, html);
    console.log(`Prerendered ${route} -> ${filePath}`);
    await page.close();
  }

  await browser.close();
  server.close();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
