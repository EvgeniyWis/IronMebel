(() => {
  const initDeliveryFaq = () => {
    const faqRoot = document.querySelector("[data-delivery-faq]");
    if (!faqRoot) return;

    const items = Array.from(faqRoot.querySelectorAll(".im-delivery-page__faq-item"));
    const toggles = Array.from(faqRoot.querySelectorAll("[data-delivery-faq-toggle]"));

    const setItemState = (item, toggle, panel, shouldOpen) => {
      item.classList.toggle("is-open", shouldOpen);
      toggle.setAttribute("aria-expanded", String(shouldOpen));
      panel.setAttribute("aria-hidden", String(!shouldOpen));
      panel.style.maxHeight = shouldOpen ? `${panel.scrollHeight}px` : "0px";
    };

    toggles.forEach((toggle) => {
      const item = toggle.closest(".im-delivery-page__faq-item");
      const panel = item?.querySelector("[data-delivery-faq-panel]");
      if (!item || !panel) return;

      setItemState(item, toggle, panel, false);

      toggle.addEventListener("click", () => {
        const shouldOpen = toggle.getAttribute("aria-expanded") !== "true";
        setItemState(item, toggle, panel, shouldOpen);
      });
    });

    window.addEventListener("resize", () => {
      items.forEach((item) => {
        const toggle = item.querySelector("[data-delivery-faq-toggle]");
        const panel = item.querySelector("[data-delivery-faq-panel]");
        if (!toggle || !panel) return;

        const isOpen = toggle.getAttribute("aria-expanded") === "true";
        panel.style.maxHeight = isOpen ? `${panel.scrollHeight}px` : "0px";
      });
    });
  };

  initDeliveryFaq();
})();
