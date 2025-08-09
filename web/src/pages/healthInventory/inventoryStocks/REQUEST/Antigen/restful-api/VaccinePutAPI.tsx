import { api2 } from "@/api/api";
// Adjust the path if needed

export const updateVaccineStock = async (data: Record<string, any>) => {
  try {
    console.log("Updating vaccine stock with data:", data);
    const response = await api2.patch(
      `inventory/vaccine_stocks/${data.vacStck_id}/`,
      data
    );
    if (!response.data) {
      throw new Error("Failed to update vaccine stock");
    }
    return response;
  } catch (error) {
    console.error("Error updating vaccine stock:", error);
    throw error;
  }
};
