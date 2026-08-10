# Recht-Checkliste: Kundenwebsites (Deutschland)

Bei **jedem** Projekt vor Go-Live durchgehen. Stand: August 2026 (AI-Act-Abschnitt ergänzt am 02.08.2026, dem Tag an dem Art. 50 KI-VO gilt). Wir sind keine Anwälte — das ist eine Arbeits-Checkliste, keine Rechtsberatung. Bei Unsicherheit: Generator (z. B. eRecht24) nutzen oder Kunde zum Anwalt schicken, das dokumentieren. Verwandt: [no-gos](no-gos.md), [workflow-neuer-kunde](workflow-neuer-kunde.md).

## Pflicht auf jeder Kundenwebsite

- [ ] **Impressum** (§ 5 DDG): Name/Firma, Anschrift (kein Postfach), E-Mail + schneller Kontaktweg, bei Gewerbe: Vertretungsberechtigter, ggf. Registernummer, USt-IdNr. falls vorhanden. Bei Handwerkern: Kammer, Berufsbezeichnung. **Angaben liefert der Kunde und bestätigt sie schriftlich.**
- [ ] **Datenschutzerklärung** (DSGVO): muss ALLES abdecken, was die Seite wirklich tut — Hosting (Server-Logs), Kontaktformular, eingebettete Karten, Analyse-Tools. Von 1 Klick von jeder Seite erreichbar (Footer).
- [ ] **AV-Vertrag mit Hostinger** (Art. 28 DSGVO): Hostinger bietet Data Processing Agreement — Kunde muss es abschließen/akzeptieren. Nicht vergessen, danach fragt keiner, bis es knallt.
- [ ] **Cookie-/Consent-Banner (§ 25 TDDDG): nur wenn nötig!** Statische Seite ohne Tracking, ohne fremde Einbettungen = kein Banner nötig (= besser, einfacher, schöner). Sobald Google Analytics, YouTube-Embeds o. ä. drauf sind: Consent-Tool VOR dem Laden der Dienste.
- [ ] **Fonts lokal hosten** — niemals Google-Fonts-CDN (Urteil LG München I 2022, Abmahnrisiko). Gilt genauso für fremde CDNs (Icons, JS) — alles lokal ausliefern.
- [ ] **Google Maps einbetten** = personenbezogene Daten fließen zu Google → entweder 2-Klick-Lösung (Karte erst nach Klick laden) oder in Datenschutzerklärung + Consent abdecken. Einfachste Alternative: statisches Kartenbild mit Link zu Google Maps.
- [ ] **Bilder & Medien:** nur Kundenmaterial oder sauber lizenziert (Lizenz dokumentieren! Quelle + Lizenz **als Kommentarblock oben in der index.html**, Muster: `elektro-demo/index.html`). KI-generierte Bilder/Videos: erlaubt, aber **seit 02.08.2026 kennzeichnungspflichtig** — siehe AI-Act-Abschnitt unten. Weiterhin gilt: keine erkennbaren fremden Personen/Marken darin. Personenfotos (Team!): Einwilligung der Abgebildeten.
- [ ] **Texte:** nie von Konkurrenz-Websites kopieren (Urheberrecht + peinlich).
- [ ] **Kontaktformular:** TLS (haben wir über SSL), keine unnötigen Pflichtfelder (Datenminimierung), Hinweis auf Datenschutzerklärung.

## KI-Verordnung (AI Act) — seit 02.08.2026 scharf

Verordnung (EU) 2024/1689. In Kraft seit 01.08.2024, aber die für uns relevanten
**Transparenzpflichten aus Art. 50 gelten seit dem 02.08.2026**. Der „Digital Omnibus"
(Einigung 07.05.2026) verschiebt **nur** die Hochrisiko-Pflichten auf 12/2027 bzw. 08/2028 —
Art. 4, Art. 5 und **Art. 50 bleiben unverändert**. Bußgeldrahmen bei Verstoß gegen Art. 50:
bis 15 Mio. € oder 3 % des Weltumsatzes, für KMU gilt der jeweils niedrigere Wert.

- [ ] **KI-generierte Bilder, Videos, Audio (Art. 50 Abs. 4):** Wenn Material fotorealistisch
      wirkt und reale Dinge, Orte, Personen oder Vorgänge zeigt, ist es ein „Deepfake" im Sinne
      des Art. 3 Nr. 60 — der Begriff meint **nicht nur Personen**. Dann muss **sichtbar auf der
      Seite** stehen, dass der Inhalt KI-generiert ist. Muster: `bowl-demo/index.html`, CSS-Klasse
      `.film-ainote` + Satz in der Fußnote. Ein Vermerk nur im HTML-Kommentar reicht **nicht**.
- [ ] **Niemals „echtes Foto/echter Film" schreiben, wenn es KI ist.** Das ist doppelt riskant:
      Art. 50 Abs. 4 KI-VO *und* § 5 UWG (Irreführung). Ein Fiktions-Disclaimer zur Marke deckt
      die Herkunft der Medien **nicht** mit ab.
- [ ] **Chatbot / KI-Telefonassistent auf der Seite (Art. 50 Abs. 1):** Nutzer müssen **bei der
      ersten Interaktion** erfahren, dass sie mit einer KI sprechen — beim Telefonbot durch
      Selbstvorstellung zu Gesprächsbeginn, beim Chatbot durch Beschriftung im Fenster.
      Textmuster: `werkstatt-demo/index.html` (Fußnote „Hinweis zur Telefonannahme").
- [ ] **Datenschutzerklärung nachziehen:** eigener Abschnitt „Künstliche Intelligenz" —
      was läuft, welche Daten gehen wohin, Art. 22 DSGVO (keine rein automatisierte Entscheidung).
      Muster: `datenschutz.html` Abschnitt 9. **Auch dann schreiben, wenn KEINE KI läuft** — dann
      als klare Negativaussage, das schafft Vertrauen und kostet nichts.
- [ ] **Achtung Rollenwechsel (Art. 25 Abs. 1 lit. a):** Liefern wir einen KI-Bot unter unserem
      Namen aus, sind wir nicht mehr nur Betreiber, sondern **Anbieter** — mit voller Art.-50-Pflicht.
      Vor dem ersten echten Bot-Projekt gesondert prüfen.
- [ ] **Nicht relevant für uns (geprüft 02.08.2026):** Hochrisiko nach Anhang III, Emotionserkennung,
      biometrische Kategorisierung, Social Scoring. Falls ein Kundenprojekt das je berührt
      (Bewerberauswahl, Kreditwürdigkeit, Zugangskontrolle) → **ablehnen oder Anwalt**.
- [ ] **Art. 4 (KI-Kompetenz), gilt schon seit 02.02.2025:** Wer KI beruflich einsetzt, muss
      Grundkenntnisse nachweisen können. Für uns: [ki-kompetenz](ki-kompetenz.md) aktuell halten.

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
