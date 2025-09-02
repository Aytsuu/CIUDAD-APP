import { api2 } from "@/api/api";

export const createCommodityStock = async (data: Record<string, any>) => {
  try {
    if (!data.com_id) {
      throw new Error("Commodity ID is required.");
    }
    const res = await api2.post("inventory/commodity-create/", data);
    if (res.data.error) {
      throw new Error(res.data.error);
    }
    return res.data;
  } catch (err) {
    console.error(err);
    throw err;
  }
};

export const addCommodityTransaction = async (data: Record<any, string>) => {
  try {
    if (!data.cinv_id) {
      throw new Error("Commodity inventory ID is required.");
    }
    const res = await api2.post("inventory/commoditytransaction/", data);
    if (res.data.error) {
      throw new Error(res.data.error);
    }
    return res.data;
  } catch (err) {
    console.error(err);
  }
};
