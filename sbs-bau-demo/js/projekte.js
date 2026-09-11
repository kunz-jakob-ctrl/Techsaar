/* =========================================================================
   SBS BAU — Projektseite
   Baut die Kacheln aus window.PROJEKTE, ergänzt Projekte, die in der
   Projektverwaltung (intern.html) angelegt wurden, und öffnet je Projekt
   ein Detailfenster mit Vorher/Nachher-Regler.
   ========================================================================= */
(function () {
  "use strict";

  var raster = document.getElementById("projekt-raster");
  var filter = document.getElementById("filter");
  var fenster = document.getElementById("fenster");
  if (!raster || !window.PROJEKTE) return;

  var SPEICHER = "sbs-projekte";

  /* Projekte aus der Projektverwaltung dazunehmen (nur dieser Browser) */
  function eigene() {
    try {
      var roh = localStorage.getItem(SPEICHER);
      if (!roh) return [];
      return JSON.parse(roh).filter(function (p) { return p.veroeffentlicht; });
    } catch (e) { return []; }
  }

  var alle = eigene().concat(window.PROJEKTE);

  /* ---------- Kacheln ---------- */
  function kachel(p) {
    var a = document.createElement("button");
    a.type = "button";
    a.className = "projekt";
    a.setAttribute("data-kategorie", p.kategorie);
    a.setAttribute("data-id", p.id);
    a.innerHTML =
      '<div class="projekt-bild">' +
        '<span class="projekt-marke">' + text(p.kategorie) + (p.eigen ? " · neu" : "") + '</span>' +
        '<img src="' + text(p.nachher) + '" alt="' + text(p.titel) + '" loading="lazy">' +
      '</div>' +
      '<div class="projekt-kopf"><h3>' + text(p.titel) + '</h3>' +
      '<span class="projekt-ort">' + text(p.ort) + '</span></div>' +
      '<div class="projekt-daten">' +
        '<span>Fläche <b>' + text(p.flaeche) + '</b></span>' +
        '<span>Bauzeit <b>' + text(p.bauzeit) + '</b></span>' +
        '<span>Gewerke <b>' + text(p.gewerke) + '</b></span>' +
      '</div>';
    a.addEventListener("click", function () { oeffnen(p); });
    return a;
  }

  function text(s) {
    return String(s == null ? "" : s)
      .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  }

  alle.forEach(function (p) { raster.appendChild(kachel(p)); });

  /* ---------- Filter ---------- */
  if (filter) {
    var kategorien = [];
    alle.forEach(function (p) {
      if (kategorien.indexOf(p.kategorie) === -1) kategorien.push(p.kategorie);
    });
    kategorien.forEach(function (k) {
      var b = document.createElement("button");
      b.type = "button";
      b.textContent = k;
      b.setAttribute("aria-pressed", "false");
      b.setAttribute("data-kategorie", k);
      filter.appendChild(b);
    });
    filter.addEventListener("click", function (e) {
      var b = e.target.closest("button");
      if (!b) return;
      var k = b.getAttribute("data-kategorie");
      filter.querySelectorAll("button").forEach(function (x) {
        x.setAttribute("aria-pressed", x === b ? "true" : "false");
      });
      raster.querySelectorAll(".projekt").forEach(function (karte) {
        karte.hidden = !!k && karte.getAttribute("data-kategorie") !== k;
      });
    });
  }

  /* ---------- Detailfenster ---------- */
  var vorherAktiv = null;

  function oeffnen(p) {
    if (!fenster) return;
    var blatt = fenster.querySelector(".fenster-blatt-inhalt");
    blatt.innerHTML =
      '<span class="marke">' + text(p.kategorie) + " · " + text(p.jahr) + '</span>' +
      '<h2 style="margin-top:16px">' + text(p.titel) + '</h2>' +
      '<p class="klein" style="margin-top:6px">' + text(p.ort) + '</p>' +
      '<div class="vn" data-vn style="margin-top:26px">' +
        '<img class="vorher" src="' + text(p.vorher) + '" alt="Bestand vor der Sanierung">' +
        '<img class="nachher" src="' + text(p.nachher) + '" alt="Zustand bei der Übergabe">' +
        '<span class="vn-etikett links">Bestand</span>' +
        '<span class="vn-etikett rechts">Übergabe</span>' +
        '<span class="vn-griff" aria-hidden="true"></span>' +
        '<input type="range" min="0" max="100" value="50" aria-label="Vergleich verschieben">' +
      '</div>' +
      '<dl class="fenster-daten">' +
        '<div><dt>Fläche</dt><dd>' + text(p.flaeche) + '</dd></div>' +
        '<div><dt>Bauzeit</dt><dd>' + text(p.bauzeit) + '</dd></div>' +
        '<div><dt>Gewerke</dt><dd>' + text(p.gewerke) + '</dd></div>' +
        '<div><dt>Umfang</dt><dd style="font-size:1.05rem;font-family:var(--sans)">' + text(p.umfang) + '</dd></div>' +
      '</dl>' +
      '<p class="lead">' + text(p.text) + '</p>' +
      (p.leistungen && p.leistungen.length
        ? '<h3 style="margin:30px 0 14px">Leistungen in diesem Projekt</h3>' +
          '<ul class="mono-liste">' + p.leistungen.map(function (l, i) {
            return '<li><b>' + String(i + 1).padStart(2, "0") + '</b><span>' + text(l) + '</span></li>';
          }).join("") + '</ul>'
        : "") +
      (p.galerie && p.galerie.length
        ? '<div class="galerie">' + p.galerie.map(function (g) {
            return '<img src="' + text(g) + '" alt="Bild aus dem Projekt ' + text(p.titel) + '" loading="lazy">';
          }).join("") + '</div>'
        : "") +
      '<div class="schalt" style="margin-top:32px">' +
        '<a class="btn" href="anfrage.html">Ähnliches Projekt anfragen <span class="pfeil">→</span></a>' +
      '</div>';

    fenster.classList.add("offen");
    document.body.style.overflow = "hidden";
    vorherAktiv = document.activeElement;
    fenster.querySelector(".fenster-zu").focus();
    reglerBinden(blatt);
  }

  function schliessen() {
    if (!fenster) return;
    fenster.classList.remove("offen");
    document.body.style.overflow = "";
    if (vorherAktiv && vorherAktiv.focus) vorherAktiv.focus();
  }

  /* Der Regler wird nachträglich eingebaut, deshalb hier noch einmal binden */
  function reglerBinden(bereich) {
    bereich.querySelectorAll("[data-vn]").forEach(function (box) {
      var regler = box.querySelector('input[type="range"]');
      if (!regler) return;
      function setzen() { box.style.setProperty("--pos", regler.value + "%"); }
      regler.addEventListener("input", setzen);
      function ausEreignis(e) {
        var r = box.getBoundingClientRect();
        regler.value = Math.max(0, Math.min(100, ((e.clientX - r.left) / r.width) * 100));
        setzen();
      }
      // Wie in js/site.js: Zeiger einfangen, damit das Ziehen auf dem Handy
      // auch dann weiterläuft, wenn der Finger den Kasten verlässt.
      var zieht = false;
      box.addEventListener("pointerdown", function (e) {
        zieht = true;
        if (box.setPointerCapture) { try { box.setPointerCapture(e.pointerId); } catch (x) {} }
        ausEreignis(e);
      });
      box.addEventListener("pointermove", function (e) {
        if (!zieht) return;
        e.preventDefault();
        ausEreignis(e);
      });
      ["pointerup", "pointercancel"].forEach(function (n) {
        box.addEventListener(n, function () { zieht = false; });
      });
      window.addEventListener("pointerup", function () { zieht = false; });
      setzen();
    });
  }

  if (fenster) {
    fenster.addEventListener("click", function (e) {
      if (e.target === fenster || e.target.closest(".fenster-zu")) schliessen();
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && fenster.classList.contains("offen")) schliessen();
    });
  }

  /* Direktaufruf über #p3 öffnet das passende Projekt */
  if (location.hash) {
    var treffer = alle.filter(function (p) { return "#" + p.id === location.hash; })[0];
    if (treffer) setTimeout(function () { oeffnen(treffer); }, 260);
  }
})();
