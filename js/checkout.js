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

  // Buyer & recipient party cards
  function initPartyCards(radioName) {
    const radios = document.querySelectorAll('input[name="' + radioName + '"]');
    radios.forEach(function(radio) {
      radio.addEventListener('change', function() {
        radios.forEach(function(r) {
          var card = r.closest('.im-checkout-page__party-card');
          if (card) card.classList.remove('is-active');
        });
        var activeCard = radio.closest('.im-checkout-page__party-card');
        if (activeCard) activeCard.classList.add('is-active');
      });
    });
  }

  initPartyCards('buyer');
  initPartyCards('recipient');

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
  // Transport — "Добавить адрес" inline input
  // ═══════════════════════════════════════

  const transportAddBtn = document.getElementById('add-transport-address-btn');
  const transportAddressList = document.querySelector('.im-checkout-page__transport-addresses');
  let transportInputVisible = false;

  function addTransportAddress(text) {
    if (!transportAddressList) return;

    const el = document.createElement('div');
    el.className = 'im-checkout-page__transport-address';
    el.innerHTML =
      '<span class="im-checkout-page__transport-address-text">' + escapeHtml(text) + '</span>' +
      '<span class="im-checkout-page__transport-address-radio"></span>';

    // Select on click
    el.addEventListener('click', () => {
      transportAddressList.querySelectorAll('.im-checkout-page__transport-address').forEach(a => a.classList.remove('is-active'));
      el.classList.add('is-active');
    });

    transportAddressList.appendChild(el);

    // Select the newly added address
    transportAddressList.querySelectorAll('.im-checkout-page__transport-address').forEach(a => a.classList.remove('is-active'));
    el.classList.add('is-active');
  }

  function showTransportAddressInput() {
    if (transportInputVisible || !transportAddBtn) return;
    transportInputVisible = true;

    const wrapper = document.createElement('div');
    wrapper.className = 'im-checkout-page__transport-address im-checkout-page__delivery-address--input';

    const input = document.createElement('input');
    input.className = 'im-checkout-page__delivery-address-field';
    input.type = 'text';
    input.placeholder = 'Введите адрес';

    wrapper.appendChild(input);

    transportAddBtn.parentNode.insertBefore(wrapper, transportAddBtn);
    transportAddBtn.style.display = 'none';
    input.focus();

    function removeInput() {
      transportInputVisible = false;
      wrapper.remove();
      transportAddBtn.style.display = '';
    }

    function submitAddress() {
      const query = input.value.trim();
      if (!query) {
        removeInput();
        return;
      }
      removeInput();
      addTransportAddress(query);
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
      setTimeout(() => {
        if (transportInputVisible && !input.value.trim()) {
          removeInput();
        }
      }, 150);
    });
  }

  if (transportAddBtn) {
    transportAddBtn.addEventListener('click', showTransportAddressInput);
  }

  // ═══════════════════════════════════════
  // Promo code
  // ═══════════════════════════════════════

  const VALID_PROMOS = {
    'SALE50': { discount: 50, label: 'Скидка -50% применена' }
  };

  const promoContainer = document.querySelector('.im-checkout-page__promo');
  const promoInput = document.getElementById('promo-input');
  const promoClear = document.querySelector('.im-checkout-page__promo-clear');
  const promoSubmit = document.querySelector('.im-checkout-page__promo-submit');
  const promoMessage = document.querySelector('.im-checkout-page__promo-message');

  if (promoContainer && promoInput) {
    function updatePromoHasValue() {
      const hasValue = promoInput.value.trim().length > 0;
      promoContainer.classList.toggle('im-checkout-page__promo--has-value', hasValue);
    }

    function resetPromoState() {
      promoContainer.classList.remove(
        'im-checkout-page__promo--applied',
        'im-checkout-page__promo--error'
      );
      promoMessage.textContent = '';
    }

    function applyPromo() {
      const code = promoInput.value.trim().toUpperCase();
      if (!code) return;

      resetPromoState();

      const promo = VALID_PROMOS[code];
      if (promo) {
        promoContainer.classList.add('im-checkout-page__promo--applied');
        promoMessage.textContent = promo.label;
      } else {
        promoContainer.classList.add('im-checkout-page__promo--error');
        promoMessage.textContent = 'Промокод не найден';
      }
    }

    function clearPromo() {
      promoInput.value = '';
      resetPromoState();
      updatePromoHasValue();
      promoInput.focus();
    }

    promoInput.addEventListener('input', () => {
      resetPromoState();
      updatePromoHasValue();
    });

    promoInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        applyPromo();
      }
    });

    promoSubmit.addEventListener('click', applyPromo);
    promoClear.addEventListener('click', clearPromo);

    updatePromoHasValue();
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

  // ═══════════════════════════════════════
  // Organization modal
  // ═══════════════════════════════════════

  const orgModal = document.querySelector('[data-org-modal]');
  if (orgModal) {
    const panel = orgModal.querySelector('.im-org-modal__panel');
    const subtitle = orgModal.querySelector('[data-org-subtitle]');

    // Step elements
    const steps = {
      inn: orgModal.querySelector('[data-org-step="inn"]'),
      branchInn: orgModal.querySelector('[data-org-step="branch-inn"]'),
      address: orgModal.querySelector('[data-org-step="address"]'),
      bank: orgModal.querySelector('[data-org-step="bank"]')
    };

    // Inputs
    const innInput = orgModal.querySelector('[data-org-inn]');
    const branchInnInput = orgModal.querySelector('[data-org-branch-inn]');
    const branchKppInput = orgModal.querySelector('[data-org-branch-kpp]');
    const legalAddressInput = orgModal.querySelector('[data-org-legal-address]');
    const actualAddressInput = orgModal.querySelector('[data-org-actual-address]');
    const sameAddressCheckbox = orgModal.querySelector('[data-org-same-address]');
    const suggestionsEl = orgModal.querySelector('[data-org-suggestions]');

    // Buttons
    const innNextBtn = orgModal.querySelector('[data-org-inn-next]');
    const branchInnNextBtn = orgModal.querySelector('[data-org-branch-inn-next]');
    const addressNextBtn = orgModal.querySelector('[data-org-address-next]');
    const backAddressBtn = orgModal.querySelector('[data-org-back-address]');
    const orgSubmitBtn = orgModal.querySelector('[data-org-submit]');

    // State
    let currentStep = 'inn';
    let orgData = {};
    let isBranch = false;

    // Demo: mock org data by INN
    const MOCK_ORGS = {
      '2310119892': {
        name: 'ООО "АФФИНИТИ ИНДЕКС"',
        inn: '23101198925',
        kpp: '231001001',
        address: 'г Краснодар, ул Красноармейская, д 55/1, офис 50'
      }
    };

    function openModal() {
      orgModal.classList.add('is-open');
      document.body.style.overflow = 'hidden';
      resetModal();
      innInput.focus();
    }

    function closeModal() {
      orgModal.classList.remove('is-open');
      document.body.style.overflow = '';
    }

    function resetModal() {
      orgData = {};
      isBranch = false;
      currentStep = 'inn';

      // Clear inputs
      innInput.value = '';
      branchInnInput.value = '';
      branchKppInput.value = '';
      legalAddressInput.value = '';
      actualAddressInput.value = '';
      sameAddressCheckbox.checked = false;
      actualAddressInput.closest('.im-org-modal__field').style.display = '';

      orgModal.querySelectorAll('[data-org-account], [data-org-bik], [data-org-bank-name-input], [data-org-corr-account]').forEach(function(input) {
        input.value = '';
      });

      innNextBtn.disabled = true;
      branchInnNextBtn.disabled = true;
      suggestionsEl.classList.remove('is-visible');
      suggestionsEl.innerHTML = '';

      showStep('inn');
      subtitle.textContent = 'Укажите ИНН организации или ИП';
    }

    function showStep(step) {
      Object.keys(steps).forEach(function(key) {
        if (steps[key]) steps[key].hidden = true;
      });
      if (steps[step]) steps[step].hidden = false;
      currentStep = step;
    }

    function fillOrgInfo(stepEl) {
      var nameEl = stepEl.querySelector('[data-org-info-name], [data-org-bank-name]');
      var innEl = stepEl.querySelector('[data-org-info-inn], [data-org-bank-inn]');
      var kppEl = stepEl.querySelector('[data-org-info-kpp], [data-org-bank-kpp]');
      if (nameEl) nameEl.textContent = orgData.name || '';
      if (innEl) innEl.textContent = orgData.inn || '';
      if (kppEl) kppEl.textContent = orgData.kpp || '';
    }

    // Build and show suggestions dropdown
    function showSuggestions(inn) {
      suggestionsEl.innerHTML = '';

      var matches = Object.keys(MOCK_ORGS).map(function(key) {
        return MOCK_ORGS[key];
      });

      matches.forEach(function(org) {
        var btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'im-org-modal__suggestion';
        btn.innerHTML =
          '<span class="im-org-modal__suggestion-name">' + escapeHtml(org.name) + '</span>' +
          '<span class="im-org-modal__suggestion-details">ИНН: ' + escapeHtml(org.inn) + ', КПП: ' + escapeHtml(org.kpp) + '</span>' +
          '<span class="im-org-modal__suggestion-address">' + escapeHtml(org.address) + '</span>';

        btn.addEventListener('click', function() {
          orgData = {
            name: org.name,
            inn: org.inn,
            kpp: org.kpp,
            legalAddress: org.address
          };
          isBranch = false;
          goToAddress();
        });

        suggestionsEl.appendChild(btn);
      });

      // Add "Другой филиал" option
      var branchBtn = document.createElement('button');
      branchBtn.type = 'button';
      branchBtn.className = 'im-org-modal__suggestion im-org-modal__suggestion--branch';
      branchBtn.innerHTML =
        '<span class="im-org-modal__suggestion-name">Другой филиал</span>' +
        '<span class="im-org-modal__suggestion-details">Выберите, если ИНН введен правильно, но вашего филиала нет в списке</span>';

      branchBtn.addEventListener('click', function() {
        isBranch = true;
        orgData.inn = inn;
        branchInnInput.value = inn;
        branchKppInput.value = '';
        branchInnNextBtn.disabled = true;
        subtitle.textContent = 'Укажите ИНН организации или ИП';
        showStep('branchInn');
        branchKppInput.focus();
      });

      suggestionsEl.appendChild(branchBtn);
      suggestionsEl.classList.add('is-visible');
    }

    // INN input → enable/disable next + show suggestions on typing
    innInput.addEventListener('input', function() {
      var val = innInput.value.replace(/\D/g, '');
      innInput.value = val;
      innNextBtn.disabled = val.length < 10;

      if (val.length >= 10) {
        showSuggestions(val);
      } else {
        suggestionsEl.classList.remove('is-visible');
        suggestionsEl.innerHTML = '';
      }
    });

    // "Продолжить" — if no suggestions matched, go to branch flow
    innNextBtn.addEventListener('click', function() {
      var inn = innInput.value.trim();
      if (inn.length < 10) return;

      if (suggestionsEl.classList.contains('is-visible')) return;

      isBranch = true;
      orgData.inn = inn;
      branchInnInput.value = inn;
      branchKppInput.value = '';
      branchInnNextBtn.disabled = true;
      subtitle.textContent = 'Укажите ИНН организации или ИП';
      showStep('branchInn');
      branchKppInput.focus();
    });

    // Branch INN step
    branchKppInput.addEventListener('input', function() {
      var val = branchKppInput.value.replace(/\D/g, '');
      branchKppInput.value = val;
      branchInnNextBtn.disabled = val.length < 9;
    });

    branchInnNextBtn.addEventListener('click', function() {
      orgData.kpp = branchKppInput.value.trim();
      var foundOrg = null;
      Object.keys(MOCK_ORGS).forEach(function(key) {
        if (orgData.inn.indexOf(key) === 0 || key.indexOf(orgData.inn) === 0) {
          foundOrg = MOCK_ORGS[key];
        }
      });
      orgData.name = foundOrg ? foundOrg.name : 'Организация ИНН ' + orgData.inn;
      orgData.legalAddress = foundOrg ? foundOrg.address : '';
      goToAddress();
    });

    var addressInfoEl = orgModal.querySelector('[data-org-address-info]');
    var addressNameField = orgModal.querySelector('[data-org-address-name-field]');
    var orgNameInput = orgModal.querySelector('[data-org-name]');

    function goToAddress() {
      legalAddressInput.value = orgData.legalAddress || '';
      actualAddressInput.value = '';
      sameAddressCheckbox.checked = false;
      actualAddressInput.closest('.im-org-modal__field').style.display = '';

      if (isBranch) {
        subtitle.textContent = 'Укажите наименование организации и адрес';
        addressInfoEl.hidden = true;
        addressNameField.hidden = false;
        orgNameInput.value = orgData.name || '';
      } else {
        subtitle.textContent = 'Укажите адрес организации';
        addressInfoEl.hidden = false;
        addressNameField.hidden = true;
        fillOrgInfo(steps.address);
      }

      showStep('address');
    }

    // "Совпадает с фактическим" checkbox
    sameAddressCheckbox.addEventListener('change', function() {
      var field = actualAddressInput.closest('.im-org-modal__field');
      if (sameAddressCheckbox.checked) {
        actualAddressInput.value = legalAddressInput.value;
        field.style.display = 'none';
      } else {
        actualAddressInput.value = '';
        field.style.display = '';
      }
    });

    // Address → Bank
    addressNextBtn.addEventListener('click', function() {
      if (isBranch && orgNameInput) {
        orgData.name = orgNameInput.value.trim();
      }
      orgData.legalAddress = legalAddressInput.value.trim();
      orgData.actualAddress = sameAddressCheckbox.checked
        ? orgData.legalAddress
        : actualAddressInput.value.trim();

      subtitle.textContent = 'Укажите банковские реквизиты';
      fillOrgInfo(steps.bank);
      showStep('bank');
    });

    // Back buttons
    orgModal.querySelector('[data-org-cancel]').addEventListener('click', closeModal);
    orgModal.querySelector('[data-org-modal-close]').addEventListener('click', closeModal);

    orgModal.querySelector('[data-org-back="inn"]').addEventListener('click', function() {
      subtitle.textContent = 'Укажите ИНН организации или ИП';
      showStep('inn');
    });

    backAddressBtn.addEventListener('click', function() {
      if (isBranch) {
        subtitle.textContent = 'Укажите ИНН организации или ИП';
        showStep('branchInn');
      } else {
        subtitle.textContent = 'Укажите ИНН организации или ИП';
        showStep('inn');
      }
    });

    orgModal.querySelector('[data-org-back="address"]').addEventListener('click', function() {
      subtitle.textContent = "Укажите адрес организации";
      showStep('address');
    });

    // Submit → add org card
    orgSubmitBtn.addEventListener('click', function() {
      orgData.account = orgModal.querySelector('[data-org-account]').value.trim();
      orgData.bik = orgModal.querySelector('[data-org-bik]').value.trim();
      orgData.bankName = orgModal.querySelector('[data-org-bank-name-input]').value.trim();
      orgData.corrAccount = orgModal.querySelector('[data-org-corr-account]').value.trim();

      var buyerCards = document.querySelector('.im-checkout-page__parties .im-checkout-page__party-cards');
      if (buyerCards) {
        var addBtn = buyerCards.querySelector('.im-checkout-page__party-add');
        var cardCount = buyerCards.querySelectorAll('.im-checkout-page__party-card').length;
        var newValue = String(cardCount + 1);

        var card = document.createElement('label');
        card.className = 'im-checkout-page__party-card';

        var radio = document.createElement('input');
        radio.type = 'radio';
        radio.name = 'buyer';
        radio.value = newValue;

        var info = document.createElement('span');
        info.className = 'im-checkout-page__party-card-info';
        info.innerHTML =
          '<span class="im-checkout-page__party-card-name">' + escapeHtml(orgData.name) + '</span>' +
          '<span class="im-checkout-page__party-card-detail">ИНН: ' + escapeHtml(orgData.inn) + '</span>';

        var radioMark = document.createElement('span');
        radioMark.className = 'im-checkout-page__party-card-radio';

        card.appendChild(radio);
        card.appendChild(info);
        card.appendChild(radioMark);

        buyerCards.insertBefore(card, addBtn);

        buyerCards.querySelectorAll('.im-checkout-page__party-card').forEach(function(c) {
          c.classList.remove('is-active');
        });
        card.classList.add('is-active');
        radio.checked = true;

        initPartyCards('buyer');
      }

      closeModal();
    });

    // Close on Escape
    document.addEventListener('keydown', function(e) {
      if (e.key === 'Escape' && orgModal.classList.contains('is-open')) {
        closeModal();
      }
    });

    panel.addEventListener('click', function(e) {
      e.stopPropagation();
    });

    // Open modal from "Добавить организацию" button
    var addOrgBtns = document.querySelectorAll('.im-checkout-page__party-add');
    if (addOrgBtns.length > 0) {
      addOrgBtns[0].addEventListener('click', openModal);
    }
  }

  // ═══════════════════════════════════════
  // Recipient modal
  // ═══════════════════════════════════════

  const recipientModal = document.querySelector('[data-recipient-modal]');
  if (recipientModal) {
    const recipientPanel = recipientModal.querySelector('.im-org-modal__panel');
    const recipientNameInput = recipientModal.querySelector('[data-recipient-name]');
    const recipientPhoneInput = recipientModal.querySelector('[data-recipient-phone]');
    const recipientEmailInput = recipientModal.querySelector('[data-recipient-email]');

    function openRecipientModal() {
      recipientModal.classList.add('is-open');
      document.body.style.overflow = 'hidden';
      recipientNameInput.value = '';
      recipientPhoneInput.value = '+7';
      recipientEmailInput.value = '';
      recipientNameInput.focus();
    }

    function closeRecipientModal() {
      recipientModal.classList.remove('is-open');
      document.body.style.overflow = '';
    }

    recipientModal.querySelector('[data-recipient-cancel]').addEventListener('click', closeRecipientModal);
    recipientModal.querySelector('[data-recipient-modal-close]').addEventListener('click', closeRecipientModal);

    recipientPanel.addEventListener('click', function(e) {
      e.stopPropagation();
    });

    document.addEventListener('keydown', function(e) {
      if (e.key === 'Escape' && recipientModal.classList.contains('is-open')) {
        closeRecipientModal();
      }
    });

    recipientModal.querySelector('[data-recipient-submit]').addEventListener('click', function() {
      var name = recipientNameInput.value.trim();
      var phone = recipientPhoneInput.value.trim();
      var email = recipientEmailInput.value.trim();

      if (!name) {
        recipientNameInput.focus();
        return;
      }

      var recipientParty = document.querySelectorAll('.im-checkout-page__party')[1];
      if (recipientParty) {
        var cardsContainer = recipientParty.querySelector('.im-checkout-page__party-cards');
        var addBtn = cardsContainer.querySelector('.im-checkout-page__party-add');
        var cardCount = cardsContainer.querySelectorAll('.im-checkout-page__party-card').length;
        var newValue = String(cardCount + 1);

        var card = document.createElement('label');
        card.className = 'im-checkout-page__party-card im-checkout-page__party-card-gruzo';

        var radio = document.createElement('input');
        radio.type = 'radio';
        radio.name = 'recipient';
        radio.value = newValue;

        var info = document.createElement('span');
        info.className = 'im-checkout-page__party-card-info';

        var detailsHtml = '';
        if (phone && phone !== '+7') {
          detailsHtml += '<span class="im-checkout-page__party-card-detail">' + escapeHtml(phone) + '</span>';
        }
        if (email) {
          detailsHtml += '<span class="im-checkout-page__party-card-detail">' + escapeHtml(email) + '</span>';
        }

        info.innerHTML =
          '<span class="im-checkout-page__party-card-name">' + escapeHtml(name) + '</span>' +
          (detailsHtml ? '<span class="im-checkout-page__party-card-details">' + detailsHtml + '</span>' : '');

        var radioMark = document.createElement('span');
        radioMark.className = 'im-checkout-page__party-card-radio';

        card.appendChild(radio);
        card.appendChild(info);
        card.appendChild(radioMark);

        cardsContainer.insertBefore(card, addBtn);

        cardsContainer.querySelectorAll('.im-checkout-page__party-card').forEach(function(c) {
          c.classList.remove('is-active');
        });
        card.classList.add('is-active');
        radio.checked = true;

        initPartyCards('recipient');
      }

      closeRecipientModal();
    });

    // Open from "Добавить грузополучателя" button (second party-add button)
    var allPartyAddBtns = document.querySelectorAll('.im-checkout-page__party-add');
    if (allPartyAddBtns.length > 1) {
      allPartyAddBtns[1].addEventListener('click', openRecipientModal);
    }
  }
})();
