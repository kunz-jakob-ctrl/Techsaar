# TechSaar Auswertung — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Eine Produkt-Demo unter `auswertung-demo/`, die vier Betreiberfragen mit je einer handgebauten SVG/CSS-Grafik beantwortet — und dabei ein wiederverwendbares `charts.js` hervorbringt.

**Architecture:** Drei Dateien mit harter Trennlinie: `index.html` (Struktur und Texte), `charts.js` (vier idempotente Renderer auf gemeinsamer Basis, kennt keine Inhalte), `data.js` (drei fertige Datensätze, kennt keine Darstellung). Ein Zeitraum-Umschalter ruft alle Renderer neu auf. Keine Chart-Bibliothek, kein Framework, keine externen Requests.

**Tech Stack:** Statisches HTML, Tailwind 3.4.19 lokal gebaut, handgeschriebenes SVG/CSS, lokale woff2-Schriften, Playwright/Chromium zur Verifikation.

## Global Constraints

- **0 externe Requests.** Schriften, Styles und Skripte ausschließlich lokal und relativ eingebunden. Kein CDN, keine Chart-Bibliothek, kein npm-Paket im Auslieferstand.
- **Indexierbar.** Kein `noindex`, kein `robots`-Ausschluss. Eigenes Produkt, keine fiktive Kundenmarke.
- **Beispieldaten sichtbar kennzeichnen.** Die Zahlen dürfen nicht wie echte Kennzahlen wirken (UWG).
- **Handy-tauglich ab 375px.** Kein waagerechter Überlauf am `body`.
- **Keine Hex-Farben in JavaScript.** Farben kommen über Varianten-Namen als CSS-Klassen: `kobalt`, `terra`, `senf`, `celadon`, `ofenmuted`.
- **Alle Renderer sind idempotent** — Container leeren, neu zeichnen. Voraussetzung für den Umschalter.
- **Keine Änderung** an `reservierung-demo`, `telefon-demo` oder `index.html` im Repo-Wurzelverzeichnis. Keine **werbliche** Verlinkung dorthin oder von dort — die Demo bewirbt keine Schwesterprodukte und wird von keinem beworben.
  **Ausnahme:** Rechtslinks auf `../impressum.html` und `../datenschutz.html` sind zulässig und in Task 9 sogar verlangt. Das Non-Goal in der Spec richtet sich gegen Querverweise zwischen den Demos, nicht gegen Pflichtangaben. Alle anderen Demos im Repo handhaben es genauso.
- **Palette (dunkel):** `ofen #17130F`, `ofenkarte #211B15`, `ofenlinie #3A3229`, `ofentext #EFE6D8`, `ofenmuted #9C8F7D`. **Akzente:** `kobalt #2B49C4`, `terra #C05B33`, `senf #D19E3F`, `celadon #7FA48E`.
- **Schriften:** Bricolage Grotesque (display), Instrument Sans (sans), IBM Plex Mono (mono).
- **Tailwind-Build:** `npx tailwindcss@3 -c tailwind.config.js -i build/input.css -o styles.css --minify` — nach **jeder** HTML-Änderung neu ausführen, sonst fehlen Klassen.
- **Committen ja, pushen nein.** Kein `git push` in diesem Plan.
- Arbeitsverzeichnis für alle Pfadangaben: `C:\Users\babok\Techsaar`

---

### Task 1: Gerüst, Schriften und Build ✅ erledigt 2026-08-05

**Files:**
- Create: `auswertung-demo/index.html`
- Create: `auswertung-demo/build/input.css`
- Create: `auswertung-demo/tailwind.config.js`
- Create: `auswertung-demo/tools/verify.mjs`
- Copy: `auswertung-demo/fonts/` (sechs woff2 + `fonts.css` aus `reservierung-demo/fonts/`)
- Generate: `auswertung-demo/styles.css`

**Interfaces:**
- Consumes: nichts
- Produces: eine ladbare Seite mit Kopfbereich; die leeren Container `#kennzahlen`, `#heatmap`, `#verlauf`, `#ring`, `#verluste`; die CSS-Klassen `.sr-only` und `.ts-tip`; das Prüfskript `tools/verify.mjs`

- [x] **Step 1: Ordner anlegen und Schriften kopieren**

```bash
cd "C:/Users/babok/Techsaar"
mkdir -p auswertung-demo/build auswertung-demo/tools
cp -r reservierung-demo/fonts auswertung-demo/fonts
ls auswertung-demo/fonts
```

Erwartet: sieben Dateien — sechs `.woff2` und `fonts.css`.

- [x] **Step 2: Tailwind-Konfiguration schreiben**

`auswertung-demo/tailwind.config.js`:

```js
/* Nach HTML-Änderungen neu bauen:
   npx tailwindcss@3 -c tailwind.config.js -i build/input.css -o styles.css --minify */
module.exports = {
  content: ['./index.html', './charts.js'],
  theme: {
    extend: {
      colors: {
        ofen:      '#17130F',
        ofenkarte: '#211B15',
        ofenlinie: '#3A3229',
        ofentext:  '#EFE6D8',
        ofenmuted: '#9C8F7D',
        kobalt:  '#2B49C4',
        terra:   '#C05B33',
        senf:    '#D19E3F',
        celadon: '#7FA48E',
      },
      fontFamily: {
        display: ['"Bricolage Grotesque"', 'sans-serif'],
        sans:    ['"Instrument Sans"', 'system-ui', 'sans-serif'],
        mono:    ['"IBM Plex Mono"', 'monospace'],
      },
    },
  },
};
```

`content` enthält bewusst auch `charts.js`, weil die Renderer Tailwind-Klassen in erzeugtes Markup schreiben. Fehlt das, werden diese Klassen wegoptimiert und die Diagramme sind unsichtbar.

- [x] **Step 3: Build-Eingang schreiben**

`auswertung-demo/build/input.css`:

```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

- [x] **Step 4: `index.html` mit Kopfbereich und leeren Containern schreiben**

```html
<!DOCTYPE html>
<html lang="de">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>TechSaar Auswertung | Produkt-Demo</title>
<meta name="description" content="Produkt-Demo: Auswertung der Buchungen eines Betriebs — Auslastung, Entwicklung, Kundenstruktur und entgangener Umsatz auf einer Seite.">
<link rel="stylesheet" href="fonts/fonts.css">
<link rel="stylesheet" href="styles.css">
<style>
  .sr-only{position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;
           clip:rect(0,0,0,0);white-space:nowrap;border:0}
  .ts-tip{position:absolute;transform:translate(-50%,-100%);z-index:60;pointer-events:none;
          background:#EFE6D8;color:#17130F;font:12px/1.3 "IBM Plex Mono",monospace;
          padding:4px 7px;white-space:nowrap}
  .ts-tip[hidden]{display:none}
  @keyframes fadeUp{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:none}}
  .anim-up{animation:fadeUp .9s cubic-bezier(.2,.7,.2,1) both}
  @media (prefers-reduced-motion:reduce){
    .anim-up{animation:none}
    *{transition:none!important}
  }
</style>
</head>
<body class="bg-ofen font-sans text-ofentext antialiased">

<header class="mx-auto max-w-5xl px-5 pt-14 sm:pt-20">
  <p class="font-mono text-[11px] uppercase tracking-[0.5em] text-ofenmuted">TechSaar · Produkt-Demo</p>
  <h1 class="anim-up mt-4 max-w-3xl font-display text-4xl leading-[1.05] sm:text-6xl" style="font-weight:800">
    Auswertung
  </h1>
  <p class="mt-5 max-w-2xl text-ofenmuted sm:text-lg">
    Was aus den Buchungen wird, die über uns hereinkommen: wann bei Ihnen etwas los ist,
    ob es besser läuft als im Vormonat, wer zu Ihnen kommt und wo Geld liegen bleibt.
    Vier Fragen, vier Antworten, eine Seite.
  </p>
  <p class="mt-4 inline-block border border-senf px-3 py-1 font-mono text-[11px] uppercase tracking-wider text-senf">
    Alle Zahlen auf dieser Seite sind Beispieldaten
  </p>
  <noscript>
    <p class="mt-6 border border-terra px-4 py-3 text-[13px] text-terra">
      Für die Diagramme wird JavaScript benötigt — ein Auswertungswerkzeug rechnet im Browser.
      Ohne JavaScript sehen Sie diese Erklärung, aber keine Zahlen.
    </p>
  </noscript>
</header>

<main class="mx-auto max-w-5xl px-5 pb-24">

  <div id="zeitraum" class="mt-10 flex gap-px border border-ofenlinie bg-ofenlinie" role="group" aria-label="Zeitraum wählen"></div>

  <div id="kennzahlen" class="mt-8 grid grid-cols-2 gap-px border border-ofenlinie bg-ofenlinie sm:grid-cols-4"></div>

  <section class="mt-16">
    <h2 class="font-display text-2xl sm:text-3xl">Wann ist bei Ihnen was los?</h2>
    <p class="mt-2 max-w-xl text-[13px] text-ofenmuted">Buchungen je Wochentag und Uhrzeit. Je heller, desto voller.</p>
    <div id="heatmap" class="mt-6"></div>
  </section>

  <section class="mt-16">
    <h2 class="font-display text-2xl sm:text-3xl">Läuft es besser als vorher?</h2>
    <p class="mt-2 max-w-xl text-[13px] text-ofenmuted">Aktueller Zeitraum gegen die Vorperiode.</p>
    <div id="verlauf" class="mt-6"></div>
  </section>

  <section class="mt-16">
    <h2 class="font-display text-2xl sm:text-3xl">Wer kommt zu Ihnen?</h2>
    <p class="mt-2 max-w-xl text-[13px] text-ofenmuted">Stammkunden gegen Neukunden.</p>
    <div id="ring" class="mt-6"></div>
  </section>

  <section class="mt-16">
    <h2 class="font-display text-2xl sm:text-3xl">Wo bleibt Geld liegen?</h2>
    <p class="mt-2 max-w-xl text-[13px] text-ofenmuted">Entgangener Umsatz nach Ursache.</p>
    <div id="verluste" class="mt-6"></div>
  </section>

</main>

<footer class="border-t border-ofenlinie">
  <div class="mx-auto max-w-5xl px-5 py-10 font-mono text-[11px] uppercase tracking-wider text-ofenmuted">
    TechSaar · Produkt-Demo · Beispieldaten
  </div>
</footer>

<script src="data.js"></script>
<script src="charts.js"></script>
<script src="app.js"></script>
</body>
</html>
```

- [x] **Step 5: Tailwind bauen**

```bash
cd "C:/Users/babok/Techsaar/auswertung-demo" && npx --yes tailwindcss@3 -c tailwind.config.js -i build/input.css -o styles.css --minify
```

Erwartet: `styles.css` entsteht. Warnungen wegen fehlender `data.js`/`charts.js`/`app.js` sind zu diesem Zeitpunkt normal — Tailwind liest nur `index.html` und `charts.js` aus `content`, und beide dürfen fehlen.

- [x] **Step 6: Prüfskript schreiben**

`auswertung-demo/tools/verify.mjs`:

```js
/* Verifikation mit echtem Chromium. Ausführen aus auswertung-demo/:
   node tools/verify.mjs
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
  await page.goto(URL_SEITE);
  await page.waitForTimeout(300);

  console.log('\n[' + name + ' ' + breite + 'px]');
  pruefe(extern.length === 0, 'keine externen Requests' + (extern.length ? ' — ' + extern.join(', ') : ''));
  pruefe(konsole.length === 0, 'keine JS-Fehler' + (konsole.length ? ' — ' + konsole.join(' | ') : ''));

  const ueberlauf = await page.evaluate(() =>
    document.documentElement.scrollWidth > document.documentElement.clientWidth + 1);
  pruefe(!ueberlauf, 'kein waagerechter Überlauf');

  await ctx.close();
}

await browser.close();
console.log('\n' + (fehler.length ? fehler.length + ' Prüfung(en) fehlgeschlagen' : 'alle Prüfungen bestanden'));
process.exit(fehler.length ? 1 : 0);
```

- [x] **Step 7: Playwright lokal in `tools/` installieren**

`npx --package=playwright -- node skript.mjs` funktioniert **nicht** — ESM ignoriert `NODE_PATH`, das Skript findet das Paket nicht. Playwright muss dort liegen, von wo Node beim Auflösen nach oben läuft. `node_modules/` ist repo-weit ignoriert, wird also nie mitcommittet.

`auswertung-demo/tools/package.json`:

```json
{
  "name": "auswertung-demo-tools",
  "private": true,
  "type": "module",
  "description": "Nur Entwicklungswerkzeuge. Wird nicht ausgeliefert, node_modules ist repo-weit ignoriert.",
  "devDependencies": { "playwright": "1.61.1" }
}
```

```bash
cd "C:/Users/babok/Techsaar/auswertung-demo/tools" && npm install
cd "C:/Users/babok/Techsaar/auswertung-demo" && npx --yes playwright@1.61.1 install chromium
```

- [x] **Step 8: Prüfung ausführen**

```bash
cd "C:/Users/babok/Techsaar/auswertung-demo" && node tools/verify.mjs
```

Erwartet: „keine externen Requests" und „kein waagerechter Überlauf" bestehen. **„alle Dateien geladen" schlägt fehl** mit `fehlt: data.js, charts.js, app.js` — das ist in diesem Task korrekt und der Beweis, dass die Prüfung greift.

**Nicht auf die JS-Fehler-Prüfung verlassen:** Ein fehlendes `<script src>` löst über `file://` *keinen* `pageerror` aus, es scheitert still. Deshalb die zusätzliche `requestfailed`-Prüfung im Skript — ohne sie sähe eine Seite ganz ohne Skripte „grün" aus. (Der ursprüngliche Plan sagte hier fälschlich einen JS-Fehler voraus.)

- [x] **Step 9: Commit**

```bash
cd "C:/Users/babok/Techsaar"
git add auswertung-demo
git commit -m "feat(auswertung-demo): Geruest, lokale Schriften, Tailwind-Build, Pruefskript"
```

---

### Task 2: Datensatz mit Stimmigkeitsprüfung ✅ erledigt 2026-08-05

**Files:**
- Create: `auswertung-demo/data.js`
- Create: `auswertung-demo/tools/check-daten.mjs`

**Interfaces:**
- Consumes: nichts
- Produces: das globale `window.DATEN` mit den Schlüsseln `'7t'`, `'30t'`, `'12m'`. Jeder Satz hat die Felder `kennzahlen` (Feld aus `{label, wert, format, delta, gutIstWeniger?}`), `heatmap` (`{zeilen, spalten, spaltenMobil, werte, werteMobil, max}`), `verlauf` (`{punkte, reihen:[{name, werte, variante}]}`), `ring` (`{segmente:[{label, wert, variante}]}`), `verluste` (`{posten:[{label, wert, variante}]}`).

- [x] **Step 1: Prüfskript für die Stimmigkeit schreiben**

Dies ist der Test, und er kommt zuerst. Er erzwingt die Regel aus der Spec: Ring-Summe = Buchungen, Verlust-Summe = entgangener Umsatz, Heatmap-Summe = Buchungen, und `werteMobil` summiert sich je Zeile auf denselben Wert wie `werte`.

`auswertung-demo/tools/check-daten.mjs`:

```js
/* Prüft data.js auf innere Stimmigkeit. Ausführen aus auswertung-demo/:
   node tools/check-daten.mjs */
import { readFileSync } from 'node:fs';

const quelle = readFileSync('data.js', 'utf8');
const window = {};
new Function('window', quelle)(window);
const DATEN = window.DATEN;

const fehler = [];
function pruefe(bedingung, text) {
  if (bedingung) console.log('  ok   ' + text);
  else { console.log('  FEHL ' + text); fehler.push(text); }
}
const summe = f => f.reduce((a, b) => a + b, 0);
const kennzahl = (satz, label) => satz.kennzahlen.find(k => k.label === label).wert;

for (const key of ['7t', '30t', '12m']) {
  const s = DATEN[key];
  console.log('\n[' + key + ']');
  pruefe(!!s, 'Satz vorhanden');
  if (!s) continue;

  const buchungen = kennzahl(s, 'Buchungen');
  const verlust   = kennzahl(s, 'Entgangener Umsatz');

  pruefe(summe(s.ring.segmente.map(x => x.wert)) === buchungen,
    'Ring-Summe entspricht Buchungen (' + buchungen + ')');
  pruefe(summe(s.verluste.posten.map(x => x.wert)) === verlust,
    'Verlust-Summe entspricht entgangenem Umsatz (' + verlust + ')');
  pruefe(summe(s.heatmap.werte.map(summe)) === buchungen,
    'Heatmap-Summe entspricht Buchungen (' + buchungen + ')');

  const zeilenGleich = s.heatmap.werte.every((z, i) => summe(z) === summe(s.heatmap.werteMobil[i]));
  pruefe(zeilenGleich, 'werteMobil summiert je Zeile wie werte');

  pruefe(s.heatmap.werte.length === s.heatmap.zeilen.length, 'Heatmap: Zeilenzahl passt');
  pruefe(s.heatmap.werte.every(z => z.length === s.heatmap.spalten.length), 'Heatmap: Spaltenzahl passt');
  pruefe(s.heatmap.werteMobil.every(z => z.length === s.heatmap.spaltenMobil.length), 'Heatmap mobil: Spaltenzahl passt');
  pruefe(s.heatmap.max >= Math.max(...s.heatmap.werte.flat()), 'Heatmap: max ist nicht zu klein');
  pruefe(s.verlauf.reihen.every(r => r.werte.length === s.verlauf.punkte.length), 'Verlauf: Punktzahl passt');
}

console.log('\n' + (fehler.length ? fehler.length + ' Prüfung(en) fehlgeschlagen' : 'Datensatz ist stimmig'));
process.exit(fehler.length ? 1 : 0);
```

- [x] **Step 2: Prüfskript ausführen und Scheitern bestätigen**

```bash
cd "C:/Users/babok/Techsaar/auswertung-demo" && node tools/check-daten.mjs
```

Erwartet: Abbruch mit einem Fehler beim Lesen von `data.js` („no such file or directory"). Das ist der Beweis, dass der Test etwas prüft.

- [x] **Step 3: `data.js` schreiben — Satz `7t`**

Die Heatmap-Zeilen summieren sich auf 84 (12+10+11+13+16+18+4). `werteMobil` fasst je Zeile die Spalten 0–2, 3–5, 6–8, 9–11 zusammen.

```js
/* Beispieldatensatz für die Produkt-Demo. Keine echten Zahlen.
   Bei einer echten Kundenseite wird ausschließlich diese Datei ersetzt. */
window.DATEN = {
  '7t': {
    kennzahlen: [
      { label: 'Buchungen',          wert: 84,  format: 'zahl',    delta: 12 },
      { label: 'Auslastung',         wert: 71,  format: 'prozent', delta: 4 },
      { label: 'Absagequote',        wert: 9,   format: 'prozent', delta: -2, gutIstWeniger: true },
      { label: 'Entgangener Umsatz', wert: 340, format: 'euro',    delta: -55, gutIstWeniger: true },
    ],
    heatmap: {
      zeilen:  ['Mo','Di','Mi','Do','Fr','Sa','So'],
      spalten: ['09','10','11','12','13','14','15','16','17','18','19','20'],
      spaltenMobil: ['Vorm.','Mittag','Nachm.','Abend'],
      werte: [
        [0,1,2,1,0,1,2,2,1,1,1,0],
        [0,0,1,2,1,1,1,2,1,1,0,0],
        [1,1,1,1,0,1,2,2,1,1,0,0],
        [0,1,2,2,1,1,2,2,1,1,0,0],
        [1,1,2,2,1,2,2,2,1,1,1,0],
        [2,2,3,3,2,2,2,1,1,0,0,0],
        [0,0,1,1,1,1,0,0,0,0,0,0],
      ],
      werteMobil: [
        [3,2,5,2],
        [1,4,4,1],
        [3,2,5,1],
        [3,4,5,1],
        [4,5,5,2],
        [7,7,4,0],
        [1,3,0,0],
      ],
      max: 3,
    },
    verlauf: {
      punkte: ['Mo','Di','Mi','Do','Fr','Sa','So'],
      reihen: [
        { name: 'Diese Woche', werte: [12,10,11,13,16,18,4], variante: 'kobalt' },
        { name: 'Vorwoche',    werte: [10,9,10,12,14,15,5],  variante: 'ofenmuted' },
      ],
    },
    ring: {
      segmente: [
        { label: 'Stammkunden', wert: 52, variante: 'kobalt' },
        { label: 'Neukunden',   wert: 32, variante: 'celadon' },
      ],
    },
    verluste: {
      posten: [
        { label: 'No-Shows',             wert: 180, variante: 'terra' },
        { label: 'Kurzfristige Absagen', wert: 120, variante: 'senf' },
        { label: 'Leere Zeitfenster',    wert: 40,  variante: 'ofenmuted' },
      ],
    },
  },
};
```

- [x] **Step 4: Prüfskript ausführen — Satz `7t` muss bestehen**

```bash
cd "C:/Users/babok/Techsaar/auswertung-demo" && node tools/check-daten.mjs
```

Erwartet: Für `7t` alle Zeilen `ok`. Für `30t` und `12m` schlägt „Satz vorhanden" fehl. Falls eine `7t`-Summenprüfung fehlschlägt, die Zahlen im Datensatz korrigieren — **nicht** die Prüfung.

- [x] **Step 5: Sätze `30t` und `12m` ergänzen**

Dieselbe Struktur, andere Werte. Damit die Prüfung besteht, ohne zu raten: Die Heatmap wird aus **festen Tagessummen** aufgebaut, die zusammen die Kennzahl „Buchungen" ergeben. Innerhalb einer Zeile werden die zwölf Werte so verteilt, dass die Wochenform erkennbar bleibt — **Samstag am stärksten, Sonntag am schwächsten, Mittagsloch bei 13 und 14 Uhr**. Danach `werteMobil` durch Zusammenfassen der Spalten 0–2, 3–5, 6–8 und 9–11 bilden; die Zeilensumme bleibt dadurch automatisch gleich.

**`30t`** — Buchungen 361, Auslastung 68 %, Absagequote 11 % (`gutIstWeniger`), entgangener Umsatz 1480 € (`gutIstWeniger`). Deltas: +48, −3, +2, +180.

- Tagessummen: Mo 44, Di 41, Mi 47, Do 52, Fr 63, Sa 76, So 38 — **Summe 361**
- `verlauf.punkte`: `['KW 28','KW 29','KW 30','KW 31']`, Reihen `'Dieser Monat'` mit `[82,91,95,93]` (Summe 361) und `'Vormonat'` mit `[76,80,84,73]`
- Ring: Stammkunden 214 (`kobalt`), Neukunden 147 (`celadon`) — **Summe 361**
- Verluste: No-Shows 760 (`terra`), kurzfristige Absagen 520 (`senf`), leere Zeitfenster 200 (`ofenmuted`) — **Summe 1480**
- `heatmap.max` auf den höchsten entstandenen Zellwert setzen

**`12m`** — Buchungen 4180, Auslastung 73 %, Absagequote 10 % (`gutIstWeniger`), entgangener Umsatz 16900 € (`gutIstWeniger`). Deltas: +520, +5, −1, −900.

- Tagessummen: Mo 510, Di 478, Mi 545, Do 602, Fr 728, Sa 881, So 436 — **Summe 4180**
- `verlauf.punkte`: `['Jan','Feb','Mär','Apr','Mai','Jun','Jul','Aug','Sep','Okt','Nov','Dez']`, Reihen `'Dieses Jahr'` mit `[280,265,310,340,375,395,410,330,360,395,390,330]` (Summe 4180) und `'Vorjahr'` mit `[250,240,275,300,335,350,365,300,325,355,350,315]`
- Ring: Stammkunden 2760 (`kobalt`), Neukunden 1420 (`celadon`) — **Summe 4180**
- Verluste: No-Shows 8600 (`terra`), kurzfristige Absagen 6100 (`senf`), leere Zeitfenster 2200 (`ofenmuted`) — **Summe 16900**

Nach dem Schreiben prüft `tools/check-daten.mjs` jede dieser Summen. Schlägt eine fehl, ist die **Verteilung innerhalb der Zeilen** falsch, nicht die Vorgabe.

- [x] **Step 6: Prüfskript ausführen — alle drei Sätze müssen bestehen**

```bash
cd "C:/Users/babok/Techsaar/auswertung-demo" && node tools/check-daten.mjs
```

Erwartet: letzte Zeile „Datensatz ist stimmig", Exit-Code 0.

- [x] **Step 7: Commit**

```bash
cd "C:/Users/babok/Techsaar"
git add auswertung-demo/data.js auswertung-demo/tools/check-daten.mjs
git commit -m "feat(auswertung-demo): Datensatz fuer drei Zeitraeume mit Stimmigkeitspruefung"
```

---

### Task 3: `charts.js` — gemeinsame Basis und `renderBars` ✅ erledigt 2026-08-05

Der erste Renderer beweist die Basis. Balken sind der einfachste Fall.

**Files:**
- Create: `auswertung-demo/charts.js`
- Create: `auswertung-demo/app.js`
- Modify: `auswertung-demo/tools/verify.mjs`

**Interfaces:**
- Consumes: `window.DATEN` aus Task 2
- Produces: das globale `window.Charts` mit `renderBars(el, daten, opts)`, und intern `fmt(wert, art)`, `leeren(el)`, `tipBinden(el, text)`, `srTabelle(el, kopf, zeilen)`. Späteren Tasks stehen genau diese Hilfsfunktionen zur Verfügung. `app.js` exportiert nichts, sondern verdrahtet nur.

- [x] **Step 1: Prüfung in `verify.mjs` ergänzen**

Vor `await ctx.close();` einfügen:

```js
  const balken = await page.evaluate(() => {
    const el = document.getElementById('verluste');
    return {
      anzahl:   el.querySelectorAll('[data-tip]').length,
      tabelle:  !!el.querySelector('table.sr-only'),
      breiteOk: [...el.querySelectorAll('[data-balken]')]
                  .every(b => parseFloat(b.style.width) > 0),
    };
  });
  pruefe(balken.anzahl === 3, 'Verluste: drei Balken mit Tooltip');
  pruefe(balken.tabelle, 'Verluste: versteckte Datentabelle vorhanden');
  pruefe(balken.breiteOk, 'Verluste: alle Balken haben eine Breite > 0');
```

- [x] **Step 2: Prüfung ausführen und Scheitern bestätigen**

```bash
cd "C:/Users/babok/Techsaar/auswertung-demo" && node tools/verify.mjs
```

Erwartet: `FEHL Verluste: drei Balken mit Tooltip` (0 statt 3), `FEHL … Datentabelle`, Exit-Code 1.

- [x] **Step 3: `charts.js` mit Basis und `renderBars` schreiben**

```js
/* charts.js — handgebaute Diagramme für TechSaar.
   Kennt keine Inhalte. Alle Renderer sind idempotent: Container leeren, neu zeichnen.
   Farben kommen ausschließlich über Varianten-Namen als Tailwind-Klassen. */
window.Charts = (function () {
  'use strict';

  var FARBE = {
    kobalt:    'bg-kobalt',
    terra:     'bg-terra',
    senf:      'bg-senf',
    celadon:   'bg-celadon',
    ofenmuted: 'bg-ofenmuted',
  };
  var STRICH = {
    kobalt:    'stroke-kobalt',
    terra:     'stroke-terra',
    senf:      'stroke-senf',
    celadon:   'stroke-celadon',
    ofenmuted: 'stroke-ofenmuted',
  };

  function fmt(wert, art) {
    if (art === 'prozent') return wert + ' %';
    if (art === 'euro')    return wert.toLocaleString('de-DE') + ' €';
    return String(wert);
  }

  function leeren(el) { while (el.firstChild) el.removeChild(el.firstChild); }

  /* --- Tooltip: genau einer für die ganze Seite --- */
  var tip = null;
  function tipEl() {
    if (tip) return tip;
    tip = document.createElement('div');
    tip.className = 'ts-tip';
    tip.setAttribute('role', 'status');
    tip.hidden = true;
    document.body.appendChild(tip);
    return tip;
  }
  function tipZeigen(ziel, text) {
    var t = tipEl(), r = ziel.getBoundingClientRect();
    t.textContent = text;
    t.hidden = false;
    t.style.left = (window.scrollX + r.left + r.width / 2) + 'px';
    t.style.top  = (window.scrollY + r.top) + 'px';
  }
  function tipVerstecken() { if (tip) tip.hidden = true; }
  document.addEventListener('click', function (e) {
    if (!e.target.closest('[data-tip]')) tipVerstecken();
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') tipVerstecken();
  });

  /* Bindet Hover, Tastaturfokus und Tap. Tap ist nötig, weil es auf
     Touchgeräten kein Hover gibt. */
  function tipBinden(el, text) {
    el.setAttribute('data-tip', text);
    el.setAttribute('tabindex', '0');
    el.addEventListener('mouseenter', function () { tipZeigen(el, text); });
    el.addEventListener('mouseleave', tipVerstecken);
    el.addEventListener('focus',      function () { tipZeigen(el, text); });
    el.addEventListener('blur',       tipVerstecken);
    el.addEventListener('click',      function (e) { e.stopPropagation(); tipZeigen(el, text); });
  }

  /* --- Textalternative: ein SVG allein ist für Screenreader wertlos --- */
  function srTabelle(el, kopf, zeilen) {
    var t = document.createElement('table');
    t.className = 'sr-only';
    var thead = document.createElement('thead');
    var tr = document.createElement('tr');
    kopf.forEach(function (k) {
      var th = document.createElement('th');
      th.textContent = k;
      tr.appendChild(th);
    });
    thead.appendChild(tr);
    t.appendChild(thead);
    var tbody = document.createElement('tbody');
    zeilen.forEach(function (z) {
      var r = document.createElement('tr');
      z.forEach(function (c) {
        var td = document.createElement('td');
        td.textContent = c;
        r.appendChild(td);
      });
      tbody.appendChild(r);
    });
    t.appendChild(tbody);
    el.appendChild(t);
  }

  /* --- Balken: waagerecht, Breite anteilig am größten Posten --- */
  function renderBars(el, daten, opts) {
    opts = opts || {};
    var art = opts.format || 'zahl';
    leeren(el);

    var max = Math.max.apply(null, daten.posten.map(function (p) { return p.wert; }));
    var liste = document.createElement('ul');
    liste.className = 'grid gap-4';
    liste.setAttribute('aria-hidden', 'true');

    daten.posten.forEach(function (p) {
      var li = document.createElement('li');

      var kopf = document.createElement('div');
      kopf.className = 'flex items-baseline justify-between gap-3';
      var name = document.createElement('span');
      name.className = 'text-[13px]';
      name.textContent = p.label;
      var wert = document.createElement('span');
      wert.className = 'font-mono text-[13px] text-ofenmuted';
      wert.textContent = fmt(p.wert, art);
      kopf.appendChild(name);
      kopf.appendChild(wert);

      var spur = document.createElement('div');
      spur.className = 'mt-2 h-3 w-full bg-ofenkarte';
      var balken = document.createElement('div');
      balken.className = 'h-3 ' + (FARBE[p.variante] || FARBE.ofenmuted);
      balken.setAttribute('data-balken', '');
      balken.style.width = (max ? (p.wert / max * 100) : 0) + '%';
      tipBinden(balken, p.label + ': ' + fmt(p.wert, art));
      spur.appendChild(balken);

      li.appendChild(kopf);
      li.appendChild(spur);
      liste.appendChild(li);
    });

    el.appendChild(liste);
    srTabelle(el, ['Ursache', 'Betrag'],
      daten.posten.map(function (p) { return [p.label, fmt(p.wert, art)]; }));
  }

  return {
    renderBars: renderBars,
    _intern: { fmt: fmt, leeren: leeren, tipBinden: tipBinden, srTabelle: srTabelle,
               FARBE: FARBE, STRICH: STRICH },
  };
})();
```

`liste` trägt `aria-hidden="true"`, weil die Werte direkt darunter als echte Tabelle stehen — sonst liest ein Screenreader alles doppelt.

- [x] **Step 4: `app.js` schreiben**

```js
/* Verdrahtung: kennt die Inhalte, aber nicht das Zeichnen. */
(function () {
  'use strict';
  var AKTUELL = '7t';

  function zeichne(key) {
    var satz = window.DATEN[key];
    if (!satz) return;
    Charts.renderBars(document.getElementById('verluste'), satz.verluste, { format: 'euro' });
  }

  zeichne(AKTUELL);
})();
```

- [x] **Step 5: Tailwind neu bauen**

Die Renderer schreiben Klassen wie `bg-terra` und `h-3`, die Tailwind nur kennt, wenn `charts.js` mitgelesen wurde.

```bash
cd "C:/Users/babok/Techsaar/auswertung-demo" && npx --yes tailwindcss@3 -c tailwind.config.js -i build/input.css -o styles.css --minify
```

- [x] **Step 6: Prüfung ausführen**

```bash
cd "C:/Users/babok/Techsaar/auswertung-demo" && node tools/verify.mjs
```

Erwartet: alle Prüfungen bestanden, Exit-Code 0 — inklusive „keine JS-Fehler", das in Task 1 noch fehlschlug.

- [x] **Step 7: Commit**

```bash
cd "C:/Users/babok/Techsaar"
git add auswertung-demo
git commit -m "feat(auswertung-demo): charts.js Basis mit Tooltip, SR-Tabelle und Balkendiagramm"
```

---

### Task 4: `renderDonut`

**Files:**
- Modify: `auswertung-demo/charts.js`
- Modify: `auswertung-demo/app.js`
- Modify: `auswertung-demo/tools/verify.mjs`

**Interfaces:**
- Consumes: `fmt`, `leeren`, `tipBinden`, `srTabelle`, `FARBE` aus Task 3
- Produces: `Charts.renderDonut(el, { segmente:[{label, wert, variante}] }, opts)`

- [ ] **Step 1: Prüfung ergänzen**

In `tools/verify.mjs` vor `await ctx.close();`:

```js
  const ring = await page.evaluate(() => {
    const el = document.getElementById('ring');
    const kreise = [...el.querySelectorAll('circle[data-segment]')];
    return {
      anzahl: kreise.length,
      summeOk: kreise.every(c => parseFloat(c.getAttribute('stroke-dasharray')) > 0),
      tabelle: !!el.querySelector('table.sr-only'),
    };
  });
  pruefe(ring.anzahl === 2, 'Ring: zwei Segmente');
  pruefe(ring.summeOk, 'Ring: jedes Segment hat eine Länge > 0');
  pruefe(ring.tabelle, 'Ring: versteckte Datentabelle vorhanden');
```

- [ ] **Step 2: Prüfung ausführen und Scheitern bestätigen**

```bash
cd "C:/Users/babok/Techsaar/auswertung-demo" && node tools/verify.mjs
```

Erwartet: `FEHL Ring: zwei Segmente` (0 statt 2), Exit-Code 1.

- [ ] **Step 3: `renderDonut` in `charts.js` einfügen**

Direkt vor dem `return {` am Dateiende einfügen:

```js
  /* --- Ring: SVG-Kreis, Segmente über stroke-dasharray --- */
  var NS = 'http://www.w3.org/2000/svg';
  function svgEl(name, attr) {
    var e = document.createElementNS(NS, name);
    Object.keys(attr || {}).forEach(function (k) { e.setAttribute(k, attr[k]); });
    return e;
  }

  function renderDonut(el, daten, opts) {
    opts = opts || {};
    var art = opts.format || 'zahl';
    leeren(el);

    var gesamt = daten.segmente.reduce(function (a, s) { return a + s.wert; }, 0);
    var R = 60, U = 2 * Math.PI * R;

    var rahmen = document.createElement('div');
    rahmen.className = 'flex flex-col items-center gap-6 sm:flex-row sm:gap-10';

    var svg = svgEl('svg', {
      viewBox: '0 0 150 150', width: '150', height: '150',
      'aria-hidden': 'true', class: 'shrink-0',
    });
    /* -90° gedreht, damit das erste Segment oben beginnt */
    var gruppe = svgEl('g', { transform: 'rotate(-90 75 75)' });
    svg.appendChild(gruppe);
    gruppe.appendChild(svgEl('circle', {
      cx: 75, cy: 75, r: R, fill: 'none', 'stroke-width': 18, class: 'stroke-ofenkarte',
    }));

    var versatz = 0;
    daten.segmente.forEach(function (s) {
      var laenge = gesamt ? (s.wert / gesamt) * U : 0;
      var c = svgEl('circle', {
        cx: 75, cy: 75, r: R, fill: 'none', 'stroke-width': 18,
        'stroke-dasharray': laenge + ' ' + (U - laenge),
        'stroke-dashoffset': -versatz,
        'data-segment': '',
        class: (STRICH[s.variante] || STRICH.ofenmuted),
      });
      var anteil = gesamt ? Math.round(s.wert / gesamt * 100) : 0;
      tipBinden(c, s.label + ': ' + fmt(s.wert, art) + ' (' + anteil + ' %)');
      gruppe.appendChild(c);
      versatz += laenge;
    });

    var legende = document.createElement('ul');
    legende.className = 'grid gap-3';
    legende.setAttribute('aria-hidden', 'true');
    daten.segmente.forEach(function (s) {
      var li = document.createElement('li');
      li.className = 'flex items-center gap-3';
      var punkt = document.createElement('span');
      punkt.className = 'h-3 w-3 shrink-0 ' + (FARBE[s.variante] || FARBE.ofenmuted);
      var text = document.createElement('span');
      text.className = 'text-[13px]';
      text.textContent = s.label;
      var zahl = document.createElement('span');
      zahl.className = 'font-mono text-[13px] text-ofenmuted';
      zahl.textContent = fmt(s.wert, art)
        + (gesamt ? ' · ' + Math.round(s.wert / gesamt * 100) + ' %' : '');
      li.appendChild(punkt); li.appendChild(text); li.appendChild(zahl);
      legende.appendChild(li);
    });

    rahmen.appendChild(svg);
    rahmen.appendChild(legende);
    el.appendChild(rahmen);

    srTabelle(el, ['Gruppe', 'Anzahl', 'Anteil'], daten.segmente.map(function (s) {
      return [s.label, fmt(s.wert, art), (gesamt ? Math.round(s.wert / gesamt * 100) : 0) + ' %'];
    }));
  }
```

Und im `return`-Objekt `renderDonut: renderDonut,` hinzufügen.

- [ ] **Step 4: In `app.js` aufrufen**

In `zeichne` nach der `renderBars`-Zeile einfügen:

```js
    Charts.renderDonut(document.getElementById('ring'), satz.ring, { format: 'zahl' });
```

- [ ] **Step 5: Tailwind neu bauen und prüfen**

```bash
cd "C:/Users/babok/Techsaar/auswertung-demo"
npx --yes tailwindcss@3 -c tailwind.config.js -i build/input.css -o styles.css --minify
node tools/verify.mjs
```

Erwartet: alle Prüfungen bestanden, Exit-Code 0.

- [ ] **Step 6: Commit**

```bash
cd "C:/Users/babok/Techsaar"
git add auswertung-demo
git commit -m "feat(auswertung-demo): Ringdiagramm mit Legende"
```

---

### Task 5: `renderLine`

**Files:**
- Modify: `auswertung-demo/charts.js`
- Modify: `auswertung-demo/app.js`
- Modify: `auswertung-demo/tools/verify.mjs`

**Interfaces:**
- Consumes: `fmt`, `leeren`, `tipBinden`, `srTabelle`, `STRICH`, `svgEl` aus Tasks 3 und 4
- Produces: `Charts.renderLine(el, { punkte, reihen:[{name, werte, variante}] }, opts)`

- [ ] **Step 1: Prüfung ergänzen**

```js
  const verlauf = await page.evaluate(() => {
    const el = document.getElementById('verlauf');
    const linien = [...el.querySelectorAll('polyline[data-reihe]')];
    return {
      anzahl: linien.length,
      punkteOk: linien.every(l => (l.getAttribute('points') || '').split(' ').length >= 2),
      marker: el.querySelectorAll('[data-tip]').length,
      tabelle: !!el.querySelector('table.sr-only'),
    };
  });
  pruefe(verlauf.anzahl === 2, 'Verlauf: zwei Linien');
  pruefe(verlauf.punkteOk, 'Verlauf: beide Linien haben Punkte');
  pruefe(verlauf.marker > 0, 'Verlauf: Punkte mit Tooltip vorhanden');
  pruefe(verlauf.tabelle, 'Verlauf: versteckte Datentabelle vorhanden');
```

- [ ] **Step 2: Prüfung ausführen und Scheitern bestätigen**

```bash
cd "C:/Users/babok/Techsaar/auswertung-demo" && node tools/verify.mjs
```

Erwartet: `FEHL Verlauf: zwei Linien` (0 statt 2), Exit-Code 1.

- [ ] **Step 3: `renderLine` in `charts.js` einfügen**

Vor dem `return {` einfügen:

```js
  /* --- Verlauf: Polylinie in festem viewBox, Strichbreite skaliert nicht mit --- */
  function renderLine(el, daten, opts) {
    opts = opts || {};
    var art = opts.format || 'zahl';
    leeren(el);

    var B = 700, H = 240, L = 16, R = 16, O = 16, Uu = 34;   // Rand: links/rechts/oben/unten
    var alle = daten.reihen.reduce(function (a, r) { return a.concat(r.werte); }, []);
    var max = Math.max.apply(null, alle) || 1;
    var n = daten.punkte.length;

    function x(i) { return n < 2 ? L : L + i * (B - L - R) / (n - 1); }
    function y(v) { return H - Uu - (v / max) * (H - O - Uu); }

    var svg = svgEl('svg', {
      viewBox: '0 0 ' + B + ' ' + H, class: 'w-full', 'aria-hidden': 'true',
      preserveAspectRatio: 'xMidYMid meet',
    });

    /* Grundlinie */
    svg.appendChild(svgEl('line', {
      x1: L, y1: H - Uu, x2: B - R, y2: H - Uu, class: 'stroke-ofenlinie', 'stroke-width': 1,
    }));

    /* Vergleichsreihen zuerst zeichnen, damit die erste Reihe obenauf liegt */
    daten.reihen.slice().reverse().forEach(function (reihe, umgekehrt) {
      var istVergleich = (umgekehrt === 0) && daten.reihen.length > 1;
      var punkte = reihe.werte.map(function (v, i) { return x(i) + ',' + y(v); }).join(' ');
      var pl = svgEl('polyline', {
        points: punkte, fill: 'none', 'stroke-width': 2,
        'vector-effect': 'non-scaling-stroke',
        'data-reihe': reihe.name,
        class: (STRICH[reihe.variante] || STRICH.ofenmuted),
      });
      if (istVergleich) pl.setAttribute('stroke-dasharray', '5 5');
      svg.appendChild(pl);
    });

    /* Punkte nur auf der ersten (aktuellen) Reihe — sonst überlagern sich die Tooltips */
    var FUELL = {
      kobalt: 'fill-kobalt', terra: 'fill-terra', senf: 'fill-senf',
      celadon: 'fill-celadon', ofenmuted: 'fill-ofenmuted',
    };
    var erste = daten.reihen[0];
    erste.werte.forEach(function (v, i) {
      var c = svgEl('circle', {
        cx: x(i), cy: y(v), r: 5, 'data-punkt': '',
        class: (FUELL[erste.variante] || FUELL.ofenmuted),
      });
      tipBinden(c, daten.punkte[i] + ': ' + fmt(v, art));
      svg.appendChild(c);
    });

    /* Achsenbeschriftung — auf dem Handy nur jeder zweite Punkt */
    var schmal = window.matchMedia('(max-width: 640px)').matches;
    daten.punkte.forEach(function (p, i) {
      if (schmal && n > 7 && i % 2 !== 0) return;
      var t = svgEl('text', {
        x: x(i), y: H - 12, 'text-anchor': 'middle',
        class: 'fill-ofenmuted', style: 'font:12px "IBM Plex Mono",monospace',
      });
      t.textContent = p;
      svg.appendChild(t);
    });

    el.appendChild(svg);

    var legende = document.createElement('ul');
    legende.className = 'mt-4 flex flex-wrap gap-x-5 gap-y-2';
    legende.setAttribute('aria-hidden', 'true');
    daten.reihen.forEach(function (r, i) {
      var li = document.createElement('li');
      li.className = 'flex items-center gap-2 font-mono text-[11px] uppercase tracking-wider text-ofenmuted';
      var strich = document.createElement('span');
      strich.className = 'h-px w-6 ' + (FARBE[r.variante] || FARBE.ofenmuted);
      if (i > 0) strich.style.opacity = '.6';
      li.appendChild(strich);
      li.appendChild(document.createTextNode(r.name));
      legende.appendChild(li);
    });
    el.appendChild(legende);

    srTabelle(el,
      ['Punkt'].concat(daten.reihen.map(function (r) { return r.name; })),
      daten.punkte.map(function (p, i) {
        return [p].concat(daten.reihen.map(function (r) { return fmt(r.werte[i], art); }));
      }));
  }
```

Und im `return`-Objekt `renderLine: renderLine,` hinzufügen.

`vector-effect="non-scaling-stroke"` ist nötig, weil das SVG in der Breite skaliert — ohne das wird die Linie auf dem Handy dünner als auf dem Laptop.

- [ ] **Step 4: In `app.js` aufrufen**

```js
    Charts.renderLine(document.getElementById('verlauf'), satz.verlauf, { format: 'zahl' });
```

- [ ] **Step 5: Tailwind neu bauen und prüfen**

```bash
cd "C:/Users/babok/Techsaar/auswertung-demo"
npx --yes tailwindcss@3 -c tailwind.config.js -i build/input.css -o styles.css --minify
node tools/verify.mjs
```

Erwartet: alle Prüfungen bestanden, Exit-Code 0.

- [ ] **Step 6: Commit**

```bash
cd "C:/Users/babok/Techsaar"
git add auswertung-demo
git commit -m "feat(auswertung-demo): Verlaufsdiagramm mit Vergleichslinie"
```

---

### Task 6: `renderHeatmap` mit mobiler Verdichtung

**Files:**
- Modify: `auswertung-demo/charts.js`
- Modify: `auswertung-demo/app.js`
- Modify: `auswertung-demo/tools/verify.mjs`

**Interfaces:**
- Consumes: `fmt`, `leeren`, `tipBinden`, `srTabelle` aus Task 3
- Produces: `Charts.renderHeatmap(el, { zeilen, spalten, spaltenMobil, werte, werteMobil, max }, opts)`. Wählt anhand von `window.matchMedia('(max-width: 640px)')` zwischen `werte`/`spalten` und `werteMobil`/`spaltenMobil`.

- [ ] **Step 1: Prüfung ergänzen**

Diese Prüfung ist viewport-abhängig, deshalb nutzt sie die Variable `breite` aus der Schleife:

```js
  const heat = await page.evaluate(() => {
    const el = document.getElementById('heatmap');
    const zellen = [...el.querySelectorAll('[data-zelle]')];
    return {
      anzahl: zellen.length,
      tabelle: !!el.querySelector('table.sr-only'),
      alleMitTip: zellen.every(z => z.hasAttribute('data-tip')),
    };
  });
  const erwartet = breite < 641 ? 7 * 4 : 7 * 12;
  pruefe(heat.anzahl === erwartet, 'Heatmap: ' + erwartet + ' Zellen (hat ' + heat.anzahl + ')');
  pruefe(heat.alleMitTip, 'Heatmap: jede Zelle hat einen Tooltip');
  pruefe(heat.tabelle, 'Heatmap: versteckte Datentabelle vorhanden');
```

- [ ] **Step 2: Prüfung ausführen und Scheitern bestätigen**

```bash
cd "C:/Users/babok/Techsaar/auswertung-demo" && node tools/verify.mjs
```

Erwartet: `FEHL Heatmap: 84 Zellen (hat 0)` beim Desktop und `FEHL Heatmap: 28 Zellen (hat 0)` beim Handy, Exit-Code 1.

- [ ] **Step 3: `renderHeatmap` in `charts.js` einfügen**

Vor dem `return {` einfügen:

```js
  /* --- Heatmap: CSS-Raster. Auf dem Handy vier Tagesblöcke statt zwölf Uhrzeiten,
         weil zwölf Spalten auf 375px etwa 25px je Zelle ergäben. --- */
  function renderHeatmap(el, daten, opts) {
    opts = opts || {};
    var art = opts.format || 'zahl';
    leeren(el);

    var schmal  = window.matchMedia('(max-width: 640px)').matches;
    var spalten = schmal ? daten.spaltenMobil : daten.spalten;
    var werte   = schmal ? daten.werteMobil   : daten.werte;
    var max     = Math.max.apply(null, werte.map(function (z) {
      return Math.max.apply(null, z);
    })) || 1;

    var raster = document.createElement('div');
    raster.setAttribute('aria-hidden', 'true');
    raster.style.display = 'grid';
    raster.style.gap = '3px';
    raster.style.gridTemplateColumns = '2.2rem repeat(' + spalten.length + ', minmax(0, 1fr))';

    /* Kopfzeile */
    raster.appendChild(document.createElement('div'));
    spalten.forEach(function (s) {
      var k = document.createElement('div');
      k.className = 'text-center font-mono text-[10px] text-ofenmuted';
      k.textContent = s;
      raster.appendChild(k);
    });

    /* Datenzeilen */
    daten.zeilen.forEach(function (zeile, zi) {
      var kopf = document.createElement('div');
      kopf.className = 'flex items-center font-mono text-[11px] text-ofenmuted';
      kopf.textContent = zeile;
      raster.appendChild(kopf);

      werte[zi].forEach(function (v, si) {
        var z = document.createElement('div');
        z.setAttribute('data-zelle', '');
        z.className = 'aspect-square w-full bg-kobalt';
        /* Deckkraft statt verschiedener Farben: eine Farbfamilie liest sich
           als Skala, mehrere lesen sich als Kategorien. */
        z.style.opacity = v === 0 ? '0.08' : String(0.2 + 0.8 * (v / max));
        tipBinden(z, zeile + ' ' + spalten[si] + ': ' + fmt(v, art) + ' Buchungen');
        raster.appendChild(z);
      });
    });

    el.appendChild(raster);

    srTabelle(el, ['Tag'].concat(spalten), daten.zeilen.map(function (zeile, zi) {
      return [zeile].concat(werte[zi].map(function (v) { return fmt(v, art); }));
    }));
  }
```

Und im `return`-Objekt `renderHeatmap: renderHeatmap,` hinzufügen.

- [ ] **Step 4: In `app.js` aufrufen**

```js
    Charts.renderHeatmap(document.getElementById('heatmap'), satz.heatmap, { format: 'zahl' });
```

- [ ] **Step 5: Tailwind neu bauen und prüfen**

```bash
cd "C:/Users/babok/Techsaar/auswertung-demo"
npx --yes tailwindcss@3 -c tailwind.config.js -i build/input.css -o styles.css --minify
node tools/verify.mjs
```

Erwartet: alle Prüfungen bestanden, Exit-Code 0 — insbesondere 84 Zellen beim Desktop und 28 beim Handy.

- [ ] **Step 6: Commit**

```bash
cd "C:/Users/babok/Techsaar"
git add auswertung-demo
git commit -m "feat(auswertung-demo): Heatmap mit mobiler Verdichtung auf Tagesbloecke"
```

---

### Task 7: Kennzahlen-Reihe und Zeitraum-Umschalter

**Files:**
- Modify: `auswertung-demo/charts.js`
- Modify: `auswertung-demo/app.js`
- Modify: `auswertung-demo/tools/verify.mjs`

**Interfaces:**
- Consumes: alle vier Renderer, `fmt`, `leeren`
- Produces: `Charts.renderKpis(el, kennzahlen)` und im DOM drei Schaltflächen `#zeitraum button[data-key]` mit den Werten `7t`, `30t`, `12m`; die aktive trägt `aria-pressed="true"`.

- [ ] **Step 1: Prüfung ergänzen**

```js
  const kpi = await page.evaluate(() => {
    const el = document.getElementById('kennzahlen');
    return { anzahl: el.querySelectorAll('[data-kpi]').length };
  });
  pruefe(kpi.anzahl === 4, 'Kennzahlen: vier Kacheln');

  const schalter = await page.evaluate(() =>
    [...document.querySelectorAll('#zeitraum button[data-key]')].map(b => b.dataset.key));
  pruefe(schalter.join(',') === '7t,30t,12m', 'Umschalter: drei Schaltflächen in Reihenfolge');

  /* Umschalten muss alle vier Grafiken neu zeichnen — und darf nichts leer lassen. */
  for (const key of ['30t', '12m', '7t']) {
    await page.click('#zeitraum button[data-key="' + key + '"]');
    await page.waitForTimeout(120);
    const zustand = await page.evaluate(() => ({
      heat:    document.querySelectorAll('#heatmap [data-zelle]').length,
      linien:  document.querySelectorAll('#verlauf polyline[data-reihe]').length,
      ringe:   document.querySelectorAll('#ring circle[data-segment]').length,
      balken:  document.querySelectorAll('#verluste [data-balken]').length,
      gedrueckt: document.querySelector('#zeitraum button[aria-pressed="true"]')?.dataset.key,
      tabellen: document.querySelectorAll('table.sr-only').length,
    }));
    pruefe(zustand.heat > 0 && zustand.linien === 2 && zustand.ringe === 2 && zustand.balken === 3,
      key + ': alle vier Grafiken gezeichnet');
    pruefe(zustand.gedrueckt === key, key + ': Schaltfläche als aktiv markiert');
    pruefe(zustand.tabellen === 4, key + ': genau vier SR-Tabellen (keine Dopplung)');
  }
```

Die letzte Prüfung ist die wichtige: Sie fängt einen nicht-idempotenten Renderer, der beim Umschalten Tabellen anhäuft statt sie zu ersetzen.

- [ ] **Step 2: Prüfung ausführen und Scheitern bestätigen**

```bash
cd "C:/Users/babok/Techsaar/auswertung-demo" && node tools/verify.mjs
```

Erwartet: `FEHL Kennzahlen: vier Kacheln`, `FEHL Umschalter: drei Schaltflächen in Reihenfolge`, danach Abbruch beim Klick auf eine nicht vorhandene Schaltfläche.

- [ ] **Step 3: `renderKpis` in `charts.js` einfügen**

Vor dem `return {` einfügen:

```js
  /* --- Kennzahlen-Kacheln mit Trend --- */
  function renderKpis(el, kennzahlen) {
    leeren(el);
    kennzahlen.forEach(function (k) {
      var kachel = document.createElement('div');
      kachel.className = 'bg-ofenkarte px-5 py-4';
      kachel.setAttribute('data-kpi', '');

      var label = document.createElement('p');
      label.className = 'font-mono text-[11px] uppercase tracking-wider text-ofenmuted';
      label.textContent = k.label;

      var wert = document.createElement('p');
      wert.className = 'mt-2 font-mono text-3xl';
      wert.textContent = fmt(k.wert, k.format);

      var trend = document.createElement('p');
      var gut = k.gutIstWeniger ? (k.delta < 0) : (k.delta > 0);
      trend.className = 'mt-1 font-mono text-[11px] ' + (gut ? 'text-celadon' : 'text-terra');
      var pfeil = k.delta > 0 ? '▲' : (k.delta < 0 ? '▼' : '–');
      trend.textContent = pfeil + ' ' + fmt(Math.abs(k.delta), k.format) + ' zur Vorperiode';

      kachel.appendChild(label);
      kachel.appendChild(wert);
      kachel.appendChild(trend);
      el.appendChild(kachel);
    });
  }
```

Und im `return`-Objekt `renderKpis: renderKpis,` hinzufügen.

Die Farbe folgt `gutIstWeniger`, nicht dem Vorzeichen — eine sinkende Absagequote ist grün, obwohl das Delta negativ ist.

- [ ] **Step 4: `app.js` vollständig ersetzen**

```js
/* Verdrahtung: kennt die Inhalte, aber nicht das Zeichnen. */
(function () {
  'use strict';

  var ZEITRAEUME = [
    { key: '7t',  label: '7 Tage' },
    { key: '30t', label: '30 Tage' },
    { key: '12m', label: '12 Monate' },
  ];
  var aktuell = '7t';

  function zeichne(key) {
    var satz = window.DATEN[key];
    if (!satz) return;
    Charts.renderKpis(document.getElementById('kennzahlen'), satz.kennzahlen);
    Charts.renderHeatmap(document.getElementById('heatmap'), satz.heatmap, { format: 'zahl' });
    Charts.renderLine(document.getElementById('verlauf'), satz.verlauf, { format: 'zahl' });
    Charts.renderDonut(document.getElementById('ring'), satz.ring, { format: 'zahl' });
    Charts.renderBars(document.getElementById('verluste'), satz.verluste, { format: 'euro' });
  }

  function baueUmschalter() {
    var box = document.getElementById('zeitraum');
    ZEITRAEUME.forEach(function (z) {
      var b = document.createElement('button');
      b.type = 'button';
      b.dataset.key = z.key;
      b.textContent = z.label;
      b.className = 'flex-1 bg-ofenkarte px-4 py-2.5 font-mono text-[12px] uppercase '
                  + 'tracking-wider transition hover:text-ofentext';
      b.addEventListener('click', function () { waehle(z.key); });
      box.appendChild(b);
    });
  }

  function waehle(key) {
    aktuell = key;
    [].forEach.call(document.querySelectorAll('#zeitraum button[data-key]'), function (b) {
      var an = b.dataset.key === key;
      b.setAttribute('aria-pressed', an ? 'true' : 'false');
      b.classList.toggle('text-ofentext', an);
      b.classList.toggle('text-ofenmuted', !an);
    });
    zeichne(key);
  }

  /* Beim Drehen des Geräts wechselt die Heatmap zwischen zwölf Uhrzeiten und
     vier Tagesblöcken — deshalb neu zeichnen, aber entprellt. */
  var timer;
  window.addEventListener('resize', function () {
    clearTimeout(timer);
    timer = setTimeout(function () { zeichne(aktuell); }, 200);
  });

  baueUmschalter();
  waehle(aktuell);
})();
```

- [ ] **Step 5: Tailwind neu bauen und prüfen**

```bash
cd "C:/Users/babok/Techsaar/auswertung-demo"
npx --yes tailwindcss@3 -c tailwind.config.js -i build/input.css -o styles.css --minify
node tools/verify.mjs
```

Erwartet: alle Prüfungen bestanden, Exit-Code 0. Schlägt „genau vier SR-Tabellen" fehl, ist einer der Renderer nicht idempotent — dort fehlt `leeren(el)` am Anfang.

- [ ] **Step 6: Commit**

```bash
cd "C:/Users/babok/Techsaar"
git add auswertung-demo
git commit -m "feat(auswertung-demo): Kennzahlen-Reihe und Zeitraum-Umschalter"
```

---

### Task 8: Bewegung, Tastatur und Feinschliff

**Files:**
- Modify: `auswertung-demo/index.html`
- Modify: `auswertung-demo/tools/verify.mjs`

**Interfaces:**
- Consumes: die fertige Seite aus Task 7
- Produces: `prefers-reduced-motion`-Nachweis, sichtbare Fokusringe, gestaffeltes Einblenden der vier Abschnitte

- [ ] **Step 1: Prüfungen ergänzen**

Nach der Viewport-Schleife, vor `await browser.close();`:

```js
console.log('\n[reduced motion]');
{
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 }, reducedMotion: 'reduce' });
  const page = await ctx.newPage();
  await page.goto(URL_SEITE);
  await page.waitForTimeout(300);
  const laufend = await page.evaluate(() =>
    document.getAnimations().filter(a => a.playState === 'running').length);
  pruefe(laufend === 0, 'keine laufende Animation bei reducedMotion');
  await ctx.close();
}

console.log('\n[tastatur]');
{
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  const page = await ctx.newPage();
  await page.goto(URL_SEITE);
  await page.waitForTimeout(300);
  /* Erste Diagrammzelle fokussieren und prüfen, dass der Tooltip erscheint */
  await page.focus('#heatmap [data-zelle]');
  await page.waitForTimeout(120);
  const tipSichtbar = await page.evaluate(() => {
    const t = document.querySelector('.ts-tip');
    return !!t && !t.hidden && t.textContent.length > 0;
  });
  pruefe(tipSichtbar, 'Tooltip erscheint bei Tastaturfokus');
  await ctx.close();
}
```

- [ ] **Step 2: Prüfung ausführen und Ausgangslage festhalten**

```bash
cd "C:/Users/babok/Techsaar/auswertung-demo" && node tools/verify.mjs
```

Erwartet: „Tooltip erscheint bei Tastaturfokus" besteht bereits (`tipBinden` bindet `focus`). Die reduced-motion-Prüfung besteht nur, wenn keine Endlos-Animation läuft — schlägt sie fehl, benennt die Ausgabe die Ursache.

- [ ] **Step 3: Fokusring und gestaffeltes Einblenden ergänzen**

Im `<style>`-Block von `index.html` vor `@keyframes fadeUp` einfügen:

```css
  [data-tip]:focus-visible{outline:2px solid #EFE6D8;outline-offset:2px}
  .anim-up:nth-of-type(2){animation-delay:.06s}
  .anim-up:nth-of-type(3){animation-delay:.12s}
```

Und den vier `<section>`-Elementen in `index.html` jeweils `anim-up` in die Klassenliste aufnehmen, also `class="mt-16"` zu `class="anim-up mt-16"`.

Der Fokusring ist Pflicht: Ohne ihn sind die Diagramme per Tastatur bedienbar, aber man sieht nicht, wo man ist.

- [ ] **Step 4: Tailwind neu bauen und prüfen**

```bash
cd "C:/Users/babok/Techsaar/auswertung-demo"
npx --yes tailwindcss@3 -c tailwind.config.js -i build/input.css -o styles.css --minify
node tools/verify.mjs
```

Erwartet: alle Prüfungen bestanden, Exit-Code 0.

- [ ] **Step 5: Screenshots als Nachweis erzeugen**

Am Ende von `tools/verify.mjs` vor `await browser.close();` einfügen:

```js
console.log('\n[screenshots]');
for (const [name, breite, hoehe] of [['desktop', 1280, 1400], ['handy', 375, 1600]]) {
  const ctx = await browser.newContext({ viewport: { width: breite, height: hoehe } });
  const page = await ctx.newPage();
  await page.goto(URL_SEITE);
  await page.waitForTimeout(400);
  /* Endlos-Animationen anhalten, sonst wird der Renderer nie idle */
  await page.addStyleTag({ content: '*{animation-play-state:paused !important}' });
  await page.screenshot({ path: 'tools/screenshot-' + name + '.png', fullPage: true });
  console.log('  ok   tools/screenshot-' + name + '.png');
  await ctx.close();
}
```

Dann ausführen:

```bash
cd "C:/Users/babok/Techsaar/auswertung-demo" && node tools/verify.mjs
```

Erwartet: beide PNG entstehen. Beide ansehen und beurteilen: Ist die Heatmap auf dem Handy lesbar? Sind die Farben unterscheidbar? Wirkt die Seite ruhig oder überladen?

- [ ] **Step 6: Screenshots von der Versionierung ausnehmen**

`auswertung-demo/tools/.gitignore`:

```
screenshot-*.png
```

- [ ] **Step 7: Commit**

```bash
cd "C:/Users/babok/Techsaar"
git add auswertung-demo
git commit -m "feat(auswertung-demo): Fokusringe, gestaffeltes Einblenden, Screenshot-Nachweis"
```

---

### Task 9: Rechts-Check und Abschluss

**Files:**
- Modify: `auswertung-demo/index.html` (nur falls der Rechts-Check etwas verlangt)
- Modify: `docs/superpowers/plans/2026-08-05-auswertung-demo.md`

**Interfaces:**
- Consumes: die fertige Seite aus Task 8
- Produces: eine abgenommene, aber **nicht gepushte** Demo

- [ ] **Step 1: Rechts-Check ausführen**

Den Skill `website-recht-check` auf `auswertung-demo/index.html` anwenden. Er ist bei jeder neuen Seite vor dem Live-Gang Pflicht.

Erwartete Punkte, die er ansprechen wird, mit der jeweils vorgesehenen Antwort:

- **Impressum und Datenschutz:** Die Seite hat keine eigenen Rechtstexte. Da sie unter derselben Domain wie tech-saar.de ausgeliefert wird und wie die anderen Demos auf `../impressum.html` und `../datenschutz.html` verweisen kann, Footer-Links dorthin ergänzen — das ist die einzige zu erwartende inhaltliche Änderung.
- **Externe Dienste:** keine. Das Prüfskript belegt 0 externe Requests.
- **Beispieldaten:** ausgewiesen, im Kopfbereich und im Footer.
- **Barrierefreiheit (BFSG):** SR-Tabellen je Grafik, Tastaturfokus, sichtbare Fokusringe, `prefers-reduced-motion`.
- **KI-Kennzeichnung (AI Act Art. 50):** kein KI-erzeugtes Bild oder Video auf der Seite, also nicht anwendbar.

- [ ] **Step 2: Verlangte Änderungen umsetzen und neu bauen**

Falls der Rechts-Check Änderungen verlangt, diese umsetzen und danach:

```bash
cd "C:/Users/babok/Techsaar/auswertung-demo"
npx --yes tailwindcss@3 -c tailwind.config.js -i build/input.css -o styles.css --minify
node tools/verify.mjs
```

Erwartet: weiterhin alle Prüfungen bestanden, insbesondere 0 externe Requests.

- [ ] **Step 3: MotionScore-Gegencheck vermerken**

`npx motionscore` braucht eine erreichbare URL und kann gegen eine `file://`-Seite nicht laufen. Deshalb hier **nicht** ausführen, sondern als Nachlauf notieren: sobald die Seite gepusht und über GitHub Pages erreichbar ist, einmal

```bash
npx --yes motionscore "https://kunz-jakob-ctrl.github.io/Techsaar/auswertung-demo/" --no-upload
```

laufen lassen und das Ergebnis in `docs/motion-ai-kit-abgleich.md` unter „Praxisbeleg" ergänzen. **Nicht** `--cloud`, `--private` oder `--upload` verwenden — die sind kostenpflichtig.

- [ ] **Step 4: Plan abhaken und Ergebnis festhalten**

In dieser Plandatei alle Checkboxen auf `- [x]` setzen und unter den Titel einen Abschnitt „Ergebnis" mit dem Stand ergänzen: was gebaut wurde, was der Rechts-Check verlangte, was offen blieb.

- [ ] **Step 5: Abschluss-Commit**

```bash
cd "C:/Users/babok/Techsaar"
git add auswertung-demo docs
git commit -m "feat(auswertung-demo): Rechts-Check bestanden, Demo fertig"
git log --oneline -9
```

**Kein `git push`.** Der Live-Gang erfolgt erst auf ausdrückliches OK.

---

## Abbruchbedingungen

1. **Die Stimmigkeitsprüfung aus Task 2 lässt sich nicht erfüllen**, ohne die Zahlen unglaubwürdig zu machen (etwa weil eine realistische Wochenform nie genau 84 ergibt). Dann die Kennzahl anpassen, nicht die Prüfung abschwächen — und den neuen Wert in der Spec nachziehen.
2. **Die Heatmap ist auf 375px auch mit vier Tagesblöcken unlesbar.** Dann statt Verdichtung auf eine andere Darstellung wechseln (etwa nur die drei stärksten Tage) und die Spec korrigieren, statt eine unlesbare Grafik zu liefern.
3. **Playwright lässt sich in dieser Umgebung nicht ausführen.** Dann anhalten und melden — ohne echtes Chromium ist keine belastbare Verifikation möglich, und die eingebaute Vorschau ist für diese Seite ausdrücklich nicht verlässlich.
