document
  .querySelectorAll(".im-catalog-sidebar__group")
  .forEach(function (group) {
    var title = group.querySelector(".im-catalog-sidebar__title--with-arrow");
    if (!title) return;

    var wrapper = document.createElement("div");
    wrapper.className = "im-catalog-sidebar__group-content";

    var children = Array.from(group.children).filter(function (el) {
      return el !== title;
    });
    children.forEach(function (child) {
      wrapper.appendChild(child);
    });
    group.appendChild(wrapper);

    wrapper.style.maxHeight = wrapper.scrollHeight + "px";

    title.addEventListener("click", function () {
      if (group.classList.contains("is-collapsed")) {
        group.classList.remove("is-collapsed");
        wrapper.style.maxHeight = wrapper.scrollHeight + "px";
      } else {
        wrapper.style.maxHeight = wrapper.scrollHeight + "px";
        requestAnimationFrame(function () {
          group.classList.add("is-collapsed");
        });
      }
    });
  });

