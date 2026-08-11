# Eckstück — interne Notizen

**Wird nicht ausgeliefert.** Der Deploy-Workflow schließt `*.md` aus
(`.github/workflows/deploy.yml`). Alles, was hier steht, gehört bewusst *nicht*
in HTML-Kommentare — die kann jeder Besucher über „Seitenquelltext anzeigen"
mitlesen.

## Bildbestand (Stand 10.08.2026)

**Echte Kundenfotos**, am 09.08.2026 per WhatsApp geliefert, am 10.08.
zugeschnitten. EXIF wurde beim Zuschnitt entfernt — WhatsApp-Bilder können
Geräte- und Standortdaten enthalten.

| Datei | Motiv |
|---|---|
| `hero-1.jpg` | Butterdose mit roten Kirschen, Schablonen davor |
| `hero-2.jpg` | Pinsel und Schwämmchen im Rosa-Becher |
| `hero-3.jpg` | Gestreifte Schürzen mit Pinseln |
| `galerie-1.jpg` | Hummer-Platte mit „Pablo"-Näpfchen |
| `galerie-2.jpg` | Bunter Dreiecks-Teller mit Keramikhahn |

`kontakt-brunnen.jpg` zeigt den Kugelbrunnen in der St. Wendeler
Fußgängerzone. Private Aufnahme aus Jakobs Familie, kein Stockfoto, Nutzung
abgestimmt. Bleibt dauerhaft.

**Entfernt am 10.08.2026:** `galerie-3.jpg` und `galerie-4.jpg`. Das waren
Stockfotos einer fremden Töpferwerkstatt beziehungsweise fremder Hände. Auf
einer Demo unkritisch, auf der Kundenseite nicht: fremde Betriebsstätten als
eigene zu zeigen ist wettbewerbsrechtlich angreifbar, und Eckstück brennt gar
keine eigenen Rohlinge. Die Dateien liegen noch in `img/`, werden aber nirgends
mehr eingebunden.

**Anfang September 2026** kommt ein Fotograf der Stadt ins Studio. Gebraucht
werden Innenraum, Rohling-Regal und Ladenfront. Danach:

- Galerie wieder auf vier Kacheln (`grid-cols-2` → `md:grid-cols-4`)
- Alt-Texte für die neuen Bilder schreiben
- Falls Personen erkennbar sind: schriftliche Einwilligung nach Art. 6 Abs. 1
  lit. a DSGVO / KUG von der Kundin einholen, bei Kindern von den Eltern

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
      **Zustelltest steht noch aus** — ein- und ausgehend, bei Gmail auf
      SPF/DKIM/DMARC = PASS achten.
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
