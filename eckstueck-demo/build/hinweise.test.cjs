const test = require("node:test");
const assert = require("node:assert/strict");
const H = require("../hinweise.js");

const event = { art:"event", von:"2026-10-20", bis:"2026-10-31", text:"Sa 31.10. · Halloween-Malabend", link:"#kontakt", linkText:"Platz anfragen" };
const event2 = { art:"event", von:"2026-10-01", bis:"2026-11-15", text:"Herbst-Workshop" };
const zu = { art:"geschlossen", von:"2026-10-25", bis:"2026-10-28", text:"25.–28.10. geschlossen" };
const zuVorab = { art:"geschlossen", von:"2026-12-15", bis:"2026-12-27", zu:["2026-12-24","2026-12-27"], text:"24.–27.12. geschlossen" };

test("tagIso nutzt lokales Datum", () => {
  assert.equal(H.tagIso(new Date(2026, 9, 5, 23, 30)), "2026-10-05");
});
test("leere oder fehlende Liste -> null", () => {
  assert.equal(H.aktiverHinweis(undefined, "2026-10-20"), null);
  assert.equal(H.aktiverHinweis([], "2026-10-20"), null);
});
test("vor von -> nicht aktiv", () => {
  assert.equal(H.aktiverHinweis([event], "2026-10-19"), null);
});
test("am von- und am bis-Tag aktiv", () => {
  assert.equal(H.aktiverHinweis([event], "2026-10-20"), event);
  assert.equal(H.aktiverHinweis([event], "2026-10-31"), event);
});
test("nach bis -> nicht aktiv", () => {
  assert.equal(H.aktiverHinweis([event], "2026-11-01"), null);
});
test("geschlossen schlaegt event", () => {
  assert.equal(H.aktiverHinweis([event, zu], "2026-10-26"), zu);
});
test("zwei Events -> fruehestes bis", () => {
  assert.equal(H.aktiverHinweis([event2, event], "2026-10-22"), event);
});
test("Date-Objekt wird akzeptiert", () => {
  assert.equal(H.aktiverHinweis([event], new Date(2026, 9, 25, 12)), event);
});
test("ungueltige Eintraege werden ignoriert", () => {
  const kaputt = [
    { art:"party", von:"2026-10-01", bis:"2026-10-31", text:"x" },
    { art:"event", von:"1.10.2026", bis:"2026-10-31", text:"x" },
    { art:"event", von:"2026-10-31", bis:"2026-10-01", text:"x" },
    { art:"event", von:"2026-10-01", bis:"2026-10-31", text:"   " },
    null,
  ];
  assert.equal(H.aktiverHinweis(kaputt, "2026-10-15"), null);
});
test("istGeschlossen: von..bis ohne zu", () => {
  assert.equal(H.istGeschlossen([zu], "2026-10-24"), false);
  assert.equal(H.istGeschlossen([zu], "2026-10-25"), true);
  assert.equal(H.istGeschlossen([zu], "2026-10-28"), true);
  assert.equal(H.istGeschlossen([zu], "2026-10-29"), false);
});
test("istGeschlossen: zu weicht von Anzeigezeitraum ab", () => {
  assert.equal(H.aktiverHinweis([zuVorab], "2026-12-16"), zuVorab);
  assert.equal(H.istGeschlossen([zuVorab], "2026-12-16"), false);
  assert.equal(H.istGeschlossen([zuVorab], "2026-12-24"), true);
});
test("vertauschtes zu faellt auf von..bis zurueck", () => {
  const x = { ...zuVorab, zu:["2026-12-27","2026-12-24"] };
  assert.equal(H.istGeschlossen([x], "2026-12-16"), true);
});
test("istGeschlossen ignoriert Events", () => {
  assert.equal(H.istGeschlossen([event], "2026-10-25"), false);
});
test("sichererLink erlaubt nur # und https", () => {
  assert.equal(H.sichererLink("#kontakt"), "#kontakt");
  assert.equal(H.sichererLink("https://connect.shore.com/x"), "https://connect.shore.com/x");
  assert.equal(H.sichererLink("javascript:alert(1)"), null);
  assert.equal(H.sichererLink("http://example.com"), null);
  assert.equal(H.sichererLink(undefined), null);
});
