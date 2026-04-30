const REVIEW_INITIAL_LIMIT = 4;
const reviewsState = new WeakMap();
const reviewMediaSliders = new WeakMap();
const productGallerySliders = new WeakMap();
const productMobileExtrasPlaceholders = new WeakMap();
let reviewMediaInitAttempts = 0;
let productGalleryInitAttempts = 0;

function shouldForceProductGallerySlider(gallery) {
  return gallery?.dataset.gallerySlider === "always";
}

function getProductGalleryThumbs(gallery) {
  if (!gallery) {
    return [];
  }

  return Array.from(gallery.querySelectorAll(".ready-product__thumb")).filter(
    (thumb) => thumb.dataset.fullSrc,
  );
}

function getActiveProductGalleryThumbIndex(gallery) {
  const thumbs = getProductGalleryThumbs(gallery);
  const activeIndex = thumbs.findIndex((thumb) =>
    thumb.classList.contains("ready-product__thumb--active"),
  );

  return activeIndex >= 0 ? activeIndex : 0;
}

function syncProductGalleryThumbs(gallery, nextIndex) {
  const thumbs = getProductGalleryThumbs(gallery);

  thumbs.forEach((thumb, thumbIndex) => {
    const isActive = thumbIndex === nextIndex;
    thumb.classList.toggle("ready-product__thumb--active", isActive);
    thumb.setAttribute("aria-pressed", String(isActive));
  });
}

function syncProductGalleryMainImage(gallery, nextIndex) {
  if (!gallery) {
    return;
  }

  const thumbs = getProductGalleryThumbs(gallery);
  const mainImage = gallery.querySelector(".ready-product__gallery-image");
  const activeThumb = thumbs[nextIndex];

  if (!mainImage || !activeThumb?.dataset.fullSrc) {
    return;
  }

  mainImage.src = activeThumb.dataset.fullSrc;
  mainImage.alt = activeThumb.dataset.fullAlt || mainImage.alt;
}

function destroyProductGallerySlider(gallery) {
  const slider = productGallerySliders.get(gallery);
  const main = gallery?.querySelector(".ready-product__gallery-main");

  if (slider) {
    slider.destroy();
    productGallerySliders.delete(gallery);
  }

  if (!main) {
    return;
  }

  main.classList.remove("keen-slider");
  Array.from(main.children).forEach((child) => {
    child.classList.remove("keen-slider__slide");
  });
}

function buildProductGallerySlides(gallery) {
  const main = gallery?.querySelector(".ready-product__gallery-main");
  const thumbs = getProductGalleryThumbs(gallery);

  if (!main || !thumbs.length) {
    return null;
  }

  main.replaceChildren();

  thumbs.forEach((thumb, index) => {
    const slide = document.createElement("div");
    slide.className = "ready-product__gallery-slide";
    slide.dataset.galleryIndex = String(index);

    const image = document.createElement("img");
    image.className = "ready-product__gallery-image";
    image.src = thumb.dataset.fullSrc;
    image.alt = thumb.dataset.fullAlt || "";
    image.loading = index === 0 ? "eager" : "lazy";

    slide.appendChild(image);
    main.appendChild(slide);
  });

  return main;
}

function restoreProductGalleryMainImage(gallery) {
  const main = gallery?.querySelector(".ready-product__gallery-main");
  const activeIndex = getActiveProductGalleryThumbIndex(gallery);
  const thumbs = getProductGalleryThumbs(gallery);
  const activeThumb = thumbs[activeIndex];

  if (!main || !activeThumb?.dataset.fullSrc) {
    return;
  }

  main.replaceChildren();

  const image = document.createElement("img");
  image.className = "ready-product__gallery-image";
  image.src = activeThumb.dataset.fullSrc;
  image.alt = activeThumb.dataset.fullAlt || "";

  main.appendChild(image);
}

function initProductGallerySliders(root = document) {
  root.querySelectorAll(".ready-product__gallery").forEach((gallery) => {
    if (!(gallery instanceof HTMLElement)) {
      return;
    }

    const isMobile = window.matchMedia("(max-width: 640px)").matches;
    const shouldUseSlider = isMobile || shouldForceProductGallerySlider(gallery);

    if (!shouldUseSlider) {
      destroyProductGallerySlider(gallery);
      restoreProductGalleryMainImage(gallery);
      return;
    }

    if (typeof KeenSlider === "undefined") {
      return;
    }

    const existingSlider = productGallerySliders.get(gallery);

    if (existingSlider) {
      existingSlider.update();
      return;
    }

    const main = buildProductGallerySlides(gallery);

    if (!main || main.offsetWidth === 0) {
      return;
    }

    const initial = getActiveProductGalleryThumbIndex(gallery);
    main.classList.add("keen-slider");
    Array.from(main.children).forEach((child) => {
      child.classList.add("keen-slider__slide");
    });

    const slider = new KeenSlider(main, {
      initial,
      rubberband: false,
      slides: {
        origin: shouldForceProductGallerySlider(gallery) ? "center" : "auto",
        perView: shouldForceProductGallerySlider(gallery) ? 1 : "auto",
        spacing: shouldForceProductGallerySlider(gallery) ? 0 : 12,
      },
      slideChanged(instance) {
        const nextIndex = instance.track.details.rel;
        syncProductGalleryThumbs(gallery, nextIndex);
      },
    });

    productGallerySliders.set(gallery, slider);
    syncProductGalleryThumbs(gallery, initial);
  });
}

function scheduleProductGalleryInit(root = document) {
  initProductGallerySliders(root);

  if (
    typeof KeenSlider !== "undefined" ||
    productGalleryInitAttempts >= 20 ||
    !root.querySelector(".ready-product__gallery")
  ) {
    return;
  }

  productGalleryInitAttempts += 1;
  window.setTimeout(() => {
    scheduleProductGalleryInit(root);
  }, 250);
}

function syncMobileExtrasPlacement(root = document) {
  const isMobile = window.matchMedia("(max-width: 900px)").matches;

  root.querySelectorAll(".ready-product__hero").forEach((hero) => {
    const extras = hero.querySelector("[data-product-mobile-extras]");
    const anchor = hero.querySelector("[data-product-mobile-extras-anchor]");
    const gallery = hero.querySelector(".ready-product__gallery");

    if (!(extras instanceof HTMLElement) || !(anchor instanceof HTMLElement)) {
      return;
    }

    if (isMobile) {
      if (!productMobileExtrasPlaceholders.has(extras)) {
        const placeholder = document.createComment("product-mobile-extras-placeholder");
        extras.parentNode?.insertBefore(placeholder, extras);
        productMobileExtrasPlaceholders.set(extras, placeholder);
      }

      anchor.insertAdjacentElement("afterend", extras);
      return;
    }

    const placeholder = productMobileExtrasPlaceholders.get(extras);

    if (placeholder?.parentNode) {
      placeholder.parentNode.insertBefore(extras, placeholder);
      placeholder.parentNode.removeChild(placeholder);
      productMobileExtrasPlaceholders.delete(extras);
      return;
    }

    if (gallery instanceof HTMLElement && extras.parentNode !== gallery) {
      gallery.appendChild(extras);
    }
  });
}

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
        ? "ready-product__rating-star"
        : "ready-product__rating-star ready-product__rating-star--muted";
    star.setAttribute("aria-hidden", "true");
    fragment.appendChild(star);
  }

  ratingNode.replaceChildren(fragment);
}

function initRatingStars(root = document) {
  root
    .querySelectorAll(
      ".ready-product__reviews-stars, .ready-product__review-stars, .ready-product__reviews-breakdown-stars",
    )
    .forEach(renderRatingStars);
}

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
  const halfCount = (text.match(/⯨|⭑|⭒/g) || []).length;
  const emptyCount = (text.match(/☆/g) || []).length;

  return filledCount > 0 || halfCount > 0 || emptyCount > 0
    ? filledCount + halfCount * 0.5
    : 0;
}

function renderRatingStars(ratingNode) {
  if (!ratingNode) {
    return;
  }

  const ratingValue = Math.max(0, Math.min(5, resolveRatingValue(ratingNode)));
  const fullStars = Math.floor(ratingValue);
  const hasHalfStar = ratingValue % 1 > 0 && fullStars < 5;
  const emptyStars = Math.max(0, 5 - fullStars - (hasHalfStar ? 1 : 0));
  const fragment = document.createDocumentFragment();

  for (let index = 0; index < fullStars; index += 1) {
    const star = document.createElement("span");
    star.className = "ready-product__rating-star ready-product__rating-star--full";
    star.setAttribute("aria-hidden", "true");
    fragment.appendChild(star);
  }

  if (hasHalfStar) {
    const star = document.createElement("span");
    star.className = "ready-product__rating-star ready-product__rating-star--half";
    star.setAttribute("aria-hidden", "true");
    fragment.appendChild(star);
  }

  for (let index = 0; index < emptyStars; index += 1) {
    const star = document.createElement("span");
    star.className = "ready-product__rating-star ready-product__rating-star--muted";
    star.setAttribute("aria-hidden", "true");
    fragment.appendChild(star);
  }

  ratingNode.replaceChildren(fragment);
}

function initCtaCustomSelects(root = document) {
  const wraps = root.querySelectorAll(".im-cta__select-wrap");
  if (!wraps.length) {
    return;
  }

  const openWraps = new Set();

  const closeWrap = (wrap) => {
    if (!wrap) {
      return;
    }

    wrap.classList.remove("is-open");

    const button = wrap.querySelector(".im-cta__select-btn");
    if (button) {
      button.setAttribute("aria-expanded", "false");
    }

    openWraps.delete(wrap);
  };

  const closeAll = () => {
    openWraps.forEach((wrap) => closeWrap(wrap));
  };

  const openWrap = (wrap) => {
    if (!wrap) {
      return;
    }

    closeAll();
    wrap.classList.add("is-open");

    const button = wrap.querySelector(".im-cta__select-btn");
    const menu = wrap.querySelector(".im-cta__select-menu");

    if (button) {
      button.setAttribute("aria-expanded", "true");
    }

    openWraps.add(wrap);

    if (menu) {
      const activeOption = menu.querySelector(".im-cta__select-option.is-active");
      if (activeOption instanceof HTMLElement) {
        activeOption.focus();
      }
    }
  };

  const ensureButtonAndMenu = (wrap, select) => {
    if (wrap.querySelector(".im-cta__select-btn")) {
      return;
    }

    const button = document.createElement("button");
    button.type = "button";
    button.className = "im-cta__select-btn";
    button.setAttribute("aria-haspopup", "listbox");
    button.setAttribute("aria-expanded", "false");

    const menu = document.createElement("div");
    menu.className = "im-cta__select-menu";
    menu.setAttribute("role", "listbox");

    const options = Array.from(select.options);

    const syncButtonText = () => {
      const selectedOption = select.selectedOptions[0] || select.options[0];
      button.textContent = selectedOption ? selectedOption.textContent : "";
    };

    const rebuildMenu = () => {
      menu.innerHTML = "";

      options.forEach((option, index) => {
        const optionButton = document.createElement("button");
        optionButton.type = "button";
        optionButton.className = "im-cta__select-option";
        optionButton.setAttribute("role", "option");
        optionButton.textContent = option.textContent;

        const isActive = index === select.selectedIndex;
        optionButton.classList.toggle("is-active", isActive);
        optionButton.setAttribute("aria-selected", isActive ? "true" : "false");

        optionButton.addEventListener("click", (event) => {
          event.preventDefault();
          select.selectedIndex = index;
          select.dispatchEvent(new Event("change", { bubbles: true }));
          syncButtonText();
          rebuildMenu();
          closeWrap(wrap);
          button.focus();
        });

        optionButton.addEventListener("keydown", (event) => {
          const items = Array.from(menu.querySelectorAll(".im-cta__select-option"));
          const currentIndex = items.indexOf(optionButton);

          if (event.key === "Escape") {
            event.preventDefault();
            closeWrap(wrap);
            button.focus();
            return;
          }

          if (event.key === "ArrowDown") {
            event.preventDefault();
            const next = items[Math.min(items.length - 1, currentIndex + 1)];
            if (next instanceof HTMLElement) {
              next.focus();
            }
            return;
          }

          if (event.key === "ArrowUp") {
            event.preventDefault();
            const prev = items[Math.max(0, currentIndex - 1)];
            if (prev instanceof HTMLElement) {
              prev.focus();
            }
            return;
          }

          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            optionButton.click();
          }
        });

        menu.appendChild(optionButton);
      });
    };

    syncButtonText();
    rebuildMenu();

    button.addEventListener("click", (event) => {
      event.preventDefault();
      event.stopPropagation();

      if (wrap.classList.contains("is-open")) {
        closeWrap(wrap);
      } else {
        openWrap(wrap);
      }
    });

    button.addEventListener("keydown", (event) => {
      if (event.key === "ArrowDown" || event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        openWrap(wrap);
      }

      if (event.key === "Escape") {
        event.preventDefault();
        closeWrap(wrap);
      }
    });

    wrap.appendChild(button);
    wrap.appendChild(menu);

    select.addEventListener("change", () => {
      syncButtonText();
      rebuildMenu();
    });
  };

  wraps.forEach((wrap) => {
    const select = wrap.querySelector("select.im-cta__select");
    if (!(select instanceof HTMLSelectElement)) {
      return;
    }

    ensureButtonAndMenu(wrap, select);
  });

  document.addEventListener("click", (event) => {
    const target = event.target;
    if (!(target instanceof HTMLElement)) {
      closeAll();
      return;
    }

    if (!target.closest(".im-cta__select-wrap")) {
      closeAll();
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      closeAll();
    }
  });
}

function initReviewMediaSliders(root = document) {
  const mediaNodes = root.querySelectorAll(".ready-product__review-media");

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

    let mediaShell = mediaNode.parentElement;
    if (!mediaShell?.classList.contains("ready-product__review-media-shell")) {
      mediaShell = document.createElement("div");
      mediaShell.className = "ready-product__review-media-shell";
      mediaNode.parentNode?.insertBefore(mediaShell, mediaNode);
      mediaShell.appendChild(mediaNode);
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

    const nextButton = document.createElement("button");
    nextButton.type = "button";
    nextButton.className = "ready-product__review-media-next";
    nextButton.setAttribute("aria-label", "Следующий слайд отзыва");
    nextButton.innerHTML =
      '<svg viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path d="M6.46967 3.21967C6.76256 2.92678 7.23744 2.92678 7.53033 3.21967L12.7803 8.46967C13.0732 8.76256 13.0732 9.23744 12.7803 9.53033L7.53033 14.7803C7.23744 15.0732 6.76256 15.0732 6.46967 14.7803C6.17678 14.4874 6.17678 14.0126 6.46967 13.7197L11.1893 9L6.46967 4.28033C6.17678 3.98744 6.17678 3.51256 6.46967 3.21967Z" fill="currentColor"/></svg>';
    nextButton.addEventListener("click", () => {
      const currentIndex = slider.track.details?.rel ?? 0;
      const nextIndex = currentIndex >= slides.length - 1 ? 0 : currentIndex + 1;
      slider.moveToIdx(nextIndex);
    });
    mediaShell.appendChild(nextButton);

    reviewMediaSliders.set(mediaNode, slider);
  });
}

function scheduleReviewMediaInit(root = document) {
  initReviewMediaSliders(root);

  if (
    typeof KeenSlider !== "undefined" ||
    reviewMediaInitAttempts >= 20 ||
    !root.querySelector(".ready-product__review-media")
  ) {
    return;
  }

  reviewMediaInitAttempts += 1;
  window.setTimeout(() => {
    scheduleReviewMediaInit(root);
  }, 250);
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

function syncProjectDescription(projectDescription) {
  if (!(projectDescription instanceof HTMLElement)) {
    return;
  }

  const toggle = projectDescription.querySelector("[data-project-description-toggle]");
  const isExpanded = projectDescription.classList.contains("is-expanded");
  const collapsedLabel = toggle?.dataset.collapsedLabel || "Читать полностью";
  const expandedLabel = toggle?.dataset.expandedLabel || "Свернуть";

  if (toggle instanceof HTMLButtonElement) {
    toggle.textContent = isExpanded ? expandedLabel : collapsedLabel;
    toggle.setAttribute("aria-expanded", String(isExpanded));
  }
}

function initProjectDescriptions(root = document) {
  root
    .querySelectorAll("[data-project-description]")
    .forEach((projectDescription) => {
      syncProjectDescription(projectDescription);
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

function getProductStickyOffset() {
  const stickyHeader = document.querySelector("[data-product-sticky-header]");

  if (!(stickyHeader instanceof HTMLElement)) {
    return 24;
  }

  return stickyHeader.classList.contains("is-visible")
    ? stickyHeader.offsetHeight + 24
    : 24;
}

function setActiveDetailsTabByHref(href) {
  if (!href || !href.startsWith("#")) {
    return;
  }

  document.querySelectorAll(".ready-product__details-tab").forEach((tab) => {
    const isActive = tab.getAttribute("href") === href;
    tab.classList.toggle("ready-product__details-tab--active", isActive);
    tab.setAttribute("aria-current", isActive ? "true" : "false");
  });
}

function scrollToProductSection(targetSection) {
  if (!(targetSection instanceof HTMLElement)) {
    return;
  }

  const top =
    window.scrollY +
    targetSection.getBoundingClientRect().top -
    getProductStickyOffset();

  window.scrollTo({
    top: Math.max(0, top),
    behavior: "smooth",
  });
}

function initProductStickyHeader() {
  const stickyHeader = document.querySelector("[data-product-sticky-header]");
  const heroSection = document.querySelector(".ready-product__hero");
  const trackedSections = Array.from(
    document.querySelectorAll(
      "#product-reviews",
    ),
  );

  if (!(stickyHeader instanceof HTMLElement) || !(heroSection instanceof HTMLElement)) {
    return;
  }

  const syncStickyVisibility = () => {
    const heroBottom = heroSection.getBoundingClientRect().bottom;
    const shouldShow = heroBottom <= 0;

    stickyHeader.classList.toggle("is-visible", shouldShow);
    stickyHeader.setAttribute("aria-hidden", shouldShow ? "false" : "true");
  };

  const syncActiveSection = () => {
    const offset = getProductStickyOffset();
    let activeSection = trackedSections[0];

    trackedSections.forEach((section) => {
      if (section.getBoundingClientRect().top - offset <= 24) {
        activeSection = section;
      }
    });

    if (activeSection?.id) {
      setActiveDetailsTabByHref(`#${activeSection.id}`);
    }
  };

  const syncStickyState = () => {
    syncStickyVisibility();
    syncActiveSection();
  };

  syncStickyState();
  window.addEventListener("scroll", syncStickyState, { passive: true });
  window.addEventListener("resize", syncStickyState);
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

  const projectDescriptionToggle = event.target.closest(
    "[data-project-description-toggle]",
  );

  if (projectDescriptionToggle) {
    const projectDescription = projectDescriptionToggle.closest(
      "[data-project-description]",
    );

    if (projectDescription instanceof HTMLElement) {
      const shouldExpand = !projectDescription.classList.contains("is-expanded");
      projectDescription.classList.toggle("is-expanded", shouldExpand);
      syncProjectDescription(projectDescription);
    }

    return;
  }

  const descriptionToggle = event.target.closest("[data-ready-description-toggle]");

  if (descriptionToggle) {
    const description = descriptionToggle.closest("[data-ready-description]");
    const label = descriptionToggle.querySelector(
      ".ready-product__description-toggle-text",
    );

    if (description) {
      const shouldExpand = !description.classList.contains("is-expanded");

      description.classList.toggle("is-expanded", shouldExpand);
      descriptionToggle.setAttribute("aria-expanded", String(shouldExpand));

      if (label) {
        label.textContent = shouldExpand
          ? "Скрыть описание"
          : "Читать описание полностью";
      }
    }

    return;
  }

  const detailsTab = event.target.closest(".ready-product__details-tab");

  if (detailsTab) {
    const href = detailsTab.getAttribute("href");

    if (href && href.startsWith("#")) {
      const targetSection = document.getElementById(href.slice(1));

      if (targetSection) {
        event.preventDefault();
        scrollToProductSection(targetSection);
        setActiveDetailsTabByHref(href);
      }
    }

    return;
  }

  const thumbButton = event.target.closest(".ready-product__thumb");

  if (thumbButton) {
    const gallery = thumbButton.closest(".ready-product__gallery");
    const thumbs = gallery ? getProductGalleryThumbs(gallery) : [];
    const nextIndex = thumbs.indexOf(thumbButton);
    const productGallerySlider = gallery ? productGallerySliders.get(gallery) : null;

    if (gallery && nextIndex >= 0) {
      syncProductGalleryThumbs(gallery, nextIndex);

      if (productGallerySlider) {
        productGallerySlider.moveToIdx(nextIndex);
      } else {
        syncProductGalleryMainImage(gallery, nextIndex);
      }
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

  const replaceButton = event.target.closest("[data-set-preview-replace]");

  if (replaceButton) {
    const isRemoved = replaceButton.classList.toggle("is-removed");
    replaceButton.setAttribute("aria-pressed", String(isRemoved));

    return;
  }

  const button = event.target.closest(".ready-product__counter-btn");

  if (!button) {
    return;
  }

  const counter = button.closest(".ready-product__counter");
  const input = counter?.querySelector(".ready-product__counter-input");

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

initProjectDescriptions();
initReviewSelects();
initCtaCustomSelects();
initRatingStars();
scheduleReviewMediaInit();
scheduleProductGalleryInit();
syncMobileExtrasPlacement();
initProductStickyHeader();

window.addEventListener("resize", () => {
  initProductGallerySliders();
  syncMobileExtrasPlacement();
});
