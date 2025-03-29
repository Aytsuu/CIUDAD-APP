import { MedicineStockType, CommodityStockType ,FirstAidStockType} from "../REQUEST/type";
 
export const MedicinePayload = (
  data: any, // Replace with the correct type if available
  inv_id: number
): MedicineStockType => {
  const qty = Number(data.qty) || 0;
  const pcs = Number(data.pcs) || 0;
  const minv_qty_avail = data.unit === "boxes" ? qty * pcs : qty;
  const med_id = parseInt(data.medicineID, 10);

  return {
    minv_dsg: Number(data.dosage) || 0,
    minv_dsg_unit: data.dsgUnit,
    minv_form: data.form,
    minv_qty: minv_qty_avail,
    minv_qty_unit: data.unit,
    minv_pcs: pcs,
    minv_distributed: 0,
    minv_qty_avail,
    med_id,
    cat_id: Number(data.category),
    inv_id,
  };
};

export const InventoryPayload = (data: any) => {
  return {
    expiry_date: data.expiryDate,
    inv_type: "Medicine",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
};


export const InventoryCommodityPayload = (data: any) => {
  return {
    expiry_date: data.expiryDate,
    inv_type: "Commodity",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
};

export const InventoryFirstAidPayload = (data: any) => {
  return {
    expiry_date: data.expiryDate,
    inv_type: "FirstAid",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
};


export const MedicineTransactionPayload = (minv_id: number,string_qty :string) => {
  return {
    mdt_qty: string_qty, 
    mdt_action: "Added",
    mdt_staff: 1, 
    minv_id: minv_id, 
  };
};

export const CommodityTransactionPayload = (cinv_id: number,string_qty :string,action:string) => {
  return {
    comt_qty: string_qty, 
    comt_action: action,
    staff: 1, 
    cinv_id: cinv_id, 
  };
};

export const FirstAidTransactionPayload = (finv_id: number,string_qty :string,action:string) => {
  return {
    fat_qty: string_qty, 
    fat_action: action,
    staff: 1, 
    finv_id: finv_id, 
  };
}

export const CommodityPayload = (
  data: any, // Replace with the correct type if available
  inv_id: number,
  parseCommodityID: number
): CommodityStockType => { // Replace with your actual return type if available
  const qty = Number(data.cinv_qty) || 0;
  const pcs = Number(data.cinv_pcs) || 0;
  const cinv_qty_avail = data.cinv_qty_unit === "boxes" ? qty * pcs : qty;

  return {
    com_id: parseCommodityID,
    cat_id: Number(data.cat_id),
    cinv_qty: qty,
    cinv_qty_unit: data.cinv_qty_unit,
    cinv_pcs: pcs,
    cinv_recevFrom: data.cinv_recevFrom,
    cinv_dispensed: data.cinv_dispensed, // Added default dispensed value
    cinv_qty_avail: cinv_qty_avail, // Calculated available quantity
    inv_id,
    expiryDate: data.expiryDate,
  };
};


export const FirstAidPayload = (
  data: any, // Replace with the correct type if available
  inv_id: number,
  parseFirstAidID: number
): FirstAidStockType => { // Replace with your actual return type if available
  const qty = Number(data.finv_qty) || 0;
  const pcs = Number(data.finv_pcs) || 0;
  const finv_qty_avail = data.finv_qty_unit === "boxes" ? qty * pcs : qty;

  return {
    fa_id: parseFirstAidID,
    cat_id: Number(data.cat_id),
    finv_qty: qty,
    finv_qty_unit: data.finv_qty_unit,
    finv_pcs: pcs,
    finv_used: data.finv_dispensed, // Added default dispensed value
    finv_qty_avail: finv_qty_avail, // Calculated available quantity
    inv_id,
    expiryDate: data.expiryDate,
  };
};
