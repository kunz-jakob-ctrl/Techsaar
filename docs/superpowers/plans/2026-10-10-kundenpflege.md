# Kundenpflege-Ablauf + Hinweis-Leiste Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Eckstück-Seite bekommt eine datumsgesteuerte Hinweis-Leiste (Events/Schließtage), und Claude Code bekommt einen Skill `kundenpflege`, der eingehendes Kundenmaterial nach festem Ablauf verarbeitet.

**Architecture:** Reine Datumslogik in einer eigenen, DOM-freien Datei `eckstueck-demo/hinweise.js` (im Browser `window.Hinweise`, in Node per `require`), getestet mit `node --test`. `index.html` liest `CONFIG.hinweise` und nutzt die Logik für die bestehende Leiste `#ribbon` und die Offen/Geschlossen-Anzeige. Der Skill liegt außerhalb des Repos unter `~/.claude/skills/kundenpflege/` (Ablauf + Kunden-Steckbrief + Bild-Helfer auf Pillow-Basis).

**Tech Stack:** Vanilla JS (kein Build), Node 22 `node:test`, vorkompiliertes Tailwind (`styles.css` — **keine neuen Tailwind-Klassen verwenden**, nur vorhandene oder Inline-Styles), Python 3 + Pillow in eigenem venv, macOS `sips` für HEIC.

**Spec:** `docs/superpowers/specs/2026-10-10-kundenpflege-design.md`

## Global Constraints

- Hinweis-Daten: `art` ∈ {`"event"`, `"geschlossen"`}; `von`/`bis` ISO `JJJJ-MM-TT`, jeweils einschließlich; optional `link`, `linkText`, `zu: [von, bis]` (nur bei `geschlossen`).
- Genau ein Hinweis sichtbar: `geschlossen` vor `event`, sonst frühestes `bis`.
- Aktiver Hinweis hat Vorrang vor dem Eröffnungstext; ohne Hinweis bleibt das bisherige Leisten-Verhalten unverändert.
- Ohne JavaScript kein Hinweis. Pflegetext nie per `innerHTML`.
- Links nur `#…` oder `https://…`; externe Links mit `target="_blank" rel="noopener"`.
- Nichts deployen: **kein `git push`** im Rahmen dieses Plans (Push deployt automatisch auf die Kundendomain). Lokale Commits sind ok.
- Kommentare im Stil der Datei: deutsch, erklären das *Warum*, Umlaute in JS-Kommentaren als ae/oe/ue wie im Bestand.
- Skill-Texte deutsch.

---

### Task 1: Hinweis-Logik `hinweise.js` mit Tests

**Files:**
- Create: `eckstueck-demo/hinweise.js`
- Test: `eckstueck-demo/build/hinweise.test.cjs` (`build/` wird beim Eckstück-Deploy ausgeschlossen)

**Interfaces:**
- Produces: `Hinweise.tagIso(date: Date) -> "JJJJ-MM-TT"`, `Hinweise.aktiverHinweis(liste: Array|undefined, heute: Date|string) -> Hinweis|null`, `Hinweise.istGeschlossen(liste, heute) -> boolean`, `Hinweise.sichererLink(link: string|undefined) -> string|null`

- [ ] **Step 1: Failing tests schreiben** — `eckstueck-demo/build/hinweise.test.cjs`:

```js
const test = require("node:test");
const assert = require("node:assert/strict");
const H = require("../hinweise.js");

const event = { art:"event", von:"2026-10-20", bis:"2026-10-31", text:"Sa 31.10. · Halloween-Malabend", link:"#kontakt", linkText:"Platz anfragen" };
const event2 = { art:"event", von:"2026-10-01", bis:"2026-11-15", text:"Herbst-Workshop" };
const zu = { art:"geschlossen", von:"2026-10-25", bis:"2026-10-28", text:"25.–28.10. geschlossen" };
const zuVorab = { art:"geschlossen", von:"2026-12-15", bis:"2026-12-27", zu:["2026-12-24","2026-12-27"], text:"24.–27.12. geschlossen" };

test("tagIso nutzt lokales Datum", () => {
  assert.equal(H.tagIso(new Date(2026, 9, 5, 23, 30)), "2026-10-05");
});
test("leere oder fehlende Liste -> null", () => {
  assert.equal(H.aktiverHinweis(undefined, "2026-10-20"), null);
  assert.equal(H.aktiverHinweis([], "2026-10-20"), null);
});
test("vor von -> nicht aktiv", () => {
  assert.equal(H.aktiverHinweis([event], "2026-10-19"), null);
});
test("am von- und am bis-Tag aktiv", () => {
  assert.equal(H.aktiverHinweis([event], "2026-10-20"), event);
  assert.equal(H.aktiverHinweis([event], "2026-10-31"), event);
});
test("nach bis -> nicht aktiv", () => {
  assert.equal(H.aktiverHinweis([event], "2026-11-01"), null);
});
test("geschlossen schlaegt event", () => {
  assert.equal(H.aktiverHinweis([event, zu], "2026-10-26"), zu);
});
test("zwei Events -> fruehestes bis", () => {
  assert.equal(H.aktiverHinweis([event2, event], "2026-10-22"), event);
});
test("Date-Objekt wird akzeptiert", () => {
  assert.equal(H.aktiverHinweis([event], new Date(2026, 9, 25, 12)), event);
});
test("ungueltige Eintraege werden ignoriert", () => {
  const kaputt = [
    { art:"party", von:"2026-10-01", bis:"2026-10-31", text:"x" },
    { art:"event", von:"1.10.2026", bis:"2026-10-31", text:"x" },
    { art:"event", von:"2026-10-31", bis:"2026-10-01", text:"x" },
    { art:"event", von:"2026-10-01", bis:"2026-10-31", text:"   " },
    null,
  ];
  assert.equal(H.aktiverHinweis(kaputt, "2026-10-15"), null);
});
test("istGeschlossen: von..bis ohne zu", () => {
  assert.equal(H.istGeschlossen([zu], "2026-10-24"), false);
  assert.equal(H.istGeschlossen([zu], "2026-10-25"), true);
  assert.equal(H.istGeschlossen([zu], "2026-10-28"), true);
  assert.equal(H.istGeschlossen([zu], "2026-10-29"), false);
});
test("istGeschlossen: zu weicht von Anzeigezeitraum ab", () => {
  assert.equal(H.aktiverHinweis([zuVorab], "2026-12-16"), zuVorab);
  assert.equal(H.istGeschlossen([zuVorab], "2026-12-16"), false);
  assert.equal(H.istGeschlossen([zuVorab], "2026-12-24"), true);
});
test("vertauschtes zu faellt auf von..bis zurueck", () => {
  const x = { ...zuVorab, zu:["2026-12-27","2026-12-24"] };
  assert.equal(H.istGeschlossen([x], "2026-12-16"), true);
});
test("istGeschlossen ignoriert Events", () => {
  assert.equal(H.istGeschlossen([event], "2026-10-25"), false);
});
test("sichererLink erlaubt nur # und https", () => {
  assert.equal(H.sichererLink("#kontakt"), "#kontakt");
  assert.equal(H.sichererLink("https://connect.shore.com/x"), "https://connect.shore.com/x");
  assert.equal(H.sichererLink("javascript:alert(1)"), null);
  assert.equal(H.sichererLink("http://example.com"), null);
  assert.equal(H.sichererLink(undefined), null);
});
```

- [ ] **Step 2: Test laufen lassen, muss fehlschlagen**

Run: `cd ~/Projekte/Techsaar/eckstueck-demo && node --test build/hinweise.test.cjs`
Expected: FAIL mit `Cannot find module '../hinweise.js'`

- [ ] **Step 3: Implementierung** — `eckstueck-demo/hinweise.js`:

```js
/* Hinweis-Leiste: reine Datumslogik, ohne DOM.
   Liegt in einer eigenen Datei, damit sie sich ohne Browser testen laesst
   (build/hinweise.test.cjs). Im Browser haengt sie als window.Hinweise,
   in Node wird sie per require geladen.
   Datumsvergleiche laufen als Text im Format JJJJ-MM-TT - das sortiert
   lexikalisch richtig und umgeht Zeitzonen-Fallen von Date-Objekten. */
(function (root) {
  const ISO = /^\d{4}-\d{2}-\d{2}$/;

  function tagIso(d) {
    const z = n => String(n).padStart(2, "0");
    return d.getFullYear() + "-" + z(d.getMonth() + 1) + "-" + z(d.getDate());
  }

  function alsTag(heute) {
    return typeof heute === "string" ? heute : tagIso(heute);
  }

  /* Kaputte Eintraege fallen still raus, statt die Seite zu brechen: ein
     Tippfehler im Datum soll schlimmstenfalls einen Hinweis kosten. */
  function gueltig(h) {
    return !!h
      && (h.art === "event" || h.art === "geschlossen")
      && ISO.test(h.von) && ISO.test(h.bis) && h.von <= h.bis
      && typeof h.text === "string" && h.text.trim() !== "";
  }

  /* Genau einer gewinnt: Schliessungen vor Events (wer vor verschlossener
     Tuer steht, aergert sich mehr), sonst der, der am fruehesten endet. */
  function aktiverHinweis(liste, heute) {
    const t = alsTag(heute);
    const aktiv = (liste || []).filter(gueltig).filter(h => h.von <= t && t <= h.bis);
    aktiv.sort((a, b) => {
      if (a.art !== b.art) return a.art === "geschlossen" ? -1 : 1;
      return a.bis < b.bis ? -1 : a.bis > b.bis ? 1 : 0;
    });
    return aktiv[0] || null;
  }

  /* Anzeige- und Schliesszeitraum koennen auseinanderfallen: Eine Schliessung
     wird oft Tage vorher angekuendigt. Dafuer gibt es "zu"; fehlt es, gilt
     von..bis auch als Schliesszeitraum. */
  function istGeschlossen(liste, heute) {
    const t = alsTag(heute);
    return (liste || []).filter(gueltig).some(h => {
      if (h.art !== "geschlossen") return false;
      const z = Array.isArray(h.zu) && h.zu.length === 2 && ISO.test(h.zu[0]) && ISO.test(h.zu[1]) && h.zu[0] <= h.zu[1]
        ? h.zu : [h.von, h.bis];
      return z[0] <= t && t <= z[1];
    });
  }

  /* Nur Sprungmarken und https - alles andere (javascript:, http:) faellt weg. */
  function sichererLink(link) {
    if (typeof link !== "string") return null;
    return /^#[\w-]+$/.test(link) || /^https:\/\/[^\s"'<>]+$/.test(link) ? link : null;
  }

  const api = { tagIso, aktiverHinweis, istGeschlossen, sichererLink };
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  else root.Hinweise = api;
})(this);
```

- [ ] **Step 4: Tests laufen lassen, müssen grün sein**

Run: `cd ~/Projekte/Techsaar/eckstueck-demo && node --test build/hinweise.test.cjs`
Expected: alle Tests PASS, 0 fail

- [ ] **Step 5: Commit**

```bash
cd ~/Projekte/Techsaar
git add eckstueck-demo/hinweise.js eckstueck-demo/build/hinweise.test.cjs
git commit -m "feat(eckstueck): Datumslogik fuer Hinweis-Leiste mit Tests"
```

---

### Task 2: Leiste und Öffnungsanzeige in `index.html` anbinden

**Files:**
- Modify: `eckstueck-demo/index.html` — CONFIG-Block (nach `minAgeParty`, ca. Z. 69), Script-Einbindung (nach `vendor/motion.js`, ca. Z. 77), Leisten-IIFE (ca. Z. 619–650), Status-Zeilen (ca. Z. 780–788)

**Interfaces:**
- Consumes: `window.Hinweise.aktiverHinweis`, `.istGeschlossen`, `.sichererLink` aus Task 1
- Produces: `CONFIG.hinweise` (Array, Format siehe Global Constraints) — die Stelle, die der Skill künftig pflegt

- [ ] **Step 1: CONFIG erweitern** — direkt nach der Zeile `minAgeParty: 6,` einfügen:

```js
  // Hinweis-Leiste oben (Events, Schliesstage). Erscheint ab "von", verschwindet
  // nach "bis" von selbst - beides einschliesslich, Format JJJJ-MM-TT.
  // Mehrere gleichzeitig: "geschlossen" geht vor, sonst der, der zuerst endet.
  // Bei "geschlossen" zeigt auch die Oeffnungsanzeige "Heute geschlossen";
  // soll die Schliessung vorab angekuendigt werden, die echten Schliesstage
  // zusaetzlich als zu: ["JJJJ-MM-TT","JJJJ-MM-TT"] angeben.
  // link (optional): "#kontakt" oder eine https-Adresse, dazu linkText.
  // Beispiel:
  // { art:"event", von:"2026-10-20", bis:"2026-10-31",
  //   text:"Sa 31.10. · Halloween-Malabend ab 18 Uhr", link:"#kontakt", linkText:"Platz anfragen" },
  // { art:"geschlossen", von:"2026-12-15", bis:"2026-12-27", zu:["2026-12-24","2026-12-27"],
  //   text:"Vom 24. bis 27.12. haben wir geschlossen – frohe Feiertage!" },
  // Abgelaufene Eintraege beim naechsten Pflege-Durchgang loeschen.
  hinweise: [],
```

- [ ] **Step 2: Logik laden** — direkt nach `<script src="vendor/motion.js"></script>`:

```html
<script src="hinweise.js?v=2026-10-10"></script>
```

- [ ] **Step 3: Leisten-IIFE umbauen.** Die bestehende Funktion beginnt mit
`const balken = document.getElementById("ribbon");` und
`if(!balken || !CONFIG.openingDate) return;`. Ersetze diese zwei Zeilen durch:

```js
  const balken = document.getElementById("ribbon");
  if(!balken) return;

  /* Ein aktueller Hinweis (Event, Schliessung) geht vor dem Eroeffnungstext.
     Text per textContent, Link als eigenes Element: Pflegetext landet so nie
     als HTML in der Seite. */
  const hinweis = window.Hinweise && Hinweise.aktiverHinweis(CONFIG.hinweise, new Date());
  if(hinweis){
    balken.textContent = (hinweis.art === "event" ? "✨ " : "") + hinweis.text;
    const ziel = Hinweise.sichererLink(hinweis.link);
    if(ziel){
      const a = document.createElement("a");
      a.href = ziel;
      a.textContent = hinweis.linkText || "mehr";
      a.className = "underline underline-offset-2 hover:opacity-80";
      if(ziel.startsWith("https://")){ a.target = "_blank"; a.rel = "noopener"; }
      balken.append(" — ", a);
    }
    return;
  }

  if(!CONFIG.openingDate) return;
```

Der Rest der Funktion (Eröffnungsphasen) bleibt unverändert; ohne `openingDate` bleibt wie bisher der statische Text stehen (Spec-Regel 3).

- [ ] **Step 4: Öffnungsanzeige.** Zwischen der `if(CONFIG.vorEroeffnung){…}`-Zeile und der `else if(h && hr>=h[0] …)`-Zeile einfügen:

```js
  /* Schliesstage aus CONFIG.hinweise schlagen die regulaeren Zeiten, sonst
     stuende an einem Urlaubstag "Jetzt geoeffnet" auf der Seite. */
  else if(window.Hinweise && Hinweise.istGeschlossen(CONFIG.hinweise, jetzt)){ el.textContent="● Heute geschlossen"; el.style.color="var(--clay-deep)"; }
```

- [ ] **Step 5: Im Browser prüfen (leer).** Statischen Server aus `~/Projekte/Techsaar/eckstueck-demo` starten (vorhandene Preview-Konfiguration in `~/Projekte/.claude/launch.json`, dient `Techsaar/eckstueck-demo` statisch aus). Seite laden. Erwartet: keine Konsolenfehler; `#ribbon` ist (da Eröffnungsphase bis 2026-10-12 läuft) „✨ Neu eröffnet — jetzt Platz reservieren“ bzw. ab 13.10. entfernt; `#openText` unverändert.

- [ ] **Step 6: Im Browser prüfen (mit Testeinträgen, nicht committen).** Temporär in `CONFIG.hinweise` eintragen (heute = Datum der Ausführung `HEUTE`, `MORGEN` = +1 Tag):
  1. `{art:"event", von:HEUTE, bis:MORGEN, text:"Sa 31.10. · Halloween-Malabend ab 18 Uhr", link:"#kontakt", linkText:"Platz anfragen"}` → Leiste zeigt „✨ Sa 31.10. · Halloween-Malabend ab 18 Uhr — Platz anfragen“, Link springt zu `#kontakt`. Screenshot Desktop + Handy (375 px).
  2. Zusätzlich `{art:"geschlossen", von:HEUTE, bis:HEUTE, text:"Heute geschlossen – morgen sind wir wieder da!"}` → Leiste zeigt die Schließung (ohne ✨, ohne Link), `#openText` zeigt „● Heute geschlossen“. Screenshot Handy.
  3. Testeinträge wieder entfernen (`hinweise: []`), neu laden, Zustand wie Step 5.

- [ ] **Step 7: Tests erneut + Commit**

```bash
cd ~/Projekte/Techsaar/eckstueck-demo && node --test build/hinweise.test.cjs
cd ~/Projekte/Techsaar
git diff --stat   # nur index.html erwartet, hinweise: [] leer
git add eckstueck-demo/index.html
git commit -m "feat(eckstueck): Hinweis-Leiste fuer Events und Schliesstage"
```

---

### Task 3: Bild-Helfer für den Skill

**Files:**
- Create: `~/.claude/skills/kundenpflege/bild.py`
- Create: `~/.claude/skills/kundenpflege/.venv/` (Pillow)
- Test: `~/.claude/skills/kundenpflege/test_bild.py`

**Interfaces:**
- Produces: CLI `~/.claude/skills/kundenpflege/.venv/bin/python ~/.claude/skills/kundenpflege/bild.py QUELLE ZIEL --breite B --hoehe H [--qualitaet 82]` → schreibt JPEG exakt B×H, ohne EXIF; gibt `ok ZIEL BxH` aus; Warnung auf stderr, wenn die Quelle kleiner als das Ziel ist; HEIC wird vorher per `sips` nach JPEG gewandelt.

- [ ] **Step 1: venv + Pillow**

```bash
python3 -m venv ~/.claude/skills/kundenpflege/.venv
~/.claude/skills/kundenpflege/.venv/bin/pip install --quiet pillow
```

- [ ] **Step 2: Failing test** — `~/.claude/skills/kundenpflege/test_bild.py`:

```python
import subprocess, sys, tempfile, pathlib
from PIL import Image

HIER = pathlib.Path(__file__).parent
PY = HIER / ".venv" / "bin" / "python"

def mit_gps(pfad, groesse=(1200, 1600)):
    im = Image.new("RGB", groesse, (200, 120, 140))
    exif = Image.Exif()
    exif[0x010F] = "Apple"                      # Make
    exif[0x0112] = 1                            # Orientation
    gps = {1: "N", 2: (49.0, 28.0, 0.0), 3: "E", 4: (7.0, 10.0, 0.0)}
    exif[0x8825] = gps                          # GPSInfo
    im.save(pfad, "JPEG", exif=exif, comment=b"Standort Grabenstrasse")

def lauf(*args):
    return subprocess.run([str(PY), str(HIER / "bild.py"), *map(str, args)],
                          capture_output=True, text=True)

def test_zuschnitt_und_metadaten():
    with tempfile.TemporaryDirectory() as d:
        q, z = pathlib.Path(d, "q.jpg"), pathlib.Path(d, "z.jpg")
        mit_gps(q)
        assert Image.open(q).getexif(), "Testbild braucht EXIF"
        r = lauf(q, z, "--breite", 640, "--hoehe", 854)
        assert r.returncode == 0, r.stderr
        out = Image.open(z)
        assert out.size == (640, 854)
        assert not out.getexif()
        assert not out.info.get("comment")
        assert "ok" in r.stdout

def test_warnung_bei_kleiner_quelle():
    with tempfile.TemporaryDirectory() as d:
        q, z = pathlib.Path(d, "q.jpg"), pathlib.Path(d, "z.jpg")
        mit_gps(q, (300, 400))
        r = lauf(q, z, "--breite", 640, "--hoehe", 854)
        assert r.returncode == 0
        assert "kleiner" in r.stderr

if __name__ == "__main__":
    test_zuschnitt_und_metadaten(); test_warnung_bei_kleiner_quelle(); print("alle Tests ok")
```

- [ ] **Step 3: Test laufen lassen, muss fehlschlagen**

Run: `~/.claude/skills/kundenpflege/.venv/bin/python ~/.claude/skills/kundenpflege/test_bild.py`
Expected: FAIL (AssertionError, `bild.py` fehlt → returncode 2)

- [ ] **Step 4: Implementierung** — `~/.claude/skills/kundenpflege/bild.py`:

```python
#!/usr/bin/env python3
"""Kundenfoto web-fertig machen.

Wendet die Kamera-Ausrichtung an, schneidet mittig auf das Zielformat zu,
verkleinert und speichert als JPEG OHNE Metadaten. WhatsApp- und iPhone-Fotos
tragen Geraete- und teils Standortdaten, die auf einer oeffentlichen Seite
nichts verloren haben. HEIC (iPhone) wird vorher per sips nach JPEG gewandelt.
"""
import argparse, pathlib, subprocess, sys, tempfile
from PIL import Image, ImageOps

def main():
    p = argparse.ArgumentParser()
    p.add_argument("quelle"); p.add_argument("ziel")
    p.add_argument("--breite", type=int, required=True)
    p.add_argument("--hoehe", type=int, required=True)
    p.add_argument("--qualitaet", type=int, default=82)
    a = p.parse_args()

    quelle = pathlib.Path(a.quelle)
    with tempfile.TemporaryDirectory() as tmp:
        if quelle.suffix.lower() in (".heic", ".heif"):
            jpg = pathlib.Path(tmp, "heic.jpg")
            subprocess.run(["sips", "-s", "format", "jpeg", str(quelle), "--out", str(jpg)],
                           check=True, capture_output=True)
            quelle = jpg

        with Image.open(quelle) as im:
            im = ImageOps.exif_transpose(im).convert("RGB")
            if im.width < a.breite or im.height < a.hoehe:
                print(f"Warnung: Quelle {im.width}x{im.height} ist kleiner als Ziel "
                      f"{a.breite}x{a.hoehe} - wird hochskaliert und wirkt evtl. unscharf.",
                      file=sys.stderr)
            im = ImageOps.fit(im, (a.breite, a.hoehe), Image.LANCZOS, centering=(0.5, 0.5))
            # Pillow schreibt sonst z. B. den JPEG-Kommentar (COM) aus im.info
            # von selbst wieder mit - deshalb alles leeren, nicht nur EXIF.
            im.info = {}
            im.save(a.ziel, "JPEG", quality=a.qualitaet, optimize=True, progressive=True)

    with Image.open(a.ziel) as out:
        if out.getexif() or out.info.get("comment") or out.info.get("xmp"):
            sys.exit("Fehler: Ziel enthaelt noch Metadaten")
        if out.size != (a.breite, a.hoehe):
            sys.exit(f"Fehler: Zielgroesse {out.size}")
    print(f"ok {a.ziel} {a.breite}x{a.hoehe}")

if __name__ == "__main__":
    main()
```

- [ ] **Step 5: Tests grün**

Run: `~/.claude/skills/kundenpflege/.venv/bin/python ~/.claude/skills/kundenpflege/test_bild.py`
Expected: `alle Tests ok`

(Kein Commit — der Skill-Ordner liegt nicht im Repo.)

---

### Task 4: Skill `kundenpflege` (Ablauf + Steckbrief Eckstück)

**Files:**
- Create: `~/.claude/skills/kundenpflege/SKILL.md`
- Create: `~/.claude/skills/kundenpflege/kunden/eckstueck.md`

**Interfaces:**
- Consumes: `bild.py` CLI aus Task 3; `CONFIG.hinweise`, `CONFIG.hours` aus Task 2
- Produces: Skill, der per natürlicher Sprache greift (Frontmatter-`description`)

- [ ] **Step 1: `SKILL.md` schreiben** mit:
  - Frontmatter `name: kundenpflege`, `description` mit Auslösern: Kundenname (Eckstück …) + neues Material / Fotos / Event / Urlaub / Schließung / Öffnungszeiten / FAQ / „liegt im Eingang“; ausdrücklich *nicht* für Neubauten oder Redesigns.
  - Die 9 Schritte aus der Spec (Teil 2, „Ablauf“) als nummerierte Checkliste mit den konkreten Befehlen: `bild.py`-Aufruf, `node --test build/hinweise.test.cjs` vor jedem Commit, Commit-Format `pflege(<kunde>): …`, Push erst nach Freigabe, Deploy-Prüfung per `gh run watch` bzw. `gh run list --limit 1`, Live-Prüfung per `curl -s <live-url> | grep` auf den neuen Text/Bildpfad **und** Screenshot der Live-Seite.
  - Freigabe-Tabelle (Spec) mit der Regel „Kunde, der Material schickt, hat dem Inhalt zugestimmt; Kundenfreigabe betrifft Formulierung/Platzierung“.
  - Harte Stopps: erkennbare Personen ohne bestätigte schriftliche Einwilligung; unklare Daten; Material, das fremde Betriebsstätten/Stockfotos zeigt; alles, was Preise nennt, ohne dass der Kunde sie geschickt hat.
  - Obsidian-Schritt: Zeile im Abschnitt `## Pflege-Log` der Projektnotiz, neueste oben, Format `- JJJJ-MM-TT – was – live geprüft`; keine Daily-Note-Einträge (macht die Session-Ende-Routine).
  - Google-Profil-Schritt mit Textvorlage und Hinweis „Profil-Verwaltung mit Leon klären“.
  - Pflicht-Bullets, wörtlich aufnehmen: Alt-Text für jedes Bild; Einwilligungs-Vermerk in `NOTIZEN.md`; WhatsApp-Begleittext bei Kundenfreigabe; abgelaufene `hinweise`-Einträge im selben Zug entfernen; Originale nach `OneDrive/Tech-Saar/<Kunde>/Material/JJJJ-MM/` verschieben (Ordner bei Bedarf anlegen); „Claude schaut nicht von sich aus in den Eingang — nur wenn Jakob es sagt“.
  - Cache-Regel: Bei jeder Änderung an `hinweise.js` das `?v=` im Script-Tag hochsetzen (`.js` wird ein Jahr gecacht); Bilder bekommen neues `?v=JJJJ-MM-TT`.
  - Abschnitt „Neuen Kunden anlegen“: Steckbrief nach Vorlage `kunden/eckstueck.md` kopieren, Eingangsordner `OneDrive/Tech-Saar/Eingang/<kunde>/` anlegen.
- [ ] **Step 2: `kunden/eckstueck.md` schreiben** mit allen Feldern aus Spec „Steckbrief Eckstück“, ergänzt um: Live-URL `https://eckstueck-stwendel.de`, Bild-Slots mit exakten Maßen (`hero-1` 640×960, `hero-2`/`hero-3` 440×644, `galerie-*` 640×854), Cache-Parameter-Muster `?v=JJJJ-MM-TT` (in `src` bzw. `background-image:url(…)`), Hinweis auf vorkompiliertes Tailwind (keine neuen Klassen), Pfad `NOTIZEN.md` für Bildliste/Einwilligungen, `CONFIG.phoneActive`/`minAgeParty` als Stellen, die nur auf Kundenwunsch geändert werden.
- [ ] **Step 3: Prüfen** — `head -5 SKILL.md` zeigt gültiges Frontmatter; alle in SKILL.md genannten Pfade existieren (`ls` auf Eingang, Repo-Ordner, `bild.py`, Projektnotiz); Begriffe/Feldnamen identisch zu Task 2 (`hinweise`, `art`, `von`, `bis`, `zu`, `link`, `linkText`).

---

### Task 5: Probe-Durchgang (nicht live)

- [ ] **Step 1:** Testbild in `OneDrive/Tech-Saar/Eingang/eckstueck/` erzeugen (z. B. mit dem Testhelfer aus Task 3, 1200×1600 mit GPS-EXIF) plus Notiz `event.txt`: „Halloween-Malabend am Samstag 31.10. ab 18 Uhr, Anmeldung per Mail“.
- [ ] **Step 2:** Den Ablauf aus `SKILL.md` Schritt für Schritt bis einschließlich **Vorschau** befolgen: Bild per `bild.py` auf das Galerie-Slot-Maß **640×854** in ein **Scratchpad** (nicht nach `img/`) schreiben und EXIF-Freiheit prüfen; Hinweis-Eintrag in `CONFIG.hinweise`; Screenshots.
- [ ] **Step 3:** Alles verwerfen: `git checkout -- eckstueck-demo/index.html`, Testdateien aus dem Eingang löschen, `git status` sauber (bis auf die Commits aus Task 1/2). Lücken im Skill, die dabei auffallen, direkt in `SKILL.md`/Steckbrief korrigieren.
