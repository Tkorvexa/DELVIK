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
      localStorage.setItem("korvexa_attribution", JSON.stringify(attribution));
    } catch (_) {}
  } else {
    try {
      Object.assign(attribution, JSON.parse(localStorage.getItem("korvexa_attribution") || "{}"));
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

  window.korvexaTrack = track;
})();
