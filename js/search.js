(() => {
  const params = new URLSearchParams(window.location.search);
  const query = params.get("q");

  const queryEl = document.querySelector("[data-search-query]");
  if (queryEl && query) {
    queryEl.textContent = query;
  }

  const titleEl = document.querySelector("title");
  if (titleEl && query) {
    titleEl.textContent = `Поиск: ${query} | IronMebel`;
  }
})();
