#!/usr/bin/env node
/**
 * Propagates shared chrome (nav, footer, scripts, head fragments) from
 * partials/*.html into every root-level *.html page that contains the
 * matching marker pair:
 *
 *     <!-- partial: nav -->
 *     ...anything in here is overwritten by partials/nav.html...
 *     <!-- /partial: nav -->
 *
 * Edits happen in partials/. Run `npm run sync-partials` (or just
 * `npm run build`, which chains it) to fan changes out across pages.
 * Pages without a given marker pair are left untouched.
 */
const fs = require("fs");
const path = require("path");

const root = path.join(__dirname, "..");
const partialsDir = path.join(root, "partials");

if (!fs.existsSync(partialsDir)) {
  console.log("[sync-partials] no partials/ directory; skipping");
  process.exit(0);
}

const partials = {};
for (const file of fs.readdirSync(partialsDir)) {
  if (!file.endsWith(".html")) continue;
  const name = path.basename(file, ".html");
  partials[name] = fs.readFileSync(path.join(partialsDir, file), "utf8").replace(/\s+$/, "");
}

const escapeRe = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

let totalUpdates = 0;
for (const file of fs.readdirSync(root)) {
  if (!file.endsWith(".html")) continue;
  const fullPath = path.join(root, file);
  if (!fs.statSync(fullPath).isFile()) continue;

  let html = fs.readFileSync(fullPath, "utf8");
  const original = html;

  for (const [name, body] of Object.entries(partials)) {
    const open = `<!-- partial: ${escapeRe(name)} -->`;
    const close = `<!-- /partial: ${escapeRe(name)} -->`;
    const pattern = new RegExp(`(${open})[\\s\\S]*?(${close})`, "g");
    html = html.replace(pattern, (_, o, c) => `${o}\n${body}\n${c}`);
  }

  if (html !== original) {
    fs.writeFileSync(fullPath, html);
    totalUpdates += 1;
    console.log(`[sync-partials] updated ${file}`);
  }
}

console.log(`[sync-partials] ${totalUpdates} file(s) updated, ${Object.keys(partials).length} partial(s)`);
