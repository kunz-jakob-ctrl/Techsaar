/* Verifikation des 3D-Dachbau-Heros: statischer Server + Playwright-Chromium */
const http = require('http');
const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');

const ROOT = 'C:\\Users\\babok\\Techsaar';
const OUT = __dirname;
const MIME = {
  '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css',
  '.woff2': 'font/woff2', '.webp': 'image/webp', '.png': 'image/png',
  '.svg': 'image/svg+xml', '.json': 'application/json',
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

async function capture(browser, name, opts, url, waitBuild = true) {
  const ctx = await browser.newContext(opts);
  const page = await ctx.newPage();
  const errors = [];
  const external = [];
  const missing = [];
  page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
  page.on('pageerror', (e) => errors.push('PAGEERROR: ' + e.message));
  page.on('request', (r) => {
    const u = r.url();
    if (!u.startsWith('http://127.0.0.1') && !u.startsWith('data:')) external.push(u);
  });
  page.on('response', (r) => { if (r.status() === 404) missing.push(r.url()); });

  await page.goto(url, { waitUntil: 'load' });
  if (waitBuild) {
    try {
      await page.waitForFunction(() => window.__buildDone === true, null, { timeout: 15000 });
    } catch (e) {
      console.log(`[${name}] TIMEOUT: buildDone kam nicht innerhalb 15s`);
    }
  } else {
    await page.waitForTimeout(1500);
  }
  await page.waitForTimeout(400);
  const fps = await page.evaluate(() => window.__fps || 0);
  await page.screenshot({ path: path.join(OUT, name + '.png') });
  console.log(`[${name}] fps=${fps} errors=${JSON.stringify(errors.slice(0, 5))} extern=${JSON.stringify(external)} 404=${JSON.stringify(missing)}`);
  await ctx.close();
}

(async () => {
  await new Promise((r) => server.listen(8231, '127.0.0.1', r));
  const browser = await chromium.launch();
  const url = 'http://127.0.0.1:8231/dachdecker-demo/';

  await capture(browser, 'desktop', { viewport: { width: 1600, height: 900 } }, url);
  await capture(browser, 'mid-build', { viewport: { width: 1600, height: 900 } }, url, false);
  await capture(browser, 'mobile', { viewport: { width: 375, height: 812 } }, url);
  await capture(browser, 'reduced', { viewport: { width: 1600, height: 900 }, reducedMotion: 'reduce' }, url);
  await capture(browser, 'nojs', { viewport: { width: 1600, height: 900 }, javaScriptEnabled: false }, url, false);

  await browser.close();
  server.close();
  console.log('FERTIG');
})();
