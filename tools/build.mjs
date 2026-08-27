import { cpSync, mkdirSync, rmSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const mode = process.argv[2] || "all";
const validModes = new Set(["all", "site", "extension"]);

if (!validModes.has(mode)) {
  throw new Error(`Unknown build mode: ${mode}`);
}

const shared = ["index.html", "styles.css", "src", "assets"];
const targets = {
  site: [...shared, "web-sw.js"],
  extension: [...shared, "manifest.json", "background.js"]
};

mkdirSync(resolve(root, "dist"), { recursive: true });

for (const target of Object.keys(targets)) {
  if (mode !== "all" && mode !== target) continue;
  const destination = resolve(root, "dist", target);
  rmSync(destination, { recursive: true, force: true });
  mkdirSync(destination, { recursive: true });

  for (const item of targets[target]) {
    cpSync(resolve(root, item), resolve(destination, item), { recursive: true });
  }

  console.log(`Built ${target} bundle at dist/${target}`);
}

