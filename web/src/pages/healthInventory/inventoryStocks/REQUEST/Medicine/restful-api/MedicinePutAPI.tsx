import {api2}  from "@/api/api";

export const updateMedicineStocks = async (id: number, data: Record<string, any>) => {
  try {
    const res = await api2.put(`inventory/update_medicinestocks/${id}/`, data);
    return res.data;
  } catch (err: any) {
    if (process.env.NODE_ENV === "development") {
      console.error("Error updating medicine stocks:", err.response?.data || err.message);
    }
    return null;
  }
};
  
  export const updateInventoryTimestamp = async (inv_id: string) => {
  try {
    const res = await api2.put(`inventory/update_inventorylist/${inv_id}/`, {
      updated_at: new Date().toISOString(),
    });
    return res.data;
  } catch (err: any) {
    if (process.env.NODE_ENV === "development") {
      console.error("Error updating inventory timestamp:", err.response?.data || err.message);
    }
    return null;
  }
};
  
  