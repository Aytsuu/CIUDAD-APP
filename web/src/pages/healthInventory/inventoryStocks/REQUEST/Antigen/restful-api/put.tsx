import { api2 } from "@/api/api";
import { updateInventoryTimestamp } from "../../InventoryAPIQueries"; // Adjust path as needed

export const updateImmunizationStock = async (
  imzStck_id: number,
  inv_id: string,
  imzStck_qty: number,
  imzStck_pcs: number,
  imzStck_avail: number,
) => {
  const response = await api2.put(`inventory/immunization_stock/${imzStck_id}/`, {
    imzStck_qty,
    imzStck_pcs,
    imzStck_avail,
  });

  if (inv_id) {
    await updateInventoryTimestamp(inv_id);
  }

  return response;
};


export const updateVaccineStock = async (data: Record<string, any>) => {
  try {
    if (process.env.NODE_ENV === 'development') {
      console.log("Updating vaccine stock with data:", data);
    }
    const response = await api2.patch(
      `inventory/vaccine_stocks/${data.vacStck_id}/`,
      data
    );
    if (!response.data) {
      if (process.env.NODE_ENV === 'development') {
        console.error("Failed to update vaccine stock");
      }
      throw new Error("Failed to update vaccine stock");
    }
    return response;
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error("Error updating vaccine stock:", error);
    }
    throw error;
  }
};
