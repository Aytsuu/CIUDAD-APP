// types.ts - Add these new interfaces
export interface FirstAidExpiredOutOfStockMonthItem {
  month: string;
  month_name: string;
  total_problems: number;
  expired_count: number;
  out_of_stock_count: number;
  expired_out_of_stock_count: number;
  near_expiry_count: number;
}

export interface FirstAidExpiredOutOfStockSummaryResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: {
    success: boolean;
    data: FirstAidExpiredOutOfStockMonthItem[];
    total_months: number;
  };
}

export interface FirstAidProblemItem {
  fa_name: string;
  expiry_date: string;
  opening_stock: number;
  received: number;
  dispensed: number;
  closing_stock: number;
  unit: string;
  status: string;
}

export interface FirstAidExpiredOutOfStockDetailResponse {
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
    expired_items: FirstAidProblemItem[];
    out_of_stock_items: FirstAidProblemItem[];
    expired_out_of_stock_items: FirstAidProblemItem[];
    near_expiry_items: FirstAidProblemItem[];
    all_problem_items: FirstAidProblemItem[];
  };
}