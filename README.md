# IronMebel — базовый шаблон (HTML, SCSS, JS)

Минимальная структура фронтенд-проекта с использованием **HTML**, **SCSS** и **JavaScript**.

## Структура

- `index.html` — точка входа (разметка страницы).
- `scss/` — исходники стилей (SCSS-модули).
- `css/style.css` — скомпилированный CSS (не редактировать вручную).
- `js/main.js` — основной JavaScript-файл.
- `package.json` — зависимости и npm-скрипты.

## Установка и запуск SCSS

В корне проекта:

```bash
npm install
```

### Режим разработки (watch)

```bash
npm run dev:sass
```

SCSS из `scss/main.scss` будет пересобираться в `css/style.css` при каждом сохранении.

### Продакшен-сборка CSS

```bash
npm run build:sass
```

CSS будет сжат.

## Где писать код

- HTML: `index.html`
- SCSS: файлы в папке `scss/` (основной — `main.scss`, который подключает остальные partial-файлы).
- JS: `js/main.js`

После этого достаточно открыть `index.html` в браузере (через Live Server или напрямую из файловой системы).

