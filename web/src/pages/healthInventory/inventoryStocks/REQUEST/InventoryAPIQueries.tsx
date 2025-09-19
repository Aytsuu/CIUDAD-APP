import { api2 } from "@/api/api";

// 2. Wrapped function version (still fully combined)
export const addInventory = async (data: Record<any, string>) => {
  try {
    const res = await api2.post("inventory/inventorylist/", data);
    return res.data;
  } catch (err: any) {
    console.log("Error response:", err.response?.data || err.message);
    throw err;
  }
};

export const updateInventoryTimestamp = async (inv_id: string) => {
  return await api2.put(`inventory/update_inventorylist/${inv_id}/`, {
    updated_at: new Date().toISOString()
  });
};

// Add this to your REQUEST file (or create a new one)
export const archiveInventory = async (inv_id: string) => {
  try {
    const response = await api2.put(`inventory/update_inventorylist/${inv_id}/`, {
      is_Archived: true
    });
    return response.data;
  } catch (error) {
    console.error("Error archiving inventory:", error);
    throw error;
  }
};
