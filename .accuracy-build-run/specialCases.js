"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSpecialCaseCompanyData = getSpecialCaseCompanyData;
function normalizeLookup(value) {
    return value.toLowerCase().replace(/[^a-z0-9]/g, "");
}
const privateCompanies = {
    openai: {
        name: "OpenAI",
        sector: "Artificial Intelligence",
        industry: "AI Research and Products",
        country: "United States",
        website: "https://openai.com/",
        description: "OpenAI is a well-known artificial intelligence company, but it is not currently a normal publicly traded stock with a verified exchange ticker.",
    },
    anthropic: {
        name: "Anthropic",
        sector: "Artificial Intelligence",
        industry: "AI Research and Products",
        country: "United States",
        website: "https://www.anthropic.com/",
        description: "Anthropic is a private AI company, so public-market investors cannot directly buy ordinary exchange-listed shares.",
    },
    spacex: {
        name: "SpaceX",
        sector: "Aerospace",
        industry: "Space Launch and Satellite Internet",
        country: "United States",
        website: "https://www.spacex.com/",
        description: "SpaceX is a private aerospace company, so it does not have a normal public stock ticker for retail investors.",
    },
    stripe: {
        name: "Stripe",
        sector: "Financial Technology",
        industry: "Payments Infrastructure",
        country: "United States",
        website: "https://stripe.com/",
        description: "Stripe is a private financial technology company and is not a normal publicly traded stock.",
    },
    databricks: {
        name: "Databricks",
        sector: "Technology",
        industry: "Data and AI Infrastructure",
        country: "United States",
        website: "https://www.databricks.com/",
        description: "Databricks is a private data and AI infrastructure company, so public stock metrics are not available.",
    },
    bytedance: {
        name: "ByteDance",
        sector: "Communication Services",
        industry: "Social Media and Digital Platforms",
        country: "China",
        website: "https://www.bytedance.com/",
        description: "ByteDance is a private company, so TikTok/ByteDance cannot be scored as a normal exchange-listed stock.",
    },
    phonepe: {
        name: "PhonePe",
        sector: "Financial Technology",
        industry: "Digital Payments and Financial Services",
        country: "India",
        website: "https://www.phonepe.com/",
        description: "PhonePe is a popular Indian payments and financial services app, but it is not separately listed as a normal public equity stock.",
    },
    meesho: {
        name: "Meesho",
        sector: "Consumer Internet",
        industry: "E-commerce Marketplace",
        country: "India",
        website: "https://www.meesho.com/",
        description: "Meesho is a popular Indian e-commerce platform, but it is not currently a normal exchange-listed equity stock.",
    },
    zepto: {
        name: "Zepto",
        sector: "Consumer Internet",
        industry: "Quick Commerce",
        country: "India",
        website: "https://www.zeptonow.com/",
        description: "Zepto is a popular Indian quick-commerce app, but it is not currently a normal exchange-listed equity stock.",
    },
    cred: {
        name: "CRED",
        sector: "Financial Technology",
        industry: "Credit Cards and Consumer Finance App",
        country: "India",
        website: "https://cred.club/",
        description: "CRED is a popular Indian fintech app, but it is not currently a normal exchange-listed equity stock.",
    },
    zerodha: {
        name: "Zerodha",
        sector: "Financial Technology",
        industry: "Stock Broking and Investing Platform",
        country: "India",
        website: "https://zerodha.com/",
        description: "Zerodha is a major Indian investing platform, but it is not currently a normal exchange-listed equity stock.",
    },
    groww: {
        name: "Groww",
        sector: "Financial Technology",
        industry: "Investing and Financial Services App",
        country: "India",
        website: "https://groww.in/",
        description: "Groww is a popular Indian investing and financial services app, but it is not currently a normal exchange-listed equity stock.",
    },
    razorpay: {
        name: "Razorpay",
        sector: "Financial Technology",
        industry: "Payments Infrastructure",
        country: "India",
        website: "https://razorpay.com/",
        description: "Razorpay is a major Indian payments infrastructure company, but it is not currently a normal exchange-listed equity stock.",
    },
    bookmyshow: {
        name: "BookMyShow",
        sector: "Consumer Internet",
        industry: "Entertainment Ticketing",
        country: "India",
        website: "https://in.bookmyshow.com/",
        description: "BookMyShow is a popular Indian entertainment ticketing platform, but it is not currently a normal exchange-listed equity stock.",
    },
    dream11: {
        name: "Dream11",
        sector: "Consumer Internet",
        industry: "Fantasy Sports",
        country: "India",
        website: "https://www.dream11.com/",
        description: "Dream11 is a popular fantasy sports platform, but it is not currently a normal exchange-listed equity stock.",
    },
    lenskart: {
        name: "Lenskart",
        sector: "Consumer Internet",
        industry: "Eyewear Retail",
        country: "India",
        website: "https://www.lenskart.com/",
        description: "Lenskart is a popular Indian eyewear retail platform, but it is not currently a normal exchange-listed equity stock.",
    },
    bigbasket: {
        name: "BigBasket",
        sector: "Consumer Internet",
        industry: "Online Grocery",
        country: "India",
        website: "https://www.bigbasket.com/",
        description: "BigBasket is a popular online grocery platform owned within the Tata group ecosystem, but BigBasket itself is not separately listed as a public equity stock.",
    },
    tataneu: {
        name: "Tata Neu",
        sector: "Consumer Internet",
        industry: "Super App and Digital Commerce",
        country: "India",
        website: "https://www.tatadigital.com/",
        description: "Tata Neu is a Tata Digital super app, but Tata Digital/Tata Neu is not separately listed as a normal public equity stock.",
    },
    olacabs: {
        name: "Ola Cabs",
        sector: "Mobility",
        industry: "Ride Hailing",
        country: "India",
        website: "https://www.olacabs.com/",
        description: "Ola Cabs is a popular ride-hailing app, but it is separate from listed Ola Electric and is not itself a normal exchange-listed equity stock.",
    },
    ola: {
        name: "Ola Cabs",
        sector: "Mobility",
        industry: "Ride Hailing",
        country: "India",
        website: "https://www.olacabs.com/",
        description: "Ola usually refers to Ola Cabs, which is separate from listed Ola Electric and is not itself a normal exchange-listed equity stock. Search 'Ola Electric' for OLAELEC.NS.",
    },
    urbancompany: {
        name: "Urban Company",
        sector: "Consumer Internet",
        industry: "Home Services Marketplace",
        country: "India",
        website: "https://www.urbancompany.com/",
        description: "Urban Company is a popular Indian home-services platform, but it is not currently a normal exchange-listed equity stock.",
    }, bsnl: {
        name: "Bharat Sanchar Nigam Limited",
        sector: "Communication Services",
        industry: "Telecommunications",
        country: "India",
        website: "https://www.bsnl.co.in/",
        description: "BSNL is a Government of India-owned telecommunications company and does not have a normal exchange-listed equity ticker for public stock investing.",
        marketStatus: "Unlisted/Government",
        securityType: "Government-owned unlisted company",
    },
    bharatsancharnigam: {
        name: "Bharat Sanchar Nigam Limited",
        sector: "Communication Services",
        industry: "Telecommunications",
        country: "India",
        website: "https://www.bsnl.co.in/",
        description: "BSNL is a Government of India-owned telecommunications company and does not have a normal exchange-listed equity ticker for public stock investing.",
        marketStatus: "Unlisted/Government",
        securityType: "Government-owned unlisted company",
    },
};
const guidedBotLookups = new Set(["insideiim", "insideim", "altuniailabs"]);
function emptyMetrics() {
    return {
        marketCap: 0,
        revenueGrowthPercent: 0,
        profitMarginPercent: 0,
        debtToEquity: 0,
        peRatio: 0,
        freeCashFlowPositive: false,
        returnOnEquityPercent: 0,
        fiveYearReturnPercent: 0,
    };
}
function buildGuidedBotDataset(companyName) {
    return {
        profile: {
            name: "AI Investment Research Bot",
            ticker: "INVESTABLEBOT",
            exchange: "Project Demo",
            sector: "Artificial Intelligence",
            industry: "Investment Research Assistant",
            country: "India",
            currency: "Unknown",
            description: "A custom project response for InsideIIM, Inside IIM, and Altuni AI Labs searches. This is not a public stock lookup; it highlights the AI bot built under your guidance.",
            marketStatus: "Private Company",
            securityType: "AI project showcase",
            resolvedFrom: companyName.trim(),
            resolutionNote: "This bot works under your guidance. You can consider investing in this AI bot too.",
        },
        metrics: Object.assign(Object.assign({}, emptyMetrics()), { revenueGrowthPercent: 100, profitMarginPercent: 100, debtToEquity: 0, peRatio: 1, freeCashFlowPositive: true, returnOnEquityPercent: 100, fiveYearReturnPercent: 100, returnPeriodLabel: "Project confidence", returnPeriodYears: 1, returnIsFullFiveYear: false, dataWarnings: [
                "Custom guided bot response: public-company core metrics do not apply to this project showcase.",
            ] }),
        news: [
            {
                title: "Custom project signal: AI bot research quality depends on guided reasoning, source checks, and explainable output.",
                source: "Investable project note",
                publishedAt: new Date().toISOString(),
                url: "https://www.insideiim.com/",
                sentiment: "positive",
            },
        ],
        sources: [
            {
                label: "InsideIIM",
                url: "https://www.insideiim.com/",
                note: "Special search trigger requested by the project owner.",
                sourceType: "Official",
                credibility: "Primary",
                useFor: "Show a custom bot-guidance response instead of a normal stock report.",
            },
            {
                label: "Altuni AI Labs Project Context",
                url: "https://www.insideiim.com/",
                note: "Custom project identity used for the AI investment research bot demonstration.",
                sourceType: "Trusted Third Party",
                credibility: "High",
                useFor: "Explain that this response is a project showcase, not financial advice.",
            },
        ],
    };
}
function buildPrivateCompanyDataset(input) {
    var _a, _b;
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
            marketStatus: (_a = input.marketStatus) !== null && _a !== void 0 ? _a : "Private Company",
            securityType: (_b = input.securityType) !== null && _b !== void 0 ? _b : "Private company",
            resolutionNote: input.marketStatus === "Unlisted/Government" ? "Known government-owned unlisted company. No public equity ticker was assigned." : "Known private company. No public ticker was assigned.",
        },
        metrics: emptyMetrics(),
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
function getSpecialCaseCompanyData(companyName) {
    const normalized = normalizeLookup(companyName);
    if (guidedBotLookups.has(normalized)) {
        return buildGuidedBotDataset(companyName);
    }
    const privateCompany = privateCompanies[normalized];
    if (privateCompany) {
        return buildPrivateCompanyDataset(privateCompany);
    }
    return null;
}
