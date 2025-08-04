import { StaffDetails } from "@/pages/healthServices/childservices/viewrecords/types";

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
  patrec_details: {
    pat_details: {
      personal_info: {
        per_fname: string;
        per_mname?: string;
        per_lname: string;
        per_sex: string;
        per_dob: string;
      };
      pat_id: string;
    };
  };
}

export interface MonthlyRecord {
  month: string;
  record_count: number;
  total_qty: number;
  records: FirstAidRecord[];
  monthlyrcplist_id: string;
  report: {
    staff_details: StaffDetails;
    signature: string;
    control_no: string;
    office: string;
  };
}

export interface FirstAidRecordsResponse {
  success: boolean;
  results: {
    data: MonthlyRecord[];
    records: FirstAidRecord[];
    report: {
      staff_details: StaffDetails;
      signature: string;
      control_no: string;
      office: string;
    };
    total_months: number;
    record_count: number;
  };
  total_records?: number;
}