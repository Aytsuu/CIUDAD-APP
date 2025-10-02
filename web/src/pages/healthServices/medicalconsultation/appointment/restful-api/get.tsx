import { api2 } from "@/api/api";

export const getpendingAppointments = async (page: number, pageSize: number, search: string = "", dateFilter: string = "all"): Promise<any> => {
  try {
    const params = new URLSearchParams();
    params.append("page", page.toString());
    params.append("page_size", pageSize.toString());
    if (search) {
      params.append("search", search);
    }
    if (dateFilter && dateFilter !== "all") {
      params.append("date_filter", dateFilter);
    }

    const response = await api2.get("/medicine/confirmed-medicine-request-table/", { params: params });
    return response.data;
  } catch (error) {
    console.error("Error fetching processing medicine requests:", error);
    throw error;
  }
};
