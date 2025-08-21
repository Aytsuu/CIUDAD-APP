export interface MedicineRecord {
    pat_id?: string;
    fname?: string;
    lname?: string;
    mname?: string;
    sex?: string;
    age?: string;
    householdno?: string;
    street?: string;
    sitio?: string;
    barangay?: string;
    city?: string;
    province?: string;
    pat_type?: string;
    address?: string;
    medicine_count?: number;
    dob?: string;

    medrec_id?: number;
    medrec_qty?: string;
    status?: string;
    req_type?: string;
    reason?: string | null;
    is_archived?: boolean;
    requested_at?: string;
    fulfilled_at?: string | null;
    signature?: string | null;
    patrec_id?: number;
    minv_id?: number;
    minv_details?: {
      minv_id?: number;
      inv_detail?: {
        inv_id?: number;
        expiry_date?: string;
        inv_type?: string;
        created_at?: string;
        is_Archived?: boolean;
        updated_at?: string;
      };
      med_detail?: {
        med_id?: string;
        catlist?: string;
        med_name?: string;
        med_type?: string;
        created_at?: string;
        updated_at?: string;
        cat?: number;
      };
      inv_id?: number;
      med_id?: string;
      minv_dsg?: number;
      minv_dsg_unit?: string;
      minv_form?: string;
      minv_qty?: number;
      minv_qty_unit?: string;
      minv_pcs?: number;
      minv_qty_avail?: number;
    };
}