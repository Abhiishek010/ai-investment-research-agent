from pathlib import Path

from reportlab.lib import colors
from reportlab.lib.enums import TA_LEFT
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import inch
from reportlab.platypus import (
    Flowable,
    KeepTogether,
    ListFlowable,
    ListItem,
    PageBreak,
    Paragraph,
    SimpleDocTemplate,
    Spacer,
    Table,
    TableStyle,
)


ROOT = Path(__file__).resolve().parents[1]
OUTPUT = ROOT / "output" / "pdf" / "OPEN_THIS_UPDATED_FMP_YAHOO_AGENT_PDF.pdf"


class Rule(Flowable):
    def __init__(self, color=colors.HexColor("#D5D9D0"), thickness=1):
        super().__init__()
        self.color = color
        self.thickness = thickness
        self.height = 8

    def wrap(self, avail_width, avail_height):
        self.width = avail_width
        return avail_width, self.height

    def draw(self):
        self.canv.setStrokeColor(self.color)
        self.canv.setLineWidth(self.thickness)
        self.canv.line(0, self.height / 2, self.width, self.height / 2)


def bullet_items(items, style):
    return ListFlowable(
        [ListItem(Paragraph(item, style), leftIndent=10) for item in items],
        bulletType="bullet",
        start="circle",
        leftIndent=16,
        bulletFontName="Helvetica",
        bulletFontSize=8,
        bulletOffsetY=2,
    )


def code_block(text, style):
    lines = "<br/>".join(text.splitlines())
    table = Table([[Paragraph(lines, style)]], colWidths=[6.8 * inch])
    table.setStyle(
        TableStyle(
            [
                ("BACKGROUND", (0, 0), (-1, -1), colors.HexColor("#F3F5F0")),
                ("BOX", (0, 0), (-1, -1), 0.6, colors.HexColor("#D5D9D0")),
                ("LEFTPADDING", (0, 0), (-1, -1), 10),
                ("RIGHTPADDING", (0, 0), (-1, -1), 10),
                ("TOPPADDING", (0, 0), (-1, -1), 8),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 8),
            ]
        )
    )
    return table


def section(title, body_flowables):
    return [
        KeepTogether(
            [
                Spacer(1, 14),
                Paragraph(title, STYLES["SectionTitle"]),
                Rule(),
                Spacer(1, 4),
                *body_flowables,
            ]
        )
    ]


def footer(canvas, doc):
    canvas.saveState()
    width, _ = A4
    canvas.setFont("Helvetica", 8)
    canvas.setFillColor(colors.HexColor("#6D756B"))
    canvas.drawString(doc.leftMargin, 0.42 * inch, "AI Investment Research Agent - Interview Submission")
    canvas.drawRightString(width - doc.rightMargin, 0.42 * inch, f"Page {doc.page}")
    canvas.restoreState()


styles = getSampleStyleSheet()
STYLES = {
    "Title": ParagraphStyle(
        "Title",
        parent=styles["Title"],
        fontName="Helvetica-Bold",
        fontSize=29,
        leading=34,
        textColor=colors.HexColor("#050805"),
        alignment=TA_LEFT,
        spaceAfter=8,
    ),
    "Subtitle": ParagraphStyle(
        "Subtitle",
        parent=styles["BodyText"],
        fontName="Helvetica",
        fontSize=12.5,
        leading=18.5,
        textColor=colors.HexColor("#050805"),
        spaceAfter=12,
    ),
    "SectionTitle": ParagraphStyle(
        "SectionTitle",
        parent=styles["Heading2"],
        fontName="Helvetica-Bold",
        fontSize=19,
        leading=23,
        textColor=colors.HexColor("#050805"),
        spaceAfter=2,
    ),
    "Body": ParagraphStyle(
        "Body",
        parent=styles["BodyText"],
        fontName="Helvetica",
        fontSize=12,
        leading=17.4,
        textColor=colors.HexColor("#050805"),
        spaceAfter=7,
    ),
    "Bullet": ParagraphStyle(
        "Bullet",
        parent=styles["BodyText"],
        fontName="Helvetica",
        fontSize=11.5,
        leading=16.8,
        textColor=colors.HexColor("#050805"),
        spaceAfter=4,
    ),
    "Small": ParagraphStyle(
        "Small",
        parent=styles["BodyText"],
        fontName="Helvetica",
        fontSize=10,
        leading=14,
        textColor=colors.HexColor("#050805"),
    ),
    "Code": ParagraphStyle(
        "Code",
        parent=styles["Code"],
        fontName="Courier",
        fontSize=10.2,
        leading=14,
        textColor=colors.HexColor("#050805"),
    ),
    "CardTitle": ParagraphStyle(
        "CardTitle",
        parent=styles["BodyText"],
        fontName="Helvetica-Bold",
        fontSize=11,
        leading=14.5,
        textColor=colors.HexColor("#050805"),
        spaceAfter=3,
    ),
}


def example_table():
    rows = [
        [
            Paragraph("<b>Input</b>", STYLES["Small"]),
            Paragraph("<b>Verdict</b>", STYLES["Small"]),
            Paragraph("<b>Score</b>", STYLES["Small"]),
            Paragraph("<b>Agent output summary</b>", STYLES["Small"]),
        ],
        [
            Paragraph("Microsoft", STYLES["Small"]),
            Paragraph("Invest", STYLES["Small"]),
            Paragraph("87/100, 97% confidence", STYLES["Small"]),
            Paragraph(
                "Strong revenue growth, high margins, low leverage, positive free cash flow, and very strong five-year return. Valuation still needs execution, but the overall case is strong.",
                STYLES["Small"],
            ),
        ],
        [
            Paragraph("Apple", STYLES["Small"]),
            Paragraph("Watchlist", STYLES["Small"]),
            Paragraph("74/100, 93% confidence", STYLES["Small"]),
            Paragraph(
                "Good profitability and cash flow, but slower growth, elevated leverage, and some negative/regulatory news make it a more cautious watchlist case.",
                STYLES["Small"],
            ),
        ],
        [
            Paragraph("NVIDIA", STYLES["Small"]),
            Paragraph("Invest", STYLES["Small"]),
            Paragraph("96/100, 100% confidence", STYLES["Small"]),
            Paragraph(
                "Very strong growth, profit margin, source coverage, and long-term return. The main risk called out is high valuation.",
                STYLES["Small"],
            ),
        ],
        [
            Paragraph("Tesla", STYLES["Small"]),
            Paragraph("Pass", STYLES["Small"]),
            Paragraph("57/100, 87% confidence", STYLES["Small"]),
            Paragraph(
                "Positive free cash flow and controlled debt help, but valuation is demanding, margin is thin, and recent signals make the investment case weaker.",
                STYLES["Small"],
            ),
        ],
        [
            Paragraph("OpenAI", STYLES["Small"]),
            Paragraph("Research Needed", STYLES["Small"]),
            Paragraph("42/100, 0% confidence", STYLES["Small"]),
            Paragraph(
                "The bot recognizes OpenAI as a private company and refuses to treat it like a normal exchange-listed stock with public market financials.",
                STYLES["Small"],
            ),
        ],
        [
            Paragraph("FakeXYZ Capital", STYLES["Small"]),
            Paragraph("Research Needed", STYLES["Small"]),
            Paragraph("0/100, 0% confidence", STYLES["Small"]),
            Paragraph(
                "The bot cannot verify a ticker, exchange, filing, ETF, parent company, or known private-company match, so it assigns zero trust instead of guessing.",
                STYLES["Small"],
            ),
        ],
    ]
    table = Table(rows, colWidths=[1.1 * inch, 1.0 * inch, 1.35 * inch, 3.35 * inch], repeatRows=1)
    table.setStyle(
        TableStyle(
            [
                ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#E5EADF")),
                ("TEXTCOLOR", (0, 0), (-1, 0), colors.HexColor("#1F2A21")),
                ("GRID", (0, 0), (-1, -1), 0.45, colors.HexColor("#D5D9D0")),
                ("VALIGN", (0, 0), (-1, -1), "TOP"),
                ("LEFTPADDING", (0, 0), (-1, -1), 6),
                ("RIGHTPADDING", (0, 0), (-1, -1), 6),
                ("TOPPADDING", (0, 0), (-1, -1), 6),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
                ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.white, colors.HexColor("#FAFBF7")]),
            ]
        )
    )
    return table


def build_story():
    story = [
        Paragraph("AI Investment Research Agent", STYLES["Title"]),
        Rule(colors.HexColor("#9FA991"), 1.2),
    ]

    story.extend(
        section(
            "Overview - what it does",
            [
                Paragraph(
                    "The project is a beginner-friendly AI investment research agent called Investable. A user enters a company name or ticker, and the app returns a simple investment verdict first: Invest, Watchlist, Pass, or Research Needed.",
                    STYLES["Body"],
                ),
                Paragraph(
                    "The report explains the answer in plain English and then lets the user open deeper research: investment scale, risk scale, growth score, return check, source trust, strengths, risks, recent news, and the sources that were checked.",
                    STYLES["Body"],
                ),
                bullet_items(
                    [
                        "It can use live market data through Financial Modeling Prep when an API key is configured.",
                        "If no key is present, it safely falls back to deterministic sample data for companies such as Microsoft, Apple, NVIDIA, and Tesla.",
                        "It handles important edge cases such as private companies, unlisted/government companies, subsidiaries/brands, ETFs/funds, and completely unverified names.",
                        "It avoids presenting the result as financial advice. The product is a research assistant, not a trading or price-prediction tool.",
                    ],
                    STYLES["Bullet"],
                ),
            ],
        )
    )

    story.extend(
        section(
            "How it works - how the bot thinks and verifies information",
            [
                Paragraph(
                    "The bot does not randomly generate an investment answer. It follows a research process similar to how a careful analyst would think. First, it understands the company name or ticker entered by the user, cleans the input, and checks whether the company is public, private, unlisted, a subsidiary/brand, an ETF, or an unverified name.",
                    STYLES["Body"],
                ),
                Paragraph(
                    "After identifying the company, the bot collects market and financial information from Financial Modeling Prep and Yahoo Finance. Financial Modeling Prep is used for structured company data such as profile, ticker, market data, financial statements, ratios, key metrics, and news where available. Yahoo Finance is used as a trusted fallback and cross-check source for quote data, market cap style fields, long-term return checks, and cases where FMP data is missing, delayed, or incomplete.",
                    STYLES["Body"],
                ),
                Paragraph(
                    "The bot verifies information by comparing identity, ticker, exchange, financial metrics, return data, and source quality. It gives more trust to official sources such as company investor relations and SEC EDGAR, then uses trusted third-party sources such as Yahoo Finance, Reuters, Morningstar, Nasdaq, and FMP to reduce single-source bias.",
                    STYLES["Body"],
                ),
                Paragraph(
                    "If the data is complete and consistent, the bot calculates a clear score using financial health, growth, valuation, return performance, news sentiment, risk control, and source quality. If the data is missing, confusing, or not verified, the bot lowers confidence, adds warnings, or returns Research Needed instead of pretending to be accurate.",
                    STYLES["Body"],
                ),
                Paragraph(
                    "This is how the bot stays reliable: it does not claim guaranteed stock prediction accuracy. Its accuracy comes from verified company identity, FMP and Yahoo cross-checking, transparent scoring, source labels, and confidence reduction when information is incomplete. In simple words, the bot is accurate as a research assistant because it knows when to answer confidently, when to warn the user, and when not to trust the input.",
                    STYLES["Body"],
                ),
            ],
        )
    )
    story.extend(
        section(
            "How to run it - setup and run steps",
            [
                Paragraph(
                    "The project is already deployed on Vercel, so reviewers do not need to install anything to try the bot.",
                    STYLES["Body"],
                ),
                Paragraph(
                    "Open the live app, enter a company name or ticker, and click Check to start using the AI investment research bot.",
                    STYLES["Body"],
                ),
                code_block(
                    "Live Vercel app:\nhttps://ai-investment-research-agent-rho-wine.vercel.app/",
                    STYLES["Code"],
                ),
            ],
        )
    )

    story.extend(
        section(
            "Key decisions and trade-offs",
            [
                bullet_items(
                    [
                        "I chose deterministic scoring for the investment verdict because it is easier to test, explain, and defend in an interview than a black-box LLM answer.",
                        "I used LangGraph because the research process has natural steps: identify the company, collect evidence, score it, and explain the decision.",
                        "I kept live data optional. This makes the project demoable even without paid data access, while still supporting real providers through environment keys.",
                        "I added source-quality labels because investment research needs traceability. Official sources and trusted third-party sources carry more weight than opinion blogs.",
                        "I included private/unlisted/unverified-company handling because a useful research assistant should know when not to give an investment answer.",
                        "I left out brokerage integration, personalized portfolio advice, guaranteed price prediction, and fully automated buy/sell calls because those would be risky and outside the project scope.",
                    ],
                    STYLES["Bullet"],
                )
            ],
        )
    )

    story.append(PageBreak())
    story.extend(
        section(
            "Example runs - agent output",
            [
                Paragraph(
                    "These examples come from the current deterministic sample-data path, so they work even when no live financial-data key is configured.",
                    STYLES["Body"],
                ),
                example_table(),
            ],
        )
    )

    story.extend(
        section(
            "What I would improve with more time",
            [
                bullet_items(
                    [
                        "Add a richer LLM reasoning node on top of verified structured data, while keeping the deterministic scoring engine as the decision backbone.",
                        "Expand live provider coverage and add more provider-specific tests for Indian equities, ETFs, parent-company mappings, and newly listed companies.",
                        "Store past research reports so users can compare how a company verdict changes over time.",
                        "Add watchlist and comparison views so users can evaluate multiple companies side by side.",
                        "Improve news sentiment with a more robust model and source ranking instead of simple positive/negative keyword rules.",
                        "Add more automated UI tests around PDF export, mobile layout, and error states.",
                        "Include a clearer admin/debug view showing exactly which provider fields were used, which fallbacks were applied, and why confidence changed.",
                    ],
                    STYLES["Bullet"],
                ),
                Paragraph(
                    "My main improvement goal would be to make the agent more accurate without making it less explainable. The project is intentionally positioned as disciplined research support, not as a promise of market prediction accuracy.",
                    STYLES["Body"],
                ),
            ],
        )
    )

    story.extend(
        section(
            "Builder experience - my perspective",
            [
                Paragraph(
                    "As I am a cybersecurity student with strong enthusiasm for using AI and building meaningful products, I try to connect AI with real-world problem solving. In my resume, I have a project named CourierBuddy, which solves a real campus problem and is currently used by more than 1000 users on the LPU campus.",
                    STYLES["Body"],
                ),
                Paragraph(
                    "I am mentioning CourierBuddy here to show that this investment research chatbot is not my first time building something practical with AI. I already have prior experience building a full production-level project, taking it to real users, and securing it using my ethical hacking and cybersecurity knowledge.",
                    STYLES["Body"],
                ),
                Paragraph(
                    "I enjoyed building this chatbot a lot because it allowed me to combine AI product thinking with my cybersecurity mindset. I would say my resume may not align perfectly with a traditional AI Engineer profile yet, but I am constantly improving and learning by building.",
                    STYLES["Body"],
                ),
                Paragraph(
                    "During vibe coding or while building any app, my main focus is always application security, reliability, and user experience. What I believe is simple: building an app or website using AI is not a big deal in 2026, but building a secure and reliable app using AI matters the most in this era of technology.",
                    STYLES["Body"],
                ),
                Paragraph(
                    "As a result, I do not just build products. I build secure and reliable products. I would request reviewers to look at my resume project CourierBuddy to understand my perspective, my logic-building approach, and the way I think about useful AI-powered products.",
                    STYLES["Body"],
                ),
            ],
        )
    )
    return story


def main():
    OUTPUT.parent.mkdir(parents=True, exist_ok=True)
    doc = SimpleDocTemplate(
        str(OUTPUT),
        pagesize=A4,
        rightMargin=0.7 * inch,
        leftMargin=0.7 * inch,
        topMargin=0.65 * inch,
        bottomMargin=0.7 * inch,
        title="AI Investment Research Agent - Interview Submission",
        author="Abhishek Yadav",
    )
    doc.build(build_story(), onFirstPage=footer, onLaterPages=footer)
    print(OUTPUT)


if __name__ == "__main__":
    main()
