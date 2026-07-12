# AI Investment Research Agent

A simple, explainable AI investment research agent built with Next.js, TypeScript, and LangGraph.js.

The app takes a company name, verifies sample company data, scores the investment case, and returns an `Invest`, `Watchlist`, or `Pass` verdict with reasoning, strengths, risks, confidence, and sources.

## Why This Design

The system is intentionally split into four easy-to-explain layers:

1. Company resolution: identify the company, ticker, exchange, sector, and currency.
2. Evidence collection: collect financial metrics, recent signals, and source references.
3. Data reconciliation and scoring: calculate a transparent weighted score.
4. Reasoning report: explain the verdict in plain English.

This avoids making the LLM responsible for unsupported claims. The data drives the score; AI-style reasoning explains the score.

## Tech Stack

- Next.js app router for frontend and backend API
- TypeScript for typed contracts
- LangGraph.js for the agent workflow
- Deterministic scoring engine for consistent decisions
- React dashboard UI for report inspection

## Current V1 Behavior

The app supports a live-data mode through Financial Modeling Prep when `FMP_API_KEY` or `FINANCIAL_DATA_API_KEY` is configured. Without a key, it safely falls back to deterministic sample data for Microsoft, Apple, NVIDIA, and Tesla so the workflow remains testable.

Live mode collects:

- Company name and ticker lookup
- Company profile and exchange details
- Market cap, financial statements, ratios, key metrics, and cash flow
- Recent stock news
- Official and trusted third-party source references

The next phase is to add an LLM reasoning node for richer summaries over verified live inputs.

## Scoring Model

The verdict uses a weighted score out of 100:

| Category | Weight |
| --- | ---: |
| Financial Health | 30% |
| Growth | 25% |
| Valuation | 20% |
| News Sentiment | 10% |
| Risk Control | 10% |
| Data Quality | 5% |

Verdict thresholds:

| Score | Verdict |
| ---: | --- |
| 80-100 | Invest |
| 60-79 | Watchlist |
| 0-59 | Pass |

Confidence is reduced when company identity, financial metrics, or recent news are incomplete.

## Accuracy Positioning

The project does not claim to predict stock prices with 85-90% accuracy. That would be unrealistic and misleading.

Instead, the goal is 85-90% research reliability by improving:

- Company identity verification
- Structured data coverage
- Source-backed reasoning
- Transparent scoring
- Confidence reduction when data is incomplete

This is the right interview explanation: the agent is designed for disciplined research, not guaranteed market prediction.



## Live Data Setup

Create `.env.local` and add one of these keys:

```txt
FMP_API_KEY=your_key_here
```

or:

```txt
FINANCIAL_DATA_API_KEY=your_key_here
```

When the key is available, the LangGraph company resolution node uses live Financial Modeling Prep endpoints first. If live lookup fails or no key exists, the app falls back to sample data instead of hallucinating numbers.

The live provider is implemented in `src/lib/investment/liveDataProvider.ts` and returns the same structured contract as the sample provider. This means the scoring, risk logic, source quality checks, and UI report stay consistent across sample and live companies.
## Source Quality Policy

The agent does not treat every source equally.

| Source Type | Examples | How It Is Used |
| --- | --- | --- |
| Official | Company investor relations, SEC EDGAR | Primary proof for reported numbers, filings, risks, and management updates |
| Trusted Third Party | Reuters, Morningstar, Yahoo Finance, Nasdaq | Independent validation for market data, news context, valuation, and public market activity |
| Research Blog | Seeking Alpha-style investor research | Supporting opinion only; useful for bull/bear arguments but never final proof |

This source hierarchy is important for trust. Official sources confirm facts, trusted third-party sources reduce single-source bias, and blogs are labeled as opinion with lower decision weight.
## Run Locally

```bash
npm install
npm run dev
```

Then open:

```txt
http://localhost:3000
```

## Build Check

```bash
npm run build
npm run typecheck
```

Both commands should pass before submission.

## Important Disclaimer

This tool is for educational investment research assistance only. It is not financial advice.


