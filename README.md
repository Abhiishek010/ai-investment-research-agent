# AI Investment Research Agent

A simple, explainable AI investment research agent built with Next.js, TypeScript, and LangGraph.js.

The app takes a company name or ticker, resolves the correct company identity, checks available financial and source data, scores the investment case, and returns an `Invest`, `Watchlist`, `Pass`, or `Research Needed` verdict with reasoning, strengths, risks, confidence, and sources.

## Live Demo

The project is deployed on Vercel:

```txt
https://ai-investment-research-agent-rho-wine.vercel.app/
```

Open the link, enter a company name or ticker, and click `Check` to start using the bot.

## Why This Design

The system is intentionally split into four easy-to-explain layers:

1. Company resolution: identify the company, ticker, exchange, sector, and currency.
2. Evidence collection: collect financial metrics, recent signals, return data, and source references.
3. Data reconciliation and scoring: calculate a transparent weighted score with guardrails.
4. Reasoning report: explain the verdict in plain English.

This avoids making the LLM responsible for unsupported claims. The data drives the score; AI-style reasoning explains the score.

## Tech Stack

- Next.js App Router for frontend and backend API
- TypeScript for typed contracts
- LangGraph.js for the agent workflow
- Deterministic scoring engine for consistent decisions
- React dashboard UI for report inspection
- Zod and input sanitization for safer API input handling

## Current V1 Behavior

The app supports a live-data mode through Financial Modeling Prep when `FMP_API_KEY` or `FINANCIAL_DATA_API_KEY` is configured. Without a key, it safely falls back to deterministic sample data for Microsoft, Apple, NVIDIA, and Tesla so the workflow remains testable.

Live mode can collect:

- Company name and ticker lookup
- Company profile and exchange details
- Market cap, financial statements, ratios, key metrics, cash flow, and return data where available
- Recent stock news when supported by the configured provider plan
- Official and trusted third-party source references

The app also handles private companies, government/unlisted companies, subsidiaries/brands, ETFs/funds, and unverified random company names without pretending they are normal public stocks.

## Local Development Setup

Requirements: Node.js, npm, and an optional Financial Modeling Prep API key.

```bash
npm install
npm run dev
```

Then open:

```txt
http://localhost:3000
```

## Environment Variables

Create `.env.local` and add only the keys you need:

```txt
FMP_API_KEY=your_key_here
# or
FINANCIAL_DATA_API_KEY=your_key_here

# Keep false/empty for the FMP free plan. Set true only if your FMP plan includes ratios,
# statements, historical prices, and stock news.
FMP_FULL_FINANCIALS=false

# Optional future LLM reasoning layer.
OPENAI_API_KEY=

# Optional future news provider key.
NEWS_API_KEY=
```

When a financial-data key is available, the LangGraph company resolution node uses live Financial Modeling Prep endpoints first. If live lookup fails or no key exists, the app falls back to sample data instead of hallucinating numbers.

The live provider is implemented in `src/lib/investment/liveDataProvider.ts` and returns the same structured contract as the sample provider. This keeps scoring, risk logic, source quality checks, and the UI report consistent across sample and live companies.

## Build And Test Checks

Run these before submission:

```bash
npm run build
npm run typecheck
npm run test:accuracy
```

The accuracy regression suite checks input sanitization, unverified-company guardrails, missing-fundamental handling, guided project responses, known ticker aliases, curated fallback coverage, and verdict thresholds.

## Scoring Model

The verdict uses a weighted score out of 100:

| Category | Weight |
| --- | ---: |
| Financial Health | 22% |
| Growth | 18% |
| Valuation | 15% |
| Last 5 Years Return / Available Return Check | 20% |
| News Sentiment | 10% |
| Risk Control | 10% |
| Source Quality | 5% |

Verdict thresholds:

| Score | Verdict |
| ---: | --- |
| 80-100 | Invest |
| 60-79 | Watchlist |
| 0-59 | Pass |

If important company fundamentals are missing, the report can return `Research Needed` even when a ticker or return data exists. Confidence is reduced when company identity, financial metrics, source coverage, or recent news are incomplete.

## Source Quality Policy

The agent does not treat every source equally.

| Source Type | Examples | How It Is Used |
| --- | --- | --- |
| Official | Company investor relations, SEC EDGAR | Primary proof for reported numbers, filings, risks, and management updates |
| Trusted Third Party | Reuters, Morningstar, Yahoo Finance, Nasdaq | Independent validation for market data, news context, valuation, and public market activity |
| Research Blog | Seeking Alpha-style investor research | Supporting opinion only; useful for bull/bear arguments but never final proof |

This source hierarchy is important for trust. Official sources confirm facts, trusted third-party sources reduce single-source bias, and blogs are labeled as opinion with lower decision weight.

## Accuracy Positioning

The project does not claim to predict stock prices with 85-90% accuracy. That would be unrealistic and misleading.

Instead, the goal is 85-90% research reliability by improving:

- Company identity verification
- Structured data coverage
- Source-backed reasoning
- Transparent scoring
- Confidence reduction when data is incomplete

This is the right interview explanation: the agent is designed for disciplined research, not guaranteed market prediction.

## Important Disclaimer

This tool is for educational investment research assistance only. It is not financial advice.