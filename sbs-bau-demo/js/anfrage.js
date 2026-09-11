/* =========================================================================
   SBS BAU — Projektanfrage
   Fünf Schritte mit laufendem Projektprofil. Zwei Kacheln und eine Auswahl
   führen bewusst in eine Sackgasse: kleine Einzelaufträge, Projektvolumen
   unter der Mindestgrenze und Objekte außerhalb des Einsatzgebiets.
   Es wird nichts gesendet und nichts gespeichert (Demo).
   ========================================================================= */
(function () {
  "use strict";

  var form = document.getElementById("anfrage-form");
  if (!form) return;

  var schritte = Array.prototype.slice.call(form.querySelectorAll(".schritt"));
  var zahlEl = document.getElementById("schritt-zahl");
  var spurEl = document.getElementById("schritt-spur");
  var leiste = document.getElementById("schrittleiste");
  var jaEl = document.getElementById("ergebnis-ja");
  var neinEl = document.getElementById("ergebnis-nein");
  var neinTitel = document.getElementById("nein-titel");
  var neinText = document.getElementById("nein-text");
  var flaecheEl = document.getElementById("flaeche");
  var flaecheWert = document.getElementById("flaeche-wert");

  var aktuell = 1;
  var antworten = {};

  /* ---------- Sackgassen-Texte ---------- */
  var SACKGASSE = {
    klein: {
      titel: "Dafür sind wir nicht der richtige Partner.",
      text: "<p class=\"lead\">Einzelne Reparaturen und Montagen nehmen wir nicht an. " +
        "Unsere Baustellen sind über Monate mit festen Gewerken terminiert; ein Termin " +
        "dazwischen kostet ein eingeplantes Team einen halben Tag — und den fehlt es dort, " +
        "wo seit Monaten geplant wurde.</p>"
    },
    volumen: {
      titel: "Unterhalb unserer Projektgröße.",
      text: "<p class=\"lead\">Unter 50.000 € Projektvolumen bekommen wir keinen Bauablauf " +
        "zusammen, der für Sie günstiger wäre als einzelne Fachbetriebe. Wir sagen das " +
        "lieber jetzt als nach vier Wochen Angebotsphase.</p>"
    },
    entfernung: {
      titel: "Außerhalb unseres Einsatzgebiets.",
      text: "<p class=\"lead\">Wir bauen im Saarpfalz-Kreis und im Umkreis von rund 40 km. " +
        "Kurze Wege sind der Grund, warum unsere Bauzeiten halten — bei weiteren " +
        "Entfernungen könnten wir das nicht zusagen.</p>"
    }
  };

  /* ---------- Anzeige ---------- */
  function zeigen(n) {
    aktuell = n;
    schritte.forEach(function (s) {
      s.classList.toggle("aktiv", parseInt(s.getAttribute("data-schritt"), 10) === n);
    });
    if (zahlEl) zahlEl.textContent = "Schritt " + n + " von " + schritte.length;
    if (spurEl) spurEl.style.width = ((n - 1) / (schritte.length - 1)) * 100 + "%";
    var erstes = schritte[n - 1].querySelector("input,select,textarea,button");
    if (erstes && n > 1) erstes.focus({ preventScroll: true });
  }

  function profilSetzen(schluessel, wert) {
    antworten[schluessel] = wert;
    var el = document.querySelector('[data-profil="' + schluessel + '"]');
    if (!el) return;
    el.textContent = wert;
    el.classList.remove("leer");
  }

  function sackgasse(art) {
    var s = SACKGASSE[art] || SACKGASSE.klein;
    neinTitel.textContent = s.titel;
    neinText.innerHTML = s.text;
    form.hidden = true;
    if (leiste) leiste.hidden = true;
    jaEl.hidden = true;
    neinEl.hidden = false;
    neinEl.scrollIntoView({ behavior: "smooth", block: "center" });
  }

  /* ---------- Kachelauswahl: wählt aus und geht weiter ---------- */
  form.querySelectorAll('.kacheln input[type="radio"]').forEach(function (radio) {
    radio.addEventListener("change", function () {
      var frage = radio.name;
      profilSetzen(frage, radio.value);
      var stopp = radio.getAttribute("data-stopp");
      if (stopp) { setTimeout(function () { sackgasse(stopp); }, 260); return; }
      // kurze Pause, damit die Auswahl sichtbar wird, dann weiter
      setTimeout(function () {
        if (aktuell < schritte.length) zeigen(aktuell + 1);
      }, 260);
    });
  });

  /* ---------- Schritt 3: Fläche, Einheiten, Lage ---------- */
  if (flaecheEl) {
    var flaecheText = function () {
      var v = parseInt(flaecheEl.value, 10);
      return (v >= 1200 ? "1200+" : v) + " m²";
    };
    // Ins Profil erst schreiben, wenn der Regler bewusst bewegt wurde
    flaecheEl.addEventListener("input", function () {
      flaecheWert.textContent = flaecheText();
      profilSetzen("flaeche", flaecheText());
    });
    flaecheWert.textContent = flaecheText();
  }
  var einheitenEl = document.getElementById("einheiten");
  if (einheitenEl) {
    einheitenEl.addEventListener("change", function () { profilSetzen("einheiten", einheitenEl.value); });
  }

  form.querySelectorAll("[data-weiter]").forEach(function (b) {
    b.addEventListener("click", function () {
      // Lage erst beim Weitergehen prüfen, damit die Auswahl korrigierbar bleibt
      var lage = document.getElementById("lage");
      if (lage) {
        var gewaehlt = lage.options[lage.selectedIndex];
        if (gewaehlt && gewaehlt.getAttribute("data-stopp")) { sackgasse("entfernung"); return; }
      }
      if (einheitenEl) profilSetzen("einheiten", einheitenEl.value);
      if (flaecheWert) profilSetzen("flaeche", flaecheWert.textContent);
      zeigen(Math.min(schritte.length, aktuell + 1));
    });
  });
  form.querySelectorAll("[data-zurueck]").forEach(function (b) {
    b.addEventListener("click", function () { zeigen(Math.max(1, aktuell - 1)); });
  });

  var zeitraumEl = document.getElementById("zeitraum");
  if (zeitraumEl) {
    zeitraumEl.addEventListener("change", function () { profilSetzen("zeitraum", zeitraumEl.value); });
  }

  /* ---------- Absenden ---------- */
  form.addEventListener("submit", function (e) {
    e.preventDefault();

    // Pflichtfelder des letzten Schritts
    var fehlt = null;
    ["person", "ort", "telefon"].forEach(function (id) {
      var f = document.getElementById(id);
      if (!fehlt && f && !f.value.trim()) fehlt = f;
    });
    if (fehlt) { fehlt.focus(); fehlt.style.borderColor = "var(--kupfer)"; return; }

    if (zeitraumEl) profilSetzen("zeitraum", zeitraumEl.value);

    // Vorgangsnummer aus Datum und laufender Zufallszahl (Demo)
    var jetzt = new Date();
    var nr = "SBS-" + jetzt.getFullYear() + "-" +
      String(Math.floor(Math.random() * 9000) + 1000);
    document.getElementById("referenz-nr").textContent = nr;

    var liste = document.getElementById("zusammenfassung");
    liste.innerHTML = "";
    [["Objekt", antworten.objekt], ["Vorhaben", antworten.vorhaben],
     ["Fläche", antworten.flaeche], ["Einheiten", antworten.einheiten],
     ["Größenordnung", antworten.volumen], ["Baubeginn", antworten.zeitraum],
     ["Ort", document.getElementById("ort").value],
     ["Ansprechpartner", document.getElementById("person").value],
     ["Telefon", document.getElementById("telefon").value]
    ].forEach(function (zeile) {
      if (!zeile[1]) return;
      var li = document.createElement("li");
      var b = document.createElement("b"); b.textContent = zeile[0];
      var s = document.createElement("span"); s.textContent = zeile[1];
      li.appendChild(b); li.appendChild(s); liste.appendChild(li);
    });

    form.hidden = true;
    if (leiste) leiste.hidden = true;
    neinEl.hidden = true;
    jaEl.hidden = false;
    jaEl.scrollIntoView({ behavior: "smooth", block: "center" });
  });

  /* ---------- Neu beginnen ---------- */
  var neu = document.getElementById("neu-starten");
  if (neu) {
    neu.addEventListener("click", function () {
      form.reset();
      antworten = {};
      document.querySelectorAll("[data-profil]").forEach(function (el) {
        el.textContent = "—"; el.classList.add("leer");
      });
      if (flaecheEl) flaecheEl.dispatchEvent(new Event("input"));
      neinEl.hidden = true;
      jaEl.hidden = true;
      form.hidden = false;
      if (leiste) leiste.hidden = false;
      zeigen(1);
      leiste.scrollIntoView({ behavior: "smooth", block: "center" });
    });
  }

  zeigen(1);

  /* Prüfhilfe für Abnahme-Screenshots: ?schritt=4 oder ?stopp=volumen */
  (function () {
    var p = new URLSearchParams(location.search);
    if (p.get("stopp")) { sackgasse(p.get("stopp")); return; }
    var s = parseInt(p.get("schritt"), 10);
    if (s >= 1 && s <= schritte.length) zeigen(s);
  })();
})();
