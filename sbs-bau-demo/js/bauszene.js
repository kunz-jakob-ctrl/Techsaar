/* =========================================================================
   SBS BAU — Bauszene
   Eine gepinnte Sequenz: der Scrollfortschritt der Hülle wird zu t (0..1)
   und t bestimmt den kompletten Zustand der Zeichnung. Der Zustand wird
   ausschließlich aus t berechnet (keine Zwischenspeicherung) — nur so lässt
   sich sauber vor- und zurückscrollen.

   Ablauf über t:
     0.00–0.14  Bestand      Risse, dunkle Wand
     0.14–0.34  Entkernung   Gerüst wächst, Risse verschwinden
     0.34–0.54  Dachstuhl    Sparren klappen ein, Pfetten laufen durch
     0.54–0.76  Eindeckung   Ziegel fliegen von oben aufs Dach
     0.76–0.90  Fassade      Wand wird hell, Fenster setzen sich ein
     0.90–1.00  Übergabe     Gerüst fällt, Licht geht an, Bühne wird hell
   ========================================================================= */
(function () {
  "use strict";

  var huelle = document.getElementById("szene-huelle");
  var buehne = document.getElementById("szene-buehne");
  var svg = document.getElementById("szene");
  if (!huelle || !buehne || !svg) return;

  var NS = "http://www.w3.org/2000/svg";
  var schmal = window.matchMedia("(max-width:760px)").matches;
  var ruhig = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ------------------------------------------------------------------ */
  /* Hilfsfunktionen                                                     */
  /* ------------------------------------------------------------------ */
  function klemm(v) { return v < 0 ? 0 : v > 1 ? 1 : v; }
  function spanne(t, a, b) { return klemm((t - a) / (b - a)); }
  function weich(p) { return p < .5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2; }
  function aus(p) { return 1 - Math.pow(1 - p, 3); }
  function misch(a, b, p) { return a + (b - a) * p; }

  function farbe(a, b, p) {                       // a, b als [r,g,b]
    return "rgb(" + Math.round(misch(a[0], b[0], p)) + "," +
      Math.round(misch(a[1], b[1], p)) + "," + Math.round(misch(a[2], b[2], p)) + ")";
  }
  function el(name, attr) {
    var k = document.createElementNS(NS, name);
    for (var a in attr) k.setAttribute(a, attr[a]);
    return k;
  }

  /* ------------------------------------------------------------------ */
  /* Geometrie — Achsbild von vorn links                                 */
  /* ------------------------------------------------------------------ */
  var BODEN = 545;
  var A = [215, BODEN], B = [665, BODEN];        // Vorderwand unten
  var C = [665, 300], D = [215, 300];            // Vorderwand oben (Traufe)
  var TIEFE = [150, -78];                        // Richtung nach hinten rechts
  function plus(p, v, f) { f = f === undefined ? 1 : f; return [p[0] + v[0] * f, p[1] + v[1] * f]; }
  var Bs = plus(B, TIEFE), Cs = plus(C, TIEFE), Ds = plus(D, TIEFE);
  var FIRST = 105;                                // Firsthöhe über der Traufe
  var R1 = [(D[0] + Ds[0]) / 2, (D[1] + Ds[1]) / 2 - FIRST];
  var R2 = [(C[0] + Cs[0]) / 2, (C[1] + Cs[1]) / 2 - FIRST];

  // Vordere Dachfläche als Parallelogramm: P(s,u) = D + s*(C-D) + u*(R1-D)
  var DC = [C[0] - D[0], C[1] - D[1]];
  var DR = [R1[0] - D[0], R1[1] - D[1]];
  function dach(s, u) { return [D[0] + DC[0] * s + DR[0] * u, D[1] + DC[1] * s + DR[1] * u]; }
  function pf(punkte) { return punkte.map(function (p) { return p[0] + "," + p[1]; }).join(" "); }

  // Farben (Bestand -> fertig)
  var WAND_ALT = [40, 44, 49], WAND_NEU = [231, 227, 220];
  var SEITE_ALT = [28, 31, 35], SEITE_NEU = [203, 198, 189];
  var LINIE_ALT = [120, 126, 132], LINIE_NEU = [138, 132, 121];
  var ZIEGEL = "#8A5330", ZIEGEL_2 = "#7A4726", HOLZ = "#9A7248";

  /* ------------------------------------------------------------------ */
  /* Aufbau der Zeichnung                                                */
  /* ------------------------------------------------------------------ */
  var wurzel = el("g", {});
  svg.appendChild(wurzel);

  // Clip für die Dachfläche, damit überstehende Ziegel sauber abschneiden
  var defs = el("defs", {});
  var clipDach = el("clipPath", { id: "cp-dach" });
  clipDach.appendChild(el("polygon", { points: pf([dach(0, 0), dach(1, 0), dach(1, 1), dach(0, 1)]) }));
  var clipGeruest = el("clipPath", { id: "cp-geruest" });
  var clipGeruestR = el("rect", { x: 130, y: 120, width: 780, height: 430 });
  clipGeruest.appendChild(clipGeruestR);
  defs.appendChild(clipDach); defs.appendChild(clipGeruest);
  svg.appendChild(defs);

  /* --- Boden --- */
  var schatten = el("ellipse", { cx: 520, cy: BODEN + 12, rx: 360, ry: 19, fill: "#000", opacity: ".28" });
  var bodenlinie = el("line", { x1: 112, y1: BODEN, x2: 868, y2: BODEN, stroke: "#6E747A", "stroke-width": "1", opacity: ".45" });
  wurzel.appendChild(schatten); wurzel.appendChild(bodenlinie);

  /* --- Baukörper --- */
  var wandSeite = el("polygon", { points: pf([B, Bs, Cs, C]) });
  var wandVorn = el("polygon", { points: pf([A, B, C, D]) });
  var giebel = el("polygon", { points: pf([C, Cs, R2]) });
  wurzel.appendChild(wandSeite); wurzel.appendChild(wandVorn); wurzel.appendChild(giebel);

  /* --- Fensteröffnungen: bleiben sichtbar, auch wenn kein Fenster drin ist --- */
  var oeffnungen = el("g", { fill: "#0A0B0C", stroke: "#31363B", "stroke-width": "1.2" });
  wurzel.appendChild(oeffnungen);

  /* --- Altes Dach: liegt im Bestand drauf und wird zurückgebaut --- */
  var dachAlt = el("g", {});
  dachAlt.appendChild(el("polygon", {
    points: pf([dach(0, 0), dach(1, 0), dach(1, 1), dach(0, 1)]),
    fill: "#2B2018", stroke: "#3E3025", "stroke-width": "1.4"
  }));
  var altLinien = el("g", { fill: "none", stroke: "#1C1510", "stroke-width": "1.1", opacity: ".9" });
  for (var al = 1; al < 7; al++) {
    var a0 = dach(0, al / 7), a1 = dach(1, al / 7);
    altLinien.appendChild(el("line", { x1: a0[0], y1: a0[1], x2: a1[0], y2: a1[1] }));
  }
  dachAlt.appendChild(altLinien);
  wurzel.appendChild(dachAlt);

  var kanten = el("g", { fill: "none", "stroke-width": "1.4", "stroke-linejoin": "round" });
  [[A, B], [B, C], [C, D], [D, A], [B, Bs], [Bs, Cs], [Cs, C], [C, R2], [Cs, R2],
   [D, R1], [R1, R2]].forEach(function (k) {
    kanten.appendChild(el("line", { x1: k[0][0], y1: k[0][1], x2: k[1][0], y2: k[1][1] }));
  });
  wurzel.appendChild(kanten);

  /* --- Risse im Bestand --- */
  var risse = el("g", { fill: "none", stroke: "#0A0B0C", "stroke-width": "2.4", "stroke-linecap": "round", opacity: "0" });
  ["M 300 308 l -14 44 l 12 32 l -9 38 l 15 48",
   "M 520 312 l 18 40 l -10 36 l 14 44",
   "M 402 476 l -20 30 l 8 22",
   "M 604 320 l 16 32 l -12 36 l 10 28"].forEach(function (d) {
    risse.appendChild(el("path", { d: d }));
  });
  wurzel.appendChild(risse);

  /* --- Dachstuhl: Sparren und Pfetten --- */
  var stuhl = el("g", { fill: "none", stroke: HOLZ, "stroke-width": "5", "stroke-linecap": "round" });
  var sparrenAnzahl = schmal ? 9 : 13;
  var sparren = [];
  for (var i = 0; i < sparrenAnzahl; i++) {
    var s = i / (sparrenAnzahl - 1);
    var traufe = dach(s, 0), first = dach(s, 1);
    var l = el("line", { x1: traufe[0], y1: traufe[1], x2: first[0], y2: first[1], opacity: "0" });
    stuhl.appendChild(l);
    sparren.push({ el: l, dreh: traufe });
  }
  var pfetten = [];
  [0.34, 0.68].forEach(function (u) {
    var p0 = dach(0, u), p1 = dach(1, u);
    var l = el("line", {
      x1: p0[0], y1: p0[1], x2: p1[0], y2: p1[1], "stroke-width": "4",
      pathLength: "1", "stroke-dasharray": "1", "stroke-dashoffset": "1", opacity: ".9"
    });
    stuhl.appendChild(l); pfetten.push(l);
  });
  wurzel.appendChild(stuhl);

  /* --- Ziegel --- */
  var zGruppe = el("g", { "clip-path": "url(#cp-dach)" });
  var reihen = schmal ? 6 : 8;
  var spalten = schmal ? 11 : 15;
  var ziegel = [];
  for (var r = 0; r < reihen; r++) {
    var u0 = r / reihen, u1 = (r + 1) / reihen;
    var versatz = (r % 2) * (0.5 / spalten);           // halber Versatz je Reihe
    for (var c = -1; c <= spalten; c++) {
      var s0 = c / spalten + versatz, s1 = (c + 1) / spalten + versatz;
      var p = el("polygon", {
        points: pf([dach(s0, u0), dach(s1, u0), dach(s1, u1 + 0.035), dach(s0, u1 + 0.035)]),
        fill: (c + r) % 2 ? ZIEGEL : ZIEGEL_2,
        stroke: "#5E3419", "stroke-width": ".8", opacity: "0"
      });
      zGruppe.appendChild(p);
      var mitte = dach(s0 + .5 / spalten, u0 + .5 / reihen);
      // Reihenfolge: von der Traufe nach oben, innerhalb der Reihe von links
      ziegel.push({ el: p, ordnung: r * (spalten + 2) + (c + 1), mitte: mitte });
    }
  }
  wurzel.appendChild(zGruppe);
  var ziegelGesamt = ziegel.length;

  /* --- Firstziegel --- */
  var firstZiegel = el("g", { opacity: "0" });
  for (var f = 0; f < (schmal ? 8 : 12); f++) {
    var fs = f / (schmal ? 8 : 12), fs2 = (f + 1) / (schmal ? 8 : 12);
    var q0 = dach(fs, 1), q1 = dach(fs2, 1);
    firstZiegel.appendChild(el("polygon", {
      points: pf([[q0[0], q0[1] + 3], [q1[0], q1[1] + 3], [q1[0], q1[1] - 11], [q0[0], q0[1] - 11]]),
      fill: ZIEGEL, stroke: "#5E3419", "stroke-width": ".8"
    }));
  }
  wurzel.appendChild(firstZiegel);

  /* --- Schornstein: steht über allen Bauphasen, wird nur mit verputzt --- */
  var kamin = el("g", { stroke: "#4A4F55", "stroke-width": "1.2", "stroke-linejoin": "round" });
  var kaminF = [], kaminS, kaminD;
  (function () {
    var fuss = dach(0.45, 0.55), br = 34, hoch = 74;
    var t2 = [19.5, -10.1];                       // gestauchte Tiefe des Schornsteins
    var F0 = fuss, F1 = [fuss[0] + br, fuss[1]];
    var F0b = plus(F0, t2), F1b = plus(F1, t2);
    var T0 = [F0[0], F0[1] - hoch], T1 = [F1[0], F1[1] - hoch];
    var T0b = [F0b[0], F0b[1] - hoch], T1b = [F1b[0], F1b[1] - hoch];
    kaminS = el("polygon", { points: pf([F1, F1b, T1b, T1]) });
    var vorn = el("polygon", { points: pf([F0, F1, T1, T0]) });
    kaminD = el("polygon", { points: pf([T0, T1, T1b, T0b]), fill: "#3A3F45" });
    kamin.appendChild(kaminS); kamin.appendChild(vorn); kamin.appendChild(kaminD);
    kaminF.push(vorn);
  })();
  wurzel.appendChild(kamin);

  /* --- Regenrinne --- */
  var rinne = el("g", { opacity: "0" });
  rinne.appendChild(el("line", {
    x1: D[0] - 8, y1: D[1] + 5, x2: C[0] + 8, y2: C[1] + 5,
    stroke: "#9AA0A6", "stroke-width": "6", "stroke-linecap": "round"
  }));
  rinne.appendChild(el("line", {
    x1: C[0] + 5, y1: C[1] + 6, x2: C[0] + 5, y2: BODEN, stroke: "#9AA0A6", "stroke-width": "4"
  }));
  wurzel.appendChild(rinne);

  /* --- Fenster und Tür --- */
  var fensterG = el("g", {});
  var fenster = [];
  function fensterBauen(punkte, mitte) {
    // Öffnung im Mauerwerk — von Anfang an sichtbar
    oeffnungen.appendChild(el("polygon", { points: pf(punkte) }));
    // Das eingesetzte Fenster kommt später darüber
    var g = el("g", {});
    var rahmen = el("polygon", { points: pf(punkte), fill: "#0B0C0D", stroke: "#B9BDC1", "stroke-width": "2" });
    g.appendChild(rahmen);
    fensterG.appendChild(g);
    fenster.push({ g: g, glas: rahmen, mitte: mitte });
  }
  function rechteck(x, y, b, h) {
    return { p: [[x, y + h], [x + b, y + h], [x + b, y], [x, y]], m: [x + b / 2, y + h / 2] };
  }
  // Vorderwand: Obergeschoss (vier Fenster), Erdgeschoss (Tür und drei Fenster)
  [255, 357, 459, 561].forEach(function (x) {
    var r = rechteck(x, 324, 62, 74); fensterBauen(r.p, r.m);
  });
  (function () {
    var t2 = rechteck(255, 425, 72, 120); fensterBauen(t2.p, t2.m);
    [380, 470, 560].forEach(function (x) {
      var r = rechteck(x, 425, 62, 80); fensterBauen(r.p, r.m);
    });
  })();
  // Seitenwand: zwei Achsen, zwei Geschosse
  (function () {
    var hoehe = C[1] - B[1];                       // negativ: nach oben
    function seite(u, v) { return [B[0] + TIEFE[0] * u, B[1] + TIEFE[1] * u + hoehe * v]; }
    [[0.16, 0.60], [0.56, 0.60], [0.16, 0.18], [0.56, 0.18]].forEach(function (p) {
      var u0 = p[0], u1 = p[0] + 0.26, v0 = p[1], v1 = p[1] + 0.28;
      var punkte = [seite(u0, v0), seite(u1, v0), seite(u1, v1), seite(u0, v1)];
      fensterBauen(punkte, [(punkte[0][0] + punkte[2][0]) / 2, (punkte[0][1] + punkte[2][1]) / 2]);
    });
  })();
  // Giebelfenster
  (function () { var r = rechteck(718, 210, 44, 30); fensterBauen(r.p, r.m); })();
  wurzel.appendChild(fensterG);

  /* --- Gerüst --- */
  var geruest = el("g", {
    fill: "none", stroke: "#8E959C", "stroke-width": "2.4", "stroke-linecap": "square",
    "clip-path": "url(#cp-geruest)", opacity: "0"
  });
  (function () {
    var oben = 266, unten = BODEN;
    var lagen = [BODEN - 6, 480, 420, 360, 300, 266];
    // Vorderes Gerüstfeld
    var stiele = schmal ? [200, 350, 500, 650] : [198, 315, 432, 549, 666];
    stiele.forEach(function (x) {
      geruest.appendChild(el("line", { x1: x, y1: unten, x2: x, y2: oben - 16 }));
    });
    lagen.forEach(function (y) {
      geruest.appendChild(el("line", { x1: stiele[0], y1: y, x2: stiele[stiele.length - 1], y2: y }));
    });
    // Beläge
    lagen.slice(0, 4).forEach(function (y) {
      geruest.appendChild(el("rect", {
        x: stiele[0], y: y - 6, width: stiele[stiele.length - 1] - stiele[0], height: 6,
        fill: "#5D6167", stroke: "none", opacity: ".85"
      }));
    });
    // Diagonalen in zwei Feldern
    geruest.appendChild(el("line", { x1: stiele[0], y1: lagen[0], x2: stiele[1], y2: lagen[2] }));
    geruest.appendChild(el("line", { x1: stiele[stiele.length - 2], y1: lagen[2], x2: stiele[stiele.length - 1], y2: lagen[0] }));
    // Seitliches Gerüstfeld entlang der Tiefe
    if (!schmal) {
      [0.34, 0.68, 1].forEach(function (u) {
        var p0 = plus(B, TIEFE, u), p1 = [p0[0], p0[1] - 284];
        geruest.appendChild(el("line", { x1: p0[0], y1: p0[1], x2: p1[0], y2: p1[1] }));
      });
      [0, 60, 120, 180, 240].forEach(function (h) {
        var p0 = [B[0], BODEN - 6 - h], p1 = plus(p0, TIEFE, 1);
        geruest.appendChild(el("line", { x1: p0[0], y1: p0[1], x2: p1[0], y2: p1[1] }));
      });
    }
  })();
  wurzel.appendChild(geruest);

  /* --- Beschriftung: Bautafel --- */
  var tafel = el("g", { opacity: "0" });
  tafel.appendChild(el("rect", { x: 116, y: 448, width: 104, height: 78, fill: "#15171A", stroke: "#6E747A", "stroke-width": "1.5", rx: 2 }));
  tafel.appendChild(el("line", { x1: 168, y1: 526, x2: 168, y2: BODEN, stroke: "#6E747A", "stroke-width": "2" }));
  var tafelText1 = el("text", { x: 128, y: 472, fill: "#D39B62", "font-family": "Geist Mono, monospace", "font-size": "11", "letter-spacing": "1" });
  tafelText1.textContent = "BAUSTELLE";
  var tafelText2 = el("text", { x: 128, y: 494, fill: "#A9AEB3", "font-family": "Geist Mono, monospace", "font-size": "11" });
  tafelText2.textContent = "SBS BAU";
  var tafelText3 = el("text", { x: 128, y: 513, fill: "#6E747A", "font-family": "Geist Mono, monospace", "font-size": "9.5" });
  tafelText3.textContent = "BA 01 / 07 M";
  tafel.appendChild(tafelText1); tafel.appendChild(tafelText2); tafel.appendChild(tafelText3);
  wurzel.appendChild(tafel);

  /* ------------------------------------------------------------------ */
  /* Phasen                                                              */
  /* ------------------------------------------------------------------ */
  var PHASEN = [
    { bis: 0.14, titel: "Bestand aufnehmen", text: "Statik, Leitungen, Feuchte, Schadstoffe. Wir wissen, was uns erwartet, bevor der erste Schlag fällt." },
    { bis: 0.34, titel: "Entkernen und einrüsten", text: "Rückbau bis auf den tragenden Kern. Das Gerüst steht, der Bauzeitenplan läuft ab dem ersten Tag." },
    { bis: 0.54, titel: "Dachstuhl richten", text: "Sparren, Pfetten, Lattung. Wo die Statik es verlangt, wird verstärkt statt geflickt." },
    { bis: 0.76, titel: "Eindecken", text: "Ziegel für Ziegel, von der Traufe zum First. Ab hier ist das Haus wieder dicht." },
    { bis: 0.90, titel: "Fassade und Fenster", text: "Dämmung, Putz, neue Fenster. Aus der Baustelle wird wieder ein Haus." },
    { bis: 1.01, titel: "Übergabe", text: "Schlüsselfertig, mit Abnahmeprotokoll. Ein Ansprechpartner — von der ersten Begehung bis hierher." }
  ];
  var titelEl = document.getElementById("szene-titel");
  var infoEl = document.getElementById("szene-info");
  var balkenEl = document.getElementById("szene-balken");
  var phasenEl = Array.prototype.slice.call(document.querySelectorAll("#phasen li"));
  var letztePhase = -1;

  /* ------------------------------------------------------------------ */
  /* Zeichnen — alles allein aus t                                       */
  /* ------------------------------------------------------------------ */
  function zeichnen(t) {
    /* Kamera: minimales Heranfahren, nimmt der Szene das Statische */
    var k = misch(1.05, 1, weich(spanne(t, 0, .9)));
    wurzel.setAttribute("transform", "translate(500,340) scale(" + k.toFixed(4) + ") translate(-500,-340)");

    /* Wandfarbe: Bestand -> verputzt */
    var putz = weich(spanne(t, .76, .93));
    wandVorn.setAttribute("fill", farbe(WAND_ALT, WAND_NEU, putz));
    giebel.setAttribute("fill", farbe(WAND_ALT, WAND_NEU, putz));
    wandSeite.setAttribute("fill", farbe(SEITE_ALT, SEITE_NEU, putz));
    kanten.setAttribute("stroke", farbe(LINIE_ALT, LINIE_NEU, putz));
    schatten.setAttribute("opacity", misch(.28, .12, putz));
    kaminF[0].setAttribute("fill", farbe([48, 52, 57], [214, 209, 200], putz));
    kaminS.setAttribute("fill", farbe([34, 37, 41], [186, 181, 172], putz));

    /* Altes Dach: wird in der Entkernung abgetragen */
    dachAlt.setAttribute("opacity", (1 - weich(spanne(t, .16, .31))).toFixed(3));

    /* Risse: nur im Bestand */
    risse.setAttribute("opacity", (misch(0, .6, spanne(t, .02, .08)) * (1 - spanne(t, .14, .24))).toFixed(3));

    /* Bautafel: steht während der Bauzeit */
    tafel.setAttribute("opacity", (spanne(t, .13, .19) * (1 - spanne(t, .92, .98))).toFixed(3));

    /* Gerüst: wächst von unten, fällt am Ende wieder */
    var aufbau = weich(spanne(t, .14, .33));
    var abbau = weich(spanne(t, .90, .985));
    var hoehe = 430 * aufbau * (1 - abbau);
    clipGeruestR.setAttribute("y", 550 - hoehe);
    clipGeruestR.setAttribute("height", Math.max(0, hoehe));
    geruest.setAttribute("opacity", (Math.min(1, aufbau * 2.4) * (1 - abbau)).toFixed(3));

    /* Sparren: klappen einzeln in die Lage */
    for (var i = 0; i < sparren.length; i++) {
      var p = weich(spanne(t, misch(.345, .47, i / (sparren.length - 1)), misch(.345, .47, i / (sparren.length - 1)) + .07));
      var s = sparren[i];
      s.el.setAttribute("opacity", p.toFixed(3));
      s.el.setAttribute("transform", "rotate(" + ((1 - p) * -34).toFixed(2) + "," + s.dreh[0] + "," + s.dreh[1] + ")");
    }
    /* Pfetten: laufen von links durch */
    pfetten.forEach(function (l, n) {
      var p = aus(spanne(t, .40 + n * .05, .53 + n * .05));
      l.setAttribute("stroke-dashoffset", (1 - p).toFixed(3));
    });

    /* Ziegel: fliegen von oben rechts ein, Traufe zuerst */
    for (var z = 0; z < ziegelGesamt; z++) {
      var d = ziegel[z];
      var start = misch(.545, .715, d.ordnung / ziegelGesamt);
      var p2 = weich(spanne(t, start, start + .05));
      if (d.zuletzt === p2) continue;             // spart Schreibvorgänge
      d.zuletzt = p2;
      d.el.setAttribute("opacity", p2 < .02 ? "0" : Math.min(1, p2 * 1.6).toFixed(3));
      if (p2 < 1) {
        var dx = (1 - p2) * 46, dy = (1 - p2) * -240, dr = (1 - p2) * -20;
        d.el.setAttribute("transform",
          "translate(" + dx.toFixed(1) + "," + dy.toFixed(1) + ") rotate(" + dr.toFixed(1) + "," + d.mitte[0] + "," + d.mitte[1] + ")");
      } else {
        d.el.removeAttribute("transform");
      }
    }
    firstZiegel.setAttribute("opacity", weich(spanne(t, .72, .79)).toFixed(3));
    rinne.setAttribute("opacity", weich(spanne(t, .78, .86)).toFixed(3));

    /* Fenster: setzen sich nacheinander ein, am Ende geht das Licht an */
    var licht = weich(spanne(t, .93, 1));
    for (var w = 0; w < fenster.length; w++) {
      var fw = fenster[w];
      var pf2 = weich(spanne(t, misch(.75, .87, w / fenster.length), misch(.75, .87, w / fenster.length) + .05));
      fw.g.setAttribute("opacity", pf2.toFixed(3));
      var sk = misch(.55, 1, pf2);
      fw.g.setAttribute("transform",
        "translate(" + fw.mitte[0] + "," + fw.mitte[1] + ") scale(" + sk.toFixed(3) + ") translate(" + (-fw.mitte[0]) + "," + (-fw.mitte[1]) + ")");
      fw.glas.setAttribute("fill", farbe([11, 12, 13], [232, 178, 106], licht));
    }

    /* Bühne kippt ins Helle — Übergang in den hellen Teil der Seite */
    var hell = weich(spanne(t, .88, 1));
    buehne.style.background = farbe([14, 15, 16], [243, 241, 237], hell);
    buehne.classList.toggle("hell-szene", hell > .55);

    /* Text und Phasenliste */
    var phase = 0;
    while (phase < PHASEN.length - 1 && t >= PHASEN[phase].bis) phase++;
    if (phase !== letztePhase) {
      letztePhase = phase;
      if (titelEl) titelEl.textContent = PHASEN[phase].titel;
      if (infoEl) infoEl.textContent = PHASEN[phase].text;
      phasenEl.forEach(function (li, n) {
        li.classList.toggle("aktiv", n === phase);
        li.classList.toggle("fertig", n < phase);
      });
    }
    if (balkenEl) balkenEl.style.width = (t * 100).toFixed(1) + "%";
  }

  /* ------------------------------------------------------------------ */
  /* Anbindung an das Scrollen                                           */
  /* ------------------------------------------------------------------ */
  huelle.classList.remove("ohne-js");

  /* Prüfhilfe: ?szene=0.62 friert die Szene auf einem Stand ein (für Abnahme
     und Screenshots). Ohne den Parameter passiert hier nichts. */
  var pruef = new URLSearchParams(location.search).get("szene");
  if (pruef !== null) {
    huelle.classList.add("statisch");
    zeichnen(klemm(parseFloat(pruef) || 0));
    return;
  }

  if (ruhig) {
    // Reduzierte Bewegung: fertiges Objekt, keine Pinnung
    huelle.classList.add("statisch");
    zeichnen(1);
    return;
  }

  huelle.style.height = (schmal ? 360 : 480) + "vh";  // mobil kuerzer: weniger Wischen

  var offen = false;
  function messen() {
    offen = false;
    var oben = huelle.offsetTop;
    // Bewusst die Höhe der gepinnten Bühne abziehen und nicht window.innerHeight:
    // Auf dem Handy wächst innerHeight, sobald die Adressleiste einklappt. Damit
    // würde der Rechenweg mitten im Scrollen kürzer und die Szene machte einen
    // Sprung. Die Bühne ist in svh gesetzt und bleibt dabei stabil.
    var weg = huelle.offsetHeight - buehne.offsetHeight;
    var y = (window.scrollY || document.documentElement.scrollTop) - oben;
    zeichnen(weg > 0 ? klemm(y / weg) : 0);
  }
  function anstossen() { if (!offen) { offen = true; requestAnimationFrame(messen); } }

  window.addEventListener("scroll", anstossen, { passive: true });
  window.addEventListener("resize", anstossen);
  messen();
})();
