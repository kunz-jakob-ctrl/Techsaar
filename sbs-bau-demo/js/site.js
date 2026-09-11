/* =========================================================================
   SBS BAU — gemeinsame Seitenlogik
   Reihenfolge: CONFIG einsetzen, Kopfzeile, Menü, Einblendungen, Zähler,
   Vorher/Nachher-Regler, Bildvorschau der Leistungsliste.
   Alles ohne Bibliothek, damit die Seite auch ohne Netz vollständig läuft.
   ========================================================================= */
(function () {
  "use strict";

  var sanft = !window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- CONFIG in die Seite schreiben ---------- */
  function konfigEinsetzen() {
    if (typeof CONFIG !== "object") return;
    document.querySelectorAll("[data-cfg]").forEach(function (el) {
      var wert = CONFIG[el.getAttribute("data-cfg")];
      if (wert !== undefined && wert !== null) el.textContent = wert;
    });
    document.querySelectorAll("[data-cfg-href]").forEach(function (el) {
      var art = el.getAttribute("data-cfg-href");
      if (art === "tel" && CONFIG.telefon) el.href = "tel:" + CONFIG.telefon.replace(/[^+\d]/g, "");
      if (art === "mail" && CONFIG.mail) el.href = "mailto:" + CONFIG.mail;
    });
  }

  /* ---------- Kopfzeile: über dem Hero transparent, danach hell ---------- */
  function kopfzeile() {
    var kopf = document.getElementById("kopf");
    var balken = document.getElementById("fortschritt");
    if (!kopf && !balken) return;
    var hero = document.querySelector(".hero, .seitenkopf");
    var offen = false;

    function messen() {
      // Umschaltpunkt: kurz bevor der Hero aus dem Bild läuft
      var grenze = hero ? hero.offsetTop + hero.offsetHeight - 120 : 24;
      var y = window.scrollY || document.documentElement.scrollTop;
      if (kopf) kopf.classList.toggle("fest", y > grenze);
      if (balken) {
        var hoehe = document.documentElement.scrollHeight - window.innerHeight;
        balken.style.width = (hoehe > 0 ? (y / hoehe) * 100 : 0) + "%";
      }
      offen = false;
    }
    function anstossen() {
      if (offen) return;
      offen = true;
      requestAnimationFrame(messen);
    }
    window.addEventListener("scroll", anstossen, { passive: true });
    window.addEventListener("resize", anstossen);
    messen();
  }

  /* ---------- Vollbild-Menü ---------- */
  function menue() {
    var schalter = document.getElementById("menue-schalter");
    var feld = document.getElementById("menue");
    if (!schalter || !feld) return;

    function setzen(auf) {
      document.body.classList.toggle("menue-offen", auf);
      document.body.style.overflow = auf ? "hidden" : "";
      schalter.setAttribute("aria-expanded", auf ? "true" : "false");
      schalter.setAttribute("aria-label", auf ? "Menü schließen" : "Menü öffnen");
      // Geschlossen ist das Menü nur per clip-path unsichtbar; inert nimmt die Links
      // zusätzlich aus Tab-Reihenfolge und Screenreader.
      if (auf) feld.removeAttribute("inert"); else feld.setAttribute("inert", "");
      // Verzögertes Einlaufen der Zeilen
      feld.querySelectorAll("a").forEach(function (a, i) {
        a.style.transitionDelay = auf ? (0.09 + i * 0.055).toFixed(2) + "s" : "0s";
      });
    }
    feld.setAttribute("inert", "");   // Startzustand: geschlossen
    schalter.addEventListener("click", function () {
      setzen(!document.body.classList.contains("menue-offen"));
    });
    feld.addEventListener("click", function (e) {
      if (e.target.closest("a")) setzen(false);
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && document.body.classList.contains("menue-offen")) setzen(false);
    });
  }

  /* ---------- Einblenden beim Scrollen ---------- */
  function einblenden() {
    var teile = document.querySelectorAll(".auf");
    if (!teile.length) return;
    if (!sanft || !("IntersectionObserver" in window)) {
      teile.forEach(function (el) { el.classList.add("da"); });
      return;
    }
    var beobachter = new IntersectionObserver(function (eintraege) {
      eintraege.forEach(function (e) {
        if (!e.isIntersecting) return;
        e.target.classList.add("da");
        beobachter.unobserve(e.target);
      });
    }, { rootMargin: "0px 0px -12% 0px", threshold: 0.08 });
    teile.forEach(function (el) { beobachter.observe(el); });
  }

  /* ---------- Zahlen hochzählen ---------- */
  function zaehler() {
    var felder = document.querySelectorAll("[data-zahl]");
    if (!felder.length) return;
    if (!sanft || !("IntersectionObserver" in window)) return;

    var beobachter = new IntersectionObserver(function (eintraege) {
      eintraege.forEach(function (e) {
        if (!e.isIntersecting) return;
        beobachter.unobserve(e.target);
        var el = e.target;
        var ziel = parseFloat(el.getAttribute("data-zahl")) || 0;
        var suffix = el.getAttribute("data-suffix") || "";
        var start = performance.now();
        var dauer = 1100;
        (function lauf(jetzt) {
          var p = Math.min(1, (jetzt - start) / dauer);
          var e2 = 1 - Math.pow(1 - p, 3);           // sanftes Auslaufen
          el.textContent = Math.round(ziel * e2) + suffix;
          if (p < 1) requestAnimationFrame(lauf);
        })(start);
      });
    }, { threshold: 0.5 });
    felder.forEach(function (el) { beobachter.observe(el); });
  }

  /* ---------- Vorher / Nachher ---------- */
  function vergleich() {
    document.querySelectorAll("[data-vn]").forEach(function (box) {
      var regler = box.querySelector('input[type="range"]');
      if (!regler) return;
      function setzen() { box.style.setProperty("--pos", regler.value + "%"); }
      regler.addEventListener("input", setzen);
      // Zeiger und Finger direkt auf die Position ziehen
      function ausEreignis(e) {
        var r = box.getBoundingClientRect();
        var x = (e.touches ? e.touches[0].clientX : e.clientX) - r.left;
        regler.value = Math.max(0, Math.min(100, (x / r.width) * 100));
        setzen();
      }
      // Zeiger einfangen: Auf dem Handy bekommt der Kasten sonst keine weiteren
      // Ereignisse, sobald der Finger seinen Rand verlässt.
      var zieht = false;
      box.addEventListener("pointerdown", function (e) {
        zieht = true;
        if (box.setPointerCapture) { try { box.setPointerCapture(e.pointerId); } catch (x) {} }
        ausEreignis(e);
      });
      box.addEventListener("pointermove", function (e) {
        if (!zieht) return;
        e.preventDefault();               // kein Textmarkieren beim Ziehen
        ausEreignis(e);
      });
      ["pointerup", "pointercancel"].forEach(function (n) {
        box.addEventListener(n, function () { zieht = false; });
      });
      window.addEventListener("pointerup", function () { zieht = false; });
      setzen();
    });
  }

  /* ---------- Bildvorschau der Leistungsliste (nur feiner Zeiger) ---------- */
  function leistungsVorschau() {
    var liste = document.getElementById("leistungsliste");
    var kasten = document.getElementById("leistung-vorschau");
    if (!liste || !kasten || !window.matchMedia("(pointer:fine)").matches || !sanft) return;
    var bild = kasten.querySelector("img");
    var zielX = 0, zielY = 0, x = 0, y = 0, laeuft = false;

    function schleife() {
      x += (zielX - x) * 0.16;
      y += (zielY - y) * 0.16;
      kasten.style.transform = "translate(" + x + "px," + y + "px) translate(-50%,-50%)" +
        (kasten.classList.contains("sichtbar") ? " scale(1)" : " scale(.92)");
      if (laeuft) requestAnimationFrame(schleife);
    }

    liste.querySelectorAll(".leistung").forEach(function (zeile) {
      zeile.addEventListener("mouseenter", function () {
        var quelle = zeile.getAttribute("data-bild");
        if (!quelle) return;
        if (bild.getAttribute("src") !== quelle) bild.src = quelle;
        kasten.classList.add("sichtbar");
        if (!laeuft) { laeuft = true; requestAnimationFrame(schleife); }
      });
      zeile.addEventListener("mouseleave", function () {
        kasten.classList.remove("sichtbar");
        setTimeout(function () {
          if (!kasten.classList.contains("sichtbar")) laeuft = false;
        }, 400);
      });
    });
    liste.addEventListener("mousemove", function (e) {
      zielX = e.clientX + 150;   // rechts neben dem Zeiger
      zielY = e.clientY;
      // am rechten Rand nach links kippen
      if (zielX + 150 > window.innerWidth) zielX = e.clientX - 150;
    });
  }

  /* ---------- Prüfhilfe: ?y=1800 springt hart an eine Scrollposition ----
     Nur für Abnahme-Screenshots. Ohne den Parameter passiert nichts.      */
  function pruefSprung() {
    var p = new URLSearchParams(location.search);
    // ?nur=leistungen blendet alle anderen Abschnitte aus (Einzelabnahme)
    var nur = p.get("nur");
    if (nur) {
      document.querySelectorAll("main > *").forEach(function (s) {
        if (s.id !== nur) s.style.display = "none";
      });
      var band = document.querySelector(".demo-band");
      if (band) band.style.display = "none";
      document.documentElement.style.setProperty("--band", "0px");
      // Einblendungen sofort abschließen, damit Standbilder vollständig sind
      document.querySelectorAll(".auf").forEach(function (e) {
        e.style.transition = "none"; e.classList.add("da");
      });
    }
    if (!p.has("y")) return;
    document.documentElement.style.scrollBehavior = "auto";
    var y = parseFloat(p.get("y")) || 0;
    window.scrollTo(0, y);
    setTimeout(function () { window.scrollTo(0, y); }, 60);
  }

  /* ---------- Start ---------- */
  function start() {
    konfigEinsetzen();
    kopfzeile();
    menue();
    einblenden();
    zaehler();
    vergleich();
    leistungsVorschau();
    pruefSprung();
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start);
  else start();
})();
