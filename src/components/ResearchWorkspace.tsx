"use client";

import { FormEvent, useMemo, useRef, useState } from "react";
import type { ResearchReport, ScoreCategory } from "@/lib/investment/types";
import { MAX_COMPANY_NAME_LENGTH, sanitizeCompanyNameDraft, sanitizeCompanyNameInput } from "@/lib/investment/inputSanitizer";

const sampleCompanies = ["Microsoft", "Apple", "NVIDIA", "Tesla", "Reliance", "Airtel"];

function formatLargeCurrency(value: number, currency: string) {
  if (!value) {
    return "Not available";
  }

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency === "Unknown" ? "USD" : currency,
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(value);
}

function formatPercent(value: number) {
  return `${value.toFixed(1)}%`;
}
function hasCoreMetricDataGap(metrics: ResearchReport["metrics"]) {
  return [
    metrics.marketCap <= 0,
    metrics.revenueGrowthPercent === 0,
    metrics.profitMarginPercent === 0,
    metrics.peRatio === 0,
  ].filter(Boolean).length >= 2;
}

function formatCorePercent(value: number, metrics: ResearchReport["metrics"]) {
  return hasCoreMetricDataGap(metrics) && value === 0 ? "Not available" : formatPercent(value);
}

function formatCoreNumber(value: number, metrics: ResearchReport["metrics"]) {
  return hasCoreMetricDataGap(metrics) && value === 0 ? "Not available" : value.toFixed(1);
}


function getDecisionClass(verdict: ResearchReport["verdict"]) {
  return verdict.toLowerCase().replace(/\s+/g, "-");
}

function isGuidedBotReport(report: ResearchReport) {
  return report.company.ticker.toUpperCase() === "INVESTABLEBOT";
}

function isUnverifiedReport(report: ResearchReport) {
  return report.company.ticker.toUpperCase() === "UNKNOWN" || report.company.marketStatus === "Unverified";
}

function needsMarketNote(report: ResearchReport) {
  const ticker = report.company.ticker.toUpperCase();
  return (
    ticker === "PRIVATE" ||
    ticker === "UNKNOWN" ||
    report.company.marketStatus === "Private Company" ||
    report.company.marketStatus === "ETF/Fund" ||
    report.company.marketStatus === "Subsidiary/Brand" ||
    report.company.marketStatus === "Unverified"
  );
}

function shouldShowPublicStockSignals(report: ResearchReport) {
  const ticker = report.company.ticker.toUpperCase();
  return !(
    ticker === "PRIVATE" ||
    ticker === "UNKNOWN" ||
    report.company.marketStatus === "Private Company" ||
    report.company.marketStatus === "Unlisted/Government" ||
    report.company.marketStatus === "Unverified"
  );
}

function getMarketNote(report: ResearchReport) {
  if (isGuidedBotReport(report)) {
    return "This is a custom project showcase response, not a public-stock report. The score reflects the AI bot's clarity, guardrails, and guided reasoning.";
  }

  if (report.company.marketStatus === "ETF/Fund") {
    return "This result is for an ETF or fund, not a single company. The bot relies more on return, risk, and source checks than operating-company fundamentals.";
  }

  if (report.company.marketStatus === "Subsidiary/Brand") {
    return report.company.resolutionNote ?? "This brand is not separately listed, so the bot resolved it to its public parent company.";
  }

  if (report.company.marketStatus === "Unlisted/Government") {
    return "This company is government-owned or otherwise unlisted, so normal public stock investors cannot buy verified exchange-listed equity shares.";
  }

  if (report.company.marketStatus === "Private Company" || report.company.ticker.toUpperCase() === "PRIVATE") {
    return "Famous companies are not always public stocks. The bot only gives an investment score when it can verify a tradable ticker and public-market financial data.";
  }

  return "No verified ticker, exchange, ETF, parent company, public filing, or known private-company match was found. Trust is 0 until the company identity is real.";
}

function cleanCompanyDescription(value: string) {
  return value
    .replace(/\s+/g, " ")
    .replace(/\s+([,.;:])/g, "$1")
    .trim();
}

function summarizeCompanyDescription(value: string) {
  const cleaned = cleanCompanyDescription(value);
  const firstSentence = cleaned.match(/^.{40,220}?[.!?](\s|$)/)?.[0]?.trim();

  if (firstSentence) {
    return firstSentence;
  }

  return cleaned.length > 180 ? `${cleaned.slice(0, 177).trim()}...` : cleaned;
}

function getCompanyOverviewLines(report: ResearchReport) {
  const sector = report.company.sector && report.company.sector !== "Unknown" ? report.company.sector : "Sector not verified";
  const industry = report.company.industry && report.company.industry !== "Unknown" ? report.company.industry : "industry not verified";
  const rawDescription = summarizeCompanyDescription(report.company.description ?? "");
  const genericDescription =
    !rawDescription ||
    rawDescription.toLowerCase().includes("no company description was provided") ||
    rawDescription.toLowerCase().includes("was resolved from live market data");

  return {
    sectorLine: `Sector: ${sector}${industry !== "industry not verified" ? `; Industry: ${industry}` : ""}.`,
    businessLine: genericDescription
      ? "Business: verified company description is not available from the current source."
      : `Business: ${rawDescription}`,
  };
}

function getCompanyPills(report: ResearchReport) {
  const ticker = report.company.ticker.toUpperCase();

  if (isGuidedBotReport(report)) {
    return ["AI Bot", "Guided Project", "Under Your Guidance"];
  }

  if (report.company.marketStatus === "ETF/Fund") {
    return [report.company.ticker, report.company.exchange, "ETF/Fund"];
  }

  if (report.company.marketStatus === "Subsidiary/Brand") {
    return ["Subsidiary/Brand", report.company.parentCompany ? `Parent: ${report.company.parentCompany}` : report.company.ticker, report.company.ticker];
  }

  if (report.company.marketStatus === "Unlisted/Government") {
    return ["Unlisted/Government", "No public equity ticker", "Not directly investable"];
  }

  if (report.company.marketStatus === "Private Company" || ticker === "PRIVATE") {
    return ["Private company", "No public ticker", "Not directly investable"];
  }

  if (report.company.marketStatus === "Unverified" || ticker === "UNKNOWN") {
    return ["Ticker not verified", "Exchange not found", "Needs source check"];
  }

  return [report.company.ticker, report.company.exchange, report.company.sector].filter(
    (value) => value && value.toLowerCase() !== "unknown",
  );
}

function getActionRecommendation(report: ResearchReport, riskLevel: number) {
  const score = report.score.totalScore;
  const ticker = report.company.ticker.toUpperCase();

  if (isGuidedBotReport(report)) {
    return {
      title: "This bot works under your guidance.",
      reason: "You can consider investing in this AI bot too - it is built for clear reasoning, source checks, and beginner-friendly investment research.",
    };
  }

  if (report.company.marketStatus === "ETF/Fund") {
    return {
      title: "ETF/Fund research signal - check diversification and fees.",
      reason: "This is not a single company, so the bot focuses more on return, risk, and source checks.",
    };
  }

  if (report.company.marketStatus === "Subsidiary/Brand") {
    if (hasCoreMetricDataGap(report.metrics)) {
      return {
        title: "Needs verified parent-company data first.",
        reason: report.company.resolutionNote ?? "The searched brand is not separately listed, and the parent-company fundamentals are still incomplete. The bot will not make a normal invest/pass call from return data alone.",
      };
    }

    return {
      title: "Resolved to public parent company.",
      reason: report.company.resolutionNote ?? "The searched brand is not separately listed, so the bot uses parent-company market data.",
    };
  }

  if (report.company.marketStatus === "Unlisted/Government") {
    return {
      title: "Not available for normal stock investing.",
      reason: "This company is government-owned or unlisted, so regular users cannot buy its equity on public exchanges.",
    };
  }

  if (report.company.marketStatus === "Private Company" || ticker === "PRIVATE") {
    return {
      title: "Not available for normal stock investing.",
      reason: "This company is private, so regular users cannot buy its stock on public exchanges yet.",
    };
  }

  if (report.company.marketStatus === "Unverified" || ticker === "UNKNOWN") {
    return {
      title: "Looks like you entered your own delusional company name. Fix the name first.",
      reason: "The bot found no verified ticker, exchange, public filing, ETF, parent company, or known private-company match. Try the real company name or ticker.",
    };
  }

  if (hasCoreMetricDataGap(report.metrics)) {
    return {
      title: "Needs verified financial data first.",
      reason: "The bot found a ticker or parent company, but revenue, profit, valuation, or size data is still missing. It will not give a normal invest/pass call from return data alone.",
    };
  }

  if (riskLevel >= 70) {
    return {
      title: "Play it safe - do not invest.",
      reason: "Risk is high, so the bot does not recommend investing right now.",
    };
  }

  if (score >= 80 && riskLevel <= 35) {
    return {
      title: "You can consider investing - no big risk found.",
      reason: "The investment score is strong and the risk scale is low.",
    };
  }

  if (score >= 70) {
    return {
      title: "You can invest cautiously - risks look manageable.",
      reason: "The investment score is good, but still review the risk notes before deciding.",
    };
  }

  if (score >= 60) {
    return {
      title: "50/50 investment case - it is your call now.",
      reason: "The result is mixed, so the bot suggests waiting or checking more research.",
    };
  }

  if (score >= 50) {
    return {
      title: "Play it safe - do not invest yet.",
      reason: "The score is not strong enough for a confident investment decision.",
    };
  }

  return {
    title: "Not recommended to invest.",
    reason: "The score is weak or the available evidence does not support investing.",
  };
}

function getTrustLabel(confidence: number) {
  if (confidence >= 85) {
    return "High trust";
  }

  if (confidence >= 70) {
    return "Good trust";
  }

  if (confidence >= 50) {
    return "Medium trust";
  }

  return "Low trust";
}

function getScaleLabel(score: number) {
  if (score >= 80) {
    return "Strong";
  }

  if (score >= 60) {
    return "Moderate";
  }

  return "Weak";
}

function getRiskLabel(riskLevel: number) {
  if (riskLevel >= 70) {
    return "High risk";
  }

  if (riskLevel >= 40) {
    return "Medium risk";
  }

  return "Lower risk";
}

function getGrowthLabel(score: number) {
  if (score >= 80) {
    return "Strong";
  }

  if (score >= 50) {
    return "Healthy";
  }

  return "Weak";
}

function getReturnLabel(score: number) {
  if (score >= 80) {
    return "Strong return";
  }

  if (score >= 60) {
    return "Profitable";
  }

  if (score >= 40) {
    return "Flat or unknown";
  }

  return "Weak return";
}

function getCategory(categories: ScoreCategory[], label: string) {
  const exactMatch = categories.find((category) => category.label === label)?.score;

  if (exactMatch !== undefined) {
    return exactMatch;
  }

  if (label.toLowerCase().includes("return")) {
    return categories.find((category) => category.label.toLowerCase().includes("return"))?.score ?? 0;
  }

  return 0;
}

function getReturnPeriodLabel(metrics: ResearchReport["metrics"]) {
  return metrics.returnPeriodLabel ?? "Last 5 Years Return";
}

function getReturnMeaning(metrics: ResearchReport["metrics"]) {
  const label = getReturnPeriodLabel(metrics).toLowerCase();
  const returnPercent = metrics.fiveYearReturnPercent;

  if (returnPercent === 0) {
    return "Past return data is missing, so the bot does not add return bonus.";
  }

  if (returnPercent >= 100) {
    return `The stock has strongly rewarded holders on ${label}.`;
  }

  if (returnPercent > 0) {
    return `The stock has been profitable on ${label}.`;
  }

  return `The stock has lost value on ${label}.`;
}

function getValuationMeaning(peRatio: number) {
  if (peRatio < 0) {
    return "Negative P/E means the company is currently loss-making.";
  }

  if (peRatio === 0) {
    return "Price data is missing, so the bot becomes more cautious.";
  }

  if (peRatio > 55) {
    return "Very expensive compared with current profits.";
  }

  if (peRatio > 35) {
    return "Not cheap, so the company must keep performing well.";
  }

  return "More reasonable compared with current profits.";
}
function sanitizeFileName(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "") || "investment-report";
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function waitForNextPaint() {
  return new Promise<void>((resolve) => {
    window.requestAnimationFrame(() => {
      window.requestAnimationFrame(() => resolve());
    });
  });
}

async function downloadStyledPdfReport(report: ResearchReport, reportElement: HTMLElement) {
  const [{ default: html2canvas }, { jsPDF }] = await Promise.all([
    import("html2canvas"),
    import("jspdf"),
  ]);
  const canvas = await html2canvas(reportElement, {
    backgroundColor: "#e9ebe6",
    scale: Math.min(2, window.devicePixelRatio || 2),
    useCORS: true,
    ignoreElements: (element) => element.classList?.contains("export-actions") ?? false,
  });
  const imageData = canvas.toDataURL("image/png");
  const pdf = new jsPDF("p", "mm", "a4");
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const margin = 8;
  const imageWidth = pageWidth - margin * 2;
  const imageHeight = (canvas.height * imageWidth) / canvas.width;
  const pageContentHeight = pageHeight - margin * 2;

  let renderedHeight = 0;

  while (renderedHeight < imageHeight) {
    if (renderedHeight > 0) {
      pdf.addPage();
    }

    pdf.addImage(imageData, "PNG", margin, margin - renderedHeight, imageWidth, imageHeight);
    renderedHeight += pageContentHeight;
  }

  pdf.save(`${sanitizeFileName(report.company.name)}-investment-research-report.pdf`);
}

function buildPrintableReportHtml(report: ResearchReport, actionTitle: string, actionReason: string, riskLevel: number) {
  const categories = report.score.categories
    .map(
      (category) => `<tr><td>${escapeHtml(category.label)}</td><td>${category.score}/100</td><td>${category.weight}%</td><td>${escapeHtml(category.reason)}</td></tr>`,
    )
    .join("");
  const strengths = report.strengths.map((item) => `<li>${escapeHtml(item)}</li>`).join("");
  const risks = report.risks.map((item) => `<li>${escapeHtml(item)}</li>`).join("");
  const trustNotes = report.score.confidenceNotes.map((item) => `<li>${escapeHtml(item)}</li>`).join("");
  const news = report.news.length > 0
    ? report.news
        .map((item) => `<li><strong>${escapeHtml(item.title)}</strong><br>${escapeHtml(item.source)} - ${escapeHtml(item.sentiment)}<br><span>${escapeHtml(item.url)}</span></li>`)
        .join("")
    : "<li>No recent news signals available.</li>";
  const sources = report.sources.length > 0
    ? report.sources
        .map((source) => `<li><strong>${escapeHtml(source.label)}</strong> (${escapeHtml(source.sourceType)} / ${escapeHtml(source.credibility)})<br>${escapeHtml(source.note)}<br><span>${escapeHtml(source.url)}</span></li>`)
        .join("")
    : "<li>No verified public-market sources were found for this input.</li>";

  const showPublicStockSignals = shouldShowPublicStockSignals(report);
  const companyOverview = getCompanyOverviewLines(report);

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <title>${escapeHtml(report.company.name)} Investment Research Report</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,500;9..144,600;9..144,700&family=Inter:wght@400;500;600;700&family=IBM+Plex+Mono:wght@500;600&display=swap" rel="stylesheet">
  <style>
    body { margin: 0; background: #f3f3ee; color: #1d271f; font-family: 'Inter', sans-serif; line-height: 1.55; }
    main { max-width: 860px; margin: 0 auto; padding: 34px; }
    h1, h2 { font-family: 'Fraunces', Georgia, serif; margin: 0 0 10px; letter-spacing: -0.01em; }
    h1 { font-size: 34px; }
    h2 { margin-top: 26px; font-size: 21px; }
    p { margin: 0 0 12px; }
    .tag { display: inline-block; margin-bottom: 14px; border-radius: 999px; padding: 6px 11px; background: #d5e9dd; color: #08543c; font-weight: 800; font-size: 12px; }
    .hero, section { border: 1px solid #c9cec2; border-radius: 10px; background: #fffefa; padding: 22px; margin-bottom: 16px; }
    .grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; }
    .metric { border: 1px solid #d9ddd2; border-radius: 8px; padding: 12px; }
    .metric span { display: block; color: #727d73; font-size: 11px; font-weight: 800; text-transform: uppercase; }
    .metric strong { display: block; margin-top: 5px; font-family: 'IBM Plex Mono', monospace; font-size: 20px; }
    table { width: 100%; border-collapse: collapse; font-size: 13px; }
    th, td { border-top: 1px solid #d9ddd2; padding: 9px 7px; text-align: left; vertical-align: top; }
    ul { margin: 0; padding-left: 20px; }
    li { margin-bottom: 8px; }
    span { color: #727d73; }
    .small { color: #454f47; font-size: 12px; }
    .small strong { font-family: 'IBM Plex Mono', monospace; }
    .print-company-overview { margin-top: 12px; border: 1px solid #d9ddd2; border-radius: 8px; padding: 12px; background: #f7f7f2; }
    .print-company-overview p { margin: 0; color: #454f47; font-size: 13px; font-weight: 600; }
    .print-company-overview p + p { margin-top: 4px; }
    @media print { body { background: white; } main { padding: 0; } .hero, section { break-inside: avoid; } }
  </style>
</head>
<body>
  <main>
    <div class="hero">
      <span class="tag">AI Answer - ${escapeHtml(report.verdict)}</span>
      <h1>${escapeHtml(actionTitle)}</h1>
      <p><strong>${escapeHtml(actionReason)}</strong></p>
      <p>${escapeHtml(report.summary)}</p>
      <p class="small">Generated: ${escapeHtml(new Date(report.generatedAt).toLocaleString())}</p>
    </div>

    <section>
      <h2>Company Identity</h2>
      <div class="grid">
        <div class="metric"><span>Company</span><strong>${escapeHtml(report.company.name)}</strong></div>
        <div class="metric"><span>Ticker</span><strong>${escapeHtml(report.company.ticker)}</strong></div>
        <div class="metric"><span>Exchange</span><strong>${escapeHtml(report.company.exchange)}</strong></div>
        <div class="metric"><span>Market Status</span><strong>${escapeHtml(report.company.marketStatus ?? "Public Company")}</strong></div>
        <div class="metric"><span>Sector</span><strong>${escapeHtml(report.company.sector)}</strong></div>
        <div class="metric"><span>Currency</span><strong>${escapeHtml(report.company.currency)}</strong></div>
      </div>
      <div class="print-company-overview">
        <p>${escapeHtml(companyOverview.sectorLine)}</p>
        <p>${escapeHtml(companyOverview.businessLine)}</p>
      </div>
    </section>

    ${showPublicStockSignals ? `
    <section>
      <h2>Important Signals</h2>
      <div class="grid">
        <div class="metric"><span>Investment Score</span><strong>${report.score.totalScore}/100</strong></div>
        <div class="metric"><span>Confidence</span><strong>${report.score.confidence}/100</strong></div>
        <div class="metric"><span>Risk Scale</span><strong>${riskLevel}/100</strong></div>
        <div class="metric"><span>Growth</span><strong>${formatCorePercent(report.metrics.revenueGrowthPercent, report.metrics)}</strong></div>
        <div class="metric"><span>${escapeHtml(getReturnPeriodLabel(report.metrics))}</span><strong>${report.metrics.fiveYearReturnPercent !== 0 ? formatPercent(report.metrics.fiveYearReturnPercent) : "Not available"}</strong></div>
        <div class="metric"><span>P/E</span><strong>${formatCoreNumber(report.metrics.peRatio, report.metrics)}</strong></div>
      </div>
    </section>
    ` : ""}

    ${showPublicStockSignals ? `<section><h2>Score Breakdown</h2><table><thead><tr><th>Signal</th><th>Score</th><th>Weight</th><th>Reason</th></tr></thead><tbody>${categories}</tbody></table></section>` : ""}
    <section><h2>Good Signs</h2><ul>${strengths}</ul></section>
    <section><h2>Things To Be Careful About</h2><ul>${risks}</ul></section>
    <section><h2>Trust Notes</h2><ul>${trustNotes}</ul></section>
    <section><h2>Recent News Signals</h2><ul>${news}</ul></section>
    <section><h2>Sources Checked</h2><ul>${sources}</ul></section>
    <p class="small">Responsible use: This research report is not financial advice or a price prediction.</p>
  </main>
</body>
</html>`;
}

function printPdfReport(report: ResearchReport, actionTitle: string, actionReason: string, riskLevel: number) {
  const printWindow = window.open("", "_blank");

  if (!printWindow) {
    window.alert("Pop-up was blocked. Please allow pop-ups to save the PDF report.");
    return;
  }

  printWindow.document.open();
  printWindow.document.write(buildPrintableReportHtml(report, actionTitle, actionReason, riskLevel));
  printWindow.document.close();
  printWindow.focus();
  window.setTimeout(() => {
    printWindow.print();
  }, 300);
}

function ScaleCard({
  title,
  value,
  label,
  description,
  tone = "neutral",
}: {
  title: string;
  value: number;
  label: string;
  description: string;
  tone?: "neutral" | "good" | "warn" | "bad";
}) {
  return (
    <div className={`scale-card ${tone}`}>
      <div className="scale-card-top">
        <span>{title}</span>
        <strong>{value}/100</strong>
      </div>
      <div className="scale-track" aria-hidden="true">
        <span style={{ width: `${Math.min(100, Math.max(0, value))}%` }} />
      </div>
      <div className="scale-meta">
        <b>{label}</b>
        <p>{description}</p>
      </div>
    </div>
  );
}

function SimpleMetric({
  label,
  value,
  meaning,
  icon,
  tone,
}: {
  label: string;
  value: string;
  meaning: string;
  icon: string;
  tone: "teal" | "amber" | "green" | "coral" | "purple";
}) {
  return (
    <div className={`research-row money-metric ${tone}`}>
      <div className="metric-heading">
        <span className="metric-icon" aria-hidden="true">{icon}</span>
        <span>{label}</span>
      </div>
      <strong>{value}</strong>
      <p>{meaning}</p>
    </div>
  );
}

function ReportView({ report }: { report: ResearchReport }) {
  const [isResearchOpen, setIsResearchOpen] = useState(false);
  const [isExportingPdf, setIsExportingPdf] = useState(false);
  const reportRef = useRef<HTMLElement>(null);
  const companyOverview = getCompanyOverviewLines(report);
  const metrics = report.metrics;
  const categories = report.score.categories;
  const growthScore = getCategory(categories, "Growth");
  const returnMetricLabel = getReturnPeriodLabel(metrics);
  const returnScore = getCategory(categories, returnMetricLabel);
  const sourceScore = getCategory(categories, "Source Quality");
  const riskControl = getCategory(categories, "Risk Control");
  const valuationScore = getCategory(categories, "Valuation");
  const riskLevel = 100 - riskControl;
  const trustedThirdPartyCount = report.sources.filter(
    (source) => source.sourceType === "Trusted Third Party",
  ).length;
  const actionRecommendation = getActionRecommendation(report, riskLevel);
  const showPublicStockSignals = shouldShowPublicStockSignals(report);
  const topReasons = isUnverifiedReport(report)
    ? [
        actionRecommendation.reason,
        "Try the legal company name, exact listed ticker, or the public parent company.",
      ]
    : [...report.strengths.slice(0, 2), ...report.risks.slice(0, 1)];

  async function handleDownloadPdf() {
    if (!reportRef.current || isExportingPdf) {
      return;
    }

    const shouldRestoreResearchState = showPublicStockSignals && !isResearchOpen;
    setIsExportingPdf(true);

    try {
      if (shouldRestoreResearchState) {
        setIsResearchOpen(true);
        await waitForNextPaint();
      }

      if (!reportRef.current) {
        return;
      }

      await downloadStyledPdfReport(report, reportRef.current);
    } catch (caughtError) {
      console.error("PDF export failed", caughtError);
      window.alert("PDF export failed. Please try again.");
    } finally {
      if (shouldRestoreResearchState) {
        setIsResearchOpen(false);
      }
      setIsExportingPdf(false);
    }
  }

  if (isGuidedBotReport(report)) {
    return (
      <article className="report-panel" aria-live="polite" ref={reportRef}>
        <section className={`verdict-card guided-bot-card ${getDecisionClass(report.verdict)}`}>
          <div>
            <span className={`verdict-tag ${getDecisionClass(report.verdict)}`}>
              AI Answer - {report.verdict}
            </span>
            <h2>{actionRecommendation.title}</h2>
            <p className="action-reason">{actionRecommendation.reason}</p>
          </div>
        </section>
      </article>
    );
  }

  return (
    <article className="report-panel" aria-live="polite" ref={reportRef}>
      <section className={`verdict-card ${getDecisionClass(report.verdict)}`}>
        <div>
          <span className={`verdict-tag ${getDecisionClass(report.verdict)}`}>
            AI Answer - {report.verdict}
          </span>
          <h2>{actionRecommendation.title}</h2>
          <p className="action-reason">{actionRecommendation.reason}</p>

          <div className="export-actions" aria-label="Export report">
            <button type="button" onClick={handleDownloadPdf} disabled={isExportingPdf}>
              {isExportingPdf ? "Creating PDF" : "Download PDF"}
            </button>
            <button
              type="button"
              onClick={() => printPdfReport(report, actionRecommendation.title, actionRecommendation.reason, riskLevel)}
            >
              Print View
            </button>
          </div>
        </div>
        <div className="gauge-card" aria-label="Bot confidence">
          <div
            className="gauge-ring"
            style={{
              background: `conic-gradient(var(--accent) ${report.score.confidence * 3.6}deg, var(--border-soft) 0deg)`,
            }}
          >
            <div>
              <strong>{report.score.confidence}%</strong>
              <span>{getTrustLabel(report.score.confidence)}</span>
            </div>
          </div>
        </div>
      </section>

      <section className="company-card identity-section">
        <div className="company-mainline">
          <div>
            <p className="eyebrow">Company checked</p>
            <h3>{report.company.name}</h3>
          </div>
          <div className="pill-row">
            {getCompanyPills(report).map((pill) => (
              <span key={pill}>{pill}</span>
            ))}
          </div>
        </div>
        <div className="company-overview">
          <p>{companyOverview.sectorLine}</p>
          <p>{companyOverview.businessLine}</p>
        </div>
        <p>{report.summary}</p>
        {needsMarketNote(report) ? <p className="market-note">{getMarketNote(report)}</p> : null}
      </section>

      {showPublicStockSignals ? (
      <section className="card-section signals-section">
        <div className="section-header">
          <p className="eyebrow">Most important signals</p>
          <h3>Read these before anything else</h3>
        </div>
        <div className="scale-grid">
          <ScaleCard
            title="Investment Scale"
            value={report.score.totalScore}
            label={getScaleLabel(report.score.totalScore)}
            description="Overall investability based on growth, health, valuation, risk, and source quality."
            tone={report.score.totalScore >= 75 ? "good" : report.score.totalScore >= 60 ? "warn" : "bad"}
          />
          <ScaleCard
            title="Risk Scale"
            value={riskLevel}
            label={getRiskLabel(riskLevel)}
            description="Lower is better. This rises when valuation, headlines, or fundamentals look risky."
            tone={riskLevel >= 70 ? "bad" : riskLevel >= 40 ? "warn" : "good"}
          />
          <ScaleCard
            title="Growth Scale"
            value={growthScore}
            label={getGrowthLabel(growthScore)}
            description="Checks whether the business is expanding enough to support future value."
            tone={growthScore >= 50 ? "good" : "bad"}
          />
          <ScaleCard
            title={returnMetricLabel}
            value={returnScore}
            label={getReturnLabel(returnScore)}
            description="Rewards profitable long-term stock performance without ignoring risk."
            tone={returnScore >= 60 ? "good" : returnScore >= 40 ? "warn" : "bad"}
          />
          <ScaleCard
            title="Source Trust"
            value={sourceScore}
            label={`${trustedThirdPartyCount} trusted sites`}
            description="Rewards official reports checked against reputable third-party research sources."
            tone={sourceScore >= 80 ? "good" : sourceScore >= 60 ? "warn" : "bad"}
          />
        </div>
      </section>
      ) : null}

      <section className="card-section reason-section">
        <div className="section-header compact">
          <p className="eyebrow">Plain-English reason</p>
          <h3>Why the bot reached this answer</h3>
        </div>
        <div className="reason-list compact-list">
          {topReasons.map((reason, index) => (
            <div className="reason-row" key={reason}>
              <span aria-hidden="true">{index === topReasons.length - 1 ? "!" : "OK"}</span>
              <p>{reason}</p>
            </div>
          ))}
        </div>
      </section>

      {showPublicStockSignals ? (
      <section className="card-section money-card money-section">
        <div className="section-header compact">
          <p className="eyebrow">Simple money check</p>
          <h3>Core numbers in plain language</h3>
        </div>
        <div className="research-list">
          <SimpleMetric
            label="Company Size"
            icon="MC"
            tone="teal"
            value={formatLargeCurrency(metrics.marketCap, report.company.currency)}
            meaning="Larger companies are usually more stable, but may grow slower."
          />
          <SimpleMetric
            label="Business Growth"
            icon="UP"
            tone="amber"
            value={formatCorePercent(metrics.revenueGrowthPercent, metrics)}
            meaning="Shows whether the company is selling more than before."
          />
          <SimpleMetric
            label={returnMetricLabel}
            icon="5Y"
            tone="green"
            value={metrics.fiveYearReturnPercent !== 0 ? formatPercent(metrics.fiveYearReturnPercent) : "Not available"}
            meaning={getReturnMeaning(metrics)}
          />
          <SimpleMetric
            label="Profit Quality"
            icon="%"
            tone="coral"
            value={formatCorePercent(metrics.profitMarginPercent, metrics)}
            meaning="Higher profit margin means the company keeps more money from sales."
          />
          <SimpleMetric
            label="Price Check"
            icon="PE"
            tone="purple"
            value={formatCoreNumber(metrics.peRatio, metrics)}
            meaning={getValuationMeaning(metrics.peRatio)}
          />
        </div>
      </section>
      ) : null}

      <section className="additional-card research-vault">
        <button
          className="additional-toggle"
          type="button"
          aria-expanded={isResearchOpen}
          onClick={() => setIsResearchOpen((current) => !current)}
        >
          <span>
            <b>Additional Research</b>
            <small>{showPublicStockSignals ? "Open for full score breakdown, news, sources, and trust notes." : "Open for identity notes, sources, and trust notes."}</small>
          </span>
          <strong>{isResearchOpen ? "Close" : "Open"}</strong>
        </button>

        {isResearchOpen ? (
          <div className="additional-body">

            {showPublicStockSignals ? (
            <section>
              <div className="section-title-row">
                <div>
                  <p className="eyebrow">Full score breakdown</p>
                  <h3>How the answer was calculated</h3>
                </div>
                <strong>{report.score.totalScore}/100</strong>
              </div>
              <div className="score-list">
                {categories.map((category) => (
                  <div className="score-row" key={category.label}>
                    <div>
                      <strong>{category.label}</strong>
                      <p>{category.reason}</p>
                    </div>
                    <div className="score-value">
                      <span>{category.score}</span>
                      <div className="bar" aria-hidden="true">
                        <span style={{ width: `${category.score}%` }} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
            ) : null}

            <section className="two-column">
              <div>
                <p className="eyebrow">Good signs</p>
                <ul className="clean-list">
                  {report.strengths.map((strength) => (
                    <li key={strength}>{strength}</li>
                  ))}
                </ul>
              </div>
              <div>
                <p className="eyebrow">Things to be careful about</p>
                <ul className="clean-list warning-list">
                  {report.risks.map((risk) => (
                    <li key={risk}>{risk}</li>
                  ))}
                </ul>
              </div>
            </section>

            <section>
              <p className="eyebrow">Trust notes</p>
              <div className="trust-points">
                {report.score.confidenceNotes.map((note) => (
                  <span key={note}>{note}</span>
                ))}
              </div>
            </section>

            <section>
              <p className="eyebrow">Recent news signals</p>
              <div className="news-list">
                {report.news.length > 0 ? (
                  report.news.map((item) => (
                    <a href={item.url} target="_blank" rel="noreferrer" key={item.title}>
                      <strong>{item.title}</strong>
                      <span>
                        {item.source} - {item.sentiment}
                      </span>
                    </a>
                  ))
                ) : (
                  <p className="simple-copy">No recent news is available in sample mode.</p>
                )}
              </div>
            </section>

            <section>
              <p className="eyebrow">Sources checked</p>
              <p className="simple-copy">
                Official sources confirm facts. Trusted third-party sources reduce single-source
                bias. Research blogs are shown as opinion only.
              </p>
              <div className="news-list source-list">
                {report.sources.length > 0 ? (
                  report.sources.map((source, index) => (
                    <a href={source.url} target="_blank" rel="noreferrer" key={`${source.url}-${source.label}-${source.sourceType}-${index}`}>
                      <div className="source-title-row">
                        <strong>{source.label}</strong>
                        <span
                          className={`source-badge ${source.sourceType.toLowerCase().replaceAll(" ", "-")}`}
                        >
                          {source.sourceType} - {source.credibility}
                        </span>
                      </div>
                      <span>{source.note}</span>
                      <em>{source.useFor}</em>
                    </a>
                  ))
                ) : (
                  <p className="simple-copy">No verified public-market sources were found for this input.</p>
                )}
              </div>
            </section>
          </div>
        ) : null}
      </section>

      <section className="disclaimer">
        <strong>Responsible use:</strong> This bot helps you understand a company faster.
        Do not invest only because one AI tool says yes. Use the reasoning, sources, and
        risks as your starting point for a final decision.
      </section>
    </article>
  );
}

export function ResearchWorkspace() {
  const [companyName, setCompanyName] = useState("Microsoft");
  const [report, setReport] = useState<ResearchReport | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const timeline = useMemo(
    () => [
      "Checking the correct company",
      "Building risk, return, and investment scales",
      "Checking trusted third-party sources",
      "Creating a simple answer",
    ],
    [],
  );

  async function runResearch(nextCompanyName = companyName) {
    setIsLoading(true);
    setError("");

    try {
      const safeCompanyName = sanitizeCompanyNameInput(nextCompanyName);

      if (safeCompanyName.length < 2) {
        throw new Error("Enter a valid company name or ticker.");
      }

      setCompanyName(safeCompanyName);

      const response = await fetch("/api/research", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ companyName: safeCompanyName }),
      });

      const payload = (await response.json()) as {
        report?: ResearchReport;
        error?: string;
      };

      if (!response.ok || !payload.report) {
        throw new Error(payload.error ?? "Research failed.");
      }

      setReport(payload.report);
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : "Research failed.");
    } finally {
      setIsLoading(false);
    }
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void runResearch();
  }

  function handleSampleClick(sample: string) {
    setCompanyName(sample);
    void runResearch(sample);
  }

  return (
    <main className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-mark" aria-hidden="true" />
          <div className="brand-name">Investable</div>
        </div>

        <p className="eyebrow">Beginner-friendly AI research</p>
        <h1>Ask if a company looks investable.</h1>
        <p className="lede">
          The bot gives a simple answer first, then hides deeper research until you want it.
        </p>

        <form className="search-form" onSubmit={handleSubmit}>
          <label htmlFor="companyName">Company name</label>
          <div className="search-row">
            <input
              id="companyName"
              value={companyName}
              onChange={(event) => setCompanyName(sanitizeCompanyNameDraft(event.target.value))}
              placeholder="Example: Microsoft"
              minLength={2}
              maxLength={MAX_COMPANY_NAME_LENGTH}
              required
            />
            <button type="submit" disabled={isLoading}>
              {isLoading ? "Checking" : "Check"}
            </button>
          </div>
        </form>

        <div className="samples" aria-label="Sample companies">
          {sampleCompanies.map((sample) => (
            <button
              className={`sample-button ${companyName === sample ? "active" : ""}`}
              key={sample}
              type="button"
              onClick={() => handleSampleClick(sample)}
              disabled={isLoading}
            >
              {sample}
            </button>
          ))}
        </div>

        {isLoading ? (
          <div className="timeline" aria-label="Research steps">
            {timeline.map((step) => (
              <div className="timeline-item" key={step}>
                <span className="timeline-dot" />
                <span>{step}</span>
              </div>
            ))}
          </div>
        ) : null}

        {error ? <p className="error">{error}</p> : null}

        <div className="trust-box">
          <strong>Why users can trust it</strong>
          <span>It shows only the important answer first, then lets users expand the evidence.</span>
        </div>
      </aside>

      <section className="main-panel">
        {report ? (
          <ReportView report={report} />
        ) : (
          <section className="empty-panel">
            <div>
              <p className="eyebrow">Start here</p>
              <h2>Search a company to get a simple verdict.</h2>
              <p>
                You will see investment scale, risk scale, growth scale, return check,
                source trust, and a short explanation first. Deeper research stays inside Additional Research.
              </p>
            </div>
          </section>
        )}
      </section>
    </main>
  );
}


































