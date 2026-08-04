# Motion.dev AI Kit — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Das Motion.dev AI Kit so übernehmen, dass es den bestehenden `web-animations`-Skill ergänzt statt sein Praxiswissen zu überschreiben.

**Architecture:** Vier Phasen in dieser Reihenfolge: (1) den eigenen Skill härten, damit der Abgleich überhaupt eine faire Grundlage hat, (2) das AI Kit isoliert in einer Wegwerf-Kopie installieren und lesen, (3) Regel für Regel abgleichen und Konflikte entscheiden, (4) erst danach global installieren und an einem echten Projekt gegentesten. Kein Schritt fasst das Techsaar-Repo an, bis Phase 4 abgenommen ist.

**Tech Stack:** Node v24.18.0, npm 11.16.0, `npx motion-ai`, Claude-Code-Skills als Markdown unter `~/.claude/skills/`, Playwright/Chromium für die Verifikation.

## Global Constraints

- **Strikt 0 €.** Das AI Kit ist kostenlos; sobald an irgendeiner Stelle ein Konto, ein Key oder ein Tarif verlangt wird, wird abgebrochen und der Stand dokumentiert.
- **Self-Hosting hart für alles, was im Besucher-Browser läuft.** Das AI Kit läuft nur zur Entwicklungszeit — das ist erlaubt. Aber **keine vom AI Kit vorgeschlagene CDN-Einbindung darf in eine Seite wandern.**
- **Bei Regelkonflikt gewinnt die eigene dokumentierte Praxiserfahrung.** Die Regeln des AI Kits ergänzen nur dort, wo wir nichts haben.
- **Kein Commit ins Techsaar-Repo vor Task 5.** Die Tasks 1–4 verändern ausschließlich `~/.claude/` und ein Wegwerf-Verzeichnis.
- Arbeits-/Wegwerfverzeichnis: `C:\Users\babok\AppData\Local\Temp\claude\C--Claude-code\cf7b050a-f20c-43d8-8833-18d4d33b3fb2\scratchpad`

---

### Task 1: Eigenen Skill härten ✅ erledigt 2026-08-04

Das Praxiswissen liegt heute nur im Memory. Solange es nicht im Skill steht, kann der Abgleich in Task 3 es nicht verteidigen. Zusätzlich wird der CDN-Widerspruch behoben.

**Files:**
- Modify: `C:\Users\babok\.claude\skills\web-animations\SKILL.md`
- Verify: `C:\Users\babok\.claude\skills\web-animations\assets\animations.js` (nur lesen, nicht ändern)

**Interfaces:**
- Consumes: nichts
- Produces: einen `SKILL.md`, der zwei neue Abschnitte enthält — „Einbindung: self-hosted, nicht CDN" und „Bekannte Fallen" — auf die Task 3 sich beim Abgleich beruft.

- [x] **Step 1: Ist-Zustand sichern**

```bash
cp "C:/Users/babok/.claude/skills/web-animations/SKILL.md" "C:/Users/babok/.claude/skills/web-animations/SKILL.md.vor-ai-kit"
```

Erwartet: keine Ausgabe, Datei existiert danach.

- [x] **Step 2: CDN-Widerspruch beheben**

In `SKILL.md` Abschnitt 2 den Block

```html
<script src="https://cdn.jsdelivr.net/npm/motion@11/dist/motion.js"></script>
<script src="/static/animations.js"></script>
```

ersetzen durch:

```html
<!-- Motion lokal vendoren — NIEMALS per CDN. Externe Requests sind bei
     TechSaar-Seiten ausgeschlossen (DSGVO, Google-Fonts-Falle). -->
<script src="vendor/motion.js"></script>
<script src="animations.js"></script>
```

Ebenso in der Tabelle in Abschnitt 1 die Zelle `per CDN-<script>, **kein npm**` ersetzen durch `lokal gevendorte `motion.js`, **kein npm, kein CDN**`.

- [x] **Step 3: Abschnitt „Bekannte Fallen" einfügen**

Direkt vor „## 5. Mehr ‚Wow' bei Bedarf" einfügen:

```markdown
## 4b. Bekannte Fallen (teuer bezahlt — nicht wegoptimieren)

Diese Punkte stammen aus echten Fehlersuchen. Ein generisches Regelwerk kennt
sie nicht. Bei Widerspruch zu fremden Motion-Regeln **gilt dieser Abschnitt**.

- **`scroll()` hat in Motion 11 eine andere Signatur als in Motion 10.**
  Richtig: `scroll(progress => …)` — der Callback bekommt den Fortschritt (0…1)
  direkt. Falsch (Motion 10, steht noch in vielen Tutorials):
  `scroll(({y}) => y.progress)` — wirft in v11 **bei jedem Frame** einen TypeError.
- **Ein werfender `scroll()`-Callback legt Motions kompletten Frame-Loop lahm.**
  Folge: auch alle `inView`-Reveals fallen still aus, obwohl mit `inView` nichts
  falsch ist. Symptom: „Animationen gehen gar nicht", Konsole scheinbar sauber.
  **Bei diesem Symptom zuerst alle `scroll()`-Callbacks prüfen, nicht `inView`.**
- **Motion/WAAPI committet den Endwert nicht** → das Element fällt auf CSS
  `opacity:0` zurück. Endzustand per `controls.finished.then(...)` **und**
  zusätzlichem `setTimeout` festschreiben (idempotent).
- **Farb-/Zustandswechsel in Loops nicht per `Motion.animate(backgroundColor…)`** —
  gleiches Commit-Problem, Farben schnappen zurück. Stattdessen CSS
  `transition: background-color …` plus Werte direkt über `el.style.…` setzen.
- **transform-Kollision:** Parallax setzt `el.style.transform`, Reveals animieren
  ebenfalls `transform`. Nie beides auf demselben Element — Parallax auf einen
  Wrapper, Reveal aufs innere Element.
- **Anfangszustände (`opacity:0`) nur unter einer Klasse setzen**, die JS erst
  vergibt, wenn Motion geladen ist UND `prefers-reduced-motion` nicht greift.
  Sonst ist die Seite ohne JS komplett leer.
- **Laufband-Rezept (reines CSS, kein JS):** Inhalt **exakt doppelt** in zwei
  gleich breiten Teilen, `display:flex; width:max-content`, `@keyframes` von
  `translateX(0)` nach `translateX(-50%)`. Nur bei exakter Verdopplung ist die
  Schleife nahtlos. Gekippte Bänder brauchen Überbreite plus `overflow:hidden`.
- **Parallax-Bezugsgröße:** `scroll(cb)` liefert den Fortschritt der **ganzen
  Seite**. Für elementbezogenen Drift `scroll(cb, {target: el, offset:
  ["start end","end start"]})` nutzen und mit `p-0.5` rechnen.

### Verifikation — die eingebaute Vorschau lügt

- `IntersectionObserver`/`inView` feuert in Headless-Vorschau-Tabs **nicht**,
  `requestAnimationFrame` ist dort gedrosselt.
- **Headless-Screenshots laufen in den Timeout, solange Endlos-CSS-Animationen
  laufen** (Renderer wird nie idle). Vorher
  `*{animation-play-state:paused !important}` injizieren.
- Die eingebaute Vorschau kann bei Endlos-Animationen **komplett hängen** —
  danach scrollt die Seite gar nicht mehr, auch in frischen Tabs.
  **Gegentest, der das entlarvt:** dieselbe Prüfung gegen eine bekannt
  funktionierende, live deployte Fassung laufen lassen. Scrollt die auch nicht,
  liegt es an der Umgebung, nicht am Code.
- **Verlässlicher Weg: echtes Chromium per Playwright.**
  `npx playwright@1.61.1 install chromium`, dann Skript mit `chromium.launch()`.
  Nur so lässt sich `prefers-reduced-motion` über `reducedMotion:'reduce'`
  wirklich testen statt bloß die CSS-Klasse zu simulieren.
- Vorschau-Panes können ein winziges Viewport haben. `inView` mit `amount` feuert
  dann nicht wie erwartet — **vor dem Debuggen Viewport auf realistische Größe
  setzen**, sonst jagt man Phantome.
```

- [x] **Step 4: Prüfen, dass der Skill noch lädt und konsistent ist**

```bash
head -12 "C:/Users/babok/.claude/skills/web-animations/SKILL.md"
grep -n "cdn.jsdelivr" "C:/Users/babok/.claude/skills/web-animations/SKILL.md"
```

Erwartet: Das Frontmatter (`---`, `name: web-animations`, `description:`) ist unversehrt. Der `grep` liefert **keine Treffer** — sonst ist der CDN-Widerspruch nicht vollständig behoben.

- [x] **Step 5: Sicherungskopie entfernen**

```bash
rm "C:/Users/babok/.claude/skills/web-animations/SKILL.md.vor-ai-kit"
```

Erst ausführen, wenn Step 4 sauber war. Kein Commit — `~/.claude/` ist kein Repo.

---

### Task 2: AI Kit isoliert installieren und lesen ✅ erledigt 2026-08-04 (mit Abweichung)

Installation in eine Wegwerf-Kopie, damit weder das Repo noch die globale Konfiguration angefasst wird, bevor der Inhalt bekannt ist.

> **Abweichung:** `npx motion-ai` **verweigert den nicht-interaktiven Lauf**
> („motion-ai is interactive — run it in a terminal", Exit 1) und kennt laut
> `--help` keine Flags für ein unbeaufsichtigtes Setup. Ziel des Tasks war das
> **Lesen** der Skill-Inhalte — das wurde stattdessen über `npm pack motion-ai`
> und Entpacken des Tarballs erreicht (16 Dateien unter `package/content/`).
> Ergebnis identisch, ohne Installation.
>
> **Folge für Task 4:** Der globale Installationsschritt kann nicht von einem
> Agenten ausgeführt werden. Jakob muss `npx motion-ai` selbst in einem echten
> Terminal starten.

**Files:**
- Create: `<scratchpad>/motion-ai-test/` (Kopie von `bowl-demo`)
- Read: alles, was `npx motion-ai` dort anlegt

**Interfaces:**
- Consumes: den gehärteten `SKILL.md` aus Task 1
- Produces: den Volltext des installierten `/motion`-Skills und die MCP-Konfiguration als Lesegrundlage für Task 3

- [ ] **Step 1: Wegwerf-Projekt anlegen**

`bowl-demo` ist der beste Prüfling, weil es als einziges Projekt GSAP **und** Scroll-Animationen einsetzt — dort schlägt eine Bewertung nach Render-Kosten am ehesten an.

```bash
SP="C:/Users/babok/AppData/Local/Temp/claude/C--Claude-code/cf7b050a-f20c-43d8-8833-18d4d33b3fb2/scratchpad"
mkdir -p "$SP/motion-ai-test"
cp -r "C:/Users/babok/Techsaar/bowl-demo/." "$SP/motion-ai-test/"
ls "$SP/motion-ai-test"
```

Erwartet: mindestens `index.html` erscheint in der Auflistung.

- [ ] **Step 2: AI Kit projektweise installieren**

```bash
cd "C:/Users/babok/AppData/Local/Temp/claude/C--Claude-code/cf7b050a-f20c-43d8-8833-18d4d33b3fb2/scratchpad/motion-ai-test" && npx --yes motion-ai
```

Der Installer fragt interaktiv nach Ziel (projektweise vs. global) und Agent.
**Antworten: projektweise, Claude Code.** Falls der Installer in dieser Umgebung
nicht interaktiv laufen kann, stattdessen `npx --yes motion-ai --help` aufrufen
und die nicht-interaktiven Flags aus der Ausgabe verwenden.

**Abbruchbedingung:** Sobald nach Konto, Login oder Zahlung gefragt wird —
abbrechen, Stand notieren, Task 4 auf „verworfen" setzen. Die 0-€-Grenze ist hart.

- [ ] **Step 3: Auflisten, was tatsächlich angelegt wurde**

```bash
SP="C:/Users/babok/AppData/Local/Temp/claude/C--Claude-code/cf7b050a-f20c-43d8-8833-18d4d33b3fb2/scratchpad/motion-ai-test"
find "$SP" -newer "$SP/index.html" -type f -not -path "*/node_modules/*" | head -40
```

Erwartet: eine Liste neuer Dateien, typischerweise unter `.claude/` (Skill) und eine MCP-Konfiguration. Diese Pfade sind der Input für Step 4.

- [ ] **Step 4: Den installierten `/motion`-Skill vollständig lesen**

Jede in Step 3 gefundene Markdown-Datei mit dem Read-Tool öffnen und vollständig lesen — nicht überfliegen. Beim Lesen mitschreiben:

- welche Regeln zu **Vanilla/Motion One** gelten und welche nur zu **React**
- ob eine **CDN- oder npm-Einbindung** vorgeschlagen wird (Konflikt mit der Self-Hosting-Regel)
- welche Aussagen zu **`scroll()`**, **`inView`** und **Endzuständen** getroffen werden (die drei Stellen, an denen wir teures Wissen haben)
- ob und wie **MotionScore** aufgerufen wird

- [ ] **Step 5: Kein Commit**

Es wird nichts committet. Das Wegwerf-Verzeichnis bleibt bis Task 4 bestehen.

---

### Task 3: Regel-für-Regel-Abgleich und Konfliktentscheidung

**Files:**
- Create: `C:\Users\babok\Techsaar\docs\motion-ai-kit-abgleich.md`

**Interfaces:**
- Consumes: den gehärteten `SKILL.md` (Task 1) und den gelesenen `/motion`-Skill (Task 2)
- Produces: eine Entscheidung je Konflikt, auf die Task 4 sich beim Zusammenführen stützt

- [ ] **Step 1: Abgleichtabelle anlegen**

Datei `C:\Users\babok\Techsaar\docs\motion-ai-kit-abgleich.md` mit diesem Kopf und je einer Zeile pro Regel, die in mindestens einer der beiden Quellen vorkommt:

```markdown
# Abgleich: Motion.dev AI Kit vs. eigener web-animations-Skill

*Erstellt: 2026-08-04 · Grundlage: `ui-tool-stack-entscheidung.md` Abschnitt 6*

Regel: Bei Konflikt gewinnt die eigene dokumentierte Praxiserfahrung.
Das AI Kit ergänzt nur dort, wo wir nichts haben.

| Thema | Unser Skill sagt | AI Kit sagt | Verhältnis | Entscheidung |
|---|---|---|---|---|
```

Spalte „Verhältnis" nimmt genau einen von vier Werten an: `deckungsgleich` · `AI Kit ergänzt` · `wir ergänzen` · **`Konflikt`**.

- [ ] **Step 2: Die vier Pflicht-Zeilen zuerst ausfüllen**

Diese vier müssen in der Tabelle stehen, weil dort unser teures Wissen liegt:

1. **Einbindung** — unser Skill: lokal gevendort, kein CDN. Was sagt das AI Kit?
2. **`scroll()`-Signatur in Motion 11** — unser Skill: `scroll(progress => …)`, alte Form wirft pro Frame. Was sagt das AI Kit?
3. **Endzustand nach der Animation** — unser Skill: WAAPI committet nicht, per `finished.then` **und** `setTimeout` festschreiben. Was sagt das AI Kit?
4. **Verifikation** — unser Skill: eingebaute Vorschau ist unzuverlässig, echtes Chromium per Playwright. Was sagt das AI Kit?

- [ ] **Step 3: Konflikte entscheiden**

Für jede Zeile mit `Konflikt` in der Entscheidungsspalte genau eine dieser Formulierungen eintragen:

- `Unsere Regel gilt — AI-Kit-Regel wird im zusammengeführten Skill ausdrücklich widerrufen`
- `AI-Kit-Regel gilt — unsere war veraltet, Beleg: <konkreter Beleg>`

Die zweite Variante ist nur zulässig **mit** Beleg (Versionshinweis, Changelog, reproduzierter Test). Ein bloßes „klingt neuer" reicht nicht — genau so verliert man das teuer bezahlte Wissen.

- [ ] **Step 4: Gesamturteil festhalten**

Unter die Tabelle einen Absatz schreiben, der genau eine dieser drei Empfehlungen ausspricht:

- **Übernehmen** — mehr `AI Kit ergänzt`-Zeilen als Konflikte, Konflikte alle zu unseren Gunsten auflösbar
- **Teilweise übernehmen** — nur benannte Abschnitte übernehmen, Rest verwerfen
- **Verwerfen** — Konflikte überwiegen oder das Kit ist rein React-orientiert und für statische Seiten nutzlos

- [ ] **Step 5: Commit**

```bash
cd "C:/Users/babok/Techsaar" && git add docs/motion-ai-kit-abgleich.md && git commit -m "docs: Abgleich Motion.dev AI Kit gegen web-animations-Skill"
```

Nur diese eine Datei stagen — im Repo liegen unverwandte, unversionierte Änderungen aus früheren Sessions.

---

### Task 4: Zusammenführen und global installieren ✅ erledigt 2026-08-04 (ohne Installation)

> **Ergebnis:** Gesamturteil aus Task 3 war **Teilweise übernehmen**. Die globale
> Installation **entfällt bewusst** — das Vanilla-Regelwerk des Kits hat 25 Zeilen,
> das Gewicht liegt im React-Teil; zwei gehostete MCP-Server hätten in jeder
> Sitzung Kontext gekostet ohne entsprechenden Gegenwert.
>
> Stattdessen umgesetzt:
> - Die sieben Ergänzungen stehen als **Abschnitt 6** in
>   `~/.claude/skills/web-animations/SKILL.md`, mit Vorrangregel zugunsten von 4b.
> - Der WAAPI-Konflikt ist **an beiden Stellen** vermerkt (4b und 6), damit er
>   nicht bei der nächsten Nutzung wieder auftaucht.
> - `npx motionscore <url> --no-upload` ist in 4b als kostenloser Prüfschritt
>   vor dem Live-Gang verankert, inkl. Warnung vor den kostenpflichtigen Flags.
> - Ein Abschnitt „Bewusst nicht übernommen" hält fest, was verworfen wurde und warum.
>
> **Wiedervorlage:** Sobald ein React-Projekt startet, lohnt die Installation —
> dann greift `react.md`, wo das eigentliche Gewicht des Kits liegt.

Die ursprünglich geplanten Steps (global installieren, Installation verifizieren) sind damit gegenstandslos.

**Files:**
- Modify: `C:\Users\babok\.claude\skills\web-animations\SKILL.md`
- Delete: `<scratchpad>/motion-ai-test/`

**Interfaces:**
- Consumes: die Entscheidungen aus `docs/motion-ai-kit-abgleich.md`
- Produces: den endgültigen `web-animations`-Skill und, falls übernommen, eine globale AI-Kit-Installation

- [ ] **Step 1: Ergänzungen in den eigenen Skill übernehmen**

Nur die Zeilen mit `AI Kit ergänzt` übertragen, als neuer Abschnitt am Ende von `SKILL.md`:

```markdown
## 6. Ergänzungen aus dem Motion.dev AI Kit

*Übernommen am 2026-08-04 nach Abgleich (siehe `Techsaar/docs/motion-ai-kit-abgleich.md`).
Der Abschnitt „4b. Bekannte Fallen" hat bei Widerspruch Vorrang.*
```

Darunter je Ergänzung einen Stichpunkt mit Quelle.

- [ ] **Step 2: Widerrufene Regeln ausdrücklich benennen**

Für jede Konfliktzeile, die zu unseren Gunsten entschieden wurde, in Abschnitt 4b einen Satz ergänzen, der die AI-Kit-Regel benennt und widerruft. Beispielform:

```markdown
- **Widerspruch zum AI Kit:** Dessen Regel „<Regel>" gilt bei uns **nicht** —
  Grund: <Grund>. Es gilt der Punkt oben.
```

Ohne diesen Schritt taucht der Konflikt bei der nächsten Nutzung wieder auf, weil der Agent beide Quellen sieht und die aktuellere für richtig hält.

- [ ] **Step 3: Global installieren**

```bash
cd "C:/Users/babok/Techsaar" && npx --yes motion-ai
```

Antworten: **global**, Claude Code.

- [ ] **Step 4: Installation verifizieren**

```bash
ls "C:/Users/babok/.claude/skills" | grep -i motion
grep -rn "cdn\.\|jsdelivr\|unpkg" "C:/Users/babok/.claude/skills/" | grep -i motion
```

Erwartet: Der Motion-Skill erscheint in der Auflistung. Der zweite Befehl darf **keine** Treffer liefern, die eine CDN-Einbindung für Seiten empfehlen — sonst ist Step 2 unvollständig.

- [ ] **Step 5: Wegwerf-Verzeichnis löschen**

```bash
rm -rf "C:/Users/babok/AppData/Local/Temp/claude/C--Claude-code/cf7b050a-f20c-43d8-8833-18d4d33b3fb2/scratchpad/motion-ai-test"
```

---

### Task 5: Am echten Projekt gegentesten ✅ erledigt 2026-08-04 (vorgezogen)

> **Ergebnis:** Der Praxistest lief bereits in Task 2, weil erst er zeigte, dass
> das MotionScore-CLI ohne Konto funktioniert — davon hing das gesamte Urteil ab.
>
> `npx motionscore https://kunz-jakob-ctrl.github.io/Techsaar/bowl-demo/ --no-upload --desktop-only`
> → **S-Tier, 95/100.** Animationen S, Scroll-Animationen A (14 erkannt,
> 4 Scroll-Listener, max. 8 gleichzeitig), Thrashing S, GPU-Druck S.
>
> **Einordnung der Befunde:** null echte Funde (die Seite ist sauber), null
> Falschmeldungen, eine Werkzeug-Macke (`--desktop-only` navigierte trotzdem
> mobil). Damit ist die Herabstufung auf „Teilweise übernehmen" **nicht** durch
> Falschmeldungen begründet, sondern allein durch die Dünne des Vanilla-Regelwerks.
>
> Details in `docs/motion-ai-kit-abgleich.md`. Playwright/Chromium wurde nicht
> gebraucht — MotionScore bringt Puppeteer selbst mit.

Die ursprünglich geplanten Steps sind damit abgedeckt.

**Files:**
- Read: `C:\Users\babok\Techsaar\bowl-demo\index.html`
- Modify: nur, falls der Test einen echten Fehler zutage fördert

**Interfaces:**
- Consumes: den zusammengeführten Skill aus Task 4
- Produces: eine belegte Aussage darüber, ob die MotionScore-Bewertung bei uns etwas Nützliches findet

- [ ] **Step 1: Chromium bereitstellen**

```bash
npx --yes playwright@1.61.1 install chromium
```

Erwartet: Download läuft durch oder meldet, dass Chromium bereits vorhanden ist.

- [ ] **Step 2: MotionScore auf `bowl-demo` anwenden**

Den in Task 4 installierten Motion-Skill bzw. dessen MCP auf `C:\Users\babok\Techsaar\bowl-demo\index.html` ansetzen und die Bewertung nach Render-Kosten anfordern.

- [ ] **Step 3: Befunde einordnen**

Jeden Befund in genau eine Kategorie einsortieren:

- **echter Fund** — reproduzierbar, betrifft die ausgelieferte Seite
- **Falschmeldung** — beruht auf einer Annahme, die für statische, self-gehostete Seiten nicht gilt
- **irrelevant** — betrifft React-spezifisches, das wir nicht einsetzen

- [ ] **Step 4: Ergebnis anhängen**

Unter die Tabelle in `docs/motion-ai-kit-abgleich.md` einen Abschnitt „Praxistest bowl-demo" mit der Zählung je Kategorie und den echten Funden im Wortlaut ergänzen. Zwei oder mehr Falschmeldungen bei null echten Funden sind das Signal, das Gesamturteil auf **Teilweise übernehmen** herunterzustufen.

**Wichtig:** Gefundene Fehler in `bowl-demo` werden hier **nicht** behoben. Das ist ein eigener Vorgang — dieser Task prüft das Werkzeug, nicht die Seite.

- [ ] **Step 5: Commit**

```bash
cd "C:/Users/babok/Techsaar" && git add docs/motion-ai-kit-abgleich.md && git commit -m "docs: Praxistest des Motion AI Kits an bowl-demo"
```

---

## Abbruchbedingungen

Diese drei Fälle beenden den Plan vorzeitig — der jeweilige Stand wird in `docs/motion-ai-kit-abgleich.md` festgehalten, danach ist Schluss:

1. **Kosten.** Konto, Key oder Tarif wird verlangt → 0-€-Grenze greift.
2. **Nur React.** Der `/motion`-Skill enthält keine verwertbaren Vanilla-Regeln → für 14 statische Demos wertlos.
3. **Konflikte überwiegen.** Mehr `Konflikt`- als `AI Kit ergänzt`-Zeilen → das Kit würde mehr kaputtmachen als beitragen.
