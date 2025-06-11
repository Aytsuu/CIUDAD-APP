import { api } from "@/pages/api/api";


export const updateMedicineStocks = async (id: number, payload: any) => {
    try {
      const res = await api.put(`inventory/update_medicinestocks/${id}/`, payload);
      return res.data;
    } catch (err: any) {
      console.log("Error updating medicine stocks:", err.response?.data || err.message);
      throw err;
    }
  };
  
  export const updateInventoryTimestamp = async (inv_id: number) => {
    try {
      const res = await api.put(`inventory/update_inventorylist/${inv_id}/`, {
        updated_at: new Date().toISOString(),
      });
      return res.data;
    } catch (err: any) {
      console.log("Error updating inventory timestamp:", err.response?.data || err.message);
      throw err;
    }
  };
  
  