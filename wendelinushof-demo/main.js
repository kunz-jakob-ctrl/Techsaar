/* Wendelinushof-Demo — gemeinsames Seiten-JavaScript (kein Framework, kein Request) */
(function () {
  "use strict";

  /* --- Mobile-Navigation ------------------------------------------------ */
  var burger = document.querySelector("[data-nav-toggle]");
  var mobileNav = document.querySelector("[data-nav-panel]");
  if (burger && mobileNav) {
    burger.addEventListener("click", function () {
      var open = mobileNav.classList.toggle("hidden") === false;
      burger.setAttribute("aria-expanded", open ? "true" : "false");
      document.documentElement.classList.toggle("overflow-hidden", open);
    });
  }

  /* --- Bereiche-Dropdown (Desktop: Klick oder Hover via CSS-Fokus) ------ */
  document.querySelectorAll("[data-dropdown]").forEach(function (wrap) {
    var btn = wrap.querySelector("button");
    var menu = wrap.querySelector("[data-dropdown-menu]");
    if (!btn || !menu) return;
    btn.addEventListener("click", function () {
      var open = menu.classList.toggle("hidden") === false;
      btn.setAttribute("aria-expanded", open ? "true" : "false");
    });
    document.addEventListener("click", function (e) {
      if (!wrap.contains(e.target)) {
        menu.classList.add("hidden");
        btn.setAttribute("aria-expanded", "false");
      }
    });
    wrap.addEventListener("keydown", function (e) {
      if (e.key === "Escape") {
        menu.classList.add("hidden");
        btn.setAttribute("aria-expanded", "false");
        btn.focus();
      }
    });
  });

  /* --- Sticky-Kontaktleiste: verschwindet bei Formular & Footer --------- */
  var bar = document.querySelector(".sticky-cta");
  if (bar && "IntersectionObserver" in window) {
    var targets = document.querySelectorAll("#reservierung, footer");
    if (targets.length) {
      var visible = new Set();
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (en) {
          if (en.isIntersecting) visible.add(en.target); else visible.delete(en.target);
        });
        bar.classList.toggle("is-hidden", visible.size > 0);
      }, { rootMargin: "0px 0px -30% 0px" });
      targets.forEach(function (t) { io.observe(t); });
    }
  }

  /* --- Reservierungs-Demo-Formular (versendet nichts) ------------------- */
  var form = document.querySelector("[data-demo-form]");
  if (form) {
    var dateInput = form.querySelector('input[type="date"]');
    if (dateInput) {
      // Online-Anfragen laut Haus-Regel erst ab 3 Tagen im Voraus
      var min = new Date();
      min.setDate(min.getDate() + 3);
      dateInput.min = min.toISOString().slice(0, 10);
    }
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      if (!form.reportValidity()) return;
      var success = document.querySelector("[data-demo-success]");
      if (success) {
        form.classList.add("hidden");
        success.classList.remove("hidden");
        success.setAttribute("tabindex", "-1");
        success.focus();
      }
    });
  }

  /* --- Jahreszahl im Footer --------------------------------------------- */
  document.querySelectorAll("[data-year]").forEach(function (el) {
    el.textContent = new Date().getFullYear();
  });
})();
