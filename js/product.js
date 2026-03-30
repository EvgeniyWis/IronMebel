const REVIEW_INITIAL_LIMIT = 4;
const reviewsState = new WeakMap();
const reviewMediaSliders = new WeakMap();
const productGoodsSliders = new WeakMap();
const goodsCardSliders = new WeakMap();
const productGallerySliders = new WeakMap();
const productMobileExtrasPlaceholders = new WeakMap();
let reviewMediaInitAttempts = 0;
let productGoodsInitAttempts = 0;
let goodsCardInitAttempts = 0;
let productGalleryInitAttempts = 0;

function getProductGalleryThumbs(gallery) {
  if (!gallery) {
    return [];
  }

  return Array.from(gallery.querySelectorAll(".im-product-page__thumb")).filter(
    (thumb) => thumb.dataset.fullSrc,
  );
}

function getActiveProductGalleryThumbIndex(gallery) {
  const thumbs = getProductGalleryThumbs(gallery);
  const activeIndex = thumbs.findIndex((thumb) =>
    thumb.classList.contains("im-product-page__thumb--active"),
  );

  return activeIndex >= 0 ? activeIndex : 0;
}

function syncProductGalleryThumbs(gallery, nextIndex) {
  const thumbs = getProductGalleryThumbs(gallery);

  thumbs.forEach((thumb, thumbIndex) => {
    const isActive = thumbIndex === nextIndex;
    thumb.classList.toggle("im-product-page__thumb--active", isActive);
    thumb.setAttribute("aria-pressed", String(isActive));
  });
}

function syncProductGalleryMainImage(gallery, nextIndex) {
  if (!gallery) {
    return;
  }

  const thumbs = getProductGalleryThumbs(gallery);
  const mainImage = gallery.querySelector(".im-product-page__gallery-image");
  const activeThumb = thumbs[nextIndex];

  if (!mainImage || !activeThumb?.dataset.fullSrc) {
    return;
  }

  mainImage.src = activeThumb.dataset.fullSrc;
  mainImage.alt = activeThumb.dataset.fullAlt || mainImage.alt;
}

function destroyProductGallerySlider(gallery) {
  const slider = productGallerySliders.get(gallery);
  const main = gallery?.querySelector(".im-product-page__gallery-main");

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
  const main = gallery?.querySelector(".im-product-page__gallery-main");
  const thumbs = getProductGalleryThumbs(gallery);

  if (!main || !thumbs.length) {
    return null;
  }

  main.replaceChildren();

  thumbs.forEach((thumb, index) => {
    const slide = document.createElement("div");
    slide.className = "im-product-page__gallery-slide";
    slide.dataset.galleryIndex = String(index);

    const image = document.createElement("img");
    image.className = "im-product-page__gallery-image";
    image.src = thumb.dataset.fullSrc;
    image.alt = thumb.dataset.fullAlt || "";
    image.loading = index === 0 ? "eager" : "lazy";

    slide.appendChild(image);
    main.appendChild(slide);
  });

  return main;
}

function restoreProductGalleryMainImage(gallery) {
  const main = gallery?.querySelector(".im-product-page__gallery-main");
  const activeIndex = getActiveProductGalleryThumbIndex(gallery);
  const thumbs = getProductGalleryThumbs(gallery);
  const activeThumb = thumbs[activeIndex];

  if (!main || !activeThumb?.dataset.fullSrc) {
    return;
  }

  main.replaceChildren();

  const image = document.createElement("img");
  image.className = "im-product-page__gallery-image";
  image.src = activeThumb.dataset.fullSrc;
  image.alt = activeThumb.dataset.fullAlt || "";

  main.appendChild(image);
}

function initProductGallerySliders(root = document) {
  root.querySelectorAll(".im-product-page__gallery").forEach((gallery) => {
    if (!(gallery instanceof HTMLElement)) {
      return;
    }

    const isMobile = window.matchMedia("(max-width: 640px)").matches;

    if (!isMobile) {
      destroyProductGallerySlider(gallery);
      restoreProductGalleryMainImage(gallery);
      return;
    }

    if (productGallerySliders.has(gallery) || typeof KeenSlider === "undefined") {
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
        origin: "auto",
        perView: "auto",
        spacing: 12,
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
    !root.querySelector(".im-product-page__gallery")
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

  root.querySelectorAll(".im-product-page__hero").forEach((hero) => {
    const extras = hero.querySelector("[data-product-mobile-extras]");
    const anchor = hero.querySelector("[data-product-mobile-extras-anchor]");
    const gallery = hero.querySelector(".im-product-page__gallery");

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
    star.className = "im-product-page__rating-star im-product-page__rating-star--full";
    star.setAttribute("aria-hidden", "true");
    fragment.appendChild(star);
  }

  if (hasHalfStar) {
    const star = document.createElement("span");
    star.className = "im-product-page__rating-star im-product-page__rating-star--half";
    star.setAttribute("aria-hidden", "true");
    fragment.appendChild(star);
  }

  for (let index = 0; index < emptyStars; index += 1) {
    const star = document.createElement("span");
    star.className = "im-product-page__rating-star im-product-page__rating-star--muted";
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

function initGoodsCardSliders(root = document) {
  root.querySelectorAll("[data-goods-slider]").forEach((container) => {
    if (goodsCardSliders.has(container)) {
      return;
    }

    const sliderRoot = container.querySelector(".keen-slider");

    if (!sliderRoot || sliderRoot.offsetWidth === 0 || typeof KeenSlider === "undefined") {
      return;
    }

    const pagination = container.querySelector(".im-goods__pagination");
    let dots = [];

    const slider = new KeenSlider(sliderRoot, {
      slides: {
        perView: 1,
        spacing: 0,
      },
      loop: true,
      drag: true,
      rubberband: false,
      created(instance) {
        const slideCount = instance.slides.length;

        if (!pagination || slideCount <= 1) {
          return;
        }

        pagination.replaceChildren();
        dots = [];

        for (let index = 0; index < slideCount; index += 1) {
          const dot = document.createElement("button");
          dot.type = "button";
          dot.className = "im-goods__dot";
          dot.classList.toggle("is-active", index === 0);
          dot.addEventListener("click", () => {
            instance.moveToIdx(index);
          });
          pagination.appendChild(dot);
          dots.push(dot);
        }
      },
      slideChanged(instance) {
        if (!dots.length) {
          return;
        }

        const current = instance.track.details.rel;
        dots.forEach((dot, index) => {
          dot.classList.toggle("is-active", index === current);
        });
      },
    });

    goodsCardSliders.set(container, slider);
  });
}

function scheduleGoodsCardInit(root = document) {
  initGoodsCardSliders(root);

  if (
    typeof KeenSlider !== "undefined" ||
    goodsCardInitAttempts >= 20 ||
    !root.querySelector("[data-goods-slider]")
  ) {
    return;
  }

  goodsCardInitAttempts += 1;
  window.setTimeout(() => {
    scheduleGoodsCardInit(root);
  }, 250);
}

function initProductGoodsCarousels(root = document) {
  root.querySelectorAll("[data-product-goods-section]").forEach((section) => {
    const track = section.querySelector("[data-product-goods-track]");

    if (!track || productGoodsSliders.has(track)) {
      return;
    }

    if (track.dataset.sliderPrepared !== "true") {
      const sourceCards = Array.from(track.querySelectorAll(".im-goods__card"));

      sourceCards.forEach((card) => {
        track.appendChild(card.cloneNode(true));
      });

      track.dataset.sliderPrepared = "true";
    }

    if (typeof KeenSlider === "undefined") {
      return;
    }

    const slides = Array.from(track.querySelectorAll(".im-goods__card"));
    track.classList.add("keen-slider");
    slides.forEach((slide) => slide.classList.add("keen-slider__slide"));

    const slider = new KeenSlider(track, {
      selector: ".im-goods__card",
      mode: "free-snap",
      rubberband: false,
      drag: true,
      loop: true,
      slides: {
        origin: "auto",
        perView: 4,
        spacing: 12,
      },
      breakpoints: {
        "(max-width: 1100px)": {
          slides: {
            origin: "auto",
            perView: 3,
            spacing: 12,
          },
        },
        "(max-width: 900px)": {
          slides: {
            origin: "auto",
            perView: 2,
            spacing: 12,
          },
        },
        "(max-width: 600px)": {
          slides: {
            origin: "auto",
            perView: 2,
            spacing: 8,
          },
        },
      },
    });

    productGoodsSliders.set(track, slider);
  });
}

function scheduleProductGoodsInit(root = document) {
  initProductGoodsCarousels(root);

  if (
    typeof KeenSlider !== "undefined" ||
    productGoodsInitAttempts >= 20 ||
    !root.querySelector("[data-product-goods-section]")
  ) {
    return;
  }

  productGoodsInitAttempts += 1;
  window.setTimeout(() => {
    scheduleProductGoodsInit(root);
  }, 250);
}

function syncCasesGallery(caseCard, index) {
  if (!caseCard) {
    return;
  }

  const thumbs = Array.from(caseCard.querySelectorAll("[data-case-thumb]"));
  const mainImage = caseCard.querySelector("[data-case-main-image]");

  if (!thumbs.length || !mainImage) {
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
  caseCard.dataset.caseIndex = String(nextIndex);
}

function syncCaseMoreButton(caseCard) {
  if (!(caseCard instanceof HTMLElement)) {
    return;
  }

  const caseExtra = caseCard.querySelector("[data-case-extra-out]");
  const caseMoreButton = caseCard.querySelector(".im-product-page__case-more");

  if (!(caseExtra instanceof HTMLElement) || !(caseMoreButton instanceof HTMLElement)) {
    return;
  }

  if (caseExtra.classList.contains("is-expanded")) {
    caseMoreButton.hidden = false;
    return;
  }

  const hasOverflow = caseExtra.scrollHeight - caseExtra.clientHeight > 1;
  caseMoreButton.hidden = !hasOverflow;
}

function syncCaseMoreButtons() {
  document.querySelectorAll("[data-case-card]").forEach((caseCard) => {
    syncCaseMoreButton(caseCard);
  });
}

function initCasesGalleries() {
  document.querySelectorAll("[data-case-card]").forEach((caseCard) => {
    syncCasesGallery(
      caseCard,
      Number.parseInt(caseCard.dataset.caseIndex || "0", 10),
    );
  });

  syncCaseMoreButtons();
}

function stopFaqAnimation(answer) {
  if (!answer) {
    return;
  }

  if (answer._faqAnimationFrame) {
    cancelAnimationFrame(answer._faqAnimationFrame);
    answer._faqAnimationFrame = null;
  }

  if (answer._faqTransitionHandler) {
    answer.removeEventListener("transitionend", answer._faqTransitionHandler);
    answer._faqTransitionHandler = null;
  }
}

function collapseFaqItem(item) {
  const answer = item?.querySelector(".im-product-page__faq-answer");

  if (!item || !answer || !item.open) {
    return;
  }

  stopFaqAnimation(answer);

  const startHeight = `${answer.scrollHeight}px`;
  answer.style.height = startHeight;

  answer._faqAnimationFrame = requestAnimationFrame(() => {
    answer.style.height = "0px";

    const handleTransitionEnd = (event) => {
      if (event.propertyName !== "height") {
        return;
      }

      item.open = false;
      answer.style.height = "0px";
      answer.removeEventListener("transitionend", handleTransitionEnd);
      answer._faqTransitionHandler = null;
    };

    answer._faqTransitionHandler = handleTransitionEnd;
    answer.addEventListener("transitionend", handleTransitionEnd);
  });
}

function expandFaqItem(item) {
  const answer = item?.querySelector(".im-product-page__faq-answer");

  if (!item || !answer) {
    return;
  }

  stopFaqAnimation(answer);
  item.open = true;
  answer.style.height = "0px";

  answer._faqAnimationFrame = requestAnimationFrame(() => {
    answer.style.height = `${answer.scrollHeight}px`;

    const handleTransitionEnd = (event) => {
      if (event.propertyName !== "height") {
        return;
      }

      answer.style.height = "auto";
      answer.removeEventListener("transitionend", handleTransitionEnd);
      answer._faqTransitionHandler = null;
    };

    answer._faqTransitionHandler = handleTransitionEnd;
    answer.addEventListener("transitionend", handleTransitionEnd);
  });
}

function initFaqAccordions(root = document) {
  root.querySelectorAll(".im-product-page__faq-item").forEach((item) => {
    const answer = item.querySelector(".im-product-page__faq-answer");

    if (!answer) {
      return;
    }

    answer.style.height = item.open ? "auto" : "0px";
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

  document.querySelectorAll(".im-product-page__details-tab").forEach((tab) => {
    const isActive = tab.getAttribute("href") === href;
    tab.classList.toggle("im-product-page__details-tab--active", isActive);
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
  const heroSection = document.querySelector(".im-product-page__hero");
  const trackedSections = Array.from(
    document.querySelectorAll(
      "#product-characteristics, #product-set, #product-reviews, #product-cases, #product-analogs, #product-related",
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

function syncProductColorSwatches(group, activeSwatch) {
  if (!(group instanceof HTMLElement) || !(activeSwatch instanceof HTMLElement)) {
    return;
  }

  group.querySelectorAll(".im-product-page__swatch").forEach((swatch) => {
    const isActive = swatch === activeSwatch;
    swatch.classList.toggle("im-product-page__swatch--active", isActive);
    swatch.setAttribute("aria-pressed", String(isActive));
  });
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
  const faqSummary = event.target.closest(".im-product-page__faq-summary");

  if (faqSummary) {
    const faqItem = faqSummary.closest(".im-product-page__faq-item");

    if (faqItem) {
      event.preventDefault();

      if (faqItem.open) {
        collapseFaqItem(faqItem);
      } else {
        expandFaqItem(faqItem);
      }
    }

    return;
  }

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
    const productGoodsSection =
      goodsNavButton.closest("[data-product-goods-section]");
    const productGoodsTrack =
      productGoodsSection?.querySelector("[data-product-goods-track]");
    const productGoodsSlider = productGoodsTrack
      ? productGoodsSliders.get(productGoodsTrack)
      : null;

    if (productGoodsSlider) {
      if (goodsNavButton.hasAttribute("data-goods-next")) {
        productGoodsSlider.next();
      } else {
        productGoodsSlider.prev();
      }

      return;
    }

    const slider = section?.querySelector("[data-goods-carousel]");
    const firstCard = slider?.querySelector(".im-goods__card");

    if (slider && firstCard) {
      const sliderStyles = getComputedStyle(slider);
      const cardGap = Number.parseFloat(
        sliderStyles.columnGap || sliderStyles.gap || "0",
      );
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

  const colorSwatch = event.target.closest(".im-product-page__swatch");

  if (colorSwatch) {
    const swatchGroup = colorSwatch.closest(".im-product-page__color-swatches");

    if (swatchGroup) {
      syncProductColorSwatches(swatchGroup, colorSwatch);
    }

    return;
  }

  const caseThumbButton = event.target.closest("[data-case-thumb]");

  if (caseThumbButton) {
    const caseCard = caseThumbButton.closest("[data-case-card]");
    const thumbs = caseCard
      ? Array.from(caseCard.querySelectorAll("[data-case-thumb]"))
      : [];
    const nextIndex = thumbs.indexOf(caseThumbButton);

    if (caseCard && nextIndex >= 0) {
      syncCasesGallery(caseCard, nextIndex);
    }

    return;
  }

  const caseNavButton = event.target.closest("[data-case-prev], [data-case-next]");

  if (caseNavButton) {
    const casesSection = caseNavButton.closest(".im-product-page__cases");
    const track = casesSection?.querySelector("[data-cases-gallery]");

    if (track) {
      const direction = caseNavButton.hasAttribute("data-case-next") ? 1 : -1;
      const card = track.querySelector("[data-case-card]");
      const step = card ? card.getBoundingClientRect().width : track.clientWidth;

      track.scrollBy({
        left: step * direction,
        behavior: "smooth",
      });
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
      syncCaseMoreButton(caseCard);
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
initCtaCustomSelects();
initRatingStars();
scheduleReviewMediaInit();
scheduleGoodsCardInit();
scheduleProductGalleryInit();
syncMobileExtrasPlacement();
initCasesGalleries();
scheduleProductGoodsInit();
initFaqAccordions();
initProductStickyHeader();

window.addEventListener("resize", () => {
  initProductGallerySliders();
  syncMobileExtrasPlacement();
  syncCaseMoreButtons();
});
