export type IndicatorType = "wfa" | "lhfa" | "wfh" | "muac" | "bmi";

const descriptions = {
    wfa: {
        SUW: "Severely underweight",
        UW: "Underweight",
        N: "Normal",
        OW: "Overweight"
    },
    lhfa: {
        SST: "Severely stunted",
        ST: "Stunted",
        N: "Normal height for age",
        T: "Tall for age"
    },
    wfh: {
        SW: "Severely wasted",
        W: "Wasted",
        N: "Normal ",
        OW: "Overweight",
        OB: "Obese"
    },
    muac: {
        SAM: "Severe Acute Malnutrition",
        MAM: "Moderate Acute Malnutrition",
        N: "Normal"
    },
    bmi: {
        UW: "Underweight",
        N: "Normal",
        OW: "Overweight",
        OB: "Obese"
    }
};

type BMIStatus = keyof typeof descriptions.bmi;
type WFAStatus = keyof typeof descriptions.wfa;
type LHFAStatus = keyof typeof descriptions.lhfa;
type WFHStatus = keyof typeof descriptions.wfh;
type MUACStatus = keyof typeof descriptions.muac;

function getAgeMonths(per_dob: string, created_at: string): number {
  const dob = new Date(per_dob);
  const created = new Date(created_at);
  let age_months =
    (created.getFullYear() - dob.getFullYear()) * 12 +
    (created.getMonth() - dob.getMonth());
  if (created.getDate() < dob.getDate()) age_months -= 1;
  return age_months;
}

export function getDetailedDescriptionByDates(
  indicator: IndicatorType,
  status: string,
  per_dob: string,
  created_at: string
): string {
  const ageMonths = getAgeMonths(per_dob, created_at);

  if (indicator === "bmi") {
    return descriptions.bmi[status as BMIStatus] || "No data";
  }
  if (ageMonths > 71) {
    return "For ages above 71 months, refer to BMI-for-age or adult BMI classification (WHO).";
  }
  switch (indicator) {
    case "wfa":
      return descriptions.wfa[status as WFAStatus] || "No data";
    case "lhfa":
      return descriptions.lhfa[status as LHFAStatus] || "No data";
    case "wfh":
      return descriptions.wfh[status as WFHStatus] || "No data";
    case "muac":
      return descriptions.muac[status as MUACStatus] || "No data";
    default:
      return "No data";
  }
}

// WHO BMI classification for ages >71 months, adults, seniors
export function getBMICategory(weightKg: number, heightCm: number): { category: string; code: "UW" | "N" | "OW" | "OB"; bmi: number } {
  if (!weightKg || !heightCm) return { category: "No data", code: "N", bmi: 0 };
  const heightM = heightCm / 100;
  const bmi = weightKg / (heightM * heightM);

  if (bmi < 18.5) return { category: "Underweight", code: "UW", bmi };
  if (bmi < 25) return { category: "Normal", code: "N", bmi };
  if (bmi < 30) return { category: "Overweight", code: "OW", bmi };
  return { category: "Obese", code: "OB", bmi };
}