(function () {
  "use strict";

  var STORAGE_KEY = "fenice-lang";
  var THEME_KEY = "fenice-theme";

  function getTheme() {
    try {
      return localStorage.getItem(THEME_KEY) === "light" ? "light" : "dark";
    } catch (e) {
      return "dark";
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

  function clamp(n, min, max) {
    return Math.max(min, Math.min(max, n));
  }

  function initMotion3D() {
    var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) return;

    var companies = document.querySelectorAll(".company");
    if (!companies.length) return;

    var pending = false;

    function apply() {
      pending = false;
      var vh = window.innerHeight || 1;

      companies.forEach(function (card) {
        if (!card.classList.contains("is-inview")) {
          card.style.removeProperty("--fenice-tilt-x");
          return;
        }
        var cr = card.getBoundingClientRect();
        if (cr.bottom < -40 || cr.top > vh + 40) {
          card.style.removeProperty("--fenice-tilt-x");
          return;
        }
        var centerY = cr.top + cr.height * 0.45;
        var t = (vh * 0.46 - centerY) / (vh * 0.72);
        t = clamp(t, -1, 1);
        var tilt = t * 4.5;
        card.style.setProperty("--fenice-tilt-x", tilt.toFixed(2) + "deg");
      });
    }

    function tick() {
      if (!pending) {
        pending = true;
        requestAnimationFrame(apply);
      }
    }

    window.addEventListener("scroll", tick, { passive: true });
    window.addEventListener("resize", tick, { passive: true });
    tick();
  }

  function applySiteConfig() {
    var media = document.querySelector(".hero-cover__media");
    if (!media || !("fetch" in window)) return;

    fetch("content/site.json")
      .then(function (r) {
        return r.ok ? r.json() : null;
      })
      .then(function (cfg) {
        if (!cfg) return;
        if (cfg.heroImage) {
          media.style.backgroundImage = "url(" + cfg.heroImage + ")";
        }
        if (cfg.heroImagePosition) {
          media.style.backgroundPosition = cfg.heroImagePosition;
        }
      })
      .catch(function () {});
  }

  function bindMobileNav() {
    var bar = document.querySelector(".topbar");
    var toggle = document.querySelector(".nav-toggle");
    if (!bar || !toggle) return;
    function close() {
      bar.classList.remove("is-open");
      toggle.setAttribute("aria-expanded", "false");
    }
    toggle.addEventListener("click", function () {
      var open = bar.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
    });
    bar.querySelectorAll("nav a").forEach(function (a) {
      a.addEventListener("click", close);
    });
  }

  function bindAnchorClean() {
    var links = document.querySelectorAll('a[href^="#"]');
    links.forEach(function (a) {
      a.addEventListener("click", function () {
        window.setTimeout(function () {
          try {
            history.replaceState(null, "", location.pathname + location.search);
          } catch (e) {}
        }, 800);
      });
    });
  }

  function init() {
    initTheme();
    document.documentElement.lang = getLang();
    applyI18nStrings();
    syncLangButtons();
    bindLangButtons();
    bindThemeButtons();
    applyTitle();
    applySiteConfig();
    initScrollIO();
    initMotion3D();
    bindMobileNav();
    bindAnchorClean();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
