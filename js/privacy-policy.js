(() => {
  const initPrivacyPolicyAccordion = () => {
    const accordionRoot = document.querySelector("[data-privacy-policy-accordion]");
    if (!accordionRoot) return;

    const items = Array.from(
      accordionRoot.querySelectorAll(".im-privacy-policy-page__item"),
    );
    const toggles = Array.from(
      accordionRoot.querySelectorAll("[data-privacy-policy-toggle]"),
    );

    const setItemState = (item, toggle, panel, shouldOpen) => {
      item.classList.toggle("is-open", shouldOpen);
      toggle.setAttribute("aria-expanded", String(shouldOpen));
      panel.setAttribute("aria-hidden", String(!shouldOpen));
      panel.style.maxHeight = shouldOpen ? `${panel.scrollHeight}px` : "0px";
    };

    toggles.forEach((toggle) => {
      const item = toggle.closest(".im-privacy-policy-page__item");
      const panel = item?.querySelector("[data-privacy-policy-panel]");
      if (!item || !panel) return;

      setItemState(item, toggle, panel, false);

      toggle.addEventListener("click", () => {
        const shouldOpen = toggle.getAttribute("aria-expanded") !== "true";
        setItemState(item, toggle, panel, shouldOpen);
      });
    });

    window.addEventListener("resize", () => {
      items.forEach((item) => {
        const toggle = item.querySelector("[data-privacy-policy-toggle]");
        const panel = item.querySelector("[data-privacy-policy-panel]");
        if (!toggle || !panel) return;

        const isOpen = toggle.getAttribute("aria-expanded") === "true";
        panel.style.maxHeight = isOpen ? `${panel.scrollHeight}px` : "0px";
      });
    });
  };

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
            spacing: 12,
          },
          drag: true,
          rubberband: false,
        });
      });
    };

    setup();
    window.addEventListener("resize", setup);
  };

  initPrivacyPolicyAccordion();
  initPrivacyPolicyPersonalizationSliders();
})();
