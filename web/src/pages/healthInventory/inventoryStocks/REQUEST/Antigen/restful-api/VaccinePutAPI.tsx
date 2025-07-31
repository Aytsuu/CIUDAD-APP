import { api2 } from "@/api/api";
import { updateInventoryTimestamp } from "../../InventoryAPIQueries"; // Adjust the path if needed

export const updateVaccineStock = async (
data:Record<string, any>
) => {
  const response = await api2.put(`inventory/vaccine_stocks/${data.vacStck_id}/`,data);
  if (!response.data) {
    throw new Error("Failed to update vaccine stock");
  }
  return response;
};




