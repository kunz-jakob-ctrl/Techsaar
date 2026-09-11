/* =========================================================================
   SBS BAU — Bauzeitenplan (Vorschau)
   Zeitgesteuert statt scrollgebunden: Sobald die Sektion sichtbar wird, läuft
   ein Fortschritt t (0..1) über etwa 6,5 Sekunden. t ist die laufende Woche
   geteilt durch die Gesamtdauer. Aus t folgt alles andere: Balkenfüllung,
   Bauleiter-Linie, Wochen-Cursor, Statuszeile, Bautagebuch-Punkte.
   Kein Scroll-Pinning, kein zusätzlicher Scrollweg.

   Ohne JavaScript oder bei prefers-reduced-motion steht sofort der fertige Plan
   (Klasse .ohne-js bleibt bzw. wird gesetzt, CSS zeigt den Endzustand).

   Prüfhilfe: ?plan=0.6 friert den Plan auf diesem Stand ein (Screenshots).
   ========================================================================= */
(function () {
  "use strict";

  var huelle = document.getElementById("bauzeitenplan");
  if (!huelle) return;

  var zeilen = Array.prototype.slice.call(huelle.querySelectorAll(".plan-zeilen li"));
  var statusWoche = document.getElementById("plan-woche");
  var statusText = document.getElementById("plan-gewerke");
  var uebergabe = document.getElementById("plan-uebergabe");
  var tagebuch = document.getElementById("plan-tagebuch");
  var nochmal = document.getElementById("plan-nochmal");
  var WOCHEN = parseInt(huelle.getAttribute("data-wochen"), 10) || 28;
  var DAUER = 6500;          // ms für den ganzen Plan
  var VORLAUF = 350;         // kurze Ruhe, bevor der erste Balken wächst
  var ruhig = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function klemm(v) { return v < 0 ? 0 : v > 1 ? 1 : v; }

  /* Bautagebuch-Punkte: einer je Woche, werden nacheinander sichtbar */
  var punkte = [];
  if (tagebuch) {
    for (var w = 1; w <= WOCHEN; w++) {
      var p = document.createElement("i");
      p.style.setProperty("--w", w);
      tagebuch.appendChild(p);
      punkte.push(p);
    }
  }

  /* ------------------------------------------------------------------ */
  /* Zustand allein aus t                                                */
  /* ------------------------------------------------------------------ */
  function setzen(t) {
    t = klemm(t);
    var woche = t * WOCHEN;                   // laufende Woche als Bruch
    huelle.style.setProperty("--t", t.toFixed(4));

    var aktive = [];
    zeilen.forEach(function (li) {
      var von = parseFloat(li.getAttribute("data-von"));
      var bis = parseFloat(li.getAttribute("data-bis"));
      var f = klemm((woche - (von - 1)) / (bis - von + 1));
      li.style.setProperty("--fuell", f.toFixed(4));
      var laeuft = f > 0 && f < 1;
      li.classList.toggle("aktiv", laeuft);
      li.classList.toggle("fertig", f >= 1);
      if (laeuft) aktive.push(li.getAttribute("data-kurz") || li.querySelector(".gewerk").textContent.trim());
    });

    punkte.forEach(function (p, i) { p.classList.toggle("da", woche >= i + 1); });

    var fertig = t >= 1;
    huelle.classList.toggle("fertig", fertig);
    if (uebergabe) uebergabe.classList.toggle("da", fertig);

    if (statusWoche) statusWoche.textContent = "Woche " + Math.min(WOCHEN, Math.max(1, Math.ceil(woche))) + " von " + WOCHEN;
    if (statusText) {
      statusText.textContent = fertig ? "Übergabe. Abnahmeprotokoll, Schlüssel, Gewährleistung."
        : aktive.length ? aktive.join(" · ")
        : "Bauzeitenplan steht, Gewerke sind terminiert.";
    }
  }

  /* ------------------------------------------------------------------ */
  /* Abspielen                                                           */
  /* ------------------------------------------------------------------ */
  var laeuft = false;
  function abspielen() {
    if (laeuft) return;
    laeuft = true;
    if (nochmal) nochmal.classList.remove("sichtbar");
    var start = performance.now() + VORLAUF;
    setzen(0);
    (function schritt(jetzt) {
      var p = klemm((jetzt - start) / DAUER);
      // gleichmäßig wie ein echter Plan, nur am Ende ein kurzes Ausrollen
      var e = p < .85 ? p * (1 / .85) * .92 : .92 + .08 * (1 - Math.pow(1 - (p - .85) / .15, 2));
      setzen(klemm(e));
      if (p < 1) { requestAnimationFrame(schritt); return; }
      setzen(1);
      laeuft = false;
      if (nochmal) nochmal.classList.add("sichtbar");
    })(performance.now());
  }

  /* ------------------------------------------------------------------ */
  /* Anbindung                                                           */
  /* ------------------------------------------------------------------ */
  // Erklärung je Gewerk: auf Touch-Geräten per Antippen auf- und zuklappen.
  // aria-expanded läuft synchron zur Klasse .offen (Zeilen sind role="button").
  function alleSchliessen() {
    zeilen.forEach(function (x) {
      x.classList.remove("offen");
      x.setAttribute("aria-expanded", "false");
    });
  }
  zeilen.forEach(function (li) {
    li.addEventListener("click", function () {
      var offen = li.classList.contains("offen");
      alleSchliessen();
      if (!offen) {
        li.classList.add("offen");
        li.setAttribute("aria-expanded", "true");
      }
    });
    li.addEventListener("keydown", function (e) {
      if (e.key === "Enter" || e.key === " ") { e.preventDefault(); li.click(); }
    });
  });
  document.addEventListener("click", function (e) {
    if (!e.target.closest(".plan-zeilen li")) alleSchliessen();
  });

  // Prüfhilfe für Screenshots
  var pruef = new URLSearchParams(location.search).get("plan");
  if (pruef !== null) {
    huelle.classList.remove("ohne-js");
    setzen(parseFloat(pruef) || 0);
    return;
  }

  if (ruhig || !("IntersectionObserver" in window)) {
    // fertiger Plan, keine Bewegung
    huelle.classList.remove("ohne-js");
    setzen(1);
    return;
  }

  huelle.classList.remove("ohne-js");
  setzen(0);

  var gestartet = false;
  function starten() {
    if (gestartet) return;
    gestartet = true;
    beobachter.disconnect();
    window.removeEventListener("scroll", pruefen);
    abspielen();
  }

  var beobachter = new IntersectionObserver(function (eintraege) {
    eintraege.forEach(function (e) { if (e.isIntersecting) starten(); });
  }, { threshold: 0.35 });
  beobachter.observe(huelle);

  // Rückfallebene: Manche eingebetteten Browser liefern den Observer erst mit
  // dem nächsten Bild oder gar nicht. Deshalb zusätzlich beim Scrollen die
  // Lage selbst prüfen: Sobald mindestens ein Drittel der Sektion im Bild ist,
  // geht es los.
  var offen = false;
  function messen() {
    offen = false;
    if (gestartet) return;
    var r = huelle.getBoundingClientRect();
    var hoehe = window.innerHeight || document.documentElement.clientHeight;
    var sichtbar = Math.min(r.bottom, hoehe) - Math.max(r.top, 0);
    if (sichtbar > 0 && sichtbar / Math.min(r.height, hoehe) >= 0.35) starten();
  }
  function pruefen() { if (!offen) { offen = true; requestAnimationFrame(messen); } }
  window.addEventListener("scroll", pruefen, { passive: true });
  window.addEventListener("resize", pruefen);
  setTimeout(messen, 400);        // falls die Seite schon mitten in der Sektion öffnet

  if (nochmal) nochmal.addEventListener("click", abspielen);
})();
