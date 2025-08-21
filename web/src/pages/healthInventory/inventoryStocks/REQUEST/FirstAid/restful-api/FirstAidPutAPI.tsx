import {api2} from "@/api/api";

export const updateInventoryTimestamp = async (inv_id: string) => {
    try {
      const res = await api2.patch(`inventory/update_inventorylist/${inv_id}/`, {
        updated_at: new Date().toISOString(),
      });
      return res.data;
    } catch (err) {
      console.error(err)
  }
  };
 
  export const updateFirstAidStock = async (finv_id: number, data:Record<string, any>) => {
    try {
      const res = await api2.patch(`inventory/update_firstaidstocks/${finv_id}/`, data);
      return res.data;
    } catch (err) {
      console.error(err)
  }
  };


 