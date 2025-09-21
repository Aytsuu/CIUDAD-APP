// types/medicineRequestTypes.ts

export interface Address {
  add_street: string;
  add_barangay: string;
  add_city: string;
  add_province: string;
  sitio: string;
  full_address: string;
}



export interface MedicineDetail {
  med_name: string;
}

export interface MedicineInventoryDetails {
  minv_id: number;
  minv_qty_avail: number;
  minv_qty_unit: string;
  med_detail: MedicineDetail;
}

export interface MedicineRequestItem {
  medreqitem_id: number;
  medreqitem_qty: number;
  reason: string | null;
  minv_details: MedicineInventoryDetails | null;
}

export interface MedicineRequestDetailProps {
  medreq_id: number;
  address: Address | null;
  personal_info: PersonalInfo;
  requested_at: string;
  fullfilled_at: string | null;
  status: string;
  rp_id: string | null;
  pat_id: string | null;
}



export interface MedicineRequest {
  medreq_id: number;
  address: Address | null;
  personal_info: PersonalInfo;
  requested_at: string;
  fullfilled_at: string | null;
  status: string;
  rp_id: string | null;
  pat_id: string | null;
  total_quantity?: number;

}

export interface MedicineRequestWithItems extends MedicineRequest {
  total_quantity: number;
  items?: MedicineRequestItem[]; // Optional array of items
}



// PENDING
// types/medicine-request.ts
export interface PersonalInfo {
  per_fname: string;
  per_lname: string;
  per_mname: string;
  per_suffix: string;
  per_dob: string;
  per_sex: string;
  per_status: string;
  per_edAttainment: string;
  per_religion: string;
  per_contact: string;
}

export interface MedicineRequestPending {
  medreq_id: number;
  address: string | null;
  personal_info: PersonalInfo;
  total_quantity: number;
  requested_at: string;
  status: string;
  rp_id: string | null;
  pat_id: string;
}

// types.ts
export interface MedicineRequestPendingResponse {
  success: boolean;
  results: MedicineRequestPending[];
  count: number;
  next?: string;
  previous?: string;
}