/* Hinweis-Leiste: reine Datumslogik, ohne DOM.
   Liegt in einer eigenen Datei, damit sie sich ohne Browser testen laesst
   (build/hinweise.test.cjs). Im Browser haengt sie als window.Hinweise,
   in Node wird sie per require geladen.
   Datumsvergleiche laufen als Text im Format JJJJ-MM-TT - das sortiert
   lexikalisch richtig und umgeht Zeitzonen-Fallen von Date-Objekten. */
(function (root) {
  const ISO = /^\d{4}-\d{2}-\d{2}$/;

  function tagIso(d) {
    const z = n => String(n).padStart(2, "0");
    return d.getFullYear() + "-" + z(d.getMonth() + 1) + "-" + z(d.getDate());
  }

  function alsTag(heute) {
    return typeof heute === "string" ? heute : tagIso(heute);
  }

  /* Kaputte Eintraege fallen still raus, statt die Seite zu brechen: ein
     Tippfehler im Datum soll schlimmstenfalls einen Hinweis kosten. */
  function gueltig(h) {
    return !!h
      && (h.art === "event" || h.art === "geschlossen")
      && ISO.test(h.von) && ISO.test(h.bis) && h.von <= h.bis
      && typeof h.text === "string" && h.text.trim() !== "";
  }

  /* Genau einer gewinnt: Schliessungen vor Events (wer vor verschlossener
     Tuer steht, aergert sich mehr), sonst der, der am fruehesten endet. */
  function aktiverHinweis(liste, heute) {
    const t = alsTag(heute);
    const aktiv = (liste || []).filter(gueltig).filter(h => h.von <= t && t <= h.bis);
    aktiv.sort((a, b) => {
      if (a.art !== b.art) return a.art === "geschlossen" ? -1 : 1;
      return a.bis < b.bis ? -1 : a.bis > b.bis ? 1 : 0;
    });
    return aktiv[0] || null;
  }

  /* Anzeige- und Schliesszeitraum koennen auseinanderfallen: Eine Schliessung
     wird oft Tage vorher angekuendigt. Dafuer gibt es "zu"; fehlt es, gilt
     von..bis auch als Schliesszeitraum. */
  function istGeschlossen(liste, heute) {
    const t = alsTag(heute);
    return (liste || []).filter(gueltig).some(h => {
      if (h.art !== "geschlossen") return false;
      const z = Array.isArray(h.zu) && h.zu.length === 2 && ISO.test(h.zu[0]) && ISO.test(h.zu[1]) && h.zu[0] <= h.zu[1]
        ? h.zu : [h.von, h.bis];
      return z[0] <= t && t <= z[1];
    });
  }

  /* Nur Sprungmarken und https - alles andere (javascript:, http:) faellt weg. */
  function sichererLink(link) {
    if (typeof link !== "string") return null;
    return /^#[\w-]+$/.test(link) || /^https:\/\/[^\s"'<>]+$/.test(link) ? link : null;
  }

  const api = { tagIso, aktiverHinweis, istGeschlossen, sichererLink };
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  else root.Hinweise = api;
})(this);
