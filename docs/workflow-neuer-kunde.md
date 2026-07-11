# Workflow: Neuer Kunde → Live-Website

Der Standard-Ablauf für jeden Techsaar-Kunden, von Erstkontakt bis Übergabe. Verwandt: [hostinger-deployment](hostinger-deployment.md), [sichtbarkeit-google-bing](sichtbarkeit-google-bing.md), [recht-checkliste-website](recht-checkliste-website.md), [no-gos](no-gos.md), [kunde-template](kunde-template.md).

## 1. Erstgespräch & Anforderungen

Vor dem Angebot klären (Checkliste → in Kundennotiz nach [kunde-template](kunde-template.md) eintragen):

- Branche, Leistungen, Alleinstellungsmerkmal — **vorher [no-gos](no-gos.md) prüfen!**
- Bestehende Präsenzen: alte Website? Google-Business-Eintrag? Social Media?
- Material: Logo, Fotos (eigene! keine geklauten), Texte, Öffnungszeiten, Preisliste
- Domain-Wunsch (ist sie frei? sofort prüfen) und wer die Domain besitzt — **Domain immer auf den Kunden registrieren oder sauber übertragbar halten**, sonst Streit bei Trennung
- Budget & Umfang: Onepager vs. mehrseitig, Kontaktformular, Terminbuchung, Galerie
- Wer pflegt Inhalte später? (→ Wartungsvereinbarung anbieten)

## 2. Angebot & Vertrag

- Schriftliches Angebot: Leistungsumfang, Preis, was NICHT enthalten ist (z. B. Texte, Fotos, laufende SEO), Zahlungsplan (üblich: 50 % Anzahlung, 50 % bei Abnahme)
- Klären: einmaliger Preis vs. monatliche Wartung/Hosting-Pauschale (wiederkehrende Einnahmen = besser fürs Geschäft)
- Nutzungsrechte am Design/Code regeln
- Siehe [recht-checkliste-website](recht-checkliste-website.md) Abschnitt "Für Techsaar selbst"

## 3. Umsetzung

- Demo/Entwurf zeigen, max. 2 Feedback-Runden vereinbaren (sonst Endlos-Schleife)
- Statische Site bevorzugen (schnell, sicher, billig zu hosten) — CMS nur wenn Kunde wirklich selbst pflegen will
- Pflicht auf jeder Seite: Impressum, Datenschutzerklärung ([recht-checkliste-website](recht-checkliste-website.md))
- Technik-Basis: responsive, Fonts lokal einbinden (nie Google-Fonts-CDN!), Bilder komprimiert (WebP), `sitemap.xml`, `robots.txt`, Meta-Description, OG-Tags, LocalBusiness-Schema ([sichtbarkeit-google-bing](sichtbarkeit-google-bing.md))

## 4. Abnahme durch den Kunden

- Kunde bestätigt Inhalte schriftlich (auch Impressums-Angaben — die kommen VOM Kunden, wir haften nicht für falsche Angaben, aber sauber dokumentieren)
- Auf allen Geräten testen (Handy zuerst — lokale Kunden googeln mobil)

## 5. Go-Live

- Deployment nach [hostinger-deployment](hostinger-deployment.md)
- SSL prüfen (https erzwungen?), 404-Seite vorhanden?

## 6. Sichtbarkeit

- Komplett nach [sichtbarkeit-google-bing](sichtbarkeit-google-bing.md): Search Console, Bing, Google Business Profile, Apple Business Connect, Verzeichnisse

## 7. Übergabe & Nachsorge

- Zugangsdaten übergeben (Passwort-sicher, nicht per Mail im Klartext)
- Kurze Übergabe-Doku für den Kunden (1 Seite: wo liegt was, wen anrufen)
- Nach 2–4 Wochen nachfassen: Indexierung ok? Erste Bewertungen sammeln lassen (echte! siehe [no-gos](no-gos.md))
- Rechnung, Zahlungseingang prüfen
- Kundennotiz im Vault aktualisieren (Learnings, was beim nächsten Mal besser)
