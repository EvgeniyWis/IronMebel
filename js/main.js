const headerBurger = document.querySelector(".im-header__top-burger");
const headerMenuOverlay = document.querySelector(".im-header__mobile-overlay");
const headerMenuClose = document.querySelector(".im-header__mobile-close");
const headerMenuLinks = document.querySelectorAll(".im-header__mobile-link");
const headerCity = document.querySelector(
  ".im-header__city[data-city-dropdown]",
);
const cityModal = document.querySelector("[data-city-modal]");
const cityModalCloseButtons = document.querySelectorAll(
  "[data-city-modal-close]",
);
const cityModalSearchInput = document.querySelector("[data-city-modal-search]");
const cityModalOptions = document.querySelectorAll("[data-city-modal-option]");

const catalogModal = document.querySelector("[data-catalog-modal]");
const catalogModalTitle = document.querySelector(".im-catalog-modal__title");
const CATALOG_CATEGORY_CLASS_PREFIX = "im-catalog-modal--category-";
const catalogModalCloseButtons = document.querySelectorAll(
  "[data-catalog-modal-close]",
);
const catalogItems = document.querySelectorAll("[data-catalog-category]");

const mobileCatalog = document.querySelector("[data-mobile-catalog]");
const mobileCatalogOpenButtons = document.querySelectorAll(
  "[data-mobile-catalog-open]",
);
const mobileCatalogCloseButtons = document.querySelectorAll(
  "[data-mobile-catalog-close]",
);
const MOBILE_CATALOG_STORAGE_KEY = "imMobileCatalogOpen";
const CATALOG_MODAL_STORAGE_KEY = "imCatalogModalCategory";
const CATALOG_MODAL_TITLE_KEY = "imCatalogModalTitle";
const CATALOG_MODAL_FROM_MOBILE_KEY = "imCatalogModalFromMobile";
const MOBILE_BREAKPOINT_PX = 1000;

const isSmallScreenCity = () =>
  window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT_PX}px)`).matches;
const isCityModalScreen = () =>
  window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT_PX}px)`).matches;
const isMobileCatalogScreen = () =>
  window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT_PX}px)`).matches;

const menuOpenButtons = document.querySelectorAll("[data-menu-open]");

if (headerMenuOverlay) {
  const openMenu = () => {
    headerMenuOverlay.classList.add("is-open");
  };

  const closeMenu = () => {
    headerMenuOverlay.classList.remove("is-open");
    const sub = document.querySelector("[data-mobile-submenu]");
    if (sub) {
      sub.classList.remove("is-open");
      sub.setAttribute("aria-hidden", "true");
    }
  };

  if (headerBurger) {
    headerBurger.addEventListener("click", openMenu);
  }

  menuOpenButtons.forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      if (headerMenuOverlay.classList.contains("is-open")) {
        closeMenu();
      } else {
        openMenu();
      }
    });
  });

  if (headerMenuClose) {
    headerMenuClose.addEventListener("click", closeMenu);
  }

  headerMenuOverlay.addEventListener("click", (event) => {
    if (event.target === headerMenuOverlay) {
      closeMenu();
    }
  });

  if (headerMenuLinks.length) {
    headerMenuLinks.forEach((link) => {
      link.addEventListener("click", (e) => {
        if (link.hasAttribute("data-mobile-submenu-open")) {
          e.preventDefault();
          const submenu = document.querySelector("[data-mobile-submenu]");
          if (submenu) {
            submenu.classList.add("is-open");
            submenu.setAttribute("aria-hidden", "false");
          }
          return;
        }
        closeMenu();
      });
    });
  }

  const mobileSubmenu = document.querySelector("[data-mobile-submenu]");
  const mobileSubmenuCloseButtons = document.querySelectorAll(
    "[data-mobile-submenu-close]",
  );
  const mobileSubmenuLinks = document.querySelectorAll(
    ".im-header__mobile-submenu-link",
  );

  const closeSubmenu = () => {
    if (mobileSubmenu) {
      mobileSubmenu.classList.remove("is-open");
      mobileSubmenu.setAttribute("aria-hidden", "true");
    }
  };

  if (mobileSubmenu) {
    mobileSubmenuCloseButtons.forEach((btn) => {
      btn.addEventListener("click", (e) => {
        e.preventDefault();
        closeSubmenu();
      });
    });

    mobileSubmenuLinks.forEach((link) => {
      link.addEventListener("click", closeMenu);
    });
  }

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      if (mobileSubmenu && mobileSubmenu.classList.contains("is-open")) {
        closeSubmenu();
      } else {
        closeMenu();
      }
    }
  });
}

const setActiveCityValue = (value) => {
  const cityTextElements = document.querySelectorAll(".im-header__city-text");
  const cityOptions = document.querySelectorAll(".im-header__city-option");

  if (value) {
    cityTextElements.forEach((el) => {
      el.textContent = value;
    });
  }

  cityOptions.forEach((item) => {
    const text = item.textContent ? item.textContent.trim() : "";
    const isActive = text === value;

    item.classList.toggle("is-active", isActive);

    if (isActive) {
      item.setAttribute("aria-selected", "true");
    } else {
      item.removeAttribute("aria-selected");
    }
  });
};

const openCityModal = () => {
  if (!cityModal || !isCityModalScreen()) return;

  cityModal.classList.add("is-open");
  cityModal.setAttribute("aria-hidden", "false");
  document.body.style.overflow = "hidden";
};

const closeCityModal = () => {
  if (!cityModal) return;

  cityModal.classList.remove("is-open");
  cityModal.setAttribute("aria-hidden", "true");
  document.body.style.overflow = "";
};

if (headerCity) {
  const cityToggle = headerCity.querySelector(".im-header__city-toggle");
  const cityDropdown = headerCity.querySelector(".im-header__city-dropdown");
  const cityOptions = headerCity.querySelectorAll(".im-header__city-option");
  const cityDropdownSearchInput = headerCity.querySelector(
    "[data-city-dropdown-search]",
  );

  if (cityToggle) {
    const openCityDropdown = () => {
      if (!cityDropdown || isCityModalScreen()) return;
      headerCity.classList.add("is-open");
      cityToggle.setAttribute("aria-expanded", "true");
      if (cityDropdownSearchInput) {
        cityDropdownSearchInput.focus();
      }
    };

    const closeCityDropdown = () => {
      if (!cityDropdown) return;
      headerCity.classList.remove("is-open");
      cityToggle.setAttribute("aria-expanded", "false");
      if (cityDropdownSearchInput) {
        cityDropdownSearchInput.value = "";
      }
      cityOptions.forEach((option) => {
        option.style.display = "";
      });
    };

    const toggleCityDropdown = () => {
      if (isCityModalScreen()) {
        openCityModal();
        return;
      }

      if (headerCity.classList.contains("is-open")) {
        closeCityDropdown();
      } else {
        openCityDropdown();
      }
    };

    cityToggle.addEventListener("click", (event) => {
      event.stopPropagation();
      toggleCityDropdown();
    });

    cityOptions.forEach((option) => {
      option.addEventListener("click", (event) => {
        event.preventDefault();

        const value = option.textContent ? option.textContent.trim() : "";

        if (value) {
          setActiveCityValue(value);
        }

        closeCityDropdown();
      });
    });

    if (cityDropdownSearchInput) {
      cityDropdownSearchInput.addEventListener("input", () => {
        const query = cityDropdownSearchInput.value.trim().toLowerCase();

        cityOptions.forEach((option) => {
          const text = option.textContent
            ? option.textContent.toLowerCase()
            : "";
          const shouldShow = !query || text.includes(query);

          option.style.display = shouldShow ? "" : "none";
        });
      });
    }

    document.addEventListener("click", (event) => {
      if (!headerCity.contains(event.target)) {
        closeCityDropdown();
      }
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") {
        closeCityDropdown();
        closeCityModal();
      }
    });
  }
}

if (cityModal) {
  cityModalCloseButtons.forEach((button) => {
    button.addEventListener("click", (event) => {
      event.preventDefault();
      closeCityModal();
    });
  });

  cityModalOptions.forEach((option) => {
    option.addEventListener("click", (event) => {
      event.preventDefault();

      const value = option.textContent ? option.textContent.trim() : "";

      if (value) {
        setActiveCityValue(value);
      }

      closeCityModal();
    });
  });

  if (cityModalSearchInput) {
    cityModalSearchInput.addEventListener("input", () => {
      const query = cityModalSearchInput.value.trim().toLowerCase();

      cityModalOptions.forEach((option) => {
        const text = option.textContent ? option.textContent.toLowerCase() : "";
        const shouldShow = !query || text.includes(query);

        option.style.display = shouldShow ? "" : "none";
      });
    });
  }

  cityModal.addEventListener("click", (event) => {
    if (event.target === cityModal) {
      closeCityModal();
    }
  });
}

const topDropdowns = document.querySelectorAll("[data-top-dropdown]");

if (topDropdowns.length) {
  const canHoverOpen = window.matchMedia("(hover: hover) and (pointer: fine)");

  const closeAllTopDropdowns = () => {
    topDropdowns.forEach((root) => {
      root.classList.remove("is-open");
      const toggle = root.querySelector("[data-top-dropdown-toggle]");
      if (toggle) {
        toggle.setAttribute("aria-expanded", "false");
      }
    });
  };

  topDropdowns.forEach((root) => {
    const toggle = root.querySelector("[data-top-dropdown-toggle]");
    const menu = root.querySelector("[data-top-dropdown-menu]");
    if (!toggle || !menu) return;

    const open = () => {
      closeAllTopDropdowns();
      root.classList.add("is-open");
      toggle.setAttribute("aria-expanded", "true");
    };

    const close = () => {
      root.classList.remove("is-open");
      toggle.setAttribute("aria-expanded", "false");
    };

    toggle.addEventListener("click", (event) => {
      event.preventDefault();
      event.stopPropagation();
      if (root.classList.contains("is-open")) {
        close();
      } else {
        open();
      }
    });

    if (canHoverOpen.matches) {
      root.addEventListener("mouseenter", open);
      root.addEventListener("mouseleave", close);
    }
  });

  document.addEventListener("click", (event) => {
    const inside = Array.from(topDropdowns).some((root) =>
      root.contains(event.target),
    );
    if (!inside) {
      closeAllTopDropdowns();
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      closeAllTopDropdowns();
    }
  });
}

const openCatalogModal = (categoryKey, titleText) => {
  if (!catalogModal || !isSmallScreenCity()) return;

  Array.from(catalogModal.classList).forEach((cls) => {
    if (cls.startsWith(CATALOG_CATEGORY_CLASS_PREFIX)) {
      catalogModal.classList.remove(cls);
    }
  });
  catalogModal.classList.add(`${CATALOG_CATEGORY_CLASS_PREFIX}${categoryKey}`);

  if (catalogModalTitle && titleText) {
    catalogModalTitle.textContent = titleText;
  }

  catalogModal.classList.add("is-open");
  catalogModal.setAttribute("aria-hidden", "false");
  document.body.style.overflow = "hidden";
  sessionStorage.setItem(CATALOG_MODAL_STORAGE_KEY, categoryKey);
  sessionStorage.setItem(CATALOG_MODAL_TITLE_KEY, titleText || "");
  sessionStorage.removeItem(MOBILE_CATALOG_STORAGE_KEY);
};

const closeCatalogModal = () => {
  if (!catalogModal) return;

  const openedFromMobile = sessionStorage.getItem(
    CATALOG_MODAL_FROM_MOBILE_KEY,
  );

  catalogModal.classList.remove("is-open");
  Array.from(catalogModal.classList).forEach((cls) => {
    if (cls.startsWith(CATALOG_CATEGORY_CLASS_PREFIX)) {
      catalogModal.classList.remove(cls);
    }
  });
  catalogModal.setAttribute("aria-hidden", "true");
  document.body.style.overflow = "";
  sessionStorage.removeItem(CATALOG_MODAL_STORAGE_KEY);
  sessionStorage.removeItem(CATALOG_MODAL_TITLE_KEY);

  if (openedFromMobile && mobileCatalog && isMobileCatalogScreen()) {
    openMobileCatalog();
  }

  sessionStorage.removeItem(CATALOG_MODAL_FROM_MOBILE_KEY);
};

if (catalogModal) {
  catalogModalCloseButtons.forEach((button) => {
    button.addEventListener("click", (event) => {
      event.preventDefault();
      closeCatalogModal();
    });
  });

  catalogModal.addEventListener("click", (event) => {
    if (event.target === catalogModal) {
      closeCatalogModal();
    }
  });
}

if (catalogItems.length) {
  catalogItems.forEach((item) => {
    const categoryKey = item.getAttribute("data-catalog-category");
    const link = item.querySelector(".im-catalog__link");
    const titleElement = item.querySelector(".im-catalog__title");

    if (!categoryKey || !link) return;

    const titleText =
      titleElement && titleElement.textContent
        ? titleElement.textContent.trim()
        : "";

    link.addEventListener("click", (event) => {
      if (!isSmallScreenCity()) {
        return;
      }

      event.preventDefault();
      openCatalogModal(categoryKey, titleText);
    });
  });
}

const openMobileCatalog = () => {
  if (!mobileCatalog || !isMobileCatalogScreen()) return;

  mobileCatalog.classList.add("is-open");
  mobileCatalog.setAttribute("aria-hidden", "false");
  document.body.style.overflow = "hidden";
  sessionStorage.setItem(MOBILE_CATALOG_STORAGE_KEY, "1");
  sessionStorage.removeItem(CATALOG_MODAL_STORAGE_KEY);
  sessionStorage.removeItem(CATALOG_MODAL_TITLE_KEY);
};

const closeMobileCatalog = () => {
  if (!mobileCatalog) return;

  mobileCatalog.classList.remove("is-open");
  mobileCatalog.setAttribute("aria-hidden", "true");
  document.body.style.overflow = "";
  sessionStorage.removeItem(MOBILE_CATALOG_STORAGE_KEY);
};

if (mobileCatalog) {
  mobileCatalogOpenButtons.forEach((button) => {
    button.addEventListener("click", (event) => {
      if (!isMobileCatalogScreen()) return;

      event.preventDefault();
      if (mobileCatalog.classList.contains("is-open")) {
        closeMobileCatalog();
      } else {
        openMobileCatalog();
      }
    });
  });

  mobileCatalogCloseButtons.forEach((button) => {
    button.addEventListener("click", (event) => {
      event.preventDefault();
      closeMobileCatalog();
    });
  });

  mobileCatalog.addEventListener("click", (event) => {
    if (event.target === mobileCatalog) {
      closeMobileCatalog();
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && mobileCatalog.classList.contains("is-open")) {
      closeMobileCatalog();
    }
  });

  const catalogCityToggle = mobileCatalog.querySelector(
    ".im-header__city-toggle",
  );
  if (catalogCityToggle && cityModal) {
    catalogCityToggle.addEventListener("click", (event) => {
      if (isMobileCatalogScreen() && isSmallScreenCity()) {
        event.stopPropagation();
        openCityModal();
      }
    });
  }
}

const mobileCatalogItems = document.querySelectorAll(
  ".im-mobile-catalog__item[data-catalog-category]",
);
if (mobileCatalogItems.length && catalogModal) {
  mobileCatalogItems.forEach((item) => {
    const categoryKey = item.getAttribute("data-catalog-category");
    const link = item.querySelector(".im-mobile-catalog__link");
    const titleElement = item.querySelector(".im-mobile-catalog__item-title");

    if (!categoryKey || !link) return;

    const titleText =
      titleElement && titleElement.textContent
        ? titleElement.textContent.trim()
        : "";

    link.addEventListener("click", (event) => {
      if (!isSmallScreenCity()) {
        return;
      }

      event.preventDefault();
      sessionStorage.setItem(CATALOG_MODAL_FROM_MOBILE_KEY, "1");
      closeMobileCatalog();
      openCatalogModal(categoryKey, titleText);
    });
  });
}

document.addEventListener("visibilitychange", () => {
  if (document.visibilityState !== "visible") return;

  const storedCategory = sessionStorage.getItem(CATALOG_MODAL_STORAGE_KEY);
  const storedTitle = sessionStorage.getItem(CATALOG_MODAL_TITLE_KEY);
  const shouldOpenCatalog = sessionStorage.getItem(MOBILE_CATALOG_STORAGE_KEY);

  if (storedCategory) {
    openCatalogModal(storedCategory, storedTitle || "");
    return;
  }

  if (shouldOpenCatalog) {
    openMobileCatalog();
  }
});

// ─── Desktop catalog dropdown ───────────────────────────────
const desktopCatalog = document.querySelector("[data-desktop-catalog]");
const desktopCatalogToggle = document.querySelector(
  "[data-desktop-catalog-toggle]",
);

if (desktopCatalog && desktopCatalogToggle) {
  const openDesktopCatalog = () => {
    desktopCatalog.classList.add("is-open");
    desktopCatalogToggle.setAttribute("aria-expanded", "true");
  };

  const closeDesktopCatalog = () => {
    desktopCatalog.classList.remove("is-open");
    desktopCatalogToggle.setAttribute("aria-expanded", "false");
  };

  desktopCatalogToggle.addEventListener("click", (event) => {
    event.preventDefault();
    event.stopPropagation();

    if (desktopCatalog.classList.contains("is-open")) {
      closeDesktopCatalog();
    } else {
      openDesktopCatalog();
    }
  });

  document.addEventListener("click", (event) => {
    if (
      desktopCatalog.classList.contains("is-open") &&
      !desktopCatalog.contains(event.target)
    ) {
      closeDesktopCatalog();
    }
  });

  document.addEventListener("keydown", (event) => {
    if (
      event.key === "Escape" &&
      desktopCatalog.classList.contains("is-open")
    ) {
      closeDesktopCatalog();
    }
  });

  const desktopCategories = desktopCatalog.querySelectorAll(
    "[data-desktop-category]",
  );
  const desktopSubpanels = desktopCatalog.querySelectorAll(
    "[data-desktop-subpanel]",
  );

  const activateCategory = (categoryKey) => {
    desktopCategories.forEach((cat) => {
      cat.classList.toggle(
        "is-active",
        cat.getAttribute("data-desktop-category") === categoryKey,
      );
    });
    desktopSubpanels.forEach((panel) => {
      panel.classList.toggle(
        "is-active",
        panel.getAttribute("data-desktop-subpanel") === categoryKey,
      );
    });
  };

  // Build title-to-key map from categories
  const categoryTitles = {};
  desktopCategories.forEach((cat) => {
    const key = cat.getAttribute("data-desktop-category");
    const titleEl = cat.querySelector(".im-desktop-catalog__category-title");
    if (key && titleEl) {
      categoryTitles[key] = titleEl.textContent.trim();
    }
  });

  // Inject subpanel titles and wrap subcards in subgrid
  desktopSubpanels.forEach((panel) => {
    const key = panel.getAttribute("data-desktop-subpanel");
    const titleText = categoryTitles[key] || "";

    // Add title if not already present
    if (!panel.querySelector(".im-desktop-catalog__subpanel-title")) {
      const titleEl = document.createElement("h3");
      titleEl.className = "im-desktop-catalog__subpanel-title";
      titleEl.textContent = titleText;
      panel.prepend(titleEl);
    }

    // Wrap subcards in subgrid if not already wrapped
    if (!panel.querySelector(".im-desktop-catalog__subgrid")) {
      const subcards = Array.from(
        panel.querySelectorAll(".im-desktop-catalog__subcard"),
      );
      if (subcards.length) {
        const grid = document.createElement("div");
        grid.className = "im-desktop-catalog__subgrid";
        subcards.forEach((card) => grid.appendChild(card));
        panel.appendChild(grid);
      }
    }
  });

  desktopCategories.forEach((cat) => {
    cat.addEventListener("mouseenter", () => {
      const key = cat.getAttribute("data-desktop-category");
      if (key) activateCategory(key);
    });

    cat.addEventListener("click", (event) => {
      event.preventDefault();
      const key = cat.getAttribute("data-desktop-category");
      if (key) activateCategory(key);
    });
  });
}

// Toggle subcategories in catalog modal:
// - по стрелке всегда только раскрытие/скрытие
// - по клику на категорию: первый клик раскрывает, повторный ведёт по ссылке
const catalogModalCards = document.querySelectorAll(".im-catalog-modal__card");

if (catalogModalCards.length) {
  catalogModalCards.forEach((card) => {
    const arrow = card.querySelector(".im-catalog-modal__item-arrow");
    const itemLink = card.querySelector(".im-catalog-modal__item");
    const subList = card.querySelector(".im-catalog-modal__sub-list");

    // Если нет подкатегорий, ничего не перехватываем — ссылка работает как обычно
    if (!subList || !itemLink) return;

    const toggleCard = () => {
      card.classList.toggle("is-open");
    };

    // Клик по всей категории: раскрывает или закрывает подкатегории
    itemLink.addEventListener("click", (event) => {
      event.preventDefault();
      toggleCard();
    });

    // Клик по стрелке всегда только раскрывает/закрывает, без перехода
    if (arrow) {
      arrow.addEventListener("click", (event) => {
        event.preventDefault();
        event.stopPropagation();
        toggleCard();
      });
    }
  });
}

// ─── Decisions sliders (mobile, Keen Slider) ─────────────────────────────────

const initDecisionsSliders = () => {
  if (typeof KeenSlider === "undefined") return;

  const MOBILE_DECISIONS_BREAKPOINT = 600;
  const sliders = document.querySelectorAll(".im-decisions__slider");

  if (!sliders.length) return;

  const instances = [];

  const destroyAll = () => {
    instances.forEach((instance) => {
      try {
        instance.destroy();
      } catch (e) {
        // ignore
      }
    });
    instances.length = 0;
  };

  const setup = () => {
    const isMobile = window.innerWidth <= MOBILE_DECISIONS_BREAKPOINT;

    if (!isMobile) {
      if (instances.length) {
        destroyAll();
      }
      return;
    }

    if (instances.length) return;

    sliders.forEach((slider) => {
      const root = slider.querySelector(".keen-slider") || slider;

      const instance = new KeenSlider(root, {
        slides: {
          perView: 2.1,
          spacing: 12,
        },
        loop: false,
        drag: true,
        rubberband: false,
      });

      instances.push(instance);
    });
  };

  setup();
  window.addEventListener("resize", setup);
};

initDecisionsSliders();

/* ─── Projects Slider ──────────────────────────────────────── */
const initProjectsSlider = () => {
  const container = document.querySelector(".im-projects");
  if (!container) return;

  const sliderRoot = container.querySelector("#projects-slider");
  if (!sliderRoot) return;

  const prevBtn = container.querySelector(".im-projects__arrow--prev");
  const nextBtn = container.querySelector(".im-projects__arrow--next");

  const slider = new KeenSlider(sliderRoot, {
    slides: {
      perView: 3.15,
      spacing: 16,
    },
    loop: false,
    drag: true,
    rubberband: false,
    breakpoints: {
      "(max-width: 1200px)": {
        slides: { perView: 2.5, spacing: 14 },
      },
      "(max-width: 900px)": {
        slides: { perView: 2.15, spacing: 12 },
      },
      "(max-width: 600px)": {
        slides: { perView: 1.15, spacing: 10 },
      },
    },
    created(s) {
      updateArrows(s);
    },
    slideChanged(s) {
      updateArrows(s);
    },
  });

  function updateArrows(s) {
    if (!prevBtn || !nextBtn) return;
    prevBtn.disabled = s.track.details.rel === 0;
    nextBtn.disabled = s.track.details.rel === s.track.details.maxIdx;
  }

  if (prevBtn) {
    prevBtn.addEventListener("click", () => slider.prev());
  }
  if (nextBtn) {
    nextBtn.addEventListener("click", () => slider.next());
  }
};

initProjectsSlider();

/* ─── Partners Slider ──────────────────────────────────────── */
const initPartnersSlider = () => {
  if (typeof KeenSlider === "undefined") return;

  const container = document.querySelector(".im-partners");
  if (!container) return;

  const baseSliderRoot = container.querySelector("#partners-slider");
  if (!baseSliderRoot) return;

  const isMobile = window.matchMedia("(max-width: 600px)").matches;

  // Мобильная версия: 2 отдельных слайдера (2 строки партнёров)
  if (isMobile) {
    const items = Array.from(
      baseSliderRoot.querySelectorAll(".im-partners__item")
    );
    if (!items.length || !baseSliderRoot.parentElement) return;

    const sliderWrapper = baseSliderRoot.parentElement;

    // Создаём два отдельных корня слайдера
    const row1 = document.createElement("div");
    row1.className =
      "im-partners__list keen-slider im-partners__list--mobile";
    row1.id = "partners-slider-mobile-1";

    const row2 = document.createElement("div");
    row2.className =
      "im-partners__list keen-slider im-partners__list--mobile";
    row2.id = "partners-slider-mobile-2";

    const half = Math.ceil(items.length / 2);

    items.forEach((item, index) => {
      const target = index < half ? row1 : row2;
      target.appendChild(item);
    });

    // Заменяем исходный слайдер двумя мобильными
    sliderWrapper.innerHTML = "";
    sliderWrapper.appendChild(row1);
    sliderWrapper.appendChild(row2);

    const mobileOptions = {
      slides: {
        perView: 3,
        spacing: 8,
      },
      loop: false,
      drag: true,
      rubberband: false,
      breakpoints: {
        "(max-width: 400px)": {
          slides: { perView: 2.2, spacing: 8 },
        },
      },
    };

    new KeenSlider(row1, mobileOptions);
    new KeenSlider(row2, mobileOptions);

    return;
  }

  // Десктоп/планшет: один слайдер с навигацией
  const prevBtn = container.querySelector(".im-partners__nav-btn--prev");
  const nextBtn = container.querySelector(".im-partners__nav-btn--next");

  const slider = new KeenSlider(baseSliderRoot, {
    slides: {
      perView: 6,
      spacing: 0,
    },
    loop: false,
    drag: true,
    rubberband: false,
    breakpoints: {
      "(max-width: 1200px)": {
        slides: { perView: 5, spacing: 14 },
      },
      "(max-width: 900px)": {
        slides: { perView: 4, spacing: 12 },
      },
      "(max-width: 600px)": {
        slides: { perView: 2.4, spacing: 10 },
      },
      "(max-width: 400px)": {
        slides: { perView: 1.6, spacing: 8 },
      },
    },
  });

  function updateArrows(s) {
    if (!prevBtn || !nextBtn) return;
    prevBtn.disabled = s.track.details.rel === 0;
    nextBtn.disabled = s.track.details.rel === s.track.details.maxIdx;
  }

  slider.on("created", updateArrows);
  slider.on("slideChanged", updateArrows);

  if (prevBtn) {
    prevBtn.addEventListener("click", () => slider.prev());
  }
  if (nextBtn) {
    nextBtn.addEventListener("click", () => slider.next());
  }
};

initPartnersSlider();

/* ─── Professionals Slider ──────────────────────────────────── */
const initProfessionalsSlider = () => {
  if (typeof KeenSlider === "undefined") return;

  const container = document.querySelector(".im-professionals");
  if (!container) return;

  const sliderRoot = container.querySelector("#professionals-slider");
  if (!sliderRoot) return;

  const prevBtn = container.querySelector(".im-professionals__nav-btn--prev");
  const nextBtn = container.querySelector(".im-professionals__nav-btn--next");

  const slider = new KeenSlider(sliderRoot, {
    slides: {
      perView: 3,
      spacing: 12,
    },
    loop: false,
    drag: true,
    rubberband: false,
    breakpoints: {
      "(max-width: 1200px)": {
        slides: { perView: 2, spacing: 12 },
      },
      "(max-width: 768px)": {
        slides: { perView: 1.2, spacing: 10 },
      },
    },
  });

  function updateArrows(s) {
    if (!prevBtn || !nextBtn) return;
    prevBtn.disabled = s.track.details.rel === 0;
    nextBtn.disabled = s.track.details.rel === s.track.details.maxIdx;
  }

  slider.on("created", updateArrows);
  slider.on("slideChanged", updateArrows);

  if (prevBtn) {
    prevBtn.addEventListener("click", () => slider.prev());
  }
  if (nextBtn) {
    nextBtn.addEventListener("click", () => slider.next());
  }
};

initProfessionalsSlider();

/* ─── Industries Slider ───────────────────────────────────── */
const initIndustriesSlider = () => {
  const container = document.querySelector(".im-industries");
  if (!container) return;

  const sliderRoot = container.querySelector("#industries-slider");
  if (!sliderRoot) return;

  const prevBtn = container.querySelector(".im-industries__arrow--prev");
  const nextBtn = container.querySelector(".im-industries__arrow--next");

  // Pair slides into two-row columns
  const slides = Array.from(sliderRoot.querySelectorAll(".keen-slider__slide"));
  sliderRoot.innerHTML = "";
  for (let i = 0; i < slides.length; i += 2) {
    const col = document.createElement("div");
    col.className = "keen-slider__slide im-industries__column";
    col.appendChild(slides[i].querySelector(".im-industries__card"));
    if (slides[i + 1]) {
      col.appendChild(slides[i + 1].querySelector(".im-industries__card"));
    }
    sliderRoot.appendChild(col);
  }

  const slider = new KeenSlider(sliderRoot, {
    slides: {
      perView: 3,
      spacing: 16,
    },
    loop: false,
    drag: true,
    rubberband: false,
    breakpoints: {
      "(max-width: 1200px)": {
        slides: { perView: 2.5, spacing: 14 },
      },
      "(max-width: 900px)": {
        slides: { perView: 2, spacing: 12 },
      },
      "(max-width: 600px)": {
        slides: { perView: 1.4, spacing: 10 },
      },
      "(max-width: 350px)": {
        slides: { perView: 1, spacing: 10 },
      },
    },
    created(s) {
      updateArrows(s);
    },
    slideChanged(s) {
      updateArrows(s);
    },
  });

  function updateArrows(s) {
    if (!prevBtn || !nextBtn) return;
    prevBtn.disabled = s.track.details.rel === 0;
    nextBtn.disabled = s.track.details.rel === s.track.details.maxIdx;
  }

  if (prevBtn) {
    prevBtn.addEventListener("click", () => slider.prev());
  }
  if (nextBtn) {
    nextBtn.addEventListener("click", () => slider.next());
  }
};

initIndustriesSlider();

/* ─── Goods card slider (Keen Slider inside product card) ─── */
const initGoodsCardSliders = () => {
  const containers = document.querySelectorAll("[data-goods-slider]");
  containers.forEach((container) => {
    const root = container.querySelector(".keen-slider");
    if (!root) return;

    const pagination = container.querySelector(".im-goods__pagination");
    /** @type {HTMLButtonElement[]} */
    let dots = [];

    const slider = new KeenSlider(root, {
      slides: {
        perView: 1,
        spacing: 0,
      },
      loop: true,
      drag: true,
      rubberband: false,
      created(s) {
        if (!pagination) return;

        const slideCount = s.slides.length;
        if (slideCount <= 1) return;

        pagination.innerHTML = "";
        dots = [];

        for (let i = 0; i < slideCount; i += 1) {
          const dot = document.createElement("button");
          dot.type = "button";
          dot.className = "im-goods__dot";
          if (i === 0) {
            dot.classList.add("is-active");
          }
          dot.addEventListener("click", () => {
            slider.moveToIdx(i);
          });
          pagination.appendChild(dot);
          dots.push(dot);
        }
      },
      slideChanged(s) {
        if (!dots.length) return;
        const current = s.track.details.rel;
        dots.forEach((dot, index) => {
          dot.classList.toggle("is-active", index === current);
        });
      },
    });
  });
};

initGoodsCardSliders();

// ─── Goods favorites (heart toggle) ───────────────────────────
const initGoodsFavorites = () => {
  const favoriteButtons = document.querySelectorAll(".im-goods__favorite");
  if (!favoriteButtons.length) return;

  favoriteButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const isActive = button.classList.toggle("is-active");
      button.setAttribute("aria-pressed", isActive ? "true" : "false");
    });
  });
};

initGoodsFavorites();
