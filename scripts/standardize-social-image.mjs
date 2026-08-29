import fs from "node:fs";

const root = new URL("../", import.meta.url);
const sitemap = fs.readFileSync(new URL("sitemap.xml", root), "utf8");
const urls = [...sitemap.matchAll(/<loc>(.*?)<\/loc>/g)].map((match) => match[1]);
const socialImage = "https://delvik.co/assets/delvik-og-1200x630.webp";

function fileForUrl(url) {
  const path = new URL(url).pathname.replace(/^\//, "").replace(/\/$/, "");
  if (!path) return "index.html";
  const direct = `${path}.html`;
  if (fs.existsSync(new URL(direct, root))) return direct;
  return `${path}/index.html`;
}

function replaceMetaContent(html, key, value) {
  const tagPattern = new RegExp(`<meta(?=[^>]*(?:property|name)=["']${key}["'])[^>]*>`, "i");
  return html.replace(tagPattern, (tag) => {
    if (/content=["'][^"']*["']/i.test(tag)) {
      return tag.replace(/content=["'][^"']*["']/i, `content="${value}"`);
    }
    return tag.replace(/\s*\/?>(\s*)$/, ` content="${value}" />$1`);
  });
}

let changed = 0;
for (const url of urls) {
  const file = fileForUrl(url);
  const target = new URL(file, root);
  const original = fs.readFileSync(target, "utf8");
  let html = replaceMetaContent(original, "og:image", socialImage);
  html = replaceMetaContent(html, "twitter:image", socialImage);
  if (!/property=["']og:image:width["']/i.test(html)) {
    const ogImageTag = html.match(/<meta(?=[^>]*property=["']og:image["'])[^>]*>/i)?.[0];
    if (ogImageTag) {
      html = html.replace(ogImageTag, `${ogImageTag}\n    <meta property="og:image:width" content="1200" />\n    <meta property="og:image:height" content="630" />`);
    }
  }
  if (html !== original) {
    fs.writeFileSync(target, html);
    changed += 1;
  }
}

console.log(`Standardized social image metadata on ${changed} sitemap pages.`);
