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

  const projectPath = /^\/projects\//.test(location.pathname);
  const projectImages = projectPath
    ? Array.from(document.querySelectorAll(".case-study > img, .project-gallery img"))
    : [];

  if (projectImages.length) {
    document.body.classList.add("project-lightbox-enabled");
    const lightbox = document.createElement("div");
    lightbox.className = "project-lightbox";
    lightbox.hidden = true;
    lightbox.setAttribute("role", "dialog");
    lightbox.setAttribute("aria-modal", "true");
    lightbox.setAttribute("aria-label", "Project photo gallery");
    lightbox.innerHTML = '<button class="project-lightbox__control project-lightbox__close" type="button" aria-label="Close gallery">×</button><button class="project-lightbox__control project-lightbox__prev" type="button" aria-label="Previous photo">‹</button><figure class="project-lightbox__figure"><img class="project-lightbox__image" alt=""><figcaption class="project-lightbox__caption"></figcaption></figure><button class="project-lightbox__control project-lightbox__next" type="button" aria-label="Next photo">›</button>';
    document.body.appendChild(lightbox);

    const displayImage = lightbox.querySelector(".project-lightbox__image");
    const caption = lightbox.querySelector(".project-lightbox__caption");
    const closeButton = lightbox.querySelector(".project-lightbox__close");
    const previousButton = lightbox.querySelector(".project-lightbox__prev");
    const nextButton = lightbox.querySelector(".project-lightbox__next");
    let currentImage = 0;
    let returnFocus = null;

    function showImage(index) {
      currentImage = (index + projectImages.length) % projectImages.length;
      const source = projectImages[currentImage];
      displayImage.src = source.currentSrc || source.src;
      displayImage.alt = source.alt || "Project photo";
      caption.textContent = (source.alt || "Project photo") + " · " + (currentImage + 1) + " / " + projectImages.length;
    }

    function openGallery(index, trigger) {
      returnFocus = trigger;
      showImage(index);
      lightbox.hidden = false;
      document.body.classList.add("project-lightbox-open");
      closeButton.focus();
      track("project_gallery_open", { page_path: location.pathname, image_number: index + 1 });
    }

    function closeGallery() {
      lightbox.hidden = true;
      document.body.classList.remove("project-lightbox-open");
      if (returnFocus) returnFocus.focus();
    }

    projectImages.forEach(function (image, index) {
      image.tabIndex = 0;
      image.setAttribute("role", "button");
      image.setAttribute("aria-label", "Open photo " + (index + 1) + " of " + projectImages.length);
      image.addEventListener("click", function () { openGallery(index, image); });
      image.addEventListener("keydown", function (event) {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          openGallery(index, image);
        }
      });
    });

    closeButton.addEventListener("click", closeGallery);
    previousButton.addEventListener("click", function () { showImage(currentImage - 1); });
    nextButton.addEventListener("click", function () { showImage(currentImage + 1); });
    lightbox.addEventListener("click", function (event) { if (event.target === lightbox) closeGallery(); });
    document.addEventListener("keydown", function (event) {
      if (lightbox.hidden) return;
      if (event.key === "Escape") closeGallery();
      if (event.key === "ArrowLeft") showImage(currentImage - 1);
      if (event.key === "ArrowRight") showImage(currentImage + 1);
    });
  }

  if (!document.querySelector(".whatsapp-float")) {
    const whatsappFloat = document.createElement("a");
    whatsappFloat.className = "whatsapp-float";
    whatsappFloat.href = "https://wa.me/642904567964?text=Hi%20DELVIK%2C%20I%27d%20like%20to%20discuss%20a%20building%20project.";
    whatsappFloat.target = "_blank";
    whatsappFloat.rel = "noopener noreferrer";
    whatsappFloat.setAttribute("aria-label", "Chat with DELVIK on WhatsApp");
    whatsappFloat.title = "Chat on WhatsApp";
    whatsappFloat.innerHTML = '<svg class="whatsapp-float__icon" width="30" height="30" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M12.04 2C6.57 2 2.13 6.43 2.13 11.9c0 1.93.5 3.77 1.46 5.4L2 22l4.84-1.55a9.83 9.83 0 0 0 5.2 1.45h.01c5.47 0 9.9-4.43 9.9-9.9C21.95 6.43 17.51 2 12.04 2zm0 18.08h-.01a8.2 8.2 0 0 1-4.2-1.16l-.3-.18-2.87.92.93-2.8-.2-.29a8.18 8.18 0 1 1 6.65 3.51z"></path><path d="M16.8 14.1c-.26-.13-1.52-.75-1.75-.84-.23-.09-.4-.13-.57.13-.17.26-.65.84-.8 1.01-.15.17-.29.2-.55.07-.26-.13-1.08-.4-2.06-1.28-.76-.67-1.27-1.5-1.42-1.76-.15-.26-.02-.4.11-.53.12-.12.26-.29.39-.44.13-.15.17-.26.26-.44.09-.17.04-.33-.02-.4-.07-.07-.57-1.37-.78-1.87-.2-.49-.41-.43-.57-.43h-.49c-.17 0-.44.06-.67.33-.23.26-.88.86-.88 2.1s.9 2.44 1.03 2.61c.13.17 1.77 2.7 4.28 3.79.6.26 1.06.42 1.42.54.6.19 1.15.16 1.58.1.48-.07 1.52-.62 1.73-1.22.21-.6.21-1.12.15-1.22-.06-.1-.23-.16-.49-.29z"></path></svg>';
    document.body.appendChild(whatsappFloat);
    whatsappFloat.addEventListener("click", function () {
      track("whatsapp_click", { page_path: location.pathname, placement: "floating_button" });
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
