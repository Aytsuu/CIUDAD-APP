// First Aid Month Item
export interface FirstAidMonthItem {
  month: string;
  month_name: string;
  total_items: number;
}

// First Aid Months Results
export interface FirstAidMonthsResults {
  success: boolean;
  data: FirstAidMonthItem[];
  total_months: number;
  current_page?: number;
  total_pages?: number;
  next?: string | null;
  previous?: string | null;
}

// First Aid Months Response
export interface FirstAidMonthsResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: FirstAidMonthsResults;
}

// First Aid Inventory Item
export interface FirstAidInventoryItem {
  fa_name: string;
  opening: number;
  received: number;
  dispensed: number;
  closing: number;
  unit: string;
  expiry: string | null;
}

// First Aid Monthly Detail Data
export interface FirstAidMonthlyDetailData {
  month: string;
  inventory_summary: FirstAidInventoryItem[];
  total_items: number;
}

// First Aid Monthly Detail Response
export interface FirstAidMonthlyDetailResponse {
  success: boolean;
  data: FirstAidMonthlyDetailData;
  count?: number;
  next?: string | null;
  previous?: string | null;
}
