// types.ts

// Single commodity month summary item
export interface CommodityMonthItem {
    month: string; // e.g. "2025-08"
    month_name: string; // e.g. "August 2025"
    total_items: number;
  }
  
  // Inner results data for commodity months list
  export interface CommodityMonthsResults {
    success: boolean;
    data: CommodityMonthItem[];
    total_months: number;
    current_page?: number;
    total_pages?: number;
    next?: string | null;
    previous?: string | null;
  }
  
  // Full paginated API response wrapper for commodity months
  export interface CommodityMonthsResponse {
    count: number;
    next: string | null;
    previous: string | null;
    results: CommodityMonthsResults;
  }
  
  // Inventory summary item for commodity monthly details
  export interface CommodityInventorySummaryItem {
    com_name: string;
    opening: number;
    received: number;
    received_from: string | null;
    dispensed: number;
    closing: number;
    unit: string;
    expiry: string | null;
  }
  
  // Monthly commodity records detail response
  export interface CommodityMonthlyDetailResponse {
    success: boolean;
    data: {
      month: string;
      inventory_summary: CommodityInventorySummaryItem[];
      total_items: number;
    };
  }
  