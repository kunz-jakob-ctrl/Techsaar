/* =========================================================================
   SBS BAU — Projektverwaltung (Vorschau)
   Zeigt, wie SBS Bau eigene Projekte anlegt: Eckdaten erfassen, Fotos
   hinzufügen, je Foto Bestand oder Übergabe festlegen, veröffentlichen.

   Bewusst ohne Server: Die Bilder werden im Browser auf 1400 px verkleinert
   und zusammen mit den Eckdaten in localStorage abgelegt. Die Projektseite
   liest denselben Schlüssel — deshalb erscheint ein veröffentlichtes Projekt
   sofort unter "Projekte". Nichts verlässt den Rechner.
   ========================================================================= */
(function () {
  "use strict";

  var SPEICHER = "sbs-projekte";
  var anmeldung = document.getElementById("anmeldung");
  var bereich = document.getElementById("arbeitsbereich");
  if (!anmeldung || !bereich) return;

  var felder = ["titel", "ort", "kategorie", "jahr", "flaeche", "bauzeit", "gewerke", "umfang", "beschreibung"];
  var projekte = laden();
  var aktuell = null;                     // aktuell bearbeitetes Projekt

  /* ---------------------------- Speicher ---------------------------- */
  function laden() {
    try { return JSON.parse(localStorage.getItem(SPEICHER) || "[]"); }
    catch (e) { return []; }
  }
  function sichern() {
    try {
      localStorage.setItem(SPEICHER, JSON.stringify(projekte));
      return true;
    } catch (e) {
      melden("Der Browserspeicher ist voll. Bitte ein Projekt löschen oder weniger Fotos je Projekt.");
      return false;
    }
  }

  /* ---------------------------- Meldung ----------------------------- */
  var meldungEl = document.getElementById("meldung");
  var meldungZeit;
  function melden(text) {
    if (!meldungEl) return;
    meldungEl.textContent = text;
    meldungEl.classList.add("da");
    clearTimeout(meldungZeit);
    meldungZeit = setTimeout(function () { meldungEl.classList.remove("da"); }, 4200);
  }

  /* --------------------------- Anmeldung ---------------------------- */
  document.getElementById("anmelde-form").addEventListener("submit", function (e) {
    e.preventDefault();
    anmeldung.hidden = true;
    bereich.hidden = false;
    listeZeichnen();
    neuesProjekt();
  });
  document.getElementById("abmelden").addEventListener("click", function () {
    bereich.hidden = true;
    anmeldung.hidden = false;
    window.scrollTo(0, 0);
  });

  /* --------------------------- Projektliste -------------------------- */
  var listeEl = document.getElementById("liste");
  var anzahlEl = document.getElementById("anzahl");

  function listeZeichnen() {
    listeEl.innerHTML = "";
    anzahlEl.textContent = projekte.length === 1 ? "1 Objekt" : projekte.length + " Objekte";
    if (!projekte.length) {
      var leer = document.createElement("li");
      leer.className = "klein";
      leer.style.padding = "12px 14px";
      leer.textContent = "Noch kein eigenes Projekt angelegt.";
      listeEl.appendChild(leer);
      return;
    }
    projekte.forEach(function (p) {
      var li = document.createElement("li");
      var b = document.createElement("button");
      b.type = "button";
      if (aktuell && p.id === aktuell.id) b.setAttribute("aria-current", "true");
      b.innerHTML = '<span class="titel"></span><span class="meta"></span>';
      b.querySelector(".titel").textContent = p.titel || "Ohne Titel";
      b.querySelector(".meta").textContent =
        (p.ort || "ohne Ort") + " · " + (p.veroeffentlicht ? "veröffentlicht" : "Entwurf") +
        " · " + (p.bilder ? p.bilder.length : 0) + " Fotos";
      b.addEventListener("click", function () { oeffnen(p.id); });
      li.appendChild(b);
      listeEl.appendChild(li);
    });
  }

  /* --------------------------- Formular ------------------------------ */
  function neuesProjekt() {
    aktuell = {
      id: "eigen-" + Date.now(),
      eigen: true,
      veroeffentlicht: false,
      kategorie: "Komplettsanierung",
      bilder: []
    };
    formularFuellen();
    document.getElementById("karten-titel").textContent = "Neues Projekt";
    listeZeichnen();
  }

  function oeffnen(id) {
    var p = projekte.filter(function (x) { return x.id === id; })[0];
    if (!p) return;
    aktuell = p;
    if (!aktuell.bilder) aktuell.bilder = [];
    formularFuellen();
    document.getElementById("karten-titel").textContent = "Projekt bearbeiten";
    listeZeichnen();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function formularFuellen() {
    felder.forEach(function (f) {
      var el = document.getElementById(f);
      if (el) el.value = aktuell[f] || (f === "kategorie" ? "Komplettsanierung" : "");
    });
    bilderZeichnen();
  }

  function formularLesen() {
    felder.forEach(function (f) {
      var el = document.getElementById(f);
      if (el) aktuell[f] = el.value.trim();
    });
    // Was die Projektseite erwartet
    aktuell.text = aktuell.beschreibung;
    var vorher = aktuell.bilder.filter(function (b) { return b.rolle === "vorher"; })[0];
    var nachher = aktuell.bilder.filter(function (b) { return b.rolle === "nachher"; })[0];
    aktuell.vorher = vorher ? vorher.daten : (aktuell.bilder[0] ? aktuell.bilder[0].daten : "img/p1-vorher.jpg");
    aktuell.nachher = nachher ? nachher.daten : (aktuell.bilder[0] ? aktuell.bilder[0].daten : "img/p1-nachher.jpg");
    aktuell.galerie = aktuell.bilder.map(function (b) { return b.daten; });
  }

  /* ---------------------------- Fotos -------------------------------- */
  var ablage = document.getElementById("ablage");
  var dateiFeld = document.getElementById("dateien");
  var bilderEl = document.getElementById("bilder");

  ablage.addEventListener("click", function () { dateiFeld.click(); });
  ablage.addEventListener("keydown", function (e) {
    if (e.key === "Enter" || e.key === " ") { e.preventDefault(); dateiFeld.click(); }
  });
  dateiFeld.addEventListener("change", function () { dateienAufnehmen(dateiFeld.files); });

  ["dragenter", "dragover"].forEach(function (n) {
    ablage.addEventListener(n, function (e) { e.preventDefault(); ablage.classList.add("bereit"); });
  });
  ["dragleave", "drop"].forEach(function (n) {
    ablage.addEventListener(n, function (e) { e.preventDefault(); ablage.classList.remove("bereit"); });
  });
  ablage.addEventListener("drop", function (e) {
    if (e.dataTransfer && e.dataTransfer.files) dateienAufnehmen(e.dataTransfer.files);
  });

  function dateienAufnehmen(dateien) {
    var liste = Array.prototype.slice.call(dateien).filter(function (d) {
      return d.type.indexOf("image/") === 0;
    });
    if (!liste.length) return;
    var offen = liste.length;
    liste.forEach(function (datei) {
      verkleinern(datei, function (daten) {
        aktuell.bilder.push({
          name: datei.name,
          daten: daten,
          rolle: aktuell.bilder.length === 0 ? "vorher" : (aktuell.bilder.length === 1 ? "nachher" : "")
        });
        if (--offen === 0) {
          bilderZeichnen();
          melden(liste.length === 1 ? "Foto hinzugefügt." : liste.length + " Fotos hinzugefügt.");
        }
      });
    });
  }

  /* Bild im Browser auf 1400 px verkleinern — sonst platzt der Speicher */
  function verkleinern(datei, fertig) {
    var leser = new FileReader();
    leser.onload = function () {
      var bild = new Image();
      bild.onload = function () {
        var max = 1400;
        var f = Math.min(1, max / Math.max(bild.width, bild.height));
        var flaeche = document.createElement("canvas");
        flaeche.width = Math.round(bild.width * f);
        flaeche.height = Math.round(bild.height * f);
        flaeche.getContext("2d").drawImage(bild, 0, 0, flaeche.width, flaeche.height);
        fertig(flaeche.toDataURL("image/jpeg", 0.72));
      };
      bild.onerror = function () { fertig(leser.result); };
      bild.src = leser.result;
    };
    leser.readAsDataURL(datei);
  }

  function bilderZeichnen() {
    bilderEl.innerHTML = "";
    aktuell.bilder.forEach(function (b, i) {
      var kasten = document.createElement("div");
      kasten.className = "bild";
      var img = document.createElement("img");
      img.src = b.daten; img.alt = b.name || "Projektfoto";
      kasten.appendChild(img);

      if (b.rolle) {
        var marke = document.createElement("span");
        marke.className = "bild-marke";
        marke.textContent = b.rolle === "vorher" ? "Bestand" : "Übergabe";
        kasten.appendChild(marke);
      }

      var leiste = document.createElement("div");
      leiste.className = "bild-leiste";
      [["vorher", "Bestand"], ["nachher", "Übergabe"], ["weg", "Entfernen"]].forEach(function (paar) {
        var knopf = document.createElement("button");
        knopf.type = "button";
        knopf.textContent = paar[1];
        if (paar[0] !== "weg") knopf.setAttribute("aria-pressed", b.rolle === paar[0] ? "true" : "false");
        knopf.addEventListener("click", function () {
          if (paar[0] === "weg") {
            aktuell.bilder.splice(i, 1);
          } else {
            // Rolle ist eindeutig: sie wird anderen Bildern abgenommen
            aktuell.bilder.forEach(function (x) { if (x.rolle === paar[0]) x.rolle = ""; });
            b.rolle = b.rolle === paar[0] ? "" : paar[0];
          }
          bilderZeichnen();
        });
        leiste.appendChild(knopf);
      });
      kasten.appendChild(leiste);
      bilderEl.appendChild(kasten);
    });
  }

  /* --------------------------- Aktionen ------------------------------ */
  function ablegen() {
    formularLesen();
    if (!aktuell.titel) { melden("Bitte zuerst einen Projekttitel eintragen."); return false; }
    var vorhanden = projekte.filter(function (x) { return x.id === aktuell.id; })[0];
    if (!vorhanden) projekte.unshift(aktuell);
    return sichern();
  }

  document.getElementById("speichern").addEventListener("click", function () {
    if (!ablegen()) return;
    listeZeichnen();
    melden("Entwurf gespeichert.");
  });

  document.getElementById("veroeffentlichen").addEventListener("click", function () {
    aktuell.veroeffentlicht = true;
    if (!ablegen()) { aktuell.veroeffentlicht = false; return; }
    listeZeichnen();
    melden("Projekt ist auf der Website. Unter „Projekte“ nachsehen.");
  });

  document.getElementById("loeschen").addEventListener("click", function () {
    projekte = projekte.filter(function (x) { return x.id !== aktuell.id; });
    sichern();
    neuesProjekt();
    melden("Projekt gelöscht.");
  });

  document.getElementById("neu").addEventListener("click", neuesProjekt);

  /* Prüfhilfe: ?offen=1 überspringt die Anmeldung (nur für Abnahme) */
  if (new URLSearchParams(location.search).has("offen")) {
    anmeldung.hidden = true;
    bereich.hidden = false;
    listeZeichnen();
    neuesProjekt();
  }
})();
