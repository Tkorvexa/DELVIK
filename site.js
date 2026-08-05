(function () {
  "use strict";

  window.dataLayer = window.dataLayer || [];

  const analytics = window.DELVIK_ANALYTICS || {};
  const gtmId = /^GTM-[A-Z0-9]+$/.test(analytics.gtmContainerId || "") ? analytics.gtmContainerId : "";
  const ga4Id = /^G-[A-Z0-9]+$/.test(analytics.ga4MeasurementId || "") ? analytics.ga4MeasurementId : "";
  if (gtmId) {
    window.dataLayer.push({ "gtm.start": Date.now(), event: "gtm.js" });
    const gtmScript = document.createElement("script");
    gtmScript.async = true;
    gtmScript.src = "https://www.googletagmanager.com/gtm.js?id=" + encodeURIComponent(gtmId);
    document.head.appendChild(gtmScript);
  } else if (ga4Id) {
    const gaScript = document.createElement("script");
    gaScript.async = true;
    gaScript.src = "https://www.googletagmanager.com/gtag/js?id=" + encodeURIComponent(ga4Id);
    document.head.appendChild(gaScript);
    window.gtag = function () { window.dataLayer.push(arguments); };
    window.gtag("js", new Date());
    window.gtag("config", ga4Id, { anonymize_ip: true });
  }

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

  window.delvikTrack = track;
  window.korvexaTrack = track;
})();
