// updateAPI.ts
import { api2 } from "@/api/api";

export const update_monthly_recipient_list_report = async (monthlyrcplist_id: string, data: any) => {
  try {
    const response = await api2.patch(`/reports/update/monthly_recipient_list_report/${monthlyrcplist_id}/`, data, {
      headers: {
        "Content-Type": "application/json", // Changed from multipart/form-data
      },
    });
    console.log("Update response:", response.data);
    return response.data;
  } catch (error) {
    console.error("Error updating recipient list:", error);
    throw error;
  }
};
