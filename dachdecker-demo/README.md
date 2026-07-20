# Dachdecker-Demo — 3D-Dachbau-Hero (Prototyp)

Standalone-Hero für eine spätere Dachdecker-Demo-Website („FIRST Bedachungen", fiktiv, Arbeitstitel).
Beim Laden baut sich das Dach einmal auf (Pfetten → Sparren → Lattung → Ziegel → First),
der Bauphasen-Streifen unten läuft synchron mit. Danach: dezente Kamera-Drift + Maus-Parallaxe.

- **Alles self-hosted**: Three.js in `vendor/`, Fonts in `fonts/`, 0 externe Requests (DSGVO).
- **Fallbacks**: kein WebGL / kein JS → `poster.webp`; `prefers-reduced-motion` → sofort Endbild, keine Drift.
- **Debug**: `?finish=1` an die URL hängen springt direkt zum fertigen Dach.

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
