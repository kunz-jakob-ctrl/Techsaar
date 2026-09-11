# SBS Bau — Demo-Website

Demo für **SBS Bau** (Komplettsanierung im Saarpfalz-Kreis). Gebaut als Gesprächsgrundlage:
Die Seite soll auf den ersten Blick zeigen, dass hier **ganze Objekte** saniert werden — und
dass Kleinaufträge bewusst nicht angenommen werden.

Lokal ansehen:

```bash
npx -y http-server sbs-bau-demo -p 8136 -c-1
```

(oder Launch-Konfiguration `sbs-bau-demo` in `.claude/launch.json`)

---

## Gestaltungsidee

Die Seite vollzieht selbst eine Sanierung: Sie beginnt **dunkel und schwer** (Bestand,
Baustelle), kippt in der Bauszene ins **Helle** (fertiges Objekt) und bleibt danach hell und
architektonisch. Der Fußbereich schließt wieder dunkel.

- **Schrift:** Instrument Serif (Aussagen) · Geist (Text) · Geist Mono (Daten und Beschriftungen)
- **Farben:** Beton-Anthrazit, warmes Papierweiß, Kupfer als einziger Akzent
- **Navigation:** breite Kopfzeile ohne schwebende „Pille“; über dem Hero transparent,
  beim Scrollen hell werdend, mobil ein Vollbild-Menü. Bewusst anders als die anderen Demos.

---

## Seiten

| Datei | Inhalt |
|---|---|
| `index.html` | Hero, **Bauszene**, Leistungen, Kennzahlen, Abgrenzung, Projekte, Ablauf, Region, Kontakt |
| `leistungen.html` | Die vier Leistungsbereiche im Detail, Grenzen, häufige Fragen |
| `projekte.html` | Projektübersicht mit Filter und Detailfenster (Vorher/Nachher) |
| `anfrage.html` | Fünfstufige Projektanfrage **mit Filter gegen Kleinaufträge** |
| `intern.html` | Projektverwaltung als Vorschau: Fotos hochladen und veröffentlichen |
| `impressum.html`, `datenschutz.html` | Platzhalter-Rechtstexte |

---

## Die drei Dinge, die im Termin gezeigt werden sollten

**1. Die Bauszene (Startseite, gleich nach dem Hero).**
Beim Scrollen baut sich ein Objekt auf: Bestand mit Rissen → Entkernung und Gerüst →
Dachstuhl → **Ziegel fliegen einzeln aufs Dach** → Fassade und Fenster → Übergabe.
Am Ende wird der Hintergrund hell — die Seite übergibt in den hellen Teil.
Gebaut als SVG in `js/bauszene.js`, ohne Bibliothek, ca. 25 kB.

**2. Die Projektanfrage (`anfrage.html`).**
Fünf Schritte, rechts füllt sich das Projektprofil mit. Drei Antworten führen in eine
freundliche Sackgasse statt ans Telefon:

- Vorhaben „Einzelne Reparatur oder Montage“
- Größenordnung „unter 50.000 €“
- Objekt weiter als 40 km entfernt

Das ist die direkte Antwort auf das Problem der alten Website („Kunden riefen an, um eine
Lampe aufzuhängen“). Im Termin: Schritt 2 aufrufen und die gestrichelte Kachel anklicken.

**3. Die Projektverwaltung (`intern.html`).**
Anmelden (jede Eingabe funktioniert) → Projekt anlegen → **Fotos per Drag & Drop** →
je Foto „Bestand“ oder „Übergabe“ festlegen → veröffentlichen. Das Projekt erscheint danach
sofort auf `projekte.html`, ganz oben. Damit ist der Wunsch „wir wollen Projektbilder selbst
hochladen“ vorführbar, ohne dass ein Server nötig ist.

---

## Was echt ist und was nicht

**Echt umgesetzt:** Scroll-Bauszene, Vorher/Nachher-Regler, Projektfilter und Detailfenster,
Anfragestrecke inklusive Filterlogik, Foto-Upload mit Verkleinerung im Browser,
Veröffentlichen und Anzeigen auf der Projektseite.

**Nur Vorschau:** Es gibt keinen Server. Die Anfrage wird nicht verschickt, die
Projektverwaltung speichert im `localStorage` des jeweiligen Browsers, die Anmeldung prüft
nichts. Für den Echtbetrieb bräuchte es Hosting, Mailversand (oder Formspree/Netlify Forms)
und eine kleine Server-Anwendung für die Projekte.

---

## Datenschutz / Technik

- **Keine externen Anfragen.** Schriften, Bilder und Skripte kommen vom eigenen Verzeichnis.
  Kein Google Fonts, kein CDN, keine Analyse, keine Cookies → kein Einwilligungsbanner nötig.
- Kein Build-Schritt: reines HTML, CSS und JavaScript. Öffnen genügt.
- **Ohne JavaScript** bleibt die Seite vollständig lesbar; die Bauszene wird durch einen
  Textblock ersetzt (`.szene-huelle.ohne-js`).
- `prefers-reduced-motion` wird beachtet: keine Pinnung, keine Einblendungen, die Bauszene
  zeigt sofort das fertige Objekt.

---

## Vor der Übergabe zu ersetzen

Alle veränderlichen Angaben stehen im `CONFIG`-Block oben in jeder HTML-Datei.
Mit `PLATZHALTER` markiert sind:

- `rechtsform`, `strasse`, `plzOrt` — echte Anschrift
- `telefon`, `telefonText`, `mail` — echte Kontaktdaten
- `zeiten` — echte Erreichbarkeit
- `mindestvolumen` und `radius` — **unbedingt mit den Geschäftsführern abstimmen.**
  Aktuell 50.000 € und 40 km; die Zahlen stehen an mehreren Stellen prominent.

Ebenfalls offen:

- Die **Kennzahlen** (über 140 Objekte, bis zu 12 Gewerke) stammen von SBS Bau; Zeitraum/Quelle vor Veröffentlichung ergänzen.
- Alle **Projekte** in `js/projekte-daten.js` sind Beispiele, Bilder von Unsplash.
  Sobald SBS Bau eigene Fotos liefert, in `img/` ablegen und die Datei anpassen.
- **Rechtstexte** sind Platzhalter und müssen geprüft werden.
- Das Zitat der Bauleitung braucht einen echten Namen.

---

## Prüfhilfen (nur für Entwicklung und Screenshots)

| Parameter | Wirkung |
|---|---|
| `?szene=0.66` | friert die Bauszene auf diesem Stand ein |
| `?nur=leistungen` | blendet alle anderen Abschnitte aus |
| `?y=1500` | springt hart auf eine Scrollposition |
| `?schritt=4` | Anfrage: direkt zu diesem Schritt (auf `anfrage.html`) |
| `?stopp=volumen` | Anfrage: zeigt die Sackgasse (`klein`, `volumen`, `entfernung`) |
| `?offen=1` | `intern.html`: überspringt die Anmeldung |

---

## Bildnachweis

Alle Fotos: Unsplash (freie Lizenz), heruntergeladen nach `img/`.
Sie sind **Platzhalter** und sollen durch eigene Projektfotos von SBS Bau ersetzt werden —
das ist zugleich das beste Verkaufsargument für die Projektverwaltung.

---

## Vorschau: Bauzeitenplan statt Bauszene (2026-09-11)

`index.vorschau.html` ist eine Kopie der Startseite, in der die gepinnte Scroll-Bauszene
durch einen **zeitgesteuerten Bauzeitenplan** ersetzt ist. Das Original bleibt unangetastet.

- **Warum:** Die Bauszene kostete 480vh (mobil 360vh) reinen Scrollweg, ohne Ausstieg, und
  die Anker-Links „Ablauf“ und „Kontakt“ zogen durch die ganze Animation. Sie erzählte
  zudem den Bauablauf ein zweites Mal (siehe Sektion „Ablauf“) und zeigte Dachdecker-Phasen
  statt Gewerkekoordination, dem eigentlichen Verkaufsargument.
- **Was neu ist:** Eine Sektion, eine Bildschirmhöhe. Zwölf Gewerke als Balken über 28 Wochen,
  darüber die durchgehende Kupferlinie „Ihr Bauleiter“ mit einem Bautagebuch-Punkt je Woche,
  rechts das fertige Haus als Emblem mit „Übergabe · Woche 28“. Läuft in ca. 6,5 s los, sobald
  die Sektion sichtbar wird; die Bühne kippt am Ende wie bisher ins Helle.
  Zeiger oder Antippen auf ein Gewerk zeigt eine Zeile Erklärung.
- **Dateien:** `index.vorschau.html`, `css/bauzeitenplan.css`, `js/bauzeitenplan.js`.
  Zusätzlich setzt `bauzeitenplan.css` ein `scroll-margin-top` für alle Sektionen mit ID,
  damit Anker nicht mehr unter der fixierten Kopfzeile landen.
- **Ohne JavaScript / reduzierte Bewegung:** sofort der fertige Plan, keine Bewegung.
- **Prüfhilfe:** `?plan=0.6` friert den Plan auf diesem Stand ein.
- **Übernehmen:** `index.vorschau.html` nach `index.html` kopieren; `js/bauszene.js` und der
  Bauszene-Block in `css/bereiche.css` werden dann nicht mehr gebraucht.

## Vorschau 2: „Für wen wir bauen“ statt Ja/Nein-Liste (2026-09-11)

`index.vorschau2.html` baut auf Vorschau 1 auf (Bauzeitenplan bleibt) und ersetzt die Sektion
„Wofür Sie uns anrufen sollten und wofür nicht“ durch drei Kundensituationen:
Eigentümer (ganzes Haus oder ganze Einheit), Vermieter und Verwalter (mehrere Einheiten),
Praxen/Büros/Betriebe (fester Eröffnungstermin). Jede Karte verlinkt auf den passenden
Leistungsbereich. Das Nein steht nur noch als ein Satz am Fuß („Nicht bei uns“) mit Hinweis
auf die Handwerkskammer des Saarlandes, ohne Minus-Raster und ohne den „Arroganz“-Absatz.

- **Warum:** Aus Kundensicht (Eigentümer, Vermieter, Praxis, junge Familie, Kleinauftrag)
  sagte die Startseite an vier Stellen Nein. Die Liste traf mit „kurzfristige Zwischentermine“
  und „Stundenbasis“ auch Wunschkunden. Der harte Filter bleibt im Anfrage-Funnel.
- **Dateien:** `index.vorschau2.html`, `css/fuerwen.css`. Kein neues JavaScript.
- **Unverändert:** Hero-Kennzahl „ab 50.000 €“, Leistungsseite (Rubrik „Grenzen“),
  Anfrage-Sackgassen, Sektions-ID `abgrenzung` (Anker bleiben gültig).
- Beide Varianten sind im Gespräch nebeneinander zeigbar: `index.vorschau.html` mit der
  Ja/Nein-Liste, `index.vorschau2.html` mit der positiven Fassung.

## Vorschau 3 und Qualitätsrunde (2026-09-11)

`index.vorschau3.html` baut auf Vorschau 2 auf und schärft die Texte: Hero, Leistungen,
Kennzahlen, Ablauf und Kontakt sind im Ton der Bauleitung geschrieben (kurz, konkret, ohne
Werbevokabular). Die kursiven Pointen stehen nur noch an drei Stellen: Hero, Bauzeitenplan,
Kontakt. Im Zahlenband steht „Über 140“ in einer Zeile mit gleicher Grundlinie wie „12“ und „1“.

Vier Qualitätsfixes gelten für alle Seiten:

- **Leistungsliste mobil:** Nummer, Titel und Text per `grid-template-areas` geordnet, kein
  Umbruch mehr zwischen Nummer und Titel (`css/bereiche.css`).
- **Anfrage-Funnel gehärtet:** eigene Weiter-Knöpfe je Schritt, Fehlerzeile bei fehlender
  Auswahl, Sackgassen mit Telefonnummer (`anfrage.html`, `js/anfrage.js`, `css/module.css`).
- **Kontrast und ARIA:** neue Tokens `--stahl-dunkel`, `--stahl-hell`, `--kupfer-tief`,
  `--kupfer-text-hell` in `css/site.css`; Footer-Titel als `h2.fuss-titel`; Planzeilen im
  Bauzeitenplan mit ARIA-Beschriftung; geschlossenes Mobilmenü ist `inert`.
- **Fokusring:** auf hellem Grund `--kupfer` statt `--kupfer-hell` (3,88:1 statt 2,16:1).
