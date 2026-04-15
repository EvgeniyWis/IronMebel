(function renderNewsCards() {
  var grid = document.querySelector("[data-news-grid]");
  var template = document.getElementById("news-card-template");
  if (!grid || !template || !("content" in template)) return;

  Array.from({ length: 9 }).forEach(function (_, index) {
    var fragment = template.content.cloneNode(true);
    var image = fragment.querySelector(".im-news-page__card-image");

    if (image && index === 0) {
      image.loading = "eager";
    }

    grid.appendChild(fragment);
  });
})();

(function initNewsSortDropdown() {
  var dropdowns = Array.from(document.querySelectorAll("[data-news-sort]"));
  if (!dropdowns.length) return;

  dropdowns.forEach(function (dropdown) {
    var toggle = dropdown.querySelector("[data-news-sort-toggle]");
    var label = dropdown.querySelector("[data-news-sort-label]");
    var options = Array.from(dropdown.querySelectorAll("[data-news-sort-option]"));

    if (!toggle || !label || !options.length) return;

    var close = function () {
      dropdown.classList.remove("is-open");
      toggle.setAttribute("aria-expanded", "false");
    };

    toggle.addEventListener("click", function () {
      var isOpen = dropdown.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", isOpen ? "true" : "false");
    });

    options.forEach(function (option) {
      option.addEventListener("click", function () {
        options.forEach(function (item) {
          var isActive = item === option;
          item.classList.toggle("is-active", isActive);
          item.setAttribute("aria-selected", isActive ? "true" : "false");
        });

        label.textContent = option.textContent.trim();
        close();
      });
    });

    document.addEventListener("click", function (event) {
      if (!dropdown.contains(event.target)) {
        close();
      }
    });

    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape") {
        close();
      }
    });
  });
})();
