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
  created_at: string;
}

export interface MedicineTransactionType {
  mdt_qty: string;
  mdt_action: string;
  mdt_staff: number;
  minv_id: number;
}

export interface CommodityTransactionType {
  comt_qty: string;
  comt_action: string;
  staff: number;
  cinv_id: number;
}

export interface FirstAidTransactionType {
  fat_qty: string;
  fat_action: string;
  staff: number;
  finv_id: number;
}

export interface CommodityStockType {
  com_id: number;
  cat_id: number;
  cinv_qty: number;
  cinv_qty_unit: string;
  cinv_pcs: number;
  cinv_qty_avail: number;
  cinv_dispensed: number;
  cinv_recevFrom: string;
  expiryDate: string;
  inv_id: number;
}

export interface FirstAidStockType {
  fa_id: number;
  cat_id: number;
  finv_qty: number;
  finv_qty_unit: string;
  finv_pcs: number;
  finv_qty_avail: number;
  finv_used: number;
  expiryDate: string;
  inv_id: number;
}
