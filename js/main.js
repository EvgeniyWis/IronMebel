const AUTH_STORAGE_KEY = "imAuthState";

const initAuthUi = () => {
  if (!document.body) return;

  let isLoggedIn = false;

  try {
    isLoggedIn = JSON.parse(localStorage.getItem(AUTH_STORAGE_KEY) || "null")
      ?.isLoggedIn === true;
  } catch (error) {
    isLoggedIn = false;
  }

  document.body.classList.toggle("im-user-logged-in", isLoggedIn);
};

initAuthUi();

const authLogoutButtons = document.querySelectorAll(
  "[data-auth-logout], .im-header__user-menu .im-header__top-dropdown-item:last-of-type",
);

const logout = () => {
  try {
    localStorage.removeItem(AUTH_STORAGE_KEY);
  } catch (error) {
    // Ignore storage failures and still update the UI.
  }

  initAuthUi();
};

if (authLogoutButtons.length) {
  authLogoutButtons.forEach((button) => {
    button.addEventListener("click", (event) => {
      event.preventDefault();
      logout();
    });
  });
}

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
const catalogModalCloseButtons = document.querySelectorAll(
  "[data-catalog-modal-close]",
);
const catalogItems = document.querySelectorAll("[data-catalog-category]");
const catalogModalLists = document.querySelectorAll(
  ".im-catalog-modal__list[data-catalog-category]",
);

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
    closeMobileCatalog();
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

  catalogModalLists.forEach((list) => {
    const isActive = list.getAttribute("data-catalog-category") === categoryKey;
    list.classList.toggle("is-active", isActive);
    list.setAttribute("aria-hidden", isActive ? "false" : "true");
  });

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
  catalogModalLists.forEach((list) => {
    list.classList.remove("is-active");
    list.setAttribute("aria-hidden", "true");
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

  if (headerMenuOverlay) {
    headerMenuOverlay.classList.remove("is-open");
    const sub = headerMenuOverlay.querySelector("[data-mobile-submenu]");
    if (sub) {
      sub.classList.remove("is-open");
      sub.setAttribute("aria-hidden", "true");
    }
  }

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
  const sliderRoot = document.querySelector("[data-decisions-slider]");

  if (!sliderRoot) return;

  let instance = null;

  const destroy = () => {
    if (!instance) return;

    try {
      instance.destroy();
    } catch (e) {
      // ignore
    }

    instance = null;
    sliderRoot.classList.remove("keen-slider");
    sliderRoot.removeAttribute("style");

    sliderRoot.querySelectorAll(".keen-slider__slide").forEach((slide) => {
      slide.removeAttribute("style");
    });
  };

  const setup = () => {
    const isMobile = window.innerWidth <= MOBILE_DECISIONS_BREAKPOINT;

    if (!isMobile) {
      destroy();
      return;
    }

    if (instance) return;

    sliderRoot.classList.add("keen-slider");

    instance = new KeenSlider(sliderRoot, {
      slides: {
        perView: "auto",
        spacing: 12,
      },
      loop: false,
      drag: true,
      rubberband: false,
    });
  };

  setup();
  window.addEventListener("resize", setup);
};

initDecisionsSliders();

/* ─── Partners Slider ──────────────────────────────────────── */
const initPartnersSlider = () => {
  if (typeof KeenSlider === "undefined") return;

  const container = document.querySelector(".im-partners");
  if (!container) return;

  const sliderWrapper = container.querySelector(".im-partners__slider");
  const initialRoot = sliderWrapper?.querySelector("#partners-slider");
  if (!sliderWrapper || !initialRoot) return;

  const prevBtn = container.querySelector(".im-partners__nav-btn--prev");
  const nextBtn = container.querySelector(".im-partners__nav-btn--next");
  const originalItems = Array.from(initialRoot.children).map((item) =>
    item.cloneNode(true),
  );
  const mobileMediaQuery = window.matchMedia("(max-width: 600px)");
  const mobileStep = 2;
  let desktopSlider = null;
  let mobileSliders = [];
  let currentMode = null;
  let isSyncingMobileRows = false;

  const buildDesktopList = () => {
    const desktopRoot = document.createElement("div");
    desktopRoot.className = "im-partners__list keen-slider";
    desktopRoot.id = "partners-slider";
    originalItems.forEach((item) => desktopRoot.appendChild(item.cloneNode(true)));
    return desktopRoot;
  };

  const buildMobileRows = () => {
    const rowTop = document.createElement("div");
    rowTop.className = "im-partners__list keen-slider im-partners__list--mobile";

    const rowBottom = document.createElement("div");
    rowBottom.className =
      "im-partners__list keen-slider im-partners__list--mobile";

    const midpoint = Math.ceil(originalItems.length / 2);

    originalItems.forEach((item, index) => {
      const targetRow = index < midpoint ? rowTop : rowBottom;
      targetRow.appendChild(item.cloneNode(true));
    });

    return [rowTop, rowBottom];
  };

  const destroySliders = () => {
    if (desktopSlider) {
      desktopSlider.destroy();
      desktopSlider = null;
    }

    mobileSliders.forEach((slider) => slider.destroy());
    mobileSliders = [];
    isSyncingMobileRows = false;
  };

  const setDesktopArrowsState = (slider) => {
    if (!prevBtn || !nextBtn) return;

    const details = slider.track.details;
    if (!details) return;

    prevBtn.disabled = details.rel === 0;
    nextBtn.disabled = details.rel === details.maxIdx;
  };

  const clampSliderIndex = (slider, index) => {
    const details = slider.track.details;
    if (!details) return 0;
    return Math.max(0, Math.min(index, details.maxIdx));
  };

  const syncMobileRows = (sourceSlider) => {
    if (isSyncingMobileRows || !sourceSlider.track.details) return;

    const currentIndex = sourceSlider.track.details.rel;
    const groupedIndex = Math.round(currentIndex / mobileStep) * mobileStep;
    const targetIndex = clampSliderIndex(sourceSlider, groupedIndex);

    isSyncingMobileRows = true;

    mobileSliders.forEach((slider) => {
      const sliderIndex = clampSliderIndex(slider, targetIndex);
      if (slider.track.details && slider.track.details.rel !== sliderIndex) {
        slider.moveToIdx(sliderIndex);
      }
    });

    requestAnimationFrame(() => {
      isSyncingMobileRows = false;
    });
  };

  const setupDesktopSlider = () => {
    sliderWrapper.innerHTML = "";
    const desktopRoot = buildDesktopList();
    sliderWrapper.appendChild(desktopRoot);

    desktopSlider = new KeenSlider(desktopRoot, {
      slides: {
        perView: "auto",
        spacing: 12,
      },
      loop: false,
      drag: true,
      rubberband: false,
    });

    desktopSlider.on("created", setDesktopArrowsState);
    desktopSlider.on("slideChanged", setDesktopArrowsState);
    desktopSlider.on("updated", setDesktopArrowsState);
  };

  const setupMobileSliders = () => {
    sliderWrapper.innerHTML = "";
    const [rowTop, rowBottom] = buildMobileRows();
    sliderWrapper.appendChild(rowTop);
    sliderWrapper.appendChild(rowBottom);

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
          slides: { perView: 2, spacing: 8 },
        },
      },
    };

    mobileSliders = [
      new KeenSlider(rowTop, mobileOptions),
      new KeenSlider(rowBottom, mobileOptions),
    ];

    mobileSliders.forEach((slider) => {
      slider.on("created", () => syncMobileRows(slider));
      slider.on("animationEnded", () => syncMobileRows(slider));
      slider.on("updated", () => syncMobileRows(slider));
    });
  };

  const setupPartnersSlider = () => {
    const nextMode = mobileMediaQuery.matches ? "mobile" : "desktop";
    if (nextMode === currentMode) return;

    destroySliders();

    if (nextMode === "mobile") {
      setupMobileSliders();
    } else {
      setupDesktopSlider();
    }

    currentMode = nextMode;
  };

  if (prevBtn) {
    prevBtn.addEventListener("click", () => {
      if (desktopSlider) desktopSlider.prev();
    });
  }

  if (nextBtn) {
    nextBtn.addEventListener("click", () => {
      if (desktopSlider) desktopSlider.next();
    });
  }

  setupPartnersSlider();
  mobileMediaQuery.addEventListener("change", setupPartnersSlider);
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
      perView: "auto",
      spacing: 12,
    },
    loop: false,
    drag: true,
    rubberband: false,
    breakpoints: {
      "(max-width: 768px)": {
        slides: { perView: "auto", spacing: 10 },
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
  if (typeof KeenSlider === "undefined") return;

  const container = document.querySelector(".im-industries");
  if (!container) return;

  const sliderRoot = container.querySelector("#industries-slider");
  if (!sliderRoot) return;

  const prevBtn = container.querySelector(".im-industries__arrow--prev");
  const nextBtn = container.querySelector(".im-industries__arrow--next");

  const slider = new KeenSlider(sliderRoot, {
    slides: {
      perView: "auto",
      spacing: 0,
    },
    loop: false,
    drag: true,
    rubberband: false,
  });

  function updateArrows(s) {
    if (!prevBtn || !nextBtn) return;
    prevBtn.disabled = s.track.details.rel === 0;
    nextBtn.disabled = s.track.details.rel === s.track.details.maxIdx;
  }

  slider.on("created", updateArrows);
  slider.on("slideChanged", updateArrows);
  slider.on("updated", updateArrows);

  if (prevBtn) {
    prevBtn.addEventListener("click", () => slider.prev());
  }
  if (nextBtn) {
    nextBtn.addEventListener("click", () => slider.next());
  }
};

initIndustriesSlider();

const initHeroSlider = () => {
  const container = document.querySelector("[data-hero-slider]");
  const sliderRoot = container?.querySelector("[data-hero-slider-track]");
  const pagination = container?.querySelector("[data-hero-slider-pagination]");

  if (!container || !sliderRoot || !pagination) return;
  if (container.dataset.sliderReady === "true") return;
  if (typeof KeenSlider === "undefined") return;

  /** @type {HTMLButtonElement[]} */
  let dots = [];

  const syncPagination = (current) => {
    if (!dots.length) return;

    dots.forEach((dot, index) => {
      const isActive = index === current;
      dot.classList.toggle("is-active", isActive);
      dot.setAttribute("aria-current", isActive ? "true" : "false");
    });
  };

  const slider = new KeenSlider(sliderRoot, {
    slides: {
      perView: 1,
      spacing: 0,
    },
    loop: false,
    drag: true,
    rubberband: false,
    created(instance) {
      const slideCount = instance.slides.length;
      pagination.innerHTML = "";
      dots = [];

      if (slideCount <= 1) {
        pagination.hidden = true;
        return;
      }

      pagination.hidden = false;

      for (let index = 0; index < slideCount; index += 1) {
        const dot = document.createElement("button");
        dot.type = "button";
        dot.className = "im-hero__slider-dot";
        dot.setAttribute("aria-label", `Перейти к слайду ${index + 1}`);
        dot.setAttribute("aria-current", index === 0 ? "true" : "false");
        dot.addEventListener("click", () => {
          slider.moveToIdx(index);
        });
        pagination.appendChild(dot);
        dots.push(dot);
      }

      syncPagination(0);
    },
    slideChanged(instance) {
      syncPagination(instance.track.details.rel);
    },
  });

  container.dataset.sliderReady = "true";
};

initHeroSlider();

/* ─── Goods card slider (Keen Slider inside product card) ─── */
const initHomeGoodsCardSliders = () => {
  const containers = document.querySelectorAll("[data-goods-slider]");
  containers.forEach((container) => {
    const root = container.querySelector(".keen-slider");
    if (!root) return;

    const pagination = container.querySelector(".im-goods__pagination");
    /** @type {HTMLButtonElement[]} */
    let dots = [];
    let slideCount = 0;
    let activeMouseIndex = -1;
    const hoverMediaQuery = window.matchMedia("(hover: hover) and (pointer: fine)");

    const slider = new KeenSlider(root, {
      slides: {
        perView: 1,
        spacing: 0,
      },
      loop: true,
      drag: true,
      rubberband: false,
      created(s) {
        slideCount = s.slides.length;
        if (!pagination) return;

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

    const updateSlideByPointer = (clientX) => {
      if (!hoverMediaQuery.matches || slideCount <= 1) return;

      const bounds = container.getBoundingClientRect();
      const relativeX = Math.min(Math.max(clientX - bounds.left, 0), bounds.width);
      const nextIndex = Math.min(
        slideCount - 1,
        Math.floor((relativeX / Math.max(bounds.width, 1)) * slideCount),
      );

      if (nextIndex === activeMouseIndex) return;
      activeMouseIndex = nextIndex;
      slider.moveToIdx(nextIndex);
    };

    container.addEventListener("mousemove", (event) => {
      updateSlideByPointer(event.clientX);
    });

    container.addEventListener("mouseleave", () => {
      if (!hoverMediaQuery.matches || slideCount <= 1) return;
      activeMouseIndex = -1;
      slider.moveToIdx(0);
    });

    hoverMediaQuery.addEventListener("change", (event) => {
      if (event.matches || slideCount <= 1) return;
      activeMouseIndex = -1;
      slider.moveToIdx(0);
    });
  });
};

initHomeGoodsCardSliders();

// ─── Goods favorites (heart toggle) ───────────────────────────
const initGoodsFavorites = () => {
  const favoriteButtons = document.querySelectorAll(".im-goods__favorite");
  if (!favoriteButtons.length) return;

  favoriteButtons.forEach((button) => {
    button.setAttribute(
      "aria-pressed",
      button.classList.contains("is-active") ? "true" : "false",
    );

    button.addEventListener("click", () => {
      const isActive = button.classList.toggle("is-active");
      button.setAttribute("aria-pressed", isActive ? "true" : "false");
    });
  });
};

initGoodsFavorites();

const initGoodsCompareButtons = () => {
  const compareButtons = document.querySelectorAll(".im-goods__compare-top");
  if (!compareButtons.length) return;

  compareButtons.forEach((button) => {
    button.setAttribute(
      "aria-pressed",
      button.classList.contains("is-active") ? "true" : "false",
    );

    button.addEventListener("click", () => {
      const isActive = button.classList.toggle("is-active");
      button.setAttribute("aria-pressed", isActive ? "true" : "false");
      button.setAttribute(
        "aria-label",
        isActive ? "Убрать из сравнения" : "Сравнить",
      );
    });
  });
};

initGoodsCompareButtons();

const initGoodsCartButtons = () => {
  const cartButtons = document.querySelectorAll(".im-goods__cart");
  if (!cartButtons.length) return;
  const cartPageUrl = "./cart.html";

  const cartCheckIconSvg =
    '<svg width="12" height="9" viewBox="0 0 12 9" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M11.2423 0C11.0503 0 10.85 0.0630007 10.7038 0.207001L4.17352 6.65249C3.98077 6.84224 3.78727 6.80701 3.63577 6.58351L1.38877 3.2685C1.15926 2.93025 0.679265 2.83575 0.335014 3.0615C-0.00848637 3.28725 -0.104486 3.75901 0.125015 4.09726L2.37127 7.41224C3.04777 8.40899 4.36552 8.53575 5.22727 7.68825L11.7808 1.26599C12.0725 0.977991 12.0725 0.495 11.7808 0.207001C11.6345 0.0630007 11.4335 0 11.2423 0Z" fill="#C80400" /></svg>';

  const syncCartButtonState = (button, isAdded) => {
    const icon = button.querySelector(".im-goods__cart-icon");
    button.classList.toggle("is-added", isAdded);
    button.setAttribute("aria-pressed", isAdded ? "true" : "false");
    button.setAttribute(
      "aria-label",
      isAdded ? "Добавлено в корзину" : "Добавить в корзину",
    );

    if (!icon) return;
    if (!button.dataset.defaultCartIcon) {
      button.dataset.defaultCartIcon = icon.innerHTML;
    }

    icon.innerHTML = isAdded
      ? cartCheckIconSvg
      : button.dataset.defaultCartIcon;
  };

  cartButtons.forEach((button) => {
    syncCartButtonState(button, button.classList.contains("is-added"));

    button.addEventListener("click", () => {
      syncCartButtonState(button, !button.classList.contains("is-added"));
      window.location.href = cartPageUrl;
    });
  });
};

initGoodsCartButtons();

/* ─── Blog Slider (Keen Slider) ───────────────────────────── */
const initBlogSlider = () => {
  if (typeof KeenSlider === "undefined") return;

  const container = document.querySelector(".im-blog");
  if (!container) return;

  const sliderRoot = container.querySelector(".im-blog__grid");
  if (!sliderRoot) return;

  const cards = Array.from(sliderRoot.querySelectorAll(".im-blog__card"));
  if (!cards.length) return;

  const BLOG_SLIDER_BREAKPOINT = 900;
  let sliderInstance = null;

  const destroySlider = () => {
    if (sliderInstance) {
      try {
        sliderInstance.destroy();
      } catch (e) {
        // ignore
      }
      sliderInstance = null;
    }

    sliderRoot.classList.remove("keen-slider");
    cards.forEach((card) => card.classList.remove("keen-slider__slide"));
  };

  const setup = () => {
    const shouldBeSlider = window.innerWidth <= BLOG_SLIDER_BREAKPOINT;

    if (!shouldBeSlider) {
      destroySlider();
      return;
    }

    if (sliderInstance) return;

    sliderRoot.classList.add("keen-slider");
    cards.forEach((card) => card.classList.add("keen-slider__slide"));

    sliderInstance = new KeenSlider(sliderRoot, {
      slides: {
        perView: "auto",
        spacing: 12,
      },
      loop: false,
      drag: true,
      rubberband: false,
    });
  };

  setup();
  window.addEventListener("resize", setup);
};

initBlogSlider();

/* ─── CTA custom selects (replace native dropdown UI) ───────── */
const initHomeCtaCustomSelects = () => {
  const wraps = document.querySelectorAll(".im-cta__select-wrap");
  if (!wraps.length) return;

  /** @type {Set<HTMLElement>} */
  const openWraps = new Set();

  const closeWrap = (wrap) => {
    if (!wrap) return;
    wrap.classList.remove("is-open");

    const btn = wrap.querySelector(".im-cta__select-btn");
    if (btn) btn.setAttribute("aria-expanded", "false");

    openWraps.delete(wrap);
  };

  const closeAll = () => {
    openWraps.forEach((wrap) => closeWrap(wrap));
  };

  const openWrap = (wrap) => {
    if (!wrap) return;
    closeAll();

    wrap.classList.add("is-open");
    const btn = wrap.querySelector(".im-cta__select-btn");
    const menu = wrap.querySelector(".im-cta__select-menu");
    if (btn) btn.setAttribute("aria-expanded", "true");

    openWraps.add(wrap);

    // Focus active option for keyboard users
    if (menu) {
      const active = menu.querySelector(".im-cta__select-option.is-active");
      if (active && active instanceof HTMLElement) {
        active.focus();
      }
    }
  };

  const ensureButtonAndMenu = (wrap, select) => {
    // Avoid double-init
    if (wrap.querySelector(".im-cta__select-btn")) return;

    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "im-cta__select-btn";
    btn.setAttribute("aria-haspopup", "listbox");
    btn.setAttribute("aria-expanded", "false");

    const menu = document.createElement("div");
    menu.className = "im-cta__select-menu";
    menu.setAttribute("role", "listbox");

    const options = Array.from(select.options);

    const syncButtonText = () => {
      const selectedOption = select.selectedOptions[0] || select.options[0];
      btn.textContent = selectedOption ? selectedOption.textContent : "";
    };

    const rebuildMenu = () => {
      menu.innerHTML = "";

      options.forEach((opt, index) => {
        const optionBtn = document.createElement("button");
        optionBtn.type = "button";
        optionBtn.className = "im-cta__select-option";
        optionBtn.setAttribute("role", "option");
        optionBtn.textContent = opt.textContent;
        optionBtn.dataset.index = String(index);

        const isActive = index === select.selectedIndex;
        optionBtn.classList.toggle("is-active", isActive);
        optionBtn.setAttribute("aria-selected", isActive ? "true" : "false");

        optionBtn.addEventListener("click", (e) => {
          e.preventDefault();
          select.selectedIndex = index;
          select.dispatchEvent(new Event("change", { bubbles: true }));
          syncButtonText();
          rebuildMenu();
          closeWrap(wrap);
          btn.focus();
        });

        optionBtn.addEventListener("keydown", (e) => {
          const items = Array.from(
            menu.querySelectorAll(".im-cta__select-option"),
          );
          const currentIndex = items.indexOf(optionBtn);

          if (e.key === "Escape") {
            e.preventDefault();
            closeWrap(wrap);
            btn.focus();
            return;
          }

          if (e.key === "ArrowDown") {
            e.preventDefault();
            const next = items[Math.min(items.length - 1, currentIndex + 1)];
            if (next) next.focus();
            return;
          }

          if (e.key === "ArrowUp") {
            e.preventDefault();
            const prev = items[Math.max(0, currentIndex - 1)];
            if (prev) prev.focus();
            return;
          }

          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            optionBtn.click();
          }
        });

        menu.appendChild(optionBtn);
      });
    };

    syncButtonText();
    rebuildMenu();

    btn.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      if (wrap.classList.contains("is-open")) {
        closeWrap(wrap);
      } else {
        openWrap(wrap);
      }
    });

    btn.addEventListener("keydown", (e) => {
      if (e.key === "ArrowDown" || e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        openWrap(wrap);
      }
      if (e.key === "Escape") {
        e.preventDefault();
        closeWrap(wrap);
      }
    });

    wrap.appendChild(btn);
    wrap.appendChild(menu);

    // Keep in sync if value changes externally
    select.addEventListener("change", () => {
      syncButtonText();
      rebuildMenu();
    });
  };

  wraps.forEach((wrap) => {
    const select = wrap.querySelector("select.im-cta__select");
    if (!select) return;
    ensureButtonAndMenu(wrap, select);
  });

  document.addEventListener("click", (e) => {
    const target = e.target;
    if (!(target instanceof HTMLElement)) {
      closeAll();
      return;
    }
    const inside = target.closest(".im-cta__select-wrap");
    if (!inside) closeAll();
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeAll();
  });
};

initHomeCtaCustomSelects();

/* ── Catalog sidebar: dual-handle range sliders ── */
const initCatalogRangeSliders = () => {
  const containers = document.querySelectorAll(".im-catalog-sidebar__range");
  if (!containers.length) return;

  containers.forEach((container) => {
    const minInput = container.querySelector(
      ".im-catalog-sidebar__range-input--min",
    );
    const maxInput = container.querySelector(
      ".im-catalog-sidebar__range-input--max",
    );
    const fill = container.querySelector(".im-catalog-sidebar__range-fill");
    const minLabel = container.querySelector("[data-range-min-label]");
    const maxLabel = container.querySelector("[data-range-max-label]");

    if (!minInput || !maxInput || !fill) return;

    const total = +minInput.max - +minInput.min;

    const update = () => {
      let minVal = +minInput.value;
      let maxVal = +maxInput.value;

      if (minVal > maxVal) {
        [minVal, maxVal] = [maxVal, minVal];
        minInput.value = minVal;
        maxInput.value = maxVal;
      }

      const leftPct = ((minVal - +minInput.min) / total) * 100;
      const rightPct = ((maxVal - +minInput.min) / total) * 100;

      fill.style.left = leftPct + "%";
      fill.style.width = rightPct - leftPct + "%";

      if (minLabel) {
        const prefix = minLabel.dataset.rangePrefix
          ? minLabel.dataset.rangePrefix + " "
          : "";
        minLabel.textContent = prefix + minVal;
      }

      if (maxLabel) {
        const prefix = maxLabel.dataset.rangePrefix
          ? maxLabel.dataset.rangePrefix + " "
          : "";
        maxLabel.textContent = prefix + maxVal;
      }
    };

    minInput.addEventListener("input", update);
    maxInput.addEventListener("input", update);
    update();
  });
};

initCatalogRangeSliders();

/* ── Catalog sidebar: "Показать все" expand buttons ── */
const initShowAllButtons = () => {
  const buttons = document.querySelectorAll(".im-catalog-sidebar__show-all");
  buttons.forEach((btn) => {
    btn.addEventListener("click", () => {
      const group = btn.closest(".im-catalog-sidebar__group");
      if (!group) return;
      const wrapper = group.querySelector(".im-catalog-sidebar__group-content");
      group.classList.toggle("is-expanded");
      if (wrapper && !group.classList.contains("is-collapsed")) {
        wrapper.style.maxHeight = wrapper.scrollHeight + "px";
      }
      btn.textContent = group.classList.contains("is-expanded")
        ? "Скрыть"
        : "Показать все";
    });
  });
};

initShowAllButtons();

const initGoodsCardLinks = () => {
  const blockedSelector =
    "a, button, input, select, textarea, label, [data-goods-slider], .keen-slider";

  document.addEventListener("click", (event) => {
    const target = event.target;

    if (!(target instanceof HTMLElement)) return;
    if (target.closest(blockedSelector)) return;

    const card = target.closest(".im-goods__card");
    if (!card) return;

    const article = card.closest("article") || card.querySelector("article");

    let productPageUrl = "";

    if (article && article.dataset.productHref) {
      productPageUrl = article.dataset.productHref;
    } else if (card.dataset.productHref) {
      productPageUrl = card.dataset.productHref;
    }

    if (!productPageUrl) return;

    window.location.href = productPageUrl;
  });
};

initGoodsCardLinks();

/* Ready Solutions Popup */
(function initReadySolutions() {
  const toggles = document.querySelectorAll("[data-ready-solutions-toggle]");
  const mobileToggles = document.querySelectorAll("[data-ready-solutions-mobile]");
  const popup = document.querySelector("[data-ready-solutions]");
  const backdrop = document.querySelector("[data-ready-solutions-backdrop]");

  const allToggles = [...toggles, ...mobileToggles];

  if (!allToggles.length || !popup) {
    return;
  }

  const MOBILE_BREAKPOINT = 600;

  function open() {
    popup.classList.add("is-open");
    popup.setAttribute("aria-hidden", "false");
    if (backdrop) {
      backdrop.classList.add("is-open");
    }
  }

  function close() {
    popup.classList.remove("is-open");
    popup.setAttribute("aria-hidden", "true");
    if (backdrop) {
      backdrop.classList.remove("is-open");
    }
  }

  toggles.forEach((toggle) => {
    toggle.addEventListener("click", (e) => {
      e.preventDefault();
      if (popup.classList.contains("is-open")) {
        close();
      } else {
        open();
      }
    });
  });

  mobileToggles.forEach((toggle) => {
    toggle.addEventListener("click", (e) => {
      if (window.innerWidth >= MOBILE_BREAKPOINT) return;
      e.preventDefault();
      if (popup.classList.contains("is-open")) {
        close();
      } else {
        open();
      }
    });
  });

  document.addEventListener("click", (e) => {
    if (!popup.classList.contains("is-open")) return;
    if (popup.contains(e.target)) return;

    const clickedToggle = allToggles.some((t) => t.contains(e.target));
    if (clickedToggle) return;

    close();
  });

  if (backdrop) {
    backdrop.addEventListener("click", close);
  }

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && popup.classList.contains("is-open")) {
      close();
    }
  });
})();

// ─── Search Dropdown ─────────────────────────────────────────
(() => {
  const searchInput = document.querySelector("[data-search-input]");
  const searchDropdown = document.querySelector("[data-search-dropdown]");

  if (!searchInput || !searchDropdown) return;

  const searchForm = searchInput.closest(".im-header__search");

  const openDropdown = () => {
    searchDropdown.classList.add("is-open");
    if (searchForm) searchForm.classList.add("is-dropdown-open");
  };
  const closeDropdown = () => {
    searchDropdown.classList.remove("is-open");
    if (searchForm) searchForm.classList.remove("is-dropdown-open");
  };

  searchInput.addEventListener("input", () => {
    const query = searchInput.value.trim();
    if (query.length > 0) {
      openDropdown();
    } else {
      closeDropdown();
    }
  });

  searchInput.addEventListener("focus", () => {
    if (searchInput.value.trim().length > 0) {
      openDropdown();
    }
  });

  document.addEventListener("click", (e) => {
    if (!searchDropdown.classList.contains("is-open")) return;
    const wrapper = searchInput.closest(".im-header__search-wrapper");
    if (wrapper && !wrapper.contains(e.target)) {
      closeDropdown();
    }
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && searchDropdown.classList.contains("is-open")) {
      closeDropdown();
      searchInput.blur();
    }
  });

  if (searchForm) {
    searchForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const query = searchInput.value.trim();
      if (!query) return;

      const encoded = encodeURIComponent(query);
      if (query.toLowerCase() === "not found") {
        window.location.href = `./search_404.html?q=${encoded}`;
      } else {
        window.location.href = `./catalog.html?q=${encoded}`;
      }
    });
  }
})();

// ─── Mobile Search Overlay ──────────────────────────────────
(() => {
  const overlay = document.querySelector("[data-mobile-search]");
  if (!overlay) return;

  const openBtn = document.querySelector(
    ".im-header__mobile-action--search",
  );
  const closeBtn = overlay.querySelector("[data-mobile-search-close]");
  const input = overlay.querySelector("[data-mobile-search-input]");
  const clearBtn = overlay.querySelector("[data-mobile-search-clear]");
  const form = overlay.querySelector("[data-mobile-search-form]");
  const results = overlay.querySelector("[data-mobile-search-results]");

  const open = () => {
    overlay.classList.add("is-open");
    document.body.style.overflow = "hidden";
    if (input) {
      requestAnimationFrame(() => input.focus());
    }
  };

  const close = () => {
    overlay.classList.remove("is-open");
    document.body.style.overflow = "";
    if (input) {
      input.value = "";
      updateClear();
      toggleResults();
    }
  };

  const updateClear = () => {
    if (!clearBtn || !input) return;
    clearBtn.classList.toggle("is-visible", input.value.length > 0);
  };

  const toggleResults = () => {
    if (!results || !input) return;
    results.classList.toggle("is-visible", input.value.trim().length > 0);
  };

  if (openBtn) openBtn.addEventListener("click", open);
  if (closeBtn) closeBtn.addEventListener("click", close);

  if (clearBtn && input) {
    clearBtn.addEventListener("click", () => {
      input.value = "";
      updateClear();
      toggleResults();
      input.focus();
    });
  }

  if (input) {
    input.addEventListener("input", () => {
      updateClear();
      toggleResults();
    });
  }

  if (form) {
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const query = input ? input.value.trim() : "";
      if (!query) return;

      const encoded = encodeURIComponent(query);
      if (query.toLowerCase() === "not found") {
        window.location.href = `./search_404.html?q=${encoded}`;
      } else {
        window.location.href = `./catalog.html?q=${encoded}`;
      }
    });
  }

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && overlay.classList.contains("is-open")) {
      close();
    }
  });
})();
