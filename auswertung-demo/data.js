/* Beispieldatensatz für die Produkt-Demo. Keine echten Zahlen.
   Bei einer echten Kundenseite wird ausschließlich diese Datei ersetzt —
   charts.js und index.html bleiben unangetastet.

   Regeln (werden von tools/check-daten.mjs geprüft):
   - Ring-Summe, Heatmap-Summe und die aktuelle Verlaufsreihe ergeben je „Buchungen".
   - Die Summe der Verlustposten ergibt „Entgangener Umsatz".
   - werteMobil fasst die Spalten 0–2, 3–5, 6–8, 9–11 zusammen; Zeilensumme bleibt gleich.
   - Wochenform: Samstag am stärksten, Sonntag am schwächsten, Mittagsloch bei 13/14 Uhr. */
window.DATEN = {

  '7t': {
    kennzahlen: [
      { label: 'Buchungen',          wert: 84,  format: 'zahl',    delta: 12 },
      { label: 'Auslastung',         wert: 71,  format: 'prozent', delta: 4 },
      { label: 'Absagequote',        wert: 9,   format: 'prozent', delta: -2,  gutIstWeniger: true },
      { label: 'Entgangener Umsatz', wert: 340, format: 'euro',    delta: -55, gutIstWeniger: true },
    ],
    heatmap: {
      zeilen:  ['Mo','Di','Mi','Do','Fr','Sa','So'],
      spalten: ['09','10','11','12','13','14','15','16','17','18','19','20'],
      spaltenMobil: ['Vorm.','Mittag','Nachm.','Abend'],
      werte: [
        [0,1,2,1,0,1,2,2,1,1,1,0],
        [0,0,1,2,1,1,1,2,1,1,0,0],
        [1,1,1,1,0,1,2,2,1,1,0,0],
        [0,1,2,2,1,1,2,2,1,1,0,0],
        [1,1,2,2,1,2,2,2,1,1,1,0],
        [2,2,3,3,2,2,2,1,1,0,0,0],
        [0,0,1,1,1,1,0,0,0,0,0,0],
      ],
      werteMobil: [
        [3,2,5,2],
        [1,4,4,1],
        [3,2,5,1],
        [3,4,5,1],
        [4,5,5,2],
        [7,7,4,0],
        [1,3,0,0],
      ],
      max: 3,
    },
    verlauf: {
      punkte: ['Mo','Di','Mi','Do','Fr','Sa','So'],
      reihen: [
        { name: 'Diese Woche', werte: [12,10,11,13,16,18,4], variante: 'kobalt' },
        { name: 'Vorwoche',    werte: [10,9,10,12,14,15,5],  variante: 'ofenmuted' },
      ],
    },
    ring: {
      segmente: [
        { label: 'Stammkunden', wert: 52, variante: 'kobalt' },
        { label: 'Neukunden',   wert: 32, variante: 'celadon' },
      ],
    },
    verluste: {
      posten: [
        { label: 'No-Shows',             wert: 180, variante: 'terra' },
        { label: 'Kurzfristige Absagen', wert: 120, variante: 'senf' },
        { label: 'Leere Zeitfenster',    wert: 40,  variante: 'ofenmuted' },
      ],
    },
  },

  '30t': {
    kennzahlen: [
      { label: 'Buchungen',          wert: 361,  format: 'zahl',    delta: 48 },
      { label: 'Auslastung',         wert: 68,   format: 'prozent', delta: -3 },
      { label: 'Absagequote',        wert: 11,   format: 'prozent', delta: 2,   gutIstWeniger: true },
      { label: 'Entgangener Umsatz', wert: 1480, format: 'euro',    delta: 180, gutIstWeniger: true },
    ],
    heatmap: {
      zeilen:  ['Mo','Di','Mi','Do','Fr','Sa','So'],
      spalten: ['09','10','11','12','13','14','15','16','17','18','19','20'],
      spaltenMobil: ['Vorm.','Mittag','Nachm.','Abend'],
      werte: [
        [3,4,5,4,2,2,5,5,4,4,4,2],
        [3,3,4,4,2,2,5,5,4,4,3,2],
        [4,4,5,4,2,2,6,6,4,4,4,2],
        [4,5,6,5,2,3,6,6,5,4,4,2],
        [5,6,7,6,3,3,7,7,6,5,5,3],
        [7,8,9,8,4,4,8,8,7,5,5,3],
        [3,4,5,4,2,2,4,4,3,3,2,2],
      ],
      werteMobil: [
        [12,8,14,10],
        [10,8,14,9],
        [13,8,16,10],
        [15,10,17,10],
        [18,12,20,13],
        [24,16,23,13],
        [12,8,11,7],
      ],
      max: 9,
    },
    verlauf: {
      punkte: ['KW 28','KW 29','KW 30','KW 31'],
      reihen: [
        { name: 'Dieser Monat', werte: [82,91,95,93], variante: 'kobalt' },
        { name: 'Vormonat',     werte: [76,80,84,73], variante: 'ofenmuted' },
      ],
    },
    ring: {
      segmente: [
        { label: 'Stammkunden', wert: 214, variante: 'kobalt' },
        { label: 'Neukunden',   wert: 147, variante: 'celadon' },
      ],
    },
    verluste: {
      posten: [
        { label: 'No-Shows',             wert: 760, variante: 'terra' },
        { label: 'Kurzfristige Absagen', wert: 520, variante: 'senf' },
        { label: 'Leere Zeitfenster',    wert: 200, variante: 'ofenmuted' },
      ],
    },
  },

  '12m': {
    kennzahlen: [
      { label: 'Buchungen',          wert: 4180,  format: 'zahl',    delta: 520 },
      { label: 'Auslastung',         wert: 73,    format: 'prozent', delta: 5 },
      { label: 'Absagequote',        wert: 10,    format: 'prozent', delta: -1,   gutIstWeniger: true },
      { label: 'Entgangener Umsatz', wert: 16900, format: 'euro',    delta: -900, gutIstWeniger: true },
    ],
    heatmap: {
      zeilen:  ['Mo','Di','Mi','Do','Fr','Sa','So'],
      spalten: ['09','10','11','12','13','14','15','16','17','18','19','20'],
      spaltenMobil: ['Vorm.','Mittag','Nachm.','Abend'],
      werte: [
        [38,45,52,47,25,26,58,57,50,46,42,24],
        [36,42,49,44,23,24,54,53,47,43,39,24],
        [41,48,56,50,27,28,62,61,53,49,45,25],
        [45,53,62,55,30,31,68,67,59,54,50,28],
        [55,64,75,67,36,37,82,81,71,65,60,35],
        [70,80,92,82,44,45,98,96,85,76,70,43],
        [33,39,45,40,21,22,49,48,42,38,33,26],
      ],
      werteMobil: [
        [135,98,165,112],
        [127,91,154,106],
        [145,105,176,119],
        [160,116,194,132],
        [194,140,234,160],
        [242,171,279,189],
        [117,83,139,97],
      ],
      max: 98,
    },
    verlauf: {
      punkte: ['Jan','Feb','Mär','Apr','Mai','Jun','Jul','Aug','Sep','Okt','Nov','Dez'],
      reihen: [
        { name: 'Dieses Jahr', werte: [280,265,310,340,375,395,410,330,360,395,390,330], variante: 'kobalt' },
        { name: 'Vorjahr',     werte: [250,240,275,300,335,350,365,300,325,355,350,315], variante: 'ofenmuted' },
      ],
    },
    ring: {
      segmente: [
        { label: 'Stammkunden', wert: 2760, variante: 'kobalt' },
        { label: 'Neukunden',   wert: 1420, variante: 'celadon' },
      ],
    },
    verluste: {
      posten: [
        { label: 'No-Shows',             wert: 8600, variante: 'terra' },
        { label: 'Kurzfristige Absagen', wert: 6100, variante: 'senf' },
        { label: 'Leere Zeitfenster',    wert: 2200, variante: 'ofenmuted' },
      ],
    },
  },

};
