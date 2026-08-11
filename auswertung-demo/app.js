/* Verdrahtung: kennt die Inhalte, aber nicht das Zeichnen.
   charts.js bleibt dadurch frei von allem Fachlichen. */
(function () {
  'use strict';
  var AKTUELL = '7t';

  function zeichne(key) {
    var satz = window.DATEN[key];
    if (!satz) return;
    Charts.renderBars(document.getElementById('verluste'), satz.verluste, { format: 'euro' });
  }

  zeichne(AKTUELL);
})();
