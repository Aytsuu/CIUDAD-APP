// types.ts - Add these new interfaces
export interface CommodityExpiredOutOfStockMonthItem {
  month: string;
  month_name: string;
  total_problems: number;
  expired_count: number;
  out_of_stock_count: number;
  expired_out_of_stock_count: number;
  near_expiry_count: number;
}

export interface CommodityExpiredOutOfStockSummaryResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: {
    success: boolean;
    data: CommodityExpiredOutOfStockMonthItem[];
    total_months: number;
  };
}

export interface CommodityProblemItem {
  com_name: string;
  expiry_date: string;
  opening_stock: number;
  received: number;
  dispensed: number;
  closing_stock: number;
  unit: string;
  received_from: string;
  status: string;
}

export interface CommodityExpiredOutOfStockDetailResponse {
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
    expired_items: CommodityProblemItem[];
    out_of_stock_items: CommodityProblemItem[];
    expired_out_of_stock_items: CommodityProblemItem[];
    near_expiry_items: CommodityProblemItem[];
    all_problem_items: CommodityProblemItem[];
  };
}