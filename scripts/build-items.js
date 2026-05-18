#!/usr/bin/env node
/**
 * Concatenates data/items/*.json (one file per For Sale item, edited via
 * Decap CMS at /admin/) into a single data/items.json manifest that the
 * For Sale page fetches at runtime. Sorts by datePosted descending, then
 * by title. Hidden items are kept in the manifest — filtering happens
 * client-side so admins can preview-toggle.
 */
const fs = require("fs");
const path = require("path");

const dir = path.join(__dirname, "..", "data", "items");
const out = path.join(__dirname, "..", "data", "items.json");

let items = [];
if (fs.existsSync(dir)) {
  items = fs
    .readdirSync(dir)
    .filter((f) => f.endsWith(".json"))
    .map((f) => {
      const raw = fs.readFileSync(path.join(dir, f), "utf8");
      try {
        return JSON.parse(raw);
      } catch (e) {
        console.error(`[build-items] Failed to parse ${f}:`, e.message);
        process.exit(1);
      }
    });
}

items.sort((a, b) => {
  const da = a.datePosted || "";
  const db = b.datePosted || "";
  if (da !== db) return db.localeCompare(da);
  return (a.title || "").localeCompare(b.title || "");
});

fs.writeFileSync(out, JSON.stringify(items, null, 2) + "\n");
console.log(`[build-items] wrote ${items.length} item(s) to data/items.json`);
