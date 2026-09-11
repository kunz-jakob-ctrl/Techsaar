/* =========================================================================
   SBS BAU — Projektdaten
   Diese Liste füllt die Projektseite. In der späteren echten Fassung kommt
   sie aus der Projektverwaltung (intern.html) statt aus dieser Datei.
   Alle Angaben und Bilder sind Beispiele.
   ========================================================================= */
window.PROJEKTE = [
  {
    id: "p1",
    titel: "Komplettsanierung Einfamilienhaus, Baujahr 1968",
    ort: "Homburg",
    kategorie: "Komplettsanierung",
    jahr: "2025",
    flaeche: "186 m²",
    bauzeit: "7 Monate",
    gewerke: "11",
    umfang: "Kernsanierung inkl. Dach",
    volumen: "150.000 – 400.000 €",
    vorher: "img/p1-vorher.jpg",
    nachher: "img/p1-nachher.jpg",
    galerie: ["img/p1-vorher.jpg", "img/leistung-trockenbau.jpg", "img/leistung-bad.jpg", "img/p1-nachher.jpg"],
    text: "Das Haus war seit dem Erstbezug 1968 unverändert: Einrohrheizung, " +
      "Elektrik ohne Fehlerstromschutz, feuchte Kellerwand, ungedämmtes Dach. " +
      "Wir haben bis auf den Rohbau entkernt, den Grundriss im Erdgeschoss geöffnet, " +
      "alle Leitungen neu verlegt, Dach und Fassade gedämmt und schlüsselfertig übergeben.",
    leistungen: ["Entkernung und Entsorgung", "Statik und Durchbrüche", "Elektro- und Sanitärinstallation",
      "Trockenbau und Innenausbau", "Estrich und Bodenbeläge", "Zwei Bäder komplett",
      "Dachsanierung mit Dämmung", "Fassade und Fenster", "Maler- und Fliesenarbeiten"]
  },
  {
    id: "p2",
    titel: "Zwei Bäder in einem Zeitfenster",
    ort: "Blieskastel",
    kategorie: "Bäder",
    jahr: "2025",
    flaeche: "14 m² + 6 m²",
    bauzeit: "6 Wochen",
    gewerke: "6",
    umfang: "Zwei Bäder komplett",
    volumen: "50.000 – 150.000 €",
    vorher: "img/p2-vorher.jpg",
    nachher: "img/p2-nachher.jpg",
    galerie: ["img/p2-vorher.jpg", "img/p2-nachher.jpg", "img/leistung-bad.jpg", "img/p3-nachher.jpg"],
    text: "Familienbad und Gäste-WC wurden gleichzeitig zurückgebaut, damit die " +
      "Rohinstallation in einem Zug laufen konnte. Die Bauherren blieben im Haus wohnen — " +
      "dafür haben wir eine Dusche im Hauswirtschaftsraum provisorisch angeschlossen.",
    leistungen: ["Demontage und Entsorgung", "Rohinstallation Sanitär und Elektro",
      "Abdichtung nach DIN 18534", "Estrich und Fliesen", "Möbel, Sanitärobjekte, Licht"]
  },
  {
    id: "p3",
    titel: "Bürofläche auf zwei Etagen",
    ort: "Zweibrücken",
    kategorie: "Innenausbau",
    jahr: "2024",
    flaeche: "640 m²",
    bauzeit: "4 Monate",
    gewerke: "8",
    umfang: "Innenausbau im laufenden Betrieb",
    volumen: "150.000 – 400.000 €",
    vorher: "img/p3-vorher.jpg",
    nachher: "img/p3-nachher.jpg",
    galerie: ["img/p3-vorher.jpg", "img/leistung-trockenbau.jpg", "img/p3-nachher.jpg", "img/p6-nachher.jpg"],
    text: "Aus einer offenen Lagerfläche wurden Büros, zwei Besprechungsräume und eine " +
      "Teeküche. Der Betrieb lief weiter — deshalb haben wir etagenweise gearbeitet und " +
      "die lauten Gewerke auf Randzeiten gelegt.",
    leistungen: ["Trockenbau mit Schall- und Brandschutz", "Abgehängte Decken mit Akustikelementen",
      "Elektro, Netzwerk, Beleuchtung", "Türen und Glaselemente", "Bodenbeläge", "Malerarbeiten"]
  },
  {
    id: "p4",
    titel: "Aus Dachboden wird Wohnung",
    ort: "St. Ingbert",
    kategorie: "Dachgeschoss",
    jahr: "2024",
    flaeche: "94 m²",
    bauzeit: "5 Monate",
    gewerke: "9",
    umfang: "Dachgeschossausbau mit Gauben",
    volumen: "150.000 – 400.000 €",
    vorher: "img/p4-vorher.jpg",
    nachher: "img/p4-nachher.jpg",
    galerie: ["img/p4-vorher.jpg", "img/leistung-dach.jpg", "img/p4-nachher.jpg", "img/p1-nachher.jpg"],
    text: "Der Dachstuhl war tragfähig, aber ungedämmt und ohne ausreichende Kopfhöhe. " +
      "Nach der statischen Prüfung haben wir zwei Schleppgauben eingebaut, den Aufbau " +
      "gedämmt und eine vollwertige Wohnung mit eigenem Bad hergestellt.",
    leistungen: ["Statik und Genehmigungsplanung", "Zwei Schleppgauben", "Zwischensparrendämmung",
      "Dachflächenfenster", "Trockenbau und Innenausbau", "Bad komplett", "Elektro und Heizung"]
  },
  {
    id: "p5",
    titel: "Energetische Sanierung Mehrfamilienhaus",
    ort: "Homburg",
    kategorie: "Komplettsanierung",
    jahr: "2023",
    flaeche: "6 Wohneinheiten",
    bauzeit: "9 Monate",
    gewerke: "12",
    umfang: "Fassade, Dach, Haustechnik",
    volumen: "über 400.000 €",
    vorher: "img/p5-vorher.jpg",
    nachher: "img/p5-nachher.jpg",
    galerie: ["img/p5-vorher.jpg", "img/leistung-sanierung.jpg", "img/p5-nachher.jpg", "img/region.jpg"],
    text: "Sechs bewohnte Einheiten, ein Bauzeitenplan, keine Ersatzwohnungen: Fassade, " +
      "Dach und Heizung wurden im laufenden Betrieb erneuert. Jeder Mietpartei lag zwei " +
      "Wochen vorher der Ablauf für ihre Wohnung schriftlich vor.",
    leistungen: ["Gerüst und Baustelleneinrichtung", "Wärmedämmverbundsystem", "Fenster und Rollläden",
      "Dachdämmung und Eindeckung", "Heizungsanlage", "Balkonsanierung", "Außenanlagen"]
  },
  {
    id: "p6",
    titel: "Betriebsgebäude, Umbau und Erweiterung",
    ort: "Bexbach",
    kategorie: "Gewerbe",
    jahr: "2023",
    flaeche: "1.150 m²",
    bauzeit: "11 Monate",
    gewerke: "12",
    umfang: "Umbau mit Anbau",
    volumen: "über 400.000 €",
    vorher: "img/p6-vorher.jpg",
    nachher: "img/p6-nachher.jpg",
    galerie: ["img/p6-vorher.jpg", "img/p3-vorher.jpg", "img/p6-nachher.jpg", "img/p3-nachher.jpg"],
    text: "Werkstatt, Lager und Sozialräume unter einem Dach: Der Bestand wurde umgebaut, " +
      "ein Anbau ergänzt und die Verwaltung in ein neues Obergeschoss verlegt. " +
      "Die Produktion stand an keinem einzigen Tag still.",
    leistungen: ["Abbruch und Rückbau", "Rohbau Anbau", "Stahlbau und Tore",
      "Brandschutzkonzept und Umsetzung", "Sozial- und Sanitärräume", "Verwaltung im Obergeschoss"]
  }
];
