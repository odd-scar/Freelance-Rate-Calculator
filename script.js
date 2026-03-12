const currency = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0
});

const calculatorForm = document.querySelector("#calculator-form");
const leadForm = document.querySelector("#lead-form");
const copyButton = document.querySelector("#copy-summary");
const copyStatus = document.querySelector("#copy-status");

function byId(id) {
  return document.getElementById(id);
}

function formatMoney(value) {
  return currency.format(Number.isFinite(value) ? value : 0);
}

function calculateRates() {
  const income = Number(byId("income").value) || 0;
  const overhead = Number(byId("overhead").value) || 0;
  const taxRate = (Number(byId("taxRate").value) || 0) / 100;
  const hoursPerWeek = Number(byId("hoursPerWeek").value) || 1;
  const weeksPerYear = Number(byId("weeksPerYear").value) || 1;
  const profitMargin = (Number(byId("profitMargin").value) || 0) / 100;
  const projectHours = Number(byId("projectHours").value) || 1;
  const rushMultiplier = Number(byId("rushMultiplier").value) || 1;

  const annualHours = Math.max(hoursPerWeek * weeksPerYear, 1);
  const baseRevenue = income + overhead;
  const withTax = baseRevenue / Math.max(1 - taxRate, 0.1);
  const targetRevenue = withTax * (1 + profitMargin);
  const hourlyRate = targetRevenue / annualHours;
  const taxReserve = targetRevenue - (baseRevenue * (1 + profitMargin));
  const monthlyTarget = targetRevenue / 12;
  const projectQuote = hourlyRate * projectHours * rushMultiplier;

  byId("hourlyRate").textContent = formatMoney(hourlyRate);
  byId("monthlyTarget").textContent = formatMoney(monthlyTarget);
  byId("projectQuote").textContent = formatMoney(projectQuote);
  byId("annualHours").textContent = annualHours.toLocaleString("en-US");
  byId("taxReserve").textContent = formatMoney(taxReserve);
  byId("rateContext").textContent =
    `This assumes ${annualHours.toLocaleString("en-US")} billable hours a year with a ${Math.round(taxRate * 100)}% tax buffer and ${Math.round(profitMargin * 100)}% cushion.`;

  byId("quoteSummary").value =
    `Recommended freelance rate: ${formatMoney(hourlyRate)} per hour.\n` +
    `Suggested fixed-fee quote: ${formatMoney(projectQuote)} for approximately ${projectHours} hours of work.\n\n` +
    `Pricing rationale:\n` +
    `- Annual income target: ${formatMoney(income)}\n` +
    `- Annual overhead: ${formatMoney(overhead)}\n` +
    `- Tax reserve: ${Math.round(taxRate * 100)}%\n` +
    `- Profit cushion: ${Math.round(profitMargin * 100)}%\n` +
    `- Billable availability: ${hoursPerWeek} hours/week for ${weeksPerYear} weeks/year\n` +
    `- Timeline adjustment: x${rushMultiplier.toFixed(2)}\n\n` +
    `You can position this as a fixed-fee investment tied to scope, outcomes, and delivery timeline rather than only hours.`;
}

calculatorForm.addEventListener("submit", (event) => {
  event.preventDefault();
  calculateRates();
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

calculateRates();
