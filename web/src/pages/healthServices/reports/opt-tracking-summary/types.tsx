// types/opt-report.ts
export interface GenderCount {
    Male: number;
    Female: number;
  }
  
  export interface AgeGroupStatus {
    [status: string]: GenderCount;
    Total: GenderCount;
  }
  
  export interface CategoryReport {
    age_groups: {
      [ageGroup: string]: AgeGroupStatus;
    };
    totals: GenderCount;
  }
  
  export interface OPTReport {
    WFA: CategoryReport;
    HFA: CategoryReport;
    WFH: CategoryReport;
    overall_totals: GenderCount;
  }
  
  export interface MonthlyOPTSummary {
    month: string;
    month_name: string;
    record_count: number;
    gender_totals: GenderCount;
  }
  
  export interface OPTSummaryResponse {
    success: boolean;
    data: MonthlyOPTSummary[];
    total_months: number;
    overall_totals: GenderCount;
  }
  
  export interface OPTMonthlyDetailsResponse {
    month: string;
    report: OPTReport;
  }