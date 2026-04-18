(() => {
  const CONTACT_MAP_POINTS = [
    {
      name: "Офис",
      coords: [55.71442, 37.38723],
      address: "Москва, Рябиновая улица, влд. 43Б, к.2",
    },
    {
      name: "Склад",
      coords: [55.714168, 37.38875],
      address: "Москва, Рябиновая улица, влд. 43А, стр. 9",
    },
  ];
  const CONTACT_MAP_CENTER = [55.714294, 37.38799];
  const CONTACT_MAP_ZOOM = 14;

  const copyButtons = document.querySelectorAll("[data-copy-button]");
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

  const initCopyButtons = () => {
    if (!copyButtons.length) return;

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
  };

  const initContactsMap = () => {
    const mapContainer = document.querySelector("[data-contacts-map]");
    if (!(mapContainer instanceof HTMLElement)) return;

    const map = new ymaps.Map(
      "contacts-map",
      {
        center: CONTACT_MAP_CENTER,
        zoom: CONTACT_MAP_ZOOM,
        controls: [],
      },
      {
        suppressMapOpenBlock: true,
        copyrightUc498: false,
      },
    );

    map.behaviors.disable("scrollZoom");
    if (map.copyrights?.togglePromo) {
      map.copyrights.togglePromo();
    }

    CONTACT_MAP_POINTS.forEach((point) => {
      const placemark = new ymaps.Placemark(
        point.coords,
        {
          balloonContentHeader: point.name,
          balloonContentBody: point.address,
        },
        {
          preset: "islands#redDotIcon",
        },
      );

      map.geoObjects.add(placemark);
    });
  };

  initCopyButtons();
  if (typeof ymaps !== "undefined") {
    ymaps.ready(() => {
      initContactsMap();
    });
  }
})();
