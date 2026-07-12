"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getVerdict = getVerdict;
exports.buildResearchReport = buildResearchReport;
function missingCoreMetricCount(metrics) {
    return [
        metrics.marketCap <= 0,
        metrics.revenueGrowthPercent === 0,
        metrics.profitMarginPercent === 0,
        metrics.peRatio === 0,
    ].filter(Boolean).length;
}
function hasInsufficientVerifiedFinancials(metrics) {
    return missingCoreMetricCount(metrics) >= 2;
}
function getVerdict(totalScore, metrics) {
    if (metrics && hasInsufficientVerifiedFinancials(metrics)) {
        return "Research Needed";
    }
    if (totalScore >= 80) {
        return "Invest";
    }
    if (totalScore >= 60) {
        return "Watchlist";
    }
    return "Pass";
}
function getVerdictArticle(verdict) {
    return verdict === "Invest" ? "an" : "a";
}
function getReturnLabel(metrics) {
    var _a;
    return ((_a = metrics.returnPeriodLabel) !== null && _a !== void 0 ? _a : "Last 5 Years Return").toLowerCase();
}
function hasCoreMetricDataGap(metrics) {
    return hasInsufficientVerifiedFinancials(metrics);
}
function formatMetricPercent(value, metrics) {
    return hasCoreMetricDataGap(metrics) && value === 0 ? "not available" : `${value.toFixed(1)}%`;
}
function formatMetricNumber(value, metrics) {
    return hasCoreMetricDataGap(metrics) && value === 0 ? "not available" : value.toFixed(1);
}
function describeReturn(metrics) {
    const returnLabel = getReturnLabel(metrics);
    if (metrics.fiveYearReturnPercent === 0) {
        return `${returnLabel} data is unavailable`;
    }
    if (metrics.fiveYearReturnPercent >= 150) {
        return `the stock has delivered very strong ${returnLabel}`;
    }
    if (metrics.fiveYearReturnPercent >= 50) {
        return `the stock has delivered good ${returnLabel}`;
    }
    if (metrics.fiveYearReturnPercent > 0) {
        return `the stock has been positive on ${returnLabel}`;
    }
    return `the stock has lost value on ${returnLabel}`;
}
function describeValuation(metrics) {
    if (metrics.peRatio < 0) {
        return "P/E is negative because the company is currently loss-making";
    }
    if (metrics.peRatio === 0) {
        return "valuation data is unavailable";
    }
    if (metrics.peRatio > 55) {
        return "valuation is demanding";
    }
    if (metrics.peRatio > 35) {
        return "valuation requires continued execution";
    }
    return "valuation is relatively reasonable";
}
function buildStrengths(metrics, news, company) {
    var _a;
    if ((company === null || company === void 0 ? void 0 : company.ticker) === "INVESTABLEBOT") {
        return [
            "The bot is built around guided reasoning, clear verdicts, and beginner-friendly explanations.",
            "It uses guardrails so missing company data is flagged instead of being turned into fake confidence.",
            "The project is designed to be explainable in an interview, not just visually impressive.",
        ];
    }
    const strengths = [];
    if (metrics.revenueGrowthPercent >= 12) {
        strengths.push("Revenue growth is strong relative to mature public-company expectations.");
    }
    if (metrics.profitMarginPercent >= 20) {
        strengths.push("Profit margins show strong operating quality.");
    }
    if (metrics.freeCashFlowPositive) {
        strengths.push("Positive free cash flow supports financial flexibility.");
    }
    if (metrics.fiveYearReturnPercent >= 50) {
        strengths.push(`The stock has created meaningful shareholder returns on ${(_a = metrics.returnPeriodLabel) !== null && _a !== void 0 ? _a : "the available return period"}.`);
    }
    if (metrics.debtToEquity < 0.5) {
        strengths.push("Leverage appears controlled based on debt-to-equity.");
    }
    if (news.some((item) => item.sentiment === "positive")) {
        strengths.push("Recent news includes positive business momentum signals.");
    }
    return strengths.length > 0 ? strengths : ["No major strength can be confirmed from available sample data."];
}
function buildRisks(company, metrics, news) {
    var _a;
    if (company.ticker === "INVESTABLEBOT") {
        return [
            "This is a custom project showcase response, not a real public-stock investment recommendation.",
            "The bot should still be judged by source quality, accuracy checks, and explainability.",
        ];
    }
    const risks = [];
    if (metrics.peRatio > 45) {
        risks.push("High valuation leaves less room for execution mistakes.");
    }
    if (metrics.profitMarginPercent < 0) {
        risks.push("The company is still loss-making, so profitability has not been proven yet.");
    }
    else if (metrics.profitMarginPercent < 10) {
        const businessText = `${company.sector} ${company.industry}`.toLowerCase();
        if (businessText.includes("beverage") || businessText.includes("consumer staples") || businessText.includes("consumer packaged")) {
            risks.push("Profit margin is modest, so the margin trend should be compared with beverage and staples peers.");
        }
        else {
            risks.push("Profitability is thin, which can reduce downside protection.");
        }
    }
    if (metrics.debtToEquity > 1) {
        risks.push("Leverage is elevated and should be checked against cash flow stability.");
    }
    if (news.some((item) => item.sentiment === "negative")) {
        risks.push("Recent headlines include negative or pressure-related signals.");
    }
    if (metrics.fiveYearReturnPercent < -20) {
        risks.push(`The stock has lost significant value on ${(_a = metrics.returnPeriodLabel) !== null && _a !== void 0 ? _a : "the available return period"}.`);
    }
    if (company.marketStatus === "Unlisted/Government") {
        risks.push("The company is government-owned or unlisted, so normal public stock investors cannot buy verified exchange-listed equity shares.");
    }
    else if (company.marketStatus === "Private Company" || company.ticker === "PRIVATE") {
        risks.push("The company is private, so normal public stock investors cannot buy verified exchange-listed shares yet.");
    }
    else if (company.marketStatus === "ETF/Fund") {
        risks.push("This is an ETF or fund, so company fundamentals like revenue, profit margin, and P/E may not apply directly.");
    }
    else if (company.marketStatus === "Subsidiary/Brand") {
        risks.push("The searched brand is not separately listed, so the verdict uses the parent company stock.");
    }
    else if (metrics.marketCap === 0) {
        risks.push("No verified company identity, ticker, exchange, or public-market financial data was found.");
    }
    return risks.length > 0 ? risks : ["No major risk flag is visible from the current sample inputs."];
}
function buildSummary(company, metrics, score, verdict) {
    var _a, _b, _c, _d;
    if (company.ticker === "INVESTABLEBOT") {
        return "This bot works under your guidance. You can consider investing in this AI bot too, because the project focuses on explainable reasoning, source checks, and accuracy guardrails instead of blind stock tips.";
    }
    if (company.marketStatus === "Unlisted/Government") {
        return `${company.name} appears to be government-owned or otherwise unlisted, not a normal publicly traded stock. The bot does not recommend public-stock investing because it cannot verify an exchange ticker, audited public filings, or market valuation metrics for a tradable equity share.`;
    }
    if (company.marketStatus === "Private Company" || company.ticker === "PRIVATE") {
        return `${company.name} appears to be a private company, not a normal publicly traded stock. The bot does not recommend public-stock investing because it cannot verify an exchange ticker, audited public filings, or market valuation metrics.`;
    }
    if (company.marketStatus === "ETF/Fund") {
        return `${company.name} is an ETF or listed fund, not a single operating company. The bot gives a ${verdict.toLowerCase()} research signal with a score of ${score.totalScore}/100, driven mainly by market performance, source quality, and risk signals. Company fundamentals like revenue growth and profit margin may not apply directly.`;
    }
    if (company.marketStatus === "Subsidiary/Brand") {
        if (hasCoreMetricDataGap(metrics)) {
            return `${(_a = company.resolvedFrom) !== null && _a !== void 0 ? _a : company.name} is not separately listed, so the bot resolved it to parent company ${(_b = company.parentCompany) !== null && _b !== void 0 ? _b : company.name} (${company.ticker}). The bot still needs verified parent-company fundamentals before giving an investment verdict. Return data alone is not enough.`;
        }
        return `${(_c = company.resolvedFrom) !== null && _c !== void 0 ? _c : company.name} is not separately listed, so the bot resolved it to parent company ${(_d = company.parentCompany) !== null && _d !== void 0 ? _d : company.name} (${company.ticker}). The parent stock receives ${getVerdictArticle(verdict)} ${verdict.toLowerCase()} verdict with a score of ${score.totalScore}/100, using parent-company financials and market data.`;
    }
    if (company.ticker === "UNKNOWN" || company.marketStatus === "Unverified") {
        return `Looks like you entered your own delusional company name. Fix the name first. The bot could not verify ${company.name} as a real tradable public stock, ETF, known parent company, or known private company, so it assigns 0 trust and 0 investment score.`;
    }
    if (hasCoreMetricDataGap(metrics)) {
        const returnText = metrics.fiveYearReturnPercent !== 0
            ? ` The available return check shows ${metrics.fiveYearReturnPercent.toFixed(1)}% ${getReturnLabel(metrics)}, but return alone is not enough for an investment verdict.`
            : "";
        return `${company.name} needs more verified financial data before the bot can give a confident investment answer.${returnText}`;
    }
    return `${company.name} receives ${getVerdictArticle(verdict)} ${verdict.toLowerCase()} verdict with a score of ${score.totalScore}/100. The result is driven by ${metrics.revenueGrowthPercent.toFixed(1)}% revenue growth, ${metrics.profitMarginPercent.toFixed(1)}% profit margin, ${metrics.debtToEquity.toFixed(2)} debt-to-equity, a P/E ratio of ${metrics.peRatio.toFixed(1)}, and ${metrics.fiveYearReturnPercent.toFixed(1)}% ${getReturnLabel(metrics)}, where ${describeValuation(metrics)} and ${describeReturn(metrics)}.`;
}
function buildResearchReport(input) {
    const verdict = getVerdict(input.score.totalScore, input.metrics);
    return {
        company: input.company,
        metrics: input.metrics,
        news: input.news,
        score: input.score,
        verdict,
        summary: buildSummary(input.company, input.metrics, input.score, verdict),
        strengths: buildStrengths(input.metrics, input.news, input.company),
        risks: buildRisks(input.company, input.metrics, input.news),
        methodology: "The agent resolves the company, collects structured financial, return, and news evidence, checks official sources against trusted third-party sources, calculates a weighted score, and then explains the verdict in plain language.",
        sources: input.sources,
        generatedAt: new Date().toISOString(),
    };
}
