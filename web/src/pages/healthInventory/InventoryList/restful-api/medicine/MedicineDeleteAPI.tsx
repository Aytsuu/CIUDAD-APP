
import {api} from "@/pages/api/api";

export const handleDeleteMedicineList = async (id: string, callback?: () => void) => {
    try {
      await api.delete(`inventory/medicinelist/${id}/`); // API call
      if (callback) callback(); // Call the function to refetch data
    } catch (error) {
      console.error("Error deleting medicine:", error);
    }
  };
  