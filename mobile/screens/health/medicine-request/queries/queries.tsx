import { api2 } from "@/api/api";

export const submitMedicineRequest = async (data: FormData): Promise<any> => {
  try {
    const response = await api2.post("/medicine/submit-request/", data, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error:any) {
    console.error("Error submitting medicine request:",{
      status: error.response?.status,
      data: error.response?.data,
      message: error.message,
    });
    throw error;
  }
};

export const getPendingMedicineRequests = async (
  page: number,
  pageSize: number,
  search?: string
): Promise<any> => {
  try {
    const response = await api2.get("/medicine/admin/requests/", {
      params: {
        page,
        page_size: pageSize,
        search: search?.trim() || undefined,
        status: 'pending'
      }
    });
    return response.data;
  } catch (err) {
    console.log(err);
    return {
      results: [],
      count: 0,
      next: null,
      previous: null
    };
  }
};

export const updateRequestStatus = async (
  medreq_id: number,
  status: string,
  doctor_notes?: string
): Promise<any> => {
  try {
    const response = await api2.patch(`/medicine/admin/requests/${medreq_id}/status/`, {
      status,
      doctor_notes
    });
    return response.data;
  } catch (error) {
    console.error("Error updating request status:", error);
    throw error;
  }
};