import { api } from "@/api/api";
import { updateInventoryTimestamp } from "../../InventoryAPIQueries"; // Adjust path as needed

export const updateImmunizationStock = async (
  imzStck_id: number,
  inv_id: number,
  imzStck_qty: number,
  imzStck_pcs: number,
  imzStck_avail: number,
) => {
  const response = await api.put(`inventory/immunization_stock/${imzStck_id}/`, {
    imzStck_qty,
    imzStck_pcs,
    imzStck_avail,
  });

  if (inv_id) {
    await updateInventoryTimestamp(inv_id);
  }

  return response;
};
