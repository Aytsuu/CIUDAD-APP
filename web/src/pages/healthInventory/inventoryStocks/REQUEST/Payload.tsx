import { MedicineStockType } from "../REQUEST/type";

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

export const CommodityTransactionPayload = (cinv_id: number,string_qty :string) => {
  return {
    comt_qty: string_qty, 
    comt_action: "Added",
    staff: 1, 
    comt_id: cinv_id, 
  };
};

export const FirstAidTransactionPayload = (fa_id: number,string_qty :string) => {
  return {
    fat_qty: string_qty, 
    fat_action: "Added",
    staff: 1, 
    fat_id: fa_id, 
  };
}

export const CommodityPayload = (data: any, inv_id: number,parseCommodityID :number) => {
  return {
    com_id: parseCommodityID,
    cat_id: data.cat_id,
    cinv_qty: data.cinv_qty,
    cinv_qty_unit: data.cinv_qty_unit,
    cinv_pcs: data.cinv_pcs,
    cinv_recevFrom: data.cinv_recevFrom,
    expiryDate: data.expiryDate,
    inv_id,
  };
}


export const FirstAidPayoad = (data: any, inv_id: number,parsefaID:number) => {
  return {
    fa_id: parsefaID,
    cat_id: data.cat_id,
    finv_qty: data.finv_qty,
    finv_qty_unit: data.finv_qty_unit,
    finv_pcs: data.finv_pcs,
    expiryDate: data.expiryDate,
    inv_id,
  };
}
