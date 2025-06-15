
import { api } from "@/api/api";

export const handleDeleteMedicineList = async (id: number, callback?: () => void) => {
    try {
      await api.delete(`inventory/medicinelist/${id}/`); // API call
      if (callback) callback(); // Call the function to refetch data
    } catch (error) {
      console.error("Error deleting medicine:", error);
    }
  };
  