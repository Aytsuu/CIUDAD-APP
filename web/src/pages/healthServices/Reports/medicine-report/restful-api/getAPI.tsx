// getAPI.ts
import { api2 } from "@/api/api";

export interface InventoryDetail {
  inv_id: string | null;
  expiry_date: string | null;
  inv_type: string | null;
  created_at: string | null;
  is_Archived: boolean | null;
  updated_at: string | null;
}

export interface MedicineDetail {
  med_id: string | null;
  catlist: string | null;
  med_name: string | null;
  med_type: string | null;
  created_at: string | null;
  updated_at: string | null;
  cat: number | null;
}

export interface MedicineInventoryDetails {
  minv_id: number;
  inv_detail: InventoryDetail;
  med_detail: MedicineDetail;
  inv_id: string | null;
  med_id: string | null;
  minv_dsg: number;
  minv_dsg_unit: string;
  minv_form: string;
  minv_qty: number;
  minv_qty_unit: string;
  minv_pcs: number;
  minv_distributed: number;
  minv_qty_avail: number;
}

export interface PersonalInfo {
  per_fname: string | null;
  per_lname: string | null;
  per_mname: string | null;
  per_suffix: string | null;
  per_dob: string | null;
  per_sex: string | null;
  per_status: string | null;
  per_edAttainment: string | null;
  per_religion: string | null;
  per_contact: string | null;
}

export interface AddressInfo {
  add_street: string | null;
  add_barangay: string | null;
  add_city: string | null;
  add_province: string | null;
  sitio: string | null;
  full_address: string | null;
}

export interface PatientDetails {
  pat_id: string | null;
  personal_info: PersonalInfo;
  address: AddressInfo;
  pat_type: string | null;
  pat_status: string | null;
  created_at: string | null;
  updated_at: string | null;
}

export interface PatientRecordDetails {
  patrec_id: number | null;
  pat_details: PatientDetails;
  patrec_type: string | null;
  created_at: string | null;
  pat_id: string | null;
}

export interface MedicineRecord {
  medrec_id: number;
  minv_details: MedicineInventoryDetails;
  patrec_details: PatientRecordDetails;
  medrec_qty: number;
  status: string;
  req_type: string;
  reason: string;
  is_archived: boolean;
  requested_at: string | null;
  fulfilled_at: string | null;
  signature: string | null;
  patrec_id: number | null;
  minv_id: number;
}

export interface MonthlyMedicineRecord {
  month: string;
  record_count: number;
  records: MedicineRecord[];
}

export interface MedicineRecordsResponse {
  success: boolean;
  data: MonthlyMedicineRecord[];
  total_records: number;
}

export const getMedicineRecords = async (year?: string): Promise<MedicineRecordsResponse> => {
  try {
    const url = year
      ? `/medicine/medicine-records/monthly/?year=${year}`
      : `/medicine/medicine-records/monthly/`;
    const response = await api2.get<MedicineRecordsResponse>(url);
    return response.data;
  } catch (error) {
    console.error("Error fetching Medicine records:", error);
    throw error;
  }
};