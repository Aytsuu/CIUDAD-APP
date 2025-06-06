import {api} from "@/pages/api/api";

// Commodity Inventory API
export const addCommodityInventory = async (
  data: Record<string, any>,
  inv_id: number
) => {
  try {
    if (!data.com_id) {
      throw new Error("Commodity ID is required.");
    }

    const qty = Number(data.cinv_qty) || 0;
    const pcs = Number(data.cinv_pcs) || 0;
    const cinv_qty_avail = data.cinv_qty_unit === "boxes" ? qty * pcs : qty;

    const res = await api.post("inventory/commodityinventorylist/", {
      com_id:data.com_id,
      cat_id: Number(data.cat_id) || 0,
      cinv_qty: qty,
      cinv_qty_unit: data.cinv_qty_unit,
      cinv_pcs: pcs,
      cinv_recevFrom: data.cinv_recevFrom.toUpperCase() || "",
      cinv_dispensed: 0,
      cinv_qty_avail: cinv_qty_avail,
      inv_id: inv_id,
      expiryDate: data.expiryDate || null,
    });

    if (res.data.error) {
      throw new Error(res.data.error);
    }

    return res.data;
  } catch (err) {
    console.error(err)
}
};

export const addCommodityTransaction = async (
  string_qty: string,
  staffId: number,
  cinv_id: number,
  action: string
) => {
  try {
    if (!cinv_id) {
      throw new Error("Commodity inventory ID is required.");
    }

    const res = await api.post("inventory/commoditytransaction/", {
      comt_qty: string_qty,
      comt_action: action,
      staff: staffId,
      cinv_id: cinv_id,
    });

    if (res.data.error) {
      throw new Error(res.data.error);
    }

    return res.data;
  } catch (err) {
    console.error(err)
}
};
