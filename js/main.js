const headerBurger = document.querySelector(".im-header__top-burger");
const headerMenuOverlay = document.querySelector(".im-header__mobile-overlay");
const headerMenuClose = document.querySelector(".im-header__mobile-close");
const headerMenuLinks = document.querySelectorAll(".im-header__mobile-link");
const headerCity = document.querySelector(".im-header__city[data-city-dropdown]");
const cityModal = document.querySelector("[data-city-modal]");
const cityModalCloseButtons = document.querySelectorAll("[data-city-modal-close]");
const cityModalSearchInput = document.querySelector("[data-city-modal-search]");
const cityModalOptions = document.querySelectorAll("[data-city-modal-option]");

const catalogModal = document.querySelector("[data-catalog-modal]");
const catalogModalTitle = document.querySelector(".im-catalog-modal__title");
const CATALOG_CATEGORY_CLASS_PREFIX = "im-catalog-modal--category-";
const catalogModalCloseButtons = document.querySelectorAll("[data-catalog-modal-close]");
const catalogItems = document.querySelectorAll("[data-catalog-category]");

const mobileCatalog = document.querySelector("[data-mobile-catalog]");
const mobileCatalogOpenButtons = document.querySelectorAll("[data-mobile-catalog-open]");
const mobileCatalogCloseButtons = document.querySelectorAll("[data-mobile-catalog-close]");
const MOBILE_CATALOG_STORAGE_KEY = "imMobileCatalogOpen";
const CATALOG_MODAL_STORAGE_KEY = "imCatalogModalCategory";
const CATALOG_MODAL_TITLE_KEY = "imCatalogModalTitle";
const CATALOG_MODAL_FROM_MOBILE_KEY = "imCatalogModalFromMobile";

const isSmallScreenCity = () => window.matchMedia("(max-width: 390px)").matches;
const isMobileCatalogScreen = () => window.matchMedia("(max-width: 600px)").matches;

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
  if (!cityModal || !isSmallScreenCity()) return;

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

  if (cityToggle) {
    const openCityDropdown = () => {
      if (!cityDropdown || isSmallScreenCity()) return;
      headerCity.classList.add("is-open");
      cityToggle.setAttribute("aria-expanded", "true");
    };

    const closeCityDropdown = () => {
      if (!cityDropdown) return;
      headerCity.classList.remove("is-open");
      cityToggle.setAttribute("aria-expanded", "false");
    };

    const toggleCityDropdown = () => {
      if (isSmallScreenCity()) {
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

  const openedFromMobile = sessionStorage.getItem(CATALOG_MODAL_FROM_MOBILE_KEY);

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

    const titleText = titleElement && titleElement.textContent
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

  const catalogCityToggle = mobileCatalog.querySelector(".im-header__city-toggle");
  if (catalogCityToggle && cityModal) {
    catalogCityToggle.addEventListener("click", (event) => {
      if (isMobileCatalogScreen() && isSmallScreenCity()) {
        event.stopPropagation();
        openCityModal();
      }
    });
  }
}

const mobileCatalogItems = document.querySelectorAll(".im-mobile-catalog__item[data-catalog-category]");
if (mobileCatalogItems.length && catalogModal) {
  mobileCatalogItems.forEach((item) => {
    const categoryKey = item.getAttribute("data-catalog-category");
    const link = item.querySelector(".im-mobile-catalog__link");
    const titleElement = item.querySelector(".im-mobile-catalog__item-title");

    if (!categoryKey || !link) return;

    const titleText = titleElement && titleElement.textContent
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
