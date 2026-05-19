import { defineConfig } from "vite";
import { execSync } from "node:child_process";

/**
 * When Decap (via decap-server) writes a new item file to data/items/,
 * regenerate the items manifest and trigger a full page reload so the
 * For Sale page picks it up immediately. In production, Netlify's build
 * does this on every CMS commit; this plugin gives the same live-update
 * experience during local dev.
 */
const itemsWatcher = {
  name: "items-watcher",
  handleHotUpdate({ file, server }) {
    if (!/\/data\/items\/.+\.json$/.test(file)) return;
    try {
      execSync("node scripts/build-items.js", { stdio: "inherit" });
      server.ws.send({ type: "full-reload" });
      return [];
    } catch (err) {
      console.error("[items-watcher]", err.message);
    }
  },
};

export default defineConfig({
  plugins: [itemsWatcher],
});
