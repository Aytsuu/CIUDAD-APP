// OPT Child Health Record (used in both monthly and semi-annual)
export interface OPTChildHealthRecord {
    date_of_weighing: string;
    age_at_weighing: string;
    weight: string;
    height: string;
    nutritional_status: {
      wfa: string;
      lhfa: string;
      wfl: string;
      muac: string;
      edema: string;
      muac_status: string;
    };
    type_of_feeding: string;
  }
  
  // OPT Year Item
  export interface OPTYearItem {
    year: string;
    year_name: string;
    total_records: number;
    first_semi_count: number;
    second_semi_count: number;
  }
  
  // OPT Years Results
  export interface OPTYearsResults {
    success: boolean;
    data: OPTYearItem[];
    total_years: number;
  }
  
  // OPT Years Response
  export interface OPTYearsResponse {
    count: number;
    next: string | null;
    previous: string | null;
    results: OPTYearsResults;
  }
  
  // Semi-Annual Summary
  export interface SemiAnnualSummary {
    total_children: number;
    children_with_first_semi: number;
    children_with_second_semi: number;
    children_with_both_periods: number;
  }
  
  // Semi-Annual Child Record
  export interface SemiAnnualChildRecord {
    child_id: string;
    household_no: string;
    child_name: string;
    sex: string;
    date_of_birth: string;
    age_in_months: number;
    parents: {
      mother: string;
      father: string;
    };
    address: string;
    sitio: string;
    transient: boolean;
    first_semi_annual: OPTChildHealthRecord | null;
    second_semi_annual: OPTChildHealthRecord | null;
  }
  
  // Semi-Annual Detail Data
  export interface SemiAnnualDetailData {
    year: string;
    summary: SemiAnnualSummary;
    children_data: SemiAnnualChildRecord[];
  }
  
  // Semi-Annual Detail Response
  export interface SemiAnnualDetailResponse {
    count: number;
    next: string | null;
    previous: string | null;
    results: SemiAnnualDetailData;
  }
  
  // OPT Month Item (from your existing code, included for completeness)
  export interface OPTMonthItem {
    month: string;
    month_name: string;
    record_count: number;
  }
  
  // OPT Months Results (from your existing code, included for completeness)
  export interface OPTMonthsResults {
    success: boolean;
    data: OPTMonthItem[];
    total_months: number;
  }
  
  // OPT Months Response (from your existing code, included for completeness)
  export interface OPTMonthsResponse {
    count: number;
    next: string | null;
    previous: string | null;
    results: OPTMonthsResults;
  }
  
  // OPT Monthly Detail Data (from your existing code, included for completeness)
  export interface OPTMonthlyDetailData {
    month: string;
    total_entries: number;
    report_data: OPTChildHealthRecord[];
  }
  
  // OPT Monthly Detail Response (from your existing code, included for completeness)
  export interface OPTMonthlyDetailResponse {
    count: number;
    next: string | null;
    previous: string | null;
    results: OPTMonthlyDetailData;
  }