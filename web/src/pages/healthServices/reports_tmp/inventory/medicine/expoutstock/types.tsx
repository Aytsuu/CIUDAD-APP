// types.ts - Add these new interfaces
export interface MedicineExpiredOutOfStockMonthItem {
    month: string;
    month_name: string;
    total_problems: number;
    expired_count: number;
    out_of_stock_count: number;
    expired_out_of_stock_count: number;
  }
  
  export interface MedicineExpiredOutOfStockSummaryResponse {
    count: number;
    next: string | null;
    previous: string | null;
    results: {
      success: boolean;
      data: MedicineExpiredOutOfStockMonthItem[];
      total_months: number;
    };
  }
  
  export interface MedicineProblemItem {
    med_name: string;
    batch_number: string;
    expiry_date: string;
    opening_stock: number;
    received: number;
    dispensed: number;
    closing_stock: number;
    status: string;
  }
  
  export interface MedicineExpiredOutOfStockDetailResponse {
    success: boolean;
    data: {
      month: string;
      summary: {
        total_problems: number;
        expired_count: number;
        out_of_stock_count: number;
        expired_out_of_stock_count: number;
      };
      expired_items: MedicineProblemItem[];
      out_of_stock_items: MedicineProblemItem[];
      expired_out_of_stock_items: MedicineProblemItem[];
      all_problem_items: MedicineProblemItem[];
    };
  }