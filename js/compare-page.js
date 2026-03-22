document.addEventListener("DOMContentLoaded", function () {
  var MODAL_ANIMATION_DURATION = 220;
  var filledSection = document.querySelector("[data-compare-filled]");
  var emptySection = document.querySelector("[data-compare-empty]");
  var clearButtons = document.querySelectorAll("[data-compare-clear]");
  var modal = document.querySelector("[data-compare-modal]");
  var modalCloseElements = document.querySelectorAll(
    "[data-compare-modal-close]",
  );
  var cancelButton = document.querySelector("[data-compare-cancel]");
  var confirmButton = document.querySelector("[data-compare-confirm]");
  var tabs = document.querySelectorAll("[data-compare-tab]");
  var tabPanels = document.querySelectorAll("[data-tab-panel]");
  var modalCloseTimeoutId = null;
  if (!filledSection || !emptySection || !tabs.length || !tabPanels.length) {
    return;
  }

  function forEachNode(list, callback) {
    Array.prototype.forEach.call(list, callback);
  }

  function getPanelState(panel) {
    return {
      panel: panel,
      cardsContainer: panel.querySelector("[data-compare-cards]"),
      prevButton: panel.querySelector("[data-compare-prev]"),
      nextButton: panel.querySelector("[data-compare-next]"),
      valuesRows: panel.querySelectorAll("[data-compare-values]"),
      productsBlock: panel.querySelector("[data-compare-products]"),
      isSyncing: false,
      syncReleaseTimeoutId: null,
    };
  }

  var panelStates = {};

  forEachNode(tabPanels, function (panel) {
    var panelId = panel.getAttribute("data-tab-panel");
    panelStates[panelId] = getPanelState(panel);
  });

  function getCurrentTabId() {
    var activeTab = document.querySelector("[data-compare-tab].is-active");
    return activeTab ? activeTab.getAttribute("data-compare-tab") : null;
  }

  function hasAnyItems() {
    var hasItems = false;

    Object.keys(panelStates).forEach(function (key) {
      var state = panelStates[key];
      if (state.cardsContainer && state.cardsContainer.children.length > 0) {
        hasItems = true;
      }
    });

    return hasItems;
  }

  function syncState() {
    var hasItems = hasAnyItems();

    if (hasItems) {
      filledSection.removeAttribute("hidden");
      emptySection.setAttribute("hidden", "");
    } else {
      filledSection.setAttribute("hidden", "");
      emptySection.removeAttribute("hidden");
    }

    forEachNode(clearButtons, function (button) {
      if (hasItems) {
        button.removeAttribute("hidden");
      } else {
        button.setAttribute("hidden", "");
      }
    });
  }

  function closeModal() {
    var visibleClearBtn;

    if (!modal) return;

    modal.setAttribute("aria-hidden", "true");
    modal.classList.remove("is-open");
    modal.classList.add("is-animating");

    window.clearTimeout(modalCloseTimeoutId);
    modalCloseTimeoutId = window.setTimeout(function () {
      modal.setAttribute("hidden", "");
      modal.classList.remove("is-animating");
    }, MODAL_ANIMATION_DURATION);

    visibleClearBtn = Array.prototype.find.call(clearButtons, function (button) {
      return !button.hasAttribute("hidden");
    });

    if (visibleClearBtn) {
      visibleClearBtn.focus();
    }
  }

  function openModal() {
    if (!modal) return;

    window.clearTimeout(modalCloseTimeoutId);
    modal.removeAttribute("hidden");
    modal.classList.add("is-animating");
    modal.setAttribute("aria-hidden", "false");

    requestAnimationFrame(function () {
      modal.classList.add("is-open");
    });

    if (cancelButton) {
      cancelButton.focus();
    }
  }

  function getItemStep(container, selector) {
    var firstItem;
    var styles;
    var gap;

    if (!container) return 0;
    firstItem = container.querySelector(selector);
    if (!firstItem) return 0;

    styles = window.getComputedStyle(container);
    gap = Number.parseFloat(styles.columnGap || styles.gap || "0");

    return firstItem.getBoundingClientRect().width + gap;
  }

  function releaseSyncLock(state) {
    if (!state) return;

    window.clearTimeout(state.syncReleaseTimeoutId);
    state.syncReleaseTimeoutId = window.setTimeout(function () {
      state.isSyncing = false;
      state.syncReleaseTimeoutId = null;
    }, 0);
  }

  function syncScrollFromCards(state) {
    var cardStep;
    var scrolledItems;

    if (!state || state.isSyncing || !state.cardsContainer) return;

    state.isSyncing = true;
    cardStep = getItemStep(state.cardsContainer, ".im-compare-page__card");

    if (cardStep > 0) {
      scrolledItems = state.cardsContainer.scrollLeft / cardStep;

      forEachNode(state.valuesRows, function (row) {
        var valueStep = getItemStep(row, ".im-compare-page__value");
        if (valueStep > 0) {
          row.scrollLeft = scrolledItems * valueStep;
        }
      });
    }

    releaseSyncLock(state);
  }

  function syncScrollFromValues(state, sourceRow) {
    var sourceStep;
    var scrolledItems;
    var cardStep;

    if (!state || state.isSyncing || !state.cardsContainer || !sourceRow) return;

    state.isSyncing = true;
    sourceStep = getItemStep(sourceRow, ".im-compare-page__value");

    if (sourceStep > 0) {
      scrolledItems = sourceRow.scrollLeft / sourceStep;
      cardStep = getItemStep(state.cardsContainer, ".im-compare-page__card");

      if (cardStep > 0) {
        state.cardsContainer.scrollLeft = scrolledItems * cardStep;
      }

      forEachNode(state.valuesRows, function (row) {
        var valueStep;

        if (row === sourceRow) return;

        valueStep = getItemStep(row, ".im-compare-page__value");
        if (valueStep > 0) {
          row.scrollLeft = scrolledItems * valueStep;
        }
      });
    }

    releaseSyncLock(state);
  }

  function resetPanelScroll(state) {
    if (!state || !state.cardsContainer) return;

    state.cardsContainer.scrollLeft = 0;

    forEachNode(state.valuesRows, function (row) {
      row.scrollLeft = 0;
    });
  }

  function setActiveTab(tabId) {
    var activeState = panelStates[tabId];

    forEachNode(tabs, function (tab) {
      var isActive = tab.getAttribute("data-compare-tab") === tabId;
      tab.classList.toggle("is-active", isActive);
      tab.setAttribute("aria-selected", isActive ? "true" : "false");
    });

    forEachNode(tabPanels, function (panel) {
      var isActive = panel.getAttribute("data-tab-panel") === tabId;

      if (isActive) {
        panel.removeAttribute("hidden");
      } else {
        panel.setAttribute("hidden", "");
      }
    });

    resetPanelScroll(activeState);
  }

  function clearCompare() {
    Object.keys(panelStates).forEach(function (key) {
      var state = panelStates[key];

      if (state.cardsContainer) {
        state.cardsContainer.innerHTML = "";
      }

      forEachNode(state.valuesRows, function (row) {
        row.innerHTML = "";
      });
    });

    syncState();
    closeModal();
  }

  function removeColumnAtIndex(state, index) {
    if (!state || index < 0) return;

    forEachNode(state.valuesRows, function (row) {
      var value = row.children[index];
      if (value) {
        value.remove();
      }
    });
  }

  Object.keys(panelStates).forEach(function (key) {
    var state = panelStates[key];

    if (!state.cardsContainer) return;

    state.cardsContainer.addEventListener("click", function (event) {
      var removeButton = event.target.closest("[data-compare-remove]");
      var card;
      var cardIndex;

      if (!removeButton) return;

      card = removeButton.closest(".im-compare-page__card");
      if (!card) return;

      cardIndex = Array.prototype.indexOf.call(state.cardsContainer.children, card);
      removeColumnAtIndex(state, cardIndex);
      card.remove();
      syncState();
    });

    state.cardsContainer.addEventListener("scroll", function () {
      syncScrollFromCards(state);
    });

    forEachNode(state.valuesRows, function (row) {
      row.addEventListener("scroll", function () {
        syncScrollFromValues(state, row);
      });
    });

    if (state.prevButton && state.nextButton) {
      function scrollCardsBySlide(direction) {
        var step = getItemStep(state.cardsContainer, ".im-compare-page__card") || 200;
        var maxScrollLeft =
          state.cardsContainer.scrollWidth - state.cardsContainer.clientWidth;
        var currentIndex = Math.round(state.cardsContainer.scrollLeft / step);
        var maxIndex = Math.max(0, Math.round(maxScrollLeft / step));
        var targetIndex = Math.max(0, Math.min(currentIndex + direction, maxIndex));
        var targetLeft = Math.min(maxScrollLeft, targetIndex * step);

        state.cardsContainer.scrollTo({
          left: targetLeft,
          behavior: "smooth",
        });
      }

      state.prevButton.addEventListener("click", function () {
        scrollCardsBySlide(-1);
      });

      state.nextButton.addEventListener("click", function () {
        scrollCardsBySlide(1);
      });
    }

    if (state.productsBlock && typeof IntersectionObserver !== "undefined") {
      var observer = new IntersectionObserver(
        function (entries) {
          var entry = entries[0];
          state.productsBlock.classList.toggle("is-stuck", !entry.isIntersecting);
        },
        { threshold: 1, rootMargin: "-1px 0px 0px 0px" },
      );

      var sentinel = document.createElement("div");
      sentinel.style.height = "1px";
      sentinel.style.marginBottom = "-1px";
      state.productsBlock.parentNode.insertBefore(sentinel, state.productsBlock);
      observer.observe(sentinel);
    }
  });

  syncState();
  setActiveTab(getCurrentTabId() || tabPanels[0].getAttribute("data-tab-panel"));

  forEachNode(clearButtons, function (button) {
    button.addEventListener("click", openModal);
  });

  forEachNode(modalCloseElements, function (element) {
    element.addEventListener("click", closeModal);
  });

  if (cancelButton) {
    cancelButton.addEventListener("click", closeModal);
  }

  if (confirmButton) {
    confirmButton.addEventListener("click", clearCompare);
  }

  forEachNode(tabs, function (tab) {
    tab.addEventListener("click", function () {
      setActiveTab(tab.getAttribute("data-compare-tab"));
    });
  });

  document.addEventListener("keydown", function (event) {
    if (event.key === "Escape" && modal && !modal.hasAttribute("hidden")) {
      closeModal();
    }
  });

  if (modal) {
    modal.addEventListener("click", function (event) {
      if (event.target === modal) {
        closeModal();
      }
    });
  }
});
