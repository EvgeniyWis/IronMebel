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
})();
