import fs from "node:fs";
import path from "node:path";

const files = [];
function collect(directory) {
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    if ([".git", "node_modules", "tools", "social"].includes(entry.name)) continue;
    const item = path.join(directory, entry.name);
    if (entry.isDirectory()) collect(item);
    else if (entry.name.endsWith(".html")) files.push(item);
  }
}
collect(".");

let updated = 0;
for (const file of files) {
  let html = fs.readFileSync(file, "utf8");
  if (/name="robots"[^>]+noindex|content="noindex|http-equiv="refresh"/i.test(html)) continue;
  if (/name="twitter:card"/i.test(html)) continue;

  const title = html.match(/property="og:title"\s+content="([^"]+)"/i)?.[1];
  const description = html.match(
    /property="og:description"\s+content="([^"]+)"/i,
  )?.[1];
  const image = html.match(/property="og:image"\s+content="([^"]+)"/i)?.[1];
  if (!title || !description || !image) {
    throw new Error(`${file}: incomplete Open Graph metadata`);
  }
  const tags = `    <meta name="twitter:card" content="summary_large_image" />\n    <meta name="twitter:title" content="${title}" />\n    <meta name="twitter:description" content="${description}" />\n    <meta name="twitter:image" content="${image}" />\n`;
  html = html.replace(/(\s*<link rel="stylesheet")/, `\n${tags}$1`);
  fs.writeFileSync(file, html);
  updated += 1;
}
console.log(`Added Twitter cards to ${updated} pages.`);
