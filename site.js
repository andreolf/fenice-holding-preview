(function () {
  "use strict";

  var STORAGE_KEY = "fenice-lang";
  var THEME_KEY = "fenice-theme";

  function getTheme() {
    try {
      return localStorage.getItem(THEME_KEY) === "dark" ? "dark" : "light";
    } catch (e) {
      return "light";
    }
  }

  function applyTheme(mode) {
    var dark = mode === "dark";
    if (dark) document.documentElement.setAttribute("data-theme", "dark");
    else document.documentElement.removeAttribute("data-theme");
    syncThemeButtons();
  }

  function setTheme(mode) {
    var next = mode === "dark" ? "dark" : "light";
    try {
      localStorage.setItem(THEME_KEY, next);
    } catch (e) {}
    applyTheme(next);
  }

  function syncThemeButtons() {
    var t = getTheme();
    document.querySelectorAll("button[data-theme]").forEach(function (btn) {
      var is = btn.getAttribute("data-theme") === t;
      btn.setAttribute("aria-pressed", is ? "true" : "false");
    });
  }

  function bindThemeButtons() {
    document.querySelectorAll("button[data-theme]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        setTheme(btn.getAttribute("data-theme"));
      });
    });
  }

  function initTheme() {
    applyTheme(getTheme());
  }

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

  function initScrollParallax() {
    var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) return;

    var heroFig = document.querySelector(".hero-figure");
    var heroMedia = document.querySelector(".hero-figure__media");
    var hero = document.querySelector(".hero");
    if (!heroFig || !hero) return;

    var pending = false;
    var mx = 0;
    var my = 0;

    function apply() {
      pending = false;
      var vh = window.innerHeight || 1;
      var vw = window.innerWidth || 1;
      var rH = hero.getBoundingClientRect();
      if (rH.bottom < -100 || rH.top > vh + 80) {
        if (heroMedia) heroMedia.style.transform = "";
        heroFig.style.transform = "";
        return;
      }

      var scrollY = window.scrollY || document.documentElement.scrollTop || 0;
      var openRaw = Math.min(1, scrollY / (vh * 0.36));
      var openEase = openRaw * openRaw * (3 - 2 * openRaw);

      var span = Math.max(vh + rH.height, 1);
      var prog = (vh - rH.top) / span;
      prog = Math.max(0, Math.min(1, prog));
      var drift = (prog - 0.28) * 140;
      if (heroMedia) {
        heroMedia.style.transform =
          "translate3d(0," + drift.toFixed(1) + "px,0) scale(1.12)";
      }

      var r = heroFig.getBoundingClientRect();
      if (r.bottom < -120 || r.top > vh + 120) {
        heroFig.style.transform = "";
        return;
      }

      var centerY = r.top + r.height * 0.42;
      var t = (vh * 0.48 - centerY) / (vh * 0.72);
      t = Math.max(-1, Math.min(1, t));

      var openRx = (1 - openEase) * 16;
      var openTz = (1 - openEase) * -34;
      var openScale = 0.9 + openEase * 0.12;

      var rx = openRx + t * 4 + my * 2.5;
      var centerX = r.left + r.width / 2;
      var u = (centerX - vw * 0.5) / (Math.max(vw, 1) * 0.55);
      u = Math.max(-1, Math.min(1, u));
      var ry = u * -5 + mx * 3;
      var rz = (1 - openEase) * -2;
      var sc = openScale * (1.01 + (1 - Math.abs(t)) * 0.03);

      heroFig.style.transform =
        "translateZ(" +
        openTz.toFixed(1) +
        "px) rotateX(" +
        rx.toFixed(2) +
        "deg) rotateY(" +
        ry.toFixed(2) +
        "deg) rotateZ(" +
        rz.toFixed(2) +
        "deg) scale(" +
        sc.toFixed(3) +
        ")";

      var hint = document.querySelector(".js-scroll-hint");
      if (hint) {
        var hOp = 1 - Math.max(0, (openEase - 0.42) / 0.48);
        hint.style.opacity = hOp < 0.08 ? "0" : String(Math.max(0.15, hOp));
        hint.style.pointerEvents = hOp < 0.12 ? "none" : "";
      }
    }

    function tick() {
      if (!pending) {
        pending = true;
        requestAnimationFrame(apply);
      }
    }

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

    window.addEventListener("scroll", tick, { passive: true });
    window.addEventListener("resize", tick, { passive: true });
    tick();
  }

  function init() {
    initTheme();
    document.documentElement.lang = getLang();
    applyI18nStrings();
    syncLangButtons();
    bindLangButtons();
    bindThemeButtons();
    applyTitle();
    initScrollIO();
    initScrollParallax();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
