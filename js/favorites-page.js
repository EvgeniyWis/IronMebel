document.addEventListener("DOMContentLoaded", () => {
  const MODAL_ANIMATION_DURATION = 220;
  const filledSection = document.querySelector("[data-favorites-filled]");
  const emptySection = document.querySelector("[data-favorites-empty]");
  const favoritesGrid = document.querySelector("[data-favorites-grid]");
  const clearButtons = document.querySelectorAll("[data-favorites-clear]");
  const modal = document.querySelector("[data-favorites-modal]");
  const modalCloseElements = document.querySelectorAll("[data-favorites-modal-close]");
  const cancelButton = document.querySelector("[data-favorites-cancel]");
  const confirmButton = document.querySelector("[data-favorites-confirm]");
  const recommendSection = document.querySelector(".im-goods--favorites-recommend");
  const recentSection = document.querySelector(".im-goods--favorites-recent");
  let modalCloseTimeoutId = null;

  if (!filledSection || !emptySection || !favoritesGrid) return;

  const getCardsFromSection = (section) => {
    if (!section) return [];
    return Array.from(section.querySelectorAll(".im-goods__grid > .im-goods__card"));
  };

  const pickRandomCard = (cards, usedCards) => {
    const availableCards = cards.filter((card) => !usedCards.has(card));
    if (!availableCards.length) return null;

    const randomIndex = Math.floor(Math.random() * availableCards.length);
    const card = availableCards[randomIndex];
    usedCards.add(card);
    return card;
  };

  const syncState = () => {
    const hasFavorites = favoritesGrid.children.length > 0;
    filledSection.hidden = !hasFavorites;
    emptySection.hidden = hasFavorites;

    clearButtons.forEach((btn) => {
      btn.hidden = !hasFavorites;
    });
  };

  const closeModal = () => {
    if (!modal) return;
    modal.setAttribute("aria-hidden", "true");
    modal.classList.remove("is-open");
    modal.classList.add("is-animating");

    window.clearTimeout(modalCloseTimeoutId);
    modalCloseTimeoutId = window.setTimeout(() => {
      modal.hidden = true;
      modal.classList.remove("is-animating");
    }, MODAL_ANIMATION_DURATION);

    const visibleClearBtn = Array.from(clearButtons).find((btn) => !btn.hidden);
    if (visibleClearBtn) {
      visibleClearBtn.focus();
    }
  };

  const openModal = () => {
    if (!modal) return;
    window.clearTimeout(modalCloseTimeoutId);
    modal.hidden = false;
    modal.classList.add("is-animating");
    modal.setAttribute("aria-hidden", "false");

    requestAnimationFrame(() => {
      modal.classList.add("is-open");
    });

    if (cancelButton) {
      cancelButton.focus();
    }
  };

  const clearFavorites = () => {
    favoritesGrid.innerHTML = "";
    syncState();
    closeModal();
  };

  const activateFavoriteButton = (card) => {
    const favoriteButton = card.querySelector(".im-goods__favorite");
    if (!favoriteButton) return;

    favoriteButton.classList.add("is-active");
    favoriteButton.setAttribute("aria-pressed", "true");
  };

  const appendFavoriteCard = (sourceCard) => {
    if (!sourceCard) return;

    const favoriteCard = sourceCard.cloneNode(true);
    activateFavoriteButton(favoriteCard);
    favoritesGrid.append(favoriteCard);
  };

  const usedCards = new Set();
  const recommendCards = getCardsFromSection(recommendSection);
  const recentCards = getCardsFromSection(recentSection);

  appendFavoriteCard(pickRandomCard(recommendCards, usedCards));
  appendFavoriteCard(pickRandomCard(recentCards, usedCards));

  if (favoritesGrid.children.length < 2) {
    const fallbackCards = [...recommendCards, ...recentCards];

    while (favoritesGrid.children.length < 2) {
      const fallbackCard = pickRandomCard(fallbackCards, usedCards);
      if (!fallbackCard) break;
      appendFavoriteCard(fallbackCard);
    }
  }

  syncState();

  favoritesGrid.addEventListener("click", (event) => {
    const favoriteButton = event.target.closest(".im-goods__favorite");
    if (!favoriteButton) return;

    const favoriteCard = favoriteButton.closest(".im-goods__card");
    if (!favoriteCard) return;

    favoriteCard.remove();
    syncState();
  });

  clearButtons.forEach((btn) => {
    btn.addEventListener("click", openModal);
  });

  modalCloseElements.forEach((element) => {
    element.addEventListener("click", closeModal);
  });

  if (cancelButton) {
    cancelButton.addEventListener("click", closeModal);
  }

  if (confirmButton) {
    confirmButton.addEventListener("click", clearFavorites);
  }

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && modal && !modal.hidden) {
      closeModal();
    }
  });

  if (modal) {
    modal.addEventListener("click", (event) => {
      if (event.target === modal) {
        closeModal();
      }
    });
  }
});
