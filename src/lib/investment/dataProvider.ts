import type { DataProviderResult } from "./dataProviderTypes";
import { getLiveCompanyData, hasLiveDataProvider } from "./liveDataProvider";
import { getSampleCompanyData } from "./sampleData";
import { getSpecialCaseCompanyData } from "./specialCases";

export async function getCompanyData(companyName: string): Promise<DataProviderResult> {
  const specialCaseData = getSpecialCaseCompanyData(companyName);

  if (specialCaseData) {
    return {
      ...specialCaseData,
      provider: specialCaseData.profile.ticker === "PRIVATE" ? "limited" : "sample",
    };
  }

  if (hasLiveDataProvider()) {
    try {
      const liveData = await getLiveCompanyData(companyName);

      if (liveData) {
        return {
          ...liveData,
          provider: "live",
        };
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown live provider error.";
      console.warn(`Live data provider failed, falling back to sample provider. ${message}`);
    }
  }

  const sampleData = getSampleCompanyData(companyName);

  return {
    ...sampleData,
    provider: sampleData.profile.ticker === "UNKNOWN" ? "limited" : "sample",
  };
}



