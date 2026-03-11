document.addEventListener("click", (event) => {
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
