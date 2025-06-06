import { api } from "@/pages/api/api";
import { updateInventoryTimestamp } from "../../InventoryAPIQueries"; // Adjust path as needed

export const updateImmunizationStock = async (
  imzStck_id: number,
  inv_id: number,
  imzStck_qty: number,
  imzStck_per_pcs: number,
  imzStck_pcs: number,
  imzStck_avail: number,
  imzStck_unit: string
) => {
  const response = await api.put(`inventory/immunization_stock/${imzStck_id}/`, {
    imzStck_qty,
    imzStck_per_pcs,
    imzStck_pcs,
    imzStck_avail,
    imzStck_unit,
  });

  if (inv_id) {
    await updateInventoryTimestamp(inv_id);
  }

  return response;
};
