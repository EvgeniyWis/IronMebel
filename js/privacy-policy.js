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

  initPrivacyPolicyAccordion();
})();
