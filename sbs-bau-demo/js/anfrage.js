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
  var wartend = null;        // Zeitgeber für das automatische Weiterspringen
  var gewaehlteKachel = {};  // Frage → zuletzt gewählte Kachel (erkennt erneutes Antippen)
  var flaecheBewegt = false; // Regler erst ins Profil, wenn er bewusst bewegt wurde

  /* ---------- Sackgassen-Texte ---------- */
  var SACKGASSE = {
    klein: {
      titel: "Dafür sind wir nicht der richtige Partner.",
      text: "<p class=\"lead\">Einzelne Reparaturen und Montagen nehmen wir nicht an. " +
        "Unsere Baustellen sind über Monate mit festen Gewerken terminiert. Ein Einzeltermin " +
        "kostet eine Kolonne einen halben Tag, der dann auf der laufenden Baustelle fehlt. " +
        "Deshalb sagen wir hier lieber gleich ab.</p>"
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
    weiterKnopf(schritte[n - 1]);
    var erstes = schritte[n - 1].querySelector("input,select,textarea,button");
    if (erstes && n > 1) erstes.focus({ preventScroll: true });
  }

  // Kachelschritte: „Weiter" erst zeigen, wenn eine Kachel gewählt ist (bei Rückkehr sofort)
  function weiterKnopf(schritt) {
    var knopf = schritt.querySelector(".kacheln ~ .schalt [data-weiter]");
    if (!knopf) return;
    knopf.hidden = !schritt.querySelector('.kacheln input[type="radio"]:checked');
  }

  function profilSetzen(schluessel, wert) {
    antworten[schluessel] = wert;
    var el = document.querySelector('[data-profil="' + schluessel + '"]');
    if (!el) return;
    el.textContent = wert;
    el.classList.remove("leer");
  }

  function profilOffen(schluessel) {
    delete antworten[schluessel];
    var el = document.querySelector('[data-profil="' + schluessel + '"]');
    if (!el) return;
    el.textContent = "noch offen";
    el.classList.add("leer");
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
      gewaehlteKachel[frage] = radio;
      profilSetzen(frage, radio.value);
      weiterKnopf(radio.closest(".schritt"));
      // kurze Pause, damit die Auswahl sichtbar wird, dann weiter (auch in die Sackgasse)
      clearTimeout(wartend);
      wartend = setTimeout(weiterGehen, 260);
    });
    // Bereits gewählte Kachel erneut angetippt (z. B. nach „Zurück"): change feuert nicht, also hier weiter
    radio.addEventListener("click", function () {
      if (gewaehlteKachel[radio.name] === radio && radio.closest(".schritt").classList.contains("aktiv")) {
        weiterGehen();
      }
    });
  });

  /* ---------- Einen Schritt weiter, mit den Prüfungen des aktuellen Schritts ---------- */
  function weiterGehen() {
    clearTimeout(wartend); wartend = null;
    var schritt = schritte[aktuell - 1];

    // Kachelschritt: ohne Auswahl kein Weiter; Sackgassen-Kacheln greifen hier
    if (schritt.querySelector(".kacheln")) {
      var kachel = schritt.querySelector('.kacheln input[type="radio"]:checked');
      if (!kachel) return;
      profilSetzen(kachel.name, kachel.value);
      var stopp = kachel.getAttribute("data-stopp");
      if (stopp) { sackgasse(stopp); return; }
    }

    // Schritt 3: Lage erst beim Weitergehen prüfen, damit die Auswahl korrigierbar bleibt
    var lage = schritt.querySelector("#lage");
    if (lage) {
      var gewaehlt = lage.options[lage.selectedIndex];
      if (gewaehlt && gewaehlt.getAttribute("data-stopp")) { sackgasse("entfernung"); return; }
      if (einheitenEl) profilSetzen("einheiten", einheitenEl.value);
      if (flaecheBewegt) profilSetzen("flaeche", flaecheText());
      else profilOffen("flaeche");
    }

    if (aktuell < schritte.length) zeigen(aktuell + 1);
  }

  /* ---------- Schritt 3: Fläche, Einheiten, Lage ---------- */
  function flaecheText() {
    var v = parseInt(flaecheEl.value, 10);
    return (v >= 1200 ? "1200+" : v) + " m²";
  }
  if (flaecheEl) {
    // Ins Profil erst schreiben, wenn der Regler bewusst bewegt wurde
    flaecheEl.addEventListener("input", function () {
      flaecheBewegt = true;
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
    b.addEventListener("click", weiterGehen);
  });
  form.querySelectorAll("[data-zurueck]").forEach(function (b) {
    b.addEventListener("click", function () { zeigen(Math.max(1, aktuell - 1)); });
  });

  var zeitraumEl = document.getElementById("zeitraum");
  if (zeitraumEl) {
    zeitraumEl.addEventListener("change", function () { profilSetzen("zeitraum", zeitraumEl.value); });
  }

  /* ---------- Feldprüfung (Schritt 5) ---------- */
  // Liefert je Feld den Fehlertext oder "" — leer heißt gültig
  var PRUEFUNG = {
    person: function (v) { return v ? "" : "Bitte Ihren Namen angeben."; },
    ort: function (v) { return v ? "" : "Bitte den Ort des Objekts angeben."; },
    telefon: function (v) {
      if (!v) return "Bitte eine Telefonnummer angeben, unter der wir Sie erreichen.";
      if ((v.match(/\d/g) || []).length < 6) return "Bitte eine Telefonnummer mit mindestens sechs Ziffern angeben.";
      return "";
    },
    email: function (v) {
      if (!v) return "";
      return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) ? "" : "Bitte eine gültige E-Mail-Adresse angeben (mit @ und Punkt).";
    }
  };

  function feldPruefen(id) {
    var feld = document.getElementById(id);
    var zeile = document.getElementById(id + "-fehler");
    if (!feld || !zeile) return true;
    var text = PRUEFUNG[id](feld.value.trim());
    var huelle = feld.closest(".feld");
    zeile.textContent = text;
    zeile.hidden = !text;
    if (huelle) huelle.classList.toggle("ungueltig", !!text);
    if (text) {
      feld.setAttribute("aria-invalid", "true");
      feld.setAttribute("aria-describedby", zeile.id);
    } else {
      feld.removeAttribute("aria-invalid");
      feld.removeAttribute("aria-describedby");
    }
    return !text;
  }

  Object.keys(PRUEFUNG).forEach(function (id) {
    var feld = document.getElementById(id);
    if (!feld) return;
    // Beim Korrigieren verschwindet der Fehler sofort; neue Fehler erst wieder beim Absenden
    feld.addEventListener("input", function () {
      if (feld.getAttribute("aria-invalid") === "true") feldPruefen(id);
    });
    feld.addEventListener("blur", function () {
      if (feld.getAttribute("aria-invalid") === "true") feldPruefen(id);
    });
  });

  /* ---------- Absenden ---------- */
  form.addEventListener("submit", function (e) {
    e.preventDefault();

    // Pflichtfelder und Formate des letzten Schritts, erstes fehlerhaftes Feld bekommt den Fokus
    var erstesFehlerhaft = null;
    Object.keys(PRUEFUNG).forEach(function (id) {
      if (!feldPruefen(id) && !erstesFehlerhaft) erstesFehlerhaft = document.getElementById(id);
    });
    if (erstesFehlerhaft) { erstesFehlerhaft.focus(); return; }

    if (zeitraumEl) profilSetzen("zeitraum", zeitraumEl.value);
    // Fläche: beim Absenden zählt der aktuelle Reglerstand, auch wenn er nie bewegt wurde
    if (flaecheEl) antworten.flaeche = flaecheText();

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
      gewaehlteKachel = {};
      flaecheBewegt = false;
      clearTimeout(wartend); wartend = null;
      document.querySelectorAll("[data-profil]").forEach(function (el) {
        el.textContent = "—"; el.classList.add("leer");
      });
      if (flaecheEl) flaecheWert.textContent = flaecheText();
      Object.keys(PRUEFUNG).forEach(function (id) {
        var f = document.getElementById(id);
        if (f) { f.value = ""; feldPruefen(id); }
      });
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
