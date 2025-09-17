export interface FirstAidRecord {
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
  