// types.ts
export interface SupplementRecord {
  date: string;
  age_months: number;
  medicine: string;
  category: string;
}

export interface VitaminASupplement {
  "6-11": string | null;
  "12-23": { "1st_dose": string | null; "2nd_dose": string | null };
  "24-35": { "1st_dose": string | null; "2nd_dose": string | null };
  "36-47": { "1st_dose": string | null; "2nd_dose": string | null };
  "48-59": { "1st_dose": string | null; "2nd_dose": string | null };
}

export interface DewormingSupplement {
  "12-23": { "1st_dose": string | null; "2nd_dose": string | null };
  "24-59": { "1st_dose": string | null; "2nd_dose": string | null };
}

export interface MNPSupplement {
  "6-11": string[];
  "12-23": string[];
}

export interface ChildSupplementData {
  vitamin_a: VitaminASupplement;
  deworming: DewormingSupplement;
  mnp: MNPSupplement;
  all_supplements: SupplementRecord[];
}

export interface ChildHealthRecord {
  date_registered: string;
  child_name: string;
  mother_name: string;
  current_age_months: number;
  address: string;
  date_of_birth: string;
  sex: string;
  sitio: string;
  family_no: string;
  supplements: ChildSupplementData;
  type_of_feeding: string;
}

// Standard paginated response
export interface ChildHealthSupplementsReportResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: ChildHealthRecord[];
}

// Export response (when export=true)
export interface ChildHealthSupplementsExportResponse {
  results: ChildHealthRecord[];
  count: number;
  export: true;
}

// Alternative response format (if your backend sometimes returns this)
export interface ChildHealthSupplementsAlternativeResponse {
  total_children: number;
  children: ChildHealthRecord[];
}

// Union type for all possible responses
export type ChildHealthSupplementsResponse = ChildHealthSupplementsReportResponse | ChildHealthSupplementsExportResponse | ChildHealthSupplementsAlternativeResponse;
