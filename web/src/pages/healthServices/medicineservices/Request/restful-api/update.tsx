import { api2 } from "@/api/api";

export const updateMedicineRequest = async (medreq_id: number, data: any) => {
    try {
      const res = await api2.patch(`/medicine/medicine-request/${medreq_id}/`, data);
      return res.data;
    } catch (error) {
      console.error("Error updating medicine request:", error);
      throw error;
    }
  };