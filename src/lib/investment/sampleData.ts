import type { CompanyDataset } from "./dataProviderTypes";
import type { SourceReference } from "./types";

function buildSourceSet(input: {
  company: string;
  ticker: string;
  exchangeCode: string;
  investorUrl: string;
  cik: string;
}): SourceReference[] {
  const tickerLower = input.ticker.toLowerCase();

  return [
    {
      label: `${input.company} Investor Relations`,
      url: input.investorUrl,
      note: "Company-owned source for earnings releases, presentations, and management commentary.",
      sourceType: "Official",
      credibility: "Primary",
      useFor: "Confirm company-reported numbers and management updates.",
    },
    {
      label: `SEC EDGAR - ${input.company}`,
      url: `https://www.sec.gov/edgar/browse/?CIK=${input.cik}`,
      note: "Regulatory filings source for audited reports, risk factors, and disclosures.",
      sourceType: "Official",
      credibility: "Primary",
      useFor: "Verify filings, risks, and legally reported company facts.",
    },
    {
      label: `Reuters Markets - ${input.ticker}`,
      url: `https://www.reuters.com/markets/companies/${input.ticker}.O/`,
      note: "Trusted global business news source used for third-party market context.",
      sourceType: "Trusted Third Party",
      credibility: "High",
      useFor: "Cross-check major news, market context, and current business events.",
    },
    {
      label: `Morningstar - ${input.ticker}`,
      url: `https://www.morningstar.com/stocks/${input.exchangeCode}/${tickerLower}/quote`,
      note: "Independent investment research platform with financial snapshots and valuation context.",
      sourceType: "Trusted Third Party",
      credibility: "High",
      useFor: "Compare valuation, fundamentals, and independent analyst-style research.",
    },
    {
      label: `Yahoo Finance - ${input.ticker}`,
      url: `https://finance.yahoo.com/quote/${input.ticker}`,
      note: "Widely used market-data portal for quotes, news, financials, and analyst summaries.",
      sourceType: "Trusted Third Party",
      credibility: "High",
      useFor: "Validate market data, headlines, and common investor-facing metrics.",
    },
    {
      label: `Nasdaq Market Activity - ${input.ticker}`,
      url: `https://www.nasdaq.com/market-activity/stocks/${tickerLower}`,
      note: "Exchange-linked market data source for quotes, activity, and security details.",
      sourceType: "Trusted Third Party",
      credibility: "High",
      useFor: "Cross-check ticker, exchange, pricing context, and market activity.",
    },
    {
      label: `Seeking Alpha Research - ${input.ticker}`,
      url: `https://seekingalpha.com/symbol/${input.ticker}`,
      note: "Investor research and blog-style opinions. Useful for idea discovery, but not treated as final proof.",
      sourceType: "Research Blog",
      credibility: "Medium",
      useFor: "Understand investor narratives and bull/bear arguments with lower decision weight.",
    },
  ];
}

function buildPrivateCompanyDataset(input: {
  name: string;
  sector: string;
  industry: string;
  country: string;
  website: string;
  description: string;
}): CompanyDataset {
  return {
    profile: {
      name: input.name,
      ticker: "PRIVATE",
      exchange: "Not publicly traded",
      sector: input.sector,
      industry: input.industry,
      country: input.country,
      currency: "Unknown",
      description: input.description,
    },
    metrics: {
      marketCap: 0,
      revenueGrowthPercent: 0,
      profitMarginPercent: 0,
      debtToEquity: 0,
      peRatio: 0,
      freeCashFlowPositive: false,
      returnOnEquityPercent: 0,
      fiveYearReturnPercent: 0,
    },
    news: [],
    sources: [
      {
        label: `${input.name} Official Website`,
        url: input.website,
        note: "Company-owned source used to confirm identity. Public stock financials are unavailable because the company is not listed.",
        sourceType: "Official",
        credibility: "Primary",
        useFor: "Confirm company identity and public/private market status before scoring.",
      },
      {
        label: "SEC EDGAR Company Search",
        url: "https://www.sec.gov/edgar/search/",
        note: "Official filing search used to check whether public-company filings can be verified.",
        sourceType: "Official",
        credibility: "Primary",
        useFor: "Check if there are public-market filings before treating the company as investable.",
      },
    ],
  };
}

const privateCompanyDatasets: Record<string, CompanyDataset> = {
  openai: buildPrivateCompanyDataset({
    name: "OpenAI",
    sector: "Artificial Intelligence",
    industry: "AI Research and Products",
    country: "United States",
    website: "https://openai.com/",
    description:
      "OpenAI is a well-known artificial intelligence company, but it is not currently a normal publicly traded stock with a verified exchange ticker.",
  }),
  "open ai": buildPrivateCompanyDataset({
    name: "OpenAI",
    sector: "Artificial Intelligence",
    industry: "AI Research and Products",
    country: "United States",
    website: "https://openai.com/",
    description:
      "OpenAI is a well-known artificial intelligence company, but it is not currently a normal publicly traded stock with a verified exchange ticker.",
  }),
};

const datasets: Record<string, CompanyDataset> = {
  microsoft: {
    profile: {
      name: "Microsoft Corporation",
      ticker: "MSFT",
      exchange: "NASDAQ",
      sector: "Technology",
      industry: "Software and Cloud Infrastructure",
      country: "United States",
      currency: "USD",
      description:
        "Microsoft is a global software, cloud, and enterprise technology company with major businesses in productivity software, Azure cloud, Windows, gaming, and AI infrastructure.",
    },
    metrics: {
      marketCap: 3560000000000,
      revenueGrowthPercent: 15.7,
      profitMarginPercent: 35.9,
      debtToEquity: 0.28,
      peRatio: 36.4,
      freeCashFlowPositive: true,
      returnOnEquityPercent: 33.6,
      fiveYearReturnPercent: 165,
    },
    news: [
      {
        title: "Microsoft continues investing heavily in AI cloud capacity",
        source: "Reuters and company news sample",
        publishedAt: "2026-06-18",
        url: "https://www.reuters.com/markets/companies/MSFT.O/",
        sentiment: "positive",
      },
      {
        title: "Regulators keep reviewing large technology platform practices",
        source: "SEC and market risk sample",
        publishedAt: "2026-05-29",
        url: "https://www.sec.gov/edgar/browse/?CIK=789019",
        sentiment: "neutral",
      },
    ],
    sources: buildSourceSet({
      company: "Microsoft",
      ticker: "MSFT",
      exchangeCode: "xnas",
      investorUrl: "https://www.microsoft.com/en-us/investor",
      cik: "789019",
    }),
  },
  apple: {
    profile: {
      name: "Apple Inc.",
      ticker: "AAPL",
      exchange: "NASDAQ",
      sector: "Technology",
      industry: "Consumer Electronics and Services",
      country: "United States",
      currency: "USD",
      description:
        "Apple designs consumer hardware, software, and services, with a high-margin ecosystem built around iPhone, Mac, wearables, payments, and digital services.",
    },
    metrics: {
      marketCap: 3220000000000,
      revenueGrowthPercent: 5.2,
      profitMarginPercent: 24.3,
      debtToEquity: 1.41,
      peRatio: 31.8,
      freeCashFlowPositive: true,
      returnOnEquityPercent: 138.0,
      fiveYearReturnPercent: 88,
    },
    news: [
      {
        title: "Apple services revenue remains a key profit driver",
        source: "Morningstar and market news sample",
        publishedAt: "2026-06-22",
        url: "https://www.morningstar.com/stocks/xnas/aapl/quote",
        sentiment: "positive",
      },
      {
        title: "App marketplace rules remain under regulatory pressure",
        source: "SEC and Reuters risk sample",
        publishedAt: "2026-06-08",
        url: "https://www.sec.gov/edgar/browse/?CIK=320193",
        sentiment: "negative",
      },
    ],
    sources: buildSourceSet({
      company: "Apple",
      ticker: "AAPL",
      exchangeCode: "xnas",
      investorUrl: "https://investor.apple.com",
      cik: "320193",
    }),
  },
  tesla: {
    profile: {
      name: "Tesla, Inc.",
      ticker: "TSLA",
      exchange: "NASDAQ",
      sector: "Consumer Discretionary",
      industry: "Electric Vehicles and Energy Storage",
      country: "United States",
      currency: "USD",
      description:
        "Tesla manufactures electric vehicles, energy storage systems, charging products, and related software-led services.",
    },
    metrics: {
      marketCap: 840000000000,
      revenueGrowthPercent: 8.8,
      profitMarginPercent: 7.3,
      debtToEquity: 0.15,
      peRatio: 74.6,
      freeCashFlowPositive: true,
      returnOnEquityPercent: 10.9,
      fiveYearReturnPercent: 42,
    },
    news: [
      {
        title: "Tesla faces margin pressure as EV competition increases",
        source: "Reuters and market news sample",
        publishedAt: "2026-06-15",
        url: "https://www.reuters.com/markets/companies/TSLA.O/",
        sentiment: "negative",
      },
      {
        title: "Investors watch automation and energy storage growth plans",
        source: "Yahoo Finance and investor discussion sample",
        publishedAt: "2026-06-01",
        url: "https://finance.yahoo.com/quote/TSLA",
        sentiment: "neutral",
      },
    ],
    sources: buildSourceSet({
      company: "Tesla",
      ticker: "TSLA",
      exchangeCode: "xnas",
      investorUrl: "https://ir.tesla.com",
      cik: "1318605",
    }),
  },
  nvidia: {
    profile: {
      name: "NVIDIA Corporation",
      ticker: "NVDA",
      exchange: "NASDAQ",
      sector: "Technology",
      industry: "Semiconductors and AI Accelerators",
      country: "United States",
      currency: "USD",
      description:
        "NVIDIA designs GPUs, AI accelerators, networking products, and software platforms used in gaming, data centers, professional visualization, and autonomous systems.",
    },
    metrics: {
      marketCap: 4300000000000,
      revenueGrowthPercent: 114.2,
      profitMarginPercent: 55.0,
      debtToEquity: 0.18,
      peRatio: 49.7,
      freeCashFlowPositive: true,
      returnOnEquityPercent: 96.4,
      fiveYearReturnPercent: 2850,
    },
    news: [
      {
        title: "NVIDIA data center demand remains supported by AI infrastructure spending",
        source: "Reuters and company news sample",
        publishedAt: "2026-06-20",
        url: "https://www.reuters.com/markets/companies/NVDA.O/",
        sentiment: "positive",
      },
      {
        title: "Export controls and supply concentration remain key investor risks",
        source: "SEC and Morningstar risk sample",
        publishedAt: "2026-06-04",
        url: "https://www.sec.gov/edgar/browse/?CIK=1045810",
        sentiment: "neutral",
      },
    ],
    sources: buildSourceSet({
      company: "NVIDIA",
      ticker: "NVDA",
      exchangeCode: "xnas",
      investorUrl: "https://investor.nvidia.com",
      cik: "1045810",
    }),
  },
};

export function getSampleCompanyData(companyName: string): CompanyDataset {
  const normalized = companyName.trim().toLowerCase();
  const exact = datasets[normalized];
  const privateExact = privateCompanyDatasets[normalized];

  if (exact) {
    return exact;
  }

  if (privateExact) {
    return privateExact;
  }

  const fuzzyMatch = Object.entries(datasets).find(([key, value]) => {
    return (
      key.includes(normalized) ||
      value.profile.name.toLowerCase().includes(normalized) ||
      value.profile.ticker.toLowerCase() === normalized
    );
  });

  if (fuzzyMatch) {
    return fuzzyMatch[1];
  }

  return {
    profile: {
      name: companyName.trim(),
      ticker: "UNKNOWN",
      exchange: "Unknown",
      sector: "Unknown",
      industry: "Unknown",
      country: "Unknown",
      currency: "Unknown",
      description:
        "This company could not be matched to a verified public-market listing. The bot should not treat it as investable until a ticker, exchange, and financial data are confirmed.",
      marketStatus: "Unverified",
      securityType: "Unknown",
      resolutionNote:
        "No verified ticker, exchange, ETF, parent company, public filing, or known private-company match was found.",
    },
    metrics: {
      marketCap: 0,
      revenueGrowthPercent: 0,
      profitMarginPercent: 0,
      debtToEquity: 0,
      peRatio: 0,
      freeCashFlowPositive: false,
      returnOnEquityPercent: 0,
      fiveYearReturnPercent: 0,
    },
    news: [],
    sources: [],
  };
}






