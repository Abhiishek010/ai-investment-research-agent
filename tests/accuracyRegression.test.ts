import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { buildResearchReport, getVerdict } from "../src/lib/investment/reporting";
import { sanitizeCompanyNameInput } from "../src/lib/investment/inputSanitizer";
import { scoreGuidedBotProject, scoreInvestment, scoreUnverifiedCompany } from "../src/lib/investment/scoring";
import type { CompanyProfile, FinancialMetrics, NewsItem, SourceReference } from "../src/lib/investment/types";

type TestCase = {
  name: string;
  run: () => void;
};

const officialSource: SourceReference = {
  label: "Company Investor Relations",
  url: "https://example.com/investors",
  note: "Official source for audited company reporting.",
  sourceType: "Official",
  credibility: "Primary",
  useFor: "Verify company-reported financials.",
};

const trustedSource: SourceReference = {
  label: "Trusted Market Data",
  url: "https://finance.yahoo.com/quote/TEST",
  note: "Trusted third-party market-data cross-check.",
  sourceType: "Trusted Third Party",
  credibility: "High",
  useFor: "Cross-check market and financial data.",
};

const researchSource: SourceReference = {
  label: "Research Opinion",
  url: "https://example.com/research",
  note: "Opinion source used only as supporting context.",
  sourceType: "Research Blog",
  credibility: "Medium",
  useFor: "Understand bull and bear narratives.",
};

const baseCompany: CompanyProfile = {
  name: "Regression Test Corp",
  ticker: "TEST",
  exchange: "NASDAQ",
  sector: "Technology",
  industry: "Software",
  country: "United States",
  currency: "USD",
  description: "Regression Test Corp provides software products for deterministic test coverage.",
  marketStatus: "Public Company",
};

const completeMetrics: FinancialMetrics = {
  marketCap: 250_000_000_000,
  revenueGrowthPercent: 18,
  profitMarginPercent: 25,
  debtToEquity: 0.25,
  peRatio: 28,
  freeCashFlowPositive: true,
  returnOnEquityPercent: 24,
  fiveYearReturnPercent: 95,
  returnPeriodLabel: "Last 5 Years Return",
  returnPeriodYears: 5,
  returnIsFullFiveYear: true,
};

const neutralNews: NewsItem[] = [
  {
    title: "Company reports stable demand",
    source: "Reuters",
    publishedAt: "2026-07-01",
    url: "https://example.com/news-1",
    sentiment: "neutral",
  },
  {
    title: "Analysts note execution progress",
    source: "Yahoo Finance",
    publishedAt: "2026-07-02",
    url: "https://example.com/news-2",
    sentiment: "positive",
  },
];

function readInvestmentSource(fileName: string) {
  return readFileSync(join(process.cwd(), "src", "lib", "investment", fileName), "utf8").replace(/\r\n/g, "\n");
}

function expectSourceContains(source: string, label: string, requiredSnippets: string[]) {
  for (const snippet of requiredSnippets) {
    assert.ok(
      source.includes(snippet),
      `${label} is missing required guardrail snippet: ${snippet}`,
    );
  }
}

const tests: TestCase[] = [
  {
    name: "company-name sanitizer removes HTML/script input without breaking valid names",
    run: () => {
      assert.equal(sanitizeCompanyNameInput("<script>alert('x')</script>NVIDIA"), "NVIDIA");
      assert.equal(sanitizeCompanyNameInput("<b>Apple</b>"), "Apple");
      assert.equal(sanitizeCompanyNameInput("M&M"), "M&M");
      assert.equal(sanitizeCompanyNameInput("C3.ai"), "C3.ai");
      assert.equal(sanitizeCompanyNameInput("InsideIIM / Altuni AI Labs"), "InsideIIM / Altuni AI Labs");
      assert.equal(sanitizeCompanyNameInput("   Reliance\u0000 Industries   "), "Reliance Industries");
      assert.ok(!sanitizeCompanyNameInput("<img src=x onerror=alert(1)>Tesla").includes("<"));
      assert.ok(!sanitizeCompanyNameInput("<img src=x onerror=alert(1)>Tesla").includes(">"));
    },
  },
  {
    name: "random/unverified company names receive zero score and zero trust",
    run: () => {
      const score = scoreUnverifiedCompany();
      const report = buildResearchReport({
        company: {
          ...baseCompany,
          name: "jbkjb",
          ticker: "UNKNOWN",
          exchange: "Unknown",
          sector: "Unknown",
          industry: "Unknown",
          country: "Unknown",
          currency: "Unknown",
          description: "No verified public-market identity was found.",
          marketStatus: "Unverified",
        },
        metrics: {
          ...completeMetrics,
          marketCap: 0,
          revenueGrowthPercent: 0,
          profitMarginPercent: 0,
          peRatio: 0,
          fiveYearReturnPercent: 0,
        },
        news: [],
        score,
        sources: [],
      });

      assert.equal(report.score.totalScore, 0);
      assert.equal(report.score.confidence, 0);
      assert.equal(report.verdict, "Research Needed");
      assert.match(report.summary, /delusional company name/i);
    },
  },
  {
    name: "complete public-company fundamentals do not fall into Research Needed",
    run: () => {
      const score = scoreInvestment(completeMetrics, neutralNews, [officialSource, trustedSource, researchSource]);
      const report = buildResearchReport({
        company: baseCompany,
        metrics: completeMetrics,
        news: neutralNews,
        score,
        sources: [officialSource, trustedSource, researchSource],
      });

      assert.notEqual(report.verdict, "Research Needed");
      assert.ok(report.score.totalScore >= 60, `Expected investable/watchlist score, got ${report.score.totalScore}`);
      assert.ok(report.summary.includes("revenue growth"));
      assert.ok(report.summary.includes("P/E ratio"));
    },
  },
  {
    name: "missing core fundamentals are disclosed instead of treated as zero evidence",
    run: () => {
      const metrics: FinancialMetrics = {
        ...completeMetrics,
        marketCap: 0,
        revenueGrowthPercent: 0,
        profitMarginPercent: 0,
        peRatio: 0,
        fiveYearReturnPercent: 120,
      };
      const score = scoreInvestment(metrics, [], [trustedSource]);
      const report = buildResearchReport({
        company: baseCompany,
        metrics,
        news: [],
        score,
        sources: [trustedSource],
      });

      assert.equal(report.verdict, "Research Needed");
      assert.ok(report.score.totalScore <= 45, `Expected completeness cap at or below 45, got ${report.score.totalScore}`);
      assert.match(report.summary, /needs more verified financial data/i);
      assert.match(report.summary, /return alone is not enough/i);
    },
  },
  {
    name: "guided project searches keep the custom high-confidence response",
    run: () => {
      const score = scoreGuidedBotProject();
      const report = buildResearchReport({
        company: {
          ...baseCompany,
          name: "AI Investment Research Bot",
          ticker: "INVESTABLEBOT",
          exchange: "Project Demo",
          sector: "AI Product",
          industry: "Investment Research Assistant",
          currency: "Unknown",
          marketStatus: "Private Company",
        },
        metrics: {
          ...completeMetrics,
          marketCap: 0,
          revenueGrowthPercent: 100,
          profitMarginPercent: 100,
          peRatio: 1,
          freeCashFlowPositive: true,
          returnOnEquityPercent: 100,
          fiveYearReturnPercent: 100,
          returnPeriodLabel: "Project confidence",
          returnPeriodYears: 1,
          returnIsFullFiveYear: false,
        },
        news: [],
        score,
        sources: [officialSource],
      });

      assert.equal(report.score.confidence, 92);
      assert.equal(report.verdict, "Invest");
      assert.match(report.summary, /works under your guidance/i);
    },
  },
  {
    name: "known ticker aliases protect primary listings and Indian resolver mappings",
    run: () => {
      const source = readInvestmentSource("liveDataProvider.ts");
      expectSourceContains(source, "Primary listing aliases", [
        'nvidia: { symbol: "NVDA"',
        'facebook: {\n    symbol: "META"',
        'motorola: {\n    symbol: "MSI"',
        'cocacola: {\n    symbol: "KO"',
        'infosys: { symbol: "INFY.NS"',
        'reliance: { symbol: "RELIANCE.NS"',
        'airtel: { symbol: "BHARTIARTL.NS"',
        'zomato: {\n    symbol: "ETERNAL.NS"',
        'flipkart: {\n    symbol: "WMT"',
        'swiggy: { symbol: "SWIGGY.NS"',
        'nykaa: { symbol: "NYKAA.NS"',
        'dmart: { symbol: "DMART.NS"',
        'paytm: { symbol: "PAYTM.NS"',
      ]);
      assert.ok(!source.includes('nvidia: { symbol: "NVD.DE"'), "NVIDIA must not resolve to the German secondary listing.");
      assert.ok(!source.includes('motorola: { symbol: "MTLA.F"'), "Motorola must not resolve to the Frankfurt secondary listing.");
    },
  },
  {
    name: "curated fallbacks preserve non-zero fundamentals for known provider gaps",
    run: () => {
      const source = readInvestmentSource("liveDataProvider.ts");
      expectSourceContains(source, "Curated fallback coverage", [
        "NVDA: {",
        "marketCap: 4718000000000",
        "revenueGrowthPercent: 65",
        "META: {",
        "revenueGrowthPercent: 33",
        "MSI: {",
        "revenueGrowthPercent: 8.32",
        '"RELIANCE.NS": {',
        "profitMarginPercent: 8.3",
        '"INFY.NS": {',
        "fiveYearReturnPercent: 90",
        '"SWIGGY.NS": {',
        "revenueGrowthPercent: 51.4",
        '"CCH.L": {',
        "profitMarginPercent: 8.5",
        "RDDT: {",
        "revenueGrowthPercent: 69",
        "RIVN: {",
        "profitMarginPercent: -94.3",
      ]);
    },
  },
  {
    name: "verdict threshold stays stable for explained score bands",
    run: () => {
      assert.equal(getVerdict(82, completeMetrics), "Invest");
      assert.equal(getVerdict(73, completeMetrics), "Watchlist");
      assert.equal(getVerdict(49, completeMetrics), "Pass");
      assert.equal(getVerdict(75, { ...completeMetrics, marketCap: 0, revenueGrowthPercent: 0 }), "Research Needed");
    },
  },
];

let passed = 0;
const failures: string[] = [];

for (const test of tests) {
  try {
    test.run();
    passed += 1;
    console.log(`PASS ${test.name}`);
  } catch (error) {
    const message = error instanceof Error ? error.stack ?? error.message : String(error);
    failures.push(`FAIL ${test.name}\n${message}`);
  }
}

if (failures.length > 0) {
  console.error(failures.join("\n\n"));
  process.exit(1);
}

console.log(`Accuracy regression suite passed: ${passed}/${tests.length} checks.`);



