(() => {
  const SLIDER_BREAKPOINT = 768;
  const trainingRoot = document.querySelector("[data-services-training-slider]");
  const mobileMedia = window.matchMedia(`(max-width: ${SLIDER_BREAKPOINT}px)`);

  if (!trainingRoot) return;

  let sliderInstance = null;
  let retryTimer = null;

  const destroySlider = () => {
    if (sliderInstance) {
      sliderInstance.destroy();
      sliderInstance = null;
    }

    if (retryTimer) {
      window.clearTimeout(retryTimer);
      retryTimer = null;
    }

    trainingRoot.classList.remove("keen-slider");
    trainingRoot.removeAttribute("style");

    trainingRoot
      .querySelectorAll("[data-services-training-slide]")
      .forEach((slide) => {
        slide.classList.remove("keen-slider__slide");
        slide.removeAttribute("style");
      });
  };

  const enableSlider = () => {
    if (sliderInstance || typeof KeenSlider === "undefined") return;

    trainingRoot.classList.add("keen-slider");
    trainingRoot
      .querySelectorAll("[data-services-training-slide]")
      .forEach((slide) => {
        slide.classList.add("keen-slider__slide");
      });

    sliderInstance = new KeenSlider(trainingRoot, {
      loop: false,
      slides: {
        perView: "auto",
        spacing: 0,
      },
      drag: true,
      rubberband: false,
    });
  };

  const syncPageState = () => {
    if (window.innerWidth > SLIDER_BREAKPOINT) {
      destroySlider();
      return;
    }

    if (typeof KeenSlider === "undefined") {
      destroySlider();

      if (retryTimer) return;

      retryTimer = window.setTimeout(() => {
        retryTimer = null;
        syncPageState();
      }, 150);
      return;
    }

    enableSlider();
  };

  syncPageState();
  window.addEventListener("ironmebel:layout-ready", syncPageState);
  window.addEventListener("load", syncPageState);
  window.addEventListener("resize", syncPageState);
  if (typeof mobileMedia.addEventListener === "function") {
    mobileMedia.addEventListener("change", syncPageState);
  } else if (typeof mobileMedia.addListener === "function") {
    mobileMedia.addListener(syncPageState);
  }
  window.setTimeout(syncPageState, 200);

  let bootstrapChecks = 0;
  const bootstrapTimer = window.setInterval(() => {
    bootstrapChecks += 1;
    syncPageState();

    if (sliderInstance || bootstrapChecks >= 12) {
      window.clearInterval(bootstrapTimer);
    }
  }, 250);
})();

(() => {
  const SLIDER_BREAKPOINT = 768;
  const section = document.querySelector(".im-services-page__section--projects");
  const sliderRoot = document.querySelector("[data-services-projects-slider]");
  const sliderViewport = sliderRoot?.closest(".im-services-page__projects-slider");
  const slides = Array.from(
    document.querySelectorAll("[data-services-projects-slide]"),
  );
  const prevButton = section?.querySelector("[data-services-projects-prev]");
  const nextButton = section?.querySelector("[data-services-projects-next]");

  if (!sliderRoot || !slides.length) return;

  let sliderInstance = null;
  let retryTimer = null;

  const setNativeScrollState = (isEnabled) => {
    if (!sliderViewport) return;

    sliderViewport.classList.toggle("is-native-scroll", isEnabled);

    if (!isEnabled) {
      sliderViewport.scrollLeft = 0;
    }
  };

  const updateArrows = (instance = sliderInstance) => {
    if (!prevButton || !nextButton || !instance?.track?.details) return;

    prevButton.disabled = instance.track.details.rel === 0;
    nextButton.disabled =
      instance.track.details.rel === instance.track.details.maxIdx;

    prevButton.setAttribute("aria-disabled", String(prevButton.disabled));
    nextButton.setAttribute("aria-disabled", String(nextButton.disabled));
  };

  const destroySlider = () => {
    if (sliderInstance) {
      sliderInstance.destroy();
      sliderInstance = null;
    }

    sliderRoot.classList.remove("keen-slider");
    sliderRoot.removeAttribute("style");

    slides.forEach((slide) => {
      slide.classList.remove("keen-slider__slide");
      slide.removeAttribute("style");
    });

    if (prevButton) {
      prevButton.disabled = true;
      prevButton.setAttribute("aria-disabled", "true");
    }

    if (nextButton) {
      nextButton.disabled = true;
      nextButton.setAttribute("aria-disabled", "true");
    }
  };

  const initSlider = () => {
    if (sliderInstance || typeof KeenSlider === "undefined") return;

    sliderRoot.classList.add("keen-slider");
    slides.forEach((slide) => {
      slide.classList.add("keen-slider__slide");
    });

    sliderInstance = new KeenSlider(sliderRoot, {
      slides: {
        perView: "auto",
        spacing: 12,
      },
      loop: false,
      drag: true,
      rubberband: false,
    });

    sliderInstance.on("created", updateArrows);
    sliderInstance.on("slideChanged", updateArrows);
    sliderInstance.on("updated", updateArrows);

    updateArrows();
  };

  const syncSliderState = () => {
    if (window.innerWidth <= SLIDER_BREAKPOINT) {
      destroySlider();
      setNativeScrollState(true);
      return;
    }

    setNativeScrollState(false);

    if (typeof KeenSlider === "undefined") {
      if (retryTimer) return;

      retryTimer = window.setTimeout(() => {
        retryTimer = null;
        syncSliderState();
      }, 150);
      return;
    }

    if (!sliderInstance) {
      initSlider();
      return;
    }

    sliderInstance.update();
    updateArrows();
  };

  if (prevButton) {
    prevButton.addEventListener("click", () => {
      sliderInstance?.prev();
    });
  }

  if (nextButton) {
    nextButton.addEventListener("click", () => {
      sliderInstance?.next();
    });
  }

  syncSliderState();
  window.addEventListener("resize", syncSliderState);
})();
