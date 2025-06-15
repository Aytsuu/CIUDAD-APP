import {api} from "@/api/api";

export const addCommodityInventory = async (
  data: Record<string, any>
) => {
  try {
    if (!data.com_id) {
      throw new Error("Commodity ID is required.");
    }
    const res = await api.post("inventory/commodityinventorylist/", data);

    if (res.data.error) {
      throw new Error(res.data.error);
    }

    return res.data;
  } catch (err) {
    console.error(err);
    throw err; 
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
