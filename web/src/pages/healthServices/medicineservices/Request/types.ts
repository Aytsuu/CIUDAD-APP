// types/medicineRequestTypes.ts

export interface Address {
    add_street: string;
    add_barangay: string;
    add_city: string;
    add_province: string;
    sitio: string;
    full_address: string;
  }
  
  export interface PersonalInfo {
    per_id: number;
    per_lname: string;
    per_fname: string;
    per_mname: string | null;
    per_suffix: string | null;
    per_dob: string;
    per_sex: string;
    per_status: string;
    per_edAttainment: string;
    per_religion: string;
    per_contact: string;
  }
  
  export interface MedicineDetail {
    med_name: string;
  }
  
  export interface MedicineInventoryDetails {
    minv_id: number;
    minv_qty_avail:number;
    minv_qty_unit:string;
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
}

export interface MedicineRequestWithItems extends MedicineRequest {
  total_quantity: number;
  items?: MedicineRequestItem[]; // Optional array of items
}