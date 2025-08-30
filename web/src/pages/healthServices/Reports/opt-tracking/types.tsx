// OPT Month Item
export interface OPTMonthItem {
    month: string;
    month_name: string;
    record_count: number;
  }
  
  // OPT Months Results
  export interface OPTMonthsResults {
    success: boolean;
    data: OPTMonthItem[];
    total_months: number;
  }
  
  // OPT Months Response
  export interface OPTMonthsResponse {
    count: number;
    next: string | null;
    previous: string | null;
    results: OPTMonthsResults;
  }
  
  // OPT Child Health Record
  export interface OPTChildHealthRecord {
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
  
  // OPT Monthly Detail Data
  export interface OPTMonthlyDetailData {
    month: string;
    total_entries: number;
    report_data: OPTChildHealthRecord[];
  }
  
  // OPT Monthly Detail Response
  export interface OPTMonthlyDetailResponse {
    count: number;
    next: string | null;
    previous: string | null;
    results: OPTMonthlyDetailData;
  }