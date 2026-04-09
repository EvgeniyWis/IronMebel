(() => {
  const initPartnersFormatsSlider = () => {
    const root = document.querySelector("[data-partners-formats-slider]");
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
      if (window.innerWidth > 1000) {
        destroy();
        return;
      }

      if (typeof KeenSlider === "undefined") {
        window.setTimeout(setup, 150);
        return;
      }

      if (slider) return;

      root.classList.add("keen-slider");
      root
        .querySelectorAll("[data-partners-formats-card]")
        .forEach((slide) => slide.classList.add("keen-slider__slide"));

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

  initPartnersFormatsSlider();
})();
