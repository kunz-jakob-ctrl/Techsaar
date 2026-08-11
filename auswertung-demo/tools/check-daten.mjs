/* Prüft data.js auf innere Stimmigkeit. Ausführen aus auswertung-demo/:
   node tools/check-daten.mjs
   Ein Interessent, der nachrechnet, darf keinen Widerspruch finden. */
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
  pruefe(summe(s.verlauf.reihen[0].werte) === buchungen,
    'Verlauf (aktuelle Reihe) summiert auf Buchungen (' + buchungen + ')');

  const zeilenGleich = s.heatmap.werte.every((z, i) => summe(z) === summe(s.heatmap.werteMobil[i]));
  pruefe(zeilenGleich, 'werteMobil summiert je Zeile wie werte');

  pruefe(s.heatmap.werte.length === s.heatmap.zeilen.length, 'Heatmap: Zeilenzahl passt');
  pruefe(s.heatmap.werte.every(z => z.length === s.heatmap.spalten.length), 'Heatmap: Spaltenzahl passt');
  pruefe(s.heatmap.werteMobil.every(z => z.length === s.heatmap.spaltenMobil.length), 'Heatmap mobil: Spaltenzahl passt');
  pruefe(s.heatmap.max === Math.max(...s.heatmap.werte.flat()), 'Heatmap: max entspricht dem hoechsten Zellwert');
  pruefe(s.verlauf.reihen.every(r => r.werte.length === s.verlauf.punkte.length), 'Verlauf: Punktzahl passt');

  /* Wochenform: Samstag am staerksten, Sonntag am schwaechsten. Sonst wirkt die
     Heatmap zufaellig und der Betreiber erkennt sein Geschaeft nicht wieder. */
  const tage = s.heatmap.werte.map(summe);
  pruefe(tage[5] === Math.max(...tage), 'Wochenform: Samstag ist der staerkste Tag');
  pruefe(tage[6] === Math.min(...tage), 'Wochenform: Sonntag ist der schwaechste Tag');

  /* gutIstWeniger muss gesetzt sein, wo weniger besser ist — sonst faerbt die
     Kennzahl-Kachel eine Verbesserung rot. */
  ['Absagequote', 'Entgangener Umsatz'].forEach(label => {
    const k = s.kennzahlen.find(x => x.label === label);
    pruefe(k && k.gutIstWeniger === true, label + ': gutIstWeniger ist gesetzt');
  });
}

console.log('\n' + (fehler.length ? fehler.length + ' Prüfung(en) fehlgeschlagen' : 'Datensatz ist stimmig'));
process.exit(fehler.length ? 1 : 0);
