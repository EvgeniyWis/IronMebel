(function initReadySolutionsPage() {
  var page = document.querySelector(".im-ready-solutions-page");

  if (!page) return;
})();

document
  .querySelectorAll(".im-catalog-sidebar__group")
  .forEach(function (group) {
    var title = group.querySelector(".im-catalog-sidebar__title--with-arrow");
    if (!title) return;

    var wrapper = document.createElement("div");
    wrapper.className = "im-catalog-sidebar__group-content";

    var children = Array.from(group.children).filter(function (el) {
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

(function initReadySolutionsCardsSlider() {
  var grid = document.querySelector(".im-ready-solutions-page__grid");
  if (!grid) return;

  var items = Array.from(
    grid.querySelectorAll(".im-ready-solutions-page__grid-item"),
  );
  if (!items.length) return;

  var sliderInstance = null;
  var currentSliderMode = null;
  var waitTimer = null;
  var waitTries = 0;

  var destroySlider = function () {
    if (!sliderInstance) return;

    try {
      sliderInstance.destroy();
    } catch (e) {
      // ignore
    }

    sliderInstance = null;
    currentSliderMode = null;
    grid.classList.remove("keen-slider");
    items.forEach(function (item) {
      item.classList.remove("keen-slider__slide");
    });
  };

  var setupSlider = function () {
    var isMobileSlider = window.matchMedia("(max-width: 768px)").matches;
    var isTabletSlider = window.matchMedia("(max-width: 1200px)").matches;
    var nextMode = isMobileSlider
      ? "mobile"
      : isTabletSlider
        ? "tablet"
        : "off";

    if (nextMode !== "off") {
      if (typeof KeenSlider === "undefined") return;

      if (sliderInstance && currentSliderMode === nextMode) return;

      destroySlider();

      grid.classList.add("keen-slider");
      items.forEach(function (item) {
        item.classList.add("keen-slider__slide");
      });

      sliderInstance = new KeenSlider(grid, {
        slides: {
          perView:
            nextMode === "mobile"
              ? window.matchMedia("(max-width: 510px)").matches
                ? 2
                : 2.2
              : "auto",
          spacing: nextMode === "mobile" ? 8 : 10,
        },
        loop: false,
        drag: true,
        rubberband: false,
      });
      currentSliderMode = nextMode;

      return;
    }

    destroySlider();
  };

  var ensureKeenThenSetup = function () {
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
  window.addEventListener("ironmebel:layout-ready", ensureKeenThenSetup);
})();

(function initReadySolutionsCollectionsSlider() {
  var tagsRoot = document.querySelector(".im-catalog-collections__tags");
  if (!tagsRoot) return;

  var originalMarkup = tagsRoot.innerHTML;
  var rowNodes = [];
  var isSyncing = false;

  var isMobile = function () {
    return window.matchMedia("(max-width: 768px)").matches;
  };

  var buildTagsFromMarkup = function () {
    var tmp = document.createElement("div");
    tmp.innerHTML = originalMarkup;
    return Array.from(tmp.querySelectorAll(".im-catalog-collections__tag"));
  };

  var syncRows = function (sourceRow) {
    var sourceMax = sourceRow.scrollWidth - sourceRow.clientWidth;
    var sourceProgress = sourceMax > 0 ? sourceRow.scrollLeft / sourceMax : 0;

    rowNodes.forEach(function (row) {
      if (row === sourceRow) return;
      var targetMax = row.scrollWidth - row.clientWidth;
      row.scrollLeft = targetMax > 0 ? sourceProgress * targetMax : 0;
    });
  };

  var onRowScroll = function (event) {
    if (isSyncing) return;
    isSyncing = true;
    syncRows(event.currentTarget);
    isSyncing = false;
  };

  var destroyRowsSlider = function () {
    rowNodes.forEach(function (row) {
      row.removeEventListener("scroll", onRowScroll);
    });
    rowNodes = [];
    tagsRoot.classList.remove("is-mobile-rows-slider");
    tagsRoot.innerHTML = originalMarkup;
  };

  var createRowsSlider = function () {
    var tags = buildTagsFromMarkup();
    if (!tags.length) return;

    var rows = [[], [], []];
    tags.forEach(function (tag, index) {
      rows[index % 3].push(tag);
    });

    tagsRoot.classList.add("is-mobile-rows-slider");
    tagsRoot.innerHTML = "";
    rowNodes = [];

    rows.forEach(function (rowTags) {
      if (!rowTags.length) return;
      var row = document.createElement("div");
      row.className = "im-catalog-collections__row-slider";

      rowTags.forEach(function (tag) {
        row.appendChild(tag);
      });

      row.addEventListener("scroll", onRowScroll, { passive: true });
      rowNodes.push(row);
      tagsRoot.appendChild(row);
    });
  };

  var setupRowsSlider = function () {
    if (!isMobile()) {
      destroyRowsSlider();
      return;
    }

    if (rowNodes.length) return;
    createRowsSlider();
  };

  setupRowsSlider();
  window.addEventListener("resize", setupRowsSlider);
})();

(function initReadySolutionsMobileFilters() {
  var page = document.querySelector(".im-ready-solutions-page");
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
    return window.matchMedia("(max-width: 768px)").matches;
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

(function initReadySolutionsSortDropdown() {
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

(function initReadySolutionsDownloadDropdown() {
  var dropdown = document.querySelector("[data-ready-download]");
  if (!dropdown) return;

  var toggle = dropdown.querySelector("[data-ready-download-toggle]");
  var menu = dropdown.querySelector("[data-ready-download-menu]");
  var backdrop = dropdown.querySelector("[data-ready-download-backdrop]");

  if (!toggle || !menu) return;

  var isMobile = function () {
    return window.matchMedia("(max-width: 768px)").matches;
  };

  var close = function () {
    dropdown.classList.remove("is-open");
    toggle.setAttribute("aria-expanded", "false");
    if (isMobile()) {
      document.body.style.overflow = "";
    }
  };

  toggle.addEventListener("click", function () {
    var isOpen = dropdown.classList.toggle("is-open");
    toggle.setAttribute("aria-expanded", isOpen ? "true" : "false");
    if (isMobile()) {
      document.body.style.overflow = isOpen ? "hidden" : "";
    }
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

  if (backdrop) {
    backdrop.addEventListener("click", close);
  }

  window.addEventListener("resize", function () {
    if (!isMobile()) {
      document.body.style.overflow = "";
    }
  });
})();

(function initReadySolutionsGoodsCardLinks() {
  var blockedSelector =
    "a, button, input, select, textarea, label, [data-goods-slider], .keen-slider";

  document.addEventListener("click", function (event) {
    var target = event.target;
    if (!(target instanceof HTMLElement)) return;
    if (target.closest(blockedSelector)) return;

    var card = target.closest(".im-goods__card");
    if (!card) return;

    var article = card.closest("article") || card.querySelector("article");
    var productPageUrl = "";

    if (article && article.dataset.productHref) {
      productPageUrl = article.dataset.productHref;
    } else if (card.dataset.productHref) {
      productPageUrl = card.dataset.productHref;
    }

    if (!productPageUrl) return;

    window.location.href = productPageUrl;
  });
})();

(() => {
  var params = new URLSearchParams(window.location.search);
  var query = params.get("q");
  if (!query) return;

  var heroMain = document.querySelector(".im-ready-solutions-page__hero-main");
  if (heroMain) {
    var titleEl = heroMain.querySelector(".im-ready-solutions-page__title");
    var countEl = heroMain.querySelector(
      ".im-ready-solutions-page__count--desktop",
    );
    var count = countEl
      ? countEl.textContent.trim().match(/\d+/)?.[0] || "34"
      : "34";

    if (titleEl) {
      titleEl.innerHTML =
        "По запросу &laquo;" + query + "&raquo; найдено " + count + " товаров";
    }

    if (countEl) {
      countEl.style.display = "none";
    }
  }

  var mobileCount = document.querySelector(
    ".im-ready-solutions-page__count--mobile",
  );
  if (mobileCount) {
    mobileCount.style.display = "none";
  }

  var categoryGrid = document.querySelector(".im-ready-solutions-page__grid");
  if (categoryGrid) {
    categoryGrid.style.display = "none";
  }

  var collections = document.querySelector(".im-catalog-collections");
  if (collections) {
    collections.style.display = "none";
  }

  document
    .querySelectorAll(
      ".im-catalog-toolbar__filter-chip, .im-catalog-toolbar__reset",
    )
    .forEach(function (el) {
      el.style.display = "none";
    });

  var downloadBtn = document.querySelector(
    ".im-ready-solutions-page__download-dropdown",
  );
  if (downloadBtn) {
    downloadBtn.style.display = "none";
  }

  var pageTitle = document.querySelector("title");
  if (pageTitle) {
    pageTitle.textContent = "Поиск: " + query + " | IronMebel";
  }
})();
