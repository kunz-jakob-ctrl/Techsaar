# SEO-Audit — tech-saar.de

*Erstellt: 2026-07-13 · Skill: `seo-audit` (marketingskills) · Basis: `.agents/product-marketing.md`*
*Umfang: On-Page + technisch, Startseite `index.html` (+ impressum/datenschutz), lokales SEO Saarland.*

## Gesamteinschätzung

Die Seite ist technisch **überdurchschnittlich sauber** für einen kleinen lokalen Auftritt: korrekte `lang`-Angabe, sinnvoller `<title>`, Meta-Description, `<link rel=canonical>`, `robots.txt`, `sitemap.xml`, genau **eine H1**, saubere H2/H3-Hierarchie, keine `<img>` ohne Alt (Visuals sind CSS/SVG), self-hosted (schnell, DSGVO-freundlich). Das größte ungenutzte Potenzial liegt bei **strukturierten Daten (Schema)**, **Social-Sharing-Meta (Open Graph)**, ein paar **technischen Hygiene-Fixes** und **lokaler Keyword-Schärfung**.

Bewertung grob: **Technik 8/10 · On-Page 7/10 · Lokales SEO 5/10 · Rich-Results-Bereitschaft 2/10.**

---

## 🟢 Quick Wins (hohe Wirkung, geringer Aufwand)

### 1. LocalBusiness/ProfessionalService-Schema fehlt komplett
**Befund:** Keine `application/ld+json`-Daten auf der Seite. Für ein lokales Dienstleistungsunternehmen ist das der wichtigste einzelne SEO-Hebel — Google versteht Name, Adresse, Telefon, Einzugsgebiet und kann die Firma in lokalen Ergebnissen / im Knowledge-Panel einordnen.
**Fix:** `ProfessionalService`-JSON-LD in `<head>` einbauen (NAP aus `legal-data.json`, `areaServed` Saarland). → wird im Skill `schema` umgesetzt.

### 2. Open-Graph / Twitter-Cards fehlen
**Befund:** Kein `og:title`, `og:description`, `og:image`, `twitter:card`. Beim Teilen (WhatsApp, LinkedIn, Facebook) erscheint kein Vorschaubild/Text → deutlich schlechtere Klickrate. Gerade für ein Studio, das per WhatsApp/Direktkontakt akquiriert, relevant.
**Fix:** OG/Twitter-Meta + ein Vorschaubild (`og-image`, 1200×630) einbauen. → Skill `schema`/Umsetzung.

### 3. E-Mail-Inkonsistenz (NAP-Vertrauenssignal)
**Befund:** Startseite & Formular zeigen `info@tech-saar.de`, Impressum/`legal-data.json` nennen `tech-saar@outlook.de`. Inkonsistente Kontaktdaten schwächen Vertrauens-/Konsistenzsignale (und verwirren Kunden).
**Fix:** Eine kanonische Adresse festlegen (Empfehlung: `info@tech-saar.de` als Außenadresse) und überall — inkl. Schema — einheitlich verwenden. **Jakob-Entscheidung nötig.**

### 4. `sitemap.xml` — Duplicate-URL & Fremd-Stylesheet
**Befund:**
- Enthält **sowohl** `https://tech-saar.de/` **als auch** `https://tech-saar.de/index.html` → dieselbe Seite doppelt (Duplicate-Content-Signal, widerspricht dem Canonical auf `/`).
- Verweist per `<?xml-stylesheet ... href="https://www.xml-sitemaps.com/...">` auf eine **externe** Domain (Generator-Überbleibsel) — unnötiger Fremd-Request/Abhängigkeit.
- `lastmod` (2026-07-08) ist älter als die letzte index-Änderung (2026-07-12).
**Fix:** Nur die kanonische `/`-URL listen, `index.html`-Eintrag entfernen, externen Stylesheet-Verweis löschen, `lastmod` aktualisieren.

### 5. Statischer `<title>` ≠ per-JS gesetzter Titel
**Befund:** Statisch: „TechSaar — **Moderne** Websites, Apps & KI aus dem Saarland". Das Script (`applyConfig`, Zeile 510) überschreibt ihn beim Laden zu „TechSaar — Websites, Apps & KI aus dem **Saarland**" (ohne „Moderne"). Googlebot rendert JS → sieht die zweite Variante. Kein Fehler, aber unnötige Divergenz; „Moderne" (schwaches Keyword) geht verloren.
**Fix:** Beide angleichen. Optional Titel lokal schärfen, z. B. „Webdesign & Apps aus dem Saarland | TechSaar" (Keyword „Webdesign" + Region vorn).

---

## 🟡 Mittel (mehr Wirkung, etwas Aufwand)

### 6. Lokale Keywords zu unspezifisch
**Befund:** Die Seite nennt durchgehend „Saarland", aber nie den konkreten Ort **Namborn / Landkreis St. Wendel** oder umliegende Städte (St. Wendel, Saarbrücken, Neunkirchen). Für lokale Suchen („Webdesigner St. Wendel", „Website erstellen lassen Saarland") fehlt damit Ranking-Substanz.
**Fix:** Ortsbezug natürlich einstreuen (z. B. im „Über uns"-/Kontaktbereich: „aus Namborn im Landkreis St. Wendel, für Betriebe im ganzen Saarland"), `areaServed` im Schema, und mittelfristig eine Standort-Seite (siehe `docs/site-architecture.md`).

### 7. H1 ist keyword-arm
**Befund:** Die H1 „Auffallen. Lokal. Digital." ist stark als Design, trägt aber kein Such-Keyword. Die Keywords stecken nur im darüberstehenden `<p class="mlabel">` und im Fließtext.
**Fix (behutsam, Design erhalten):** Entweder die kreative H1 lassen und sicherstellen, dass „Webdesign/Websites … Saarland" prominent als H2 direkt darunter steht, **oder** die H1 um einen Keyword-Zusatz erweitern (z. B. sichtbar bleibende Zeile „Webdesign & Apps aus dem Saarland"). Kein Keyword-Stuffing.

### 8. Google Unternehmensprofil (GBP) — off-page, aber entscheidend
**Befund:** Für „Local Pack"/Maps-Rankings ist ein gepflegtes **Google-Unternehmensprofil** der Haupttreiber (liegt außerhalb der Website). ⚠️ Status unbekannt.
**Fix:** GBP anlegen/verifizieren (Kategorie „Webdesigner"), NAP **identisch** zur Website/Impressum, Fotos, Leistungen, Beiträge. NAP-Konsistenz zwischen GBP ↔ Website ↔ Impressum sicherstellen.

### 9. Kein internes Seiten-Ökosystem (Thin-Site-Grenze)
**Befund:** Single-Page + Impressum/Datenschutz. Google hat wenig indizierbare Fläche für unterschiedliche Suchintentionen (einzelne Leistungen, FAQ, lokale Begriffe).
**Fix:** Kleine, gezielte Unterseiten (Leistungen, FAQ, Standort) — Plan in `docs/site-architecture.md`. Mittelfristiger Hebel.

---

## 🔵 Größer / später

### 10. FAQ-Sektion + FAQPage-Schema
Eine FAQ („Was kostet eine Website?", „Wie lange dauert es?", „Bin ich langfristig gebunden?") beantwortet echte Suchintention, senkt Einwände (siehe `product-marketing.md` §Objections) und ist FAQ-Rich-Result-fähig. Doppelter Nutzen: SEO + Conversion.

### 11. Referenz-/Case-Study-Seiten
Die drei Arbeiten (FASSON, Gelateria, Saar Döner) könnten je eine eigene kurze Case-Study-URL bekommen — mehr indizierbarer Inhalt mit lokalen Branchen-Keywords („Website Barbershop Saarbrücken"). Erst wenn echte Referenzen freigegeben sind.

### 12. Performance / Core Web Vitals
Der WebGL-Shader im Hero ist bereits GPU-schonend gedeckelt (CAP 1100px, IntersectionObserver-Pause). Vor Live per Lighthouse LCP/CLS/INP messen; falls LCP leidet, Shader erst nach First-Paint starten. ⚠️ Messung ausständig.

---

## Umsetzungs-Reihenfolge (empfohlen)
1. **Sofort im Code (dieser Durchlauf):** #1 Schema, #2 OG/Twitter, #4 sitemap.xml-Fix, #5 Titel angleichen — plus #3 nach Jakobs E-Mail-Entscheidung.
2. **Content-Tuning:** #6 lokale Keywords, #7 H1.
3. **Off-page (Jakob):** #8 Google-Unternehmensprofil.
4. **Ausbau:** #9/#10/#11 gemäß `site-architecture.md`, #12 Performance-Messung.

*Hinweis: Vor jedem Live-Gang läuft der Skill `website-recht-check`; Schema-Angaben dürfen keine unbelegten Behauptungen/Bewertungen enthalten (UWG).*
