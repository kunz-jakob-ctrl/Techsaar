# Eckstück — interne Notizen

**Wird nicht ausgeliefert.** Der Deploy-Workflow schließt `*.md` aus
(`.github/workflows/deploy.yml`). Alles, was hier steht, gehört bewusst *nicht*
in HTML-Kommentare — die kann jeder Besucher über „Seitenquelltext anzeigen"
mitlesen.

## Bildbestand (Stand 09.11.2026)

Die Galerie zeigt 4 Kacheln (Start am 09.11.2026 nur mit neuen Fotos) und wechselt alle 14 Tage montags automatisch
(`galerie.js`, Pool in `CONFIG.galerie`, Test `build/galerie.test.cjs`).
Ähnliche Motive tragen dieselbe `gruppe` und dürfen nie zusammen erscheinen.

**Echte Kundenfotos.** Hero und Galerie 1–2 kamen am 09.08.2026 per WhatsApp.
Galerie 3–13 sind Fotos der Inhaberinnen, geliefert am 01.11.2026. EXIF wurde
beim Zuschnitt entfernt.

| Datei | Motiv | Hinweis |
|---|---|---|
| `hero-1.jpg` | Butterdose mit roten Kirschen, Schablonen davor | |
| `hero-2.jpg` | Pinsel und Schwämmchen im Rosa-Becher | |
| `hero-3.jpg` | Gestreifte Schürzen mit Pinseln | |
| `galerie-1.jpg` | Hummer-Platte mit „Pablo"-Näpfchen | |
| `galerie-2.jpg` | Bunter Dreiecks-Teller mit Keramikhahn | |
| `galerie-3.jpg` | Glasurregal Pastell, nummeriert | gruppe farbregal |
| `galerie-4.jpg` | Hände tupfen blaue Punkte auf Keramik-Ei | Person nur von hinten, nicht erkennbar |
| `galerie-5.jpg` | Rohlinge im Regal mit Kirschblüten | Preisschild lesbar (von Kundin geliefert) |
| `galerie-6.jpg` | ECKSTÜCK-Aufsteller, Hortensien | gruppe aufsteller |
| `galerie-7.jpg` | Besucherin bemalt Schale mit Schrift | Person nur von hinten, nicht erkennbar |
| `galerie-8.jpg` | ECKSTÜCK-Aufsteller im Sonnenlicht | gruppe aufsteller |
| `galerie-9.jpg` | Studio vom Eingang, Blick zum Fenster | Person klein im Hintergrund, nicht erkennbar |
| `galerie-10.jpg` | Henkelbecher und Teekannen im Schaufenster | Preisschild lesbar (von Kundin geliefert) |
| `galerie-11.jpg` | Glasurregal Gelb–Altrosa | gruppe farbregal |
| `galerie-12.jpg` | Die beiden Inhaberinnen in Schürzen | Einwilligung der Inhaberinnen bestätigt am 2026-11-09 |
| `galerie-13.jpg` | Wolkenlampen am Fenster | |

**Bewusst nicht verwendet** (Lieferung 01.11.2026): vier Fotos mit
erkennbaren Gästen (Frauengruppe am Tisch, zwei ältere Damen, Innenraum mit
Gästen, Ladenfront mit Gast). Ohne schriftliche Einwilligung der Abgebildeten
nicht nutzbar.

`kontakt-brunnen.jpg` zeigt den Kugelbrunnen in der St. Wendeler
Fußgängerzone. Private Aufnahme aus Jakobs Familie, kein Stockfoto, Nutzung
abgestimmt. Bleibt dauerhaft.

**Keine Stockfotos:** Fremde Betriebsstätten als eigene zu zeigen ist
wettbewerbsrechtlich angreifbar, und Eckstück brennt keine eigenen Rohlinge.
Die alten Stock-Dateien `galerie-3.jpg`/`galerie-4.jpg` wurden am 09.11.2026
durch Kundenfotos überschrieben.

## Rechtstexte

Impressum und Datenschutzerklärung stammen von der IT-Recht Kanzlei
(Stand 10.08.2026, von der Kundin geliefert).

Aus der Datenschutzerklärung wurde am 10.08. der Abschnitt „5)
Seitenfunktionalitäten" entfernt — Instagram-Plugins, Apple Maps, ein
Google-Maps-Embed und Google Kundenrezensionen. **Keiner dieser Dienste
existiert auf der Seite.** Der Text behauptete außerdem eingeholte
Einwilligungen (es gibt keinen Consent-Banner) und einen
Auftragsverarbeitungsvertrag mit Meta. Die Folgeabschnitte wurden von 6)/7)
auf 5)/6) umnummeriert.

**Folge:** Für diese Fassung greift die Haftungsübernahme der Kanzlei nicht
mehr. Übergangszustand.

**Zu tun:** Kundin wählt die Module im Mandantenportal ab und exportiert neu,
dabei ein Modul für Terminbuchungsdienste (Shore, `connect.shore.com`)
anfordern — das fehlt. Danach `datenschutz.html` komplett durch den neuen
Export ersetzen. Ebenfalls offen: ein Abschnitt zu künstlicher Intelligenz
(Art. 50 KI-VO verlangt auch eine Negativaussage).

Das Copyright-Logo der Kanzlei liegt lokal unter `img/itrk-copyright.png`,
damit die Seite keine Verbindung zu Dritten aufbaut — sonst ginge die IP jedes
Besuchers an die Kanzlei, ausgerechnet auf der Datenschutzseite.

## Offen vor dem Live-Gang

- [x] **AV-Vertrag mit Hostinger** — nichts zu tun. Er gilt automatisch mit der
      Annahme der Nutzungsbedingungen (hostinger.com/legal/dpa: „deemed to have
      signed"). Als PDF zu den TechSaar-Unterlagen legen.
- [x] **Domain registriert am 10.08.2026: `eckstueck-stwendel.de`** (kurz, ohne
      ausgeschriebenes „sankt" — so von der Kundin gewünscht). Aktiv, Ablauf
      2027-09-01, automatische Verlängerung an.
- [x] Postfach `info@eckstueck-stwendel.de` angelegt (11.08.2026, Free
      Business Email, kostenlos für 12 Monate, 1 GB). MX, SPF
      (`include:_spf.mail.hostinger.com`) und DMARC (`p=none`) stehen.
      **Zustelltest am 11.08.2026 erfolgreich.** Autoconfig- und
      Autodiscover-Einträge sind gesetzt, die Kundin richtet das Postfach
      allein mit Adresse und Passwort ein — hPanel sieht sie nie.
      Server: `imap.hostinger.com:993` (SSL), `smtp.hostinger.com:465`,
      Webmail `mail.hostinger.com`.
- [ ] **Kanzlei-Neuexport braucht die richtige E-Mail-Adresse.** Der gelieferte
      Text nannte `info@eckstueck-sanktwendel.de` — diese Domain existiert nicht
      und wurde nie registriert. Am 10.08. in `impressum.html` und
      `datenschutz.html` von Hand auf `info@eckstueck-stwendel.de` korrigiert,
      weil eine tote Pflichtadresse der schlechtere Zustand ist. Beim Export
      muss die Kundin die richtige Adresse hinterlegen.
- [x] `noindex` am 11.08.2026 aus allen drei Seiten entfernt, zusammen mit der
      Domainumstellung.
- [ ] `logo-katalog.html` vom alten Server löschen. Sie ist aus dem Repo
      entfernt, liegt aber weiter unter
      `domains/tech-saar.de/public_html/eckstueck-demo/` — der SFTP-Deploy
      überschreibt nur, er löscht nichts. Seit 11.08. greift dort zwar eine
      301-Weiterleitung, die Datei bleibt aber physisch liegen.
- [ ] E-Mail-Hosting in Anlage 2 des Kundenvertrags aufnehmen

## Zwei Schalter, die man kennen muss

**`CONFIG.phoneActive`** steht auf `false`, weil der Telefonanschluss erst etwa
eine Woche vor Betriebsaufnahme besetzt ist. Damit verschwinden alle
Telefon-Hinweise von der Startseite (Reservierungs-Block, Kontakt,
FAQ-Abschluss, Knopf in der mitlaufenden Leiste), an ihre Stelle treten
Instagram-Verweise. Zum Freischalten genügt `phoneActive: true` — die Nummer
selbst steht weiterhin in CONFIG. Impressum und Datenschutzerklärung sind
davon nicht betroffen, dort ist die Nummer Pflichtangabe.

**`?v=2026-08-10` an den Foto-URLs.** Die `.htaccess` lässt Bilder ein Jahr
lang zwischenspeichern (`max-age=31536000`), HTML dagegen gar nicht. Ohne diese
Kennung sehen wiederkehrende Besucher nach einem Bildertausch weiter die alten
Fotos — genau das ist nach dem ersten Tausch passiert. **Beim Fotoshooting im
September das Datum hochzählen**, sonst wiederholt sich das.

## Fallen, die schon Zeit gekostet haben

**`styles.css` ist ein vorkompiliertes Tailwind-Bundle.** Neue Utility-Klassen
sind darin schlicht nicht enthalten und wirken deshalb gar nicht — schon
passiert mit `left-0`, `right-0`, `right-auto`, `mx-0`, `h-[260px]`,
`md:h-[380px]`, `md:gap-8`, `m-0`. Vor dem Einsatz neuer Klassen im Bundle
nachsehen, sonst im `<style>`-Block lösen.

**Die Einstiegsanimation schreibt `transform` inline ins Element** und macht
damit jede Positionierung oder Drehung kaputt, die ebenfalls über `transform`
läuft. Hat den großen Hero-Bogen am Handy 120 px nach rechts geschoben und den
geneigten Zettel flach gelegt. Motion animiert auch dann `transform`, wenn man
die eigenständige CSS-Eigenschaft `translate` animiert — der Weg ist also
dicht. Lösung: Positionierung ohne `transform`, Drehung auf ein inneres
Element.
