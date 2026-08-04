# Abgleich: Motion.dev AI Kit vs. eigener web-animations-Skill

*Erstellt: 2026-08-04 · Grundlage: `ui-tool-stack-entscheidung.md` Abschnitt 6 · Plan-Task 3*
*Geprüfte Fassung: `motion-ai` 14.0.0, Inhalte via `npm pack` gelesen (nicht installiert)*

Regel: Bei Konflikt gewinnt die eigene dokumentierte Praxiserfahrung.
Das AI Kit ergänzt nur dort, wo wir nichts haben.

## Was das Paket überhaupt enthält

16 Dateien. Für uns relevant:

| Datei | Inhalt | Für statische Seiten? |
|---|---|---|
| `best-practices/index.md` | universelle Regeln (Performance, Design, API) | **ja** |
| `best-practices/motion.md` | Vanilla JS — **25 Zeilen** | **ja, aber dünn** |
| `best-practices/react.md`, `vue.md`, `base-ui.md` | plattformspezifisch | nein |
| `css-spring/index.md` | CSS-`linear()`-Federgenerierung | ja, braucht MCP |
| `performance-audit/index.md` | MotionScore | **teilweise kostenpflichtig** |
| `codex/index.md` | Doku-/Beispielsuche | ja, braucht MCP |
| `agents/motion-reviewer.md` | Subagent für Projekt-Audits | nur mit Motion+ |
| `rules/motion.mdc` | Cursor-Regel | nein (Cursor-Format) |

## Abgleichtabelle

| Thema | Unser Skill sagt | AI Kit sagt | Verhältnis | Entscheidung |
|---|---|---|---|---|
| **Einbindung** | `vendor/motion.js` lokal, kein npm, kein CDN | „Import from `motion`, never from `framer-motion`" — setzt Bundler voraus, sagt nichts zur Auslieferung | wir ergänzen | Unsere Regel gilt. Die Kit-Regel betrifft das *Paket*, nicht den *Auslieferweg* — kein echter Widerspruch, aber das Kit kennt den Vendoring-Fall nicht. |
| **`scroll()`-Signatur Motion 11** | `scroll(progress => …)`; alte Form wirft pro Frame | **nichts** | wir ergänzen | Unsere Regel gilt unverändert. |
| **Werfender `scroll()`-Callback legt Frame-Loop lahm** | dokumentiert, inkl. Fehlersuch-Reihenfolge | **nichts** | wir ergänzen | Unsere Regel gilt unverändert. |
| **Endzustand / WAAPI committet nicht** | per `finished.then` **und** `setTimeout` festschreiben | „Prefer `transform` as these animations will run via WAAPI" | **Konflikt (auflösbar)** | **Beides gilt.** Der Kit-Rat erhöht die WAAPI-Nutzung und damit genau unsere Fehlerquelle. Regel: WAAPI-Weg für Performance nutzen **und** den Endzustand explizit festschreiben. |
| **Verifikation von Animationen** | echtes Chromium per Playwright; die eingebaute Vorschau lügt | MotionScore — statisch nur mit Motion+, Runtime-CLI frei | beides ergänzt | Unsere Vorschau-Fallen bleiben (kennt das Kit nicht). `npx motionscore <url> --no-upload` kommt als zusätzliches, kostenloses Werkzeug dazu. |
| **Easing-Benennung** | „Option heißt `ease`, nicht `easing`" | zusätzlich: Werte sind camelCase — `easeOut`, **nicht** `ease-out` | AI Kit ergänzt | Übernehmen. |
| **`will-change`** | nichts | bei CSS-`transition` und unabhängigen Transforms setzen, sparsam, danach entfernen; bei CSS-`animation`/`transform` unnötig | AI Kit ergänzt | Übernehmen. |
| **`transform` vs. unabhängige Transforms** | nichts | `transform` bevorzugen (läuft via WAAPI); unabhängige nur bei getrennten Transitions, MotionValues oder konkurrierenden Transforms | AI Kit ergänzt | Übernehmen — zusammen mit der Endzustands-Regel oben. |
| **Code in Frame-Schleifen** | nichts | keine Objektallokation, `for` statt `forEach`/`map`, kein `Object.entries`/`values` | AI Kit ergänzt | Übernehmen. |
| **MotionValues** | nichts | `motionValue.on("change", …)`, **nie** `.onChange(…)`; laufende Animation nicht in Variable halten, `value.stop()` nutzen | AI Kit ergänzt | Übernehmen, auch wenn wir MotionValues kaum einsetzen. |
| **Gestaltungs-Leitplanken** | 16–32px, 0.4–0.7s, `[0.22,1,0.36,1]`, dezent, einmal einblenden, staffeln | Federn für physische Bewegung; Überschwingen zum Produkt passend (Börse: nein, Hochzeit: ja) | deckungsgleich | Beide sagen dasselbe. Kit-Formulierung als Ergänzung aufnehmen. |
| **CSS-Federn** | nichts | `generate-css-easing({kind, duration, bounce})`; zurückgegebene Dauer ist **länger** als die angefragte — Geschwister-Animationen auf die *angefragte* timen | AI Kit ergänzt | Übernehmen (Wissen). Das Werkzeug selbst braucht den MCP. |
| **Farbwechsel in Loops** | nicht per `animate(backgroundColor…)`, sondern CSS-`transition` + `el.style` | **nichts** | wir ergänzen | Unsere Regel gilt. |
| **transform-Kollision Parallax/Reveal** | Parallax auf Wrapper, Reveal aufs innere Element | **nichts** | wir ergänzen | Unsere Regel gilt. |
| **Laufband-Rezept** | exakte Verdopplung, `translateX(-50%)`, Überbreite bei Kippung | **nichts** | wir ergänzen | Unsere Regel gilt. |
| **Ohne-JS-Fall / Progressive Enhancement** | Anfangszustände nur unter JS-vergebener Klasse, `<noscript>`-Override | **nichts** | wir ergänzen | Unsere Regel gilt. Für öffentliche Kundenseiten wichtiger als alles, was das Kit dazu sagt. |
| **`framer-motion`** | nichts | nie importieren, Paket heißt `motion` | AI Kit ergänzt (für uns irrelevant) | Nicht übernehmen — wir setzen kein React ein. |

**Zählung:** 1 Konflikt (auflösbar) · 7 × „AI Kit ergänzt" (übernehmen) · 6 × „wir ergänzen" · 1 × deckungsgleich.

## Kostenprüfung (Abbruchbedingung 1)

`npx motion-ai --help`: „No API key needed. Motion+ features unlock by signing in to the motion-plus MCP server."

| Funktion | Kosten |
|---|---|
| Best Practices (alle Dateien) | **frei**, komplett offline lesbar |
| Doku-/Beispielsuche | frei, braucht MCP-Server |
| CSS-Federgenerierung | frei, braucht MCP-Server |
| Transition speichern | Motion-Konto (frei) |
| **MotionScore statischer Audit** | **Motion+ — kostenpflichtig** |
| **MotionScore Runtime-CLI** | **frei**: `--no-upload` ist laut Hilfe „unlimited, no account needed" |
| Cloud-Audit, private Audits, Historie | kostenpflichtig |

Die 0-€-Grenze ist **nicht** verletzt, solange wir statische Audits und Cloud-Funktionen nicht nutzen. Der Skill weist ausdrücklich an, ohne Motion+ **keine** MotionScore-Note zu erfinden — das ist ehrlich und muss so bleiben.

**Korrektur zur Entscheidungs-Vorlage:** In `ui-tool-stack-entscheidung.md` Abschnitt 6 steht „bewertet Animationen nach Render-Kosten" als Hauptargument für Platz 1. Das gilt nur eingeschränkt — der *statische* Audit ist kostenpflichtig. Der Wert liegt stattdessen im kostenlosen Runtime-CLI und in den universellen Best Practices.

## Praxisbeleg: MotionScore gegen die live `bowl-demo`

`npx motionscore https://kunz-jakob-ctrl.github.io/Techsaar/bowl-demo/ --no-upload --desktop-only`

```
Overall  S-tier (95/100)
  Animations        S-tier  (2 erkannt: 1 WAAPI, 1 JavaScript)
  Scroll animations A-tier  (14 erkannt, 4 Scroll-Listener, max. 8 gleichzeitig, P75: 6)
  Thrashing         S-tier  (max. 3 gleichzeitige rAF)
  GPU pressure      S-tier  (0MB Textur, 0 Layer)
```

Lief ohne Konto, ohne Installation, in wenigen Minuten. Einzige Abwertung: Scroll-Animationen mit A statt S.

**Werkzeug-Macke:** Trotz `--desktop-only` gab es „Navigating (mobile)" aus und sortierte die Animationsbefunde unter „Mobile" ein. Die Zahlen wirken plausibel, die Viewport-Zuordnung nicht.

## Gesamturteil: Teilweise übernehmen

Die mechanische Zählung (7 Ergänzungen gegen 1 auflösbaren Konflikt) spräche für vollständiges Übernehmen. Dagegen steht ein Befund, der schwerer wiegt als die Zählung: **die Vanilla-Datei hat 25 Zeilen.** Der Reichtum des Kits liegt in `react.md` — für 14 statische Demos ist das Regelwerk dünn. Ein global installierter Skill plus zwei gehostete MCP-Server kosten in jeder Sitzung Kontext; der Gegenwert wäre bei uns gering.

Deshalb in drei Teilen:

1. **Wissen übernehmen, ohne Installation.** Die sieben Ergänzungen wandern als Abschnitt in unseren `web-animations`-Skill. Kostet nichts zur Laufzeit und ist genau der Teil, der bei statischen Seiten trägt.
2. **MotionScore-CLI ohne Installation nutzen.** `npx motionscore <url> --no-upload` braucht weder das Kit noch ein Konto. Als Prüfschritt vor dem Live-Gang aufnehmen.
3. **MCP-Server vorerst nicht global installieren.** Doku-Suche und Federgenerierung sind nett, aber ersetzbar. Wiedervorlage, sobald ein Projekt mit React startet — dort kippt die Rechnung, weil `react.md` das eigentliche Gewicht hat.

**Damit entfällt Plan-Task 4 in seiner geplanten Form** (globale Installation). An seine Stelle tritt: die sieben Ergänzungen in den eigenen Skill schreiben und den MotionScore-Aufruf dort als Prüfschritt verankern.
