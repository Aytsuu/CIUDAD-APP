export interface VaccineType {
    vaccineName: string;
    intervals: number[];
    timeUnits: string[];
    noOfDoses: number;
    ageGroup: string;
    specifyAge: string;
    type: 'routine' | 'primary';
    routineFrequency?: {
      interval: number;
      unit: string;
    };
  }
  
  export interface VaccineResponse {
    vac_id: number;
    vac_type_choices: string;
    vac_name: string;
    no_of_doses: number;
    age_group: string;
    specify_age: string;
    created_at: string;
    updated_at: string;
    intervals?: IntervalResponse[];
    routine_frequency?: RoutineFrequencyResponse;
  }
  
  export interface IntervalResponse {
    vacInt_id: number;
    vac_id: number;
    interval: number;
    time_unit: string;
  }
  
  export interface RoutineFrequencyResponse {
    routineF_id: number;
    vac_id: number;
    interval: number;
    time_unit: string;
  }



  // src/form-schema/inventory/inventoryStocksSchema.ts
export interface VaccineStockType {
  antigen: string;
  batchNumber: string;
  solvent: "diluent" | "doses";
  volume?: number;
  vialBoxCount: number;
  dosesPcsCount: number;
  expiryDate: string;
}