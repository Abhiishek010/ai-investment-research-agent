export type InvestmentVerdict = "Invest" | "Watchlist" | "Pass" | "Research Needed";

export type DataQualityStatus = "Complete" | "Partial" | "Limited";

export type SourceType = "Official" | "Trusted Third Party" | "Research Blog";

export type MarketStatus = "Public Company" | "ETF/Fund" | "Private Company" | "Unlisted/Government" | "Subsidiary/Brand" | "Unverified";

export type CompanyProfile = {
  name: string;
  ticker: string;
  exchange: string;
  sector: string;
  industry: string;
  country: string;
  currency: string;
  description: string;
  marketStatus?: MarketStatus;
  securityType?: string;
  parentCompany?: string;
  resolvedFrom?: string;
  resolutionNote?: string;
};

export type FinancialMetrics = {
  marketCap: number;
  revenueGrowthPercent: number;
  profitMarginPercent: number;
  debtToEquity: number;
  peRatio: number;
  freeCashFlowPositive: boolean;
  returnOnEquityPercent: number;
  fiveYearReturnPercent: number;
  returnPeriodLabel?: string;
  returnPeriodYears?: number;
  returnIsFullFiveYear?: boolean;
  latestRevenue?: number;
  previousRevenue?: number;
  netIncome?: number;
  dataWarnings?: string[];
};

export type NewsItem = {
  title: string;
  source: string;
  publishedAt: string;
  url: string;
  sentiment: "positive" | "neutral" | "negative";
};

export type SourceReference = {
  label: string;
  url: string;
  note: string;
  sourceType: SourceType;
  credibility: "Primary" | "High" | "Medium";
  useFor: string;
};

export type ScoreCategory = {
  label: string;
  score: number;
  weight: number;
  reason: string;
};

export type ScoreBreakdown = {
  categories: ScoreCategory[];
  totalScore: number;
  confidence: number;
  dataQuality: DataQualityStatus;
  confidenceNotes: string[];
};

export type ResearchReport = {
  company: CompanyProfile;
  metrics: FinancialMetrics;
  news: NewsItem[];
  score: ScoreBreakdown;
  verdict: InvestmentVerdict;
  summary: string;
  strengths: string[];
  risks: string[];
  methodology: string;
  sources: SourceReference[];
  generatedAt: string;
};





