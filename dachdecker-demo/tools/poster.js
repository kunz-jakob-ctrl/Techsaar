/* Poster-Capture: fertige Szene (?finish=1) als PNG des Stage-Bereichs */
const http = require('http');
const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');

const ROOT = 'C:\\Users\\babok\\Techsaar';
const MIME = {
  '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css',
  '.woff2': 'font/woff2', '.webp': 'image/webp',
};
const server = http.createServer((req, res) => {
  const urlPath = decodeURIComponent(req.url.split('?')[0]);
  let fp = path.join(ROOT, urlPath);
  if (urlPath.endsWith('/')) fp = path.join(fp, 'index.html');
  fs.readFile(fp, (err, data) => {
    if (err) { res.writeHead(404); res.end('nf'); return; }
    res.writeHead(200, { 'Content-Type': MIME[path.extname(fp)] || 'application/octet-stream' });
    res.end(data);
  });
});

(async () => {
  await new Promise((r) => server.listen(8232, '127.0.0.1', r));
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1600, height: 900 } });
  await page.goto('http://127.0.0.1:8232/dachdecker-demo/?finish=1', { waitUntil: 'load' });
  await page.waitForFunction(() => window.__buildDone === true, null, { timeout: 15000 });
  await page.waitForTimeout(600); // Kamera-Lerp ausklingen lassen
  // UI-Overlays ausblenden — das Poster darf NUR die Szene zeigen
  await page.addStyleTag({ content: '.hero-top,.hero-main,.hero-foot,.demo-badge{visibility:hidden !important}' });
  const stage = page.locator('#stage');
  await stage.screenshot({ path: path.join(__dirname, 'poster.png') });
  await browser.close();
  server.close();
  console.log('Poster-PNG geschrieben');
})();
