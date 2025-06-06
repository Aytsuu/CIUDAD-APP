// REQUEST/InventoryStock.ts
import {api} from "@/pages/api/api";
import { ImmunizationSuppliesType } from "@/form-schema/inventory/stocks/inventoryStocksSchema";
import { ImmunizationStockTransaction } from "../../Payload";



export const addImmunizationStock = async (data :Record<string,any>, inv_id:number) => {
  try{
  const isBoxes = data.imzStck_unit === "boxes";
  const imzStck_qty = isBoxes ? data.imzStck_qty : 0;
  const imzStck_per_pcs = isBoxes ? data.imzStck_pcs : 0;
  const imzStck_pcs = isBoxes
    ? data.imzStck_qty * (data.imzStck_pcs || 0)
    : data.imzStck_qty;
  const imzStck_avail = imzStck_pcs;

  const response = await api.post("inventory/immunization_stock/", {
    ...data,
    imzStck_qty,
    imzStck_per_pcs,
    imzStck_pcs,
    imzStck_avail,
    inv_id,
  });

  return response?.data;
} catch (err) {
  console.error(err)
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

    const res = await api.post("inventory/imz_transaction/", {
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
    console.error(err)
}
};
