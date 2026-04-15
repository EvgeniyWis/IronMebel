(() => {
  const initPrivacyPolicyPersonalizationSliders = () => {
    const sliderRoots = Array.from(
      document.querySelectorAll("[data-privacy-personalization-slider]"),
    );
    if (!sliderRoots.length) return;

    let retryTimer = null;

    const sliderStates = sliderRoots.map((root) => ({
      root,
      breakpoint: root.classList.contains(
        "im-privacy-policy-page__cards-track--settings",
      )
        ? 1000
        : 768,
      spacing:
        root.classList.contains(
          "im-privacy-policy-page__cards-track--data",
        ) ||
        root.classList.contains(
          "im-privacy-policy-page__cards-track--flow",
        ) ||
        root.classList.contains(
          "im-privacy-policy-page__cards-track--settings",
        )
        ? 0
        : 12,
      slider: null,
    }));

    const destroy = (state) => {
      if (state.slider) {
        state.slider.destroy();
        state.slider = null;
      }

      state.root.classList.remove("keen-slider");
      state.root.removeAttribute("style");

      state.root
        .querySelectorAll("[data-privacy-personalization-card]")
        .forEach((card) => {
          card.classList.remove("keen-slider__slide");
          card.removeAttribute("style");
        });
    };

    const setup = () => {
      if (typeof KeenSlider === "undefined") {
        if (retryTimer) return;

        retryTimer = window.setTimeout(() => {
          retryTimer = null;
          setup();
        }, 150);
        return;
      }

      sliderStates.forEach((state) => {
        if (window.innerWidth > state.breakpoint) {
          destroy(state);
          return;
        }

        if (state.slider) return;

        state.root.classList.add("keen-slider");
        state.root
          .querySelectorAll("[data-privacy-personalization-card]")
          .forEach((card) => card.classList.add("keen-slider__slide"));

        state.slider = new KeenSlider(state.root, {
          loop: false,
          slides: {
            perView: "auto",
            spacing: state.spacing,
          },
          drag: true,
          rubberband: false,
        });
      });
    };

    setup();
    window.addEventListener("resize", setup);
  };

  initPrivacyPolicyPersonalizationSliders();
})();
