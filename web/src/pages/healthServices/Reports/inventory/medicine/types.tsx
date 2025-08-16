// types.ts

// Single month summary item
export interface MedicineMonthItem {
    month: string;          // e.g. "2025-08"
    month_name: string;     // e.g. "August 2025"
    total_items: number;
  }
  
  // The inner results data for months list
  export interface MedicineMonthsResults {
    success: boolean;
    data: MedicineMonthItem[];
    total_months: number;
    current_page?: number;
    total_pages?: number;
    next?: string | null;
    previous?: string | null;
  }
  
  // The full paginated API response wrapper for medicine months
  export interface MedicineMonthsResponse {
    count: number;
    next: string | null;
    previous: string | null;
    results: MedicineMonthsResults;
  }
  
  // For monthly medicine records detail

export interface MedicineInventorySummaryItem {
    med_name: string;
    opening: number;
    received: number;
    dispensed: number;
    closing: number;
    unit: string;
    expiry: string | null;
  }
  
  export interface MedicineMonthlyDetailResponse {
    success: boolean;
    data: {
      month: string;
      inventory_summary: MedicineInventorySummaryItem[];
      total_items:string;
    };
  }
  
  
  // Full API response wrapper for monthly medicine records
  export interface MedicineMonthlyDetailResponse {
    count?: number;
    next?: string | null;
    previous?: string | null;
    results: MedicineMonthItem;
  }
  