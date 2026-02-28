const headerBurger = document.querySelector(".im-header__top-burger");
const headerMenuOverlay = document.querySelector(".im-header__mobile-overlay");
const headerMenuClose = document.querySelector(".im-header__mobile-close");
const headerMenuLinks = document.querySelectorAll(".im-header__mobile-link");

if (headerBurger && headerMenuOverlay) {
  const openMenu = () => {
    headerMenuOverlay.classList.add("is-open");
  };

  const closeMenu = () => {
    headerMenuOverlay.classList.remove("is-open");
  };

  headerBurger.addEventListener("click", openMenu);

  if (headerMenuClose) {
    headerMenuClose.addEventListener("click", closeMenu);
  }

  headerMenuOverlay.addEventListener("click", (event) => {
    if (event.target === headerMenuOverlay) {
      closeMenu();
    }
  });

  headerMenuLinks.forEach((link) => {
    link.addEventListener("click", closeMenu);
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      closeMenu();
    }
  });
}
