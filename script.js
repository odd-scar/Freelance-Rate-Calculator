const currency = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0
});

const calculatorForm = document.querySelector("#calculator-form");
const leadForm = document.querySelector("#lead-form");
const copyButton = document.querySelector("#copy-summary");
const copyStatus = document.querySelector("#copy-status");
const advancedToggle = document.querySelector("#advancedMode");
const advancedFields = document.querySelector("#advancedFields");
const presetButtons = document.querySelectorAll("[data-preset]");

const presets = {
  beginner: {
    income: 45000,
    overhead: 3000,
    taxRate: 25,
    hoursPerWeek: 12,
    weeksPerYear: 46,
    profitMargin: 10,
    projectHours: 8,
    rushMultiplier: 1,
    advancedMode: false
  },
  creative: {
    income: 65000,
    overhead: 6000,
    taxRate: 25,
    hoursPerWeek: 18,
    weeksPerYear: 46,
    profitMargin: 12,
    projectHours: 16,
    rushMultiplier: 1,
    advancedMode: false
  },
  consultant: {
    income: 110000,
    overhead: 12000,
    taxRate: 28,
    hoursPerWeek: 24,
    weeksPerYear: 46,
    profitMargin: 18,
    projectHours: 24,
    rushMultiplier: 1.15,
    advancedMode: true
  },
  advanced: {
    income: 90000,
    overhead: 12000,
    taxRate: 25,
    hoursPerWeek: 22,
    weeksPerYear: 46,
    profitMargin: 15,
    projectHours: 18,
    rushMultiplier: 1,
    advancedMode: true
  }
};

function byId(id) {
  return document.getElementById(id);
}

function formatMoney(value) {
  return currency.format(Number.isFinite(value) ? value : 0);
}

function setAdvancedMode(enabled) {
  advancedToggle.checked = enabled;
  advancedFields.classList.toggle("is-hidden", !enabled);
}

function setActivePreset(presetName) {
  presetButtons.forEach((button) => {
    button.classList.toggle("active", button.dataset.preset === presetName);
  });
}

function getTimelineLabel(multiplier) {
  if (multiplier >= 1.5) {
    return "urgent delivery";
  }

  if (multiplier >= 1.3) {
    return "fast turnaround";
  }

  if (multiplier > 1) {
    return "accelerated timeline";
  }

  return "standard timeline";
}

function applyPreset(presetName) {
  const preset = presets[presetName];
  if (!preset) {
    return;
  }

  byId("income").value = preset.income;
  byId("overhead").value = preset.overhead;
  byId("taxRate").value = preset.taxRate;
  byId("hoursPerWeek").value = preset.hoursPerWeek;
  byId("weeksPerYear").value = preset.weeksPerYear;
  byId("profitMargin").value = preset.profitMargin;
  byId("projectHours").value = preset.projectHours;
  byId("rushMultiplier").value = String(preset.rushMultiplier);
  setAdvancedMode(preset.advancedMode);
  setActivePreset(presetName);
  calculateRates();
}

function calculateRates() {
  const income = Number(byId("income").value) || 0;
  const overhead = Number(byId("overhead").value) || 0;
  const hoursPerWeek = Number(byId("hoursPerWeek").value) || 1;
  const weeksPerYear = Number(byId("weeksPerYear").value) || 1;
  const projectHours = Number(byId("projectHours").value) || 1;
  const rushMultiplier = Number(byId("rushMultiplier").value) || 1;

  const usingAdvanced = advancedToggle.checked;
  const taxRate = usingAdvanced ? (Number(byId("taxRate").value) || 0) / 100 : 0.25;
  const profitMargin = usingAdvanced ? (Number(byId("profitMargin").value) || 0) / 100 : 0.1;

  const annualHours = Math.max(hoursPerWeek * weeksPerYear, 1);
  const baseRevenue = income + overhead;
  const withTax = baseRevenue / Math.max(1 - taxRate, 0.1);
  const targetRevenue = withTax * (1 + profitMargin);
  const hourlyRate = targetRevenue / annualHours;
  const taxReserve = targetRevenue - (baseRevenue * (1 + profitMargin));
  const monthlyTarget = targetRevenue / 12;
  const projectQuote = hourlyRate * projectHours * rushMultiplier;
  const modeLabel = usingAdvanced ? "advanced" : "guided";
  const timelineLabel = getTimelineLabel(rushMultiplier);
  const revisionRounds = projectHours >= 20 ? "up to 2 rounds of revisions" : "1 round of revisions";

  byId("hourlyRate").textContent = formatMoney(hourlyRate);
  byId("monthlyTarget").textContent = formatMoney(monthlyTarget);
  byId("projectQuote").textContent = formatMoney(projectQuote);
  byId("annualHours").textContent = annualHours.toLocaleString("en-US");
  byId("taxReserve").textContent = formatMoney(taxReserve);
  byId("rateContext").textContent =
    `Using ${modeLabel} mode, this assumes ${annualHours.toLocaleString("en-US")} billable hours a year, a ${Math.round(taxRate * 100)}% tax set-aside, and a ${Math.round(profitMargin * 100)}% safety margin.`;

  byId("quoteSummary").value =
    `Project Quote\n\n` +
    `Estimated investment: ${formatMoney(projectQuote)}\n` +
    `Timeline: ${timelineLabel}\n` +
    `Estimated scope: approximately ${projectHours} hours of work\n\n` +
    `This quote is based on the current project scope and includes planning, execution, and ${revisionRounds}.\n\n` +
    `If the scope or deliverables expand, the final quote can be adjusted before work begins.`;
}

calculatorForm.addEventListener("submit", (event) => {
  event.preventDefault();
  calculateRates();
});

calculatorForm.addEventListener("input", () => {
  calculateRates();
});

advancedToggle.addEventListener("change", () => {
  setAdvancedMode(advancedToggle.checked);
  calculateRates();
});

presetButtons.forEach((button) => {
  button.addEventListener("click", () => {
    applyPreset(button.dataset.preset);
  });
});

copyButton.addEventListener("click", async () => {
  calculateRates();

  try {
    await navigator.clipboard.writeText(byId("quoteSummary").value);
    copyStatus.textContent = "Copied.";
  } catch (error) {
    copyStatus.textContent = "Copy failed. Select the text manually.";
  }
});

leadForm.addEventListener("submit", (event) => {
  event.preventDefault();

  const leadName = byId("leadName").value.trim();
  const leadEmail = byId("leadEmail").value.trim();
  const leads = JSON.parse(localStorage.getItem("solorate-leads") || "[]");

  leads.push({
    name: leadName,
    email: leadEmail,
    capturedAt: new Date().toISOString()
  });

  localStorage.setItem("solorate-leads", JSON.stringify(leads));

  byId("lead-message").textContent =
    `${leadName || "You"} are on the list. Connect this form to your email tool after deploy and send the pricing sheet plus your affiliate recommendations automatically.`;

  leadForm.reset();
});

applyPreset("beginner");
