# UI-Tool-Stack — Entscheidung

*Erstellt: 2026-08-04 · Anlass: Video „8 Free Websites Every Vibe Coder Needs" (Adrien | AI Designer) · Methode: Lücken-Scan über alle Repo-Projekte, danach jedes Tool einzeln geprüft*

Dieses Dokument legt für jedes der acht Tools fest, ob und wie wir es einsetzen. Es ist eine Entscheidung, keine Sammlung — jedes „Ja" hat einen konkreten Auslöser im Bestand, jedes „Nein" einen benannten Grund.

## Maßstab

Ein Tool wird gegen vier Kriterien gemessen:

1. **Demos gewinnen Kunden** — macht es unsere Demos sichtbar beeindruckender?
2. **Höhere Preise durchsetzbar** — schafft es eine Fähigkeit, die die regionale Konkurrenz nicht hat?
3. **Schneller liefern** — senkt es die Bauzeit pro Kundenseite?
4. **Eigenes Lernen** — bringt es uns technisch weiter?

**Tiebreaker bei Konflikt: Differenzierung sticht.** Ein Tool mit Lernkurve darf gewinnen, wenn es uns abhebt.

### Harte Bedingungen (nicht verhandelbar)

- **Strikt 0 €.** Was hinter einer Paywall liegt, bekommt kein Ja. Das ist eine harte Grenze, kein Kriterium — sie schlägt auch den Tiebreaker.
- **Self-Hosting für alles, was im Besucher-Browser läuft.** 0 externe Requests bleibt (DSGVO, Google-Fonts-Falle). Werkzeuge, die nur bei uns während der Entwicklung laufen (MCP-Server, CLI, Agent-Skills), dürfen extern sein.
- **Verbesserungsziele sind nur** tech-saar.de und die neutralen Demos. Echte Kundenprojekte (`eckstueck-demo`, `wendelinushof-demo`) und die Produkt-Demos (`reservierung-demo`, `telefon-demo`) bleiben unangetastet.

## Lücken-Scan — was wir zeigen und was nicht

Stand 2026-08-04, alle 19 Projekte im Repo auf tatsächlich eingesetzte Technik geprüft:

| Fähigkeit | Wo sie vorkommt |
|---|---|
| WebGL-Shader | nur `index.html` (Agentur-Hero) |
| Echtes 3D (Three.js) | nur `dachdecker-demo` — und dort **nur der Hero**, keine Seite drumherum |
| Scroll-Film / Video | nur `bowl-demo` (GSAP) |
| JS-Animationsbibliothek | `motion.js` nur in `index.html`, `eckstueck-demo` und `wendelinushof-demo` |
| **Datenvisualisierung / Charts** | **nirgends — kein einziges Projekt** |
| **Mikrointeraktionen (Lottie/Rive)** | **nirgends** |

**Zwei echte Lücken:** Datenvisualisierung/Dashboard und Mikroanimation.

**Nebenbefund, und er sitzt:** `motion.js` läuft ausschließlich auf unserer eigenen Seite und den beiden echten Kundenprojekten. **Keine einzige der neutralen Demos** nutzt es — also genau die Seiten, die wir Interessenten zum Anschauen geben, sind die animationsärmsten. Der `web-animations`-Skill wird dort nicht eingesetzt.

## Die acht Tools

### 1. Kokonut UI — *nur Inspirationsquelle*

**Geprüft:** 100+ Komponenten, freier Teil open source (GitHub, 2K+ Sterne). Stack: React + Next.js + Tailwind + shadcn/ui + Motion. Installation ausschließlich über `npx shadcn@latest add @kokonutui/<name>`. Pro-Tier existiert, Preis nicht öffentlich.

**Use Case bei uns:** Optische Vorlage für Signature-Komponenten, insbesondere die Liquid-Glass-Card.

**Verdikt: Kein eigenes Projekt, kein Ja als Library.** Der Installationsweg setzt einen shadcn-Registry-Stack voraus, den wir nicht haben und für statische Demos auch nicht wollen. Abschreiben lässt sich nur der visuelle Effekt — und dafür brauchen wir keine Entscheidung, sondern nur ein Lesezeichen.

**Warum nicht mehr:** Liquid Glass ist seit Apples Einführung 2026 überall. Es hebt uns nicht ab, es lässt uns aktuell aussehen. Das ist Pflege, kein Vorsprung.

---

### 2. React Bits — *Ja, als Portierungsquelle*

**Geprüft:** 140+ animierte Komponenten, wächst wöchentlich. Lizenz **MIT + Commons Clause** — kommerzielle Nutzung in Kundenprojekten erlaubt, der Weiterverkauf der Bibliothek selbst nicht. Entscheidend: es gibt **vier Varianten je Komponente** (JS-CSS, JS-TW, TS-CSS, TS-TW). Offizielle Ports für Vue und Svelte. Kein MCP-Server.

**Use Case bei uns:** Die **JS-CSS-Variante** ist reines JavaScript plus CSS ohne TypeScript und ohne Tailwind-Zwang. Damit ist Portieren nach statischem HTML realistisch statt theoretisch — die React-Hülle abziehen, die Animationslogik bleibt.

**Verdikt: Ja — bestehendes verbessern.** Quelle für einen Signature-Effekt auf tech-saar.de.

**Erste Schritte:**
1. Auf reactbits.dev die Showcase-Sektion durchgehen und **einen** Effekt auswählen, der zum dunklen Aura-Editorial-Look passt
2. Komponente in der **JS-CSS-Variante** ziehen (nicht JS-TW)
3. React-Wrapper entfernen, Logik in eine self-hostbare `.js` im Repo-Root überführen (analog `animations.js`)
4. Gegen `prefers-reduced-motion` und ohne-JS-Fall absichern
5. Vor dem Push mit echtem Chromium/Playwright prüfen, nicht in der eingebauten Vorschau (siehe bekannte Fallen im `web-animations`-Skill)

---

### 3. Bklit UI — *Ja als Design-Referenz für ein neues Projekt*

**Geprüft:** Chart-Bibliothek, die shadcn/ui um Datenvisualisierung erweitert. Line, Area, Ring, Radar, Legende, komponierbare Teile (Grid, XAxis, ChartTooltip). **Chart-Komponenten MIT**, „Bklit Studio" (der interaktive Playground) proprietär. Vorabversion. React + shadcn-Registry.

**Use Case bei uns:** Schließt die größte inhaltliche Lücke — wir führen Datenvisualisierung nirgends vor, obwohl „Dashboard für dein Geschäft" ein naheliegendes Verkaufsargument bei jedem Betrieb ist.

**Verdikt: Ja — neues kleines Projekt „Dashboard-Demo". Aber: Bklit dient als *Design-Referenz*, nicht als Abhängigkeit.** Die Umsetzung erfolgt vanilla (siehe Alternativen unten). Ein React-Stack nur für eine Demo würde einen zweiten Build- und Deploy-Weg einführen, der bei jeder künftigen Änderung Wartung kostet — das steht in keinem Verhältnis.

**Erste Schritte:**
1. Fiktiven Betrieb festlegen, für den ein Dashboard plausibel ist (Auslastung, Umsatz, Termine)
2. Auf bklit.com die Chart-Typen sichten und **drei** auswählen, die eine Geschichte erzählen — nicht neun, die eine Wand ergeben
3. Vanilla-Charting-Bibliothek wählen und **lokal vendoren** (kein CDN)
4. Als `dashboard-demo/index.html` nach Repo-Konvention anlegen: fiktive Marke, `noindex`, Rechtslinks auf tech-saar.de
5. `website-recht-check` vor dem Live-Gang

---

### 4. Limora — *Verwerfen*

**Geprüft:** KI-Asset-Generator für Designer, extrahiert Markenfarben/Typografie/Tonalität aus einer URL und erzeugt darauf abgestimmte Assets (14+ Typen). **Kein dauerhaft freier Tarif** — Kreditsystem, Preis auf Anfrage, allenfalls Testphase.

**Verdikt: Verwerfen.** Scheitert an der harten 0-€-Grenze. Kein weiterer Prüfaufwand nötig.

**Anmerkung:** Es ist das eigene Produkt des Video-Autors. Der Abschnitt ist Werbung, kein Tipp — das erklärt auch, warum es als einziges Tool in einem Video über „8 Free Websites" keinen freien Tarif hat.

---

### 5. anime.js v4 — *Nein, vorerst*

**Geprüft:** MIT-Lizenz, 24,5 KB voll, modular ab 0,22 KB, ES-Module, `npm i animejs`. Scroll Observer API mit mehreren Synchronisationsmodi. Technisch einwandfrei und self-hostbar.

**Verdikt: Nein.** Nicht wegen Qualität, sondern wegen Doppelung: Wir setzen bereits Motion One ein, inklusive hart erkämpfter Kenntnisse über dessen Fallstricke. Eine zweite Animationsbibliothek daneben bedeutet zwei Fehlerbilder, zwei Debug-Routinen und die Frage bei jedem Projekt, welche gerade gilt. anime.js löst kein Problem, das Motion One offenlässt.

**Wichtige Korrektur zum Video:** Der Sprecher sagt bei anime.js, ein Terminal-Befehl „bringe Claude bei, solche Animationen zu erzeugen". **Das stimmt nicht** — ein solcher Agent-Skill existiert bei anime.js nicht. Das ist das Feature von Motion.dev (Nr. 6), das er zwei Minuten später separat vorstellt. Er hat die beiden vermischt. Wer anime.js allein wegen dieser Aussage installiert, bekommt sie nicht.

**Wiedervorlage:** Falls Motion One irgendwann an einer konkreten Scroll-Choreografie scheitert, ist anime.js der erste Kandidat.

---

### 6. Motion.dev AI Kit — *Ja, Setup-Arbeit, höchste Priorität*

**Geprüft:** Installation über `npx motion-ai`. Richtet einen `/motion`-Skill **und** einen MCP-Server in Claude Code, Cursor, Amp, OpenCode, Gemini CLI oder Copilot ein — projektweise oder global. Enthält handgeschriebene Animationsregeln des Motion-Teams, erkennt Plattform und vorhandene UI-Bibliotheken. Bewertet Animationen (Motion, CSS, GSAP) nach Render-Kosten und gibt dem Agenten konkrete Korrekturen. Kostenlos. Läuft ausschließlich bei uns während der Entwicklung — die Self-Hosting-Regel für Besucher-Code ist nicht berührt.

**Use Case bei uns:** Wirkt auf jede künftige Seite statt nur auf eine. Die MotionScore-Bewertung adressiert genau das, was uns bisher Stunden gekostet hat: Animationen, die im echten Browser anders laufen als gedacht.

**Verdikt: Ja — höchste Priorität.** Billigstes und breitest wirkendes Ja der Liste.

**⚠️ Nicht blind installieren.** Unser `web-animations`-Skill enthält teuer bezahltes Wissen, das ein generisches Regelwerk nicht kennt: die geänderte `scroll()`-Signatur in Motion 11 und dass ein werfender Scroll-Callback den kompletten Frame-Loop lahmlegt; das WAAPI-Commit-Problem; die Laufband-Verdopplungsregel; dass die eingebaute Vorschau bei Endlos-Animationen hängen bleibt. Wird das überschrieben, verlieren wir mehr, als das AI Kit bringt.

**Erste Schritte:**
1. `npx motion-ai` **projektweise** ausführen, nicht global — erst beobachten
2. Den installierten `/motion`-Skill vollständig lesen und gegen `~/.claude/skills/web-animations/SKILL.md` abgleichen
3. Widersprüche auflisten. Bei Konflikt gewinnt unsere dokumentierte Praxiserfahrung; die Regeln des AI Kits ergänzen, wo wir nichts haben
4. Erst nach diesem Abgleich global installieren
5. Am `bowl-demo` (GSAP, Scroll) gegentesten — dort ist am ehesten sichtbar, ob die MotionScore-Bewertung trägt

---

### 7. Rive — *Verwerfen*

**Geprüft:** Vier Tarife. Free 0 $/Sitz/Monat: 3 kollaborative Dateien, 1 Projekt, 10 MB Asset-Import, eingeschränkter Agent-Zugang — ausdrücklich zum **Lernen und Erkunden im Editor**. Für ausgelieferte Arbeit ist Cadet vorgesehen: **9 $/Sitz/Monat** jährlich, 17 $ monatlich. Runtimes für JavaScript, React und weitere vorhanden.

**Verdikt: Verwerfen.** Der freie Tarif deckt Kundenarbeit nicht ab, damit greift die harte 0-€-Grenze.

**Bewusst getroffener Zielkonflikt:** Rive ist der einzige Fall, in dem der Tiebreaker „Differenzierung sticht" gegen die 0-€-Grenze steht — Rive-Mikroanimationen kann im Saarland fast niemand, und der Aufpreis wäre durchsetzbar. Die harte Grenze wurde am 2026-08-04 bewusst höher gewichtet und Rive bleibt draußen. Falls sich das später ändert: 9 $/Monat für einen Sitz ist der Einstieg, und Lottie (unten) ist die kostenlose Vorstufe, die einen Teil desselben Effekts liefert.

---

### 8. Magic UI — *Ja, klein*

**Geprüft:** MIT-Lizenz, React + Tailwind + Motion, „copy and paste". **MCP-Server kostenlos**, Installation über `pnpm dlx @magicuidesign/cli@latest install claude`, kein API-Key, kein Konto. Magic UI Pro (50+ Blöcke und Templates) kostet **199 $ einmalig** und ist nicht Teil dieser Entscheidung.

**Use Case bei uns:** Der MCP lässt Claude die passende Komponente selbst auswählen, statt dass wir manuell durch den Katalog gehen. Reine Entwicklungszeit-Ersparnis.

**Verdikt: Ja, klein — Setup-Arbeit.** Zehn Minuten, kostenlos, dev-only.

**⚠️ Überschneidung beachten:** Wir haben bereits den **21st.dev Magic MCP** global registriert, ebenfalls als UI-Inspirationsquelle. Zwei MCPs mit gleichem Zweck bedeutet doppelten Kontext bei jeder Anfrage. Vor dem Registrieren klären, ob Magic UI den 21st.dev-MCP ergänzt oder ersetzt — nicht beides unbesehen nebeneinander laufen lassen.

**Erste Schritte:**
1. Prüfen, was der bestehende 21st.dev-MCP abdeckt und wo er Lücken hat
2. Magic UI MCP registrieren
3. An einer konkreten Aufgabe gegeneinander testen (z. B. „Bento-Grid-Sektion für tech-saar.de")
4. Den schwächeren der beiden wieder entfernen

## Nicht im Video, aber besser geeignet

Diese Werkzeuge stammen nicht aus dem Video. Sie stehen hier, weil sie für unseren Fall besser passen als das jeweilige Video-Tool.

### Lottie — statt Rive

Kostenlos, offener Runtime, `.json`-Animationen lassen sich vollständig self-hosten. Deckt Mikrointeraktionen und Icon-Animationen ab — also den Großteil dessen, wofür Rive vorgesehen war — ohne Abo und ohne Editor-Lernkurve, weil fertige Animationen verfügbar sind. Was Lottie **nicht** kann: zustandsbasierte, interaktive Animationen (Hover, Drag, Zustandsmaschinen). Genau das ist Rives eigentliche Stärke. Lottie ist deshalb die kostenlose Vorstufe, nicht der vollwertige Ersatz.

### Vanilla-Charting — statt Bklit UI als Abhängigkeit

Für die Dashboard-Demo brauchen wir Charts ohne React. Kandidaten sind Chart.js (klein, einfach, gut dokumentiert) und Apache ECharts (mächtiger, größer). Beide sind MIT-lizenziert und lassen sich lokal vendoren wie schon `motion.js` und die Schriften. Bklit UI liefert dabei die **Gestaltung** — welche Diagrammtypen, welche Dichte, welche Beschriftung — und die Vanilla-Bibliothek die Ausführung.

## Rangfolge

1. **Motion.dev AI Kit einbauen und mit `web-animations` abgleichen** — ~30 Minuten, kostenlos, wirkt auf jede künftige Seite statt nur auf eine. Bestes Verhältnis der ganzen Liste. Der Abgleich ist Pflicht, nicht Kür.
2. **Dashboard-Demo neu bauen** — schließt die größte Fähigkeitslücke im Bestand. Datenvisualisierung ist ein Verkaufsargument bei jedem Betrieb mit Zahlen, und wir zeigen es nirgends. Bklit UI als Referenz, Umsetzung vanilla.
3. **Magic UI MCP registrieren** — ~10 Minuten, kostenlos. Vorher gegen den bestehenden 21st.dev-MCP abgrenzen, sonst wird es Ballast statt Hilfe.
4. **React Bits als Portierungsquelle für tech-saar.de** — ein Signature-Effekt, JS-CSS-Variante, sauber portiert. Größerer Aufwand als 1–3, dafür direkt auf der Seite sichtbar, die Leads bringt.
5. **Lottie evaluieren** — die kostenlose Antwort auf die zweite Lücke (Mikroanimation). Erst nach 1–4, weil ohne konkreten Anlass sonst nur Technik gesammelt wird.
6. **`dachdecker-demo` ausbauen** — ein Three.js-Hero ohne Seite drumherum ist bezahlte Arbeit, die niemand sieht. Kein neues Tool nötig, nur Fertigstellung.

**Nicht weiterverfolgt:** Limora (kostenpflichtig), Rive (kostenpflichtig für Kundenarbeit), anime.js (Doppelung zu Motion One), Kokonut UI (nur Lesezeichen).

## Kontext für später

Die geplante Unterseiten-Struktur von tech-saar.de (`/leistungen/`, `/arbeiten/` — siehe `site-architecture.md`) ist perspektivisch der Ort, an dem diese Demos einmal als Fähigkeits-Schaukasten eingebunden werden. Diese Architektur wurde hier **nicht** entworfen und **nicht** entschieden; der Hinweis steht nur, damit neue Demos später sauber einsortiert werden können.
