import { api2 } from "@/api/api";
export const getChildHealthHistoryRecordRecords = async (assigned_to: string, search = "", patientType = "all", page = 1, pageSize = 10): Promise<any> => {
  try {
    const params = new URLSearchParams({
      search,
      patient_type: patientType,
      page: page.toString(),
      page_size: pageSize.toString()
    });
    const response = await api2.get(`/child-health/child-immunization-status-table/${assigned_to}/?${params}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching records:", error);
    throw error;
  }
};