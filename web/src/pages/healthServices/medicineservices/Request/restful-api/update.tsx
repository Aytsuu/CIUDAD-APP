import { api2 } from "@/api/api";

export const updateMedicineRequest = async (medreq_id: string, data: Record<string, unknown>) => {
    try {
      const res = await api2.patch(`/medicine/update-medicine-request/${medreq_id}/`, data);
      if (process.env.NODE_ENV === 'development') {
        console.log(res);
      }
      return res.data;
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error("Error updating medicine request:", error);
      }
      // Do not throw in production; only log in development
    }
  };


  export const confirmAllPendingItems = async (payload: {
    medreq_id: string;
    selected_medicines: any[];
    staff_id?: string;
    pat_id: string;
  }) => {
    try {
      const response = await api2.post(`medicine/update-pending-medreq/`, payload); // Change to POST and remove URL parameter
      return response.data;
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error("Error confirming pending items:", error);
      }
      // Do not throw in production; only log in development
    }
  };