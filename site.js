(function () {
  "use strict";

  window.dataLayer = window.dataLayer || [];

  function track(eventName, details) {
    window.dataLayer.push(Object.assign({ event: eventName }, details || {}));
  }

  const attributionKeys = ["utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content", "gclid", "msclkid"];
  const params = new URLSearchParams(window.location.search);
  const attribution = {};

  attributionKeys.forEach(function (key) {
    const value = params.get(key);
    if (value) attribution[key] = value.slice(0, 200);
  });

  if (Object.keys(attribution).length) {
    try {
      localStorage.setItem("delvik_attribution", JSON.stringify(attribution));
    } catch (_) {}
  } else {
    try {
      Object.assign(attribution, JSON.parse(localStorage.getItem("delvik_attribution") || localStorage.getItem("korvexa_attribution") || "{}"));
    } catch (_) {}
  }

  document.querySelectorAll("[data-track]").forEach(function (element) {
    element.addEventListener("click", function () {
      track(element.dataset.track, {
        link_url: element.href || "",
        page_path: window.location.pathname
      });
    });
  });

  document.querySelectorAll('a[href^="tel:"]').forEach(function (link) {
    link.addEventListener("click", function () { track("phone_click", { page_path: location.pathname }); });
  });

  document.querySelectorAll('a[href^="mailto:"]').forEach(function (link) {
    link.addEventListener("click", function () { track("email_click", { page_path: location.pathname }); });
  });

  document.querySelectorAll('a[href*="wa.me"]').forEach(function (link) {
    link.addEventListener("click", function () { track("whatsapp_click", { page_path: location.pathname }); });
  });

  const form = document.getElementById("buildForm");
  if (form) {
    const sourceField = document.getElementById("leadAttribution");
    if (sourceField) sourceField.value = JSON.stringify(attribution);
    form.addEventListener("submit", function () {
      track("lead_submit_attempt", {
        project_type: form.elements.subject ? form.elements.subject.value : "",
        project_stage: form.elements.projectStage ? form.elements.projectStage.value : "",
        budget_range: form.elements.budget ? form.elements.budget.value : ""
      });
    });
  }

  if (!document.querySelector(".mobile-conversion-bar")) {
    const mobileBar = document.createElement("nav");
    mobileBar.className = "mobile-conversion-bar";
    mobileBar.setAttribute("aria-label", "Quick contact");
    mobileBar.innerHTML = '<a href="tel:+642904567964" data-track="mobile_call_click">Call</a><a href="https://wa.me/642904567964?text=Hi%20DELVIK%2C%20I%27d%20like%20to%20discuss%20a%20building%20project." data-track="mobile_whatsapp_click">WhatsApp</a><a href="/contact-build#contact" data-track="mobile_project_click">Send project</a>';
    document.body.appendChild(mobileBar);
    mobileBar.querySelector('a[href^="tel:"]').addEventListener("click", function () { track("phone_click", { page_path: location.pathname, placement: "mobile_bar" }); });
    mobileBar.querySelector('a[href*="wa.me"]').addEventListener("click", function () { track("whatsapp_click", { page_path: location.pathname, placement: "mobile_bar" }); });
    mobileBar.querySelector('a[href*="contact-build"]').addEventListener("click", function () { track("mobile_project_click", { page_path: location.pathname }); });
  }

  if (location.pathname.indexOf("/services/") === 0) {
    const serviceMain = document.querySelector("main");
    if (serviceMain && !document.querySelector(".service-conversion-proof")) {
      const proof = document.createElement("section");
      proof.className = "section section--alt service-conversion-proof";
      proof.innerHTML = '<div class="container"><p class="section-kicker">Local delivery confidence</p><h2 class="section__title">A qualified builder, a clear process and a direct response.</h2><div class="grid"><article class="card"><h3>Verified capability</h3><p>Licensed Building Practitioner, BCITO-qualified carpenter and SiteWise Green systems, backed by more than eight years of New Zealand construction experience.</p></article><article class="card"><h3>Where we work</h3><p>Tauranga, Mount Maunganui, Papamoa and selected Western Bay of Plenty projects, assessed by scope and programme.</p></article><article class="card"><h3>What happens first?</h3><p>Send the location, plans and current stage. We review the information and reply within one business day with the clearest next step.</p></article><article class="card"><h3>Can I start before plans are complete?</h3><p>Yes. The free project check identifies whether design, feasibility, consent or preliminary pricing should come next.</p></article></div><div class="service-conversion-proof__actions"><a class="btn btn--dark" href="/contact-build#contact" data-track="service_proof_enquiry_click">Assess my project</a><a class="btn btn--ghost" href="/project-readiness" data-track="service_proof_check_click">Run the free project check</a></div></div>';
      serviceMain.appendChild(proof);
    }
  }

  window.delvikTrack = track;
  window.korvexaTrack = track;
})();
