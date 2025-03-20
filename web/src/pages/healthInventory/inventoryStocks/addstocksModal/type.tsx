  export const generateID = (prefix: string) => {
    const now = new Date();
    const month = String(now.getMonth() + 1).padStart(2, "0"); // Ensure two-digit month
    const year = String(now.getFullYear()).slice(-2); // Get last two digits of year
    const randomNum = Math.floor(1000 + Math.random() * 9000); // 4-digit random number
    return `${month}${year}${prefix}${randomNum}`;
  };


export interface MedicineInventoryPayload {

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
  
  export interface InventoryPayload {
    
    inv_type: string;
    expiry_date: string | null;
    created_at: string;
    updated_at: string;
  }
  