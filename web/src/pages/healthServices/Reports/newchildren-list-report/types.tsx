// types.ts
export interface MonthlyChildrenCount {
  year: number;
  month: number;
  month_name: string;
  year_month: string;
  count: number;
}

export interface MonthlyChildrenResponse {
  success: boolean;
  data: MonthlyChildrenCount[];
  total_months: number;
}

export interface ChildDetail {
  record_id: number;
  created_at: string;
  household_no: string;
  child_name: string;
  sex: string;
  date_of_birth: string;
  age_in_months: number;
  parents: {
    mother: string;
    father?: string;
  };
  address: string;
  sitio: string;
}

export interface MonthlyChildrenDetailResponse {
  success: boolean;
  month: string;
  total_records: number;
  records: ChildDetail[];
}