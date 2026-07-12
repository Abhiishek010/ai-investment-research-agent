import type { CompanyDataset } from "./dataProviderTypes";
import type { CompanyProfile, FinancialMetrics, NewsItem, SourceReference } from "./types";

type FmpSearchResult = {
  symbol?: string;
  name?: string;
  exchange?: string;
  exchangeShortName?: string;
  type?: string;
  currency?: string;
  stockExchange?: string;
};

type FmpProfile = {
  symbol?: string;
  companyName?: string;
  companyNameLong?: string;
  exchange?: string;
  exchangeShortName?: string;
  industry?: string;
  sector?: string;
  country?: string;
  currency?: string;
  description?: string;
  mktCap?: number;
  marketCap?: number;
  cik?: string;
  website?: string;
  beta?: number;
  volAvg?: number;
  price?: number;
  eps?: number;
};

type FmpRatio = Record<string, number | string | null | undefined>;
type FmpStatement = Record<string, number | string | null | undefined>;
type FmpPriceChange = Record<string, number | string | null | undefined>;
type FmpHistoricalPrice = Record<string, number | string | null | undefined>;
type FmpNews = Record<string, string | string[] | undefined>;

type ReturnMeasurement = {
  percent: number;
  label: string;
  years: number;
  isFullFiveYear: boolean;
};
type YahooMetricFallback = {
  marketCap?: number;
  peRatio?: number;
  revenueGrowthPercent?: number;
  profitMarginPercent?: number;
  debtToEquity?: number;
  returnOnEquityPercent?: number;
  freeCashFlow?: number;
};
type CuratedMetricFallback = YahooMetricFallback & {
  latestRevenue?: number;
  previousRevenue?: number;
  netIncome?: number;
  fiveYearReturnPercent?: number;
  returnPeriodLabel?: string;
  returnPeriodYears?: number;
  returnIsFullFiveYear?: boolean;
  freeCashFlowPositive?: boolean;
  source: SourceReference;
};

const CURATED_METRIC_FALLBACKS: Record<string, CuratedMetricFallback> = {
  KO: {
    marketCap: 310000000000,
    revenueGrowthPercent: 1.8,
    profitMarginPercent: 27.3,
    peRatio: 24,
    latestRevenue: 47941000000,
    previousRevenue: 47061000000,
    netIncome: 13107000000,
    debtToEquity: 0.85,
    freeCashFlowPositive: true,
    source: {
      label: "Coca-Cola Company FY25 Results Cross-check",
      url: "https://investors.coca-colacompany.com/filings-reports/annual-filings-10-k",
      note: "Curated fallback for generic Coca-Cola searches when free-plan structured feeds miss KO operating fundamentals.",
      sourceType: "Official",
      credibility: "Primary",
      useFor: "Verify The Coca-Cola Company revenue, profit quality, valuation context, and primary NYSE identity.",
    },
  },
  AAPL: {
    marketCap: 4300000000000,
    revenueGrowthPercent: 6.4,
    profitMarginPercent: 26.9,
    peRatio: 40.5,
    debtToEquity: 1.52,
    freeCashFlowPositive: true,
    source: {
      label: "Apple Investor Relations Cross-check",
      url: "https://investor.apple.com/financials/default.aspx",
      note: "Curated fallback for Apple when free-plan structured feeds return only price history and omit operating fundamentals.",
      sourceType: "Official",
      credibility: "Primary",
      useFor: "Verify Apple revenue growth, profit quality, valuation context, leverage, and primary NASDAQ identity.",
    },
  },
  MSFT: {
    marketCap: 3900000000000,
    revenueGrowthPercent: 14.9,
    profitMarginPercent: 36.1,
    peRatio: 28.5,
    debtToEquity: 0.33,
    freeCashFlowPositive: true,
    source: {
      label: "Microsoft Investor Relations Cross-check",
      url: "https://www.microsoft.com/en-us/investor/earnings",
      note: "Curated fallback for Microsoft when free-plan structured feeds return only price history and omit operating fundamentals.",
      sourceType: "Official",
      credibility: "Primary",
      useFor: "Verify Microsoft revenue growth, profit quality, valuation context, leverage, and primary NASDAQ identity.",
    },
  },
  TSLA: {
    marketCap: 1000000000000,
    revenueGrowthPercent: 1.0,
    profitMarginPercent: 6.4,
    peRatio: 170,
    debtToEquity: 0.18,
    freeCashFlowPositive: true,
    source: {
      label: "Tesla Investor Relations Cross-check",
      url: "https://ir.tesla.com/#quarterly-disclosure",
      note: "Curated fallback for Tesla when free-plan structured feeds return only price history and omit operating fundamentals.",
      sourceType: "Official",
      credibility: "Primary",
      useFor: "Verify Tesla revenue trend, profit quality, valuation risk, leverage, and primary NASDAQ identity.",
    },
  },
  RIVN: {
    marketCap: 18000000000,
    revenueGrowthPercent: 12.1,
    profitMarginPercent: -94.3,
    peRatio: -4,
    debtToEquity: 0.42,
    latestRevenue: 4970000000,
    previousRevenue: 4434000000,
    netIncome: -4689000000,
    freeCashFlowPositive: false,
    source: {
      label: "Rivian FY24 Results Cross-check",
      url: "https://rivian.com/newsroom/article/rivian-releases-fourth-quarter-and-full-year-2024-financial-results",
      note: "Curated fallback for Rivian when free-plan structured feeds return only profile and price history. Rivian is scored as a verified public company, but with loss-making fundamentals and weak long-term stock performance.",
      sourceType: "Official",
      credibility: "Primary",
      useFor: "Verify Rivian revenue growth, negative profit margin, negative earnings valuation context, and public NASDAQ identity.",
    },
  },
  RDDT: {
    marketCap: 32000000000,
    revenueGrowthPercent: 69,
    profitMarginPercent: 30.7,
    peRatio: 45,
    debtToEquity: 0.05,
    latestRevenue: 663400000,
    previousRevenue: 392400000,
    netIncome: 203980000,
    freeCashFlowPositive: true,
    source: {
      label: "Reddit Q1 2026 Results Cross-check",
      url: "https://investor.redditinc.com/financials/quarterly-results/default.aspx",
      note: "Curated fallback for Reddit when free-plan structured feeds return only the NYSE ticker and post-IPO return history but omit operating fundamentals.",
      sourceType: "Official",
      credibility: "Primary",
      useFor: "Verify Reddit revenue growth, profitability, valuation context, balance-sheet risk, and primary NYSE identity.",
    },
  },
  WMT: {
    marketCap: 800000000000,
    revenueGrowthPercent: 5.1,
    profitMarginPercent: 2.5,
    peRatio: 38,
    debtToEquity: 0.7,
    freeCashFlowPositive: true,
    source: {
      label: "Walmart Investor Relations Cross-check",
      url: "https://stock.walmart.com/financial-information/annual-reports-and-proxies/default.aspx",
      note: "Curated fallback for Walmart when Flipkart/Myntra resolve to parent company Walmart and free-plan feeds omit operating fundamentals.",
      sourceType: "Official",
      credibility: "Primary",
      useFor: "Verify Walmart revenue growth, profit quality, valuation context, leverage, and parent-company identity for Flipkart/Myntra searches.",
    },
  },
  "CCH.L": {
    marketCap: 22470000000,
    revenueGrowthPercent: 7.9,
    profitMarginPercent: 8.5,
    peRatio: 24,
    latestRevenue: 11604500000,
    previousRevenue: 10754400000,
    netIncome: 989300000,
    debtToEquity: 0.35,
    returnOnEquityPercent: 19.4,
    freeCashFlowPositive: true,
    source: {
      label: "Coca-Cola HBC FY25 Results Cross-check",
      url: "https://www.coca-colahellenic.com/content/dam/cch/us/documents/investors-and-financial/2025-fy-results/coca-cola-hbc-fy-2025-press-release.pdf.downloadasset.pdf",
      note: "Curated fallback for Coca-Cola HBC when structured feeds return market data but miss operating fundamentals from the LSE primary listing.",
      sourceType: "Official",
      credibility: "Primary",
      useFor: "Verify FY25 revenue growth, profit quality, free cash flow, ROIC, and primary-listing identity.",
    },
  },
  CCHGY: {
    marketCap: 22470000000,
    revenueGrowthPercent: 7.9,
    profitMarginPercent: 8.5,
    peRatio: 24,
    latestRevenue: 11604500000,
    previousRevenue: 10754400000,
    netIncome: 989300000,
    debtToEquity: 0.35,
    returnOnEquityPercent: 19.4,
    freeCashFlowPositive: true,
    source: {
      label: "Coca-Cola HBC FY25 Results Cross-check",
      url: "https://www.coca-colahellenic.com/content/dam/cch/us/documents/investors-and-financial/2025-fy-results/coca-cola-hbc-fy-2025-press-release.pdf.downloadasset.pdf",
      note: "Curated fallback for Coca-Cola HBC when OTC or structured feeds return market data but miss operating fundamentals.",
      sourceType: "Official",
      credibility: "Primary",
      useFor: "Verify FY25 revenue growth, profit quality, free cash flow, ROIC, and primary-listing identity.",
    },
  },
  MSI: {
    marketCap: 64650000000,
    revenueGrowthPercent: 8.32,
    profitMarginPercent: 14,
    peRatio: 35.91,
    latestRevenue: 11680000000,
    previousRevenue: 10810000000,
    freeCashFlowPositive: true,
    source: {
      label: "Motorola Solutions Primary Listing Cross-check",
      url: "https://www.motorolasolutions.com/en_us/about/investors.html",
      note: "Curated fallback for Motorola Solutions when foreign secondary listings or provider gaps hide NYSE: MSI fundamentals.",
      sourceType: "Official",
      credibility: "Primary",
      useFor: "Ensure Motorola Solutions resolves to the NYSE primary listing and does not get scored from incomplete Frankfurt-listing data.",
    },
  },
  META: {
    marketCap: 1424870000000,
    revenueGrowthPercent: 33,
    profitMarginPercent: 48,
    peRatio: 20.04,
    debtToEquity: 0.36,
    latestRevenue: 56300000000,
    netIncome: 27000000000,
    freeCashFlowPositive: true,
    source: {
      label: "Meta Q1 2026 Results Cross-check",
      url: "https://investor.atmeta.com/financials/default.aspx",
      note: "Curated fallback for Meta when old-name lookups such as Facebook resolve the ticker but hide current Meta Platforms fundamentals.",
      sourceType: "Official",
      credibility: "Primary",
      useFor: "Ensure Facebook/Instagram/WhatsApp searches resolve to Meta Platforms fundamentals on the primary NASDAQ listing.",
    },
  },
  NVDA: {
    marketCap: 4718000000000,
    revenueGrowthPercent: 65,
    profitMarginPercent: 54.2,
    peRatio: 34.85,
    latestRevenue: 215938000000,
    previousRevenue: 130497000000,
    netIncome: 116997000000,
    freeCashFlowPositive: true,
    source: {
      label: "NVIDIA FY26 Results Cross-check",
      url: "https://investor.nvidia.com/financial-info/financial-reports/default.aspx",
      note: "Curated fallback for NVIDIA when secondary listings or provider rate limits hide primary NASDAQ fundamentals; cross-checks FY26 revenue, profit, growth, market cap, and valuation.",
      sourceType: "Official",
      credibility: "Primary",
      useFor: "Ensure NVIDIA resolves to primary NASDAQ fundamentals instead of incomplete foreign-listing data.",
    },
  },
  "RELIANCE.NS": {
    marketCap: 17646425600000,
    revenueGrowthPercent: 5.3,
    profitMarginPercent: 8.3,
    peRatio: 22.63,
    debtToEquity: 0.24,
    netIncome: 957540000000,
    latestRevenue: 10557800000000,
    freeCashFlowPositive: true,
    source: {
      label: "Reliance FY25 and Market Data Cross-check",
      url: "https://www.ril.com/investors/financial-reporting/annual-reports",
      note: "Curated fallback for Reliance when structured feeds return placeholder zeros for NSE fundamentals; cross-checks annual-report fundamentals and market-data snapshots.",
      sourceType: "Official",
      credibility: "Primary",
      useFor: "Prevent missing NSE fundamentals from being treated as zero revenue growth, zero margin, zero P/E, or unavailable market cap.",
    },
  },
  "INFY.NS": {
    marketCap: 4348080000000,
    revenueGrowthPercent: 3.1,
    profitMarginPercent: 16.4,
    debtToEquity: 0.11,
    peRatio: 15.4,
    latestRevenue: 20158000000,
    previousRevenue: 19277000000,
    netIncome: 3313000000,
    returnOnEquityPercent: 32.68,
    fiveYearReturnPercent: 90,
    returnPeriodLabel: "Last 5 Years Return",
    returnPeriodYears: 5,
    returnIsFullFiveYear: true,
    freeCashFlowPositive: true,
    source: {
      label: "Infosys FY26 Results Cross-check",
      url: "https://www.infosys.com/investors/reports-filings/quarterly-results/2025-2026/q4/documents/ifrs-usd-press-release.pdf",
      note: "Curated fallback for Infosys when NSE structured feeds return placeholder zeros for growth, profitability, and balance-sheet quality.",
      sourceType: "Official",
      credibility: "Primary",
      useFor: "Verify FY26 revenue growth, profit quality, free cash flow, and primary NSE/NYSE listed-company identity.",
    },
  },
  "SWIGGY.NS": {
    marketCap: 687000000000,
    revenueGrowthPercent: 51.4,
    profitMarginPercent: -18.0,
    peRatio: -15,
    latestRevenue: 230530000000,
    previousRevenue: 152270000000,
    netIncome: -41540000000,
    fiveYearReturnPercent: -37,
    returnPeriodLabel: "Since Listing Return",
    returnPeriodYears: 1.7,
    returnIsFullFiveYear: false,
    freeCashFlowPositive: false,
    source: {
      label: "Swiggy FY26 Results Cross-check",
      url: "https://m.economictimes.com/markets/stocks/earnings/swiggy-q4-results-loss-narrows-to-rs-800-crore-revenue-surges-45-yoy/articleshow/130956969.cms",
      note: "Curated fallback for Swiggy when structured feeds return placeholder zeros; verifies strong FY26 revenue growth and continuing losses.",
      sourceType: "Trusted Third Party",
      credibility: "High",
      useFor: "Prevent placeholder zero revenue, margin, and valuation fields from being treated as real data.",
    },
  },
};



type YahooChartResponse = {
  chart?: {
    result?: Array<{
      timestamp?: number[];
      indicators?: {
        quote?: Array<{
          close?: Array<number | null>;
        }>;
        adjclose?: Array<{
          adjclose?: Array<number | null>;
        }>;
      };
    }>;
  };
};

type YahooSearchResponse = {
  quotes?: Array<{
    symbol?: string;
    shortname?: string;
    longname?: string;
    exchange?: string;
    exchDisp?: string;
    quoteType?: string;
    typeDisp?: string;
    currency?: string;
  }>;
};

const FMP_BASE_URL = "https://financialmodelingprep.com/stable";
const YAHOO_CHART_BASE_URL = "https://query1.finance.yahoo.com/v8/finance/chart";
const LIVE_DATA_CACHE_TTL_MS = 5 * 60 * 1000;
const liveDataCache = new Map<string, { expiresAt: number; data: CompanyDataset }>();
const liveDataInflight = new Map<string, Promise<CompanyDataset | null>>();
const FMP_FULL_FINANCIALS_ENABLED = process.env.FMP_FULL_FINANCIALS === "true";

type KnownTickerAlias = {
  symbol: string;
  name?: string;
  marketStatus?: CompanyProfile["marketStatus"];
  securityType?: string;
  parentCompany?: string;
  resolutionNote?: string;
};

const KNOWN_TICKER_ALIASES: Record<string, KnownTickerAlias> = {
  microsoft: { symbol: "MSFT", name: "Microsoft Corporation" },
  msft: { symbol: "MSFT", name: "Microsoft Corporation" },
  apple: { symbol: "AAPL", name: "Apple Inc." },
  aapl: { symbol: "AAPL", name: "Apple Inc." },
  nvidia: { symbol: "NVDA", name: "NVIDIA Corporation" },
  nvidiacorporation: { symbol: "NVDA", name: "NVIDIA Corporation" },
  nvda: { symbol: "NVDA", name: "NVIDIA Corporation" },
  tesla: { symbol: "TSLA", name: "Tesla, Inc." },
  tsla: { symbol: "TSLA", name: "Tesla, Inc." },
  amazon: { symbol: "AMZN", name: "Amazon.com, Inc." },
  cocacola: {
    symbol: "KO",
    name: "The Coca-Cola Company",
    resolutionNote: "Generic Coca-Cola searches resolve to The Coca-Cola Company, the primary NYSE-listed company under ticker KO. Search Coca-Cola HBC or CCH for Coca-Cola HBC AG.",
  },
  thecocacolacompany: { symbol: "KO", name: "The Coca-Cola Company" },
  cocacolacompany: { symbol: "KO", name: "The Coca-Cola Company" },
  ko: { symbol: "KO", name: "The Coca-Cola Company" },
  cocacolahbc: { symbol: "CCH.L", name: "Coca-Cola HBC AG" },
  cocacolahbcag: { symbol: "CCH.L", name: "Coca-Cola HBC AG" },
  cocacolahellenic: { symbol: "CCH.L", name: "Coca-Cola HBC AG" },
  cch: { symbol: "CCH.L", name: "Coca-Cola HBC AG" },
  amzn: { symbol: "AMZN", name: "Amazon.com, Inc." },
  alphabet: { symbol: "GOOGL", name: "Alphabet Inc." },
  googl: { symbol: "GOOGL", name: "Alphabet Inc." },
  meta: { symbol: "META", name: "Meta Platforms, Inc." },
  metaplatforms: { symbol: "META", name: "Meta Platforms, Inc." },
  fb: { symbol: "META", name: "Meta Platforms, Inc." },
  facebook: {
    symbol: "META",
    name: "Meta Platforms, Inc.",
    parentCompany: "Meta Platforms, Inc.",
    resolutionNote: "Facebook is the former brand/company name; the bot researches the current listed company Meta Platforms.",
  },
  netflix: { symbol: "NFLX", name: "Netflix, Inc." },
  motorola: {
    symbol: "MSI",
    name: "Motorola Solutions, Inc.",
    resolutionNote: "Motorola is ambiguous, so the bot researches Motorola Solutions, the NYSE-listed public company under ticker MSI.",
  },
  motorolasolutions: { symbol: "MSI", name: "Motorola Solutions, Inc." },
  motorolasolutionsinc: { symbol: "MSI", name: "Motorola Solutions, Inc." },
  msi: { symbol: "MSI", name: "Motorola Solutions, Inc." },
  c3ai: { symbol: "AI" },
  c3: { symbol: "AI" },
  palantir: { symbol: "PLTR" },
  robinhood: { symbol: "HOOD" },
  coinbase: { symbol: "COIN" },
  rivian: { symbol: "RIVN" },
  reddit: { symbol: "RDDT", name: "Reddit, Inc." },
  rddt: { symbol: "RDDT", name: "Reddit, Inc." },
  sofi: { symbol: "SOFI" },

  reliance: { symbol: "RELIANCE.NS", name: "Reliance Industries Limited" },
  ril: { symbol: "RELIANCE.NS", name: "Reliance Industries Limited" },
  relianceindustries: { symbol: "RELIANCE.NS", name: "Reliance Industries Limited" },
  jio: {
    symbol: "RELIANCE.NS",
    name: "Reliance Industries Limited",
    marketStatus: "Subsidiary/Brand",
    parentCompany: "Reliance Industries Limited",
    resolutionNote: "Jio is not separately listed, so the bot researches listed parent company Reliance Industries.",
  },
  reliancejio: {
    symbol: "RELIANCE.NS",
    name: "Reliance Industries Limited",
    marketStatus: "Subsidiary/Brand",
    parentCompany: "Reliance Industries Limited",
    resolutionNote: "Reliance Jio is not separately listed, so the bot researches listed parent company Reliance Industries.",
  },
  jioplatforms: {
    symbol: "RELIANCE.NS",
    name: "Reliance Industries Limited",
    marketStatus: "Subsidiary/Brand",
    parentCompany: "Reliance Industries Limited",
    resolutionNote: "Jio Platforms is not separately listed, so the bot researches listed parent company Reliance Industries.",
  },

  airtel: { symbol: "BHARTIARTL.NS", name: "Bharti Airtel Limited" },
  bhartiairtel: { symbol: "BHARTIARTL.NS", name: "Bharti Airtel Limited" },
  bharti: { symbol: "BHARTIARTL.NS", name: "Bharti Airtel Limited" },
  idea: { symbol: "IDEA.NS", name: "Vodafone Idea Limited" },
  vodafoneidea: { symbol: "IDEA.NS", name: "Vodafone Idea Limited" },
  vi: { symbol: "IDEA.NS", name: "Vodafone Idea Limited" },
  vodafone: { symbol: "IDEA.NS", name: "Vodafone Idea Limited" },

  tatamotors: { symbol: "TATAMOTORS.NS", name: "Tata Motors Limited" },
  tata: { symbol: "TATAMOTORS.NS", name: "Tata Motors Limited" },
  tcs: { symbol: "TCS.NS", name: "Tata Consultancy Services Limited" },
  tataconsultancyservices: { symbol: "TCS.NS", name: "Tata Consultancy Services Limited" },
  hdfcbank: { symbol: "HDFCBANK.NS", name: "HDFC Bank Limited" },
  hdfc: { symbol: "HDFCBANK.NS", name: "HDFC Bank Limited" },
  infosys: { symbol: "INFY.NS", name: "Infosys Limited" },
  infy: { symbol: "INFY.NS", name: "Infosys Limited" },
  icicibank: { symbol: "ICICIBANK.NS", name: "ICICI Bank Limited" },
  sbi: { symbol: "SBIN.NS", name: "State Bank of India" },
  statebankofindia: { symbol: "SBIN.NS", name: "State Bank of India" },
  kotakbank: { symbol: "KOTAKBANK.NS", name: "Kotak Mahindra Bank Limited" },
  kotak: { symbol: "KOTAKBANK.NS", name: "Kotak Mahindra Bank Limited" },
  axisbank: { symbol: "AXISBANK.NS", name: "Axis Bank Limited" },

  adanienterprises: { symbol: "ADANIENT.NS", name: "Adani Enterprises Limited" },
  adani: { symbol: "ADANIENT.NS", name: "Adani Enterprises Limited" },
  bajajfinance: { symbol: "BAJFINANCE.NS", name: "Bajaj Finance Limited" },
  bajaj: { symbol: "BAJFINANCE.NS", name: "Bajaj Finance Limited" },
  maruti: { symbol: "MARUTI.NS", name: "Maruti Suzuki India Limited" },
  marutisuzuki: { symbol: "MARUTI.NS", name: "Maruti Suzuki India Limited" },
  mahindra: { symbol: "M&M.NS", name: "Mahindra & Mahindra Limited" },
  mandm: { symbol: "M&M.NS", name: "Mahindra & Mahindra Limited" },
  lt: { symbol: "LT.NS", name: "Larsen & Toubro Limited" },
  larsentoubro: { symbol: "LT.NS", name: "Larsen & Toubro Limited" },
  itc: { symbol: "ITC.NS", name: "ITC Limited" },
  hindustanunilever: { symbol: "HINDUNILVR.NS", name: "Hindustan Unilever Limited" },
  hul: { symbol: "HINDUNILVR.NS", name: "Hindustan Unilever Limited" },
  asianpaints: { symbol: "ASIANPAINT.NS", name: "Asian Paints Limited" },
  wipro: { symbol: "WIPRO.NS", name: "Wipro Limited" },
  hcl: { symbol: "HCLTECH.NS", name: "HCL Technologies Limited" },
  hcltech: { symbol: "HCLTECH.NS", name: "HCL Technologies Limited" },
  sunpharma: { symbol: "SUNPHARMA.NS", name: "Sun Pharmaceutical Industries Limited" },
  dmart: { symbol: "DMART.NS", name: "Avenue Supermarts Limited" },
  avenuesupermarts: { symbol: "DMART.NS", name: "Avenue Supermarts Limited" },
  lic: { symbol: "LICI.NS", name: "Life Insurance Corporation of India" },
  lici: { symbol: "LICI.NS", name: "Life Insurance Corporation of India" },
  paytm: { symbol: "PAYTM.NS", name: "One 97 Communications Limited" },
  paytmapp: { symbol: "PAYTM.NS", name: "One 97 Communications Limited" },

  eternal: { symbol: "ETERNAL.NS", name: "Eternal Limited" },
  zomato: {
    symbol: "ETERNAL.NS",
    name: "Eternal Limited",
    marketStatus: "Subsidiary/Brand",
    parentCompany: "Eternal Limited",
    resolutionNote: "Zomato is now under listed parent company Eternal Limited, so the bot researches Eternal.",
  },
  blinkit: {
    symbol: "ETERNAL.NS",
    name: "Eternal Limited",
    marketStatus: "Subsidiary/Brand",
    parentCompany: "Eternal Limited",
    resolutionNote: "Blinkit is part of listed parent company Eternal Limited, so the bot researches Eternal.",
  },
  district: {
    symbol: "ETERNAL.NS",
    name: "Eternal Limited",
    marketStatus: "Subsidiary/Brand",
    parentCompany: "Eternal Limited",
    resolutionNote: "District is part of listed parent company Eternal Limited, so the bot researches Eternal.",
  },

  swiggy: { symbol: "SWIGGY.NS", name: "Swiggy Limited" },
  swiggyinstamart: {
    symbol: "SWIGGY.NS",
    name: "Swiggy Limited",
    marketStatus: "Subsidiary/Brand",
    parentCompany: "Swiggy Limited",
    resolutionNote: "Instamart is part of listed parent company Swiggy Limited, so the bot researches Swiggy.",
  },
  instamart: {
    symbol: "SWIGGY.NS",
    name: "Swiggy Limited",
    marketStatus: "Subsidiary/Brand",
    parentCompany: "Swiggy Limited",
    resolutionNote: "Instamart is part of listed parent company Swiggy Limited, so the bot researches Swiggy.",
  },
  dineout: {
    symbol: "SWIGGY.NS",
    name: "Swiggy Limited",
    marketStatus: "Subsidiary/Brand",
    parentCompany: "Swiggy Limited",
    resolutionNote: "Dineout is part of listed parent company Swiggy Limited, so the bot researches Swiggy.",
  },

  nykaa: { symbol: "NYKAA.NS", name: "FSN E-Commerce Ventures Limited" },
  fsnecommerce: { symbol: "NYKAA.NS", name: "FSN E-Commerce Ventures Limited" },
  policybazaar: {
    symbol: "POLICYBZR.NS",
    name: "PB Fintech Limited",
    marketStatus: "Subsidiary/Brand",
    parentCompany: "PB Fintech Limited",
    resolutionNote: "Policybazaar is operated by listed parent company PB Fintech, so the bot researches PB Fintech.",
  },
  paisabazaar: {
    symbol: "POLICYBZR.NS",
    name: "PB Fintech Limited",
    marketStatus: "Subsidiary/Brand",
    parentCompany: "PB Fintech Limited",
    resolutionNote: "Paisabazaar is part of listed parent company PB Fintech, so the bot researches PB Fintech.",
  },
  pbfintech: { symbol: "POLICYBZR.NS", name: "PB Fintech Limited" },

  makemytrip: { symbol: "MMYT", name: "MakeMyTrip Limited" },
  mmt: { symbol: "MMYT", name: "MakeMyTrip Limited" },
  goibibo: {
    symbol: "MMYT",
    name: "MakeMyTrip Limited",
    marketStatus: "Subsidiary/Brand",
    parentCompany: "MakeMyTrip Limited",
    resolutionNote: "Goibibo is part of listed parent company MakeMyTrip, so the bot researches MakeMyTrip.",
  },
  redbus: {
    symbol: "MMYT",
    name: "MakeMyTrip Limited",
    marketStatus: "Subsidiary/Brand",
    parentCompany: "MakeMyTrip Limited",
    resolutionNote: "redBus is part of listed parent company MakeMyTrip, so the bot researches MakeMyTrip.",
  },

  irctc: { symbol: "IRCTC.NS", name: "Indian Railway Catering and Tourism Corporation Limited" },
  easemytrip: { symbol: "EASEMYTRIP.NS", name: "Easy Trip Planners Limited" },
  ixigo: { symbol: "IXIGO.NS", name: "Le Travenues Technology Limited" },
  indiamart: { symbol: "INDIAMART.NS", name: "IndiaMART InterMESH Limited" },
  naukri: { symbol: "NAUKRI.NS", name: "Info Edge (India) Limited" },
  infoedge: { symbol: "NAUKRI.NS", name: "Info Edge (India) Limited" },
  "99acres": {
    symbol: "NAUKRI.NS",
    name: "Info Edge (India) Limited",
    marketStatus: "Subsidiary/Brand",
    parentCompany: "Info Edge (India) Limited",
    resolutionNote: "99acres is part of listed parent company Info Edge, so the bot researches Info Edge.",
  },
  jeevansathi: {
    symbol: "NAUKRI.NS",
    name: "Info Edge (India) Limited",
    marketStatus: "Subsidiary/Brand",
    parentCompany: "Info Edge (India) Limited",
    resolutionNote: "Jeevansathi is part of listed parent company Info Edge, so the bot researches Info Edge.",
  },
  justdial: { symbol: "JUSTDIAL.NS", name: "Just Dial Limited" },
  justdialapp: { symbol: "JUSTDIAL.NS", name: "Just Dial Limited" },
  delhivery: { symbol: "DELHIVERY.NS", name: "Delhivery Limited" },
  olaelectric: { symbol: "OLAELEC.NS", name: "Ola Electric Mobility Limited" },
  firstcry: { symbol: "FIRSTCRY.NS", name: "Brainbees Solutions Limited" },
  brainbees: { symbol: "FIRSTCRY.NS", name: "Brainbees Solutions Limited" },
  mamaearth: { symbol: "HONASA.NS", name: "Honasa Consumer Limited" },
  honasa: { symbol: "HONASA.NS", name: "Honasa Consumer Limited" },
  nazara: { symbol: "NAZARA.NS", name: "Nazara Technologies Limited" },
  mapmyindia: { symbol: "MAPMYINDIA.NS", name: "C.E. Info Systems Limited" },
  cartrade: { symbol: "CARTRADE.NS", name: "CarTrade Tech Limited" },

  amazonindia: {
    symbol: "AMZN",
    marketStatus: "Subsidiary/Brand",
    parentCompany: "Amazon.com, Inc.",
    resolutionNote: "Amazon India is not separately listed, so the bot researches parent company Amazon.",
  },
  primevideo: {
    symbol: "AMZN",
    marketStatus: "Subsidiary/Brand",
    parentCompany: "Amazon.com, Inc.",
    resolutionNote: "Prime Video is part of Amazon, so the bot researches parent company Amazon.",
  },
  amazonprime: {
    symbol: "AMZN",
    marketStatus: "Subsidiary/Brand",
    parentCompany: "Amazon.com, Inc.",
    resolutionNote: "Amazon Prime is part of Amazon, so the bot researches parent company Amazon.",
  },
  flipkart: {
    symbol: "WMT",
    marketStatus: "Subsidiary/Brand",
    parentCompany: "Walmart Inc.",
    resolutionNote: "Flipkart is not separately listed, so the bot researches parent company Walmart.",
  },
  myntra: {
    symbol: "WMT",
    marketStatus: "Subsidiary/Brand",
    parentCompany: "Walmart Inc.",
    resolutionNote: "Myntra is part of Flipkart/Walmart, so the bot researches parent company Walmart.",
  },
  netflixindia: {
    symbol: "NFLX",
    marketStatus: "Subsidiary/Brand",
    parentCompany: "Netflix, Inc.",
    resolutionNote: "Netflix India is not separately listed, so the bot researches parent company Netflix.",
  },
  uberindia: {
    symbol: "UBER",
    marketStatus: "Subsidiary/Brand",
    parentCompany: "Uber Technologies, Inc.",
    resolutionNote: "Uber India is not separately listed, so the bot researches parent company Uber.",
  },
  youtube: {
    symbol: "GOOGL",
    marketStatus: "Subsidiary/Brand",
    parentCompany: "Alphabet Inc.",
    resolutionNote: "YouTube is not separately listed, so the bot researches parent company Alphabet.",
  },
  google: { symbol: "GOOGL", parentCompany: "Alphabet Inc." },
  instagram: {
    symbol: "META",
    marketStatus: "Subsidiary/Brand",
    parentCompany: "Meta Platforms, Inc.",
    resolutionNote: "Instagram is not separately listed, so the bot researches parent company Meta Platforms.",
  },
  whatsapp: {
    symbol: "META",
    marketStatus: "Subsidiary/Brand",
    parentCompany: "Meta Platforms, Inc.",
    resolutionNote: "WhatsApp is not separately listed, so the bot researches parent company Meta Platforms.",
  },
  github: {
    symbol: "MSFT",
    marketStatus: "Subsidiary/Brand",
    parentCompany: "Microsoft Corporation",
    resolutionNote: "GitHub is not separately listed, so the bot researches parent company Microsoft.",
  },
  aws: {
    symbol: "AMZN",
    marketStatus: "Subsidiary/Brand",
    parentCompany: "Amazon.com, Inc.",
    resolutionNote: "AWS is an Amazon business segment, so the bot researches parent company Amazon.",
  },

  spy: { symbol: "SPY", marketStatus: "ETF/Fund", securityType: "ETF" },
  sp500: { symbol: "SPY", marketStatus: "ETF/Fund", securityType: "ETF" },
  qqq: { symbol: "QQQ", marketStatus: "ETF/Fund", securityType: "ETF" },
  voo: { symbol: "VOO", marketStatus: "ETF/Fund", securityType: "ETF" },
  vti: { symbol: "VTI", marketStatus: "ETF/Fund", securityType: "ETF" },
  niftybees: { symbol: "NIFTYBEES.NS", marketStatus: "ETF/Fund", securityType: "ETF" },
};

function getFmpApiKey() {
  return process.env.FMP_API_KEY ?? process.env.FINANCIAL_DATA_API_KEY ?? "";
}

function toFiniteNumber(value: unknown) {
  const parsed = typeof value === "number" ? value : Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function firstNumber(...values: unknown[]) {
  for (const value of values) {
    const parsed = toFiniteNumber(value);
    if (parsed !== 0) {
      return parsed;
    }
  }

  return 0;
}
function optionalNumber(value: unknown) {
  const parsed = typeof value === "number" ? value : Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
}

function getRecordValue(record: Record<string, unknown> | undefined, key: string) {
  return record?.[key];
}

function getYahooNumber(record: Record<string, unknown> | undefined, key: string) {
  const value = getRecordValue(record, key);

  if (value && typeof value === "object" && "raw" in value) {
    return optionalNumber((value as { raw?: unknown }).raw);
  }

  return optionalNumber(value);
}

function normalizeYahooPercent(value: number | undefined) {
  if (value === undefined) {
    return undefined;
  }

  return Math.abs(value) <= 3 ? value * 100 : value;
}

function normalizeYahooDebtToEquity(value: number | undefined) {
  if (value === undefined) {
    return undefined;
  }

  return Math.abs(value) > 10 ? value / 100 : value;
}


function percentFromRatio(value: unknown) {
  const parsed = toFiniteNumber(value);

  if (parsed === 0) {
    return 0;
  }

  return Math.abs(parsed) <= 3 ? parsed * 100 : parsed;
}

function percentFromPriceChange(value: unknown) {
  const parsed = toFiniteNumber(value);

  if (parsed === 0) {
    return 0;
  }

  return Math.abs(parsed) <= 5 ? parsed * 100 : parsed;
}

function getHistoricalPriceValue(item: FmpHistoricalPrice) {
  return firstNumber(item.price, item.adjClose, item.close);
}

function buildReturnMeasurement(percent: number, years: number): ReturnMeasurement {
  const isFullFiveYear = years >= 4.5;

  return {
    percent,
    years,
    isFullFiveYear,
    label: isFullFiveYear ? "Last 5 Years Return" : years >= 0.75 ? "Since Listing Return" : "Available Return",
  };
}

function emptyReturnMeasurement(): ReturnMeasurement {
  return {
    percent: 0,
    label: "Last 5 Years Return",
    years: 0,
    isFullFiveYear: false,
  };
}

function yearsBetweenDates(firstDate: string, lastDate: string) {
  const first = new Date(firstDate).getTime();
  const last = new Date(lastDate).getTime();

  if (!Number.isFinite(first) || !Number.isFinite(last) || last <= first) {
    return 0;
  }

  return (last - first) / (365.25 * 24 * 60 * 60 * 1000);
}

function calculateReturnFromHistoricalPrices(prices: FmpHistoricalPrice[]): ReturnMeasurement {
  const usablePrices = prices
    .map((item) => ({
      date: String(item.date ?? ""),
      price: getHistoricalPriceValue(item),
    }))
    .filter((item) => item.date && item.price > 0)
    .sort((a, b) => a.date.localeCompare(b.date));

  const first = usablePrices[0];
  const last = usablePrices[usablePrices.length - 1];

  if (!first || !last || first.price <= 0) {
    return emptyReturnMeasurement();
  }

  const percent = ((last.price - first.price) / first.price) * 100;
  return buildReturnMeasurement(percent, yearsBetweenDates(first.date, last.date));
}

function getFiveYearReturn(priceChange: FmpPriceChange, historicalPrices: FmpHistoricalPrice[]): ReturnMeasurement {
  const historicalReturn = calculateReturnFromHistoricalPrices(historicalPrices);

  if (historicalReturn.percent !== 0) {
    return historicalReturn;
  }

  const directReturn = percentFromPriceChange(
    priceChange["5Y"] ??
      priceChange["5y"] ??
      priceChange["fiveYear"] ??
      priceChange["fiveYearReturn"] ??
      priceChange["5Year"],
  );

  if (directReturn !== 0) {
    return buildReturnMeasurement(directReturn, 5);
  }

  return emptyReturnMeasurement();
}

function formatDateForFmp(date: Date) {
  return date.toISOString().slice(0, 10);
}

function getFiveYearDateRange() {
  const to = new Date();
  const from = new Date(to);
  from.setFullYear(from.getFullYear() - 5);

  return {
    from: formatDateForFmp(from),
    to: formatDateForFmp(to),
  };
}

function formatProviderWarning(reason: unknown) {
  if (reason instanceof Error) {
    return reason.message;
  }

  if (typeof reason === "string") {
    return reason;
  }

  return "Provider request did not complete.";
}

function valueOrFallback<T>(result: PromiseSettledResult<T>, fallback: T, label: string) {
  if (result.status === "fulfilled") {
    return result.value;
  }

  console.warn(`Optional dataset unavailable: ${label}. ${formatProviderWarning(result.reason)}`);
  return fallback;
}

async function fetchWithTimeout(url: URL, init: RequestInit, timeoutMs: number, label: string) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(`${label} exceeded ${timeoutMs}ms`), timeoutMs);

  try {
    return await fetch(url, {
      ...init,
      signal: controller.signal,
    });
  } finally {
    clearTimeout(timeout);
  }
}

async function fetchYahooJson<T>(url: URL, timeoutMs = 3500) {
  const response = await fetchWithTimeout(
    url,
    {
      headers: {
        Accept: "application/json",
        "User-Agent": "Mozilla/5.0 InvestmentResearchAgent/1.0",
      },
      next: {
        revalidate: 3600,
      },
    },
    timeoutMs,
    `Yahoo ${url.pathname}`,
  );

  if (!response.ok) {
    throw new Error(`Yahoo request failed: ${response.status}`);
  }

  return (await response.json()) as T;
}

function yahooQuoteTypeToFmpType(quoteType: string | undefined, typeDisplay: string | undefined) {
  const normalized = `${quoteType ?? ""} ${typeDisplay ?? ""}`.toLowerCase();

  if (normalized.includes("etf") || normalized.includes("fund")) {
    return "etf";
  }

  if (normalized.includes("equity") || normalized.includes("stock")) {
    return "stock";
  }

  return quoteType?.toLowerCase() || typeDisplay?.toLowerCase() || "stock";
}

function normalizeYahooSearchCandidate(item: NonNullable<YahooSearchResponse["quotes"]>[number]): FmpSearchResult | undefined {
  const symbol = item.symbol?.trim();
  const name = item.longname?.trim() || item.shortname?.trim();

  if (!symbol || !name) {
    return undefined;
  }

  return {
    symbol,
    name,
    exchangeShortName: item.exchange || item.exchDisp,
    exchange: item.exchDisp || item.exchange,
    type: yahooQuoteTypeToFmpType(item.quoteType, item.typeDisp),
    currency: item.currency,
  };
}

async function fetchYahooSearchCandidates(companyName: string): Promise<FmpSearchResult[]> {
  const url = new URL("https://query2.finance.yahoo.com/v1/finance/search");
  url.searchParams.set("q", companyName);
  url.searchParams.set("quotesCount", "8");
  url.searchParams.set("newsCount", "0");
  url.searchParams.set("enableFuzzyQuery", "false");

  const payload = await fetchYahooJson<YahooSearchResponse>(url, 2200);

  return (payload.quotes ?? [])
    .map(normalizeYahooSearchCandidate)
    .filter((item): item is FmpSearchResult => Boolean(item));
}

async function fetchYahooMetricFallback(symbol: string, timeoutMs = 3500): Promise<YahooMetricFallback> {
  const quoteUrl = new URL("https://query1.finance.yahoo.com/v7/finance/quote");
  quoteUrl.searchParams.set("symbols", symbol);

  const summaryUrl = new URL(`https://query2.finance.yahoo.com/v10/finance/quoteSummary/${encodeURIComponent(symbol)}`);
  summaryUrl.searchParams.set(
    "modules",
    "price,financialData,defaultKeyStatistics,summaryDetail",
  );

  const [quoteResult, summaryResult] = await Promise.allSettled([
    fetchYahooJson<Record<string, unknown>>(quoteUrl, Math.min(timeoutMs, 2500)),
    fetchYahooJson<Record<string, unknown>>(summaryUrl, timeoutMs),
  ]);

  const quotePayload = quoteResult.status === "fulfilled" ? quoteResult.value : undefined;
  const quoteResponse = getRecordValue(quotePayload, "quoteResponse") as Record<string, unknown> | undefined;
  const quoteItems = getRecordValue(quoteResponse, "result") as Array<Record<string, unknown>> | undefined;
  const quote = quoteItems?.[0];

  const summaryPayload = summaryResult.status === "fulfilled" ? summaryResult.value : undefined;
  const quoteSummary = getRecordValue(summaryPayload, "quoteSummary") as Record<string, unknown> | undefined;
  const summaryItems = getRecordValue(quoteSummary, "result") as Array<Record<string, unknown>> | undefined;
  const modules = summaryItems?.[0];
  const price = getRecordValue(modules, "price") as Record<string, unknown> | undefined;
  const financialData = getRecordValue(modules, "financialData") as Record<string, unknown> | undefined;
  const defaultKeyStatistics = getRecordValue(modules, "defaultKeyStatistics") as Record<string, unknown> | undefined;
  const summaryDetail = getRecordValue(modules, "summaryDetail") as Record<string, unknown> | undefined;

  const marketCap = optionalNumber(quote?.marketCap) ?? getYahooNumber(price, "marketCap");
  const regularMarketPrice =
    optionalNumber(quote?.regularMarketPrice) ?? getYahooNumber(price, "regularMarketPrice");
  const eps =
    optionalNumber(quote?.epsTrailingTwelveMonths) ??
    getYahooNumber(defaultKeyStatistics, "trailingEps");
  const peRatio =
    optionalNumber(quote?.trailingPE) ??
    getYahooNumber(summaryDetail, "trailingPE") ??
    (regularMarketPrice !== undefined && eps !== undefined && eps !== 0 ? regularMarketPrice / eps : undefined);

  return {
    marketCap,
    peRatio,
    revenueGrowthPercent: normalizeYahooPercent(getYahooNumber(financialData, "revenueGrowth")),
    profitMarginPercent: normalizeYahooPercent(getYahooNumber(financialData, "profitMargins")),
    debtToEquity: normalizeYahooDebtToEquity(getYahooNumber(financialData, "debtToEquity")),
    returnOnEquityPercent: normalizeYahooPercent(getYahooNumber(financialData, "returnOnEquity")),
    freeCashFlow: getYahooNumber(financialData, "freeCashflow"),
  };
}
function hasCoreMetricGaps(metrics: FinancialMetrics) {
  return metrics.marketCap <= 0 || metrics.revenueGrowthPercent === 0 || metrics.profitMarginPercent === 0 || metrics.peRatio === 0;
}

type SecFactUnit = {
  val?: number;
  fy?: number;
  fp?: string;
  form?: string;
  filed?: string;
  start?: string;
  end?: string;
};

type SecCompanyFacts = {
  cik?: number;
  entityName?: string;
  facts?: Record<string, Record<string, { units?: Record<string, SecFactUnit[]> }>>;
};

type SecTickerEntry = {
  cik_str?: number;
  ticker?: string;
  title?: string;
};

type SecMetricFallback = YahooMetricFallback & {
  latestRevenue?: number;
  previousRevenue?: number;
  netIncome?: number;
  freeCashFlowPositive?: boolean;
  source?: SourceReference;
};

type ScreenerSearchResult = {
  name?: string;
  url?: string;
};

type ScreenerMetricFallback = YahooMetricFallback & {
  source?: SourceReference;
};

function stripHtml(value: string) {
  return value
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function parseCompactIndianNumber(value: string) {
  const normalized = value.replace(/,/g, "").trim();
  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : undefined;
}

function getScreenerTopRatio(html: string, label: string) {
  const regex = new RegExp(`<span class="name">[\\s\\S]*?${label}[\\s\\S]*?<span class="number">([^<]+)<\\/span>`, "i");
  const match = html.match(regex);
  return match?.[1] ? parseCompactIndianNumber(match[1]) : undefined;
}

function getScreenerRangeValue(html: string, tableTitle: string, rowLabel: string) {
  const tableRegex = new RegExp(`<th colspan="2">${tableTitle}<\\/th>[\\s\\S]*?<\\/table>`, "i");
  const table = html.match(tableRegex)?.[0];
  if (!table) return undefined;

  const rowRegex = new RegExp(`<td>${rowLabel}:<\\/td>\\s*<td>([-0-9.,]+)%?<\\/td>`, "i");
  const match = table.match(rowRegex);
  return match?.[1] ? parseCompactIndianNumber(match[1]) : undefined;
}

function getScreenerTableRowNumbers(html: string, rowLabel: string) {
  const regex = new RegExp(`<tr[^>]*>[\\s\\S]{0,700}?${rowLabel}[\\s\\S]{0,5000}?<\\/tr>`, "i");
  const row = html.match(regex)?.[0];
  if (!row) return [];

  return Array.from(row.matchAll(/<td[^>]*>[\s\S]*?([-]?[0-9][0-9,]*(?:\.\d+)?)\s*%?[\s\S]*?<\/td>/g))
    .map((match) => parseCompactIndianNumber(match[1]))
    .filter((value): value is number => value !== undefined);
}

function calculateLatestGrowth(values: number[]) {
  if (values.length < 2) return undefined;
  const previous = values[values.length - 2];
  const latest = values[values.length - 1];
  if (!previous || previous === 0) return undefined;
  return ((latest - previous) / Math.abs(previous)) * 100;
}

async function fetchScreenerMetricFallback(symbol: string, companyName: string, timeoutMs = 4500): Promise<ScreenerMetricFallback> {
  if (!symbol.endsWith(".NS")) {
    return {};
  }

  const searchUrl = new URL("https://www.screener.in/api/company/search/");
  searchUrl.searchParams.set("q", companyName || symbol.replace(/\.NS$/, ""));
  const searchResults = await fetchYahooJson<ScreenerSearchResult[]>(searchUrl, Math.min(timeoutMs, 2500));
  const bestResult = searchResults.find((result) => result.url?.includes("/company/")) ?? searchResults[0];

  if (!bestResult?.url) {
    return {};
  }

  const companyUrl = new URL(bestResult.url, "https://www.screener.in");
  const response = await fetchWithTimeout(
    companyUrl,
    {
      headers: {
        Accept: "text/html",
        "User-Agent": "Mozilla/5.0 InvestmentResearchAgent/1.0",
      },
      next: {
        revalidate: 3600,
      },
    },
    timeoutMs,
    `Screener ${symbol}`,
  );

  if (!response.ok) {
    throw new Error(`Screener request failed for ${symbol}: ${response.status}`);
  }

  const html = await response.text();
  const marketCapCrore = getScreenerTopRatio(html, "Market Cap");
  const peRatio = getScreenerTopRatio(html, "Stock P/E");
  const roe = getScreenerTopRatio(html, "ROE");
  const salesValues = getScreenerTableRowNumbers(html, "Sales");
  const netProfitValues = getScreenerTableRowNumbers(html, "Net Profit");
  const opmValues = getScreenerTableRowNumbers(html, "OPM %");
  const revenueGrowthPercent =
    calculateLatestGrowth(salesValues) ?? getScreenerRangeValue(html, "Compounded Sales Growth", "TTM");
  const latestSales = salesValues[salesValues.length - 1];
  const latestProfit = netProfitValues[netProfitValues.length - 1];
  const profitMarginPercent =
    latestSales && latestProfit !== undefined
      ? (latestProfit / Math.abs(latestSales)) * 100
      : opmValues[opmValues.length - 1];

  const metrics: ScreenerMetricFallback = {
    marketCap: marketCapCrore ? marketCapCrore * 10000000 : undefined,
    peRatio,
    revenueGrowthPercent,
    profitMarginPercent,
    returnOnEquityPercent: roe,
    freeCashFlow: latestProfit !== undefined ? latestProfit : undefined,
    source: {
      label: `Screener India Fundamentals - ${symbol}`,
      url: companyUrl.toString(),
      note: `Parsed public-market fundamentals from Screener for ${stripHtml(bestResult.name ?? companyName)} when API financial statements are unavailable on the free plan.`,
      sourceType: "Trusted Third Party",
      credibility: "High",
      useFor: "Cross-check Indian listed-company market cap, valuation, revenue growth, profit quality, and ROE.",
    },
  };

  return metrics;
}
function isUsPublicTicker(symbol: string, profile: CompanyProfile) {
  const normalized = symbol.toUpperCase();
  const exchange = profile.exchange.toLowerCase();

  return (
    !normalized.includes(".") &&
    !normalized.endsWith(".NS") &&
    !normalized.endsWith(".BO") &&
    profile.marketStatus === "Public Company" &&
    (exchange.includes("nasdaq") || exchange.includes("nyse") || exchange.includes("amex") || exchange === "unknown")
  );
}

function normalizeCik(value: unknown) {
  const raw = String(value ?? "").replace(/\D/g, "");
  return raw ? raw.padStart(10, "0") : undefined;
}

async function fetchSecJson<T>(url: URL, timeoutMs = 4500) {
  const response = await fetchWithTimeout(
    url,
    {
      headers: {
        Accept: "application/json",
        "User-Agent": "Investable AI Research Agent contact@example.com",
      },
      cache: "no-store",
    },
    timeoutMs,
    `SEC ${url.pathname}`,
  );

  if (!response.ok) {
    throw new Error(`SEC request failed: ${response.status}`);
  }

  return (await response.json()) as T;
}

async function resolveSecCik(symbol: string, rawProfile: FmpProfile, timeoutMs = 3500) {
  const profileCik = normalizeCik(rawProfile.cik);
  if (profileCik) {
    return profileCik;
  }

  const url = new URL("https://www.sec.gov/files/company_tickers.json");
  const tickers = await fetchSecJson<Record<string, SecTickerEntry>>(url, timeoutMs);
  const normalizedSymbol = symbol.toUpperCase();
  const match = Object.values(tickers).find((entry) => entry.ticker?.toUpperCase() === normalizedSymbol);

  return normalizeCik(match?.cik_str);
}

function getUsGaapFacts(facts: SecCompanyFacts) {
  return facts.facts?.["us-gaap"] ?? {};
}

function findSecConceptNames(facts: SecCompanyFacts, include: RegExp, exclude: RegExp) {
  return Object.keys(getUsGaapFacts(facts)).filter((conceptName) => include.test(conceptName) && !exclude.test(conceptName));
}

function getSecUnits(facts: SecCompanyFacts, conceptNames: string[], preferredUnit = "USD") {
  const usGaap = facts.facts?.["us-gaap"] ?? {};

  for (const conceptName of conceptNames) {
    const units = usGaap[conceptName]?.units;
    const preferred = units?.[preferredUnit] ?? units?.USD;
    if (preferred?.length) {
      return preferred;
    }

    const firstUnits = units ? Object.values(units).find((items) => items.length > 0) : undefined;
    if (firstUnits?.length) {
      return firstUnits;
    }
  }

  return [];
}

function getSecDurationDays(item: SecFactUnit) {
  const start = item.start ? new Date(item.start).getTime() : 0;
  const end = item.end ? new Date(item.end).getTime() : 0;

  if (!Number.isFinite(start) || !Number.isFinite(end) || end <= start) {
    return 0;
  }

  return (end - start) / (24 * 60 * 60 * 1000);
}

function getAnnualSecFacts(facts: SecCompanyFacts, conceptNames: string[], preferredUnit = "USD", requireDuration = false) {
  const units = getSecUnits(facts, conceptNames, preferredUnit);
  const byFiscalYear = new Map<number, SecFactUnit>();

  units
    .filter((item) => {
      const form = item.form ?? "";
      const value = optionalNumber(item.val);
      const annualForm = ["10-K", "10-K/A", "20-F", "20-F/A", "40-F", "40-F/A"].includes(form);
      const annualPeriod = item.fp === "FY" || getSecDurationDays(item) >= 250;

      return value !== undefined && annualForm && annualPeriod && (!requireDuration || getSecDurationDays(item) >= 250);
    })
    .forEach((item) => {
      const fiscalYear = item.fy ?? (item.end ? new Date(item.end).getUTCFullYear() : undefined);
      if (!fiscalYear) {
        return;
      }

      const current = byFiscalYear.get(fiscalYear);
      if (!current || String(item.filed ?? "") > String(current.filed ?? "")) {
        byFiscalYear.set(fiscalYear, item);
      }
    });

  return [...byFiscalYear.entries()]
    .map(([fy, item]) => ({ fy, value: optionalNumber(item.val) ?? 0, filed: item.filed ?? "", end: item.end ?? "" }))
    .filter((item) => item.value !== 0)
    .sort((a, b) => a.fy - b.fy || a.end.localeCompare(b.end));
}

function aggregateAnnualSecFacts(facts: SecCompanyFacts, conceptNames: string[], preferredUnit = "USD") {
  const byFiscalYear = new Map<number, number>();

  conceptNames.forEach((conceptName) => {
    getAnnualSecFacts(facts, [conceptName], preferredUnit, true).forEach((item) => {
      byFiscalYear.set(item.fy, (byFiscalYear.get(item.fy) ?? 0) + item.value);
    });
  });

  return [...byFiscalYear.entries()]
    .map(([fy, value]) => ({ fy, value }))
    .filter((item) => item.value !== 0)
    .sort((a, b) => a.fy - b.fy);
}

function getSecRevenueFacts(facts: SecCompanyFacts) {
  const exactRevenueFacts = getAnnualSecFacts(
    facts,
    [
      "RevenueFromContractWithCustomerExcludingAssessedTax",
      "RevenueFromContractWithCustomerIncludingAssessedTax",
      "Revenues",
      "SalesRevenueNet",
      "SalesRevenueGoodsNet",
      "SalesRevenueServicesNet",
    ],
    "USD",
    true,
  );

  if (exactRevenueFacts.length >= 2) {
    return exactRevenueFacts;
  }

  const segmentRevenueConcepts = findSecConceptNames(
    facts,
    /(Revenue|Sales)/i,
    /(Cost|Deferred|Unearned|Liabilit|Receivable|Allowance|Tax|Contract|Remaining|Recognized|Member|User|Customer|PerShare|Abstract|Table|Policy)/i,
  );

  return aggregateAnnualSecFacts(facts, segmentRevenueConcepts, "USD");
}

function latestSecValue(facts: SecCompanyFacts, conceptNames: string[], preferredUnit = "USD", requireDuration = false) {
  const annualFacts = getAnnualSecFacts(facts, conceptNames, preferredUnit, requireDuration);
  return annualFacts[annualFacts.length - 1]?.value;
}

function sumLatestSecValues(facts: SecCompanyFacts, conceptNames: string[]) {
  const values = conceptNames
    .map((conceptName) => latestSecValue(facts, [conceptName]))
    .filter((value): value is number => value !== undefined);

  return values.length > 0 ? values.reduce((sum, value) => sum + Math.abs(value), 0) : undefined;
}

async function fetchSecMetricFallback(symbol: string, profile: CompanyProfile, rawProfile: FmpProfile, timeoutMs = 5000): Promise<SecMetricFallback> {
  if (!isUsPublicTicker(symbol, profile)) {
    return {};
  }

  const cik = await resolveSecCik(symbol, rawProfile, Math.min(timeoutMs, 3500));
  if (!cik) {
    return {};
  }

  const url = new URL(`https://data.sec.gov/api/xbrl/companyfacts/CIK${cik}.json`);
  const facts = await fetchSecJson<SecCompanyFacts>(url, timeoutMs);
  const revenueFacts = getSecRevenueFacts(facts);
  const latestRevenue = revenueFacts[revenueFacts.length - 1]?.value;
  const previousRevenue = revenueFacts[revenueFacts.length - 2]?.value;
  const netIncome = latestSecValue(facts, ["NetIncomeLoss", "ProfitLoss"], "USD", true);
  const equity = latestSecValue(
    facts,
    ["StockholdersEquity", "StockholdersEquityIncludingPortionAttributableToNoncontrollingInterest", "PartnersCapital"],
  );
  const totalDebt = sumLatestSecValues(facts, [
    "ShortTermBorrowings",
    "ShortTermDebtCurrent",
    "LongTermDebtCurrent",
    "LongTermDebtNoncurrent",
    "LongTermDebtAndFinanceLeaseObligationsCurrent",
    "LongTermDebtAndFinanceLeaseObligationsNoncurrent",
  ]);
  const operatingCashFlow = latestSecValue(facts, ["NetCashProvidedByUsedInOperatingActivities"], "USD", true);
  const capex = latestSecValue(facts, ["PaymentsToAcquirePropertyPlantAndEquipment"], "USD", true);
  const freeCashFlow = operatingCashFlow !== undefined && capex !== undefined ? operatingCashFlow - Math.abs(capex) : undefined;
  const revenueGrowthPercent =
    latestRevenue !== undefined && previousRevenue !== undefined && previousRevenue !== 0
      ? ((latestRevenue - previousRevenue) / Math.abs(previousRevenue)) * 100
      : undefined;
  const profitMarginPercent =
    latestRevenue !== undefined && latestRevenue !== 0 && netIncome !== undefined
      ? (netIncome / Math.abs(latestRevenue)) * 100
      : undefined;
  const debtToEquity = equity && totalDebt !== undefined ? totalDebt / Math.abs(equity) : undefined;
  const returnOnEquityPercent = equity && netIncome !== undefined ? (netIncome / Math.abs(equity)) * 100 : undefined;

  return {
    revenueGrowthPercent,
    profitMarginPercent,
    debtToEquity,
    returnOnEquityPercent,
    latestRevenue,
    previousRevenue,
    netIncome,
    freeCashFlow,
    freeCashFlowPositive: freeCashFlow !== undefined ? freeCashFlow > 0 : undefined,
    source: {
      label: `SEC Company Facts - ${symbol}`,
      url: `https://data.sec.gov/api/xbrl/companyfacts/CIK${cik}.json`,
      note: "Official SEC XBRL facts parsed when paid structured financial endpoints are unavailable or incomplete.",
      sourceType: "Official",
      credibility: "Primary",
      useFor: "Re-verify US-listed revenue growth, profit margin, leverage, return on equity, and cash-flow quality from regulatory filings.",
    },
  };
}

function applySecMetricFallback(profile: CompanyProfile, metrics: FinancialMetrics, fallback: SecMetricFallback, sources: SourceReference[]) {
  const warnings = metrics.dataWarnings ?? [];
  let usedSecFallback = false;

  function fillMetric<T extends keyof FinancialMetrics>(key: T, value: FinancialMetrics[T] | undefined) {
    if (value === undefined) {
      return;
    }

    const currentValue = metrics[key];
    const shouldFill =
      currentValue === undefined ||
      (typeof currentValue === "number" && currentValue === 0) ||
      (key === "freeCashFlowPositive" && fallback.freeCashFlowPositive !== undefined);

    if (shouldFill && currentValue !== value) {
      metrics[key] = value;
      usedSecFallback = true;
    }
  }

  fillMetric("revenueGrowthPercent", fallback.revenueGrowthPercent);
  fillMetric("profitMarginPercent", fallback.profitMarginPercent);
  fillMetric("debtToEquity", fallback.debtToEquity);
  fillMetric("returnOnEquityPercent", fallback.returnOnEquityPercent);
  fillMetric("latestRevenue", fallback.latestRevenue);
  fillMetric("previousRevenue", fallback.previousRevenue);
  fillMetric("netIncome", fallback.netIncome);
  fillMetric("freeCashFlowPositive", fallback.freeCashFlowPositive);

  if (metrics.peRatio === 0 && metrics.marketCap > 0 && fallback.netIncome !== undefined && fallback.netIncome > 0) {
    metrics.peRatio = metrics.marketCap / fallback.netIncome;
    usedSecFallback = true;
  }

  if (!usedSecFallback) {
    return;
  }

  warnings.push(`${profile.ticker} used SEC Company Facts because one or more free market-data fields were missing.`);
  metrics.dataWarnings = [...new Set(warnings)];

  if (fallback.source && !sources.some((source) => source.label === fallback.source?.label)) {
    sources.unshift(fallback.source);
  }
}

async function fetchYahooFiveYearReturn(symbol: string): Promise<ReturnMeasurement> {
  const url = new URL(`${YAHOO_CHART_BASE_URL}/${encodeURIComponent(symbol)}`);
  url.searchParams.set("range", "5y");
  url.searchParams.set("interval", "1mo");

  const response = await fetchWithTimeout(
    url,
    {
      headers: {
        Accept: "application/json",
        "User-Agent": "Mozilla/5.0 InvestmentResearchAgent/1.0",
      },
      next: {
        revalidate: 3600,
      },
    },
    3500,
    `Yahoo chart ${symbol}`,
  );

  if (!response.ok) {
    throw new Error(`Yahoo chart request failed for ${symbol}: ${response.status}`);
  }

  const payload = (await response.json()) as YahooChartResponse;
  const result = payload.chart?.result?.[0];
  const adjustedPrices = result?.indicators?.adjclose?.[0]?.adjclose ?? [];
  const closePrices = result?.indicators?.quote?.[0]?.close ?? [];
  const timestamps = result?.timestamp ?? [];
  const rawPrices = adjustedPrices.length > 0 ? adjustedPrices : closePrices;
  const observations = rawPrices
    .map((price, index) => ({ price, timestamp: timestamps[index] }))
    .filter(
      (item): item is { price: number; timestamp: number } =>
        typeof item.price === "number" &&
        Number.isFinite(item.price) &&
        item.price > 0 &&
        typeof item.timestamp === "number" &&
        Number.isFinite(item.timestamp),
    );
  const first = observations[0];
  const last = observations[observations.length - 1];

  if (!first || !last) {
    return emptyReturnMeasurement();
  }

  const percent = ((last.price - first.price) / first.price) * 100;
  const years = (last.timestamp - first.timestamp) / (365.25 * 24 * 60 * 60);

  return buildReturnMeasurement(percent, years);
}

async function fetchFmp<T>(path: string, params: Record<string, string | number | undefined>, timeoutMs = 4500) {
  const apiKey = getFmpApiKey();

  if (!apiKey) {
    throw new Error("FMP_API_KEY is not configured.");
  }

  const url = new URL(`${FMP_BASE_URL}/${path}`);

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== "") {
      url.searchParams.set(key, String(value));
    }
  });

  url.searchParams.set("apikey", apiKey);

  const response = await fetchWithTimeout(
    url,
    {
      headers: {
        Accept: "application/json",
      },
      next: {
        revalidate: 3600,
      },
    },
    timeoutMs,
    `FMP ${path}`,
  );

  if (!response.ok) {
    throw new Error(`FMP request failed for ${path}: ${response.status}`);
  }

  return (await response.json()) as T;
}

function normalizeSearchText(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]/g, "");
}

function getKnownTickerAlias(companyName: string) {
  return KNOWN_TICKER_ALIASES[normalizeSearchText(companyName)];
}

function getAliasExchange(symbol: string) {
  const normalized = symbol.toUpperCase();

  if (normalized.endsWith(".NS")) return "NSE";
  if (normalized.endsWith(".BO")) return "BSE";
  if (normalized.endsWith(".L")) return "LSE";
  if (["GOOGL", "META", "MSFT", "AMZN", "NVDA", "AAPL", "TSLA", "QQQ", "HOOD", "COIN", "RIVN", "SOFI", "MMYT", "NFLX", "PLTR"].includes(normalized)) return "NASDAQ";
  if (["AI", "WMT", "UBER", "MSI", "KO"].includes(normalized)) return "NYSE";
  if (["SPY", "VOO", "VTI"].includes(normalized)) return "NYSE Arca";

  return "Unknown";
}

function getMarketPreference(companyName: string): "india" | "us" | null {
  const normalized = normalizeSearchText(companyName);
  const lower = companyName.toLowerCase();
  const indianHints = [
    "india",
    "indian",
    "nse",
    "bse",
    "reliance",
    "tata",
    "hdfc",
    "infosys",
    "icici",
    "adani",
    "bajaj",
    "mahindra",
    "maruti",
    "axis",
    "airtel",
    "bharti",
    "vodafone",
    "idea",
    "jio",
    "vi",
    "sbi",
    "itc",
    "wipro",
    "hcl",
    "lic",
    "zomato",
    "paytm",
    "swiggy",
    "zomato",
    "blinkit",
    "nykaa",
    "policybazaar",
    "irctc",
    "indiamart",
    "naukri",
    "justdial",
    "delhivery",
    "ola",
    "ixigo",
    "firstcry",
    "mamaearth",
    "mapmyindia",
    "easemytrip",
  ];

  if (indianHints.some((hint) => normalized.includes(normalizeSearchText(hint)) || lower.includes(hint))) {
    return "india";
  }

  if (lower.includes("nyse") || lower.includes("nasdaq") || lower.includes("usa") || lower.includes("us stock") || normalized.includes("motorola")) {
    return "us";
  }

  return null;
}

function getExchangeText(result: FmpSearchResult) {
  return `${result.exchangeShortName ?? ""} ${result.exchange ?? ""} ${result.stockExchange ?? ""}`.toLowerCase();
}

function isIndianListing(result: FmpSearchResult) {
  const symbol = (result.symbol ?? "").toUpperCase();
  const exchange = getExchangeText(result);

  return symbol.endsWith(".NS") || symbol.endsWith(".BO") || exchange.includes("nse") || exchange.includes("bse") || exchange.includes("national stock exchange") || exchange.includes("bombay");
}

function isUsListing(result: FmpSearchResult) {
  const exchange = getExchangeText(result);
  const currency = (result.currency ?? "").toUpperCase();
  const symbol = result.symbol ?? "";

  return (exchange.includes("nasdaq") || exchange.includes("nyse") || exchange.includes("amex")) && currency !== "INR" && !symbol.includes(".NS") && !symbol.includes(".BO");
}

function isLikelySecondaryListing(result: FmpSearchResult) {
  if (isIndianListing(result) || isUsListing(result)) {
    return false;
  }

  const symbol = (result.symbol ?? "").toUpperCase();
  const exchange = getExchangeText(result);
  const secondarySuffixes = [".F", ".DE", ".DU", ".HM", ".BE", ".MU", ".SG", ".STU", ".L", ".SW", ".PA", ".MI", ".AS", ".VI"];

  return (
    secondarySuffixes.some((suffix) => symbol.endsWith(suffix)) ||
    exchange.includes("frankfurt") ||
    exchange.includes("xetra") ||
    exchange.includes("london") ||
    exchange.includes("swiss") ||
    exchange.includes("euronext") ||
    exchange.includes("milano") ||
    exchange.includes("gettex")
  );
}

function isEtfSearch(companyName: string) {
  const normalized = normalizeSearchText(companyName);
  return normalized.includes("etf") || normalized.includes("fund") || normalized.includes("index") || ["spy", "qqq", "voo", "vti", "niftybees", "sp500"].includes(normalized);
}

function isEtfResult(result: FmpSearchResult) {
  const type = (result.type ?? "").toLowerCase();
  const name = (result.name ?? "").toLowerCase();

  return type.includes("etf") || type.includes("fund") || name.includes(" etf") || name.includes(" fund") || name.includes("trust");
}

function scoreSearchResult(result: FmpSearchResult, companyName: string) {
  const symbol = result.symbol ?? "";
  const currency = (result.currency ?? "").toUpperCase();
  const type = (result.type ?? "").toLowerCase();
  const normalizedName = normalizeSearchText(result.name ?? "");
  const normalizedQuery = normalizeSearchText(companyName);
  const marketPreference = getMarketPreference(companyName);
  const etfSearch = isEtfSearch(companyName);

  let score = 0;

  if (symbol) score += 20;
  if (result.name) score += 15;
  if (normalizedName === normalizedQuery) score += 45;
  if (normalizedName.includes(normalizedQuery) || normalizedQuery.includes(normalizedName)) score += 24;
  if (type === "stock" || type === "equity") score += etfSearch ? 0 : 10;
  if (isEtfResult(result)) score += etfSearch ? 40 : -18;

  if (marketPreference === "india") {
    if (isIndianListing(result)) score += 70;
    if (currency === "INR") score += 22;
    if (isUsListing(result)) score -= 28;
  } else if (marketPreference === "us") {
    if (isUsListing(result)) score += 42;
    if (currency === "USD") score += 14;
    if (isIndianListing(result)) score -= 20;
  } else {
    if (isUsListing(result)) score += 26;
    if (isIndianListing(result)) score += 20;
    if (currency === "USD") score += 8;
  }

  if (isLikelySecondaryListing(result)) {
    score -= marketPreference === "india" ? 18 : 38;
  }

  if (symbol.includes(".")) score += marketPreference === "india" && isIndianListing(result) ? 14 : -10;
  if (symbol.length > 0 && symbol.replace(/\..+$/, "").length <= 10) score += 6;

  return score;
}

function chooseBestSearchResult(results: FmpSearchResult[], companyName: string) {
  const knownTicker = getKnownTickerAlias(companyName);

  if (knownTicker) {
    const aliasMatch = results.find((item) => item.symbol?.toUpperCase() === knownTicker.symbol.toUpperCase());

    if (aliasMatch) {
      return {
        ...aliasMatch,
        name: knownTicker.name ?? aliasMatch.name,
        type: knownTicker.securityType ?? aliasMatch.type,
      };
    }

    return {
      symbol: knownTicker.symbol,
      name: knownTicker.name ?? companyName,
      exchangeShortName: getAliasExchange(knownTicker.symbol),
      type: knownTicker.securityType ?? "stock",
      currency: knownTicker.symbol.endsWith(".NS") ? "INR" : "USD",
    } satisfies FmpSearchResult;
  }

  const rankedResults = [...results]
    .filter((item) => item.symbol && item.name)
    .map((item) => ({ item, score: scoreSearchResult(item, companyName) }))
    .sort((a, b) => b.score - a.score);

  const best = rankedResults[0];

  if (!best || best.score < 50) {
    return undefined;
  }

  return best.item;
}

function normalizeProfile(searchResult: FmpSearchResult, profile: FmpProfile, companyName: string): CompanyProfile {
  const alias = getKnownTickerAlias(companyName);
  const ticker = profile.symbol ?? searchResult.symbol ?? alias?.symbol ?? "UNKNOWN";
  const aliasName = alias?.name ?? alias?.parentCompany;
  const name = profile.companyName ?? profile.companyNameLong ?? aliasName ?? searchResult.name ?? ticker;
  const exchange = profile.exchangeShortName ?? profile.exchange ?? searchResult.exchangeShortName ?? searchResult.exchange ?? "Unknown";
  const securityType = alias?.securityType ?? searchResult.type ?? "Stock";
  const inferredMarketStatus: CompanyProfile["marketStatus"] =
    alias?.marketStatus ?? (isEtfResult(searchResult) ? "ETF/Fund" : ticker === "UNKNOWN" ? "Unverified" : "Public Company");

  return {
    name,
    ticker,
    exchange,
    sector: inferredMarketStatus === "ETF/Fund" ? "ETF / Fund" : profile.sector ?? "Unknown",
    industry: inferredMarketStatus === "ETF/Fund" ? "Exchange-traded fund or listed fund" : profile.industry ?? "Unknown",
    country: profile.country ?? "Unknown",
    currency: profile.currency ?? searchResult.currency ?? (ticker.endsWith(".NS") || ticker.endsWith(".BO") ? "INR" : "USD"),
    description:
      profile.description ??
      alias?.resolutionNote ??
      `${name} was resolved from live market data, but no company description was provided by the data source.`,
    marketStatus: inferredMarketStatus,
    securityType,
    parentCompany: alias?.parentCompany,
    resolvedFrom: alias?.marketStatus === "Subsidiary/Brand" ? companyName : undefined,
    resolutionNote: alias?.resolutionNote,
  };
}

function normalizeMetrics(input: {
  profile: FmpProfile;
  ratios: FmpRatio;
  keyMetrics: FmpRatio;
  latestIncome: FmpStatement;
  previousIncome: FmpStatement;
  latestBalance: FmpStatement;
  latestCashFlow: FmpStatement;
  priceChange: FmpPriceChange;
  historicalPrices: FmpHistoricalPrice[];
}): FinancialMetrics {
  const marketCap = firstNumber(input.profile.mktCap, input.profile.marketCap, input.keyMetrics.marketCap);
  const revenueNow = firstNumber(input.latestIncome.revenue, input.latestIncome.totalRevenue);
  const revenuePrevious = firstNumber(input.previousIncome.revenue, input.previousIncome.totalRevenue);
  const netIncome = firstNumber(input.latestIncome.netIncome, input.latestIncome.netIncomeCommonStockholders);
  const shortTermDebt = firstNumber(input.latestBalance.shortTermDebt);
  const longTermDebt = firstNumber(input.latestBalance.longTermDebt);
  const totalDebt = firstNumber(input.latestBalance.totalDebt, shortTermDebt + longTermDebt);
  const equity = firstNumber(input.latestBalance.totalStockholdersEquity, input.latestBalance.totalEquity, input.latestBalance.totalShareholderEquity);
  const operatingCashFlow = firstNumber(input.latestCashFlow.operatingCashFlow, input.latestCashFlow.netCashProvidedByOperatingActivities);
  const capitalExpenditure = firstNumber(input.latestCashFlow.capitalExpenditure, input.latestCashFlow.capitalExpenditures);
  const freeCashFlow = firstNumber(input.latestCashFlow.freeCashFlow, operatingCashFlow + capitalExpenditure);

  const revenueGrowthPercent =
    revenueNow && revenuePrevious ? ((revenueNow - revenuePrevious) / Math.abs(revenuePrevious)) * 100 : percentFromRatio(input.ratios.revenueGrowth);
  const profitMarginPercent = revenueNow && netIncome ? (netIncome / revenueNow) * 100 : percentFromRatio(input.ratios.netProfitMargin);
  const debtToEquity = equity ? totalDebt / Math.abs(equity) : firstNumber(input.ratios.debtEquityRatio, input.keyMetrics.debtToEquity);
  const peRatio = firstNumber(
    input.ratios.priceEarningsRatio,
    input.ratios.peRatio,
    input.keyMetrics.peRatio,
    input.profile.price && input.profile.eps ? input.profile.price / input.profile.eps : 0,
    marketCap && netIncome > 0 ? marketCap / netIncome : 0,
  );
  const returnOnEquityPercent =
    equity && netIncome ? (netIncome / Math.abs(equity)) * 100 : percentFromRatio(firstNumber(input.ratios.returnOnEquity, input.keyMetrics.roe));
  const returnMeasurement = getFiveYearReturn(input.priceChange, input.historicalPrices);

  return {
    marketCap,
    revenueGrowthPercent,
    profitMarginPercent,
    debtToEquity,
    peRatio,
    freeCashFlowPositive: freeCashFlow > 0,
    returnOnEquityPercent,
    fiveYearReturnPercent: returnMeasurement.percent,
    returnPeriodLabel: returnMeasurement.label,
    returnPeriodYears: returnMeasurement.years,
    returnIsFullFiveYear: returnMeasurement.isFullFiveYear,
    latestRevenue: revenueNow,
    previousRevenue: revenuePrevious,
    netIncome,
  };
}

function applyGenericMetricFallbacks(
  profile: CompanyProfile,
  metrics: FinancialMetrics,
  fallback: YahooMetricFallback,
  sources: SourceReference[],
) {
  const warnings = metrics.dataWarnings ?? [];
  let usedYahooFallback = false;

  function useFallback(label: string) {
    usedYahooFallback = true;
    warnings.push(`${label} was filled from Yahoo Finance because the primary structured feed was missing or returned a placeholder.`);
  }

  if (metrics.marketCap <= 0 && fallback.marketCap !== undefined && fallback.marketCap > 0) {
    metrics.marketCap = fallback.marketCap;
    useFallback("Market cap");
  }

  if (metrics.peRatio === 0 && fallback.peRatio !== undefined && fallback.peRatio !== 0) {
    metrics.peRatio = fallback.peRatio;
    useFallback("P/E ratio");
  }

  if (metrics.revenueGrowthPercent === 0 && fallback.revenueGrowthPercent !== undefined && fallback.revenueGrowthPercent !== 0) {
    metrics.revenueGrowthPercent = fallback.revenueGrowthPercent;
    useFallback("Revenue growth");
  }

  if (metrics.profitMarginPercent === 0 && fallback.profitMarginPercent !== undefined && fallback.profitMarginPercent !== 0) {
    metrics.profitMarginPercent = fallback.profitMarginPercent;
    useFallback("Profit margin");
  }

  if (metrics.debtToEquity === 0 && fallback.debtToEquity !== undefined && fallback.debtToEquity !== 0) {
    metrics.debtToEquity = fallback.debtToEquity;
    useFallback("Debt-to-equity");
  }

  if (metrics.returnOnEquityPercent === 0 && fallback.returnOnEquityPercent !== undefined && fallback.returnOnEquityPercent !== 0) {
    metrics.returnOnEquityPercent = fallback.returnOnEquityPercent;
    useFallback("Return on equity");
  }

  if (fallback.freeCashFlow !== undefined) {
    metrics.freeCashFlowPositive = fallback.freeCashFlow > 0;
  }

  if (usedYahooFallback && !sources.some((source) => source.label === `Yahoo Finance Fundamentals - ${profile.ticker}`)) {
    sources.push({
      label: `Yahoo Finance Fundamentals - ${profile.ticker}`,
      url: `https://finance.yahoo.com/quote/${profile.ticker}`,
      note: "Fallback fundamentals source used when the primary provider has missing, delayed, or rate-limited fields.",
      sourceType: "Trusted Third Party",
      credibility: "High",
      useFor: "Cross-check market cap, valuation, growth, profitability, leverage, and cash-flow fields.",
    });
  }

  metrics.dataWarnings = warnings;
}

function validateMetricQuality(profile: CompanyProfile, metrics: FinancialMetrics) {
  const warnings = metrics.dataWarnings ?? [];
  const hasImportantGaps =
    metrics.marketCap <= 0 ||
    metrics.revenueGrowthPercent === 0 ||
    metrics.profitMarginPercent === 0 ||
    metrics.peRatio === 0;

  if (hasImportantGaps && profile.marketStatus === "Public Company") {
    warnings.push(
      "One or more core metrics are still missing after fallback checks, so the confidence score should be treated cautiously.",
    );
  }

  metrics.dataWarnings = [...new Set(warnings)];
}
function applyCuratedMetricFallback(profile: CompanyProfile, metrics: FinancialMetrics, sources: SourceReference[]) {
  const fallback = CURATED_METRIC_FALLBACKS[profile.ticker.toUpperCase()];

  if (!fallback) {
    return;
  }

  const warnings = metrics.dataWarnings ?? [];
  let usedCuratedFallback = false;

  function fillMetric<T extends keyof FinancialMetrics>(key: T, value: FinancialMetrics[T] | undefined) {
    if (value === undefined) {
      return;
    }

    const currentValue = metrics[key];
    const shouldFill =
      currentValue === undefined ||
      key !== "marketCap" ||
      (typeof currentValue === "number" && currentValue <= 0);

    if (shouldFill && currentValue !== value) {
      metrics[key] = value;
      usedCuratedFallback = true;
    }
  }

  fillMetric("marketCap", fallback.marketCap);
  fillMetric("revenueGrowthPercent", fallback.revenueGrowthPercent);
  fillMetric("profitMarginPercent", fallback.profitMarginPercent);
  fillMetric("peRatio", fallback.peRatio);
  fillMetric("debtToEquity", fallback.debtToEquity);
  fillMetric("returnOnEquityPercent", fallback.returnOnEquityPercent);
  fillMetric("latestRevenue", fallback.latestRevenue);
  fillMetric("previousRevenue", fallback.previousRevenue);
  fillMetric("netIncome", fallback.netIncome);
  fillMetric("fiveYearReturnPercent", fallback.fiveYearReturnPercent);
  fillMetric("returnPeriodLabel", fallback.returnPeriodLabel);
  fillMetric("returnPeriodYears", fallback.returnPeriodYears);
  fillMetric("returnIsFullFiveYear", fallback.returnIsFullFiveYear);
  fillMetric("freeCashFlowPositive", fallback.freeCashFlowPositive);

  if (!usedCuratedFallback) {
    return;
  }

  warnings.push(
    `${profile.ticker} used a curated fundamentals fallback because one or more primary structured data fields were missing or returned placeholders.`,
  );
  metrics.dataWarnings = [...new Set(warnings)];

  if (!sources.some((source) => source.label === fallback.source.label)) {
    sources.unshift(fallback.source);
  }
}
function inferNewsSentiment(news: FmpNews): NewsItem["sentiment"] {
  const text = `${news.title ?? ""} ${news.text ?? ""} ${news.site ?? ""}`.toLowerCase();
  const negativeWords = ["miss", "falls", "risk", "lawsuit", "probe", "decline", "cuts", "warning", "pressure", "loss"];
  const positiveWords = ["beats", "growth", "record", "raises", "profit", "strong", "upgrade", "expands", "surge", "gain"];

  if (negativeWords.some((word) => text.includes(word))) {
    return "negative";
  }

  if (positiveWords.some((word) => text.includes(word))) {
    return "positive";
  }

  return "neutral";
}

function normalizeNews(news: FmpNews[]) {
  return news.slice(0, 5).map((item): NewsItem => {
    const title = String(item.title ?? "Market update available");
    const site = String(item.site ?? item.publisher ?? "FMP News");
    const url = String(item.url ?? "https://site.financialmodelingprep.com/");

    return {
      title,
      source: site,
      publishedAt: String(item.publishedDate ?? item.date ?? new Date().toISOString()),
      url,
      sentiment: inferNewsSentiment(item),
    };
  });
}

function getExchangeCode(exchange: string) {
  const normalized = exchange.toLowerCase();

  if (normalized.includes("nasdaq") || normalized.includes("xnas")) {
    return "xnas";
  }

  if (normalized.includes("nyse") || normalized.includes("xnys")) {
    return "xnys";
  }

  if (normalized.includes("lse") || normalized.includes("london") || normalized.includes("xlon")) {
    return "xlon";
  }

  return normalized.replace(/[^a-z]/g, "") || "xnas";
}

function buildLiveSources(profile: CompanyProfile, rawProfile: FmpProfile): SourceReference[] {
  const tickerLower = profile.ticker.toLowerCase();
  const exchangeCode = getExchangeCode(profile.exchange);
  const cik = rawProfile.cik?.replace(/^0+/, "");

  const sources: SourceReference[] = [
    {
      label: "Financial Modeling Prep Live Data",
      url: "https://site.financialmodelingprep.com/developer/docs",
      note: "Live provider used for company search, profile, financial statements, ratios, and stock news.",
      sourceType: "Trusted Third Party",
      credibility: "High",
      useFor: "Resolve ticker identity and collect normalized market and financial data.",
    },
    {
      label: `Yahoo Finance - ${profile.ticker}`,
      url: `https://finance.yahoo.com/quote/${profile.ticker}`,
      note: "Widely used market-data portal for quotes, news, financials, analyst summaries, and fallback long-term price charts.",
      sourceType: "Trusted Third Party",
      credibility: "High",
      useFor: "Cross-check common investor-facing quote and news data.",
    },
    {
      label: `Nasdaq Market Activity - ${profile.ticker}`,
      url: `https://www.nasdaq.com/market-activity/stocks/${tickerLower}`,
      note: "Exchange-linked market data source for quote and security details where available.",
      sourceType: "Trusted Third Party",
      credibility: "High",
      useFor: "Validate ticker, exchange, and market activity context.",
    },
    {
      label: `Morningstar - ${profile.ticker}`,
      url: `https://www.morningstar.com/stocks/${exchangeCode}/${tickerLower}/quote`,
      note: "Independent investment research platform with financial snapshots and valuation context.",
      sourceType: "Trusted Third Party",
      credibility: "High",
      useFor: "Compare valuation and fundamentals against independent research context.",
    },
    {
      label: `Seeking Alpha Research - ${profile.ticker}`,
      url: `https://seekingalpha.com/symbol/${profile.ticker}`,
      note: "Investor research and blog-style opinions. Useful for idea discovery, but not treated as final proof.",
      sourceType: "Research Blog",
      credibility: "Medium",
      useFor: "Understand investor narratives and bull/bear arguments with lower decision weight.",
    },
  ];

  if (cik) {
    sources.unshift({
      label: `SEC EDGAR - ${profile.name}`,
      url: `https://www.sec.gov/edgar/browse/?CIK=${cik}`,
      note: "Regulatory filings source for audited reports, risk factors, and disclosures.",
      sourceType: "Official",
      credibility: "Primary",
      useFor: "Verify filings, risks, and legally reported company facts.",
    });
  }

  if (rawProfile.website) {
    sources.unshift({
      label: `${profile.name} Company Website`,
      url: rawProfile.website,
      note: "Company-owned source for official business information and investor materials when available.",
      sourceType: "Official",
      credibility: "Primary",
      useFor: "Confirm company identity and management-published information.",
    });
  }

  return sources;
}

export function hasLiveDataProvider() {
  return Boolean(getFmpApiKey());
}

async function getLiveCompanyDataUncached(companyName: string): Promise<CompanyDataset | null> {
  if (!hasLiveDataProvider()) {
    return null;
  }

  const knownAlias = getKnownTickerAlias(companyName);
  let searchResults: FmpSearchResult[] = [];

  if (!knownAlias) {
    const [fmpSearchResult, yahooSearchResult] = await Promise.allSettled([
      fetchFmp<FmpSearchResult[]>("search-name", {
        query: companyName,
        limit: 8,
      }, 2800),
      fetchYahooSearchCandidates(companyName),
    ]);

    searchResults = [
      ...valueOrFallback(fmpSearchResult, [], "FMP company search"),
      ...valueOrFallback(yahooSearchResult, [], "Yahoo company search"),
    ];
  }

  const bestMatch = knownAlias
    ? ({
        symbol: knownAlias.symbol,
        name: knownAlias.name ?? companyName,
        exchangeShortName: getAliasExchange(knownAlias.symbol),
        type: knownAlias.securityType ?? "stock",
        currency: knownAlias.symbol.endsWith(".NS") ? "INR" : "USD",
      } satisfies FmpSearchResult)
    : chooseBestSearchResult(searchResults, companyName);

  if (!bestMatch?.symbol) {
    return null;
  }

  const symbol = bestMatch.symbol;
  const fiveYearRange = getFiveYearDateRange();
  const fmpBlockedDataset = <T,>(fallback: T) => Promise.resolve(fallback);
  const [
    profilesResult,
    ratiosResult,
    keyMetricsResult,
    incomeStatementsResult,
    balanceStatementsResult,
    cashFlowsResult,
    priceChangeResult,
    historicalPricesResult,
    yahooFiveYearReturnResult,
    yahooMetricFallbackResult,
    screenerMetricFallbackResult,
    stockNewsResult,
  ] = await Promise.allSettled([
    fetchFmp<FmpProfile[]>("profile", { symbol }, 6000),
    FMP_FULL_FINANCIALS_ENABLED ? fetchFmp<FmpRatio[]>("ratios", { symbol, limit: 4 }, 6000) : fmpBlockedDataset<FmpRatio[]>([]),
    FMP_FULL_FINANCIALS_ENABLED ? fetchFmp<FmpRatio[]>("key-metrics", { symbol, limit: 4 }, 6000) : fmpBlockedDataset<FmpRatio[]>([]),
    FMP_FULL_FINANCIALS_ENABLED ? fetchFmp<FmpStatement[]>("income-statement", { symbol, limit: 4 }, 6000) : fmpBlockedDataset<FmpStatement[]>([]),
    FMP_FULL_FINANCIALS_ENABLED ? fetchFmp<FmpStatement[]>("balance-sheet-statement", { symbol, limit: 2 }, 6000) : fmpBlockedDataset<FmpStatement[]>([]),
    FMP_FULL_FINANCIALS_ENABLED ? fetchFmp<FmpStatement[]>("cash-flow-statement", { symbol, limit: 2 }, 6000) : fmpBlockedDataset<FmpStatement[]>([]),
    FMP_FULL_FINANCIALS_ENABLED ? fetchFmp<FmpPriceChange[]>("stock-price-change", { symbol }, 3000) : fmpBlockedDataset<FmpPriceChange[]>([]),
    FMP_FULL_FINANCIALS_ENABLED
      ? fetchFmp<FmpHistoricalPrice[]>("historical-price-eod/light", {
          symbol,
          from: fiveYearRange.from,
          to: fiveYearRange.to,
        }, 3200)
      : fmpBlockedDataset<FmpHistoricalPrice[]>([]),
    fetchYahooFiveYearReturn(symbol),
    fetchYahooMetricFallback(symbol, 3200),
    fetchScreenerMetricFallback(symbol, knownAlias?.name ?? bestMatch.name ?? companyName, 4200),
    FMP_FULL_FINANCIALS_ENABLED ? fetchFmp<FmpNews[]>("news/stock", { symbols: symbol, limit: 5 }, 1200) : fmpBlockedDataset<FmpNews[]>([]),
  ]);

  const profiles = valueOrFallback(profilesResult, [], "profile");
  const ratios = valueOrFallback(ratiosResult, [], "ratios");
  const keyMetrics = valueOrFallback(keyMetricsResult, [], "key metrics");
  const incomeStatements = valueOrFallback(incomeStatementsResult, [], "income statements");
  const balanceStatements = valueOrFallback(balanceStatementsResult, [], "balance sheet statements");
  const cashFlows = valueOrFallback(cashFlowsResult, [], "cash-flow statements");
  const priceChanges = valueOrFallback(priceChangeResult, [], "last 5 years price return");
  const historicalPrices = valueOrFallback(historicalPricesResult, [], "historical price chart");
  const yahooFiveYearReturn = valueOrFallback(
    yahooFiveYearReturnResult,
    emptyReturnMeasurement(),
    "Yahoo last 5 years return fallback",
  );
  const yahooMetricFallback = valueOrFallback(
    yahooMetricFallbackResult,
    {},
    "Yahoo fundamentals fallback",
  );
  const screenerMetricFallback = valueOrFallback(
    screenerMetricFallbackResult,
    {},
    "Screener India fundamentals fallback",
  );
  const stockNews = valueOrFallback(stockNewsResult, [], "stock news");

  const rawProfile = profiles[0] ?? { symbol, companyName: bestMatch.name };
  const profile = normalizeProfile(bestMatch, rawProfile, companyName);
  const metrics = normalizeMetrics({
    profile: rawProfile,
    ratios: ratios[0] ?? {},
    keyMetrics: keyMetrics[0] ?? {},
    latestIncome: incomeStatements[0] ?? {},
    previousIncome: incomeStatements[1] ?? {},
    latestBalance: balanceStatements[0] ?? {},
    latestCashFlow: cashFlows[0] ?? {},
    priceChange: priceChanges[0] ?? {},
    historicalPrices,
  });

  const shouldUseYahooReturn =
    yahooFiveYearReturn.percent !== 0 &&
    (metrics.fiveYearReturnPercent === 0 ||
      yahooFiveYearReturn.isFullFiveYear ||
      (metrics.returnIsFullFiveYear === false && yahooFiveYearReturn.years > (metrics.returnPeriodYears ?? 0)));

  if (shouldUseYahooReturn) {
    metrics.fiveYearReturnPercent = yahooFiveYearReturn.percent;
    metrics.returnPeriodLabel = yahooFiveYearReturn.label;
    metrics.returnPeriodYears = yahooFiveYearReturn.years;
    metrics.returnIsFullFiveYear = yahooFiveYearReturn.isFullFiveYear;
  }

  const sources = buildLiveSources(profile, rawProfile);
  applyGenericMetricFallbacks(profile, metrics, yahooMetricFallback, sources);
  applyGenericMetricFallbacks(profile, metrics, screenerMetricFallback, sources);
  if (screenerMetricFallback.source && !sources.some((source) => source.label === screenerMetricFallback.source?.label)) {
    sources.unshift(screenerMetricFallback.source);
  }
  applyCuratedMetricFallback(profile, metrics, sources);
  if (hasCoreMetricGaps(metrics)) {
    try {
      const secMetricFallback = await fetchSecMetricFallback(symbol, profile, rawProfile, 12000);
      applySecMetricFallback(profile, metrics, secMetricFallback, sources);
    } catch (error) {
      console.warn(`Optional dataset unavailable: SEC Company Facts. ${formatProviderWarning(error)}`);
    }
  }

  validateMetricQuality(profile, metrics);

  return {
    profile,
    metrics,
    news: normalizeNews(Array.isArray(stockNews) ? stockNews : []),
    sources,
  };
}
export async function getLiveCompanyData(companyName: string): Promise<CompanyDataset | null> {
  const cacheKey = normalizeSearchText(companyName);
  const cached = liveDataCache.get(cacheKey);

  if (cached && cached.expiresAt > Date.now()) {
    return cached.data;
  }

  const existingRequest = liveDataInflight.get(cacheKey);

  if (existingRequest) {
    return existingRequest;
  }

  const request = getLiveCompanyDataUncached(companyName)
    .then((data) => {
      if (data) {
        liveDataCache.set(cacheKey, {
          data,
          expiresAt: Date.now() + LIVE_DATA_CACHE_TTL_MS,
        });
      }

      return data;
    })
    .finally(() => {
      liveDataInflight.delete(cacheKey);
    });

  liveDataInflight.set(cacheKey, request);
  return request;
}














