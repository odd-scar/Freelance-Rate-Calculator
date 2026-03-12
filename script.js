const currency = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0
});

const dateFormatter = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric"
});

const calculatorForm = document.querySelector("#calculator-form");
const leadForm = document.querySelector("#lead-form");
const copyButton = document.querySelector("#copy-summary");
const exportPdfButton = document.querySelector("#export-pdf");
const copyStatus = document.querySelector("#copy-status");
const advancedToggle = document.querySelector("#advancedMode");
const advancedFields = document.querySelector("#advancedFields");
const presetButtons = document.querySelectorAll("[data-preset]");
let currentQuoteText = "";
let currentQuoteData = null;

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
    advancedMode: false,
    businessName: "SoloRate Studio",
    clientName: "Client Name",
    projectName: "Website project quote"
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
    advancedMode: false,
    businessName: "Northlight Creative",
    clientName: "Client Name",
    projectName: "Brand photography package"
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
    advancedMode: true,
    businessName: "Summit Advisory",
    clientName: "Client Name",
    projectName: "Consulting engagement"
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
    advancedMode: true,
    businessName: "Your Business Name",
    clientName: "Client Name",
    projectName: "Client project quote"
  }
};

function byId(id) {
  return document.getElementById(id);
}

function formatMoney(value) {
  return currency.format(Number.isFinite(value) ? value : 0);
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#39;");
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
    return "Urgent delivery";
  }
  if (multiplier >= 1.3) {
    return "Fast turnaround";
  }
  if (multiplier > 1) {
    return "Accelerated timeline";
  }
  return "Standard timeline";
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
  byId("businessName").value = preset.businessName;
  byId("clientName").value = preset.clientName;
  byId("projectName").value = preset.projectName;
  setAdvancedMode(preset.advancedMode);
  setActivePreset(presetName);
  calculateRates();
}

function buildPdfMarkup(data) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(data.projectName)} | Quote</title>
  <style>
    body { margin: 0; font-family: Arial, sans-serif; color: #201b16; background: #f3ede4; }
    .sheet { width: min(900px, calc(100% - 48px)); margin: 32px auto; background: white; border-radius: 24px; padding: 40px; box-shadow: 0 20px 40px rgba(0,0,0,0.08); }
    .top, .meta, .grid { display: grid; gap: 20px; }
    .top, .meta { grid-template-columns: 1fr auto; }
    .label { margin: 0 0 6px; font-size: 11px; letter-spacing: 0.14em; text-transform: uppercase; color: #8b3418; }
    h1, h2, h3, p { margin: 0; }
    h1 { font-size: 34px; }
    h2 { font-size: 22px; }
    .amount { font-size: 32px; font-weight: 700; }
    .muted { color: #65594f; line-height: 1.6; }
    .section { padding: 22px 0; border-top: 1px solid rgba(32,27,22,0.1); }
    .grid { grid-template-columns: repeat(2, 1fr); }
    .message { padding: 18px; border-radius: 16px; background: #f8f4ee; }
    .actions { margin-top: 28px; }
    button { padding: 12px 18px; border: 0; border-radius: 999px; background: #201b16; color: white; font-weight: 700; cursor: pointer; }
    @media print {
      body { background: white; }
      .sheet { width: 100%; margin: 0; box-shadow: none; border-radius: 0; padding: 24px; }
      .actions { display: none; }
    }
    @media (max-width: 640px) {
      .top, .meta, .grid { grid-template-columns: 1fr; }
      .sheet { width: calc(100% - 24px); padding: 24px; margin: 12px auto; }
    }
  </style>
</head>
<body>
  <main class="sheet">
    <section class="top">
      <div>
        <p class="label">Prepared by</p>
        <h1>${escapeHtml(data.businessName)}</h1>
      </div>
      <div>
        <p class="label">Estimated investment</p>
        <p class="amount">${escapeHtml(data.investment)}</p>
      </div>
    </section>
    <section class="section meta">
      <div>
        <p class="label">Prepared for</p>
        <h2>${escapeHtml(data.clientName)}</h2>
      </div>
      <div>
        <p class="label">Date</p>
        <p class="muted">${escapeHtml(data.quoteDate)}</p>
      </div>
    </section>
    <section class="section meta">
      <div>
        <p class="label">Project</p>
        <h2>${escapeHtml(data.projectName)}</h2>
      </div>
      <div>
        <p class="label">Timeline</p>
        <p class="muted">${escapeHtml(data.timelineLabel)}</p>
      </div>
    </section>
    <section class="section grid">
      <div>
        <p class="label">Estimated scope</p>
        <p class="muted">${escapeHtml(data.scopeText)}</p>
      </div>
      <div>
        <p class="label">Includes</p>
        <p class="muted">${escapeHtml(data.includesText)}</p>
      </div>
    </section>
    <section class="section">
      <p class="label">Notes</p>
      <div class="message">
        <p class="muted">${escapeHtml(data.bodyText)}</p>
      </div>
    </section>
    <section class="actions">
      <button onclick="window.print()">Save as PDF</button>
    </section>
  </main>
</body>
</html>`;
}

function openPdfLayout() {
  if (!currentQuoteData) {
    calculateRates();
  }

  const pdfWindow = window.open("", "_blank", "noopener,noreferrer");
  if (!pdfWindow) {
    copyStatus.textContent = "Pop-up blocked. Allow pop-ups to open the PDF layout.";
    return;
  }

  pdfWindow.document.open();
  pdfWindow.document.write(buildPdfMarkup(currentQuoteData));
  pdfWindow.document.close();
}

function calculateRates() {
  const income = Number(byId("income").value) || 0;
  const overhead = Number(byId("overhead").value) || 0;
  const hoursPerWeek = Number(byId("hoursPerWeek").value) || 1;
  const weeksPerYear = Number(byId("weeksPerYear").value) || 1;
  const projectHours = Number(byId("projectHours").value) || 1;
  const rushMultiplier = Number(byId("rushMultiplier").value) || 1;
  const businessName = byId("businessName").value.trim() || "Your Business Name";
  const clientName = byId("clientName").value.trim() || "Client Name";
  const projectName = byId("projectName").value.trim() || "Client project quote";

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
  const quoteDate = dateFormatter.format(new Date());
  const scopeText = `Approximately ${projectHours} hours of work`;
  const includesText = `Planning, execution, and ${revisionRounds}`;
  const bodyText = "This quote is based on the current scope and timeline discussed. If deliverables expand, the final quote can be adjusted before work begins.";
  const investmentText = formatMoney(projectQuote);

  byId("hourlyRate").textContent = formatMoney(hourlyRate);
  byId("monthlyTarget").textContent = formatMoney(monthlyTarget);
  byId("projectQuote").textContent = investmentText;
  byId("annualHours").textContent = annualHours.toLocaleString("en-US");
  byId("taxReserve").textContent = formatMoney(taxReserve);
  byId("rateContext").textContent =
    `Using ${modeLabel} mode, this assumes ${annualHours.toLocaleString("en-US")} billable hours a year, a ${Math.round(taxRate * 100)}% tax set-aside, and a ${Math.round(profitMargin * 100)}% safety margin.`;

  byId("previewBusinessName").textContent = businessName;
  byId("previewClientName").textContent = clientName;
  byId("previewDate").textContent = quoteDate;
  byId("previewInvestment").textContent = investmentText;
  byId("previewProjectName").textContent = projectName;
  byId("previewTimeline").textContent = timelineLabel;
  byId("previewScope").textContent = scopeText;
  byId("previewIncludes").textContent = includesText;
  byId("previewBody").textContent = bodyText;

  currentQuoteData = {
    businessName,
    clientName,
    projectName,
    quoteDate,
    investment: investmentText,
    timelineLabel,
    scopeText,
    includesText,
    bodyText
  };

  currentQuoteText =
    `${businessName}\n` +
    `Prepared for: ${clientName}\n` +
    `${projectName}\n` +
    `Prepared ${quoteDate}\n\n` +
    `Estimated investment: ${investmentText}\n` +
    `Timeline: ${timelineLabel}\n` +
    `Estimated scope: ${scopeText}\n` +
    `Includes: ${includesText}\n\n` +
    `${bodyText}`;

  byId("quoteSummary").value = currentQuoteText;
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
    await navigator.clipboard.writeText(currentQuoteText);
    copyStatus.textContent = "Copied.";
  } catch (error) {
    copyStatus.textContent = "Copy failed. Select the text manually.";
  }
});

exportPdfButton.addEventListener("click", () => {
  calculateRates();
  openPdfLayout();
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
