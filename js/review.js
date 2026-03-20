/** Review page — star rating, file uploads, form submission */
(function () {
  "use strict";

  const SLIDER_THRESHOLD = 6;
  const CLOSE_SVG = '<svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M3.74704 2.92969C3.55511 2.92969 3.35441 2.99419 3.20794 3.14044C2.91506 3.43369 2.91506 3.92568 3.20794 4.21893L7.91891 8.92969L3.20794 13.6404C2.91506 13.9337 2.91506 14.4257 3.20794 14.7189C3.50089 15.0114 3.99319 15.0114 4.28614 14.7189L8.99704 10.0082L13.7079 14.7189C14.0009 15.0114 14.4932 15.0114 14.7861 14.7189C15.079 14.4257 15.079 13.9337 14.7861 13.6404L10.0752 8.92969L14.7861 4.21893C15.079 3.92568 15.079 3.43369 14.7861 3.14044C14.6397 2.99419 14.4389 2.92969 14.247 2.92969C14.0551 2.92969 13.8545 2.99419 13.7079 3.14044L8.99704 7.85118L4.28614 3.14044C4.13966 2.99419 3.93896 2.92969 3.74704 2.92969Z" fill="#111111" /></svg>';

  // ─── Star rating ───────────────────────────────────────────────
  const starsWrap = document.querySelector("[data-review-stars]");
  const ratingInput = document.querySelector("[data-review-rating-input]");

  if (starsWrap) {
    const stars = starsWrap.querySelectorAll("[data-star]");

    function setRating(value) {
      ratingInput.value = value;
      stars.forEach((star) => {
        star.classList.toggle("is-active", Number(star.dataset.star) <= value);
      });
    }

    starsWrap.addEventListener("mouseover", (e) => {
      const btn = e.target.closest("[data-star]");
      if (!btn) return;
      const hoverVal = Number(btn.dataset.star);
      stars.forEach((star) => {
        star.classList.toggle("is-active", Number(star.dataset.star) <= hoverVal);
      });
    });

    starsWrap.addEventListener("mouseleave", () => {
      const current = Number(ratingInput.value);
      stars.forEach((star) => {
        star.classList.toggle("is-active", Number(star.dataset.star) <= current);
      });
    });

    starsWrap.addEventListener("click", (e) => {
      const btn = e.target.closest("[data-star]");
      if (!btn) return;
      setRating(Number(btn.dataset.star));
    });
  }

  // ─── Auto-resize textarea ──────────────────────────────────────
  const textarea = document.querySelector("[data-review-opinion]");
  if (textarea) {
    function autoResize() {
      textarea.style.height = "55px";
      const scrollH = textarea.scrollHeight;
      if (scrollH > 55) {
        textarea.style.height = Math.min(scrollH, 150) + "px";
      }
    }
    textarea.addEventListener("input", autoResize);
  }

  // ─── File upload with Keen Slider ──────────────────────────────
  function initUpload({ inputSelector, previewsSelector, arrowSelector, maxFiles, maxSizeMb, type }) {
    const input = document.querySelector(inputSelector);
    const previewsContainer = document.querySelector(previewsSelector);
    const arrowBtn = document.querySelector(arrowSelector);
    if (!input || !previewsContainer) return;

    const files = [];
    const maxSize = maxSizeMb * 1024 * 1024;
    let sliderInstance = null;

    input.addEventListener("change", () => {
      const incoming = Array.from(input.files);
      incoming.forEach((file) => {
        if (files.length >= maxFiles) return;
        if (file.size > maxSize) return;
        files.push(file);
      });
      input.value = "";
      renderPreviews();
    });

    function destroySlider() {
      if (sliderInstance) {
        sliderInstance.destroy();
        sliderInstance = null;
      }
      previewsContainer.classList.remove("keen-slider");
      previewsContainer.querySelectorAll(".im-review-page__preview").forEach((el) => {
        el.classList.remove("keen-slider__slide");
      });
      if (arrowBtn) arrowBtn.classList.remove("is-visible");
    }

    function initSlider() {
      if (typeof KeenSlider === "undefined") return;

      previewsContainer.classList.add("keen-slider");
      previewsContainer.querySelectorAll(".im-review-page__preview").forEach((el) => {
        el.classList.add("keen-slider__slide");
      });

      sliderInstance = new KeenSlider(previewsContainer, {
        mode: "free-snap",
        slides: { perView: "auto", spacing: 12 },
      });

      if (arrowBtn) {
        arrowBtn.classList.add("is-visible");
        arrowBtn.onclick = () => sliderInstance.next();
      }
    }

    function renderPreviews() {
      destroySlider();
      previewsContainer.innerHTML = "";

      files.forEach((file, idx) => {
        const wrap = document.createElement("div");
        wrap.className = "im-review-page__preview";

        if (type === "photo") {
          const img = document.createElement("img");
          img.className = "im-review-page__preview-img";
          img.alt = file.name;
          img.src = URL.createObjectURL(file);
          wrap.appendChild(img);
        } else {
          const video = document.createElement("video");
          video.className = "im-review-page__preview-video";
          video.muted = true;
          video.src = URL.createObjectURL(file);
          wrap.appendChild(video);
        }

        const removeBtn = document.createElement("button");
        removeBtn.className = "im-review-page__preview-remove";
        removeBtn.type = "button";
        removeBtn.setAttribute("aria-label", "Удалить");
        removeBtn.innerHTML = CLOSE_SVG;
        removeBtn.addEventListener("click", () => {
          URL.revokeObjectURL(type === "photo" ? wrap.querySelector("img").src : wrap.querySelector("video").src);
          files.splice(idx, 1);
          renderPreviews();
        });

        wrap.appendChild(removeBtn);
        previewsContainer.appendChild(wrap);
      });

      if (files.length > SLIDER_THRESHOLD) {
        initSlider();
      }
    }
  }

  // Photo upload (max 15, 10 Mb each)
  initUpload({
    inputSelector: "[data-photo-input]",
    previewsSelector: "[data-photo-previews]",
    arrowSelector: "[data-photo-arrow]",
    maxFiles: 15,
    maxSizeMb: 10,
    type: "photo",
  });

  // Video upload (max 3, 300 Mb each)
  initUpload({
    inputSelector: "[data-video-input]",
    previewsSelector: "[data-video-previews]",
    arrowSelector: "[data-video-arrow]",
    maxFiles: 3,
    maxSizeMb: 300,
    type: "video",
  });

  // ─── Submit ────────────────────────────────────────────────────
  const submitBtn = document.querySelector("[data-review-submit]");
  if (submitBtn) {
    submitBtn.addEventListener("click", (e) => {
      e.preventDefault();
      const rating = Number(ratingInput?.value || 0);
      if (rating === 0) {
        starsWrap?.scrollIntoView({ behavior: "smooth", block: "center" });
        return;
      }
      // Here you would collect form data and send to the server
    });
  }
})();
