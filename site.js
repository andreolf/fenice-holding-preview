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

  function init() {
    document.documentElement.lang = getLang();
    applyI18nStrings();
    syncLangButtons();
    bindLangButtons();
    applyTitle();
    initScrollIO();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
