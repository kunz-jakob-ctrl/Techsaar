/* charts.js — handgebaute Diagramme für TechSaar.

   Kennt keine Inhalte: keine Reservierungen, keine Uhrzeiten, keine Euro-Logik.
   Wer diese Datei in ein anderes Projekt mitnimmt, tauscht nur die Daten.

   Zwei Regeln, die den Wiederverwendungswert tragen:
   1. Alle Renderer sind IDEMPOTENT — Container leeren, neu zeichnen. Ohne das
      häuft der Zeitraum-Umschalter bei jedem Klick Elemente an.
   2. KEINE Hex-Farben. Varianten werden zu Tailwind-Klassen, die Farbe kommt aus
      tailwind.config.js. Sonst driften Diagramme und Seite bei jeder
      Farbänderung auseinander.

   Achtung beim Kopieren: Die verwendeten Klassen müssen in der Tailwind-
   Konfiguration unter `content` erfasst sein, sonst werden sie wegoptimiert
   und die Diagramme sind unsichtbar. */
window.Charts = (function () {
  'use strict';

  var FARBE = {
    kobalt:    'bg-kobalt',
    terra:     'bg-terra',
    senf:      'bg-senf',
    celadon:   'bg-celadon',
    ofenmuted: 'bg-ofenmuted',
  };
  var STRICH = {
    kobalt:    'stroke-kobalt',
    terra:     'stroke-terra',
    senf:      'stroke-senf',
    celadon:   'stroke-celadon',
    ofenmuted: 'stroke-ofenmuted',
  };
  var FUELL = {
    kobalt:    'fill-kobalt',
    terra:     'fill-terra',
    senf:      'fill-senf',
    celadon:   'fill-celadon',
    ofenmuted: 'fill-ofenmuted',
  };

  function fmt(wert, art) {
    if (art === 'prozent') return wert + ' %';
    if (art === 'euro')    return wert.toLocaleString('de-DE') + ' €';
    return wert.toLocaleString('de-DE');
  }

  function leeren(el) { while (el.firstChild) el.removeChild(el.firstChild); }

  /* --- Tooltip: genau einer für die ganze Seite, nicht einer je Diagramm --- */
  var tip = null;
  function tipEl() {
    if (tip) return tip;
    tip = document.createElement('div');
    tip.className = 'ts-tip';
    tip.setAttribute('role', 'status');
    tip.hidden = true;
    document.body.appendChild(tip);
    return tip;
  }
  function tipZeigen(ziel, text) {
    var t = tipEl(), r = ziel.getBoundingClientRect();
    t.textContent = text;
    t.hidden = false;
    t.style.left = (window.scrollX + r.left + r.width / 2) + 'px';
    t.style.top  = (window.scrollY + r.top) + 'px';
  }
  function tipVerstecken() { if (tip) tip.hidden = true; }

  document.addEventListener('click', function (e) {
    if (!e.target.closest('[data-tip]')) tipVerstecken();
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') tipVerstecken();
  });

  /* Hover, Tastaturfokus UND Tap. Tap ist nicht optional: auf Touchgeräten
     gibt es kein Hover, dort wäre das Diagramm sonst stumm. */
  function tipBinden(el, text) {
    el.setAttribute('data-tip', text);
    el.setAttribute('tabindex', '0');
    el.addEventListener('mouseenter', function () { tipZeigen(el, text); });
    el.addEventListener('mouseleave', tipVerstecken);
    el.addEventListener('focus',      function () { tipZeigen(el, text); });
    el.addEventListener('blur',       tipVerstecken);
    el.addEventListener('click',      function (e) { e.stopPropagation(); tipZeigen(el, text); });
  }

  /* --- Textalternative: ein SVG allein ist für Screenreader wertlos --- */
  function srTabelle(el, kopf, zeilen) {
    var t = document.createElement('table');
    t.className = 'sr-only';
    var thead = document.createElement('thead');
    var kopfZeile = document.createElement('tr');
    kopf.forEach(function (k) {
      var th = document.createElement('th');
      th.setAttribute('scope', 'col');
      th.textContent = k;
      kopfZeile.appendChild(th);
    });
    thead.appendChild(kopfZeile);
    t.appendChild(thead);
    var tbody = document.createElement('tbody');
    zeilen.forEach(function (z) {
      var tr = document.createElement('tr');
      z.forEach(function (c, i) {
        var zelle = document.createElement(i === 0 ? 'th' : 'td');
        if (i === 0) zelle.setAttribute('scope', 'row');
        zelle.textContent = c;
        tr.appendChild(zelle);
      });
      tbody.appendChild(tr);
    });
    t.appendChild(tbody);
    el.appendChild(t);
  }

  /* --- Balken: waagerecht, Breite anteilig am größten Posten --- */
  function renderBars(el, daten, opts) {
    opts = opts || {};
    var art = opts.format || 'zahl';
    leeren(el);

    var max = Math.max.apply(null, daten.posten.map(function (p) { return p.wert; }));

    var liste = document.createElement('ul');
    liste.className = 'grid gap-5';
    /* Die Werte stehen direkt darunter als echte Tabelle — ohne aria-hidden
       liest ein Screenreader alles doppelt. */
    liste.setAttribute('aria-hidden', 'true');

    daten.posten.forEach(function (p) {
      var li = document.createElement('li');

      var kopf = document.createElement('div');
      kopf.className = 'flex items-baseline justify-between gap-3';
      var name = document.createElement('span');
      name.className = 'text-[13px]';
      name.textContent = p.label;
      var wert = document.createElement('span');
      wert.className = 'font-mono text-[13px] text-ofenmuted';
      wert.textContent = fmt(p.wert, art);
      kopf.appendChild(name);
      kopf.appendChild(wert);

      var spur = document.createElement('div');
      spur.className = 'mt-2 h-3 w-full bg-ofenkarte';
      var balken = document.createElement('div');
      balken.className = 'h-3 ' + (FARBE[p.variante] || FARBE.ofenmuted);
      balken.setAttribute('data-balken', '');
      balken.style.width = (max ? (p.wert / max * 100) : 0) + '%';
      tipBinden(balken, p.label + ': ' + fmt(p.wert, art));
      spur.appendChild(balken);

      li.appendChild(kopf);
      li.appendChild(spur);
      liste.appendChild(li);
    });

    el.appendChild(liste);
    srTabelle(el, ['Ursache', 'Betrag'], daten.posten.map(function (p) {
      return [p.label, fmt(p.wert, art)];
    }));
  }

  /* --- SVG-Helfer --- */
  var NS = 'http://www.w3.org/2000/svg';
  function svgEl(name, attr) {
    var e = document.createElementNS(NS, name);
    Object.keys(attr || {}).forEach(function (k) { e.setAttribute(k, attr[k]); });
    return e;
  }

  /* --- Ring: ein SVG-Kreis je Segment, Länge über stroke-dasharray.
         Kein <path>-Bogen nötig — dasharray plus dashoffset reiht die
         Segmente exakt aneinander. --- */
  function renderDonut(el, daten, opts) {
    opts = opts || {};
    var art = opts.format || 'zahl';
    leeren(el);

    var gesamt = daten.segmente.reduce(function (a, s) { return a + s.wert; }, 0);
    var R = 60, U = 2 * Math.PI * R;

    var rahmen = document.createElement('div');
    rahmen.className = 'flex flex-col items-center gap-6 sm:flex-row sm:gap-10';

    var svg = svgEl('svg', {
      viewBox: '0 0 150 150', width: '150', height: '150',
      'aria-hidden': 'true', class: 'shrink-0',
    });
    /* -90° gedreht, damit das erste Segment oben statt rechts beginnt */
    var gruppe = svgEl('g', { transform: 'rotate(-90 75 75)' });
    svg.appendChild(gruppe);
    gruppe.appendChild(svgEl('circle', {
      cx: 75, cy: 75, r: R, fill: 'none', 'stroke-width': 18, class: 'stroke-ofenkarte',
    }));

    var versatz = 0;
    daten.segmente.forEach(function (s) {
      var laenge = gesamt ? (s.wert / gesamt) * U : 0;
      var anteil = gesamt ? Math.round(s.wert / gesamt * 100) : 0;
      var c = svgEl('circle', {
        cx: 75, cy: 75, r: R, fill: 'none', 'stroke-width': 18,
        'stroke-dasharray': laenge + ' ' + (U - laenge),
        'stroke-dashoffset': -versatz,
        'data-segment': '',
        class: (STRICH[s.variante] || STRICH.ofenmuted),
      });
      tipBinden(c, s.label + ': ' + fmt(s.wert, art) + ' (' + anteil + ' %)');
      gruppe.appendChild(c);
      versatz += laenge;
    });

    var legende = document.createElement('ul');
    legende.className = 'grid gap-3';
    legende.setAttribute('aria-hidden', 'true');
    daten.segmente.forEach(function (s) {
      var li = document.createElement('li');
      li.className = 'flex items-center gap-3';
      var punkt = document.createElement('span');
      punkt.className = 'h-3 w-3 shrink-0 ' + (FARBE[s.variante] || FARBE.ofenmuted);
      var text = document.createElement('span');
      text.className = 'text-[13px]';
      text.textContent = s.label;
      var zahl = document.createElement('span');
      zahl.className = 'font-mono text-[13px] text-ofenmuted';
      zahl.textContent = fmt(s.wert, art)
        + (gesamt ? ' · ' + Math.round(s.wert / gesamt * 100) + ' %' : '');
      li.appendChild(punkt); li.appendChild(text); li.appendChild(zahl);
      legende.appendChild(li);
    });

    rahmen.appendChild(svg);
    rahmen.appendChild(legende);
    el.appendChild(rahmen);

    srTabelle(el, ['Gruppe', 'Anzahl', 'Anteil'], daten.segmente.map(function (s) {
      return [s.label, fmt(s.wert, art), (gesamt ? Math.round(s.wert / gesamt * 100) : 0) + ' %'];
    }));
  }

  /* --- Verlauf: Polylinie in festem viewBox, Breite skaliert per CSS.
         Die Skala beginnt bei 0 — eine abgeschnittene Achse würde kleine
         Unterschiede dramatisch aussehen lassen und wäre bei Geschäftszahlen
         irreführend. --- */
  function renderLine(el, daten, opts) {
    opts = opts || {};
    var art = opts.format || 'zahl';
    leeren(el);

    var B = 700, H = 240, L = 16, R = 16, O = 16, Uu = 34;  // Rand links/rechts/oben/unten
    var alle = daten.reihen.reduce(function (a, r) { return a.concat(r.werte); }, []);
    var max = Math.max.apply(null, alle) || 1;
    var n = daten.punkte.length;

    function x(i) { return n < 2 ? L : L + i * (B - L - R) / (n - 1); }
    function y(v) { return H - Uu - (v / max) * (H - O - Uu); }

    var svg = svgEl('svg', {
      viewBox: '0 0 ' + B + ' ' + H, class: 'w-full', 'aria-hidden': 'true',
      preserveAspectRatio: 'xMidYMid meet',
    });

    svg.appendChild(svgEl('line', {
      x1: L, y1: H - Uu, x2: B - R, y2: H - Uu, class: 'stroke-ofenlinie', 'stroke-width': 1,
    }));

    /* Rückwärts zeichnen: die Vergleichsreihe steht hinten und wird zuerst
       gemalt, damit die aktuelle Reihe obenauf liegt. */
    daten.reihen.slice().reverse().forEach(function (reihe, umgekehrt) {
      var istVergleich = (umgekehrt === 0) && daten.reihen.length > 1;
      var pl = svgEl('polyline', {
        points: reihe.werte.map(function (v, i) { return x(i) + ',' + y(v); }).join(' '),
        fill: 'none', 'stroke-width': 2,
        /* Ohne non-scaling-stroke wird die Linie auf dem Handy dünner als auf
           dem Laptop, weil das SVG in der Breite skaliert. */
        'vector-effect': 'non-scaling-stroke',
        'data-reihe': reihe.name,
        class: (STRICH[reihe.variante] || STRICH.ofenmuted),
      });
      if (istVergleich) pl.setAttribute('stroke-dasharray', '5 5');
      svg.appendChild(pl);
    });

    /* Punkte nur auf der aktuellen Reihe — sonst überlagern sich die Tooltips */
    var erste = daten.reihen[0];
    erste.werte.forEach(function (v, i) {
      var c = svgEl('circle', {
        cx: x(i), cy: y(v), r: 5, 'data-punkt': '',
        class: (FUELL[erste.variante] || FUELL.ofenmuted),
      });
      tipBinden(c, daten.punkte[i] + ': ' + fmt(v, art));
      svg.appendChild(c);
    });

    /* Auf schmalen Schirmen nur jede zweite Beschriftung, sonst überlappen sie */
    var schmal = window.matchMedia('(max-width: 640px)').matches;
    daten.punkte.forEach(function (p, i) {
      if (schmal && n > 7 && i % 2 !== 0) return;
      var t = svgEl('text', {
        x: x(i), y: H - 12, 'text-anchor': 'middle',
        class: 'fill-ofenmuted', style: 'font:12px "IBM Plex Mono",monospace',
      });
      t.textContent = p;
      svg.appendChild(t);
    });

    el.appendChild(svg);

    var legende = document.createElement('ul');
    legende.className = 'mt-4 flex flex-wrap gap-x-5 gap-y-2';
    legende.setAttribute('aria-hidden', 'true');
    daten.reihen.forEach(function (r, i) {
      var li = document.createElement('li');
      li.className = 'flex items-center gap-2 font-mono text-[11px] uppercase tracking-wider text-ofenmuted';
      var strich = document.createElement('span');
      strich.className = 'h-0.5 w-6 shrink-0 ' + (FARBE[r.variante] || FARBE.ofenmuted);
      if (i > 0) strich.style.opacity = '.6';
      li.appendChild(strich);
      li.appendChild(document.createTextNode(r.name));
      legende.appendChild(li);
    });
    el.appendChild(legende);

    srTabelle(el,
      ['Punkt'].concat(daten.reihen.map(function (r) { return r.name; })),
      daten.punkte.map(function (p, i) {
        return [p].concat(daten.reihen.map(function (r) { return fmt(r.werte[i], art); }));
      }));
  }

  return {
    renderBars: renderBars,
    renderDonut: renderDonut,
    renderLine: renderLine,
    _intern: {
      fmt: fmt, leeren: leeren, tipBinden: tipBinden, srTabelle: srTabelle,
      FARBE: FARBE, STRICH: STRICH, FUELL: FUELL,
    },
  };
})();
