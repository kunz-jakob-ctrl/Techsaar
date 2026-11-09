const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const G = require("../galerie.js");

/* Den echten Pool aus index.html lesen - sonst prueft der Test eine Liste,
   die es auf der Seite gar nicht gibt. */
const html = fs.readFileSync(path.join(__dirname, "..", "index.html"), "utf8");
const block = html.match(/\n  galerie: (\[[\s\S]*?\n  \]),\n/);
const pool = Function('"use strict"; return ' + block[1])();

test("Pool ist da und jeder Eintrag hat Bild und Alt-Text", () => {
  assert.ok(pool.length >= 4);
  for (const b of pool) {
    assert.match(b.src, /^img\/galerie-\d+\.jpg\?v=\d{4}-\d{2}-\d{2}$/);
    assert.ok(b.alt.length > 20, "Alt-Text zu kurz: " + b.src);
  }
});
test("jedes Bild liegt in img/", () => {
  for (const b of pool) {
    const datei = path.join(__dirname, "..", b.src.split("?")[0]);
    assert.ok(fs.existsSync(datei), "fehlt: " + b.src);
  }
});
test("HTML zeigt ohne JavaScript die ersten Pool-Bilder", () => {
  const sektion = html.slice(html.indexOf('<section id="galerie"'));
  const imHtml = [...sektion.slice(0, sektion.indexOf("</section>")).matchAll(/<img src="([^"]+)"/g)].map(m => m[1]);
  assert.deepEqual(imHtml, pool.slice(0, imHtml.length).map(b => b.src));
});
test("keine Datei doppelt im Pool", () => {
  const dateien = pool.map(b => b.src.split("?")[0]);
  assert.equal(new Set(dateien).size, dateien.length);
});
test("Zeitraum wechselt genau nach 14 Tagen, montags", () => {
  assert.equal(G.zeitraum("2026-11-09"), 0);
  assert.equal(G.zeitraum("2026-11-22"), 0);
  assert.equal(G.zeitraum("2026-11-23"), 1);
  assert.equal(G.zeitraum("2026-11-08"), -1);
});
test("Zeitumstellung verschiebt den Wechsel nicht", () => {
  assert.equal(G.zeitraum(new Date(2027, 2, 28, 23, 30)), G.zeitraum("2027-03-28"));
  assert.equal(G.zeitraum(new Date(2027, 9, 31, 0, 30)), G.zeitraum("2027-10-31"));
});
test("naechster Zeitraum zeigt lauter andere Bilder", () => {
  const a = G.auswahl(pool, "2026-11-09", 4), b = G.auswahl(pool, "2026-11-23", 4);
  assert.equal(a.filter(x => b.includes(x)).length, 0);
});
test("ueber zwei Jahre: nie doppelt, nie zwei aus derselben Gruppe", () => {
  for (let z = 0; z < 60; z++) {
    const tag = new Date(Date.UTC(2026, 10, 9) + z * 14 * 86400000).toISOString().slice(0, 10);
    const bilder = G.auswahl(pool, tag, 4);
    assert.equal(bilder.length, 4);
    assert.equal(new Set(bilder).size, 4, tag);
    const gruppen = bilder.map(b => b.gruppe).filter(Boolean);
    assert.equal(new Set(gruppen).size, gruppen.length, "aehnliche Motive zusammen am " + tag);
  }
});
test("leerer Pool bricht nichts", () => {
  assert.deepEqual(G.auswahl([], "2026-11-09", 4), []);
  assert.deepEqual(G.auswahl(undefined, "2026-11-09", 4), []);
});
