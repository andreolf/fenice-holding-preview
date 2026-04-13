(function () {
  var header = document.querySelector(".site-header");
  var hero = document.querySelector(".hero-immersive");
  var heroImg = document.querySelector(".hero-immersive__img");
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function onScroll() {
    if (!header) return;
    var y = window.scrollY || document.documentElement.scrollTop;
    header.classList.toggle("site-header--scrolled", y > 48);
  }

  function onScrollParallax() {
    if (reduceMotion || !heroImg || !hero) return;
    var rect = hero.getBoundingClientRect();
    if (rect.bottom < 0 || rect.top > window.innerHeight) return;
    var p = Math.max(0, Math.min(1, 1 - rect.bottom / (rect.height + window.innerHeight)));
    heroImg.style.setProperty("--parallax", (p * 28).toFixed(2) + "px");
  }

  window.addEventListener("scroll", function () {
    onScroll();
    onScrollParallax();
  });
  window.addEventListener("resize", onScrollParallax);
  onScroll();
  onScrollParallax();

  if (!("IntersectionObserver" in window)) {
    document.querySelectorAll(".reveal").forEach(function (el) {
      el.classList.add("is-visible");
    });
    return;
  }

  var io = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) e.target.classList.add("is-visible");
      });
    },
    { root: null, rootMargin: "0px 0px -8% 0px", threshold: 0.08 }
  );

  document.querySelectorAll(".reveal").forEach(function (el) {
    io.observe(el);
  });
})();
