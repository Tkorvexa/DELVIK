import fs from "node:fs";

const root = new URL("../", import.meta.url);
const read = (file) => fs.readFileSync(new URL(file, root), "utf8");
const strip = (html) => html
  .replace(/<script[\s\S]*?<\/script>/gi, " ")
  .replace(/<style[\s\S]*?<\/style>/gi, " ")
  .replace(/<[^>]+>/g, " ")
  .replace(/&amp;/g, "&")
  .replace(/&#39;|&apos;/g, "'")
  .replace(/&quot;/g, '"')
  .replace(/&ndash;|&#8211;/g, "-")
  .replace(/&mdash;|&#8212;/g, "—")
  .replace(/\s+/g, " ")
  .trim();

const sitemap = read("sitemap.xml");
const urls = [...sitemap.matchAll(/<loc>(.*?)<\/loc>/g)].map((match) => match[1]);
const fileForUrl = (url) => {
  const path = new URL(url).pathname.replace(/^\//, "").replace(/\/$/, "");
  if (!path) return "index.html";
  const direct = `${path}.html`;
  if (fs.existsSync(new URL(direct, root))) return direct;
  return `${path}/index.html`;
};

const failures = [];
const ok = (condition, message) => { if (!condition) failures.push(message); };
const meta = (html, key, value) => {
  const expression = new RegExp(`<meta[^>]+${key}=["']${value}["'][^>]+content=["']([^"']*)["']|<meta[^>]+content=["']([^"']*)["'][^>]+${key}=["']${value}["']`, "i");
  const match = html.match(expression);
  return match?.[1] ?? match?.[2] ?? "";
};
const jsonBlocks = (html, file) => [...html.matchAll(/<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)].map((match, index) => {
  try { return JSON.parse(match[1]); }
  catch (error) { failures.push(`${file}: invalid JSON-LD block ${index + 1}: ${error.message}`); return null; }
}).filter(Boolean);
const flattenTypes = (data) => {
  const nodes = Array.isArray(data) ? data : data?.["@graph"] ?? [data];
  return nodes.flatMap((node) => Array.isArray(node?.["@type"]) ? node["@type"] : [node?.["@type"]]).filter(Boolean);
};

for (const url of urls) {
  const file = fileForUrl(url);
  const html = read(file);
  const canonical = html.match(/<link[^>]+rel=["']canonical["'][^>]+href=["']([^"']+)["']|<link[^>]+href=["']([^"']+)["'][^>]+rel=["']canonical["']/i);
  ok((canonical?.[1] ?? canonical?.[2]) === url, `${file}: canonical does not match ${url}`);
  ok(Boolean(meta(html, "property", "og:title")), `${file}: missing og:title`);
  ok(Boolean(meta(html, "property", "og:description")), `${file}: missing og:description`);
  ok(Boolean(meta(html, "property", "og:image")), `${file}: missing og:image`);
  ok(Boolean(meta(html, "name", "twitter:card")), `${file}: missing twitter:card`);
  ok(!/<meta[^>]+name=["']robots["'][^>]+content=["'][^"']*noindex/i.test(html), `${file}: unexpected noindex`);
  jsonBlocks(html, file);
}

const exact = {
  "index.html": [
    "Builder Tauranga — New Homes, Renovations, Light Commercial",
    "Tauranga builder for new homes, renovations and light commercial. Licensed Building Practitioner, 8+ years experience. Send your plans for a clear next step."
  ],
  "services/new-home-builders-tauranga.html": [
    "New Home Builders Tauranga | Plan, Price & Build | DELVIK",
    "Building a new home in Tauranga? Work directly with a licensed builder who reviews buildability early and keeps your project on programme."
  ],
  "services/home-renovations-tauranga.html": [
    "Home Renovations Tauranga | Renovate with a Licensed Builder",
    "Tauranga home renovations with clear scoping, protection of existing work and one point of contact - led by a Licensed Building Practitioner."
  ],
  "services/commercial-builders-tauranga.html": [
    "Commercial Builders Tauranga | Fit-outs & Upgrades | DELVIK",
    "Light commercial construction in Tauranga: fit-outs, upgrades and multi-trade coordination, led on site by a licensed builder. Talk to DELVIK."
  ],
  "areas/mount-maunganui-builder.html": [
    "Builder Mount Maunganui | New Homes & Renovations | DELVIK",
    "Renovations, extensions and new homes in Mount Maunganui, led on site by a licensed builder with 8+ years across the Bay of Plenty."
  ],
  "areas/papamoa-builder.html": [
    "Builder Papamoa | New Homes, Renovations & Extensions",
    "Building or renovating in Papamoa? DELVIK brings LBP-led construction, early buildability review and direct builder communication to your project."
  ]
};
for (const [file, [title, description]] of Object.entries(exact)) {
  const html = read(file);
  ok(strip(html.match(/<title>([\s\S]*?)<\/title>/i)?.[1] ?? "") === title, `${file}: title mismatch`);
  ok(meta(html, "name", "description") === description, `${file}: meta description mismatch`);
  ok(title.length <= 65, `${file}: title exceeds 65 characters`);
  ok(description.length <= 160, `${file}: meta description exceeds 160 characters`);
}

const home = read("index.html");
const homeH1 = [...home.matchAll(/<h1\b[^>]*>([\s\S]*?)<\/h1>/gi)].map((match) => strip(match[1]));
ok(homeH1.length === 1 && homeH1[0].includes("Tauranga builder"), "index.html: homepage must have exactly one keyword-led H1");
ok(strip(home).includes("Send your plans. Get a clear building next step."), "index.html: tagline missing");

const thresholdPages = {
  "services/new-home-builders-tauranga.html": 700,
  "services/home-renovations-tauranga.html": 700,
  "services/house-extensions-tauranga.html": 700,
  "services/commercial-builders-tauranga.html": 700,
  "services/design-and-build-tauranga.html": 700,
  "services/property-development-tauranga.html": 700,
  "areas/mount-maunganui-builder.html": 600,
  "areas/papamoa-builder.html": 600,
  "areas/western-bay-of-plenty-builder.html": 600
};
for (const [file, threshold] of Object.entries(thresholdPages)) {
  const main = read(file).match(/<main\b[\s\S]*?<\/main>/i)?.[0] ?? "";
  const words = strip(main).split(/\s+/).filter(Boolean).length;
  ok(words >= threshold, `${file}: ${words} words, requires ${threshold}`);
}

for (const file of [...Object.keys(thresholdPages), "insights/information-builder-needs-before-pricing.html", "insights/tauranga-renovation-cost-guide-2026.html"]) {
  const html = read(file);
  const visible = strip(html);
  for (const data of jsonBlocks(html, file)) {
    const nodes = data?.["@graph"] ?? [data];
    for (const node of nodes) {
      if (node?.["@type"] !== "FAQPage") continue;
      for (const item of node.mainEntity ?? []) {
        ok(visible.includes(item.name), `${file}: FAQ question not visible: ${item.name}`);
        ok(visible.includes(item.acceptedAnswer?.text ?? ""), `${file}: FAQ answer does not match visible text: ${item.name}`);
      }
    }
  }
}

for (const file of Object.keys(thresholdPages).filter((file) => file.startsWith("services/"))) {
  const types = jsonBlocks(read(file), file).flatMap(flattenTypes);
  ok(types.includes("Service"), `${file}: missing Service schema`);
  ok(types.includes("FAQPage"), `${file}: missing FAQPage schema`);
}
for (const file of ["insights/information-builder-needs-before-pricing.html", "insights/tauranga-renovation-cost-guide-2026.html"]) {
  const types = jsonBlocks(read(file), file).flatMap(flattenTypes);
  ok(types.includes("Article") && types.includes("FAQPage"), `${file}: requires Article and FAQPage schema`);
}

const guidePath = "/insights/tauranga-renovation-cost-guide-2026";
for (const file of ["index.html", "insights/index.html", "services/home-renovations-tauranga.html", "services/house-extensions-tauranga.html"]) {
  ok(read(file).includes(`href="${guidePath}"`), `${file}: missing cost-guide link`);
}
ok(read("insights/index.html").split(/<article\b/).length - 1 >= 2, "insights/index.html: fewer than two listed articles");

if (failures.length) {
  console.error(`SEO acceptance failed (${failures.length}):`);
  failures.forEach((failure) => console.error(`- ${failure}`));
  process.exit(1);
}
console.log(`SEO acceptance passed: ${urls.length} sitemap URLs, ${Object.keys(thresholdPages).length} expanded pages, ${Object.keys(exact).length} exact title/meta pairs.`);
