import { api2 } from "@/api/api";

export const updateMedicineRequest = async (medreq_id: string, data: Record<string, unknown>) => {
    try {
      const res = await api2.patch(`/medicine/update-medicine-request/${medreq_id}/`, data);
      console.log(res);
      return res.data;
    } catch (error) {
      console.error("Error updating medicine request:", error);
      throw error;
    }
  };


  export const confirmAllPendingItems = async (medreq_id: string) => {
    try {
      const response = await api2.patch(`medicine/update-pending-medreq/${medreq_id}/`);
      return response.data;
    } catch (error) {
      console.error("Error confirming pending items:", error);
      throw error;
    }
  };