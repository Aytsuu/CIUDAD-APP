// types/index.ts
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

export interface Address {
  add_street: string;
  add_barangay: string;
  add_city: string;
  add_province: string;
  add_sitio: string;
  full_address: string;
}

export interface FirstAidRecord {
  pat_id: string;
  firstaid_count: number;
  patient_details: {
    pat_id: string;
    personal_info: PersonalInfo;
    address: Address;
    pat_type: string;
    pat_status: string;
    created_at: string;
    updated_at: string;
    trans_id?: string;
    rp_id?: string;
  };
  pat_type: string;
  pat_status: string;
  updated_at: string;
  trans_id?: string;
  rp_id?: string;

    farec_id: number;
    qty: string;
    created_at: string;
    signature: string;
    reason: string | null;
    finv: number;
    patrec: number;
    finv_details: {
      finv_id: number;
      inv_detail: {
        inv_id: number;
        expiry_date: string;
        inv_type: string;
        created_at: string;
        updated_at: string;
      };
      fa_detail: {
        fa_id: string;
        catlist: string;
        fa_name: string;
        created_at: string;
        updated_at: string;
        cat: number;
      };
      inv_id: number;
      fa_id: string;
      finv_qty: number;
      finv_qty_unit: string;
      finv_pcs: number;
      finv_used: number;
      finv_qty_avail: number;
    };
  }
  
