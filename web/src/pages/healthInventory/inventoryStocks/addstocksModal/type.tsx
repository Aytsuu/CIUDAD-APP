
export interface MedicineStockType {
    minv_dsg: number;
    minv_dsg_unit: string;
    minv_form: string;
    minv_qty: number;
    minv_qty_unit: string;
    minv_pcs: number;
    minv_distributed: number;
    minv_qty_avail: number;
    inv_id: number;
    med_id: number;
    cat_id: number;
  }
  
  export interface InventoryType {
    
    inv_type: string;
    expiry_date: string | null;
    created_at: string;
    updated_at: string;
  }
  
  export interface AddMedicineStockType {
    mdt_qty: string;
    mdt_action: string;
    minv_qty: string;
    minv_qty_avail: string;
    created_at:string
   
  }
  