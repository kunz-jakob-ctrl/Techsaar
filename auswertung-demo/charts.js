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

  return {
    renderBars: renderBars,
    _intern: {
      fmt: fmt, leeren: leeren, tipBinden: tipBinden, srTabelle: srTabelle,
      FARBE: FARBE, STRICH: STRICH, FUELL: FUELL,
    },
  };
})();
