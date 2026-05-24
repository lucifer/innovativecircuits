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

- Pages are standalone `.html` files at the repo root: `index.html`, `services.html`, `contact.html`, `forsale.html`. Navigation between them is plain `<a href="...">` — no router or template at runtime. Shared chrome (nav, footer, scripts) is kept in `partials/` and propagated into each page by `scripts/sync-partials.js`. See **Partials workflow** below.
- `news.html` and `selling.html` are retired stubs (meta-refresh + noindex) kept around so old inbound links 301 cleanly. They're also covered by `_redirects` for server-side 301s on Netlify.
- Tailwind's `content` glob in `tailwind.config.js` is `["./*.{html,js}", "./index.html", "./partials/*.html"]`. Classes used in files outside those paths won't be emitted into `output.css`. Class strings embedded in `<script>` template literals (e.g. the For Sale renderer) ARE picked up because the scanner reads the HTML file as text.
- `src/input.css` is the Tailwind entry. It defines a `@layer components` block with the brand button classes (`.btn-primary`, `.btn-ghost`), the `.custom-card`, and the seasonal background system (see Seasonal theming below).
- `output.css` is generated and checked in. Do not hand-edit it; rebuild via `npm run build`.
- Static assets (logos, photos, hero background) live in `img/`. Item photos uploaded by Decap go to `img/items/`. Favicons and PWA manifest sit at the root and are wired into the `<head>` of each page.
- Google Fonts (Outfit, Inter) are imported at the top of `src/input.css` and registered in `tailwind.config.js`. Every page has preconnect tags for `fonts.googleapis.com` and `fonts.gstatic.com` to mitigate the @import being render-blocking.
- **No dark mode.** The seasonal-photo background *is* the design; Tailwind `dark:` variants have been intentionally stripped because they conflicted with the seasonal palette. Don't reintroduce `dark:bg-*`, `dark:text-*`, or similar without a deliberate dark-variant design pass.
- `robots.txt` and `sitemap.xml` sit at the repo root. The sitemap is hand-maintained — if you add a new top-level page, add a `<url>` entry there too.

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

Each season has its own photo at `img/seasonal/{spring,summer,autumn,winter}.webp`. The gradient overlay is a light darken-for-legibility pass with a hint of seasonal tint — the photo carries the seasonal mood. Mobile uses `background-attachment: scroll` to avoid iOS Safari jank.

To swap a season's photo: replace the corresponding file in `img/seasonal/` (keep the WebP format, ≤200 KB, ~1920×1080). No CSS edit needed.

## Content management (Decap CMS)

The For Sale page is driven by a folder collection edited through Decap CMS:

- **Admin URL**: `/admin/` — login via Netlify Identity.
- **Source of truth**: `data/items/*.json`, one file per item.
- **Build step**: `scripts/build-items.js` concatenates them into `data/items.json`, sorted by `datePosted` desc. This file is gitignored — regenerated on every build.
- **Runtime**: `forsale.html` fetches `/data/items.json` and renders cards. Items with `status: "Hidden"` are filtered out client-side; `"Sold"` items show with a badge and dimmed; `"For Sale"` items get an Enquire CTA (mailto with the item title prefilled).
- **Image uploads**: Decap writes uploaded images to `img/items/`.

### Local CMS testing (no Netlify needed)

`admin/config.yml` has `local_backend: true`, which Decap honours only when served on localhost. To run the CMS against your working tree:

```bash
# Terminal 1
npm run dev          # Vite serves the site + admin/

# Terminal 2
npm run cms:dev      # decap-server proxies CMS file ops to disk
```

Open http://localhost:5173/admin/ — the CMS opens without auth, reads/writes `data/items/*.json` directly. Image uploads land in `img/items/`. Save in the CMS, then refresh `/forsale.html` to see the rendered card. This is the fastest way to validate the full edit-to-render loop before hitting Netlify.

### Deploying to Netlify (one-time)

The repo has a `netlify.toml` with the build command (`npm run build`), publish directory (`.`), Node version, redirects, and cache headers. Once the GitHub repo is connected to Netlify, deploys are automatic on every push to `master`.

1. **netlify.com → Sites → Add new site → Import from Git** → pick the `innovativecircuits` repo. Netlify reads `netlify.toml` and auto-fills build settings. Click Deploy.
2. **Site settings → Identity → Enable Identity.**
3. **Identity → Settings and usage → Registration preferences** → set to **Invite only** (so randoms can't self-sign-up).
4. **Identity → Services → Git Gateway** → **Enable Git Gateway**. This is what lets Decap commit to the repo on Ron's behalf — without it, saves from `/admin/` fail.
5. **Identity → Invite users** → invite Ron's email.

Ron then receives an email, clicks the link, lands on the homepage where the Identity widget (loaded on `index.html`) catches the invite token, lets him set a password, and redirects to `/admin/`. Every save he makes in the CMS commits to `master`, which triggers a Netlify rebuild (~1–2 min) and the site picks up the change.

**Always use `/admin/` with the trailing slash** — Decap uses hash-based routing under the hood and the unslashed URL can break depending on how the host resolves it.

### Tailwind safelist note

The For Sale renderer uses some classes only inside JS template literals. A hidden `<template>` block on `forsale.html` lists them so the scanner picks them up. If you add new dynamic classes to the renderer, add them to that template block or they'll be silently purged from `output.css`.

## Accessibility & SEO conventions

Every primary page (`index.html`, `services.html`, `contact.html`, `forsale.html`) follows the same structural contract — match it when adding a new page:

1. **`<!DOCTYPE html>` on line 1.** Without it, browsers fall into quirks mode and box-sizing breaks silently.
2. **Exactly one `<h1>` per page**, describing the page topic (not the brand tagline). Subsequent headings descend `h2` → `h3` in order; don't skip levels.
3. **Skip-to-content link as the first child of `<body>`**, before the nav partial:
   ```html
   <a href="#main" class="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50 focus:bg-white focus:text-black focus:px-4 focus:py-2 focus:rounded focus:font-semibold focus:shadow-lg focus:outline-none focus:ring-2 focus:ring-cyan-400">Skip to content</a>
   ```
4. **`<main id="main" tabindex="-1">`** wraps the page content (everything between the nav partial close and the footer partial open). The `tabindex="-1"` lets the skip link focus the landmark on jump.
5. **JSON-LD `ElectronicsStore` block lives only on `index.html`** — that's the canonical business URL. Duplicating it on other pages confuses search-engine entity binding. Page-specific schema types (`ContactPage`, `ItemList`) can be added per-page later if useful.
6. **Image `<img>` tags carry `width` and `height` attributes** matching the source's natural pixel dimensions. Reserves space pre-paint, prevents CLS. The For Sale renderer dynamically injects item images without dimensions — known gap; revisit if the CMS gains a way to record dimensions.

## Notes

- `*:Zone.Identifier` files are Windows download-marker artifacts. They're gitignored (`*:Zone.Identifier` rule in `.gitignore`), so they won't sneak in.
- `.gitpod.yml` boots the project with `npm install && npm run build` then `npm run dev` — mirror that locally if styles look stale.
