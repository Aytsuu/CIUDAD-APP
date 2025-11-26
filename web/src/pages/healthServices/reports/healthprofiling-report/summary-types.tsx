export interface HealthProfilingSummaryData {
  // Basic Population Data (reused from PopulationStructureReport)
  projectedPopulation: number;
  actualPopulation: number;
  numberOfFamilies: number;
  numberOfHouseholds: number;
  
  // OPT (Operation Timbang Plus) Data
  optTargets: number;
  optAccomplishments: number;
  
  // Nutritional Status
  nutritionalStatus: {
    normal: {
      male: number;
      female: number;
    };
    underweight: {
      male: number;
      female: number;
    };
    severelyUnderweight: {
      male: number;
      female: number;
    };
    overweight: {
      male: number;
      female: number;
    };
  };
  
  // Health Conditions
  diabetic: number;
  hypertension: number;
  
  // Water Type (reused from PopulationStructureReport)
  waterType: {
    level1: number;
    level2: number;
    level3: number;
  };
  
  // Toilet Type (reused from PopulationStructureReport)
  toiletType: {
    sanitary: number;
    unsanitary: number;
  };
  
  // Family Planning Methods
  familyPlanningMethods: {
    iud: number;
    injectables: number;
    pills: number;
    condom: number;
    nfpLam: number;
    vasectomy: number;
    btl: number;
    implanon: number;
  };
}

export interface HealthProfilingSummaryResponse {
  success: boolean;
  message: string;
  data: HealthProfilingSummaryData;
}
