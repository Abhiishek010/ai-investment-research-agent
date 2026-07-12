import { Annotation, END, START, StateGraph } from "@langchain/langgraph";
import { buildResearchReport } from "./reporting";
import { getCompanyData } from "./dataProvider";
import { scoreGuidedBotProject, scoreInvestment, scoreUnverifiedCompany } from "./scoring";
import type {
  CompanyProfile,
  FinancialMetrics,
  NewsItem,
  ResearchReport,
  ScoreBreakdown,
  SourceReference,
} from "./types";

const ResearchState = Annotation.Root({
  companyName: Annotation<string>,
  company: Annotation<CompanyProfile | undefined>,
  metrics: Annotation<FinancialMetrics | undefined>,
  news: Annotation<NewsItem[]>({
    reducer: (_current, update) => update,
    default: () => [],
  }),
  sources: Annotation<SourceReference[]>({
    reducer: (_current, update) => update,
    default: () => [],
  }),
  score: Annotation<ScoreBreakdown | undefined>,
  report: Annotation<ResearchReport | undefined>,
});

async function resolveCompany(state: typeof ResearchState.State) {
  const dataset = await getCompanyData(state.companyName);

  return {
    company: dataset.profile,
    metrics: dataset.metrics,
    news: dataset.news,
    sources: dataset.sources,
  };
}

function isGuidedBotProject(company: CompanyProfile | undefined) {
  return company?.ticker.toUpperCase() === "INVESTABLEBOT";
}

function isUnverifiedCompany(company: CompanyProfile | undefined) {
  return company?.ticker.toUpperCase() === "UNKNOWN" || company?.marketStatus === "Unverified";
}

async function reconcileAndScore(state: typeof ResearchState.State) {
  if (!state.metrics) {
    throw new Error("Cannot score investment research without financial metrics.");
  }

  return {
    score: isGuidedBotProject(state.company)
      ? scoreGuidedBotProject()
      : isUnverifiedCompany(state.company)
        ? scoreUnverifiedCompany()
        : scoreInvestment(state.metrics, state.news, state.sources),
  };
}

async function createReport(state: typeof ResearchState.State) {
  if (!state.company || !state.metrics || !state.score) {
    throw new Error("Cannot create report until company, metrics, and score are available.");
  }

  return {
    report: buildResearchReport({
      company: state.company,
      metrics: state.metrics,
      news: state.news,
      score: state.score,
      sources: state.sources,
    }),
  };
}

const graph = new StateGraph(ResearchState)
  .addNode("resolve_company", resolveCompany)
  .addNode("reconcile_and_score", reconcileAndScore)
  .addNode("create_report", createReport)
  .addEdge(START, "resolve_company")
  .addEdge("resolve_company", "reconcile_and_score")
  .addEdge("reconcile_and_score", "create_report")
  .addEdge("create_report", END)
  .compile();

export async function runInvestmentResearch(companyName: string) {
  const result = await graph.invoke({ companyName });

  if (!result.report) {
    throw new Error("Research graph finished without a report.");
  }

  return result.report;
}




