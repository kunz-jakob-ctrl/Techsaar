# 🌐 Web-Demos

Sammlung unserer Demo-Websites für lokale Betriebe im Saarland.
Jede Seite ist **individuell gestaltet** (kein Baukasten-/0815-Look), modern, schnell und
mobiloptimiert. Es sind reine Front-End-Demos (HTML + Tailwind), keine echten Backends.

## Projekte

| Ordner | Branche | Look & Besonderheiten |
|--------|---------|------------------------|
| [`saar-barber-demo/`](saar-barber-demo/) | Barbershop / Friseur | Dunkel & Gold, Vintage (Bebas), rotierendes Emblem, Online-Terminbuchung mit Friseur-Verfügbarkeit |
| [`techsaar/`](techsaar/) | Web-Agentur (wir selbst) | Hell/Pastell, Cursor-Spotlight, Bento, Leistungen & Arbeiten |
| [`doener-demo/`](doener-demo/) | Dönerladen | Hell „Frischemarkt", Tomatenrot/Grün, Online-Bestellung mit Warenkorb & Anpassung |
| [`gelateria-demo/`](gelateria-demo/) | Eisdiele | Premium Gelateria, Serifenschrift, runde Eiskugel-Motive, Google-Maps, Sorten-Highlights |

## Ansehen

**Schnell:** Den jeweiligen Ordner öffnen und die `index.html` im Browser doppelklicken.

**Mit lokalem Server** (z. B. damit Bilder/Karten korrekt laden):
```bash
# im jeweiligen Projektordner
python -m http.server 8000
# dann im Browser: http://localhost:8000
```

**Online stellen:** Den Projektordner einfach auf [Netlify Drop](https://app.netlify.com/drop)
ziehen — fertig.

## Anpassen pro Kunde

Ganz oben im `<script>`-Block jeder `index.html` gibt es einen **`CONFIG`-Block**
(Name, Telefon, Adresse, Öffnungszeiten, Speisekarte/Sorten, Bilder …).
Nur diesen Block ändern → der Rest (Design, Funktionen) bleibt unberührt.
