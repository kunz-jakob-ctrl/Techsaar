# Dachdecker-Demo — 3D-Dachbau-Hero (Prototyp)

Standalone-Hero für eine spätere Dachdecker-Demo-Website („FIRST Bedachungen", fiktiv, Arbeitstitel).
Das Dach baut sich auf (Pfetten → Sparren → Lattung → Ziegel → First → Rinne/Dachfenster/Kamin),
der Bauphasen-Streifen unten läuft synchron mit. Danach: dezente Kamera-Drift + Maus-Parallaxe.

**Zwei Ablauf-Varianten (A/B-Vergleich, Umschalter unten rechts):**
- `index.html` — Aufbau läuft automatisch beim Laden (~6,5 s)
- `index.html?ablauf=scroll` — Hero ist gepinnt, der Scrollfortschritt baut das Dach (rückwärts scrollen = Rückbau)

- **Alles self-hosted**: Three.js in `vendor/`, Fonts in `fonts/`, 0 externe Requests (DSGVO).
- **Fallbacks**: kein WebGL / kein JS → `poster.webp`; `prefers-reduced-motion` → sofort Endbild, keine Drift, kein Scroll-Pinning.
- **Debug**: `?finish=1` an die URL hängen springt direkt zum fertigen Dach.
- **Technik-Hinweis**: Die Timeline ist stateless (Zustand rein aus t berechnet) — Voraussetzung fürs Scrubben.

## Poster neu erzeugen (nach Szenen-Änderungen)

Benötigt Node + Playwright (`npm i playwright`) und ffmpeg:

```
node tools/poster.js        # rendert die fertige Szene → poster.png (neben dem Skript)
ffmpeg -y -i poster.png -quality 82 poster.webp
```

`tools/verify.js` fährt die Playwright-Prüfung (Desktop/Mobile/Reduced-Motion/No-JS,
Konsole, externe Requests). Pfade in beiden Skripten zeigen auf das Repo-Root.

## Noch offen (beim Website-Ausbau)

- Markenname final entscheiden (FIRST = Platzhalter), echte Telefonnummer
- Restliche Sektionen gemäß 7-Level-Blueprint, Rechts-Check vor Deploy
