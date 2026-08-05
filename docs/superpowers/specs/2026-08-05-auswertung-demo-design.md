# TechSaar Auswertung — Design-Spec

*Erstellt: 2026-08-05 · Anlass: Rangfolge-Platz 2 aus `ui-tool-stack-entscheidung.md` · Methode: grillme*

## Ziel

Eine neue Produkt-Demo unter `auswertung-demo/index.html`, die zeigt, dass TechSaar Datenvisualisierung kann. Das schließt die größte Fähigkeitslücke im Bestand: **kein einziges von 19 Projekten zeigt Charts** (Stand 2026-08-04).

## Positionierung

Branchenlose Produkt-Demo, Geschwister zu `reservierung-demo` und `telefon-demo`. Erkennbar **dieselbe Produktwelt wie die Reservierungs-Demo**.

**Warum diese Kopplung:** Die erste Frage im Verkaufsgespräch lautet „wo kommen die Zahlen her?". Ein abstraktes Dashboard ohne erkennbare Datenquelle beantwortet sie nicht. Steht sichtbar dieselbe Welt dahinter, beantwortet sie sich von selbst — aus den Buchungen, die ohnehin über TechSaar laufen. Nebeneffekt: ein sauberer Upsell-Pfad (erst Reservierung, später Auswertung) statt zweier Demos, die im Termin konkurrieren.

**Bewusst verworfen:** ein eigenes Datenfeld wie Verkaufs- oder Warenzahlen. Diese Daten kämen aus einem Kassen- oder Warenwirtschaftssystem, das TechSaar nicht anbindet — man würde etwas vorführen, das man nicht liefern kann.

## Maßstab und harte Bedingungen

- **Self-Hosting:** 0 externe Requests. Schriften lokal, Tailwind lokal gebaut, keine Chart-Bibliothek, kein CDN.
- **Indexierbar:** kein `noindex`. Eigenes Produkt unter eigenem Namen, keine fiktive Kundenmarke — anders als bei den Branchendemos.
- **Beispieldaten klar kennzeichnen.** Erfundene Zahlen dürfen nicht wie echte Kennzahlen wirken (UWG).
- **Handy-tauglich ab 375px.**
- `website-recht-check` vor dem Live-Gang.
- **Committen ja, pushen nein** — erst auf ausdrückliches OK.

## Aufbau der Seite

Kurzer Kopfbereich (2–3 Sätze: was das ist, für wen, woher die Zahlen kommen), dann das Dashboard: Kennzahlen-Reihe, danach vier Abschnitte mit **je genau einer Grafik**, in erzählender Reihenfolge.

| # | Frage an den Betreiber | Grafik |
|---|---|---|
| 1 | Wann ist bei mir was los? | Heatmap Wochentag × Uhrzeit |
| 2 | Läuft es besser als letzten Monat? | Verlaufslinie mit gestrichelter Vergleichslinie der Vorperiode |
| 3 | Wer kommt zu mir? | Ring: Neu- gegen Stammkunden |
| 4 | Wo verliere ich Geld? | Balken mit Euro-Beträgen: No-Shows, kurzfristige Absagen, leere Zeitfenster |

**Bewusst je eine Grafik pro Frage.** Vier Fragen mit je zwei bis drei Diagrammen ergäben eine Wand, in der der Interessent den Faden verliert.

## Architektur

### Dateien

```
auswertung-demo/
  index.html          Struktur, Texte, leere Diagramm-Container, Zeitraum-Umschalter
  charts.js           vier Renderer auf gemeinsamer Basis — kennt keine Inhalte
  data.js             der Datensatz — kennt keine Darstellung
  styles.css          Tailwind-Build (erzeugt, nicht von Hand bearbeiten)
  build/input.css     Build-Eingang
  tailwind.config.js  Farben/Schriften, gespiegelt von reservierung-demo
  fonts/              sechs woff2 + fonts.css, kopiert von reservierung-demo
```

**Die Trennlinie ist der Kern des Entwurfs:** `charts.js` weiß nichts über Reservierungen, `data.js` nichts über SVG. Daran hängt der Wiederverwendungswert — bei einer echten Kundenseite tauscht man `data.js`, sonst nichts. `charts.js` soll für Datenvisualisierung werden, was `animations.js` für Animationen ist.

### Schnittstelle von `charts.js`

Vier Funktionen gleicher Form, alle **idempotent** — sie leeren den Container und zeichnen neu. Das ist Voraussetzung für den Zeitraum-Umschalter.

```js
renderHeatmap(el, { zeilen, spalten, werte, max }, opts)
renderLine(el,    { punkte, reihen: [{ name, werte, variante }] }, opts)
renderDonut(el,   { segmente: [{ label, wert, variante }] }, opts)
renderBars(el,    { posten: [{ label, wert, variante }] }, opts)
```

- `zeilen` / `spalten` / `punkte` / `label` sind Zeichenketten für die Beschriftung.
- `werte` bei der Heatmap ist ein zweidimensionales Zahlenfeld `werte[zeile][spalte]`.
- `variante` ist einer der Farbnamen `kobalt`, `terra`, `senf`, `celadon`.
- `opts.format` ist `'zahl' | 'prozent' | 'euro'` und steuert Tooltip und Beschriftung.

Geteilt darunter:

- eine lineare Skalierungsfunktion,
- **ein** Tooltip-Element für die ganze Seite (nicht eines je Diagramm),
- die Formatierung nach `opts.format`,
- die Erzeugung der versteckten Datentabelle (siehe Barrierefreiheit).

**Keine Hex-Farben im JavaScript.** Varianten werden zu CSS-Klassen, die Farbe kommt aus der Tailwind-Konfiguration. Sonst driften Diagramme und Seite bei jeder Farbänderung auseinander.

### Datenmodell in `data.js`

Drei fertige Sätze für die drei Zeiträume:

```js
const DATEN = {
  '7t': {
    kennzahlen: [
      { label: 'Buchungen',       wert: 84,   format: 'zahl',    delta: +12 },
      { label: 'Auslastung',      wert: 71,   format: 'prozent', delta: +4  },
      { label: 'Absagequote',     wert: 9,    format: 'prozent', delta: -2  },
      { label: 'Entgangener Umsatz', wert: 340, format: 'euro',  delta: -55 },
    ],
    heatmap: {
      zeilen:  ['Mo','Di','Mi','Do','Fr','Sa','So'],
      spalten: ['09','10','11','12','13','14','15','16','17','18','19','20'],
      spaltenMobil: ['Vorm.','Mittag','Nachm.','Abend'],
      werte:      [[…12 Zahlen…], …7 Zeilen…],
      werteMobil: [[…4 Zahlen…],  …7 Zeilen…],
      max: 12,
    },
    verlauf: {
      punkte: ['Mo','Di','Mi','Do','Fr','Sa','So'],
      reihen: [
        { name: 'Diese Woche',  werte: [8,11,9,14,17,19,6], variante: 'kobalt'  },
        { name: 'Vorwoche',     werte: [7,10,9,12,15,16,7], variante: 'ofenmuted' },
      ],
    },
    ring: {
      segmente: [
        { label: 'Stammkunden', wert: 52, variante: 'kobalt'  },
        { label: 'Neukunden',   wert: 32, variante: 'celadon' },
      ],
    },
    verluste: {
      posten: [
        { label: 'No-Shows',              wert: 180, variante: 'terra' },
        { label: 'Kurzfristige Absagen',  wert: 120, variante: 'senf'  },
        { label: 'Leere Zeitfenster',     wert:  40, variante: 'ofenmuted' },
      ],
    },
  },
  '30t': { /* gleiche Form, andere Werte und Beschriftungen */ },
  '12m': { /* gleiche Form, Punkte = Monatsnamen */ },
};
```

Feste Regeln für den Datensatz:

- **Jeder Satz enthält alles, was die Seite braucht** — kein Rechnen zur Laufzeit, keine Ableitung eines Zeitraums aus einem anderen. Das kostet etwas Redundanz und spart jede Klasse von Umrechnungsfehlern.
- `delta` ist die Veränderung gegenüber der Vorperiode in derselben Einheit wie `wert`; das Vorzeichen steuert Pfeil und Farbe. Bei `Absagequote` und `Entgangener Umsatz` ist ein **negatives** Delta die gute Richtung — dafür trägt die Kennzahl zusätzlich `gutIstWeniger: true`.
- Die Heatmap führt **zwei** Wertesätze: `werte` (12 Uhrzeiten, Desktop) und `werteMobil` (4 Tagesblöcke). Verdichtet wird beim Schreiben des Datensatzes, nicht zur Laufzeit — sonst müsste `charts.js` etwas über Uhrzeiten wissen.
- Die Zahlen müssen **untereinander stimmig** sein: die Summe der Ring-Segmente ergibt die Kennzahl „Buchungen", die Summe der Verlustposten die Kennzahl „Entgangener Umsatz", und die Summe der Heatmap-Werte ebenfalls „Buchungen". Ein Interessent, der nachrechnet, darf keinen Widerspruch finden.

**Fest eingebauter Datensatz, keine Zufallszahlen.** Im Termin muss verlässlich dasselbe auf dem Bildschirm stehen; man muss auf eine Zahl zeigen können, die man kennt.

### Datenfluss

Der Zeitraum-Umschalter (7 Tage / 30 Tage / 12 Monate) ruft eine Funktion in `index.html`, die die Kennzahlen-Reihe aktualisiert und alle vier Renderer erneut aufruft. Kein Zustand außerhalb dieser Funktion, kein Framework, kein Ereignissystem.

## Verhalten auf dem Handy

| Grafik | Desktop | Ab 375px |
|---|---|---|
| Heatmap | 7 Wochentage × 12 Uhrzeiten | **verdichtet auf 7 × 4 Tagesblöcke** (Vormittag / Mittag / Nachmittag / Abend) |
| Verlaufslinie | Kurve + Vergleichslinie | gleiche Kurve, weniger Achsenbeschriftung |
| Ring | Ring, Legende daneben | Legende unter den Ring |
| Balken | waagerecht mit Betrag rechts | Beträge unter das Label |

**Warum die Heatmap verdichtet und nicht gedreht wird:** Gedreht wären es 12 Spalten auf 375px, also rund 25px je Zelle — nicht mehr treffsicher antippbar und mit unlesbarer Beschriftung.

**Tooltips auf Touch:** Hover existiert dort nicht. Ein Tippen zeigt den Wert, ein Tippen daneben blendet ihn aus.

## Robustheit

### Ohne JavaScript — bewusste Abweichung

Ein Dashboard ohne JavaScript zeigt keine Daten; die Zahlen *sind* das Interaktive. Das unterscheidet es von einer Marketingseite.

**Entscheidung:** Kopfbereich und Erklärtext stehen statisch im HTML und bleiben ohne JS sichtbar, dazu ein `<noscript>`-Hinweis. Die Seite ist damit nie leer, aber ohne JS auch nicht vollständig.

**Verworfene Alternative:** die Zahlen zusätzlich als echte Tabellen ins HTML schreiben. Das hielte die Seite ohne JS vollständig, erzeugt aber zwei Pflegestellen für denselben Datensatz — genau die Art von Duplikat, die später auseinanderläuft.

Damit weicht diese Seite bewusst von der sonstigen Regel in Abschnitt 4b des `web-animations`-Skills ab („Seite darf ohne JS nicht leer sein"). Sie ist nicht leer — sie ist unvollständig, und das ist bei einem Auswertungswerkzeug vertretbar.

### Barrierefreiheit

Jede Grafik erhält zusätzlich eine visuell versteckte Tabelle mit denselben Werten. Ein SVG allein ist für Screenreader wertlos. Erzeugt wird sie in `charts.js`, gilt also automatisch für alle vier Diagramme.

### Animation

`reservierung-demo` nutzt kein Motion, sondern CSS-Keyframes (`anim-up`). Das wird übernommen — keine neue Abhängigkeit. `prefers-reduced-motion` schaltet alle Bewegung ab.

## Gestaltung

Übernommen von `reservierung-demo`:

- **Schriften:** Bricolage Grotesque (Display), Instrument Sans (Fließtext), IBM Plex Mono (Zahlen und Labels) — alle lokal als woff2.
- **Palette:** die dunklen `ofen`-Töne (`ofen` `#17130F`, `ofenkarte` `#211B15`, `ofenlinie` `#3A3229`, `ofentext` `#EFE6D8`, `ofenmuted` `#9C8F7D`). Der Betreiber-Bereich der Reservierungs-Demo ist bereits dunkel — das ist die richtige Bühne für ein Dashboard.
- **Akzente für Diagrammreihen:** `kobalt` `#2B49C4`, `terra` `#C05B33`, `senf` `#D19E3F`, `celadon` `#7FA48E`.
- **Build:** Tailwind 3.4.19 lokal, Befehl wie im Bestand:
  `npx tailwindcss@3 -c tailwind.config.js -i build/input.css -o styles.css --minify`

## Explizite Non-Goals

- **Keine Änderung** an `reservierung-demo`, `telefon-demo` oder tech-saar.de — auch **keine Verlinkung** dorthin oder von dort. Die Demo steht unter eigener URL.
- Keine echte Datenanbindung, kein Login, kein Export.
- Keine Verkaufsseite mit Preisen, Nutzenargumenten und Kontaktformular.
- Keine Filter über den Zeitraum-Umschalter hinaus — kein Filtern nach Quelle oder Kategorie, keine klickbaren Diagramme, die andere Diagramme filtern.
- Kein React, keine Chart-Bibliothek, kein zweiter Build-Weg.
- Keine Zufallsdaten.

## Verifikation

Echtes Chromium per Playwright, nicht die eingebaute Vorschau (siehe `web-animations` Abschnitt 4b):

1. Bei 1280px und 375px: **kein waagerechter Überlauf** am `body`.
2. Alle drei Zeitraum-Zustände nacheinander schalten, danach je Container prüfen, dass ein SVG bzw. Raster vorhanden und nicht leer ist.
3. Tooltip erscheint bei Hover (Desktop) und bei Tap (Touch-Emulation).
4. Context mit `reducedMotion: 'reduce'`: keine laufende Animation.
5. Für Screenshots vorher `*{animation-play-state:paused !important}` injizieren.
6. Nach dem Erreichbarmachen zusätzlich `npx motionscore <url> --no-upload`.

## Erfolgskriterium

Ein Interessent versteht ohne Erklärung in zehn Sekunden, was er sieht, und bekommt auf jede der vier Fragen genau eine Antwort — auch auf dem Handy. Der Datensatz ist bei jedem Aufruf derselbe. Die Seite lädt ohne einen einzigen externen Request.
