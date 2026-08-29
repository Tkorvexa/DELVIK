import fs from "node:fs";
import path from "node:path";

const htmlFiles = [];

function collect(directory) {
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    if ([".git", "node_modules", "tools"].includes(entry.name)) continue;
    const item = path.join(directory, entry.name);
    if (entry.isDirectory()) collect(item);
    else if (entry.name.endsWith(".html")) htmlFiles.push(item);
  }
}

collect(".");

const errors = [];
let structuredDataBlocks = 0;

for (const file of htmlFiles) {
  const document = fs.readFileSync(file, "utf8");

  for (const match of document.matchAll(
    /<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi,
  )) {
    try {
      JSON.parse(match[1]);
      structuredDataBlocks += 1;
    } catch (error) {
      errors.push(`${file}: invalid JSON-LD (${error.message})`);
    }
  }

  for (const match of document.matchAll(/(?:href|src)=["'](\/[^"'?#]*)/g)) {
    const url = match[1];
    if (url === "/" || url.startsWith("//") || url.startsWith("/api/")) continue;
    const localPath = `.${url}`;
    const candidates = [localPath, `${localPath}.html`, path.join(localPath, "index.html")];
    if (!candidates.some((candidate) => fs.existsSync(candidate))) {
      errors.push(`${file}: unresolved internal path ${url}`);
    }
  }
}

if (errors.length) {
  console.error(errors.join("\n"));
  process.exit(1);
}

console.log(
  `Validated ${htmlFiles.length} HTML pages, ${structuredDataBlocks} JSON-LD blocks and all local links.`,
);
