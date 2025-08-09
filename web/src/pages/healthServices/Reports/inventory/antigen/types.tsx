// Vaccine Month Item
export interface VaccineMonthItem {
    month: string;
    month_name: string;
    total_items: number;
    vaccine_items: number;
    immunization_items: number;
  }
  
  // Vaccine Months Results
  export interface VaccineMonthsResults {
    success: boolean;
    data: VaccineMonthItem[];
    total_months: number;
    current_page?: number;
    total_pages?: number;
    next?: string | null;
    previous?: string | null;
  }
  
  // Vaccine Months Response
  export interface VaccineMonthsResponse {
    count: number;
    next: string | null;
    previous: string | null;
    results: VaccineMonthsResults;
  }
  
  // Vaccine Inventory Item
  export interface VaccineInventoryItem {
    id: number;
    type: 'vaccine' | 'immunization';
    name: string;
    batch_number: string;
    solvent?: string;
    opening: number | string;
    received: number | string;
    dispensed: number | string;
    wasted: number | string;
    administered: number | string;
    closing: number | string;
    unit: string;
    dose_ml?: number;
    expiry: string;
    expired_this_month: boolean;
  }
  
  // Vaccine Monthly Detail Data
  export interface VaccineMonthlyDetailData {
    month: string;
    inventory_summary: VaccineInventoryItem[];
    total_items: number;
    vaccine_items: number;
    immunization_items: number;
  }
  
  // Vaccine Monthly Detail Response
  export interface VaccineMonthlyDetailResponse {
    success: boolean;
    data: VaccineMonthlyDetailData;
    count?: number;
    next?: string | null;
    previous?: string | null;
  }