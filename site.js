(function () {
  "use strict";

  var STORAGE_KEY = "fenice-lang";

  function getLang() {
    var l = localStorage.getItem(STORAGE_KEY);
    return l === "en" ? "en" : "it";
  }

  function setLang(lang) {
    var l = lang === "en" ? "en" : "it";
    localStorage.setItem(STORAGE_KEY, l);
    document.documentElement.lang = l;
    applyI18nStrings();
    syncLangButtons();
    applyTitle();
  }

  function applyI18nStrings() {
    var lang = getLang();
    document.querySelectorAll("[data-it][data-en]").forEach(function (el) {
      if (el.tagName === "TITLE") return;
      var it = el.getAttribute("data-it");
      var en = el.getAttribute("data-en");
      if (lang === "en") el.textContent = en;
      else el.textContent = it;
    });
    document.querySelectorAll("[data-it-html][data-en-html]").forEach(function (el) {
      var it = el.getAttribute("data-it-html");
      var en = el.getAttribute("data-en-html");
      el.innerHTML = lang === "en" ? en : it;
    });
  }

  function applyTitle() {
    var titleEl = document.querySelector("title[data-it][data-en]");
    if (!titleEl) return;
    var lang = getLang();
    titleEl.textContent =
      lang === "en" ? titleEl.getAttribute("data-en") : titleEl.getAttribute("data-it");
  }

  function syncLangButtons() {
    var active = getLang();
    document.querySelectorAll(".lang-btn[data-lang]").forEach(function (btn) {
      var is = btn.getAttribute("data-lang") === active;
      btn.setAttribute("aria-pressed", is ? "true" : "false");
    });
  }

  function bindLangButtons() {
    document.querySelectorAll(".lang-btn[data-lang]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        setLang(btn.getAttribute("data-lang"));
      });
    });
  }

  function initScrollIO() {
    var nodes = document.querySelectorAll("[data-io]");
    if (!nodes.length) return;

    var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!("IntersectionObserver" in window) || reduce) {
      nodes.forEach(function (el) {
        el.classList.add("is-inview");
      });
      return;
    }

    var obs = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (e) {
          if (!e.isIntersecting) return;
          var el = e.target;
          var delay = Number(el.getAttribute("data-io-delay") || 0);
          window.setTimeout(function () {
            el.classList.add("is-inview");
          }, delay);
          obs.unobserve(el);
        });
      },
      { root: null, rootMargin: "0px 0px -10% 0px", threshold: 0.08 }
    );

    nodes.forEach(function (el) {
      obs.observe(el);
    });
  }

  function initHeroParallax() {
    var heroFig = document.querySelector(".hero-figure");
    if (!heroFig) return;
    var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) return;

    var pending = false;
    var mx = 0;
    var my = 0;
    var hero = document.querySelector(".hero");

    function apply() {
      pending = false;
      var r = heroFig.getBoundingClientRect();
      var vh = window.innerHeight || 1;
      var vw = window.innerWidth || 1;
      if (r.bottom < -120 || r.top > vh + 120) return;

      var centerY = r.top + r.height * 0.42;
      var t = (vh * 0.48 - centerY) / (vh * 0.72);
      t = Math.max(-1, Math.min(1, t));
      var rx = t * 12 + my * 4;

      var centerX = r.left + r.width / 2;
      var u = (centerX - vw * 0.5) / (Math.max(vw, 1) * 0.55);
      u = Math.max(-1, Math.min(1, u));
      var ry = u * -9 + mx * 5;

      var sc = 1.02 + (1 - Math.abs(t)) * 0.05;
      heroFig.style.transform =
        "rotateX(" + rx.toFixed(2) + "deg) rotateY(" + ry.toFixed(2) + "deg) scale(" + sc.toFixed(3) + ")";
    }

    function tick() {
      if (!pending) {
        pending = true;
        requestAnimationFrame(apply);
      }
    }

    if (hero) {
      hero.addEventListener(
        "pointermove",
        function (e) {
          var rect = hero.getBoundingClientRect();
          if (rect.width < 1 || rect.height < 1) return;
          mx = (e.clientX - rect.left) / rect.width - 0.5;
          my = (e.clientY - rect.top) / rect.height - 0.5;
          mx = Math.max(-0.5, Math.min(0.5, mx)) * 2;
          my = Math.max(-0.5, Math.min(0.5, my)) * 2;
          tick();
        },
        { passive: true }
      );
      hero.addEventListener("pointerleave", function () {
        mx = 0;
        my = 0;
        tick();
      });
    }

    window.addEventListener("scroll", tick, { passive: true });
    window.addEventListener("resize", tick, { passive: true });
    tick();
  }

  function init() {
    document.documentElement.lang = getLang();
    applyI18nStrings();
    syncLangButtons();
    bindLangButtons();
    applyTitle();
    initScrollIO();
    initHeroParallax();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
