// types.ts - Add these new interfaces
export interface VaccinationExpiredOutOfStockMonthItem {
  month: string;
  month_name: string;
  total_problems: number;
  expired_count: number;
  out_of_stock_count: number;
  expired_out_of_stock_count: number;
  near_expiry_count: number;
}

export interface VaccinationExpiredOutOfStockSummaryResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: {
    success: boolean;
    data: VaccinationExpiredOutOfStockMonthItem[];
    total_months: number;
  };
}

export interface VaccinationProblemItem {
  type: string;
  name: string;
  solvent?: string;
  batch_number: string;
  expiry_date: string;
  opening_stock: number;
  received: number;
  dispensed: number;
  wasted: number;
  administered: number;
  closing_stock: number;
  unit: string;
  dose_ml?: number;
  status: string;
}

export interface VaccinationExpiredOutOfStockDetailResponse {
  success: boolean;
  data: {
    month: string;
    summary: {
      total_problems: number;
      expired_count: number;
      out_of_stock_count: number;
      expired_out_of_stock_count: number;
      near_expiry_count: number;
    };
    expired_items: VaccinationProblemItem[];
    out_of_stock_items: VaccinationProblemItem[];
    expired_out_of_stock_items: VaccinationProblemItem[];
    near_expiry_items: VaccinationProblemItem[];
    all_problem_items: VaccinationProblemItem[];
  };
}