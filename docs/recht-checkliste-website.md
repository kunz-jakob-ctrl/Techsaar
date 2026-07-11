# Recht-Checkliste: Kundenwebsites (Deutschland)

Bei **jedem** Projekt vor Go-Live durchgehen. Stand: Juli 2026. Wir sind keine Anwälte — das ist eine Arbeits-Checkliste, keine Rechtsberatung. Bei Unsicherheit: Generator (z. B. eRecht24) nutzen oder Kunde zum Anwalt schicken, das dokumentieren. Verwandt: [no-gos](no-gos.md), [workflow-neuer-kunde](workflow-neuer-kunde.md).

## Pflicht auf jeder Kundenwebsite

- [ ] **Impressum** (§ 5 DDG): Name/Firma, Anschrift (kein Postfach), E-Mail + schneller Kontaktweg, bei Gewerbe: Vertretungsberechtigter, ggf. Registernummer, USt-IdNr. falls vorhanden. Bei Handwerkern: Kammer, Berufsbezeichnung. **Angaben liefert der Kunde und bestätigt sie schriftlich.**
- [ ] **Datenschutzerklärung** (DSGVO): muss ALLES abdecken, was die Seite wirklich tut — Hosting (Server-Logs), Kontaktformular, eingebettete Karten, Analyse-Tools. Von 1 Klick von jeder Seite erreichbar (Footer).
- [ ] **AV-Vertrag mit Hostinger** (Art. 28 DSGVO): Hostinger bietet Data Processing Agreement — Kunde muss es abschließen/akzeptieren. Nicht vergessen, danach fragt keiner, bis es knallt.
- [ ] **Cookie-/Consent-Banner (§ 25 TDDDG): nur wenn nötig!** Statische Seite ohne Tracking, ohne fremde Einbettungen = kein Banner nötig (= besser, einfacher, schöner). Sobald Google Analytics, YouTube-Embeds o. ä. drauf sind: Consent-Tool VOR dem Laden der Dienste.
- [ ] **Fonts lokal hosten** — niemals Google-Fonts-CDN (Urteil LG München I 2022, Abmahnrisiko). Gilt genauso für fremde CDNs (Icons, JS) — alles lokal ausliefern.
- [ ] **Google Maps einbetten** = personenbezogene Daten fließen zu Google → entweder 2-Klick-Lösung (Karte erst nach Klick laden) oder in Datenschutzerklärung + Consent abdecken. Einfachste Alternative: statisches Kartenbild mit Link zu Google Maps.
- [ ] **Bilder & Medien:** nur Kundenmaterial oder sauber lizenziert (Lizenz dokumentieren! Quelle + Lizenz in Projektnotiz). KI-generierte Bilder: ok, aber keine erkennbaren Personen/Marken. Personenfotos (Team!): Einwilligung der Abgebildeten.
- [ ] **Texte:** nie von Konkurrenz-Websites kopieren (Urheberrecht + peinlich).
- [ ] **Kontaktformular:** TLS (haben wir über SSL), keine unnötigen Pflichtfelder (Datenminimierung), Hinweis auf Datenschutzerklärung.

## Je nach Kunde zusätzlich prüfen

- [ ] **Barrierefreiheit (BFSG, seit 28.06.2025):** gilt für B2C-Dienstleistungen im E-Commerce — sobald die Seite **Online-Buchung/-Bestellung/-Terminvereinbarung mit Vertragsschluss** hat, kann das BFSG greifen. Kleinstunternehmen (< 10 Mitarbeiter UND ≤ 2 Mio. € Umsatz) sind bei Dienstleistungen ausgenommen — trifft auf die meisten unserer Kunden zu, aber **bei jedem Kunden kurz prüfen und Ergebnis notieren**. Barrierefrei bauen lohnt sich sowieso (Kontraste, Alt-Texte, Tastaturbedienung — gut für SEO).
- [ ] **Branchenrecht:** Preisangaben (PAngV) bei Preislisten (z. B. Friseur, Döner: Grundpreise korrekt), Gastronomie: Allergenkennzeichnung wenn Speisekarte online, Heilberufe/Kosmetik: HWG-Werbeverbote → siehe [no-gos](no-gos.md).
- [ ] **Online-Shop** (falls je gewünscht): ganz eigene Liga (Widerruf, AGB, Buttonlösung, BFSG voll) — nur mit expliziter Recherche annehmen.

## Für Techsaar selbst

- [x] **GbR gegründet** (bestätigt von Leon am 2026-07-11, beide Gesellschafter, beide volljährig). Noch prüfen: Gesellschaftsvertrag schriftlich (Aufteilung, Ausstieg)? Impressum der Techsaar-Seite auf GbR umstellen (beide Gesellschafter nennen).
- [ ] **Steuerliche Erfassung beim Finanzamt:** läuft — **kein Vertragsabschluss mit Kunden, bevor sie durch ist** (Regel aus Jakobs Eckstück-Plan). Status nachhalten.
- [ ] **Nebentätigkeitsanzeige beim Dienstherrn:** am 06.07.2026 rausgegangen — Rückmeldung abwarten/dokumentieren.
- [ ] **Kleinunternehmerregelung** (§ 19 UStG): unter 25.000 € Vorjahresumsatz keine USt ausweisen — auf Rechnungen den Hinweis "Gemäß § 19 UStG wird keine Umsatzsteuer berechnet" aufnehmen.
- [ ] **Rechnungen:** fortlaufende Nummer, Name/Anschrift beider Seiten, Datum, Leistung, Betrag, Steuerhinweis. Kopien 10 Jahre aufbewahren.
- [ ] **Eigene Techsaar-Website** braucht selbst Impressum + Datenschutzerklärung (mit gutem Beispiel vorangehen — Kunden prüfen das).
- [ ] **Verträge mit Kunden immer schriftlich** (E-Mail-Bestätigung reicht als Minimum): Umfang, Preis, Feedback-Runden, Nutzungsrechte, wer Domain/Hosting besitzt, Haftungsbegrenzung.
- [ ] Prüfen, sobald Umsatz wächst: Berufshaftpflicht/Vermögensschadenhaftpflicht für Webdesigner (deckt z. B. Abmahnung des Kunden wegen Fehler von uns).
- [x] **Geschäftsfähigkeit:** beide volljährig (bestätigt 2026-07-11) — kein Thema mehr.

## Offene Punkte (nachtragen!)

- [x] ~~Repo älter als Live-Seite~~ **erledigt 2026-07-11:** Live-Stand von www.tech-saar.de per HTTP-Spiegel ins Repo übernommen (index.html mit neuer Mail info@tech-saar.de, datenschutz.html mit Hostinger/EU, favicon.svg, sitemap.xml; legal-data.json angepasst). Repo = Live-Stand.
- **E-Mail-Inkonsistenz:** Kontaktsektion der Hauptseite nennt `info@tech-saar.de`, Impressum + legal-data.json noch `tech-saar@outlook.de`. Beide müssen funktionieren; klären, welche die offizielle ist, und Impressum ggf. angleichen.
- **AV-Vertrag/DPA mit Hostinger** einmal im hPanel bestätigen (falls noch nicht geschehen).
- **Angebots-Einseiter + Kundenvertragsvorlage: existieren noch nicht — Pflicht-Artefakte VOR dem ersten Kundengespräch** ([eckstueck](eckstueck.md))
- Steuerliche Erfassung: Status klären, erst dann Abschluss mit [eckstueck](eckstueck.md)
- Rückmeldung Dienstherr zur Nebentätigkeitsanzeige (raus 06.07.2026)
- GbR-Vertrag schriftlich? Techsaar-Impressum auf GbR-Angaben prüfen
