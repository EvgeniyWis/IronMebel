document.addEventListener("DOMContentLoaded", () => {
  const MODAL_ANIMATION_DURATION = 220;
  const modal = document.querySelector("[data-universal-modal]");
  const openButton = document.querySelector("[data-universal-modal-open]");
  const closeElements = document.querySelectorAll("[data-universal-modal-close]");
  const cancelButton = document.querySelector("[data-universal-modal-cancel]");
  const confirmButton = document.querySelector("[data-universal-modal-confirm]");
  let closeTimeoutId = null;

  if (!(modal instanceof HTMLElement) || !(openButton instanceof HTMLElement)) {
    return;
  }

  const closeModal = () => {
    modal.setAttribute("aria-hidden", "true");
    modal.classList.remove("is-open");
    modal.classList.add("is-animating");

    window.clearTimeout(closeTimeoutId);
    closeTimeoutId = window.setTimeout(() => {
      modal.hidden = true;
      modal.classList.remove("is-animating");
    }, MODAL_ANIMATION_DURATION);

    openButton.focus();
  };

  const openModal = () => {
    window.clearTimeout(closeTimeoutId);
    modal.hidden = false;
    modal.classList.add("is-animating");
    modal.setAttribute("aria-hidden", "false");

    requestAnimationFrame(() => {
      modal.classList.add("is-open");
    });

    if (cancelButton instanceof HTMLElement) {
      cancelButton.focus();
    }
  };

  openButton.addEventListener("click", openModal);

  closeElements.forEach((element) => {
    element.addEventListener("click", closeModal);
  });

  if (cancelButton instanceof HTMLElement) {
    cancelButton.addEventListener("click", closeModal);
  }

  if (confirmButton instanceof HTMLElement) {
    confirmButton.addEventListener("click", closeModal);
  }

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && !modal.hidden) {
      closeModal();
    }
  });
});
