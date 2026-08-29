window.DELVIK_ANALYTICS = Object.freeze({
  gtmContainerId: "",
  ga4MeasurementId: "G-HMTZNGE101",
  searchConsoleVerification: ""
});

/* Load the homepage-specific hero layout correction without changing global service-page hero styles. */
if (window.location.pathname === "/" || window.location.pathname === "/index.html") {
  const heroLayoutStylesheet = document.createElement("link");
  heroLayoutStylesheet.rel = "stylesheet";
  heroLayoutStylesheet.href = "/hero-home-layout.css?v=20260829-1";
  document.head.appendChild(heroLayoutStylesheet);
}
