// getAPI.ts
import { api2 } from "@/api/api";

export interface InventoryDetail {
  inv_id: string;
  expiry_date: string;
  inv_type: string;
  created_at: string;
  is_Archived: boolean;
  updated_at: string;
}

export interface FirstAidDetail {
  fa_id: string;
  catlist: string;
  fa_name: string;
  created_at: string;
  updated_at: string;
  cat: number;
}

export interface FirstAidInventoryDetails {
  finv_id: number;
  inv_detail: InventoryDetail;
  fa_detail: FirstAidDetail;
  inv_id: string;
  fa_id: string;
  finv_qty: number;
  finv_qty_unit: string;
  finv_pcs: number;
  finv_used: number;
  finv_qty_avail: number;
}

export interface FirstAidRecord {
  farec_id: number;
  finv_details: FirstAidInventoryDetails;
  qty: string;
  created_at: string;
  is_archived: boolean;
  reason: string;
  finv: number;
  patrec: number | null;
}

export interface MonthlyRecord {
  month: string;
  record_count: number;
  total_qty: number;
  records: FirstAidRecord[];
}

export interface FirstAidRecordsResponse {
  success: boolean;
  data: MonthlyRecord[];
  total_records: number;
}

export const getFirstaidRecords = async (year?: string): Promise<FirstAidRecordsResponse> => {
  try {
    const url = year
      ? `/firstaid/firstaid-records/monthly/?year=${year}`
      : `/firstaid/firstaid-records/monthly/`;
    const response = await api2.get<FirstAidRecordsResponse>(url);
    return response.data;
  } catch (error) {
    console.error("Error fetching First Aid records:", error);
    throw error;
  }
};

