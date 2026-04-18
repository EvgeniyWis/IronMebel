(function initNewsPage() {
  var grid = document.querySelector("[data-news-grid]");
  var loadMoreButton = document.querySelector("[data-news-load-more]");
  var pagesContainer = document.querySelector("[data-news-pagination-pages]");
  var firstPageButton = document.querySelector('[data-news-pagination="first"]');
  var prevPageButton = document.querySelector('[data-news-pagination="prev"]');
  var nextPageButton = document.querySelector('[data-news-pagination="next"]');
  var lastPageButton = document.querySelector('[data-news-pagination="last"]');
  var dropdowns = Array.from(document.querySelectorAll("[data-news-sort]"));

  if (
    !grid ||
    !loadMoreButton ||
    !pagesContainer ||
    !firstPageButton ||
    !prevPageButton ||
    !nextPageButton ||
    !lastPageButton
  ) {
    return;
  }

  var PAGE_SIZE = 6;
  var newsItems = Array.from(grid.querySelectorAll("[data-news-item]"));

  if (!newsItems.length) return;

  var state = {
    sort: "popular",
    currentPage: 1,
  };

  var sortLabels = {
    popular: "Сначала популярные",
    newest: "Сначала новые",
    oldest: "Сначала старые",
  };

  var setButtonDisabled = function (button, disabled) {
    button.disabled = disabled;
    button.setAttribute("aria-disabled", disabled ? "true" : "false");
  };

  var getTotalPages = function () {
    return Math.max(1, Math.ceil(newsItems.length / PAGE_SIZE));
  };

  var getSortedItems = function () {
    var items = newsItems.slice();

    if (state.sort === "newest") {
      items.sort(function (a, b) {
        return Date.parse(b.dataset.newsDate || "") - Date.parse(a.dataset.newsDate || "");
      });
      return items;
    }

    if (state.sort === "oldest") {
      items.sort(function (a, b) {
        return Date.parse(a.dataset.newsDate || "") - Date.parse(b.dataset.newsDate || "");
      });
      return items;
    }

    items.sort(function (a, b) {
      return Number(b.dataset.newsPopularity || 0) - Number(a.dataset.newsPopularity || 0);
    });

    return items;
  };

  var buildPaginationTokens = function (currentPage, totalPages) {
    if (totalPages <= 5) {
      return Array.from({ length: totalPages }, function (_, index) {
        return index + 1;
      });
    }

    if (currentPage <= 3) {
      return [1, 2, 3, "ellipsis", totalPages];
    }

    if (currentPage >= totalPages - 2) {
      return [1, "ellipsis", totalPages - 2, totalPages - 1, totalPages];
    }

    return [
      1,
      "ellipsis",
      currentPage - 1,
      currentPage,
      currentPage + 1,
      "ellipsis",
      totalPages,
    ];
  };

  var updateVisibleCards = function (sortedItems) {
    var startIndex = (state.currentPage - 1) * PAGE_SIZE;
    var endIndex = startIndex + PAGE_SIZE;

    sortedItems.forEach(function (item, index) {
      var image = item.querySelector(".im-news-page__card-image");
      var isVisible = index >= startIndex && index < endIndex;

      item.hidden = !isVisible;

      if (image) {
        image.loading = index === startIndex ? "eager" : "lazy";
      }
    });
  };

  var renderGrid = function () {
    var sortedItems = getSortedItems();

    sortedItems.forEach(function (item) {
      grid.appendChild(item);
    });

    updateVisibleCards(sortedItems);
  };

  var renderPagination = function () {
    var currentPage = state.currentPage;
    var totalPages = getTotalPages();
    var tokens = buildPaginationTokens(currentPage, totalPages);

    pagesContainer.replaceChildren();

    tokens.forEach(function (token) {
      if (token === "ellipsis") {
        var ellipsis = document.createElement("span");
        ellipsis.className = "im-news-page__pagination-button";
        ellipsis.setAttribute("aria-hidden", "true");
        ellipsis.textContent = "...";
        pagesContainer.appendChild(ellipsis);
        return;
      }

      if (token === currentPage) {
        var current = document.createElement("span");
        current.className = "im-news-page__pagination-current";
        current.setAttribute("aria-current", "page");
        current.textContent = String(token);
        pagesContainer.appendChild(current);
        return;
      }

      var button = document.createElement("button");
      button.type = "button";
      button.className = "im-news-page__pagination-button";
      button.textContent = String(token);
      button.setAttribute("aria-label", "Страница " + token);
      button.addEventListener("click", function () {
        goToPage(token);
      });
      pagesContainer.appendChild(button);
    });

    setButtonDisabled(firstPageButton, currentPage === 1);
    setButtonDisabled(prevPageButton, currentPage === 1);
    setButtonDisabled(nextPageButton, currentPage === totalPages);
    setButtonDisabled(lastPageButton, currentPage === totalPages);
  };

  var renderLoadMore = function () {
    var isLastPage = state.currentPage >= getTotalPages();
    setButtonDisabled(loadMoreButton, isLastPage);
  };

  var render = function () {
    renderGrid();
    renderPagination();
    renderLoadMore();
  };

  var scrollWindowToTop = function () {
    window.scrollTo(0, 0);
  };

  var goToPage = function (page, options) {
    var nextPage = Math.max(1, Math.min(page, getTotalPages()));
    var shouldScrollToTop = Boolean(options && options.scrollToTop);

    if (nextPage === state.currentPage) return;

    state.currentPage = nextPage;
    render();

    if (shouldScrollToTop) {
      scrollWindowToTop();
    }
  };

  firstPageButton.addEventListener("click", function () {
    goToPage(1);
  });

  prevPageButton.addEventListener("click", function () {
    goToPage(state.currentPage - 1);
  });

  nextPageButton.addEventListener("click", function () {
    goToPage(state.currentPage + 1);
  });

  lastPageButton.addEventListener("click", function () {
    goToPage(getTotalPages());
  });

  loadMoreButton.addEventListener("click", function () {
    goToPage(state.currentPage + 1, { scrollToTop: true });
  });

  dropdowns.forEach(function (dropdown) {
    var toggle = dropdown.querySelector("[data-news-sort-toggle]");
    var label = dropdown.querySelector("[data-news-sort-label]");
    var options = Array.from(dropdown.querySelectorAll("[data-news-sort-option]"));

    if (!toggle || !label || !options.length) return;

    var close = function () {
      dropdown.classList.remove("is-open");
      toggle.setAttribute("aria-expanded", "false");
    };

    toggle.addEventListener("click", function () {
      var isOpen = dropdown.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", isOpen ? "true" : "false");
    });

    options.forEach(function (option, index) {
      option.addEventListener("click", function () {
        var nextSort =
          index === 1 ? "newest" : index === 2 ? "oldest" : "popular";

        options.forEach(function (item) {
          var isActive = item === option;
          item.classList.toggle("is-active", isActive);
          item.setAttribute("aria-selected", isActive ? "true" : "false");
        });

        state.sort = nextSort;
        state.currentPage = 1;
        label.textContent = sortLabels[nextSort];
        close();
        render();
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

  render();
})();
