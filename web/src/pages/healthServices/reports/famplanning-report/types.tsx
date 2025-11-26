export type FPMonthlyRecord = {
  month: string;  // e.g., '2025-11'
  record_count: number;
  month_name: string;  // e.g., 'November 2025'
};

export type FPRecordsResponse = {
  success: boolean;
  data: FPMonthlyRecord[];
  total_records: number;
};