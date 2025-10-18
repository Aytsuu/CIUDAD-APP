// src/utils/bmi-categories.ts

export const getBMICategory = (bmi: number, age: number): string => {
  // For adults (18+ years)
  if (age >= 18) {
    if (bmi < 16.0) return "(SUW) - Severely Underweight";
    if (bmi < 17.0) return "(UW) - Underweight";
    if (bmi < 18.5) return "(UW) - Mildly Underweight";
    if (bmi < 25.0) return "(N) - Normal";
    if (bmi < 30.0) return "(OW) - Overweight";
    if (bmi < 35.0) return "(OB) - Obese Class I";
    if (bmi < 40.0) return "(OB) - Obese Class II";
    return "(OB) - Obese Class III";
  }

  // For children (under 18 years)
  if (bmi < 15) return "(SW) - Severely Wasted";
  if (bmi < 17) return "(W) - Wasted";
  if (bmi < 23) return "(N) - Normal";
  if (bmi < 27) return "(OW) - Overweight";
  return "(OB) - Obese";
};

export const getHeightForAgeCategory = (zScore: number): string => {
  if (zScore < -3) return "(SST) - Severely Stunted";
  if (zScore < -2) return "(ST) - Stunted";
  if (zScore <= 2) return "(N) - Normal";
  return "(T) - Tall";
};

export const calculateBMI = (height: number, weight: number): number => {
  if (height <= 0 || weight <= 0) return 0;
  const heightInMeters = height / 100;
  return weight / (heightInMeters * heightInMeters);
};
