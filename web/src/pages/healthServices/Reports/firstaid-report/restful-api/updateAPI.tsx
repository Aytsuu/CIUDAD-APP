import { api2 } from "@/api/api";


export const update_monthly_recipient_list_report = async (data: Record<string, any>) => {
  try {
    const response = await api2.patch(
      `/reports/update/monthly_recipient_list_report/${data.monthlyrcplist_id}/`,
      data
    );
    console.log("Update response:", response.data);
    return response.data;
  } catch (error) {
    console.error("Error updating First Aid record:", error);
    throw error;
  }
}