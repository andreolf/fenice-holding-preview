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

    var heroMedia = document.querySelector(".hero-cover__media");
    var hero = document.querySelector(".hero-cover");
    if (!heroMedia || !hero) return;

    var pending = false;

    function apply() {
      pending = false;
      var vh = window.innerHeight || 1;
      var r = hero.getBoundingClientRect();
      if (r.bottom < -80 || r.top > vh + 80) {
        heroMedia.style.transform = "";
        return;
      }
      var span = Math.max(vh + r.height, 1);
      var prog = (vh - r.top) / span;
      prog = Math.max(0, Math.min(1, prog));
      var drift = (prog - 0.35) * 48;
      heroMedia.style.transform =
        "translate3d(0," + drift.toFixed(1) + "px,0) scale(1.04)";

      var hint = document.querySelector(".js-scroll-hint");
      if (hint) {
        var scrollY = window.scrollY || document.documentElement.scrollTop || 0;
        var openEase = Math.min(1, scrollY / (vh * 0.28));
        var hOp = 1 - openEase;
        hint.style.opacity = hOp < 0.08 ? "0" : String(Math.max(0.2, hOp));
        hint.style.pointerEvents = hOp < 0.12 ? "none" : "";
      }
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
    initScrollParallax();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
