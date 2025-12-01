// update-header-report-api.ts
import { api2 } from "@/api/api";

export const update_header_report = async (rcpheader_id: string, data: any) => {
  try {
    const response = await api2.patch(`/reports/update-headerreport/${rcpheader_id}/`, data);
    console.log("Update response:", response.data);
    return response.data;
  } catch (error) {
    console.error("Error updating header report:", error);
    throw error;
  }
};