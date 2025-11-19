
import {api2} from "@/api/api";
export const handleDeleteMedicineList = async (id: string) => {
  try {
    const res = await api2.delete(`inventory/medicinelist/${id}/`);
  
    return res.data;
  } catch (error: any) {
    console.error("Error deleting medicine:", error);
    throw error;
  }
};