# Sichtbarkeit: Google, Bing & lokale Auffindbarkeit

Nach jedem Go-Live ([hostinger-deployment](hostinger-deployment.md)) abarbeiten. Für lokale Betriebe ist das **wichtiger als die Website selbst** — die meisten Kunden finden den Laden über Google Maps, nicht über die Domain.

## 1. Google Search Console

1. https://search.google.com/search-console → Property anlegen
2. **Domain-Property** wählen (deckt http/https, www/nicht-www ab) → Verifizierung per DNS-TXT-Record (im Hostinger-hPanel unter DNS eintragen)
3. `sitemap.xml` einreichen
4. Startseite über "URL-Prüfung" → "Indexierung beantragen" anstoßen
5. Nach 1–2 Wochen prüfen: Seiten indexiert? Fehler?

## 2. Bing Webmaster Tools

1. https://www.bing.com/webmasters → anmelden
2. **"Aus Google Search Console importieren"** nutzen — übernimmt Verifizierung + Sitemaps in einem Schritt, kein extra DNS-Eintrag nötig
3. Bing speist auch DuckDuckGo und teils ChatGPT/Copilot-Suche — nicht auslassen

## 3. Google Business Profile (GBP) — das Herzstück für lokale Kunden

1. https://business.google.com → Unternehmen suchen (oft existiert schon ein unbeanspruchter Eintrag!) oder neu anlegen
2. Verifizierung: je nach Fall Video, Anruf oder Postkarte (Postkarte dauert ~1–2 Wochen — früh starten!)
3. Vollständig ausfüllen: **primäre Kategorie sorgfältig wählen** (größter Ranking-Hebel), Öffnungszeiten, Telefonnummer, Website-Link, Leistungen, Attribute
4. Mindestens 5–10 echte Fotos (außen, innen, Team, Arbeit) — Profile mit Fotos bekommen deutlich mehr Klicks
5. Kunde soll aktiv **Bewertungen sammeln** (Link/QR-Code zum Bewerten erstellen und dem Kunden geben) und auf Bewertungen antworten — nur echte, siehe [no-gos](no-gos.md)
6. Der Kunde muss selbst **Inhaber** des Profils sein; Techsaar ggf. als Verwalter hinzufügen

## 4. Apple Business Connect (oft vergessen!)

https://businessconnect.apple.com — kostenlos, füttert Apple Maps/Siri. Jeder iPhone-Nutzer, der "Friseur in der Nähe" sagt, sucht hier.

## 5. Verzeichnisse & NAP-Konsistenz

**NAP = Name, Adresse, Telefonnummer — überall exakt identisch schreiben** (gleiche Schreibweise, gleiches Format). Inkonsistenz schadet dem lokalen Ranking.

Sinnvolle kostenlose Einträge für Saarland-Betriebe: Das Örtliche, Gelbe Seiten, 11880, GoLocal, Facebook-Seite (falls Kunde will). Branchenspezifisch prüfen (z. B. MyHammer für Handwerker).

## 6. On-Page-Basics (gehören schon in die Entwicklung)

- `<title>` und Meta-Description pro Seite: **Leistung + Ort** ("Dachdecker Saarbrücken – Meisterbetrieb XY")
- **Schema.org LocalBusiness** als JSON-LD im `<head>`: Name, Adresse, Telefon, Öffnungszeiten, `geo`, passender Typ (`Roofer`, `Restaurant`, `HairSalon` …)
- Google-Maps-Karte einbetten, Adresse im Footer auf jeder Seite
- OG-Tags (Vorschau bei WhatsApp/Facebook-Teilen — lokale Betriebe werden viel per WhatsApp geteilt!)
- Ladezeit mobil < 3 s

## Erfolgskontrolle (nach 4 Wochen)

- Search Console: Impressionen/Klicks steigen?
- GBP-Statistik: Anrufe, Routenanfragen
- Suche im Inkognito-Modus: "branche + ort" — wo steht der Kunde?
