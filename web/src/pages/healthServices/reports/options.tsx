export const ageRangeOptions = [
  { value: "0-71", label: "All" },
  { value: "0-5", label: "0-5 months" },
  { value: "6-11", label: "6-11 months" },
  { value: "12-23", label: "12-23 months (1-2 years)" },
  { value: "24-35", label: "24-35 months (2-3 years)" },
  { value: "36-47", label: "36-47 months (3-4 years)" },
  { value: "48-59", label: "48-59 months (4-5 years)" },
  { value: "60-71", label: "60-71 months (5-6 years)" }
];

export const nutritionalStatusOptions = [
  { value: "all", label: "All Statuses" },
  { value: "N", label: "Normal" },
  { value: "UW", label: "Underweight" },
  { value: "SUW", label: "Severely Underweight" },
  { value: "ST", label: "Stunted" },
  { value: "SST", label: "Severely Stunted" },
  { value: "W", label: "Wasted" },
  { value: "SW", label: "Severely Wasted" },
  { value: "OW", label: "Overweight" },
  { value: "OB", label: "Obese" },
  { value: "T", label: "Tall" },
  { value: "MAM", label: "Moderate Acute Malnutrition" },
  { value: "SAM", label: "Severe Acute Malnutrition" }
];

export const nutritionalStatusCategories = {
  wfa: ["N", "UW", "SUW", "OW"],
  lhfa: ["N", "ST", "SST", "T"],
  wfh: ["N", "W", "SW", "OW", "OB"],
  muac: ["N", "MAM", "SAM"]
};
