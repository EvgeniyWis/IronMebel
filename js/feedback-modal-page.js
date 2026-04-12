(() => {
  let isInitialized = false;

  const initFeedbackModal = () => {
    if (isInitialized) {
      return true;
    }

  const MODAL_ANIMATION_DURATION = 340;
  const modal = document.querySelector("[data-feedback-modal]");
  const openButtons = document.querySelectorAll("[data-feedback-modal-open]");

  if (!(modal instanceof HTMLElement) || !openButtons.length) {
    return false;
  }

  isInitialized = true;

  let lastOpenButton = null;

  const selectWraps = modal.querySelectorAll("[data-feedback-select]");
  const closeElements = modal.querySelectorAll("[data-feedback-modal-close]");
  const openWraps = new Set();
  let closeTimeoutId = null;

  const closeWrap = (wrap) => {
    if (!(wrap instanceof HTMLElement)) {
      return;
    }

    wrap.classList.remove("is-open");
    const button = wrap.querySelector(".im-feedback-modal__select-btn");
    if (button instanceof HTMLElement) {
      button.setAttribute("aria-expanded", "false");
    }
    openWraps.delete(wrap);
  };

  const closeAllWraps = () => {
    openWraps.forEach((wrap) => closeWrap(wrap));
  };

  const closeModal = () => {
    modal.setAttribute("aria-hidden", "true");
    modal.classList.remove("is-open");
    modal.classList.add("is-animating");

    window.clearTimeout(closeTimeoutId);
    closeTimeoutId = window.setTimeout(() => {
      modal.hidden = true;
      modal.classList.remove("is-animating");
    }, MODAL_ANIMATION_DURATION);

    document.body.style.overflow = "";
    if (lastOpenButton instanceof HTMLElement) {
      lastOpenButton.focus();
    }
  };

  const openModal = (triggerButton) => {
    if (triggerButton instanceof HTMLElement) {
      lastOpenButton = triggerButton;
    }
    window.clearTimeout(closeTimeoutId);
    modal.hidden = false;
    modal.classList.add("is-animating");
    modal.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";

    requestAnimationFrame(() => {
      modal.classList.add("is-open");
    });
  };

  const initSelect = (wrap) => {
    if (!(wrap instanceof HTMLElement)) {
      return;
    }

    const select = wrap.querySelector(".im-feedback-modal__select");
    if (!(select instanceof HTMLSelectElement)) {
      return;
    }

    if (wrap.querySelector(".im-feedback-modal__select-btn")) {
      return;
    }

    const button = document.createElement("button");
    button.type = "button";
    button.className = "im-feedback-modal__select-btn";
    button.setAttribute("aria-haspopup", "listbox");
    button.setAttribute("aria-expanded", "false");

    const menu = document.createElement("div");
    menu.className = "im-feedback-modal__select-menu";
    menu.setAttribute("role", "listbox");

    const syncButton = () => {
      const activeOption = select.selectedOptions[0] || select.options[0];
      button.textContent = activeOption ? activeOption.textContent : "";
    };

    const rebuildMenu = () => {
      menu.innerHTML = "";

      Array.from(select.options).forEach((option, index) => {
        const optionButton = document.createElement("button");
        optionButton.type = "button";
        optionButton.className = "im-feedback-modal__select-option";
        optionButton.setAttribute("role", "option");
        optionButton.textContent = option.textContent;

        const isActive = index === select.selectedIndex;
        optionButton.classList.toggle("is-active", isActive);
        optionButton.setAttribute("aria-selected", isActive ? "true" : "false");

        optionButton.addEventListener("click", () => {
          select.selectedIndex = index;
          select.dispatchEvent(new Event("change", { bubbles: true }));
          syncButton();
          rebuildMenu();
          closeWrap(wrap);
          button.focus();
        });

        optionButton.addEventListener("keydown", (event) => {
          const items = Array.from(
            menu.querySelectorAll(".im-feedback-modal__select-option"),
          );
          const currentIndex = items.indexOf(optionButton);

          if (event.key === "ArrowDown") {
            event.preventDefault();
            const nextItem = items[Math.min(items.length - 1, currentIndex + 1)];
            if (nextItem instanceof HTMLElement) {
              nextItem.focus();
            }
          }

          if (event.key === "ArrowUp") {
            event.preventDefault();
            const previousItem = items[Math.max(0, currentIndex - 1)];
            if (previousItem instanceof HTMLElement) {
              previousItem.focus();
            }
          }

          if (event.key === "Escape") {
            event.preventDefault();
            closeWrap(wrap);
            button.focus();
          }
        });

        menu.appendChild(optionButton);
      });
    };

    const openWrap = () => {
      closeAllWraps();
      wrap.classList.add("is-open");
      button.setAttribute("aria-expanded", "true");
      openWraps.add(wrap);

      const activeOption = menu.querySelector(".im-feedback-modal__select-option.is-active");
      if (activeOption instanceof HTMLElement) {
        activeOption.focus();
      }
    };

    button.addEventListener("click", (event) => {
      event.preventDefault();
      event.stopPropagation();

      if (wrap.classList.contains("is-open")) {
        closeWrap(wrap);
      } else {
        openWrap();
      }
    });

    button.addEventListener("keydown", (event) => {
      if (
        event.key === "Enter" ||
        event.key === " " ||
        event.key === "ArrowDown"
      ) {
        event.preventDefault();
        openWrap();
      }

      if (event.key === "Escape") {
        event.preventDefault();
        closeWrap(wrap);
      }
    });

    select.addEventListener("change", () => {
      syncButton();
      rebuildMenu();
    });

    syncButton();
    rebuildMenu();
    wrap.append(button, menu);
  };

  selectWraps.forEach((wrap) => initSelect(wrap));

  openButtons.forEach((button) => {
    button.addEventListener("click", () => openModal(button));
  });

  closeElements.forEach((element) => {
    element.addEventListener("click", closeModal);
  });

  document.addEventListener("click", (event) => {
    const target = event.target;

    if (!(target instanceof HTMLElement)) {
      closeAllWraps();
      return;
    }

    if (!target.closest("[data-feedback-select]")) {
      closeAllWraps();
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      if (openWraps.size) {
        closeAllWraps();
        return;
      }

      if (!modal.hidden) {
        closeModal();
      }
    }
  });
    return true;
  };

  const bootstrapFeedbackModal = () => {
    if (initFeedbackModal()) {
      return;
    }

    if (!(document.body instanceof HTMLElement)) {
      return;
    }

    const observer = new MutationObserver(() => {
      if (initFeedbackModal()) {
        observer.disconnect();
      }
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });

    window.setTimeout(() => {
      observer.disconnect();
    }, 10000);
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", bootstrapFeedbackModal);
  } else {
    bootstrapFeedbackModal();
  }
})();
