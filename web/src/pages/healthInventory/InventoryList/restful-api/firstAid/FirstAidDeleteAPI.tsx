
import {api} from "@/pages/api/api";

export const handleDeleteFirstAidList = async (id: string, callback?: () => void) => {
    try {
      await api.delete(`inventory/firstaidlist/${id}/`); // API call
      if (callback) callback(); // Call the function to refetch data
    } catch (error) {
      console.error("Error deleting firstAid:", error);
    }
  };
  