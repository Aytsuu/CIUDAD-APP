// OPT Monthly Child Record
// OPT Year Item
export interface OPTYearItem {
    year: string;
    year_name: string;
    total_records: number;
    yearly_count: number; // Changed from first_semi_count/second_semi_count to match your API response
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


export interface OPTMonthlyChildRecord {
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
    monthly_data: {
      [month: string]: {
        measurement_exists: boolean;
        date_of_weighing: string | null;
        age_at_weighing: number | null;
        weight: string | null;
        height: string | null;
        nutritional_status: {
          wfa: string | null;
          lhfa: string | null;
          wfl: string | null;
          muac: string | null;
          edema: string | null;
          muac_status: string | null;
        } | null;
        type_of_feeding: string | null;
      };
    };
  }
  
  // OPT Yearly Detail Data
  export interface OPTYearlyDetailData {
    year: string;
    children_data: OPTMonthlyChildRecord[];
  }
  
  // OPT Yearly Detail Response
  export interface OPTYearlyDetailResponse {
    count: number;
    next: string | null;
    previous: string | null;
    results: OPTYearlyDetailData;
  }