import {api} from "@/api/api";

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