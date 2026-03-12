document.addEventListener("click", (event) => {
  const thumbButton = event.target.closest(".im-product-page__thumb");

  if (thumbButton) {
    const gallery = thumbButton.closest(".im-product-page__gallery");
    const mainImage = gallery?.querySelector(".im-product-page__gallery-image");
    const nextSrc = thumbButton.dataset.fullSrc;

    if (gallery && mainImage && nextSrc) {
      gallery.querySelectorAll(".im-product-page__thumb").forEach((thumb) => {
        const isActive = thumb === thumbButton;

        thumb.classList.toggle("im-product-page__thumb--active", isActive);
        thumb.setAttribute("aria-pressed", String(isActive));
      });

      mainImage.src = nextSrc;
      mainImage.alt = thumbButton.dataset.fullAlt || mainImage.alt;
    }

    return;
  }

  const button = event.target.closest(".im-product-page__counter-btn");

  if (!button) {
    return;
  }

  const counter = button.closest(".im-product-page__counter");
  const input = counter?.querySelector(".im-product-page__counter-input");

  if (!input) {
    return;
  }

  const min = Number.parseInt(input.min || "0", 10);
  const step = Number.parseInt(input.step || "1", 10);
  const current = Number.parseInt(input.value || `${min}`, 10);
  const nextValue =
    button.dataset.action === "increment" ? current + step : current - step;

  input.value = `${Math.max(min, nextValue)}`;
  input.dispatchEvent(new Event("change", { bubbles: true }));
});
