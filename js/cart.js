(function () {
  var MOBILE_MAX_WIDTH = 600;
  var mediaQuery = window.matchMedia("(max-width: 600px)");
  var extrasSliderRetryCount = 0;
  var extrasSliders = new WeakMap();

  var NAV_ARROW_SVG =
    '<svg width="5" height="11" viewBox="0 0 5 11" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M0.895488 0.0184698C0.707989 -0.0197801 0.506239 -0.00328014 0.334489 0.11222C-0.00826 0.341719 -0.104259 0.821722 0.124491 1.16672L2.83348 5.24447L0.124491 9.32295C-0.104259 9.6672 -0.00826 10.148 0.334489 10.3775C0.677988 10.607 1.15649 10.5109 1.38524 10.1667L4.37472 5.66671C4.54197 5.41471 4.54197 5.07496 4.37472 4.82296L1.38524 0.322973C1.27124 0.150474 1.08299 0.0559697 0.895488 0.0184698Z" fill="#222222"/></svg>';

  function ensureExtrasWrapper(list) {
    if (
      list.parentElement &&
      list.parentElement.classList.contains("im-cart-page__extras-wrapper")
    ) {
      return list.parentElement;
    }

    var wrapper = document.createElement("div");
    wrapper.className = "im-cart-page__extras-wrapper";
    list.parentNode.insertBefore(wrapper, list);
    wrapper.appendChild(list);

    var prevBtn = document.createElement("button");
    prevBtn.className = "im-cart-page__extras-nav im-cart-page__extras-nav--prev";
    prevBtn.type = "button";
    prevBtn.setAttribute("aria-label", "Назад");
    prevBtn.innerHTML = NAV_ARROW_SVG;

    var nextBtn = document.createElement("button");
    nextBtn.className = "im-cart-page__extras-nav im-cart-page__extras-nav--next";
    nextBtn.type = "button";
    nextBtn.setAttribute("aria-label", "Вперёд");
    nextBtn.innerHTML = NAV_ARROW_SVG;

    wrapper.appendChild(prevBtn);
    wrapper.appendChild(nextBtn);

    return wrapper;
  }

  function updateSliderNavVisibility(wrapper, slider) {
    if (!wrapper || !slider) return;

    var prevBtn = wrapper.querySelector(".im-cart-page__extras-nav--prev");
    var nextBtn = wrapper.querySelector(".im-cart-page__extras-nav--next");
    if (!prevBtn || !nextBtn) return;
    var list = wrapper.querySelector(".im-cart-page__extras-list");
    if (list && list.classList.contains("im-cart-page__extras-list--hidden")) {
      prevBtn.classList.remove("im-cart-page__extras-nav--visible");
      nextBtn.classList.remove("im-cart-page__extras-nav--visible");
      return;
    }

    var details = slider.track.details;
    if (!details || !details.slides || details.slides.length === 0) return;

    prevBtn.classList.toggle(
      "im-cart-page__extras-nav--visible",
      details.rel > 0,
    );
    nextBtn.classList.toggle(
      "im-cart-page__extras-nav--visible",
      details.rel < details.slides.length - 2,
    );
  }

  function updateScrollNavVisibility(wrapper, list) {
    if (!wrapper || !list) return;

    var prevBtn = wrapper.querySelector(".im-cart-page__extras-nav--prev");
    var nextBtn = wrapper.querySelector(".im-cart-page__extras-nav--next");
    if (!prevBtn || !nextBtn) return;
    if (list.classList.contains("im-cart-page__extras-list--hidden")) {
      prevBtn.classList.remove("im-cart-page__extras-nav--visible");
      nextBtn.classList.remove("im-cart-page__extras-nav--visible");
      return;
    }

    prevBtn.classList.toggle(
      "im-cart-page__extras-nav--visible",
      list.scrollLeft > 1,
    );
    nextBtn.classList.toggle(
      "im-cart-page__extras-nav--visible",
      list.scrollLeft < list.scrollWidth - list.clientWidth - 1,
    );
  }

  function hideWrapperNav(list) {
    var wrapper = list.closest(".im-cart-page__extras-wrapper");
    if (!wrapper) return;

    wrapper
      .querySelectorAll(".im-cart-page__extras-nav")
      .forEach(function (btn) {
        btn.classList.remove("im-cart-page__extras-nav--visible");
      });
  }

  function buildMobileItem() {
    var container = document.createElement("div");
    container.innerHTML = `<div class="im-cart-page__item im-cart-page__item--mobile">
  <label class="im-cart-page__item-check">
    <input type="checkbox" checked />
  </label>

  <div class="im-cart-page__item-image">
    <img src="./images/catalogue/mock_catalogue_item_white_bg.png" alt="Металлический стеллаж Ironmebel PRO SGM-2000" />
  </div>

  <div class="im-cart-page__item-body">
    <a class="im-cart-page__item-name" href="#">Металлический стеллаж Ironmebel PRO SGM-2000</a>
    <span class="im-cart-page__item-code">Код товара: <span>00-00507877</span></span>
    <div class="im-cart-page__item-prices">
      <span class="im-cart-page__item-price">48 900 ₽</span>
      <span class="im-cart-page__item-old-price">59 900 ₽</span>
    </div>
  </div>

  <div class="im-cart-page__item-mobile-block">
    <div class="im-cart-page__item-bottom">
      <div class="im-cart-page__item-actions">
        <button class="im-cart-page__item-action" type="button" aria-label="В избранное">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M1.5 0C0.67155 0 0 0.671249 0 1.5V4.49999C0 5.32874 0.67155 5.99999 1.5 5.99999H4.5C5.32875 5.99999 6 5.32874 6 4.49999V1.5C6 0.671249 5.32875 0 4.5 0H1.5ZM9 0C8.17125 0 7.5 0.671249 7.5 1.5V4.49999C7.5 5.32874 8.17125 5.99999 9 5.99999H12C12.8287 5.99999 13.5 5.32874 13.5 4.49999V1.5C13.5 0.671249 12.8287 0 12 0H9ZM1.5 1.5H4.5V4.49999H1.5V1.5ZM9 1.5H12V4.49999H9V1.5ZM1.5 7.49999C0.67155 7.49999 0 8.17124 0 8.99999V12C0 12.8287 0.67155 13.5 1.5 13.5H4.5C5.32875 13.5 6 12.8287 6 12V8.99999C6 8.17124 5.32875 7.49999 4.5 7.49999H1.5ZM9 7.49999C8.17125 7.49999 7.5 8.17124 7.5 8.99999V12C7.5 12.8287 8.17125 13.5 9 13.5H12C12.8287 13.5 13.5 12.8287 13.5 12V8.99999C13.5 8.17124 12.8287 7.49999 12 7.49999H9ZM1.5 8.99999H4.5V12H1.5V8.99999ZM9 8.99999H12V12H9V8.99999Z" fill="#111111" />
          </svg>
        </button>
        <button class="im-cart-page__item-action" type="button" aria-label="Удалить">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M1.5 0C0.67155 0 0 0.671249 0 1.5V4.49999C0 5.32874 0.67155 5.99999 1.5 5.99999H4.5C5.32875 5.99999 6 5.32874 6 4.49999V1.5C6 0.671249 5.32875 0 4.5 0H1.5ZM9 0C8.17125 0 7.5 0.671249 7.5 1.5V4.49999C7.5 5.32874 8.17125 5.99999 9 5.99999H12C12.8287 5.99999 13.5 5.32874 13.5 4.49999V1.5C13.5 0.671249 12.8287 0 12 0H9ZM1.5 1.5H4.5V4.49999H1.5V1.5ZM9 1.5H12V4.49999H9V1.5ZM1.5 7.49999C0.67155 7.49999 0 8.17124 0 8.99999V12C0 12.8287 0.67155 13.5 1.5 13.5H4.5C5.32875 13.5 6 12.8287 6 12V8.99999C6 8.17124 5.32875 7.49999 4.5 7.49999H1.5ZM9 7.49999C8.17125 7.49999 7.5 8.17124 7.5 8.99999V12C7.5 12.8287 8.17125 13.5 9 13.5H12C12.8287 13.5 13.5 12.8287 13.5 12V8.99999C13.5 8.17124 12.8287 7.49999 12 7.49999H9ZM1.5 8.99999H4.5V12H1.5V8.99999ZM9 8.99999H12V12H9V8.99999Z" fill="#111111" />
          </svg>
        </button>
      </div>

      <div class="im-cart-page__item-quantity">
        <button class="im-cart-page__item-quantity-btn" type="button" aria-label="Уменьшить">
          <svg width="14" height="3" viewBox="0 0 14 3" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M1.25 0C0.559644 0 0 0.559644 0 1.25C0 1.94036 0.559644 2.5 1.25 2.5H12.0833C12.7737 2.5 13.3333 1.94036 13.3333 1.25C13.3333 0.559644 12.7737 0 12.0833 0H1.25Z" fill="#666"/></svg>
        </button>
        <input class="im-cart-page__item-quantity-input" type="text" value="1" />
        <button class="im-cart-page__item-quantity-btn" type="button" aria-label="Увеличить">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M1.25 5.41667C0.559644 5.41667 0 5.97631 0 6.66667C0 7.35702 0.559644 7.91667 1.25 7.91667H12.0833C12.7737 7.91667 13.3333 7.35702 13.3333 6.66667C13.3333 5.97631 12.7737 5.41667 12.0833 5.41667H1.25Z" fill="#111"/><path d="M6.66667 0C5.97631 0 5.41667 0.559644 5.41667 1.25V12.0833C5.41667 12.7737 5.97631 13.3333 6.66667 13.3333C7.35702 13.3333 7.91667 12.7737 7.91667 12.0833V1.25C7.91667 0.559644 7.35702 0 6.66667 0Z" fill="#111"/></svg>
        </button>
      </div>
    </div>

    <div class="im-cart-page__extras">
      <div class="im-cart-page__extras-header">
        <span class="im-cart-page__extras-title">Комплектация</span>
        <button class="im-cart-page__extras-toggle" type="button" aria-label="Показать комплектацию">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M1.5 0C0.67155 0 0 0.671249 0 1.5V4.49999C0 5.32874 0.67155 5.99999 1.5 5.99999H4.5C5.32875 5.99999 6 5.32874 6 4.49999V1.5C6 0.671249 5.32875 0 4.5 0H1.5ZM9 0C8.17125 0 7.5 0.671249 7.5 1.5V4.49999C7.5 5.32874 8.17125 5.99999 9 5.99999H12C12.8287 5.99999 13.5 5.32874 13.5 4.49999V1.5C13.5 0.671249 12.8287 0 12 0H9ZM1.5 1.5H4.5V4.49999H1.5V1.5ZM9 1.5H12V4.49999H9V1.5ZM1.5 7.49999C0.67155 7.49999 0 8.17124 0 8.99999V12C0 12.8287 0.67155 13.5 1.5 13.5H4.5C5.32875 13.5 6 12.8287 6 12V8.99999C6 8.17124 5.32875 7.49999 4.5 7.49999H1.5ZM9 7.49999C8.17125 7.49999 7.5 8.17124 7.5 8.99999V12C7.5 12.8287 8.17125 13.5 9 13.5H12C12.8287 13.5 13.5 12.8287 13.5 12V8.99999C13.5 8.17124 12.8287 7.49999 12 7.49999H9ZM1.5 8.99999H4.5V12H1.5V8.99999ZM9 8.99999H12V12H9V8.99999Z" fill="#666666"/>
          </svg>
        </button>
      </div>
      <div class="im-cart-page__extras-list im-cart-page__extras-list--mobile">
        <div class="im-cart-page__extras-card">
          <div class="im-cart-page__extras-card-image">
            <img src="./images/catalogue/mock_catalogue_item_white_bg.png" alt="Металлический стеллаж Ironmebel PR..." />
          </div>
          <div class="im-cart-page__extras-card-body">
            <span class="im-cart-page__extras-card-name">Металлический стеллаж Ironmebel PR...</span>
            <div class="im-cart-page__extras-card-bottom">
              <span class="im-cart-page__extras-card-price">48 900 ₽</span>
              <span class="im-cart-page__extras-card-old-price">59 900 ₽</span>
              <div class="im-cart-page__quantity im-cart-page__quantity--sm">
                <button class="im-cart-page__quantity-btn" type="button" aria-label="Уменьшить">
                  <svg width="14" height="3" viewBox="0 0 14 3" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M1.25 0C0.559644 0 0 0.559644 0 1.25C0 1.94036 0.559644 2.5 1.25 2.5H12.0833C12.7737 2.5 13.3333 1.94036 13.3333 1.25C13.3333 0.559644 12.7737 0 12.0833 0H1.25Z" fill="#666"/></svg>
                </button>
                <input class="im-cart-page__quantity-input" type="text" value="1" />
                <button class="im-cart-page__quantity-btn" type="button" aria-label="Увеличить">
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M1.25 5.41667C0.559644 5.41667 0 5.97631 0 6.66667C0 7.35702 0.559644 7.91667 1.25 7.91667H12.0833C12.7737 7.91667 13.3333 7.35702 13.3333 6.66667C13.3333 5.97631 12.7737 5.41667 12.0833 5.41667H1.25Z" fill="#111"/><path d="M6.66667 0C5.97631 0 5.41667 0.559644 5.41667 1.25V12.0833C5.41667 12.7737 5.97631 13.3333 6.66667 13.3333C7.35702 13.3333 7.91667 12.7737 7.91667 12.0833V1.25C7.91667 0.559644 7.35702 0 6.66667 0Z" fill="#111"/></svg>
                </button>
              </div>
            </div>
          </div>
        </div>

        <div class="im-cart-page__extras-card">
          <button class="im-cart-page__extras-card-grid" type="button" aria-label="Комплектация">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M1.5 0C0.67155 0 0 0.671249 0 1.5V4.5C0 5.32875 0.67155 6 1.5 6H4.5C5.32875 6 6 5.32875 6 4.5V1.5C6 0.671249 5.32875 0 4.5 0H1.5ZM9 0C8.17125 0 7.5 0.671249 7.5 1.5V4.5C7.5 5.32875 8.17125 6 9 6H12C12.8287 6 13.5 5.32875 13.5 4.5V1.5C13.5 0.671249 12.8287 0 12 0H9ZM1.5 1.5H4.5V4.5H1.5V1.5ZM9 1.5H12V4.5H9V1.5ZM1.5 7.5C0.67155 7.5 0 8.17125 0 9V12C0 12.8287 0.67155 13.5 1.5 13.5H4.5C5.32875 13.5 6 12.8287 6 12V9C6 8.17125 5.32875 7.5 4.5 7.5H1.5ZM9 7.5C8.17125 7.5 7.5 8.17125 7.5 9V12C7.5 12.8287 8.17125 13.5 9 13.5H12C12.8287 13.5 13.5 12.8287 13.5 12V9C13.5 8.17125 12.8287 7.5 12 7.5H9ZM1.5 9H4.5V12H1.5V9ZM9 9H12V12H9V9Z" fill="#222"/>
            </svg>
          </button>
          <div class="im-cart-page__extras-card-image">
            <img src="./images/catalogue/mock_catalogue_item_white_bg.png" alt="Шкаф металлический Secure для хранения инст..." />
          </div>
          <div class="im-cart-page__extras-card-body">
            <span class="im-cart-page__extras-card-name">Шкаф металлический Secure для хранения инст...</span>
            <div class="im-cart-page__extras-card-bottom">
              <span class="im-cart-page__extras-card-price">48 900 ₽</span>
              <span class="im-cart-page__extras-card-old-price">59 900 ₽</span>
              <div class="im-cart-page__quantity im-cart-page__quantity--sm">
                <button class="im-cart-page__quantity-btn" type="button" aria-label="Уменьшить">
                  <svg width="14" height="3" viewBox="0 0 14 3" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M1.25 0C0.559644 0 0 0.559644 0 1.25C0 1.94036 0.559644 2.5 1.25 2.5H12.0833C12.7737 2.5 13.3333 1.94036 13.3333 1.25C13.3333 0.559644 12.7737 0 12.0833 0H1.25Z" fill="#666"/></svg>
                </button>
                <input class="im-cart-page__quantity-input" type="text" value="1" />
                <button class="im-cart-page__quantity-btn" type="button" aria-label="Увеличить">
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M1.25 5.41667C0.559644 5.41667 0 5.97631 0 6.66667C0 7.35702 0.559644 7.91667 1.25 7.91667H12.0833C12.7737 7.91667 13.3333 7.35702 13.3333 6.66667C13.3333 5.97631 12.7737 5.41667 12.0833 5.41667H1.25Z" fill="#111"/><path d="M6.66667 0C5.97631 0 5.41667 0.559644 5.41667 1.25V12.0833C5.41667 12.7737 5.97631 13.3333 6.66667 13.3333C7.35702 13.3333 7.91667 12.7737 7.91667 12.0833V1.25C7.91667 0.559644 7.35702 0 6.66667 0Z" fill="#111"/></svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="im-cart-page__extras">
      <div class="im-cart-page__extras-header">
        <span class="im-cart-page__extras-title">Рекомендуем</span>
        <button class="im-cart-page__extras-toggle" type="button" aria-label="Показать рекомендации">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M1.5 0C0.67155 0 0 0.671249 0 1.5V4.49999C0 5.32874 0.67155 5.99999 1.5 5.99999H4.5C5.32875 5.99999 6 5.32874 6 4.49999V1.5C6 0.671249 5.32875 0 4.5 0H1.5ZM9 0C8.17125 0 7.5 0.671249 7.5 1.5V4.49999C7.5 5.32874 8.17125 5.99999 9 5.99999H12C12.8287 5.99999 13.5 5.32874 13.5 4.49999V1.5C13.5 0.671249 12.8287 0 12 0H9ZM1.5 1.5H4.5V4.49999H1.5V1.5ZM9 1.5H12V4.49999H9V1.5ZM1.5 7.49999C0.67155 7.49999 0 8.17124 0 8.99999V12C0 12.8287 0.67155 13.5 1.5 13.5H4.5C5.32875 13.5 6 12.8287 6 12V8.99999C6 8.17124 5.32875 7.49999 4.5 7.49999H1.5ZM9 7.49999C8.17125 7.49999 7.5 8.17124 7.5 8.99999V12C7.5 12.8287 8.17125 13.5 9 13.5H12C12.8287 13.5 13.5 12.8287 13.5 12V8.99999C13.5 8.17124 12.8287 7.49999 12 7.49999H9ZM1.5 8.99999H4.5V12H1.5V8.99999ZM9 8.99999H12V12H9V8.99999Z" fill="#666666"/>
          </svg>
        </button>
      </div>
      <div class="im-cart-page__extras-list im-cart-page__extras-list--mobile">
        <div class="im-cart-page__extras-card im-cart-page__extras-card--highlight">
          <div class="im-cart-page__extras-card-image">
            <img src="./images/catalogue/mock_catalogue_item_white_bg.png" alt="Металлический стеллаж Ironme..." />
          </div>
          <div class="im-cart-page__extras-card-body">
            <span class="im-cart-page__extras-card-name">Металлический стеллаж Ironme...</span>
            <div class="im-cart-page__extras-card-bottom im-cart-page__extras-card-bottom--recommend">
              <div class="im-cart-page__extras-card-prices">
                <span class="im-cart-page__extras-card-price">48 900 ₽</span>
                <span class="im-cart-page__extras-card-old-price">59 900 ₽</span>
              </div>
              <button class="im-cart-page__extras-card-add" type="button" aria-label="Добавить">
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M1.5 0C0.67155 0 0 0.671249 0 1.5V4.49999C0 5.32874 0.67155 5.99999 1.5 5.99999H4.5C5.32875 5.99999 6 5.32874 6 4.49999V1.5C6 0.671249 5.32875 0 4.5 0H1.5ZM9 0C8.17125 0 7.5 0.671249 7.5 1.5V4.49999C7.5 5.32874 8.17125 5.99999 9 5.99999H12C12.8287 5.99999 13.5 5.32874 13.5 4.49999V1.5C13.5 0.671249 12.8287 0 12 0H9ZM1.5 1.5H4.5V4.49999H1.5V1.5ZM9 1.5H12V4.49999H9V1.5ZM1.5 7.49999C0.67155 7.49999 0 8.17124 0 8.99999V12C0 12.8287 0.67155 13.5 1.5 13.5H4.5C5.32875 13.5 6 12.8287 6 12V8.99999C6 8.17124 5.32875 7.49999 4.5 7.49999H1.5ZM9 7.49999C8.17125 7.49999 7.5 8.17124 7.5 8.99999V12C7.5 12.8287 8.17125 13.5 9 13.5H12C12.8287 13.5 13.5 12.8287 13.5 12V8.99999C13.5 8.17124 12.8287 7.49999 12 7.49999H9ZM1.5 8.99999H4.5V12H1.5V8.99999ZM9 8.99999H12V12H9V8.99999Z" fill="white" /></svg>
              </button>
            </div>
          </div>
        </div>

        <div class="im-cart-page__extras-card im-cart-page__extras-card--highlight">
          <div class="im-cart-page__extras-card-image">
            <img src="./images/catalogue/mock_catalogue_item_white_bg.png" alt="Металлический стеллаж Ironme..." />
          </div>
          <div class="im-cart-page__extras-card-body">
            <span class="im-cart-page__extras-card-name">Металлический стеллаж Ironme...</span>
            <div class="im-cart-page__extras-card-bottom im-cart-page__extras-card-bottom--recommend">
              <div class="im-cart-page__extras-card-prices">
                <span class="im-cart-page__extras-card-price">48 900 ₽</span>
                <span class="im-cart-page__extras-card-old-price">59 900 ₽</span>
              </div>
              <button class="im-cart-page__extras-card-add" type="button" aria-label="Добавить">
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M1.5 0C0.67155 0 0 0.671249 0 1.5V4.49999C0 5.32874 0.67155 5.99999 1.5 5.99999H4.5C5.32875 5.99999 6 5.32874 6 4.49999V1.5C6 0.671249 5.32875 0 4.5 0H1.5ZM9 0C8.17125 0 7.5 0.671249 7.5 1.5V4.49999C7.5 5.32874 8.17125 5.99999 9 5.99999H12C12.8287 5.99999 13.5 5.32874 13.5 4.49999V1.5C13.5 0.671249 12.8287 0 12 0H9ZM1.5 1.5H4.5V4.49999H1.5V1.5ZM9 1.5H12V4.49999H9V1.5ZM1.5 7.49999C0.67155 7.49999 0 8.17124 0 8.99999V12C0 12.8287 0.67155 13.5 1.5 13.5H4.5C5.32875 13.5 6 12.8287 6 12V8.99999C6 8.17124 5.32875 7.49999 4.5 7.49999H1.5ZM9 7.49999C8.17125 7.49999 7.5 8.17124 7.5 8.99999V12C7.5 12.8287 8.17125 13.5 9 13.5H12C12.8287 13.5 13.5 12.8287 13.5 12V8.99999C13.5 8.17124 12.8287 7.49999 12 7.49999H9ZM1.5 8.99999H4.5V12H1.5V8.99999ZM9 8.99999H12V12H9V8.99999Z" fill="white" /></svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>`;
    return container.firstElementChild;
  }

  function destroyExtrasSlider(list) {
    var slider = extrasSliders.get(list);

    if (slider) {
      try {
        slider.destroy();
      } catch (error) {
        // Ignore cleanup errors for detached nodes.
      }

      extrasSliders.delete(list);
    }

    list.classList.remove("keen-slider", "im-cart-page__extras-list--slider");
    list.classList.remove("im-cart-page__extras-list--scrollable");
    Array.from(list.querySelectorAll(".im-cart-page__extras-card")).forEach(
      function (card) {
        card.classList.remove("keen-slider__slide");
      },
    );

    if (list.__scrollHandler) {
      list.removeEventListener("scroll", list.__scrollHandler);
      delete list.__scrollHandler;
    }

    hideWrapperNav(list);
  }

  function destroyExtrasSlidersIn(root) {
    if (!root || !root.querySelectorAll) {
      return;
    }

    root
      .querySelectorAll(".im-cart-page__extras-list")
      .forEach(function (list) {
        destroyExtrasSlider(list);
      });
  }

  function initExtrasSliders(root) {
    if (!root || !root.querySelectorAll) {
      return;
    }

    var keenReady = typeof KeenSlider !== "undefined";

    root
      .querySelectorAll(".im-cart-page__extras-list")
      .forEach(function (list) {
        var cards = Array.from(
          list.querySelectorAll(".im-cart-page__extras-card"),
        );

        var isHighlight =
          cards.length > 0 &&
          cards[0].classList.contains("im-cart-page__extras-card--highlight");

        var isMobile = window.innerWidth <= MOBILE_MAX_WIDTH;

        // Рекомендуем on desktop: scrollable with arrows, no slider
        if (isHighlight && !list.classList.contains("im-cart-page__extras-list--mobile")) {
          destroyExtrasSlider(list);

          if (cards.length > 2 && !isMobile) {
            list.classList.add("im-cart-page__extras-list--scrollable");
            var wrapper = ensureExtrasWrapper(list);

            updateScrollNavVisibility(wrapper, list);

            if (!list.__scrollHandler) {
              list.__scrollHandler = function () {
                updateScrollNavVisibility(wrapper, list);
              };
              list.addEventListener("scroll", list.__scrollHandler);
            }
          }
          return;
        }

        if (!keenReady) return;

        var minCards = isMobile ? 2 : 3;

        if (cards.length < minCards) {
          destroyExtrasSlider(list);
          return;
        }

        if (extrasSliders.has(list)) {
          extrasSliders.get(list).update();
          var existingWrapper = list.closest(".im-cart-page__extras-wrapper");
          if (existingWrapper && !isMobile) {
            updateSliderNavVisibility(existingWrapper, extrasSliders.get(list));
          }
          return;
        }

        list.classList.add("keen-slider", "im-cart-page__extras-list--slider");
        cards.forEach(function (card) {
          card.classList.add("keen-slider__slide");
        });

        var wrapper = !isMobile ? ensureExtrasWrapper(list) : null;

        var slider = new KeenSlider(list, {
          mode: "free-snap",
          rubberband: false,
          drag: true,
          slides: {
            origin: "auto",
            perView: isMobile ? "auto" : 2,
            spacing: isMobile ? 8 : 12,
          },
          breakpoints: {
            "(max-width: 600px)": {
              slides: {
                origin: "auto",
                perView: "auto",
                spacing: 8,
              },
            },
          },
          created: function (s) {
            if (wrapper) updateSliderNavVisibility(wrapper, s);
          },
          slideChanged: function (s) {
            if (wrapper) updateSliderNavVisibility(wrapper, s);
          },
          animationEnded: function (s) {
            if (wrapper) updateSliderNavVisibility(wrapper, s);
          },
        });

        extrasSliders.set(list, slider);
      });
  }

  function refreshExtrasSliders() {
    document
      .querySelectorAll(".im-cart-page__extras-list")
      .forEach(function (list) {
        var slider = extrasSliders.get(list);

        if (slider) {
          slider.update();
        }
      });
  }

  function scheduleExtrasSliderInit(root) {
    initExtrasSliders(root || document);

    if (
      typeof KeenSlider !== "undefined" ||
      extrasSliderRetryCount >= 20 ||
      !document.querySelector(".im-cart-page__extras-list")
    ) {
      return;
    }

    extrasSliderRetryCount += 1;
    window.setTimeout(function () {
      scheduleExtrasSliderInit(root || document);
    }, 250);
  }

  var desktopItems = Array.from(
    document.querySelectorAll(".im-cart-page__item--desktop"),
  );
  var mobileItems = desktopItems.map(function () {
    return buildMobileItem();
  });

  var mobileContainer = document.createElement("div");
  mobileContainer.className = "im-cart-page__items-mobile";
  mobileItems.forEach(function (item) {
    mobileContainer.appendChild(item);
  });

  var isMobileMounted = false;

  function setCartView(isMobile) {
    if (
      isMobile &&
      !isMobileMounted &&
      desktopItems[0] &&
      desktopItems[0].parentNode
    ) {
      var parent = desktopItems[0].parentNode;
      destroyExtrasSlidersIn(parent);
      parent.insertBefore(mobileContainer, desktopItems[0]);
      desktopItems.forEach(function (item) {
        if (item.parentNode) {
          item.parentNode.removeChild(item);
        }
      });
      isMobileMounted = true;
      scheduleExtrasSliderInit(mobileContainer);
    } else if (!isMobile && isMobileMounted && mobileContainer.parentNode) {
      var parent = mobileContainer.parentNode;
      var ref = mobileContainer.nextSibling;
      destroyExtrasSlidersIn(mobileContainer);
      parent.removeChild(mobileContainer);
      desktopItems.forEach(function (item) {
        parent.insertBefore(item, ref);
      });
      isMobileMounted = false;
      scheduleExtrasSliderInit(document);
    }
  }

  function syncCartView() {
    setCartView(window.innerWidth <= MOBILE_MAX_WIDTH);
  }

  function bindExtrasToggle() {
    if (window.__imCartExtrasToggleBound) {
      return;
    }

    document.addEventListener("click", function (event) {
      var header = event.target.closest(".im-cart-page__extras-header");
      if (!header) {
        return;
      }

      var extras = header.closest(".im-cart-page__extras");
      if (!extras) {
        return;
      }

      var toggle = extras.querySelector(".im-cart-page__extras-toggle");
      if (!toggle) {
        return;
      }

      var list = extras.querySelector(".im-cart-page__extras-list");
      if (!list) {
        return;
      }

      var isHidden = list.classList.toggle("im-cart-page__extras-list--hidden");
      toggle.classList.toggle("im-cart-page__extras-toggle--active", !isHidden);
      toggle.setAttribute("aria-expanded", String(!isHidden));
      extras.classList.toggle("im-cart-page__extras--collapsed", isHidden);

      if (isHidden) {
        hideWrapperNav(list);
        return;
      }

      window.requestAnimationFrame(function () {
        var wrapper = list.closest(".im-cart-page__extras-wrapper");
        var slider = extrasSliders.get(list);

        if (slider) {
          slider.update();
          updateSliderNavVisibility(wrapper, slider);
          return;
        }

        updateScrollNavVisibility(wrapper, list);
      });
    });

    window.__imCartExtrasToggleBound = true;
  }

  function bindExtrasNav() {
    if (window.__imCartExtrasNavBound) return;

    document.addEventListener("click", function (event) {
      var nav = event.target.closest(".im-cart-page__extras-nav");
      if (!nav) return;

      var wrapper = nav.closest(".im-cart-page__extras-wrapper");
      if (!wrapper) return;

      var list = wrapper.querySelector(".im-cart-page__extras-list");
      if (!list) return;

      var isPrev = nav.classList.contains("im-cart-page__extras-nav--prev");
      var slider = extrasSliders.get(list);

      if (slider) {
        if (isPrev) slider.prev();
        else slider.next();
      } else {
        var card = list.querySelector(".im-cart-page__extras-card");
        var scrollAmount = card
          ? card.offsetWidth + 12
          : list.clientWidth / 2;
        list.scrollBy({
          left: isPrev ? -scrollAmount : scrollAmount,
          behavior: "smooth",
        });
      }
    });

    window.__imCartExtrasNavBound = true;
  }

  var CHECKMARK_SVG =
    '<svg width="12" height="9" viewBox="0 0 12 9" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M11.2423 0C11.0503 0 10.85 0.0630007 10.7038 0.207001L4.17352 6.65249C3.98077 6.84224 3.78727 6.80701 3.63577 6.58351L1.38877 3.2685C1.15926 2.93025 0.679265 2.83575 0.335014 3.0615C-0.00848637 3.28725 -0.104486 3.75901 0.125015 4.09726L2.37127 7.41224C3.04777 8.40899 4.36552 8.53575 5.22727 7.68825L11.7808 1.26599C12.0725 0.977991 12.0725 0.495 11.7808 0.207001C11.6345 0.0630007 11.4335 0 11.2423 0Z" fill="#FF2E2E"/></svg>';

  document.addEventListener("click", function (event) {
    var btn = event.target.closest(".im-cart-page__extras-card-add");
    if (!btn) return;

    var isActive = btn.classList.toggle("im-cart-page__extras-card-add--active");

    if (isActive) {
      btn.dataset.originalSvg = btn.innerHTML;
      btn.innerHTML = CHECKMARK_SVG;
    } else {
      btn.innerHTML = btn.dataset.originalSvg;
    }
  });

  syncCartView();
  bindExtrasToggle();
  bindExtrasNav();
  scheduleExtrasSliderInit(document);
  if (typeof mediaQuery.addEventListener === "function") {
    mediaQuery.addEventListener("change", syncCartView);
  } else if (typeof mediaQuery.addListener === "function") {
    mediaQuery.addListener(syncCartView);
  }

  window.addEventListener("resize", refreshExtrasSliders);
})();
