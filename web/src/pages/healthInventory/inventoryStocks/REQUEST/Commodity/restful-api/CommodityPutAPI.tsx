import {api2} from "@/api/api";

export const fetchCommodityStock = async (cinv_id: number) => {
  const res = await api2.get(`inventory/commodityinventorylist/`);
  const existingCommodity = res.data.find(
    (item: any) => item.cinv_id === cinv_id
  );
  
  if (!existingCommodity) {
    throw new Error("Commodity ID not found. Please check the ID.");
  }
  
  return existingCommodity;
};


export const updateCommodityStockQuantity = async (
  cinv_id: number,
  qty: number,
  qty_avail: number
) => {
  return await api2.put(
    `inventory/update_commoditystocks/${cinv_id}/`,
    {
      cinv_qty: qty,
      cinv_qty_avail: qty_avail,
    }
  );
};

export const updateInventoryTimestamp = async (inv_id: number) => {
  return await api2.put(`inventory/update_inventorylist/${inv_id}/`, {
    updated_at: new Date().toISOString(),
  });
};