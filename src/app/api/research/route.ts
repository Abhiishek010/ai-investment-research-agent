import { NextResponse } from "next/server";
import { z } from "zod";
import { runInvestmentResearch } from "@/lib/investment/agent";
import { MAX_COMPANY_NAME_LENGTH, sanitizeCompanyNameInput } from "@/lib/investment/inputSanitizer";

const ResearchRequest = z.object({
  companyName: z
    .string()
    .transform((value) => sanitizeCompanyNameInput(value))
    .pipe(z.string().min(2).max(MAX_COMPANY_NAME_LENGTH)),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { companyName } = ResearchRequest.parse(body);
    const report = await runInvestmentResearch(companyName);

    return NextResponse.json({ report });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Unable to complete investment research.";

    return NextResponse.json(
      {
        error: message,
      },
      { status: 400 },
    );
  }
}
