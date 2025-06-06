import { api } from "@/pages/api/api";
import { updateInventoryTimestamp } from "../../InventoryAPIQueries"; // Adjust the path if needed

export const updateVaccineStock = async (
  vacStck_id: number,
  inv_id: number,
  qty: number,
  vacStck_qty_avail: number
) => {
  const response = await api.put(`inventory/vaccine_stocks/${vacStck_id}/`, {
    qty,
    vacStck_qty_avail,
  });

  if (inv_id) {
    await updateInventoryTimestamp(inv_id);
  }

  return response;
};

