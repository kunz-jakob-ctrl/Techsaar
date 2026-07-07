# 🌐 Web-Demos

Sammlung unserer Demo-Websites für lokale Betriebe im Saarland.
Jede Seite ist **individuell gestaltet** (kein Baukasten-/0815-Look), modern, schnell und
mobiloptimiert. Es sind reine Front-End-Demos (HTML + Tailwind), keine echten Backends.

## Projekte

| Ordner | Branche | Look & Besonderheiten |
|--------|---------|------------------------|
| [`saar-barber-demo/`](saar-barber-demo/) | Barbershop / Friseur | Dunkel & Gold, Vintage (Bebas), rotierendes Emblem, Online-Terminbuchung mit Friseur-Verfügbarkeit |
| [`doener-demo/`](doener-demo/) | Dönerladen | Hell „Frischemarkt", Tomatenrot/Grün, Online-Bestellung mit Warenkorb & Anpassung |
| [`doener-keko/`](doener-keko/) | Döner / Bistro · St. Wendel | „Keko Bistro" — von Jakob gebaut. Döner, Pizza, Pasta & mehr |
| [`gelateria-demo/`](gelateria-demo/) | Eisdiele | Premium Gelateria, Serifenschrift, runde Eiskugel-Motive, Google-Maps, Sorten-Highlights |
| [`dachdecker/`](dachdecker/) | Dachdeckerei | Handwerker-Look, Leistungen & Kontakt |
| [`werkstatt-demo/`](werkstatt-demo/) | KFZ-Werkstatt | Online-Terminbuchung + Telefonassistent-Integration |
| [`zahnarzt-demo/`](zahnarzt-demo/) | Zahnarztpraxis | Dental-Care-Stil, Online-Terminbuchung + Telefonassistent-Sektion |
| [`telefon-demo/`](telefon-demo/) | KI-Telefonassistent (intern) | Demo-Seite für Kundengespräche |

> Unsere eigene Agentur-Website (TechSaar) liegt nicht mehr im Repo — sie ist live bei Hostinger.

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
