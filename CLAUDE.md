# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

Static marketing site for Innovative Circuits, an electronics repair shop in Barrie. Plain multi-page HTML styled with Tailwind. No JS framework, no build bundler for HTML, no tests.

## Commands

- `npm run dev` — start Vite dev server (live reload for the HTML pages).
- `npm run build` — compile Tailwind: `src/input.css` → `output.css` (minified). Must be re-run after editing `src/input.css`, `tailwind.config.js`, or any HTML class usage you want reflected in the purged CSS.
- During iterative styling, run Tailwind in watch mode: `npx tailwindcss -i ./src/input.css -o output.css --watch`.

There is no lint, test, or typecheck step.

## Architecture

- Each page is a standalone `.html` file at the repo root (`index.html`, `services.html`, `contact.html`, `forSale.html`, `selling.html`, `news.html`). Navigation between them is via plain `<a href="...html">` links — there is no router or shared layout/template, so header/nav/footer markup is duplicated per page. Edits to nav or shared chrome must be applied to every HTML file.
- Tailwind's `content` glob in `tailwind.config.js` is `["./*.{html,js}", "./index.html"]` — only root-level HTML/JS is scanned. Classes used in files outside the root won't be emitted into `output.css`.
- `src/input.css` is the Tailwind entry. It defines a `@layer components` block with site-wide custom classes (notably `.autumn-gradient`, the seasonally-themed body background). Seasonal "theme" swaps are done by editing the gradient + background image inside this class, not by toggling a class on `<body>` — recent commits ("Spring seasonal change", "New BG image", "Update gradient and BG image") follow this pattern.
- `output.css` is generated and checked in. Do not hand-edit it; rebuild via `npm run build`.
- Static assets (logos, photos, seasonal background images) live in `img/`. Favicons and PWA manifest (`site.webmanifest`, `browserconfig.xml`) sit at the root and are wired into the `<head>` of each page.
- Font Awesome is loaded per-page via a kit `<script>` tag; Google Fonts (Outfit, Inter) are imported at the top of `src/input.css` and registered in `tailwind.config.js` under `fontFamily`.

## Notes

- `*:Zone.Identifier` files are Windows download-marker artifacts; ignore them, don't commit new ones.
- `.gitpod.yml` boots the project with `npm install && npm run build` then `npm run dev` — mirror that locally if styles look stale.
