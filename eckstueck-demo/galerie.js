/* Galerie-Rotation: reine Auswahl-Logik, ohne DOM.
   Liegt wie hinweise.js in einer eigenen Datei, damit sie sich ohne Browser
   testen laesst (build/galerie.test.cjs). Im Browser haengt sie als
   window.Galerie, in Node wird sie per require geladen.

   Alle 14 Tage zeigt die Galerie die naechsten Bilder aus CONFIG.galerie,
   gezaehlt ab einem festen Montag - so wechselt sie immer montags, und alle
   Besucher sehen im selben Zeitraum dasselbe. Kein Zufall pro Besuch: sonst
   koennte niemand sagen, was gerade auf der Seite steht. */
(function (root) {
  const START = Date.UTC(2026, 10, 9);       // Mo 09.11.2026, Beginn Zeitraum 0
  const TAG = 86400000;

  /* Kalendertag als UTC-Mitternacht - Sommerzeit-Wechsel verschieben so
     nichts um eine Stunde und damit keinen Wechsel auf den Vortag. */
  function tagesWert(heute) {
    if (typeof heute === "string") {
      const [j, m, t] = heute.split("-").map(Number);
      return Date.UTC(j, m - 1, t);
    }
    return Date.UTC(heute.getFullYear(), heute.getMonth(), heute.getDate());
  }

  function zeitraum(heute) {
    return Math.floor((tagesWert(heute) - START) / (14 * TAG));
  }

  /* Je Zeitraum ruecken wir um "anzahl" weiter, also zeigt der naechste
     Zeitraum lauter neue Bilder. Die Reihenfolge im Pool entscheidet, was
     zusammen erscheint - aehnliche Motive dort weit auseinander legen. */
  function auswahl(pool, heute, anzahl) {
    const n = (pool || []).length;
    if (n === 0) return [];
    const k = Math.min(anzahl, n);
    const start = (((zeitraum(heute) * k) % n) + n) % n;
    const out = [];
    for (let i = 0; i < k; i++) out.push(pool[(start + i) % n]);
    return out;
  }

  const api = { zeitraum, auswahl };
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  else root.Galerie = api;
})(this);
