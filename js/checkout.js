(() => {
  // Toggle items list
  const toggleBtn = document.querySelector('.im-checkout-page__items-toggle');
  if (toggleBtn) {
    const list = toggleBtn.closest('.im-checkout-page__items-list');
    const textEl = toggleBtn.querySelector('.im-checkout-page__items-toggle-text');

    toggleBtn.addEventListener('click', () => {
      const collapsed = list.classList.toggle('im-checkout-page__items-list--collapsed');
      textEl.textContent = collapsed ? 'Показать' : 'Скрыть';
    });
  }

  // Agreement checkbox → submit button
  const agreeCheckbox = document.querySelector('.im-checkout-page__agree input');
  const submitBtn = document.querySelector('.im-checkout-page__submit-btn');

  if (agreeCheckbox && submitBtn) {
    const updateBtn = () => {
      submitBtn.classList.toggle('im-checkout-page__submit-btn--active', agreeCheckbox.checked);
    };

    updateBtn();
    agreeCheckbox.addEventListener('change', updateBtn);
  }

  // Radio group helper: toggle is-active on parent labels
  function initRadioGroup(groupName, optionSelector) {
    const options = document.querySelectorAll(optionSelector);
    options.forEach(option => {
      const input = option.querySelector('input[type="radio"]');
      if (!input) return;

      input.addEventListener('change', () => {
        options.forEach(o => o.classList.remove('is-active'));
        option.classList.add('is-active');
      });
    });
  }

  initRadioGroup('delivery', '.im-checkout-page__delivery-options .im-checkout-page__radio-option');
  initRadioGroup('payment', '.im-checkout-page__payment-options .im-checkout-page__radio-option');

  // Show/hide pickup section based on delivery selection
  const pickupSection = document.getElementById('pickup-section');
  const deliveryRadios = document.querySelectorAll('input[name="delivery"]');

  if (pickupSection && deliveryRadios.length) {
    deliveryRadios.forEach(radio => {
      radio.addEventListener('change', () => {
        pickupSection.style.display = radio.value === 'pickup' && radio.checked ? '' : 'none';
      });
    });
  }

  // Pickup point selection helper
  const pickupPoints = document.querySelectorAll('.im-checkout-page__pickup-point');

  function selectPickupPoint(index) {
    pickupPoints.forEach(p => p.classList.remove('is-active'));
    if (pickupPoints[index]) {
      pickupPoints[index].classList.add('is-active');
    }
  }

  pickupPoints.forEach((point, index) => {
    point.addEventListener('click', () => selectPickupPoint(index));
  });

  // Yandex Map
  const PICKUP_POINTS = [
    {
      coords: [55.714168, 37.388750],
      name: 'Офис в Москве',
      address: 'ул. Рябиновая, 43А, с1'
    },
    {
      coords: [55.714420, 37.387230],
      name: 'Склад',
      address: 'ул. Рябиновая, 43Б, корпус 2'
    }
  ];

  function initMap() {
    const mapContainer = document.getElementById('checkout-map');
    if (!mapContainer) return;

    const map = new ymaps.Map('checkout-map', {
      center: PICKUP_POINTS[1].coords,
      zoom: 16,
      controls: []
    }, {
      suppressMapOpenBlock: true,
      copyrightUc498: false
    });

    map.behaviors.disable('scrollZoom');
    map.copyrights.togglePromo();

    const placemarks = PICKUP_POINTS.map((point, index) => {
      const placemark = new ymaps.Placemark(point.coords, {
        balloonContentHeader: point.name,
        balloonContentBody: point.address
      }, {
        preset: 'islands#redDotIcon'
      });

      // Click on marker → select corresponding pickup point in list
      placemark.events.add('click', () => {
        selectPickupPoint(index);
        map.setCenter(point.coords, 16, { duration: 300 });
      });

      map.geoObjects.add(placemark);
      return placemark;
    });

    // Click on pickup point in list → pan map & open balloon
    pickupPoints.forEach((pointEl, index) => {
      pointEl.addEventListener('click', () => {
        if (PICKUP_POINTS[index]) {
          map.setCenter(PICKUP_POINTS[index].coords, 16, { duration: 300 });
          placemarks[index].balloon.open();
        }
      });
    });
  }

  if (typeof ymaps !== 'undefined') {
    ymaps.ready(initMap);
  }
})();
