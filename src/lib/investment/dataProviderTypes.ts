import type {
  CompanyProfile,
  FinancialMetrics,
  NewsItem,
  SourceReference,
} from "./types";

export type CompanyDataset = {
  profile: CompanyProfile;
  metrics: FinancialMetrics;
  news: NewsItem[];
  sources: SourceReference[];
};

export type DataProviderResult = CompanyDataset & {
  provider: "live" | "sample" | "limited";
};
