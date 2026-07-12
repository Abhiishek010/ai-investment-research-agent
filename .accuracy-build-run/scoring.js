"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.scoreInvestment = scoreInvestment;
exports.scoreGuidedBotProject = scoreGuidedBotProject;
exports.scoreUnverifiedCompany = scoreUnverifiedCompany;
function clamp(value, min = 0, max = 100) {
    return Math.min(max, Math.max(min, value));
}
function scoreFinancialHealth(metrics) {
    const marginScore = clamp(metrics.profitMarginPercent * 2);
    const debtScore = clamp(100 - metrics.debtToEquity * 35);
    const cashFlowScore = metrics.freeCashFlowPositive ? 100 : 35;
    const roeScore = clamp(metrics.returnOnEquityPercent * 1.5);
    return Math.round((marginScore + debtScore + cashFlowScore + roeScore) / 4);
}
function scoreGrowth(metrics) {
    return Math.round(clamp(45 + metrics.revenueGrowthPercent * 2.2));
}
function scoreFiveYearReturn(metrics) {
    const fiveYearReturn = metrics.fiveYearReturnPercent;
    if (fiveYearReturn === 0) {
        return 40;
    }
    if (fiveYearReturn < -70) {
        return 8;
    }
    if (fiveYearReturn < -40) {
        return 18;
    }
    if (fiveYearReturn < -10) {
        return 32;
    }
    if (fiveYearReturn < 0) {
        return 42;
    }
    if (fiveYearReturn < 25) {
        return Math.round(52 + fiveYearReturn * 0.4);
    }
    if (fiveYearReturn < 75) {
        return Math.round(62 + (fiveYearReturn - 25) * 0.32);
    }
    if (fiveYearReturn < 150) {
        return Math.round(78 + (fiveYearReturn - 75) * 0.16);
    }
    if (fiveYearReturn < 300) {
        return Math.round(90 + (fiveYearReturn - 150) * 0.05);
    }
    return 98;
}
function getReturnMomentumFloor(metrics, riskControlScore) {
    const fiveYearReturn = metrics.fiveYearReturnPercent;
    const riskLevel = 100 - riskControlScore;
    if (riskLevel >= 70 || fiveYearReturn <= 0) {
        return 0;
    }
    if (fiveYearReturn >= 300) {
        return 78;
    }
    if (fiveYearReturn >= 150) {
        return 75;
    }
    if (fiveYearReturn >= 75) {
        return 68;
    }
    if (fiveYearReturn >= 50) {
        return 64;
    }
    return 0;
}
function getMissingCoreMetricCount(metrics) {
    return [
        metrics.marketCap <= 0,
        metrics.revenueGrowthPercent === 0,
        metrics.profitMarginPercent === 0,
        metrics.peRatio === 0,
    ].filter(Boolean).length;
}
function getCompletenessScoreCap(missingCoreMetricCount) {
    if (missingCoreMetricCount >= 3) {
        return 45;
    }
    if (missingCoreMetricCount >= 2) {
        return 55;
    }
    if (missingCoreMetricCount === 1) {
        return 70;
    }
    return 100;
}
function getReturnAdjustment(metrics, riskControlScore) {
    const fiveYearReturn = metrics.fiveYearReturnPercent;
    if (fiveYearReturn === 0) {
        return 0;
    }
    if (fiveYearReturn < -70) {
        return -8;
    }
    if (fiveYearReturn < -40) {
        return -5;
    }
    if (fiveYearReturn < -10) {
        return -2;
    }
    const riskLevel = 100 - riskControlScore;
    if (riskLevel >= 70) {
        return fiveYearReturn >= 150 ? 2 : 0;
    }
    if (fiveYearReturn >= 300) {
        return 10;
    }
    if (fiveYearReturn >= 150) {
        return 8;
    }
    if (fiveYearReturn >= 75) {
        return 5;
    }
    if (fiveYearReturn >= 25) {
        return 2;
    }
    return 0;
}
function scoreValuation(metrics) {
    if (metrics.peRatio < 0) {
        return 24;
    }
    if (metrics.peRatio === 0) {
        return 35;
    }
    if (metrics.peRatio <= 18) {
        return 90;
    }
    if (metrics.peRatio <= 30) {
        return 78;
    }
    if (metrics.peRatio <= 45) {
        return 62;
    }
    if (metrics.peRatio <= 70) {
        return 48;
    }
    return 34;
}
function scoreNewsSentiment(news) {
    if (news.length === 0) {
        return 40;
    }
    const total = news.reduce((sum, item) => {
        if (item.sentiment === "positive") {
            return sum + 85;
        }
        if (item.sentiment === "negative") {
            return sum + 30;
        }
        return sum + 60;
    }, 0);
    return Math.round(total / news.length);
}
function scoreRisk(metrics, news) {
    const valuationRisk = metrics.peRatio < 0 ? 20 : metrics.peRatio > 55 ? 25 : metrics.peRatio > 35 ? 15 : 0;
    const marginRisk = metrics.profitMarginPercent < 0 ? 28 : metrics.profitMarginPercent < 10 ? 18 : 0;
    const negativeNewsRisk = news.filter((item) => item.sentiment === "negative").length * 12;
    const debtRisk = metrics.debtToEquity > 1 ? 15 : 0;
    return clamp(90 - valuationRisk - marginRisk - negativeNewsRisk - debtRisk);
}
function hasSourceType(sources, sourceType) {
    return sources.some((source) => source.sourceType === sourceType);
}
function getSourceCoverageScore(sources) {
    const hasOfficial = hasSourceType(sources, "Official");
    const trustedThirdPartyCount = sources.filter((source) => source.sourceType === "Trusted Third Party" && source.credibility === "High").length;
    const hasResearchBlog = hasSourceType(sources, "Research Blog");
    let score = 20;
    if (hasOfficial) {
        score += 35;
    }
    score += Math.min(trustedThirdPartyCount, 3) * 12;
    if (hasResearchBlog) {
        score += 8;
    }
    return clamp(score);
}
function getDataQuality(metrics, news, sources) {
    const hasCoreMetrics = metrics.marketCap > 0 &&
        metrics.profitMarginPercent !== 0 &&
        metrics.revenueGrowthPercent !== 0 &&
        (metrics.peRatio !== 0 || metrics.fiveYearReturnPercent !== 0);
    const hasOfficial = hasSourceType(sources, "Official");
    const trustedThirdPartyCount = sources.filter((source) => source.sourceType === "Trusted Third Party" && source.credibility === "High").length;
    if (hasCoreMetrics && news.length >= 2 && hasOfficial && trustedThirdPartyCount >= 2) {
        return "Complete";
    }
    if (hasCoreMetrics || news.length > 0 || trustedThirdPartyCount > 0) {
        return "Partial";
    }
    return "Limited";
}
function getDataQualityScore(status, sources) {
    const sourceCoverageScore = getSourceCoverageScore(sources);
    if (status === "Complete") {
        return Math.round((92 + sourceCoverageScore) / 2);
    }
    if (status === "Partial") {
        return Math.round((65 + sourceCoverageScore) / 2);
    }
    return Math.round((25 + sourceCoverageScore) / 2);
}
function scoreInvestment(metrics, news, sources) {
    var _a, _b, _c, _d, _e;
    const dataQuality = getDataQuality(metrics, news, sources);
    const categories = [
        {
            label: "Financial Health",
            score: scoreFinancialHealth(metrics),
            weight: 22,
            reason: "Profitability, leverage, cash flow, and return on equity.",
        },
        {
            label: "Growth",
            score: scoreGrowth(metrics),
            weight: 18,
            reason: "Recent revenue growth as a proxy for business momentum.",
        },
        {
            label: "Valuation",
            score: scoreValuation(metrics),
            weight: 15,
            reason: "Price is penalized when expectations look expensive.",
        },
        {
            label: (_a = metrics.returnPeriodLabel) !== null && _a !== void 0 ? _a : "Last 5 Years Return",
            score: scoreFiveYearReturn(metrics),
            weight: 20,
            reason: metrics.returnIsFullFiveYear === false
                ? "Uses available listed-price history only; newer listings are not treated as full 5-year records."
                : "Rewards long-term profitable market performance and can lift the verdict when risk is manageable.",
        },
        {
            label: "News Sentiment",
            score: scoreNewsSentiment(news),
            weight: 10,
            reason: "Recent positive, neutral, and negative company signals.",
        },
        {
            label: "Risk Control",
            score: scoreRisk(metrics, news),
            weight: 10,
            reason: "Penalizes valuation, margin, balance sheet, and headline risks.",
        },
        {
            label: "Source Quality",
            score: getDataQualityScore(dataQuality, sources),
            weight: 5,
            reason: "Higher when official data is checked against trusted third-party sources.",
        },
    ];
    const weightedScore = Math.round(categories.reduce((sum, category) => {
        return sum + category.score * (category.weight / 100);
    }, 0));
    const riskControlScore = (_c = (_b = categories.find((category) => category.label === "Risk Control")) === null || _b === void 0 ? void 0 : _b.score) !== null && _c !== void 0 ? _c : 0;
    const missingCoreMetricCount = getMissingCoreMetricCount(metrics);
    const returnAdjustment = getReturnAdjustment(metrics, riskControlScore);
    const returnMomentumFloor = missingCoreMetricCount <= 1 ? getReturnMomentumFloor(metrics, riskControlScore) : 0;
    const completenessScoreCap = getCompletenessScoreCap(missingCoreMetricCount);
    const totalScore = Math.round(clamp(Math.min(Math.max(weightedScore + returnAdjustment, returnMomentumFloor), completenessScoreCap)));
    const confidenceBase = dataQuality === "Complete" ? 82 : dataQuality === "Partial" ? 62 : 35;
    const sourceBonus = Math.round((getSourceCoverageScore(sources) - 50) * 0.12);
    const completenessPenalty = missingCoreMetricCount * 10;
    const confidence = clamp(Math.round(confidenceBase + (totalScore - 60) * 0.35 + sourceBonus - completenessPenalty));
    const officialCount = sources.filter((source) => source.sourceType === "Official").length;
    const trustedThirdPartyCount = sources.filter((source) => source.sourceType === "Trusted Third Party").length;
    const researchBlogCount = sources.filter((source) => source.sourceType === "Research Blog").length;
    const confidenceNotes = [
        dataQuality === "Complete"
            ? "The report checks official sources plus trusted third-party market research."
            : "Some research inputs are missing, so the verdict confidence is reduced.",
        `${officialCount} official source(s), ${trustedThirdPartyCount} trusted third-party source(s), and ${researchBlogCount} research blog source(s) are listed for review.`,
        metrics.fiveYearReturnPercent !== 0
            ? `${(_d = metrics.returnPeriodLabel) !== null && _d !== void 0 ? _d : "Last 5 Years Return"} is included as a return check: ${metrics.fiveYearReturnPercent.toFixed(1)}%. Return adjustment applied: ${returnAdjustment > 0 ? "+" : ""}${returnAdjustment} point(s).${returnMomentumFloor > 0 ? ` Minimum return-backed score floor: ${returnMomentumFloor}/100.` : ""}${missingCoreMetricCount > 1 ? " Return score floor was disabled because core fundamentals are incomplete." : ""}`
            : "Return data was unavailable, so the bot does not give extra return momentum credit.",
        missingCoreMetricCount > 0
            ? `Completeness guardrail: ${missingCoreMetricCount} core metric(s) are missing, so the maximum investment score is capped at ${completenessScoreCap}/100.`
            : "Core financial metrics were available for scoring.",
        ...((_e = metrics.dataWarnings) !== null && _e !== void 0 ? _e : []).map((warning) => `Data warning: ${warning}`),
        "Research blogs are used only as supporting opinion signals, not as final proof.",
        "This is a research assistant, not financial advice or a price prediction.",
    ];
    return {
        categories,
        totalScore,
        confidence,
        dataQuality,
        confidenceNotes,
    };
}
function scoreGuidedBotProject() {
    return {
        categories: [
            {
                label: "Guided Reasoning",
                score: 92,
                weight: 25,
                reason: "The bot explains the decision and keeps important evidence visible.",
            },
            {
                label: "Source Discipline",
                score: 88,
                weight: 20,
                reason: "The bot checks official and trusted third-party sources before scoring.",
            },
            {
                label: "User Clarity",
                score: 90,
                weight: 20,
                reason: "The result is written for users who are not finance experts.",
            },
            {
                label: "Accuracy Guardrails",
                score: 86,
                weight: 20,
                reason: "Missing or unreliable data is flagged instead of being treated as real evidence.",
            },
            {
                label: "Project Confidence",
                score: 91,
                weight: 15,
                reason: "This is a custom project showcase response, not a public-stock valuation.",
            },
        ],
        totalScore: 90,
        confidence: 92,
        dataQuality: "Complete",
        confidenceNotes: [
            "This is a custom project response for InsideIIM / Inside IIM / Altuni AI Labs searches.",
            "The score reflects the AI bot project quality, explainability, and guardrails, not public-market financials.",
            "This bot works under your guidance and should still be presented as a research assistant, not financial advice.",
        ],
    };
}
function scoreUnverifiedCompany() {
    const categories = [
        {
            label: "Financial Health",
            score: 0,
            weight: 22,
            reason: "No verified public-company financial statements were found.",
        },
        {
            label: "Growth",
            score: 0,
            weight: 18,
            reason: "No verified revenue growth data was found.",
        },
        {
            label: "Valuation",
            score: 0,
            weight: 15,
            reason: "No verified ticker, share price, or valuation data was found.",
        },
        {
            label: "Return Check",
            score: 0,
            weight: 20,
            reason: "No verified listed stock was found, so past stock returns cannot be checked.",
        },
        {
            label: "News Sentiment",
            score: 0,
            weight: 10,
            reason: "No verified company identity was found for reliable news matching.",
        },
        {
            label: "Risk Control",
            score: 0,
            weight: 10,
            reason: "Identity risk is too high because the company could not be verified.",
        },
        {
            label: "Source Quality",
            score: 0,
            weight: 5,
            reason: "No trustworthy public-market source confirmed this company.",
        },
    ];
    return {
        categories,
        totalScore: 0,
        confidence: 0,
        dataQuality: "Limited",
        confidenceNotes: [
            "No verified ticker, exchange, public filing, ETF, parent company, or known private-company match was found.",
            "The bot assigns 0 trust and 0 investment score to random or unverified company names.",
            "Try the legal company name, exact stock ticker, or known parent company.",
            "This is a research assistant, not financial advice or a price prediction.",
        ],
    };
}
