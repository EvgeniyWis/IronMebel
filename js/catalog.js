document
  .querySelectorAll(".im-catalog-sidebar__group")
  .forEach(function (group) {
    const title = group.querySelector(".im-catalog-sidebar__title--with-arrow");
    if (!title) return;

    const wrapper = document.createElement("div");
    wrapper.className = "im-catalog-sidebar__group-content";

    const children = Array.from(group.children).filter(function (el) {
      return el !== title;
    });
    children.forEach(function (child) {
      wrapper.appendChild(child);
    });
    group.appendChild(wrapper);

    wrapper.style.maxHeight = wrapper.scrollHeight + "px";

    title.addEventListener("click", function () {
      if (group.classList.contains("is-collapsed")) {
        group.classList.remove("is-collapsed");
        wrapper.style.maxHeight = wrapper.scrollHeight + "px";
      } else {
        wrapper.style.maxHeight = wrapper.scrollHeight + "px";
        requestAnimationFrame(function () {
          group.classList.add("is-collapsed");
        });
      }
    });
  });

(function initCatalogHeroForThirdLevelBreadcrumbs() {
  var breadcrumbs = document.querySelector(".im-catalog-page__breadcrumbs");
  var heroMain = document.querySelector(".im-catalog-page__hero-main");
  var title = document.querySelector(".im-catalog-page__title");

  if (!breadcrumbs || !heroMain || !title) return;

  var current = breadcrumbs.querySelector(
    ".im-catalog-page__breadcrumb-current",
  );
  var links = Array.from(
    breadcrumbs.querySelectorAll(".im-catalog-page__breadcrumb-link"),
  );

  // Third level means: at least two links before current item.
  if (!current || links.length < 2) return;

  var parentLink = links[links.length - 1];
  var parentText = parentLink.textContent ? parentLink.textContent.trim() : "";
  var currentText = current.textContent ? current.textContent.trim() : "";

  if (!parentText) return;

  heroMain.classList.add("im-catalog-page__hero-main--with-parent");

  if (currentText) {
    title.textContent = currentText;
  }

  if (heroMain.querySelector(".im-catalog-page__hero-parent-link")) return;

  var link = document.createElement("a");
  link.className = "im-catalog-page__hero-parent-link";
  link.href = parentLink.getAttribute("href") || "#";
  link.innerHTML =
    '<span class="im-catalog-page__hero-parent-link-icon" aria-hidden="true"><svg width="5" height="11" viewBox="0 0 5 11" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M3.60467 0.0184698C3.41717 0.0559698 3.22892 0.150474 3.11492 0.322974L0.125437 4.82297C-0.0418124 5.07497 -0.0418124 5.41472 0.125437 5.66672L3.11492 10.1667C3.34367 10.511 3.82217 10.6077 4.16567 10.3775C4.50842 10.148 4.60442 9.66721 4.37567 9.32296L1.66668 5.24448L4.37567 1.16672C4.60442 0.821723 4.50842 0.341719 4.16567 0.11222C3.99392 -0.00328015 3.79217 -0.0197801 3.60467 0.0184698Z" fill="#2555D6" /></svg></span><span class="im-catalog-page__hero-parent-link-text"></span>';

  var text = link.querySelector(".im-catalog-page__hero-parent-link-text");
  if (text) {
    text.textContent = parentText;
  }

  heroMain.insertBefore(link, title);
})();

(function initCatalogCardsSlider() {
  const grid = document.querySelector(".im-catalog-page__grid");
  if (!grid) return;

  const items = Array.from(
    grid.querySelectorAll(".im-catalog-page__grid-item"),
  );
  if (!items.length) return;

  let sliderInstance = null;
  let waitTimer = null;
  let waitTries = 0;

  const destroySlider = function () {
    if (!sliderInstance) return;

    try {
      sliderInstance.destroy();
    } catch (e) {
      // ignore
    }

    sliderInstance = null;
    grid.classList.remove("keen-slider");
    items.forEach(function (item) {
      item.classList.remove("keen-slider__slide");
    });
  };

  const setupSlider = function () {
    const shouldBeSlider = window.matchMedia("(max-width: 600px)").matches;

    if (shouldBeSlider) {
      if (sliderInstance) return;
      if (typeof KeenSlider === "undefined") return;

      grid.classList.add("keen-slider");
      items.forEach(function (item) {
        item.classList.add("keen-slider__slide");
      });

      sliderInstance = new KeenSlider(grid, {
        slides: {
          perView: 2.2,
          spacing: 8,
        },
        loop: false,
        drag: true,
        rubberband: false,
      });

      return;
    }

    destroySlider();
  };

  const ensureKeenThenSetup = function () {
    if (typeof KeenSlider !== "undefined") {
      if (waitTimer) {
        clearInterval(waitTimer);
        waitTimer = null;
      }
      setupSlider();
      return;
    }

    if (waitTimer) return;

    waitTimer = setInterval(function () {
      waitTries += 1;

      if (typeof KeenSlider !== "undefined") {
        clearInterval(waitTimer);
        waitTimer = null;
        setupSlider();
        return;
      }

      if (waitTries > 40) {
        clearInterval(waitTimer);
        waitTimer = null;
      }
    }, 150);
  };

  ensureKeenThenSetup();
  window.addEventListener("resize", setupSlider);
})();

(function initCatalogCollectionsRowsSlider() {
  var tagsRoot = document.querySelector(".im-catalog-collections__tags");
  if (!tagsRoot) return;

  var originalMarkup = tagsRoot.innerHTML;
  var sliderInstances = [];
  var waitTimer = null;
  var waitTries = 0;

  var isMobile = function () {
    return window.matchMedia("(max-width: 600px)").matches;
  };

  var buildTagsFromMarkup = function () {
    var tmp = document.createElement("div");
    tmp.innerHTML = originalMarkup;
    return Array.from(tmp.querySelectorAll(".im-catalog-collections__tag"));
  };

  var destroyRows = function () {
    sliderInstances.forEach(function (instance) {
      try {
        instance.destroy();
      } catch (e) {
        // ignore
      }
    });
    sliderInstances = [];

    tagsRoot.classList.remove("is-mobile-sliders");
    tagsRoot.innerHTML = originalMarkup;
  };

  var createRows = function () {
    var tags = buildTagsFromMarkup();
    if (!tags.length) return;

    var rows = [[], [], []];
    tags.forEach(function (tag, index) {
      rows[index % 3].push(tag);
    });

    rows.forEach(function (rowTags) {
      if (rowTags.length === 1) {
        rowTags.push(rowTags[0].cloneNode(true));
      }
    });

    tagsRoot.classList.add("is-mobile-sliders");
    tagsRoot.innerHTML = "";

    rows.forEach(function (rowTags) {
      if (!rowTags.length) return;

      var row = document.createElement("div");
      row.className = "im-catalog-collections__row keen-slider";

      rowTags.forEach(function (tag) {
        tag.classList.add("keen-slider__slide");
        row.appendChild(tag);
      });

      tagsRoot.appendChild(row);

      sliderInstances.push(
        new KeenSlider(row, {
          slides: {
            perView: 1.5,
            spacing: 8,
          },
          drag: true,
          rubberband: false,
        }),
      );
    });
  };

  var setupRows = function () {
    if (!isMobile()) {
      destroyRows();
      return;
    }

    if (sliderInstances.length) return;
    if (typeof KeenSlider === "undefined") return;

    createRows();
  };

  var ensureKeenThenSetup = function () {
    if (typeof KeenSlider !== "undefined") {
      if (waitTimer) {
        clearInterval(waitTimer);
        waitTimer = null;
      }
      setupRows();
      return;
    }

    if (waitTimer) return;

    waitTimer = setInterval(function () {
      waitTries += 1;

      if (typeof KeenSlider !== "undefined") {
        clearInterval(waitTimer);
        waitTimer = null;
        setupRows();
        return;
      }

      if (waitTries > 40) {
        clearInterval(waitTimer);
        waitTimer = null;
      }
    }, 150);
  };

  ensureKeenThenSetup();
  window.addEventListener("resize", setupRows);
})();

(function initMobileCatalogFilters() {
  var page = document.querySelector(".im-catalog-page");
  if (!page) return;

  var openButtons = Array.from(
    document.querySelectorAll("[data-catalog-filters-open]"),
  );
  var closeButtons = Array.from(
    document.querySelectorAll("[data-catalog-filters-close]"),
  );
  var backdrop = document.querySelector("[data-catalog-filters-backdrop]");

  if (!openButtons.length) return;

  var isMobile = function () {
    return window.matchMedia("(max-width: 600px)").matches;
  };

  var closeFilters = function () {
    page.classList.remove("is-filters-open");
    document.body.style.overflow = "";
  };

  var openFilters = function () {
    if (!isMobile()) return;
    page.classList.add("is-filters-open");
    document.body.style.overflow = "hidden";
  };

  openButtons.forEach(function (button) {
    button.addEventListener("click", function () {
      if (page.classList.contains("is-filters-open")) {
        closeFilters();
      } else {
        openFilters();
      }
    });
  });

  closeButtons.forEach(function (button) {
    button.addEventListener("click", closeFilters);
  });

  if (backdrop) {
    backdrop.addEventListener("click", closeFilters);
  }

  window.addEventListener("resize", function () {
    if (!isMobile()) {
      closeFilters();
    }
  });

  document.addEventListener("keydown", function (event) {
    if (event.key === "Escape" && page.classList.contains("is-filters-open")) {
      closeFilters();
    }
  });
})();

(function initCatalogSortDropdown() {
  var dropdowns = Array.from(document.querySelectorAll("[data-catalog-sort]"));
  if (!dropdowns.length) return;

  dropdowns.forEach(function (dropdown) {
    var toggle = dropdown.querySelector("[data-catalog-sort-toggle]");
    var label = dropdown.querySelector("[data-catalog-sort-label]");
    var options = Array.from(
      dropdown.querySelectorAll("[data-catalog-sort-option]"),
    );

    if (!toggle || !label || !options.length) return;

    var close = function () {
      dropdown.classList.remove("is-open");
      toggle.setAttribute("aria-expanded", "false");
    };

    toggle.addEventListener("click", function () {
      var isOpen = dropdown.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", isOpen ? "true" : "false");
    });

    options.forEach(function (option) {
      option.addEventListener("click", function () {
        options.forEach(function (btn) {
          btn.classList.remove("is-active");
        });
        option.classList.add("is-active");
        label.textContent = option.textContent.trim();
        close();
      });
    });

    document.addEventListener("click", function (event) {
      if (!dropdown.contains(event.target)) {
        close();
      }
    });

    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape") {
        close();
      }
    });
  });
})();
