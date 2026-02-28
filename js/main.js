const headerBurger = document.querySelector(".im-header__top-burger");
const headerMenuOverlay = document.querySelector(".im-header__mobile-overlay");
const headerMenuClose = document.querySelector(".im-header__mobile-close");
const headerMenuLinks = document.querySelectorAll(".im-header__mobile-link");
const headerCity = document.querySelector(".im-header__city[data-city-dropdown]");
const cityModal = document.querySelector("[data-city-modal]");
const cityModalCloseButtons = document.querySelectorAll("[data-city-modal-close]");
const cityModalSearchInput = document.querySelector("[data-city-modal-search]");
const cityModalOptions = document.querySelectorAll("[data-city-modal-option]");

const isSmallScreenCity = () => window.matchMedia("(max-width: 390px)").matches;

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
  const cityTextElement = document.querySelector(".im-header__city-text");
  const cityOptions = document.querySelectorAll(".im-header__city-option");

  if (cityTextElement && value) {
    cityTextElement.textContent = value;
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
