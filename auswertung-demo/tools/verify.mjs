/* Verifikation mit echtem Chromium. Ausführen aus auswertung-demo/:
   npx --yes --package=playwright@1.61.1 -- node tools/verify.mjs
   Die eingebaute Browser-Vorschau ist für diese Seite NICHT verlässlich. */
import { chromium } from 'playwright';
import { pathToFileURL } from 'node:url';
import { resolve } from 'node:path';

const URL_SEITE = pathToFileURL(resolve('index.html')).href;
const fehler = [];
function pruefe(bedingung, text) {
  if (bedingung) console.log('  ok   ' + text);
  else { console.log('  FEHL ' + text); fehler.push(text); }
}

const browser = await chromium.launch();

for (const [name, breite, hoehe] of [['desktop', 1280, 900], ['handy', 375, 780]]) {
  const ctx = await browser.newContext({ viewport: { width: breite, height: hoehe } });
  const page = await ctx.newPage();
  const extern = [];
  page.on('request', r => { if (!r.url().startsWith('file:')) extern.push(r.url()); });
  const konsole = [];
  page.on('pageerror', e => konsole.push(String(e)));
  /* Ein fehlendes <script src> wirft über file:// KEINEN pageerror — es scheitert
     still. Ohne diese Prüfung sähe eine Seite ohne jedes Skript "grün" aus. */
  const fehlgeschlagen = [];
  page.on('requestfailed', r => fehlgeschlagen.push(r.url().split('/').pop()));
  await page.goto(URL_SEITE);
  await page.waitForTimeout(300);

  console.log('\n[' + name + ' ' + breite + 'px]');
  pruefe(extern.length === 0, 'keine externen Requests' + (extern.length ? ' — ' + extern.join(', ') : ''));
  pruefe(konsole.length === 0, 'keine JS-Fehler' + (konsole.length ? ' — ' + konsole.join(' | ') : ''));
  pruefe(fehlgeschlagen.length === 0,
    'alle Dateien geladen' + (fehlgeschlagen.length ? ' — fehlt: ' + fehlgeschlagen.join(', ') : ''));

  const ueberlauf = await page.evaluate(() =>
    document.documentElement.scrollWidth > document.documentElement.clientWidth + 1);
  pruefe(!ueberlauf, 'kein waagerechter Überlauf');

  await ctx.close();
}

await browser.close();
console.log('\n' + (fehler.length ? fehler.length + ' Prüfung(en) fehlgeschlagen' : 'alle Prüfungen bestanden'));
process.exit(fehler.length ? 1 : 0);
