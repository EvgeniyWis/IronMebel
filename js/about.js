(() => {
  const initResponsiveSlider = (rootSelector, cardSelector, maxWidth = 1000) => {
    const root = document.querySelector(rootSelector);
    if (!root) return;

    let slider = null;

    const destroy = () => {
      if (slider) {
        slider.destroy();
        slider = null;
      }

      root.classList.remove("keen-slider");
      root
        .querySelectorAll(".keen-slider__slide")
        .forEach((slide) => slide.classList.remove("keen-slider__slide"));
    };

    const setup = () => {
      if (window.innerWidth > maxWidth) {
        destroy();
        return;
      }

      if (typeof KeenSlider === "undefined") {
        window.setTimeout(setup, 150);
        return;
      }

      if (slider) return;

      root.classList.add("keen-slider");
      root.querySelectorAll(cardSelector).forEach((slide) => {
        slide.classList.add("keen-slider__slide");
      });

      slider = new KeenSlider(root, {
        loop: false,
        slides: {
          perView: "auto",
          spacing: 12,
        },
        drag: true,
        rubberband: false,
      });
    };

    setup();
    window.addEventListener("resize", setup);
  };

  initResponsiveSlider(
    "[data-about-leadership-slider]",
    "[data-about-leadership-card]",
    1200
  );
  initResponsiveSlider("[data-about-trust-slider]", "[data-about-trust-card]");
})();
