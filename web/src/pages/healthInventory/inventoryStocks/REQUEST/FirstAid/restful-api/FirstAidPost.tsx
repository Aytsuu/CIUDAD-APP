
import api from "@/api/api";

export const addFirstAidInventory = async (
  formData: any,  // Replace with proper type if available
  inv_id: number,
  parseFirstAidID: number
) => {
  try {
    // Calculate values directly
    const qty = Number(formData.finv_qty) || 0;
    const pcs = Number(formData.finv_pcs) || 0;
    const finv_qty_avail = formData.finv_qty_unit === "boxes" ? qty * pcs : qty;

    // Make the API call with the directly constructed object
    const res = await api.post("inventory/firstaidinventorylist/", {
      fa_id: parseFirstAidID,
      cat_id: Number(formData.cat_id),
      finv_qty: qty,
      finv_qty_unit: formData.finv_qty_unit,
      finv_pcs: pcs,
      finv_used: formData.finv_dispensed, 
      finv_qty_avail: finv_qty_avail,
      inv_id,
      expiryDate: formData.expiryDate,
    });

    return res.data;
  } catch (err) {
    console.error(err);
    throw err; // Better to re-throw for error handling upstream
  }
};


export const addFirstAidTransaction = async (
  finv_id: number,
  string_qty: string,
  action: string,
  staffId: number
) => {
  try {
    const res = await api.post("inventory/firstaidtransaction/", {
      fat_qty: string_qty,
      fat_action: action,
      finv_id: finv_id,
      staff: staffId,
    });
    return res.data;
  } catch (err) {
    console.error(err);
    throw err;
  }
};