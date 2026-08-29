import fs from "node:fs";

const costGuide = "/insights/tauranga-renovation-cost-guide-2026";

const pages = {
  "services/new-home-builders-tauranga.html": {
    kicker: "Building a new home in Tauranga",
    heading: "From buildability review to a controlled site programme.",
    paragraphs: [
      "Tauranga new-home sites range from established infill properties to newer subdivisions across Papamoa and the wider Bay of Plenty. Access, wind zone, ground information, retaining, services and neighbouring homes can affect the construction method before the first trade arrives. DELVIK reviews those site inputs with the drawings so the programme is based on the actual property rather than a generic house type.",
      "The service can cover early buildability input, review of consented information, trade coordination, procurement planning, site establishment, carpentry, quality checks and handover preparation. Where designers, engineers or surveyors are required, their information is identified and coordinated with the construction scope. Decisions and exclusions stay visible instead of being buried inside an early allowance.",
      "The experience behind DELVIK includes residential new-build carpentry, exterior cladding, high-spec homes and multi-unit delivery in New Zealand. Those projects are presented as Thiago Cortes' professional experience where the wider contract belonged to another company. That distinction matters: the evidence demonstrates site capability without misrepresenting who held the original contract.",
    ],
    links: [
      ["See documented new-build experience", "/projects/new-build"],
      ["Review information needed before pricing", "/insights/information-builder-needs-before-pricing"],
      ["Send plans for review", "/contact-build?project=new-build"],
    ],
    faqs: [
      ["How much does a new home cost in Tauranga in 2026?", "A reliable new-home price depends on the site, floor area, structure, specification, services, access and how complete the design is. DELVIK does not publish one square-metre promise that ignores those inputs. Our Tauranga renovation cost guide explains the same cost-planning principles and exclusions, but a new home requires its own drawings, site information and project-specific review.", costGuide],
      ["Do I need building consent for a new home in Tauranga?", "Yes. A new home requires building consent and may also require planning, engineering, infrastructure or other approvals depending on the site. Construction must follow the approved plans and specifications. The owner and project team should confirm all requirements with Tauranga City Council and the relevant qualified professionals before work starts."],
      ["How long does a typical new-home project take?", "The construction period depends on design complexity, consent status, site work, procurement and trade availability. DELVIK prepares a project-specific programme after reviewing the plans and known constraints. The meaningful date is not a generic industry average; it is the sequence supported by the actual scope, approvals and long-lead selections."],
      ["Who will be on site, and who is responsible for the work?", "DELVIK is led by Thiago Cortes, a Licensed Building Practitioner and BCITO-qualified carpenter. Responsibilities, supervision, subcontractor packages and points of contact are defined before construction. Clients receive direct builder communication rather than being passed between an estimator, salesperson and an unidentified site contact."],
      ["Do you build new homes outside central Tauranga?", "DELVIK works across Tauranga, Mount Maunganui, Papamoa and selected Western Bay of Plenty locations. Suitability depends on the site, scope and target programme. Send the address and current plans so travel, access, services and delivery requirements can be considered at the start."],
    ],
  },
  "services/home-renovations-tauranga.html": {
    kicker: "Renovation planning for existing Tauranga homes",
    heading: "Control the unknowns before they control the budget.",
    paragraphs: [
      "Tauranga renovations can involve older services, previous alterations, coastal exposure, occupied rooms and restricted access. Mount Maunganui and established Tauranga properties may need careful protection of neighbours and existing finishes, while Papamoa homes can bring different access, exposure and staging requirements. The first review should connect the desired layout with the building that is already there.",
      "DELVIK provides renovation construction, structural and internal alterations, kitchen and living-area changes, exterior interfaces and staged upgrades. The scope identifies what is confirmed, what still needs design or engineering and which conditions require inspection. That distinction creates a better basis for trade pricing and a clear variation process when genuinely hidden work is uncovered.",
      "Relevant experience includes high-spec residential carpentry, exterior cladding, multi-unit homes and site coordination across New Zealand. DELVIK presents that background transparently and uses it to plan protection, sequencing, junction quality and communication. Visit the projects section for the documented experience behind the company, then send photos and plans for a Tauranga-specific review.",
    ],
    links: [
      ["Read the 2026 renovation cost guide", costGuide],
      ["Compare house extensions", "/services/house-extensions-tauranga"],
      ["Discuss a renovation", "/contact-build?project=renovation"],
    ],
    faqs: [
      ["How much does a home renovation cost in Tauranga in 2026?", "Scope is the deciding factor. A controlled room refresh is fundamentally different from structural alterations, a full kitchen or bathroom, recladding or a whole-home renovation. DELVIK's 2026 Tauranga renovation cost guide provides indicative NZD ranges, common exclusions, council-fee context and contingency guidance. A site-specific quote still requires drawings, selections and existing-condition information.", costGuide],
      ["Do I need building consent for a renovation in Tauranga?", "Structural alterations, additions and some plumbing or drainage changes commonly require building consent. Some maintenance and low-risk work may be exempt, but all building work must still comply with the Building Code. Confirm the requirement with Tauranga City Council or the appropriate designer before demolition or construction begins."],
      ["How long does a typical renovation take?", "Duration depends on design, consent, structural changes, occupied areas, product selections and what is discovered after opening the building. DELVIK develops a programme from the actual scope and identifies decisions that could delay work. Staging and temporary protection are agreed early if the client intends to remain in the home."],
      ["Who will be on site, and who is responsible for the work?", "Thiago Cortes leads DELVIK and provides the direct builder point of contact. Trade responsibilities, supervision and approvals are defined for the project. Where specialist designers, engineers, plumbers or electricians are involved, their packages are coordinated with the building sequence and recorded scope."],
      ["Do you renovate homes in Mount Maunganui, Papamoa and Western Bay of Plenty?", "Yes. DELVIK undertakes suitable renovations across Tauranga, Mount Maunganui, Papamoa and selected Western Bay of Plenty locations. The address matters because access, exposure, travel, neighbouring properties and council jurisdiction can influence the delivery plan. Send the location with photos or current drawings for review."],
    ],
  },
  "services/house-extensions-tauranga.html": {
    kicker: "House extensions across Tauranga",
    heading: "Plan the connection between the existing home and the addition.",
    paragraphs: [
      "A Tauranga extension is not simply a small new build. The new foundation, structure, roof, cladding, services and internal finishes must connect to an occupied and weather-exposed existing house. Setbacks, site coverage, access, drainage, ground conditions and the condition of the original building all affect whether the proposed design is practical to construct.",
      "DELVIK reviews the extension drawings alongside the existing layout and site. Construction planning covers temporary weather protection, demolition sequence, structural support, service changes, material access and the order in which old and new work are closed in. Early buildability input can identify details that would otherwise become expensive decisions during construction.",
      "The experience behind DELVIK includes residential framing, cladding, joinery installation, high-spec finishes and multi-unit construction. That hands-on background is relevant at the junctions where extensions most often become difficult. The projects section identifies the professional context of that work without presenting another contractor's project as a DELVIK contract.",
    ],
    links: [
      ["Use the renovation cost guide", costGuide],
      ["Compare home renovations", "/services/home-renovations-tauranga"],
      ["Send extension plans", "/contact-build?project=extension"],
    ],
    faqs: [
      ["How much does a house extension cost in Tauranga in 2026?", "Extension cost changes with size, structure, roof form, ground work, access, services and whether the new area contains a kitchen or bathroom. The DELVIK renovation cost guide includes an early per-square-metre feasibility range and explains why a smaller wet-area extension can cost more per square metre than a larger living space. It is not a substitute for project pricing.", costGuide],
      ["Do I need building consent for a house extension in Tauranga?", "Yes. An extension is additional building work and normally requires building consent. Planning rules, site coverage, boundaries, natural hazards, drainage or engineering may also affect the proposal. The designer and council should confirm the complete approval pathway for the specific property before construction is programmed."],
      ["How long does a typical house extension take?", "There is no responsible single duration without drawings and site information. Design, engineering and consent happen before construction, and the build period depends on excavation, structure, weather-tightness, services and interior scope. DELVIK prepares the working programme after those inputs are known and identifies long-lead decisions early."],
      ["Who will be on site, and who is responsible for the work?", "DELVIK is led by Thiago Cortes, a Licensed Building Practitioner. The project structure identifies who supervises restricted building work, which specialists provide design or certification and which subcontractors deliver each trade. The client has one direct building contact for programme, site questions and approved changes."],
      ["Do you build extensions in Mount Maunganui, Papamoa and Western Bay of Plenty?", "Yes, where the site, scope and programme are a suitable fit. DELVIK works across Tauranga, Mount Maunganui, Papamoa and selected Western Bay of Plenty locations. Provide the address because access, exposure, existing services and travel requirements need to be considered before confirming the delivery approach."],
    ],
  },
  "services/commercial-builders-tauranga.html": {
    kicker: "Light commercial construction in Tauranga",
    heading: "Coordinate the work around access, safety and business operations.",
    paragraphs: [
      "Commercial fit-outs and upgrades in Tauranga often take place beside staff, customers, tenants or other trades. The construction plan must account for access, deliveries, noise, dust, isolations, emergency routes and the hours when disruptive work can occur. A short scope does not automatically mean a simple project when operations must continue around it.",
      "DELVIK undertakes suitable light-commercial fit-outs, internal upgrades, carpentry packages, structural work and multi-trade coordination. Before pricing, the review identifies the landlord or owner requirements, consent status, design responsibilities, shutdowns, client-supplied items and handover documentation. SiteWise Green systems support a structured approach to hazards and site records.",
      "Thiago's documented experience includes structural carpentry in commercial environments and site delivery across residential and high-spec work. The commercial case study explains the scope performed without attributing the wider main contract to DELVIK. This provides useful evidence of coordination and construction experience while keeping the claim accurate.",
    ],
    links: [
      ["View commercial construction experience", "/projects/commercial-construction-experience"],
      ["Review project information before pricing", "/insights/information-builder-needs-before-pricing"],
      ["Discuss a commercial project", "/contact-build?project=light-commercial"],
    ],
    faqs: [
      ["How much does light commercial construction cost in Tauranga in 2026?", "Cost depends on the existing premises, design, services, fire requirements, finishes, working hours and whether the business remains operational. DELVIK prices from the defined scope and site constraints rather than publishing a generic rate. The renovation cost guide is residential, but its explanation of allowances, exclusions and contingency is also useful for early commercial planning.", costGuide],
      ["Do I need building consent for a commercial fit-out or upgrade?", "It depends on the work. Structural changes, specified systems, accessibility, fire, plumbing, change of use and other Building Code matters may require consent or specialist input. Confirm the requirements with the designer, building owner and Tauranga City Council before work starts. DELVIK coordinates construction against the approved information provided for the project."],
      ["How long does a typical fit-out or commercial upgrade take?", "Programme depends on design readiness, approvals, procurement, access windows and the extent of services work. DELVIK builds a sequence around the actual site and operating constraints. Shutdowns, noisy work, inspections and client decisions are identified as programme events instead of being treated as informal assumptions."],
      ["Who will be on site, and who is responsible for the work?", "Thiago Cortes provides direct builder leadership for DELVIK projects. The site structure, safety responsibilities, subcontractor packages and reporting expectations are agreed before mobilisation. Specialist design and certification remain with the appropriately qualified parties, while DELVIK coordinates the construction activities within the accepted scope."],
      ["Do you undertake commercial work outside Tauranga city centre?", "Yes. DELVIK considers suitable light-commercial projects across Tauranga, Mount Maunganui, Papamoa and selected Western Bay of Plenty locations. The first review covers the address, operating hours, access, consent status, programme and work type before confirming fit and availability."],
    ],
  },
  "services/design-and-build-tauranga.html": {
    kicker: "Design and build coordination in Tauranga",
    heading: "Bring construction input into the design before details are locked.",
    paragraphs: [
      "A design-and-build pathway should connect the client's brief, site information, consultants, approvals, selections and construction budget. In Tauranga, site access, ground conditions, coastal exposure, planning controls and services can influence decisions early. A visually complete concept is not necessarily ready for pricing or construction if those inputs remain unresolved.",
      "DELVIK contributes practical buildability and delivery input, helps define the information needed from designers and engineers and coordinates the construction side of the project. The service does not replace specialist design or council approval. It creates a clear interface between the people responsible for design and the builder responsible for organising work on site.",
      "The experience behind DELVIK spans new homes, high-spec residential work, multi-unit townhouses and commercial carpentry. That background supports early review of sequencing, trade interfaces, temporary works and details that affect installation. Documented case studies show the work context and avoid claiming responsibility for contracts held by previous employers or main contractors.",
    ],
    links: [
      ["Review new-home delivery", "/services/new-home-builders-tauranga"],
      ["Check project readiness", "/project-readiness"],
      ["Discuss design and build", "/contact-build?project=design-build"],
    ],
    faqs: [
      ["How much does design and build cost in Tauranga in 2026?", "Total cost depends on the land, brief, design, consultants, approvals, specification and construction scope. DELVIK does not combine those unknowns into one advertised rate. The renovation cost guide demonstrates how to separate build cost, professional fees, council charges and contingency; a design-and-build project needs the same discipline with its own project data.", costGuide],
      ["Do I need building consent for a design-and-build project?", "New homes, extensions and structural alterations normally require building consent. Resource consent, engineering, drainage or other approvals may also apply. Designers and council determine the approval requirements. DELVIK's role is to coordinate construction input and build from the approved plans and specifications once the project reaches that stage."],
      ["How long does a typical design-and-build project take?", "The total programme includes briefing, investigations, design, consultant coordination, consent, procurement and construction. Each stage depends on the project's complexity and how quickly decisions are made. DELVIK helps identify dependencies and prepares a project-specific sequence instead of presenting one duration that cannot be supported before the brief and site are known."],
      ["Who will be responsible for the design and the work on site?", "Design responsibility remains with the appropriately qualified designer, engineer or specialist. DELVIK is led by Thiago Cortes and coordinates the agreed construction scope and site delivery. The appointment, deliverables and communication route for every party should be written down before the project moves into detailed pricing or construction."],
      ["Do you offer design and build in Mount Maunganui, Papamoa and Western Bay of Plenty?", "Yes, for suitable projects across Tauranga, Mount Maunganui, Papamoa and selected Western Bay of Plenty locations. The first discussion covers the site, brief, budget range, consultant status and target timing so the appropriate next step can be identified."],
    ],
  },
  "services/property-development-tauranga.html": {
    kicker: "Small property development in Tauranga",
    heading: "Test buildability and delivery assumptions before they reach site.",
    paragraphs: [
      "Tauranga infill and small multi-unit projects need more than a headline construction rate. Site access, existing buildings, earthworks, retaining, services, fire separation, staging and neighbouring properties can affect both cost and programme. Early construction input is most valuable before the design, acquisition or funding model assumes those issues are already solved.",
      "DELVIK supports suitable small developments with buildability review, scope definition, construction planning, trade coordination and site delivery input. Designers, planners, engineers, surveyors, quantity surveyors and lenders retain their specialist responsibilities. The builder's role is to make construction assumptions visible and connect the approved information to a workable sequence.",
      "Thiago's documented experience includes multi-unit townhouse carpentry and coordination across repeated homes. That project experience is identified as work completed in employed or subcontract roles rather than a DELVIK main contract. It remains relevant evidence of consistency, sequencing and quality control across multiple units.",
    ],
    links: [
      ["View multi-unit experience", "/projects/multi-unit-townhouse-experience"],
      ["Review information needed before pricing", "/insights/information-builder-needs-before-pricing"],
      ["Discuss a development", "/contact-build?project=development"],
    ],
    faqs: [
      ["How much does a small property development cost in Tauranga in 2026?", "There is no responsible development rate without the site, yield, drawings, infrastructure, specification and programme. Building cost is only one part of total development cost. The DELVIK renovation guide explains the treatment of construction allowances and contingency, but development feasibility should also include land, consultants, council, finance, sales and holding costs.", costGuide],
      ["What consents are required for a Tauranga development?", "Requirements depend on the site and proposal and may include resource consent, subdivision, building consent, engineering approvals, service connections and development contributions. The planner, designer, engineers and council determine the pathway. DELVIK reviews construction information and delivery implications but does not replace those professional or statutory roles."],
      ["How long does a typical small development take?", "The programme includes due diligence, design, approvals, procurement, construction and completion documentation. Site complexity, council processing, infrastructure and funding conditions can materially affect timing. DELVIK prepares construction sequencing from the actual consented scope and highlights dependencies rather than relying on a generic development duration."],
      ["Who will be on site, and who is responsible for the work?", "DELVIK is led by Thiago Cortes, a Licensed Building Practitioner. Site leadership, supervision, subcontractor scopes, design responsibilities and reporting expectations are defined for each project. Consultants remain responsible for their documents and certifications; DELVIK coordinates the accepted construction scope and site activities."],
      ["Do you work on developments in Mount Maunganui, Papamoa and Western Bay of Plenty?", "DELVIK reviews suitable small developments across Tauranga, Mount Maunganui, Papamoa and selected Western Bay of Plenty locations. Provide the address, concept or consent drawings, target yield, approval status and proposed timing so the site and delivery requirements can be assessed."],
    ],
  },
  "areas/mount-maunganui-builder.html": {
    kicker: "Building services in Mount Maunganui",
    heading: "New homes, renovations and extensions with direct builder leadership.",
    paragraphs: [
      "DELVIK builds suitable new homes, renovations and extensions in Mount Maunganui. Established streets can bring tight access, active neighbours, occupied homes and limited space for deliveries or material storage. Coastal exposure also makes the designer's durability, cladding, roofing and flashing selections important to the construction review.",
      "Services include early buildability review, residential carpentry, structural alterations, extensions, renovation coordination, selected light-commercial upgrades and construction delivery. The project scope identifies what is consented, what remains a client selection and which existing conditions need investigation before a reliable price or programme can be prepared.",
      "The experience behind DELVIK includes high-spec residential carpentry, new-build cladding, multi-unit townhouses and commercial construction environments. These case studies describe Thiago's professional role accurately and do not present previous employers' contracts as DELVIK projects. They demonstrate the site skills applied to suitable Mount Maunganui work today.",
    ],
    links: [
      ["Explore home renovations", "/services/home-renovations-tauranga"],
      ["Explore house extensions", "/services/house-extensions-tauranga"],
      ["Send a Mount Maunganui enquiry", "/contact-build"],
    ],
    faqs: [
      ["How much does a building project cost in Mount Maunganui in 2026?", "Cost depends on the project type, site access, existing conditions, structural work, services and finish level. DELVIK's Tauranga renovation cost guide provides indicative ranges for common renovation and extension scopes and explains the required allowances. A reliable Mount Maunganui price still needs the address, plans, selections and current consent information.", costGuide],
      ["Do I need building consent for a renovation or extension in Mount Maunganui?", "Structural alterations, extensions and some plumbing or drainage changes commonly require building consent. Planning controls or other approvals may also apply to the property. Confirm the pathway with Tauranga City Council and the appropriate designer before construction starts. Exempt work must still comply with the Building Code."],
      ["How long does a typical Mount Maunganui building project take?", "Timing depends on scope, design, approvals, site access, procurement and whether the property remains occupied. DELVIK prepares a project-specific programme after reviewing those inputs. Temporary protection, delivery windows and decisions that affect the critical path are identified before work is mobilised."],
      ["Who will be on site, and who is responsible for the work?", "DELVIK is led by Thiago Cortes, a Licensed Building Practitioner and BCITO-qualified carpenter. The agreed project structure identifies supervision, subcontractor responsibilities and specialist design roles. Clients communicate directly with the builder responsible for coordinating the accepted site scope."],
      ["What work does DELVIK undertake in Mount Maunganui?", "DELVIK undertakes suitable new homes, renovations, house extensions, residential carpentry and selected light-commercial upgrades. Fit depends on the site, information available and programme. Send the property address and current plans or photos for a direct review."],
    ],
  },
  "areas/papamoa-builder.html": {
    kicker: "Building services in Papamoa",
    heading: "New homes, renovations and extensions planned for the actual site.",
    paragraphs: [
      "DELVIK builds suitable new homes, renovations and extensions across Papamoa. Projects range from new subdivision sites to alterations within established neighbourhoods. Access, wind and exposure, ground information, services, neighbouring properties and the stage of design all influence how the construction should be planned.",
      "Residential services include new-home delivery, framing and cladding, internal and structural renovations, house extensions, exterior junction work and early buildability review. DELVIK works from the approved project information and identifies missing selections, engineering or investigations before they become informal site assumptions.",
      "The project record includes documented residential carpentry and exterior-cladding experience in Papamoa, together with wider New Zealand new-build, high-spec and multi-unit experience. Where the wider contract was held by another company, DELVIK states that context. The purpose is to show the work performed without inventing a DELVIK contract history.",
    ],
    links: [
      ["Explore new-home building", "/services/new-home-builders-tauranga"],
      ["Explore Papamoa renovations", "/services/home-renovations-tauranga"],
      ["Send a Papamoa enquiry", "/contact-build"],
    ],
    faqs: [
      ["How much does a building project cost in Papamoa in 2026?", "The answer depends on whether the project is a new home, room renovation, structural alteration or extension. Site work, services, access and specification materially change the result. DELVIK's Tauranga renovation cost guide provides indicative renovation and extension ranges, exclusions and contingency guidance; a Papamoa quote requires project-specific information.", costGuide],
      ["Do I need building consent for a renovation or extension in Papamoa?", "Structural alterations and extensions normally require building consent, while some low-risk work may be exempt. Plumbing, drainage, planning or engineering requirements can also apply. Confirm the pathway with Tauranga City Council and the appropriate qualified professionals. All work must comply with the Building Code even when consent is not required."],
      ["How long does a typical Papamoa building project take?", "Programme depends on design readiness, consent, site work, structure, product lead times and trade coordination. DELVIK builds a sequence from the actual scope rather than advertising one duration for every project. Client decisions and information needed to protect the programme are identified before construction starts."],
      ["Who will be on site, and who is responsible for the work?", "Thiago Cortes leads DELVIK and provides direct builder communication. Supervision, restricted building work, subcontractor scopes and specialist design responsibilities are defined for the project. The client knows who is coordinating the accepted work and how decisions or variations are approved."],
      ["What work does DELVIK undertake in Papamoa?", "DELVIK undertakes suitable new homes, home renovations, house extensions, residential carpentry and selected project-delivery work in Papamoa. Send the site address, photos, plans and consent stage so access, information and programme can be reviewed before confirming fit."],
    ],
  },
  "areas/western-bay-of-plenty-builder.html": {
    kicker: "Building services across Western Bay of Plenty",
    heading: "Residential construction planned around location, access and scope.",
    paragraphs: [
      "DELVIK undertakes suitable new homes, renovations and extensions in Western Bay of Plenty locations including Omokoroa, Te Puna and other areas that fit the project scope and programme. Travel, deliveries, trade availability, services and site access should be reviewed early rather than treated as a standard Tauranga allowance.",
      "The service can include buildability review, residential carpentry, renovation and extension delivery, new-home construction input and selected light-commercial work. The first review covers the address, drawings, engineering, approval stage, desired timing and any constraints created by an occupied property or an existing building.",
      "DELVIK is led by Thiago Cortes, a Licensed Building Practitioner and BCITO-qualified carpenter with more than eight years of New Zealand experience. Documented work includes new builds, high-spec residential carpentry, multi-unit townhouses and commercial construction. The project pages distinguish personal trade experience from contracts held directly by DELVIK.",
    ],
    links: [
      ["Explore DELVIK projects and experience", "/projects"],
      ["Check your project readiness", "/project-readiness"],
      ["Send a Western Bay enquiry", "/contact-build"],
    ],
    faqs: [
      ["How much does a building project cost in Western Bay of Plenty in 2026?", "Cost depends on project type, site work, access, travel, services, structure and specification. DELVIK's Tauranga renovation cost guide provides useful renovation and extension planning ranges, but location-specific delivery requirements must be added. A reliable price needs the address and current project information.", costGuide],
      ["Do I need building consent for a renovation or extension in Western Bay of Plenty?", "Structural alterations, extensions and some plumbing or drainage changes commonly require consent. The relevant council and design professionals should confirm planning, building, engineering and infrastructure requirements for the property. Work that is exempt from consent must still comply with the Building Code."],
      ["How long does a typical Western Bay building project take?", "Timing depends on design, approvals, procurement, location, site access and the construction scope. DELVIK prepares a project-specific programme once those inputs are available. Travel and delivery planning are included rather than being left as day-to-day site issues."],
      ["Who will be on site, and who is responsible for the work?", "DELVIK is led by Thiago Cortes, a Licensed Building Practitioner. The agreed delivery plan identifies supervision, subcontractor packages and specialist responsibilities. Clients receive direct communication on site progress, information required and approved scope changes."],
      ["Which Western Bay of Plenty locations do you work in?", "DELVIK reviews suitable work in Omokoroa, Te Puna and other Western Bay of Plenty locations alongside Tauranga, Mount Maunganui and Papamoa. Availability depends on scope, travel and programme. Send the property address first so the delivery requirements can be assessed accurately."],
    ],
  },
};

const escapeHtml = (value) =>
  value.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");

for (const [file, page] of Object.entries(pages)) {
  let html = fs.readFileSync(file, "utf8");
  if (html.includes('class="seo-detail"')) throw new Error(`${file}: already expanded`);

  const detail = `
      <section class="section seo-detail">
        <div class="container article-container">
          <p class="section-kicker">${page.kicker}</p>
          <h2 class="section__title">${page.heading}</h2>
          ${page.paragraphs.map((paragraph) => `<p>${paragraph}</p>`).join("\n          ")}
          <ul class="check-list seo-link-list">
            ${page.links.map(([label, href]) => `<li><a href="${href}">${label}</a></li>`).join("\n            ")}
          </ul>
        </div>
      </section>
      <section class="section section--alt seo-faq" aria-labelledby="faq-title">
        <div class="container">
          <h2 class="section__title" id="faq-title">Frequently asked questions</h2>
          <div class="grid">
            ${page.faqs.map(([question, answer, href]) => `<article class="card"><h3>${question}</h3><p>${answer}${href ? ` <a href="${href}">Read the 2026 cost guide.</a>` : ""}</p></article>`).join("\n            ")}
          </div>
        </div>
      </section>
`;
  html = html.replace(/(\s*<section class="cta">)/, `${detail}$1`);

  const schema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: page.faqs.map(([question, answer, href]) => ({
      "@type": "Question",
      name: question,
      acceptedAnswer: {
        "@type": "Answer",
        text: `${answer}${href ? " Read the 2026 cost guide." : ""}`,
      },
    })),
  };
  const schemaBlock = `    <script type="application/ld+json">\n${JSON.stringify(schema, null, 2)}\n    </script>\n`;
  html = html.replace("  </head>", `${schemaBlock}  </head>`);
  fs.writeFileSync(file, html);
}

console.log(`Expanded ${Object.keys(pages).length} SEO pages with matched FAQ schema.`);
