// update-header-report-api.ts
import { api2 } from "@/api/api";

export const update_header_report = async (rcpheader_id: string, data: any) => {
  try {
    const response = await api2.patch(`/reports/update-headerreport/${rcpheader_id}/`, data);
    if (process.env.NODE_ENV === 'development') {
      console.log("Update response:", response.data);
    }
    return response.data;
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error("Error updating header report:", error);
    }
    // Do not throw in production; only log in development
  }
};