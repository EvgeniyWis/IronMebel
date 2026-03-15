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

  // Show/hide pickup, delivery & transport sections based on delivery selection
  const pickupSection = document.getElementById('pickup-section');
  const deliverySection = document.getElementById('delivery-section');
  const transportSection = document.getElementById('transport-section');
  const deliveryRadios = document.querySelectorAll('input[name="delivery"]');

  if (deliveryRadios.length) {
    deliveryRadios.forEach(radio => {
      radio.addEventListener('change', () => {
        if (pickupSection) {
          pickupSection.style.display = radio.value === 'pickup' && radio.checked ? '' : 'none';
        }
        if (deliverySection) {
          deliverySection.style.display = radio.value === 'moscow' && radio.checked ? '' : 'none';
        }
        if (transportSection) {
          transportSection.style.display = radio.value === 'transport' && radio.checked ? '' : 'none';
        }
      });
    });
  }

  // Transport: address selection
  function initClickableGroup(selector) {
    const items = document.querySelectorAll(selector);
    items.forEach(item => {
      item.addEventListener('click', () => {
        items.forEach(i => i.classList.remove('is-active'));
        item.classList.add('is-active');
      });
    });
  }

  initClickableGroup('.im-checkout-page__transport-address');
  initClickableGroup('.im-checkout-page__transport-company');

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

  // ═══════════════════════════════════════
  // Yandex Maps — Pickup
  // ═══════════════════════════════════════

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

  function initPickupMap() {
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

      placemark.events.add('click', () => {
        selectPickupPoint(index);
        map.setCenter(point.coords, 16, { duration: 300 });
      });

      map.geoObjects.add(placemark);
      return placemark;
    });

    pickupPoints.forEach((pointEl, index) => {
      pointEl.addEventListener('click', () => {
        if (PICKUP_POINTS[index]) {
          map.setCenter(PICKUP_POINTS[index].coords, 16, { duration: 300 });
          placemarks[index].balloon.open();
        }
      });
    });
  }

  // ═══════════════════════════════════════
  // Yandex Maps — Moscow Delivery
  // ═══════════════════════════════════════

  const delivery = {
    addresses: [],
    placemarks: [],
    map: null,
    selected: 0,
    listEl: document.getElementById('delivery-address-list'),
    addBtn: document.getElementById('add-address-btn')
  };

  function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  // Re-render the full address list from data
  function renderDeliveryList() {
    if (!delivery.listEl) return;
    delivery.listEl.innerHTML = '';

    delivery.addresses.forEach((addr, i) => {
      const el = document.createElement('div');
      el.className = 'im-checkout-page__delivery-address';
      if (i === delivery.selected) el.classList.add('is-active');

      el.innerHTML =
        '<span class="im-checkout-page__delivery-address-text">' + escapeHtml(addr.address) + '</span>' +
        '<span class="im-checkout-page__delivery-address-radio"></span>';

      el.addEventListener('click', () => selectDeliveryAddr(i));
      delivery.listEl.appendChild(el);
    });
  }

  // Select address by index: highlight in list + pan map
  function selectDeliveryAddr(index) {
    delivery.selected = index;

    // Update active class
    const els = delivery.listEl.querySelectorAll('.im-checkout-page__delivery-address');
    els.forEach((el, i) => el.classList.toggle('is-active', i === index));

    const addr = delivery.addresses[index];
    if (!addr || !addr.coords || !delivery.map) return;

    delivery.map.setCenter(addr.coords, 16, { duration: 300 });
    if (delivery.placemarks[index]) {
      delivery.placemarks[index].balloon.open();
    }
  }

  // Add a placemark to the delivery map
  function addDeliveryMarker(coords, address, index) {
    if (!delivery.map) return null;

    const placemark = new ymaps.Placemark(coords, {
      balloonContentHeader: 'Адрес доставки',
      balloonContentBody: address
    }, {
      preset: 'islands#redDotIcon'
    });

    placemark.events.add('click', () => selectDeliveryAddr(index));
    delivery.map.geoObjects.add(placemark);
    return placemark;
  }

  // Add a new address — appends to list + map marker (if coords available)
  function pushDeliveryAddress(coords, address) {
    const index = delivery.addresses.length;
    delivery.addresses.push({ coords, address });

    if (coords) {
      const placemark = addDeliveryMarker(coords, address, index);
      delivery.placemarks[index] = placemark;
    }

    delivery.selected = index;
    renderDeliveryList();

    if (coords && delivery.map) {
      delivery.map.setCenter(coords, 16, { duration: 300 });
    }
  }

  function initDeliveryMap() {
    const mapContainer = document.getElementById('delivery-map');
    if (!mapContainer) return;

    delivery.map = new ymaps.Map('delivery-map', {
      center: [55.753220, 37.622513],
      zoom: 11,
      controls: []
    }, {
      suppressMapOpenBlock: true,
      copyrightUc498: false
    });

    delivery.map.behaviors.disable('scrollZoom');
    delivery.map.copyrights.togglePromo();

    // Place markers for all existing addresses that have coords
    delivery.addresses.forEach((addr, i) => {
      if (addr.coords) {
        delivery.placemarks[i] = addDeliveryMarker(addr.coords, addr.address, i);
      }
    });

    // Pan to selected address
    const selected = delivery.addresses[delivery.selected];
    if (selected && selected.coords) {
      delivery.map.setCenter(selected.coords, 14, { duration: 300 });
    }

    // Click on map → reverse geocode → add to list
    delivery.map.events.add('click', (e) => {
      const coords = e.get('coords');
      ymaps.geocode(coords, { results: 1 }).then((res) => {
        const geoObj = res.geoObjects.get(0);
        if (geoObj) {
          pushDeliveryAddress(coords, geoObj.getAddressLine());
        }
      });
    });
  }

  // Read static addresses from HTML (coords from data-lat/data-lng)
  (function initStaticDeliveryAddresses() {
    if (!delivery.listEl) return;
    const staticEls = delivery.listEl.querySelectorAll('.im-checkout-page__delivery-address');

    staticEls.forEach((el, i) => {
      const text = el.querySelector('.im-checkout-page__delivery-address-text').textContent.trim();
      const lat = parseFloat(el.dataset.lat);
      const lng = parseFloat(el.dataset.lng);
      const coords = (!isNaN(lat) && !isNaN(lng)) ? [lat, lng] : null;

      delivery.addresses.push({ coords, address: text });

      el.addEventListener('click', () => selectDeliveryAddr(i));
    });
  })();

  // "Добавить адрес" → show inline input
  let addressInputVisible = false;

  function showAddressInput() {
    if (addressInputVisible || !delivery.addBtn) return;
    addressInputVisible = true;

    const wrapper = document.createElement('div');
    wrapper.className = 'im-checkout-page__delivery-address im-checkout-page__delivery-address--input';

    const input = document.createElement('input');
    input.className = 'im-checkout-page__delivery-address-field';
    input.type = 'text';
    input.placeholder = 'Введите адрес';

    wrapper.appendChild(input);

    // Insert before the add button
    delivery.addBtn.parentNode.insertBefore(wrapper, delivery.addBtn);
    delivery.addBtn.style.display = 'none';
    input.focus();

    function removeInput() {
      addressInputVisible = false;
      wrapper.remove();
      delivery.addBtn.style.display = '';
    }

    function submitAddress() {
      const query = input.value.trim();
      if (!query) {
        removeInput();
        return;
      }

      // Try geocoding, but always add the address regardless
      if (typeof ymaps !== 'undefined') {
        input.disabled = true;

        ymaps.geocode(query, { results: 1 }).then((res) => {
          const geoObj = res.geoObjects.get(0);
          removeInput();
          if (geoObj) {
            pushDeliveryAddress(
              geoObj.geometry.getCoordinates(),
              geoObj.getAddressLine()
            );
          } else {
            // Geocode returned no results — add with user text, no coords
            pushDeliveryAddress(null, query);
          }
        }).catch(() => {
          // Geocoding failed — still add the address
          removeInput();
          pushDeliveryAddress(null, query);
        });
      } else {
        // No ymaps — add address without coords
        removeInput();
        pushDeliveryAddress(null, query);
      }
    }

    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        submitAddress();
      }
      if (e.key === 'Escape') {
        removeInput();
      }
    });

    input.addEventListener('blur', () => {
      // Small delay to allow click events to fire
      setTimeout(() => {
        if (addressInputVisible && !input.value.trim()) {
          removeInput();
        }
      }, 150);
    });
  }

  if (delivery.addBtn) {
    delivery.addBtn.addEventListener('click', showAddressInput);
  }

  // ═══════════════════════════════════════
  // Delivery date picker
  // ═══════════════════════════════════════

  const dateInput = document.getElementById('delivery-date');
  const dateValue = document.getElementById('delivery-date-value');
  const dateField = dateInput ? dateInput.closest('.im-checkout-page__date-field') : null;

  if (dateInput && dateValue) {
    // Click anywhere on the field → open native date picker
    if (dateField) {
      dateField.addEventListener('click', () => {
        if (dateInput.showPicker) {
          dateInput.showPicker();
        } else {
          dateInput.focus();
          dateInput.click();
        }
      });
    }

    dateInput.addEventListener('change', () => {
      if (dateInput.value) {
        const parts = dateInput.value.split('-');
        dateValue.textContent = parts[2] + '.' + parts[1] + '.' + parts[0];
      }
    });
  }

  // ═══════════════════════════════════════
  // Init maps
  // ═══════════════════════════════════════

  if (typeof ymaps !== 'undefined') {
    ymaps.ready(() => {
      initPickupMap();
      initDeliveryMap();
    });
  }
})();
