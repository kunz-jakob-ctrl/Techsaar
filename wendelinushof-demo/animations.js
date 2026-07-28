/* =====================================================================
 * animations.js — wiederverwendbare Scroll-/Einblende-Animationen
 * ---------------------------------------------------------------------
 * Nutzung in jeder HTML-Seite:
 *   <script src="https://cdn.jsdelivr.net/npm/motion@11/dist/motion.js"></script>
 *   <script src="/static/animations.js"></script>
 *
 * Dann im HTML einfach Attribute setzen:
 *   <div data-animate="fade-up">…</div>          einzelnes Element
 *   <div data-animate="zoom" data-animate-delay="0.2">…</div>
 *   <ul  data-animate-children="fade-up">…</ul>   alle Kinder, auch
 *                                                 später per JS eingefügte
 *
 * Typen: fade · fade-up · fade-down · fade-left · fade-right · zoom · pop
 *
 * Failsafe: Lädt das Motion-CDN nicht oder ist JS aus, bleibt der Inhalt
 * normal sichtbar – nie unsichtbar hängen.
 * ===================================================================== */
(function () {
  "use strict";

  var DURATION = 0.6;
  var EASE = [0.22, 1, 0.36, 1]; // sanftes "ease-out-quint"

  // Start-Keyframes je Typ ([von, nach])
  function keyframes(type) {
    switch (type) {
      case "fade":       return { opacity: [0, 1] };
      case "fade-down":  return { opacity: [0, 1], y: [-24, 0] };
      case "fade-left":  return { opacity: [0, 1], x: [24, 0] };
      case "fade-right": return { opacity: [0, 1], x: [-24, 0] };
      case "zoom":       return { opacity: [0, 1], scale: [0.92, 1] };
      case "pop":        return { opacity: [0, 1], scale: [0.6, 1] };
      case "fade-up":
      default:           return { opacity: [0, 1], y: [24, 0] };
    }
  }

  // Endzustand dauerhaft ins Element schreiben (Motion/WAAPI committet nicht
  // von selbst und würde sonst auf die CSS-Regel opacity:0 zurückfallen).
  function commitVisible(el) {
    el.style.opacity = "1";
    el.style.transform = "none";
  }

  function play(animate, el, kf, delay) {
    var d = delay || 0;
    var controls = animate(el, kf, { duration: DURATION, delay: d, ease: EASE });
    if (controls && controls.finished && typeof controls.finished.then === "function") {
      controls.finished.then(function () { commitVisible(el); }, function () { commitVisible(el); });
    }
    // Sicherheitsnetz: Endzustand garantiert festschreiben, falls das
    // finished-Promise nicht auflöst (z. B. wenn ein Hintergrund-Tab
    // requestAnimationFrame drosselt). commitVisible ist idempotent.
    setTimeout(function () { commitVisible(el); }, (d + DURATION) * 1000 + 400);
    return controls;
  }

  function revealAllInstantly() {
    document.querySelectorAll("[data-animate]").forEach(commitVisible);
  }

  function start() {
    // Reduzierte Bewegung gewünscht → Inhalte sofort zeigen, keine Effekte.
    if (window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      revealAllInstantly();
      return;
    }
    // Kein Motion-CDN geladen → alles sofort sichtbar zeigen, kein Effekt.
    if (!window.Motion || !window.Motion.inView || !window.Motion.animate) {
      revealAllInstantly();
      return;
    }
    var animate = window.Motion.animate;
    var inView = window.Motion.inView;

    // --- Einzelelemente: beim Hereinscrollen einmalig einblenden ---------
    document.querySelectorAll("[data-animate]").forEach(function (el) {
      var type = el.getAttribute("data-animate") || "fade-up";
      var delay = parseFloat(el.getAttribute("data-animate-delay") || "0");
      var done = false;
      function trigger() {
        if (done) return;
        done = true;
        play(animate, el, keyframes(type), delay);
      }
      inView(el, trigger, { amount: 0.15 });
      // Fallback: Elemente, die schon beim Laden sichtbar sind, anstoßen –
      // für Umgebungen, in denen IntersectionObserver dafür nicht feuert.
      // Below-the-fold-Elemente bleiben dem inView-Scroll überlassen.
      setTimeout(function () {
        var vh = window.innerHeight || document.documentElement.clientHeight || 0;
        var r = el.getBoundingClientRect();
        // vh === 0 → degenerierte Umgebung (z. B. Headless): einfach zeigen.
        if (!vh || (r.top < vh && r.bottom > 0)) trigger();
      }, 100);
    });

    // --- Container: alle (auch dynamisch eingefügten) Kinder staffeln ---
    document.querySelectorAll("[data-animate-children]").forEach(function (container) {
      var type = container.getAttribute("data-animate-children") || "fade-up";

      function run(nodes) {
        nodes.forEach(function (el, i) {
          if (el.nodeType !== 1) return;
          el.style.opacity = "0";
          play(animate, el, keyframes(type), i * 0.06);
        });
      }

      // bereits vorhandene Kinder
      run(Array.prototype.slice.call(container.children));

      // später per JavaScript eingefügte Kinder
      var obs = new MutationObserver(function (mutations) {
        var added = [];
        mutations.forEach(function (m) {
          Array.prototype.forEach.call(m.addedNodes, function (n) { added.push(n); });
        });
        if (added.length) run(added);
      });
      obs.observe(container, { childList: true });
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", start);
  } else {
    start();
  }
})();
