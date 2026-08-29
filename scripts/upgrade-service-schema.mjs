import fs from "node:fs";

const services = {
  "services/new-home-builders-tauranga.html": {
    serviceType: "New home building",
    name: "New Home Builders Tauranga",
    description:
      "Plan and build a new home in Tauranga with direct builder communication and early buildability review.",
  },
  "services/home-renovations-tauranga.html": {
    serviceType: "Home renovations",
    name: "Home Renovations Tauranga",
    description:
      "Tauranga home renovations with clear scoping, protection of existing work and direct builder communication.",
  },
  "services/house-extensions-tauranga.html": {
    serviceType: "House extensions",
    name: "House Extensions Tauranga",
    description:
      "House extensions in Tauranga planned around structure, weathertightness, services and the existing home.",
  },
  "services/commercial-builders-tauranga.html": {
    serviceType: "Light commercial construction",
    name: "Commercial Builders Tauranga",
    description:
      "Light commercial fit-outs and upgrades in Tauranga with direct site leadership and multi-trade coordination.",
  },
  "services/design-and-build-tauranga.html": {
    serviceType: "Design and build",
    name: "Design and Build Tauranga",
    description:
      "Design-and-build coordination in Tauranga with early construction, buildability and delivery input.",
  },
  "services/property-development-tauranga.html": {
    serviceType: "Property development",
    name: "Property Development Builder Tauranga",
    description:
      "Construction input for small property developments in Tauranga, from site feasibility through delivery planning.",
  },
};

for (const [file, values] of Object.entries(services)) {
  let html = fs.readFileSync(file, "utf8");
  let replaced = false;
  html = html.replace(
    /<script type="application\/ld\+json">([\s\S]*?)<\/script>/,
    (block, jsonText) => {
      const data = JSON.parse(jsonText);
      const nodes = data["@graph"] || [data];
      const service = nodes.find((node) => node["@type"] === "Service");
      if (!service) throw new Error(`${file}: Service node missing`);
      service.name = values.name;
      service.serviceType = values.serviceType;
      service.description = values.description;
      service.provider = {
        "@type": "GeneralContractor",
        name: "DELVIK",
        url: "https://delvik.co",
      };
      service.areaServed = [
        "Tauranga",
        "Mount Maunganui",
        "Papamoa",
        "Western Bay of Plenty",
      ];
      service.url = `https://delvik.co/${file.replace(/\.html$/, "")}`;
      replaced = true;
      return `<script type="application/ld+json">\n${JSON.stringify(data, null, 2)}\n    </script>`;
    },
  );
  if (!replaced) throw new Error(`${file}: JSON-LD block not found`);
  fs.writeFileSync(file, html);
}

console.log(`Updated ${Object.keys(services).length} service schemas.`);
