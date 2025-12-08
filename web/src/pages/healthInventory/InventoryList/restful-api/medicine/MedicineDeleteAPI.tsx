
import {api2} from "@/api/api";
export const handleDeleteMedicineList = async (id: string) => {
  try {
    const res = await api2.delete(`inventory/medicinelist/${id}/`);
  
    return res.data;
  } catch (error: any) {
    if (process.env.NODE_ENV === 'development') {
      console.error("Error deleting medicine:", error);
    }
    // DEVELOPMENT MODE ONLY: No throw in production
  }
};