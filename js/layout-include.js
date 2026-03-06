(() => {
  const HEADER_MOUNT_SELECTOR = "[data-layout-header]";
  const FOOTER_MOUNT_SELECTOR = "[data-layout-footer]";
  const INDEX_URL = "./index.html";

  const loadScript = (src) =>
    new Promise((resolve, reject) => {
      const script = document.createElement("script");
      script.src = src;
      script.onload = () => resolve();
      script.onerror = () => reject(new Error(`Не удалось загрузить скрипт: ${src}`));
      document.body.appendChild(script);
    });

  const cloneElement = (el) => (el ? el.cloneNode(true) : null);

  const injectLayoutFromIndex = async () => {
    const headerMount = document.querySelector(HEADER_MOUNT_SELECTOR);
    const footerMount = document.querySelector(FOOTER_MOUNT_SELECTOR);

    if (!headerMount || !footerMount) return;

    const res = await fetch(INDEX_URL, { cache: "no-cache" });
    if (!res.ok) {
      throw new Error(`Не удалось загрузить ${INDEX_URL}: ${res.status}`);
    }

    const html = await res.text();
    const doc = new DOMParser().parseFromString(html, "text/html");

    const indexHeader = doc.querySelector("header.im-header");
    const indexFooter = doc.querySelector("footer.im-footer");

    const newHeader = cloneElement(indexHeader);
    const newFooter = cloneElement(indexFooter);

    if (newHeader) {
      headerMount.replaceWith(newHeader);
    } else {
      headerMount.remove();
      // eslint-disable-next-line no-console
      console.warn("layout-include: header.im-header не найден в index.html");
    }

    let footerInserted = null;
    if (newFooter) {
      footerMount.replaceWith(newFooter);
      footerInserted = newFooter;
    } else {
      footerMount.remove();
      // eslint-disable-next-line no-console
      console.warn("layout-include: footer.im-footer не найден в index.html");
    }

    // Переносим все элементы, которые идут после футера (нижняя навигация, модалки и т.д.)
    // до первых <script> в конце body.
    if (indexFooter && footerInserted) {
      let insertAfter = footerInserted;
      let next = indexFooter.nextElementSibling;
      while (next) {
        if (next.tagName && next.tagName.toLowerCase() === "script") break;
        const cloned = next.cloneNode(true);
        insertAfter.insertAdjacentElement("afterend", cloned);
        insertAfter = cloned;
        next = next.nextElementSibling;
      }
    }
  };

  const bootstrap = async () => {
    try {
      await injectLayoutFromIndex();
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error("layout-include: ошибка загрузки layout из index.html", e);
    }

    // Важно: main.js выполняется сразу (без DOMContentLoaded),
    // поэтому грузим его только после вставки хедера/футера/модалок.
    await loadScript(
      "https://cdn.jsdelivr.net/npm/keen-slider@6.8.6/keen-slider.min.js",
    );
    await loadScript("./js/main.js");
  };

  bootstrap();
})();

