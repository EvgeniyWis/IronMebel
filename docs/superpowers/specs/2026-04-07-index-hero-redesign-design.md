# Redesign `index.html` Hero (`im-hero__inner`)

## Context

Need to redesign the hero area on `index.html` to match the provided desktop and mobile references while staying within the existing IronMebel stack and conventions:

- HTML in `index.html`
- shared hero styles in `scss/_layout.scss`
- responsive adjustments in `scss/_media.scss`
- slider behavior in `js/main.js`
- no inline CSS/JS
- no GitHub push

## Goal

Replace the current hero composition with:

- a desktop two-column top hero: left dark text panel + right image slider
- a separate CTA strip below it
- a mobile stacked layout: slider, dark text panel, CTA strip

The update must preserve the existing visual language of IronMebel and reuse the already connected Keen Slider library.

## Agreed Structure

### Top Hero Block

Desktop:

- left column: text content on solid `#002139`
- right column: image slider with 4 slides
- unified visual block with rounded corners

Mobile:

- first row: image slider
- second row: dark text block
- same content, reordered vertically

### CTA Strip

Separate block under the top hero:

- full width
- white background
- internal padding `24px`
- minimum height `106px`
- distance from top hero on desktop: `32px`
- distance from top hero on mobile: `16px`

## Content Changes

### Left Text Panel

- `im-hero__main-content` loses its previous image/overlay treatment and becomes a solid dark panel using `#002139`
- remove `im-hero__text`
- `im-hero__title`: `56px/64px`, `700`, white
- `im-hero__subtitle-accent`: `20px/28px`, red `#FF0000`

### Benefits

- each `im-hero__benefit` becomes a vertical flex column
- icon and text are centered
- icons remain unchanged
- `im-hero__benefit-text`: `13px/15px`
- desktop: 3 benefits in one row
- mobile: still 3 columns in one row, matching the reference composition

### Slider

- replace the current `im-hero__side` content with a dedicated slider area
- use 4 identical slides based on `images/main/main_photo.png`
- add decorative top-right crop overlay from `images/main/frame-rediz.png`
- pagination:
  - bar size `55px x 3px`
  - active color `#FF0000`
  - inactive color `#FFFFFF`
  - positioned `20px` from the slider bottom

### CTA Strip Content

- title text: `Тест-драйв прямо у вас`
- `Тест-драйв` highlighted in `#FF0000`
- CTA title typography: `28px/36px`
- supporting text: `14px/16px`, color `#002139`
- primary button `Заказать тест-драйв`: background `#FF2E2E`
- small arrow button: background `#FF2E2E`
- arrow asset: `images/main/arrow.svg`
- desktop: arrow points right
- mobile: arrow points down

## Implementation Plan

### HTML

Update `index.html` hero markup to:

- remove the old `im-hero__side` composition
- add slider markup inside the top hero block
- add a separate CTA strip block after the top hero block
- keep semantics aligned with the existing page structure

### SCSS

Update hero-related styles in:

- `scss/_layout.scss`
- `scss/_media.scss`

Required work:

- replace old hero grid sizing with the new desktop composition
- remove obsolete styling tied to the old side card layout
- add slider, pagination, overlay, CTA strip, and mobile reorder styles
- keep changes scoped to the hero area and its responsive states

### JavaScript

Update `js/main.js` to:

- initialize a Keen Slider instance for the hero slider
- generate/sync pagination bars
- keep manual drag/swipe behavior only
- avoid autoplay

## Cleanup Rule

Unused CSS from the replaced hero implementation should not be left behind. Remove obsolete rules for the old `im-hero__side` and other replaced hero-specific states/selectors, but do not perform unrelated cleanup outside this scope.

## Verification

Minimum verification after implementation:

1. Run `npm run build:sass`
2. Check `index.html` hero on desktop
3. Check `index.html` hero on mobile against the provided reference

## Out of Scope

- changes to other homepage sections
- introducing new libraries
- migrating scripts to modules
- pushing anything to GitHub
