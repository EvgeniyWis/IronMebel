(() => {
  document.addEventListener("DOMContentLoaded", () => {
    const faqRoot = document.querySelector("[data-test-drive-faq]");
    if (!(faqRoot instanceof HTMLElement)) {
      return;
    }

    const items = Array.from(
      faqRoot.querySelectorAll(".im-test-drive-page__faq-item"),
    );

    const setItemState = (item, toggle, panel, shouldOpen) => {
      item.classList.toggle("is-open", shouldOpen);
      toggle.setAttribute("aria-expanded", String(shouldOpen));
      panel.setAttribute("aria-hidden", String(!shouldOpen));
      panel.style.maxHeight = shouldOpen ? `${panel.scrollHeight}px` : "0px";
    };

    items.forEach((item) => {
      if (!(item instanceof HTMLElement)) {
        return;
      }

      const toggle = item.querySelector("[data-test-drive-faq-toggle]");
      const panel = item.querySelector("[data-test-drive-faq-panel]");

      if (!(toggle instanceof HTMLButtonElement) || !(panel instanceof HTMLElement)) {
        return;
      }

      setItemState(item, toggle, panel, false);

      toggle.addEventListener("click", () => {
        const shouldOpen = toggle.getAttribute("aria-expanded") !== "true";
        setItemState(item, toggle, panel, shouldOpen);
      });
    });

    window.addEventListener("resize", () => {
      items.forEach((item) => {
        if (!(item instanceof HTMLElement)) {
          return;
        }

        const toggle = item.querySelector("[data-test-drive-faq-toggle]");
        const panel = item.querySelector("[data-test-drive-faq-panel]");

        if (!(toggle instanceof HTMLButtonElement) || !(panel instanceof HTMLElement)) {
          return;
        }

        const isOpen = toggle.getAttribute("aria-expanded") === "true";
        panel.style.maxHeight = isOpen ? `${panel.scrollHeight}px` : "0px";
      });
    });
  });
})();
