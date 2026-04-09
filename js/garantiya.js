(() => {
  const DEFAULT_SLIDER_BREAKPOINT = 1000;
  const sliderBreakpoints = {
    assurances: 768,
    service: 768,
  };
  const sliderRoots = Array.from(document.querySelectorAll("[data-garantiya-slider]"));

  if (!sliderRoots.length) return;

  const instances = new Map();

  const destroySlider = (root) => {
    const instance = instances.get(root);
    if (instance) {
      instance.destroy();
      instances.delete(root);
    }

    root.classList.remove("keen-slider");
    root.querySelectorAll("[data-garantiya-slide]").forEach((slide) => {
      slide.classList.remove("keen-slider__slide");
    });
  };

  const setupSlider = (root) => {
    const sliderName = root.getAttribute("data-garantiya-slider") || "";
    const breakpoint =
      sliderBreakpoints[sliderName] ?? DEFAULT_SLIDER_BREAKPOINT;
    const shouldEnable = window.innerWidth <= breakpoint;

    if (!shouldEnable) {
      destroySlider(root);
      return;
    }

    if (typeof window.KeenSlider === "undefined") {
      destroySlider(root);
      return;
    }

    if (instances.has(root)) return;

    root.classList.add("keen-slider");
    root.querySelectorAll("[data-garantiya-slide]").forEach((slide) => {
      slide.classList.add("keen-slider__slide");
    });

    const instance = new window.KeenSlider(root, {
      loop: false,
      slides: {
        perView: "auto",
        spacing: 12,
      },
      drag: true,
      rubberband: false,
    });

    instances.set(root, instance);
  };

  const syncSliders = () => {
    sliderRoots.forEach(setupSlider);
  };

  syncSliders();
  window.addEventListener("resize", syncSliders);
})();
