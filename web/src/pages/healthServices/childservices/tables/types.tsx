
export type NutritionStatus = {
    wfa: string;
    lhfa: string;
    wfl: string;
    muac: string;
    edemaSeverity: string;
  };
  
  export type ChrRecords = {
    chrec_id: number;
    chhist_id: number;
    id: number;
    age: string;
    wt: number;
    ht: number;
    bmi: string;
    latestNote: string | null;
    followUpDescription: string;
    followUpDate: string;
    followUpStatus: string;
    vaccineStat: string;
    nutritionStatus: NutritionStatus;
    updatedAt: string;
    rawCreatedAt: string;
    status: string;
  };