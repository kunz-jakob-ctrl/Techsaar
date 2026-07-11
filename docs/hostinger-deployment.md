# Hostinger: Website hochladen & live schalten

Schritt-für-Schritt für Techsaar-Deployments auf Hostinger. Teil von [workflow-neuer-kunde](workflow-neuer-kunde.md).

## Vorbereitung

- Hosting-Plan im hPanel (Hostinger-Verwaltung) bereit, Domain registriert oder vorhanden
- Bei Kundendomain von anderem Anbieter: entweder Domain zu Hostinger umziehen (Auth-Code beim alten Anbieter holen) oder nur die **DNS auf Hostinger zeigen lassen** (A-Record auf Server-IP bzw. Nameserver `ns1.dns-parking.com` / `ns2.dns-parking.com`)
- DNS-Änderungen brauchen bis zu 24–48 h (meist schneller)

## Statische Website hochladen (Standardfall)

1. hPanel → Website → **Dateimanager** (oder FTP, Zugangsdaten unter "FTP-Konten")
2. Zielordner: `public_html/` — Inhalt dort hinein, `index.html` muss direkt in `public_html/` liegen
3. Alte Platzhalter-Dateien (`default.php` o. ä.) löschen
4. Alternativ: hPanel → **Git** → Repo-URL eintragen, Branch wählen, Deploy — dann kann man per `git push` deployen (bei privaten Repos Deploy-Key hinterlegen)

## SSL / HTTPS

1. hPanel → Sicherheit → **SSL** → kostenloses Let's-Encrypt-Zertifikat installieren (meist automatisch)
2. **HTTPS erzwingen** aktivieren ("Force HTTPS")
3. Testen: `http://…`-Aufruf muss auf `https://…` umleiten

## Nach dem Go-Live prüfen

- [ ] Seite lädt unter Domain mit und ohne `www`
- [ ] HTTPS erzwungen, Schloss im Browser
- [ ] `sitemap.xml` und `robots.txt` erreichbar
- [ ] Formulare funktionieren (Test-Mail schicken)
- [ ] PageSpeed grob prüfen (Bilder komprimiert?)
- [ ] Danach direkt weiter mit [sichtbarkeit-google-bing](sichtbarkeit-google-bing.md)

## Stolperfallen

- E-Mail des Kunden hängt oft an der Domain! Vor Nameserver-Wechsel prüfen, ob MX-Records übernommen werden müssen — sonst ist das Kunden-Postfach tot.
- Caching: Hostinger cached teils aggressiv; nach Updates hPanel → Cache leeren.
- Backups: hPanel macht Auto-Backups (je nach Plan wöchentlich). Vor größeren Änderungen manuelles Backup ziehen. Quellcode liegt sowieso im Git-Repo.
