// REQUEST/InventoryStock.ts
import { api2 } from "@/api/api";
import { ImmunizationSuppliesType } from "@/form-schema/inventory/stocks/inventoryStocksSchema";

export const addImmunizationStock = async (
  data: Record<string, any>,
  inv_id: string
) => {
  try {
    // Update the quantity calculation in useSubmitImmunizationStock:
    const isBoxes = data.imzStck_unit === "boxes";
    const isPcs = data.imzStck_unit === "pcs";

    const imzStck_qty = isBoxes 
    ? data.imzStck_qty 
    : data.imzStck_qty; // Store the quantity as is
  const imzStck_per_pcs = 0; // Always set to 0 as it will be removed
 
  const imzStck_pcs = isBoxes
    ? data.imzStck_pcs || 0 // Use pcs if unit is boxes, default to 0 if not provided
    : 0; // Default to 0 if unit is not boxes
  const totalpcs = isBoxes 
    ? data.imzStck_qty * (data.imzStck_pcs || 0) // Calculate total pcs if unit is boxes
    : data.imzStck_qty; // Store pcs directly if unit is pcs
  const imzStck_avail = totalpcs; // Availability is based on total pcs


    
    const response = await api2.post("inventory/immunization_stock/", {
      ...data,
      imzStck_qty,
      imzStck_per_pcs,
      imzStck_pcs,
      imzStck_avail,
      inv_id,
    });

    return response?.data;
  } catch (err) {
    console.error(err);
    throw err; // It's better to rethrow the error so it can be handled by the caller
  }
};

export const addImzTransaction = async (
  string_qty: string,
  staffId: number,
  imzStck_id: number,
  action: string
) => {
  try {
    if (!imzStck_id) {
      throw new Error("Immunization stock ID is required.");
    }

    const res = await api2.post("inventory/imz_transaction/", {
      imzt_qty: string_qty,
      imzt_action: action,
      staff: staffId,
      imzStck_id: imzStck_id,
    });

    if (res.data.error) {
      throw new Error(res.data.error);
    }

    return res.data;
  } catch (err) {
    console.error(err);
  }
};
