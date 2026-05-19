# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

Static marketing site for Innovative Circuits, an electronics repair shop in Barrie. Plain multi-page HTML styled with Tailwind. The For Sale page is a small dynamic island fed by a Decap CMS folder collection. No JS framework, no build bundler for HTML, no tests.

## Commands

- `npm run dev` — generate `data/items.json`, sync partials into each page, then start Vite dev server.
- `npm run build` — full chain: items manifest → sync partials → Tailwind compile (`src/input.css` → `output.css`, minified). Must be re-run after editing `src/input.css`, `tailwind.config.js`, items, partials, or any HTML class usage you want reflected in the purged CSS.
- `npm run build:items` — regenerate `data/items.json` only.
- `npm run build:partials` — propagate `partials/*.html` into every root HTML page that has the matching marker pair.
- `npm run build:css` — Tailwind only (skip items + partials).
- During iterative styling, run Tailwind in watch mode: `npx tailwindcss -i ./src/input.css -o output.css --watch`.

There is no lint, test, or typecheck step.

## Architecture

- Pages are standalone `.html` files at the repo root: `index.html`, `services.html`, `contact.html`, `forSale.html`. Navigation between them is plain `<a href="...">` — no router or template at runtime. Shared chrome (nav, footer, scripts) is kept in `partials/` and propagated into each page by `scripts/sync-partials.js`. See **Partials workflow** below.
- `news.html` and `selling.html` are retired stubs (meta-refresh + noindex) kept around so old inbound links 301 cleanly. They're also covered by `_redirects` for server-side 301s on Netlify.
- Tailwind's `content` glob in `tailwind.config.js` is `["./*.{html,js}", "./index.html", "./partials/*.html"]`. Classes used in files outside those paths won't be emitted into `output.css`. Class strings embedded in `<script>` template literals (e.g. the For Sale renderer) ARE picked up because the scanner reads the HTML file as text.
- `src/input.css` is the Tailwind entry. It defines a `@layer components` block with the brand button classes (`.btn-primary`, `.btn-ghost`), the `.custom-card`, and the seasonal background system (see Seasonal theming below).
- `output.css` is generated and checked in. Do not hand-edit it; rebuild via `npm run build`.
- Static assets (logos, photos, hero background) live in `img/`. Item photos uploaded by Decap go to `img/items/`. Favicons and PWA manifest sit at the root and are wired into the `<head>` of each page.
- Google Fonts (Outfit, Inter) are imported at the top of `src/input.css` and registered in `tailwind.config.js`. Every page has preconnect tags for `fonts.googleapis.com` and `fonts.gstatic.com` to mitigate the @import being render-blocking.

## Partials workflow

Shared chrome lives in `partials/`:

- `partials/nav.html` — the top nav (logo, mobile toggle, page links).
- `partials/footer.html` — the centered footer (logo + address + phone + email + copyright).
- `partials/scripts.html` — the `toggleNav()` mobile-menu script.
- `partials/head-shared.html`, `partials/jsonld.html` — additional partials that *exist* and can be wired up, but aren't currently referenced by any page (no marker pair). Available for future use.

Each page that consumes a partial has a marker pair in the appropriate spot:

```html
<!-- partial: nav -->
…content overwritten on every build…
<!-- /partial: nav -->
```

`scripts/sync-partials.js` (run automatically by `npm run dev` and `npm run build`, or manually via `npm run build:partials`) reads every `partials/*.html` and rewrites the content between each matching marker pair in every root HTML file. Pages without a given marker pair are left untouched. **Edits to nav/footer/shared scripts go in `partials/`, not in the page files** — anything written between markers gets overwritten on next sync.

To wire up an additional partial in a page, add the marker pair at the desired location; the next build fills it in. To stop a page from using a partial, just delete its marker pair.

## Seasonal theming

The seasonal-photo background swaps automatically based on the current month. Mechanism:

1. A tiny inline `<head>` script on every page reads `new Date().getMonth()` and sets `<html data-season="winter|spring|summer|autumn">` before paint. It also respects `?season=…` on the URL for testing all four without changing the system clock.
2. `src/input.css` defines CSS variables (`--bg-image`, `--grad-top`, `--grad-bot`) on `:root[data-season="…"]` blocks, one per season.
3. The `.seasonal-bg` class on `<body>` composes those into a `linear-gradient(...), var(--bg-image)`.

Right now all four seasons point at `img/wideSpringIC.webp` and differ only by gradient tint. To unlock per-season photos: drop files at `img/seasonal/{spring,summer,autumn,winter}.webp` and update each `:root[data-season="…"]` block in `src/input.css` to point `--bg-image` at its file. Mobile uses `background-attachment: scroll` to avoid iOS Safari jank.

## Content management (Decap CMS)

The For Sale page is driven by a folder collection edited through Decap CMS:

- **Admin URL**: `/admin/` — login via Netlify Identity.
- **Source of truth**: `data/items/*.json`, one file per item.
- **Build step**: `scripts/build-items.js` concatenates them into `data/items.json`, sorted by `datePosted` desc. This file is gitignored — regenerated on every build.
- **Runtime**: `forSale.html` fetches `/data/items.json` and renders cards. Items with `status: "Hidden"` are filtered out client-side; `"Sold"` items show with a badge and dimmed; `"For Sale"` items get an Enquire CTA (mailto with the item title prefilled).
- **Image uploads**: Decap writes uploaded images to `img/items/`.

### One-time Netlify dashboard setup (required before Decap works)

These steps happen in the Netlify dashboard, not in code:

1. **Identity** → "Enable Identity"
2. **Identity → Settings & usage → Registration preferences** → set to "Invite only"
3. **Identity → Services → Git Gateway** → "Enable Git Gateway"
4. **Identity → Invite users** → invite Ron's email

Ron then receives an email, clicks the link, lands on the homepage where the Identity widget intercepts the invite token, sets a password, and is redirected to `/admin/`.

### Tailwind safelist note

The For Sale renderer uses some classes only inside JS template literals. A hidden `<template>` block on `forSale.html` lists them so the scanner picks them up. If you add new dynamic classes to the renderer, add them to that template block or they'll be silently purged from `output.css`.

## Notes

- `*:Zone.Identifier` files are Windows download-marker artifacts; ignore them, don't commit new ones.
- `.gitpod.yml` boots the project with `npm install && npm run build` then `npm run dev` — mirror that locally if styles look stale.
