# Kundenpflege-Ablauf + Hinweis-Leiste (Eckstück) — Design

Stand: 2026-10-10 · freigegeben im Gespräch (Teil 1 + Teil 2)

## Ziel

Wenn Jakob Material eines Abo-Kunden schickt (Fotos, Event, Schließtage,
Öffnungszeiten, FAQ), weiß Claude Code ohne Erklärung, was zu tun ist: einbauen,
Vorschau zeigen, nach Freigabe live stellen, live prüfen, aufräumen, Obsidian
nachziehen. Internes TechSaar-Werkzeug, kein Kundenprodukt. Läuft über das
Claude-Abo, keine API.

Start mit Eckstück, aufgebaut für weitere Kunden (je ein Steckbrief).

## Nicht im Umfang

- Keine Admin-Seite für Kunden, kein Login, keine API, kein Automatismus ohne Jakob
- Claude schaut nicht von sich aus in den Eingang
- Keine Pop-ups, keine wechselnden Texte in der Leiste
- Google-Unternehmensprofil wird nicht bearbeitet (nur Text-Vorlage, s. u.)

---

## Teil 1 — Hinweis-Leiste auf eckstueck-stwendel.de

### Ausgangslage

`eckstueck-demo/index.html` hat oben bereits `#ribbon` (dunkelgrün, Creme-Schrift).
Es zeigt die Eröffnungsphase und entfernt sich selbst `openingBannerDays` (30)
Tage nach `openingDate` (2026-09-13), also ab 2026-10-13. Alle pflegbaren Werte
stehen im `CONFIG`-Block oben in der Datei.

### Datenmodell (neu in CONFIG)

```js
hinweise: [
  { art: "geschlossen", von: "2026-12-24", bis: "2026-12-27",
    text: "Vom 24. bis 27.12. haben wir geschlossen – frohe Feiertage!" },
  { art: "event", von: "2026-10-20", bis: "2026-10-31",
    text: "Sa 31.10. · Halloween-Malabend ab 18 Uhr",
    link: "#kontakt", linkText: "Platz anfragen" },
],
```

- `art`: `"event"` oder `"geschlossen"`
- `von` / `bis`: ISO-Datum, jeweils einschließlich. `von` = ab wann die Leiste
  erscheint (Ankündigung vorab möglich), `bis` = letzter Tag der Anzeige.
- `link` / `linkText`: optional. Events mit Anmeldung → `#kontakt` oder Shore-URL;
  Schließungen ohne Link.

### Anzeige-Regeln

1. Aktiv ist ein Hinweis, wenn `von <= heute <= bis` (lokales Datum, Tagesgenauigkeit).
2. Mehrere aktiv → `geschlossen` vor `event`; innerhalb gleicher Art der mit dem
   frühesten `bis`. Es wird immer genau einer angezeigt.
3. Kein aktiver Hinweis → bisheriges Verhalten (Eröffnungsphase bzw. Leiste weg).
4. Ein aktiver Hinweis hat Vorrang vor dem Eröffnungs-Text.
5. Ohne JavaScript wird kein Hinweis angezeigt (lieber keiner als ein veralteter).
   Der statische Fallback-Text im HTML bleibt unverändert.
6. Text wird per `textContent` gesetzt, der Link als eigenes Element — kein
   `innerHTML` mit Pflegetext.

### Offen/Geschlossen-Status

Die Öffnungszeiten-Anzeige (`● Jetzt geöffnet` / `● Gerade geschlossen`, um Zeile 780)
muss Schließungen kennen: Liegt heute in einem `geschlossen`-Zeitraum
(`von`..`bis`), zeigt sie „Heute geschlossen“ statt „Jetzt geöffnet“.
Achtung: Bei Schließungen bezeichnen `von`/`bis` zugleich Anzeige- und
Schließzeitraum. Soll eine Schließung vorab angekündigt werden, bekommt der
Eintrag zusätzlich `zu: ["2026-12-24", "2026-12-27"]` (tatsächliche Schließtage);
fehlt `zu`, gilt `von`..`bis`.

### Umsetzung

Reine Logik als Funktion `aktiverHinweis(liste, heute)` und
`istGeschlossen(liste, heute)`, damit sie testbar ist. Prüfskript in Node
(`build/hinweise.test.mjs` oder vergleichbar; nicht deployt, `build/` ist im
Deploy ausgeschlossen) gegen Fälle: keiner aktiv, vor `von`, am `bis`-Tag,
nach `bis`, Schließung schlägt Event, zwei Events, `zu` abweichend von `von`/`bis`.
Danach Screenshots Handy + Desktop mit einem Testeintrag; Testeintrag vor
Commit wieder raus.

---

## Teil 2 — Skill `kundenpflege`

### Ablage

```
~/.claude/skills/kundenpflege/
├── SKILL.md            Ablauf, kundenunabhängig
└── kunden/
    └── eckstueck.md    Steckbrief
```

### Auslöser

Natürliche Sprache: Kundenname + neues Material / Event / Urlaub / Schließung /
Öffnungszeiten / FAQ. Kein festes Stichwort, kein automatisches Nachsehen im Eingang.

### Ablauf (SKILL.md)

1. **Erkennen** — Kunde bestimmen, Steckbrief laden.
2. **Sichten** — Eingangsordner lesen; benennen, was drin liegt und was geplant ist.
3. **Prüfen / Stoppen**
   - Erkennbare Personen auf Fotos → harter Stopp, bis Jakob die schriftliche
     Einwilligung bestätigt (bei Kindern der Eltern). Vermerk in `NOTIZEN.md`.
   - Unklares Datum, Uhrzeit, Inhalt → nachfragen, nicht raten.
4. **Einbauen**
   - Fotos: Platz vorschlagen (Galerie / Hero / …), zuschneiden auf das Maß des
     Ziel-Slots, EXIF/Standort entfernen, Alt-Text, `?v=JJJJ-MM-TT` anhängen.
   - Hinweise: Eintrag in `CONFIG.hinweise`, Text im Ton der Seite (ihr/du,
     herzlich) formuliert; abgelaufene Einträge im selben Zug entfernen.
   - Öffnungszeiten: `CONFIG.hours`. FAQ: passendes `<details>` in `#faq`.
5. **Vorschau** — Screenshots Handy + Desktop. Sagen, wer freigeben muss.
   Bei Kundenfreigabe: kurzer Begleittext für WhatsApp, den Jakob verschickt.
6. **Live** — erst nach Freigabe: Commit + Push nach `main`, GitHub Action
   abwarten, Live-URL prüfen (Regel aus dem BOWLERY-Fall: eingebaut ≠ live).
7. **Aufräumen** — Originale nach `OneDrive/Tech-Saar/<Kunde>/Material/JJJJ-MM/`
   verschieben (Ordner bei Bedarf anlegen), Bildliste in `NOTIZEN.md` aktualisieren.
8. **Obsidian** — eine Zeile im Abschnitt „Pflege-Log“ der kanonischen
   Projektnotiz des Kunden (anlegen, falls nicht vorhanden). Tagesjournal
   übernimmt die Session-Ende-Routine der Daily Note — nicht doppelt schreiben.
9. **Google-Profil** — bei Öffnungszeiten, Schließung, Event: fertiger Text zum
   Reinkopieren + Hinweis „Profil-Verwaltung mit Leon klären“ (solange offen).

### Freigaberegeln (im Steckbrief, je Kunde überschreibbar)

| Änderung | Freigabe |
|---|---|
| Event, Schließung, Galeriebild, Öffnungszeiten | nur Jakob |
| FAQ, Hero-Bilder, Texte über den Betrieb, größere Bereiche | Jakob + Kunde |

Kunde, der Material schickt, hat damit dem Inhalt zugestimmt; die Kundenfreigabe
betrifft die *Formulierung/Platzierung*.

### Steckbrief Eckstück (Inhalt)

- Repo-Ordner: `~/Projekte/Techsaar/eckstueck-demo/`, Live: https://eckstueck-stwendel.de
- Eingang: `OneDrive/Tech-Saar/Eingang/eckstueck/`
- Archiv: `OneDrive/Tech-Saar/Eckstueck/Material/JJJJ-MM/`
- Obsidian-Projektnotiz: `02 Projekte/TechSaar – Eckstück Keramikstudio (Kundengespräch).md`
- Ton: herzlich, ihr/du, wie Instagram; Akzent `--clay` #3F6146
- Bild-Slots und Maße (Galerie 640×854 Hochformat, Hero als Bogen-Hintergrund)
- Besonderheiten: keine fremden Betriebsstätten zeigen (keine Stockfotos von
  Werkstätten), Eckstück brennt keine eigenen Rohlinge; Preise nur nach Freigabe;
  Kindergeburtstag ab `CONFIG.minAgeParty`.

### Probe-Durchgang

Einmal mit erfundenem Event bis einschließlich Vorschau durchspielen, **nicht live**;
danach Änderung verwerfen.

## Offene Punkte (außerhalb dieses Baus)

- Leon Zugriff auf `OneDrive/Tech-Saar/` geben (Jakob, über „Teilen“)
- Wer verwaltet das Google-Unternehmensprofil von Eckstück? (mit Leon klären)
