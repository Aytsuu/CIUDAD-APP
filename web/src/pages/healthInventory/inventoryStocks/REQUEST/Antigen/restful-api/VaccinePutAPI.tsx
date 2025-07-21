import { api2 } from "@/api/api";
import { updateInventoryTimestamp } from "../../InventoryAPIQueries"; // Adjust the path if needed

export const updateVaccineStock = async (
  vacStck_id: number,
  inv_id: string,
  qty: number,
  vacStck_qty_avail: number
) => {
  const response = await api2.put(`inventory/vaccine_stocks/${vacStck_id}/`, {
    qty,
    vacStck_qty_avail,
  });

  if (inv_id) {
    await updateInventoryTimestamp(inv_id);
  }

  return response;
};

