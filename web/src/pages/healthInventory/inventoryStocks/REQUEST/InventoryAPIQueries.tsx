import {api} from "@/api/api";
import { useMutation, useQueryClient } from "@tanstack/react-query";

// 2. Wrapped function version (still fully combined)
export const addInventory = async (data:any, inv_type: string) => {
  try {
    const res = await api.post("inventory/inventorylist/", {
      expiry_date: data.expiryDate,
      inv_type: inv_type,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    });
    return res.data;
  } catch (err: any) {
    console.log("Error response:", err.response?.data || err.message);
    throw err;
  }
};

export const useAddInventory = () => {
  return useMutation({
    mutationFn: ({ data, inv_type }: { data: any; inv_type: string }) =>
      addInventory(data, inv_type),
    onError: (error: Error) => {
      console.error("Error adding inventory:", error.message);
    },
  });
};

export const updateInventoryTimestamp = async (inv_id: number) => {
  return await api.put(`inventory/update_inventorylist/${inv_id}/`, {
    updated_at: new Date().toISOString(),
  });
};

  // Add this to your REQUEST file (or create a new one)
export const archiveInventory = async (inv_id: number) => {
    try {
      const response = await api.put(`inventory/update_inventorylist/${inv_id}/`, {
        is_Archived: true
      });
      return response.data;
    } catch (error) {
      console.error("Error archiving inventory:", error);
      throw error;
    }
  };