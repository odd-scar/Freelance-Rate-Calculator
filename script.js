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
const resetFormButton = document.querySelector("#reset-form");
const copyStatus = document.querySelector("#copy-status");
const advancedToggle = document.querySelector("#advancedMode");
const advancedFields = document.querySelector("#advancedFields");
const presetButtons = document.querySelectorAll("[data-preset]");
const sampleButtons = document.querySelectorAll(".sample-button");
const logoUpload = document.querySelector("#logoUpload");
const previewLogoImage = document.querySelector("#previewLogoImage");
const previewLogoFallback = document.querySelector("#previewLogoFallback");

let currentQuoteText = "";
let currentQuoteData = null;
let currentLogoDataUrl = "";
let lastAutoProjectName = "";
let lastAutoDeliverables = "";

const templateConfigs = {
  photographer: {
    defaultProjectName: "Brand photography package",
    defaultDeliverables: [
      "Pre-shoot planning call",
      "Up to 2 hours on location or in studio",
      "Edited online gallery delivery",
      "Commercial usage for agreed channels",
      "1 round of image selection support"
    ],
    recommendation: {
      title: "Best next tools for photographers",
      body: "Photographers usually move from a quote into booking, contract signing, invoice collection, and gallery or project delivery.",
      links: [
        {
          label: "HoneyBook workflow",
          href: "https://www.honeybook.com/referrals",
          variant: "primary"
        },
        {
          label: "FreshBooks accounting",
          href: "https://www.freshbooks.com/affiliate-program/",
          variant: "secondary"
        },
        {
          label: "Bonsai contracts",
          href: "https://www.hellobonsai.com/affiliates",
          variant: "secondary"
        }
      ]
    }
  },
  designer: {
    defaultProjectName: "Mini brand identity package",
    defaultDeliverables: [
      "Creative kickoff and direction alignment",
      "Primary logo concept set",
      "Color palette and type recommendations",
      "Final export files for web and print",
      "2 rounds of revisions"
    ],
    recommendation: {
      title: "Best next tools for designers",
      body: "Designers often need a smoother way to handle proposals, client approvals, contracts, and invoice collection.",
      links: [
        {
          label: "HoneyBook workflow",
          href: "https://www.honeybook.com/referrals",
          variant: "primary"
        },
        {
          label: "Bonsai operations",
          href: "https://www.hellobonsai.com/affiliates",
          variant: "secondary"
        },
        {
          label: "FreshBooks accounting",
          href: "https://www.freshbooks.com/affiliate-program/",
          variant: "secondary"
        }
      ]
    }
  },
  consultant: {
    defaultProjectName: "Strategy sprint proposal",
    defaultDeliverables: [
      "Discovery and intake review",
      "Research and strategic analysis",
      "Working session or workshop",
      "Summary recommendations document",
      "Follow-up call with next-step guidance"
    ],
    recommendation: {
      title: "Best next tools for consultants",
      body: "Consultants usually need contracts, CRM, proposals, invoicing, and a clean workflow to move from interest to signed work.",
      links: [
        {
          label: "Bonsai operations",
          href: "https://www.hellobonsai.com/affiliates",
          variant: "primary"
        },
        {
          label: "FreshBooks accounting",
          href: "https://www.freshbooks.com/affiliate-program/",
          variant: "secondary"
        },
        {
          label: "HoneyBook workflow",
          href: "https://www.honeybook.com/referrals",
          variant: "secondary"
        }
      ]
    }
  },
  developer: {
    defaultProjectName: "Website refresh proposal",
    defaultDeliverables: [
      "Project kickoff and requirements review",
      "Design or implementation updates for agreed pages",
      "Responsive QA and browser testing",
      "Launch support or handoff documentation",
      "1 to 2 rounds of revisions"
    ],
    recommendation: {
      title: "Best next tools for developers",
      body: "Developers often need proposals, contracts, client management, recurring billing, and simple accounting after the quote stage.",
      links: [
        {
          label: "Bonsai operations",
          href: "https://www.hellobonsai.com/affiliates",
          variant: "primary"
        },
        {
          label: "FreshBooks accounting",
          href: "https://www.freshbooks.com/affiliate-program/",
          variant: "secondary"
        },
        {
          label: "HoneyBook workflow",
          href: "https://www.honeybook.com/referrals",
          variant: "secondary"
        }
      ]
    }
  },
  writer: {
    defaultProjectName: "SEO content package",
    defaultDeliverables: [
      "Topic research and content outline",
      "Draft writing for agreed pieces",
      "Basic SEO optimization",
      "1 round of revisions per deliverable",
      "Final delivery in agreed format"
    ],
    recommendation: {
      title: "Best next tools for writers",
      body: "Writers usually need contracts, invoicing, project tracking, and a repeatable system for recurring clients.",
      links: [
        {
          label: "Bonsai operations",
          href: "https://www.hellobonsai.com/affiliates",
          variant: "primary"
        },
        {
          label: "FreshBooks accounting",
          href: "https://www.freshbooks.com/affiliate-program/",
          variant: "secondary"
        },
        {
          label: "HoneyBook workflow",
          href: "https://www.honeybook.com/referrals",
          variant: "secondary"
        }
      ]
    }
  }
};

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
    freelancerType: "photographer",
    quoteTone: "friendly",
    businessName: "SoloRate Studio",
    clientName: "Client Name",
    depositPercent: 50,
    paymentTerms: "50% upfront, 50% on final delivery",
    expirationDays: 14
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
    freelancerType: "designer",
    quoteTone: "premium",
    businessName: "Northlight Creative",
    clientName: "Client Name",
    depositPercent: 50,
    paymentTerms: "50% upfront, 50% on final delivery",
    expirationDays: 14
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
    freelancerType: "consultant",
    quoteTone: "formal",
    businessName: "Summit Advisory",
    clientName: "Client Name",
    depositPercent: 50,
    paymentTerms: "Net 7 from invoice date",
    expirationDays: 10
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
    freelancerType: "developer",
    quoteTone: "formal",
    businessName: "Your Business Name",
    clientName: "Client Name",
    depositPercent: 50,
    paymentTerms: "50% upfront, 50% on final delivery",
    expirationDays: 14
  }
};

const sampleMap = {
  photographer: {
    preset: "beginner",
    freelancerType: "photographer",
    quoteTone: "friendly",
    businessName: "Golden Hour Studio",
    clientName: "Maple & Co.",
    projectName: "Brand photoshoot package",
    projectHours: 10,
    depositPercent: 50,
    paymentTerms: "50% upfront, 50% on final delivery",
    expirationDays: 14
  },
  designer: {
    preset: "creative",
    freelancerType: "designer",
    quoteTone: "premium",
    businessName: "Northlight Creative",
    clientName: "Oak Street Bakery",
    projectName: "Mini brand identity package",
    projectHours: 14,
    depositPercent: 50,
    paymentTerms: "50% upfront, 50% on final delivery",
    expirationDays: 14
  },
  consultant: {
    preset: "consultant",
    freelancerType: "consultant",
    quoteTone: "formal",
    businessName: "Summit Advisory",
    clientName: "Apex Health",
    projectName: "Strategy sprint proposal",
    projectHours: 24,
    depositPercent: 50,
    paymentTerms: "Net 7 from invoice date",
    expirationDays: 10
  },
  developer: {
    preset: "advanced",
    freelancerType: "developer",
    quoteTone: "formal",
    businessName: "Harbor Web Co.",
    clientName: "Trailhead Fitness",
    projectName: "Website refresh proposal",
    projectHours: 22,
    depositPercent: 40,
    paymentTerms: "50% upfront, 50% on final delivery",
    expirationDays: 14
  },
  writer: {
    preset: "advanced",
    freelancerType: "writer",
    quoteTone: "friendly",
    businessName: "Clearline Content",
    clientName: "BrightPath CRM",
    projectName: "SEO content package",
    projectHours: 16,
    depositPercent: 50,
    paymentTerms: "Net 14 from invoice date",
    expirationDays: 14
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

function getInitials(name) {
  return (name || "SB")
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("") || "SB";
}

function listToText(items) {
  return items.join("\n");
}

function textToList(value) {
  return value
    .split(/\r?\n/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function addDays(date, days) {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

function getTemplate(type) {
  return templateConfigs[type] || templateConfigs.photographer;
}

function applyTemplateDefaults(force = false) {
  const freelancerType = byId("freelancerType").value;
  const template = getTemplate(freelancerType);
  const projectNameField = byId("projectName");
  const deliverablesField = byId("deliverables");

  if (force || !projectNameField.value.trim() || projectNameField.value.trim() === lastAutoProjectName) {
    projectNameField.value = template.defaultProjectName;
    lastAutoProjectName = template.defaultProjectName;
  }

  const deliverablesText = listToText(template.defaultDeliverables);
  if (force || !deliverablesField.value.trim() || deliverablesField.value.trim() === lastAutoDeliverables) {
    deliverablesField.value = deliverablesText;
    lastAutoDeliverables = deliverablesText;
  }
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
  byId("freelancerType").value = preset.freelancerType;
  byId("quoteTone").value = preset.quoteTone;
  byId("businessName").value = preset.businessName;
  byId("clientName").value = preset.clientName;
  byId("depositPercent").value = preset.depositPercent;
  byId("paymentTerms").value = preset.paymentTerms;
  byId("expirationDays").value = preset.expirationDays;
  setAdvancedMode(preset.advancedMode);
  applyTemplateDefaults(true);
  setActivePreset(presetName);
  calculateRates();
}

function applySample(sampleName) {
  const sample = sampleMap[sampleName];
  if (!sample) {
    return;
  }

  applyPreset(sample.preset);
  byId("freelancerType").value = sample.freelancerType;
  byId("quoteTone").value = sample.quoteTone;
  byId("businessName").value = sample.businessName;
  byId("clientName").value = sample.clientName;
  byId("projectName").value = sample.projectName;
  byId("projectHours").value = sample.projectHours;
  byId("depositPercent").value = sample.depositPercent;
  byId("paymentTerms").value = sample.paymentTerms;
  byId("expirationDays").value = sample.expirationDays;
  applyTemplateDefaults(false);
  calculateRates();
  window.location.hash = "calculator";
}

function getToneBody(tone, projectName, clientName, businessName) {
  const safeClient = clientName || "your team";

  if (tone === "formal") {
    return `This quote outlines the current scope for ${projectName}. If ${safeClient} approves the scope and timeline, work can begin once the deposit and scheduling requirements are complete.`;
  }

  if (tone === "premium") {
    return `${projectName} is priced to support thoughtful planning, polished execution, and a smoother client experience from kickoff through final delivery. Once ${safeClient} confirms the quote, ${businessName} can reserve the project timeline.`;
  }

  return `This quote is designed to keep the project clear, efficient, and easy to approve. Once ${safeClient} is ready to move forward, ${businessName} can lock in the schedule and begin the work.`;
}

function getIncludesText(deliverables, revisionRounds) {
  const firstTwo = deliverables.slice(0, 2).join(", ");
  return firstTwo ? `${firstTwo}, plus ${revisionRounds}` : revisionRounds;
}

function renderDeliverables(items) {
  const list = byId("previewDeliverables");
  list.innerHTML = items.map((item) => `<li>${escapeHtml(item)}</li>`).join("");
}

function renderLogo(businessName) {
  if (currentLogoDataUrl) {
    previewLogoImage.src = currentLogoDataUrl;
    previewLogoImage.hidden = false;
    previewLogoFallback.hidden = true;
    return;
  }

  previewLogoImage.hidden = true;
  previewLogoFallback.hidden = false;
  previewLogoFallback.textContent = getInitials(businessName);
}

function updateRecommendations(type) {
  const { title, body, links } = getTemplate(type).recommendation;
  byId("recommendTitle").textContent = title;
  byId("recommendBody").textContent = body;

  const targets = [
    byId("recommendLinkOne"),
    byId("recommendLinkTwo"),
    byId("recommendLinkThree")
  ];

  links.forEach((link, index) => {
    const target = targets[index];
    target.textContent = link.label;
    target.href = link.href;
    target.classList.remove("button-primary", "button-secondary");
    target.classList.add(link.variant === "primary" ? "button-primary" : "button-secondary");
  });
}

function buildPdfMarkup(data) {
  const logoMarkup = data.logoDataUrl
    ? `<img src="${data.logoDataUrl}" alt="Business logo" style="width:64px;height:64px;object-fit:cover;border-radius:18px;display:block;">`
    : `<div style="width:64px;height:64px;border-radius:18px;display:grid;place-items:center;background:#201b16;color:#fff8ef;font-weight:700;font-size:24px;">${escapeHtml(getInitials(data.businessName))}</div>`;

  const deliverablesMarkup = data.deliverables
    .map((item) => `<li style="margin-bottom:8px;">${escapeHtml(item)}</li>`)
    .join("");

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(data.projectName)} | Quote</title>
  <style>
    body { margin: 0; font-family: Arial, sans-serif; color: #201b16; background: #f3ede4; }
    .sheet { width: min(920px, calc(100% - 48px)); margin: 32px auto; background: white; border-radius: 24px; padding: 40px; box-shadow: 0 20px 40px rgba(0,0,0,0.08); }
    .top, .meta, .grid, .brand { display: grid; gap: 20px; }
    .top, .meta { grid-template-columns: 1fr auto; }
    .brand { grid-template-columns: 64px 1fr; align-items: center; }
    .label { margin: 0 0 6px; font-size: 11px; letter-spacing: 0.14em; text-transform: uppercase; color: #8b3418; }
    h1, h2, h3, p, ul { margin: 0; }
    h1 { font-size: 34px; }
    h2 { font-size: 22px; }
    .amount { font-size: 32px; font-weight: 700; }
    .muted { color: #65594f; line-height: 1.6; }
    .section { padding: 22px 0; border-top: 1px solid rgba(32,27,22,0.1); }
    .grid { grid-template-columns: repeat(2, 1fr); }
    .message { padding: 18px; border-radius: 16px; background: #f8f4ee; }
    .deliverables { padding-left: 20px; color: #65594f; line-height: 1.6; }
    .actions { margin-top: 28px; }
    .signature { display:grid; grid-template-columns: repeat(2, 1fr); gap: 24px; margin-top: 22px; }
    .line { border-top: 1px solid rgba(32,27,22,0.2); padding-top: 10px; color: #65594f; }
    button { padding: 12px 18px; border: 0; border-radius: 999px; background: #201b16; color: white; font-weight: 700; cursor: pointer; }
    @media print {
      body { background: white; }
      .sheet { width: 100%; margin: 0; box-shadow: none; border-radius: 0; padding: 24px; }
      .actions { display: none; }
    }
    @media (max-width: 640px) {
      .top, .meta, .grid, .signature { grid-template-columns: 1fr; }
      .sheet { width: calc(100% - 24px); padding: 24px; margin: 12px auto; }
    }
  </style>
</head>
<body>
  <main class="sheet">
    <section class="top">
      <div class="brand">
        ${logoMarkup}
        <div>
          <p class="label">Prepared by</p>
          <h1>${escapeHtml(data.businessName)}</h1>
        </div>
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
        <p class="label">Valid until</p>
        <p class="muted">${escapeHtml(data.validUntil)}</p>
      </div>
    </section>
    <section class="section grid">
      <div>
        <p class="label">Timeline</p>
        <p class="muted">${escapeHtml(data.timelineLabel)}</p>
      </div>
      <div>
        <p class="label">Estimated scope</p>
        <p class="muted">${escapeHtml(data.scopeText)}</p>
      </div>
      <div>
        <p class="label">Deposit due to start</p>
        <p class="muted">${escapeHtml(data.depositText)}</p>
      </div>
      <div>
        <p class="label">Payment terms</p>
        <p class="muted">${escapeHtml(data.paymentTerms)}</p>
      </div>
    </section>
    <section class="section">
      <p class="label">Deliverables included</p>
      <ul class="deliverables">${deliverablesMarkup}</ul>
    </section>
    <section class="section">
      <p class="label">Notes</p>
      <div class="message">
        <p class="muted">${escapeHtml(data.bodyText)}</p>
      </div>
      <div class="signature">
        <div class="line">Client signature</div>
        <div class="line">Date</div>
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
    copyStatus.textContent = "Pop-up blocked. Allow pop-ups to open the printable quote.";
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
  const freelancerType = byId("freelancerType").value;
  const quoteTone = byId("quoteTone").value;
  const businessName = byId("businessName").value.trim() || "Your Business Name";
  const clientName = byId("clientName").value.trim() || "Client Name";
  const projectName = byId("projectName").value.trim() || getTemplate(freelancerType).defaultProjectName;
  const depositPercent = Math.min(Math.max(Number(byId("depositPercent").value) || 0, 0), 100);
  const paymentTerms = byId("paymentTerms").value;
  const expirationDays = Math.max(Number(byId("expirationDays").value) || 1, 1);
  const deliverables = textToList(byId("deliverables").value);

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
  const depositAmount = projectQuote * (depositPercent / 100);
  const modeLabel = usingAdvanced ? "advanced" : "guided";
  const timelineLabel = getTimelineLabel(rushMultiplier);
  const revisionRounds = projectHours >= 20 ? "up to 2 rounds of revisions" : "1 round of revisions";
  const quoteDate = dateFormatter.format(new Date());
  const validUntil = dateFormatter.format(addDays(new Date(), expirationDays));
  const scopeText = `Approximately ${projectHours} hours of work`;
  const includesText = getIncludesText(deliverables, revisionRounds);
  const bodyText = getToneBody(quoteTone, projectName, clientName, businessName);
  const investmentText = formatMoney(projectQuote);
  const depositText = depositPercent > 0 ? `${formatMoney(depositAmount)} (${depositPercent}% deposit)` : "No deposit required";

  byId("hourlyRate").textContent = formatMoney(hourlyRate);
  byId("monthlyTarget").textContent = formatMoney(monthlyTarget);
  byId("projectQuote").textContent = investmentText;
  byId("annualHours").textContent = annualHours.toLocaleString("en-US");
  byId("taxReserve").textContent = formatMoney(taxReserve);
  byId("rateContext").textContent =
    `Using ${modeLabel} mode, this assumes ${annualHours.toLocaleString("en-US")} billable hours a year, a ${Math.round(taxRate * 100)}% tax set-aside, and a ${Math.round(profitMargin * 100)}% safety margin.`;

  renderLogo(businessName);
  renderDeliverables(deliverables);
  updateRecommendations(freelancerType);

  byId("previewBusinessName").textContent = businessName;
  byId("previewClientName").textContent = clientName;
  byId("previewDate").textContent = quoteDate;
  byId("previewInvestment").textContent = investmentText;
  byId("previewProjectName").textContent = projectName;
  byId("previewTimeline").textContent = timelineLabel;
  byId("previewValidUntil").textContent = validUntil;
  byId("previewScope").textContent = scopeText;
  byId("previewPaymentTerms").textContent = paymentTerms;
  byId("previewDeposit").textContent = depositText;
  byId("previewIncludes").textContent = includesText;
  byId("previewBody").textContent = bodyText;

  currentQuoteData = {
    businessName,
    clientName,
    projectName,
    quoteDate,
    validUntil,
    investment: investmentText,
    timelineLabel,
    scopeText,
    depositText,
    paymentTerms,
    includesText,
    deliverables,
    bodyText,
    logoDataUrl: currentLogoDataUrl
  };

  currentQuoteText =
    `${businessName}\n` +
    `Prepared for: ${clientName}\n` +
    `${projectName}\n` +
    `Prepared ${quoteDate}\n` +
    `Valid until: ${validUntil}\n\n` +
    `Estimated investment: ${investmentText}\n` +
    `Timeline: ${timelineLabel}\n` +
    `Estimated scope: ${scopeText}\n` +
    `Deposit due to start: ${depositText}\n` +
    `Payment terms: ${paymentTerms}\n` +
    `Includes: ${includesText}\n\n` +
    `Deliverables included:\n- ${deliverables.join("\n- ")}\n\n` +
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

byId("freelancerType").addEventListener("change", () => {
  applyTemplateDefaults(false);
  calculateRates();
});

presetButtons.forEach((button) => {
  button.addEventListener("click", () => {
    applyPreset(button.dataset.preset);
  });
});

sampleButtons.forEach((button) => {
  button.addEventListener("click", () => {
    applySample(button.dataset.sample);
  });
});

copyButton.addEventListener("click", async () => {
  calculateRates();
  try {
    await navigator.clipboard.writeText(currentQuoteText);
    copyStatus.textContent = "Copied.";
    setTimeout(() => {
      if (copyStatus.textContent === "Copied.") {
        copyStatus.textContent = "";
      }
    }, 2000);
  } catch (error) {
    copyStatus.textContent = "Copy failed. Select the text manually.";
  }
});

exportPdfButton.addEventListener("click", () => {
  calculateRates();
  openPdfLayout();
});

resetFormButton.addEventListener("click", () => {
  calculatorForm.reset();
  currentLogoDataUrl = "";
  logoUpload.value = "";
  previewLogoImage.hidden = true;
  previewLogoImage.removeAttribute("src");
  applyPreset("beginner");
  copyStatus.textContent = "";
});

logoUpload.addEventListener("change", () => {
  const [file] = logoUpload.files || [];
  if (!file) {
    currentLogoDataUrl = "";
    renderLogo(byId("businessName").value);
    calculateRates();
    return;
  }

  const reader = new FileReader();
  reader.onload = () => {
    currentLogoDataUrl = String(reader.result || "");
    renderLogo(byId("businessName").value);
    calculateRates();
  };
  reader.readAsDataURL(file);
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
    `${leadName || "You"} are on the list. Connect this form to your email tool after deploy and send the quote pack plus your partner recommendations automatically.`;

  leadForm.reset();
});

applyPreset("beginner");



