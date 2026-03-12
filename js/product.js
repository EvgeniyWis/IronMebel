const REVIEW_INITIAL_LIMIT = 4;
const reviewsState = new WeakMap();
const reviewMediaSliders = new WeakMap();
let reviewMediaInitAttempts = 0;

function resolveRatingValue(ratingNode) {
  if (!ratingNode) {
    return 0;
  }

  const explicitValue = Number.parseFloat(ratingNode.dataset.ratingValue || "");

  if (Number.isFinite(explicitValue)) {
    return explicitValue;
  }

  const reviewCard = ratingNode.closest("[data-review-card]");
  const cardValue = Number.parseFloat(reviewCard?.dataset.reviewRating || "");

  if (Number.isFinite(cardValue)) {
    return cardValue;
  }

  const ariaMatch = ratingNode
    .getAttribute("aria-label")
    ?.match(/(\d+(?:[.,]\d+)?)/);

  if (ariaMatch) {
    return Number.parseFloat(ariaMatch[1].replace(",", "."));
  }

  const text = ratingNode.textContent || "";
  const filledCount = (text.match(/★/g) || []).length;
  const emptyCount = (text.match(/☆/g) || []).length;

  return filledCount > 0 || emptyCount > 0 ? filledCount : 0;
}

function renderRatingStars(ratingNode) {
  if (!ratingNode) {
    return;
  }

  const ratingValue = Math.max(0, Math.min(5, Math.round(resolveRatingValue(ratingNode))));
  const fragment = document.createDocumentFragment();

  for (let index = 0; index < 5; index += 1) {
    const star = document.createElement("span");
    star.className =
      index < ratingValue
        ? "im-product-page__rating-star"
        : "im-product-page__rating-star im-product-page__rating-star--muted";
    star.setAttribute("aria-hidden", "true");
    fragment.appendChild(star);
  }

  ratingNode.replaceChildren(fragment);
}

function initRatingStars(root = document) {
  root
    .querySelectorAll(
      ".im-product-page__reviews-stars, .im-product-page__review-stars, .im-product-page__reviews-breakdown-stars",
    )
    .forEach(renderRatingStars);
}

function initReviewMediaSliders(root = document) {
  const mediaNodes = root.querySelectorAll(".im-product-page__review-media");

  mediaNodes.forEach((mediaNode) => {
    if (reviewMediaSliders.has(mediaNode)) {
      return;
    }

    const slides = Array.from(mediaNode.children);

    if (slides.length < 2 || mediaNode.offsetWidth === 0) {
      return;
    }

    if (typeof KeenSlider === "undefined") {
      return;
    }

    mediaNode.classList.add("keen-slider");
    slides.forEach((slide) => slide.classList.add("keen-slider__slide"));

    const slider = new KeenSlider(mediaNode, {
      mode: "free-snap",
      rubberband: false,
      slides: {
        origin: "auto",
        perView: "auto",
        spacing: 12,
      },
    });

    reviewMediaSliders.set(mediaNode, slider);
  });
}

function scheduleReviewMediaInit(root = document) {
  initReviewMediaSliders(root);

  if (
    typeof KeenSlider !== "undefined" ||
    reviewMediaInitAttempts >= 20 ||
    !root.querySelector(".im-product-page__review-media")
  ) {
    return;
  }

  reviewMediaInitAttempts += 1;
  window.setTimeout(() => {
    scheduleReviewMediaInit(root);
  }, 250);
}

function syncCasesGallery(gallery, index) {
  if (!gallery) {
    return;
  }

  const thumbs = Array.from(gallery.querySelectorAll("[data-case-thumb]"));
  const card = gallery.querySelector("[data-case-card]");
  const mainImage = gallery.querySelector("[data-case-main-image]");

  if (!thumbs.length || !card || !mainImage) {
    return;
  }

  const nextIndex = ((index % thumbs.length) + thumbs.length) % thumbs.length;
  const activeThumb = thumbs[nextIndex];
  const nextSrc = activeThumb.dataset.fullSrc || mainImage.src;
  const nextAlt = activeThumb.dataset.fullAlt || mainImage.alt;

  thumbs.forEach((thumb, thumbIndex) => {
    const isActive = thumbIndex === nextIndex;

    thumb.classList.toggle("im-product-page__case-thumb--active", isActive);
    thumb.setAttribute("aria-pressed", String(isActive));
  });

  mainImage.src = nextSrc;
  mainImage.alt = nextAlt;
  gallery.dataset.caseIndex = String(nextIndex);
}

function initCasesGalleries() {
  document.querySelectorAll("[data-cases-gallery]").forEach((gallery) => {
    syncCasesGallery(gallery, Number.parseInt(gallery.dataset.caseIndex || "0", 10));
  });
}

function getReviewsState(reviewsSection) {
  if (!reviewsState.has(reviewsSection)) {
    reviewsState.set(reviewsSection, {
      filter: "all",
      visibleCount: REVIEW_INITIAL_LIMIT,
    });
  }

  return reviewsState.get(reviewsSection);
}

function closeReviewSelect(selectNode) {
  if (!selectNode) {
    return;
  }

  selectNode.classList.remove("is-open");
  selectNode
    .querySelector("[data-review-select-trigger]")
    ?.setAttribute("aria-expanded", "false");
}

function syncReviewSelect(selectNode) {
  if (!selectNode) {
    return;
  }

  const nativeSelect = selectNode.querySelector("[data-review-filter]");
  const textNode = selectNode.querySelector("[data-review-select-text]");
  const options = Array.from(
    selectNode.querySelectorAll("[data-review-select-option]"),
  );
  const currentOption =
    options.find((option) => option.dataset.value === nativeSelect?.value) ||
    options[0];

  if (textNode && currentOption) {
    textNode.textContent = currentOption.textContent?.trim() || "";
  }

  options.forEach((option) => {
    const isSelected = option === currentOption;
    option.classList.toggle("is-selected", isSelected);
    option.setAttribute("aria-selected", String(isSelected));
  });
}

function initReviewSelects(root = document) {
  root.querySelectorAll("[data-review-select]").forEach((selectNode) => {
    syncReviewSelect(selectNode);
  });
}

function syncReviews(reviewsSection) {
  if (!reviewsSection) {
    return;
  }

  const state = getReviewsState(reviewsSection);
  const cards = Array.from(reviewsSection.querySelectorAll("[data-review-card]"));
  const moreButton = reviewsSection.querySelector("[data-reviews-more]");
  let visibleIndex = 0;
  let filteredTotal = 0;

  cards.forEach((card) => {
    const rating = card.dataset.reviewRating || "";
    const matches = state.filter === "all" || rating === state.filter;

    if (!matches) {
      card.hidden = true;
      return;
    }

    filteredTotal += 1;
    const shouldShow = visibleIndex < state.visibleCount;
    card.hidden = !shouldShow;
    visibleIndex += 1;
  });

  if (moreButton) {
    moreButton.hidden = filteredTotal <= state.visibleCount;
  }

  scheduleReviewMediaInit(reviewsSection);
}

document.addEventListener("change", (event) => {
  const filter = event.target.closest("[data-review-filter]");

  if (!filter) {
    return;
  }

  const reviewsSection = filter.closest("[data-reviews]");

  if (!reviewsSection) {
    return;
  }

  const state = getReviewsState(reviewsSection);
  state.filter = filter.value || "all";
  state.visibleCount = REVIEW_INITIAL_LIMIT;
  syncReviewSelect(filter.closest("[data-review-select]"));
  syncReviews(reviewsSection);
});

document.addEventListener("click", (event) => {
  const selectOption = event.target.closest("[data-review-select-option]");

  if (selectOption) {
    const selectNode = selectOption.closest("[data-review-select]");
    const nativeSelect = selectNode?.querySelector("[data-review-filter]");
    const nextValue = selectOption.dataset.value || "all";

    if (nativeSelect && nativeSelect.value !== nextValue) {
      nativeSelect.value = nextValue;
      nativeSelect.dispatchEvent(new Event("change", { bubbles: true }));
    } else {
      syncReviewSelect(selectNode);
    }

    closeReviewSelect(selectNode);
    return;
  }

  const selectTrigger = event.target.closest("[data-review-select-trigger]");

  if (selectTrigger) {
    const selectNode = selectTrigger.closest("[data-review-select]");
    const isOpen = selectNode?.classList.contains("is-open");

    document.querySelectorAll("[data-review-select].is-open").forEach((node) => {
      if (node !== selectNode) {
        closeReviewSelect(node);
      }
    });

    if (selectNode) {
      if (isOpen) {
        closeReviewSelect(selectNode);
      } else {
        selectNode.classList.add("is-open");
        selectTrigger.setAttribute("aria-expanded", "true");
        syncReviewSelect(selectNode);
      }
    }

    return;
  }

  if (!event.target.closest("[data-review-select]")) {
    document.querySelectorAll("[data-review-select].is-open").forEach(closeReviewSelect);
  }

  const detailsTab = event.target.closest(".im-product-page__details-tab");

  if (detailsTab) {
    const detailsSection = detailsTab.closest(".im-product-page__details");
    const target = detailsTab.dataset.detailsTarget;

    if (detailsSection && target) {
      detailsSection
        .querySelectorAll(".im-product-page__details-tab")
        .forEach((tab) => {
          const isActive = tab === detailsTab;

          tab.classList.toggle("im-product-page__details-tab--active", isActive);
          tab.setAttribute("aria-selected", String(isActive));
        });

      detailsSection
        .querySelectorAll(".im-product-page__details-pane")
        .forEach((pane) => {
          const isActive = pane.dataset.detailsPane === target;

          pane.classList.toggle("im-product-page__details-pane--active", isActive);
          pane.hidden = !isActive;
        });
    }

    return;
  }

  const detailsMoreButton = event.target.closest("[data-details-more]");

  if (detailsMoreButton) {
    const pane = detailsMoreButton.closest(".im-product-page__details-pane");
    const collapsibleNote = pane?.querySelector("[data-details-collapse]");
    const hiddenContent = pane?.querySelector(".im-product-page__details-text-more");

    if (collapsibleNote) {
      const shouldExpand = !collapsibleNote.classList.contains("is-expanded");

      collapsibleNote.classList.toggle("is-expanded", shouldExpand);
      detailsMoreButton.textContent = shouldExpand ? "Скрыть" : "Читать полностью";
      detailsMoreButton.setAttribute("aria-expanded", String(shouldExpand));
      return;
    }

    if (hiddenContent) {
      const shouldExpand = hiddenContent.hasAttribute("hidden");

      hiddenContent.toggleAttribute("hidden", !shouldExpand);
      detailsMoreButton.textContent = shouldExpand ? "Скрыть" : "Читать полностью";
      detailsMoreButton.setAttribute("aria-expanded", String(shouldExpand));
    }

    return;
  }

  const setNavButton = event.target.closest("[data-set-prev], [data-set-next]");

  if (setNavButton) {
    const pane = setNavButton.closest(".im-product-page__details-pane");
    const slider = pane?.querySelector("[data-set-slider]");
    const firstCard = slider?.querySelector(".im-product-page__set-card");

    if (slider && firstCard) {
      const cardGap = Number.parseFloat(getComputedStyle(slider).columnGap || "0");
      const step = firstCard.getBoundingClientRect().width + cardGap;
      const direction = setNavButton.hasAttribute("data-set-next") ? 1 : -1;

      slider.scrollBy({
        left: step * direction,
        behavior: "smooth",
      });
    }

    return;
  }

  const goodsNavButton = event.target.closest("[data-goods-prev], [data-goods-next]");

  if (goodsNavButton) {
    const section = goodsNavButton.closest(".im-product-page__goods-carousel");
    const slider = section?.querySelector("[data-goods-carousel]");
    const firstCard = slider?.querySelector(".im-goods__card");

    if (slider && firstCard) {
      const sliderStyles = getComputedStyle(slider);
      const cardGap = Number.parseFloat(sliderStyles.columnGap || sliderStyles.gap || "0");
      const step = firstCard.getBoundingClientRect().width + cardGap;
      const direction = goodsNavButton.hasAttribute("data-goods-next") ? 1 : -1;

      slider.scrollBy({
        left: step * direction,
        behavior: "smooth",
      });
    }

    return;
  }

  const thumbButton = event.target.closest(".im-product-page__thumb");

  if (thumbButton) {
    const gallery = thumbButton.closest(".im-product-page__gallery");
    const mainImage = gallery?.querySelector(".im-product-page__gallery-image");
    const nextSrc = thumbButton.dataset.fullSrc;

    if (gallery && mainImage && nextSrc) {
      gallery.querySelectorAll(".im-product-page__thumb").forEach((thumb) => {
        const isActive = thumb === thumbButton;

        thumb.classList.toggle("im-product-page__thumb--active", isActive);
        thumb.setAttribute("aria-pressed", String(isActive));
      });

      mainImage.src = nextSrc;
      mainImage.alt = thumbButton.dataset.fullAlt || mainImage.alt;
    }

    return;
  }

  const caseThumbButton = event.target.closest("[data-case-thumb]");

  if (caseThumbButton) {
    const gallery = caseThumbButton.closest("[data-cases-gallery]");
    const thumbs = gallery
      ? Array.from(gallery.querySelectorAll("[data-case-thumb]"))
      : [];
    const nextIndex = thumbs.indexOf(caseThumbButton);

    if (gallery && nextIndex >= 0) {
      syncCasesGallery(gallery, nextIndex);
    }

    return;
  }

  const caseNavButton = event.target.closest("[data-case-prev], [data-case-next]");

  if (caseNavButton) {
    const gallery = caseNavButton.closest("[data-cases-gallery]");

    if (gallery) {
      const currentIndex = Number.parseInt(gallery.dataset.caseIndex || "0", 10);
      const direction = caseNavButton.hasAttribute("data-case-next") ? 1 : -1;
      syncCasesGallery(gallery, currentIndex + direction);
    }

    return;
  }

  const caseMoreButton = event.target.closest(".im-product-page__case-more");

  if (caseMoreButton) {
    const caseCard = caseMoreButton.closest("[data-case-card]");
    const caseExtra = caseCard?.querySelector("[data-case-extra-out]");

    if (caseExtra) {
      const shouldExpand = !caseExtra.classList.contains("is-expanded");

      caseExtra.classList.toggle("is-expanded", shouldExpand);
      caseMoreButton.textContent = shouldExpand ? "Скрыть" : "Читать полностью";
      caseMoreButton.setAttribute("aria-expanded", String(shouldExpand));
    }

    return;
  }

  const reviewsMoreButton = event.target.closest("[data-reviews-more]");

  if (reviewsMoreButton) {
    const reviewsSection = reviewsMoreButton.closest("[data-reviews]");

    if (reviewsSection) {
      const state = getReviewsState(reviewsSection);

      state.visibleCount += REVIEW_INITIAL_LIMIT;
      syncReviews(reviewsSection);
    }

    return;
  }

  const button = event.target.closest(".im-product-page__counter-btn");

  if (!button) {
    return;
  }

  const counter = button.closest(".im-product-page__counter");
  const input = counter?.querySelector(".im-product-page__counter-input");

  if (!input) {
    return;
  }

  const min = Number.parseInt(input.min || "0", 10);
  const step = Number.parseInt(input.step || "1", 10);
  const current = Number.parseInt(input.value || `${min}`, 10);
  const nextValue =
    button.dataset.action === "increment" ? current + step : current - step;

  input.value = `${Math.max(min, nextValue)}`;
  input.dispatchEvent(new Event("change", { bubbles: true }));
});

document.addEventListener("keydown", (event) => {
  if (event.key !== "Escape") {
    return;
  }

  document.querySelectorAll("[data-review-select].is-open").forEach(closeReviewSelect);
});

document.querySelectorAll("[data-reviews]").forEach((reviewsSection) => {
  syncReviews(reviewsSection);
});

initReviewSelects();
initRatingStars();
scheduleReviewMediaInit();
initCasesGalleries();
