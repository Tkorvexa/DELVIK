(function () {
  "use strict";
  const form = document.getElementById("readinessForm");
  if (!form) return;
  const steps = Array.from(form.querySelectorAll(".readiness-step"));
  const next = document.getElementById("readinessNext");
  const back = document.getElementById("readinessBack");
  const message = document.getElementById("readinessMessage");
  const progress = document.getElementById("readinessProgress");
  const bar = document.getElementById("readinessBar");
  const result = document.getElementById("readinessResult");
  let current = 0;

  function render() {
    steps.forEach(function (step, index) { step.classList.toggle("is-active", index === current); });
    progress.textContent = (current + 1) + " of " + steps.length;
    bar.style.width = (((current + 1) / steps.length) * 100) + "%";
    back.hidden = current === 0;
    next.textContent = current === steps.length - 1 ? "See my result" : "Continue";
    message.hidden = true;
  }

  function recommendation(values) {
    const pricingReady = values.design === "consented" || values.design === "detailed";
    const budgetReady = values.budget === "funded" || values.budget === "range";
    const siteReady = values.site === "owned" || values.site === "existing-home";
    if (pricingReady && budgetReady && siteReady) return {
      key: "pricing",
      title: "Ready for preliminary pricing",
      text: "Your project has enough definition for a structured builder review. The next step is to send the plans, specifications, location and target programme.",
      list: ["Upload current drawings and specifications", "Confirm any consent conditions", "Identify decisions still affecting scope"]
    };
    if (!siteReady && values.type === "development") return {
      key: "feasibility",
      title: "Site feasibility should come first",
      text: "Before committing to pricing, test the site, planning constraints, access, services and likely buildable yield.",
      list: ["Secure or identify the site", "Review planning and title constraints", "Build an initial feasibility scope"]
    };
    if (!pricingReady) return {
      key: "design",
      title: "Design information is the next constraint",
      text: "A reliable construction price would be premature. Progress the brief and drawings far enough to define structure, finishes and consenting requirements.",
      list: ["Clarify project brief and priorities", "Engage design and engineering input", "Set a realistic budget range"]
    };
    return {
      key: "review",
      title: "A project review is recommended",
      text: "The project is moving in the right direction, but one or two commercial inputs need clarification before meaningful pricing.",
      list: ["Confirm funding and budget range", "Review scope completeness", "Align desired timing with design and consent"]
    };
  }

  next.addEventListener("click", function () {
    const selected = steps[current].querySelector("input:checked");
    if (!selected) { message.hidden = false; return; }
    if (current < steps.length - 1) { current += 1; render(); return; }
    const values = Object.fromEntries(new FormData(form).entries());
    const rec = recommendation(values);
    document.getElementById("readinessTitle").textContent = rec.title;
    document.getElementById("readinessText").textContent = rec.text;
    document.getElementById("readinessList").innerHTML = rec.list.map(function (item) { return "<li>" + item + "</li>"; }).join("");
    const payload = Object.assign({}, values, { readiness: rec.key, recommendation: rec.title, checklist: rec.list });
    try { sessionStorage.setItem("delvik_readiness", JSON.stringify(payload)); } catch (_) {}
    const query = new URLSearchParams({ project: values.type || "", stage: values.design || "", readiness: rec.key, location: values.location || "", budgetReadiness: values.budget || "", timing: values.timing || "" });
    document.getElementById("readinessCta").href = "/contact-build?" + query.toString() + "#contact";
    form.hidden = true;
    result.hidden = false;
    if (window.delvikTrack) window.delvikTrack("readiness_complete", { readiness_result: rec.key, project_type: values.type });
    result.focus();
  });
  back.addEventListener("click", function () { if (current > 0) { current -= 1; render(); } });
  document.getElementById("readinessRestart").addEventListener("click", function () {
    form.reset(); current = 0; result.hidden = true; form.hidden = false; render();
  });
  render();
})();
