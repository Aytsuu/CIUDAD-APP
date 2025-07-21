
import {api2} from "@/api/api";

// POST request for firstaidinventorylist model
export const addFirstAidInventory = async (
  data: Record<string, any>,
  inv_id: string,
  fa_id: string
) => {
  try {
    // Calculate values directly
    const qty = Number(data.finv_qty) || 0;
    const pcs = Number(data.finv_pcs) || 0;
    const finv_qty_avail = data.finv_qty_unit === "boxes" ? qty * pcs : qty;

    const res = await api2.post("inventory/firstaidinventorylist/", {
      fa_id: fa_id,
      category: data.category,
      finv_qty: qty,
      finv_qty_unit: data.finv_qty_unit,
      finv_pcs: pcs,
      finv_used: data.finv_dispensed, 
      finv_qty_avail: finv_qty_avail,
      inv_id,
      expiryDate: data.expiryDate,
    });
    return res.data;
  } catch (err) {
    console.error(err);
    throw err;
  }
};

// POST request for firstaidtransaction model
export const addFirstAidTransaction = async ( finv_id: number, string_qty: string, action: string, staffId: number) => {
  try {
    const res = await api2.post("inventory/firstaidtransaction/", {
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