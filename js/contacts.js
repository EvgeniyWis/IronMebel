(() => {
  const copyButtons = document.querySelectorAll("[data-copy-button]");

  if (!copyButtons.length) return;

  const timers = new WeakMap();

  const copyValue = async (value) => {
    if (!navigator.clipboard || !window.isSecureContext) {
      throw new Error("Clipboard API is unavailable");
    }

    await navigator.clipboard.writeText(value);
  };

  const resetButton = (button) => {
    button.classList.remove("is-copied");
    button.setAttribute(
      "aria-label",
      `Скопировать ${button.dataset.copyLabel || "значение"}`,
    );
  };

  copyButtons.forEach((button) => {
    button.addEventListener("click", async () => {
      const value = button.dataset.copyValue;
      const label = button.dataset.copyLabel || "значение";

      if (!value) return;

      try {
        await copyValue(value);
        button.classList.add("is-copied");
        button.setAttribute("aria-label", `Скопировано: ${label}`);

        const activeTimer = timers.get(button);
        if (activeTimer) {
          window.clearTimeout(activeTimer);
        }

        const timer = window.setTimeout(() => {
          resetButton(button);
        }, 1800);

        timers.set(button, timer);
      } catch (error) {
        button.setAttribute("aria-label", `Не удалось скопировать: ${label}`);
      }
    });
  });
})();
