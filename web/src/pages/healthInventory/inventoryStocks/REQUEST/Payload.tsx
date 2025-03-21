import { MedicineStockType } from "../addstocksModal/type";




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

export const InventoryPayload= (data:any)=>{
  return{
    expiry_date: data.expiryDate,
    inv_type: "Medicine",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }
}
