(function () {
  "use strict";
  const toggle = document.getElementById("navToggle");
  const menu = document.getElementById("navMenu");
  if (!toggle || !menu) return;
  toggle.addEventListener("click", function () {
    const open = menu.classList.toggle("nav--open");
    toggle.classList.toggle("nav__hamburger--open", open);
    toggle.setAttribute("aria-expanded", String(open));
  });
  menu.querySelectorAll("a").forEach(function (link) {
    link.addEventListener("click", function () {
      menu.classList.remove("nav--open");
      toggle.classList.remove("nav__hamburger--open");
      toggle.setAttribute("aria-expanded", "false");
    });
  });
})();
