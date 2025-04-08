import api from "@/pages/api/api";
import { FirstAidStocksRecord } from "../../../tables/FirstAidStocks";
import { FirstAidTransactionPayload } from "../FirstAid/FirstAidAddPost";
import { addFirstAidTransaction } from "../FirstAid/FirstAidAddPost";
import { QueryClient } from "@tanstack/react-query";

export const handleEditFirstAidStock = async (
  data: any,
  finv_id: number,
  queryClient: QueryClient
) => {
  try {
    // First, fetch the current inventory list
    const res = await api.get(`inventory/firstaidinventorylist/`);
    // Safely handle the case where res.data might be undefined
    const inventoryList = res.data || [];

    // Find the existing item with proper null checks
    const existingItem = inventoryList.find(
      (item: any) => item?.finv_id?.toString() === finv_id.toString()
    );

    if (!existingItem) {
      throw new Error("First aid item not found. Please check the ID.");
    }

    const currentQtyAvail = existingItem.finv_qty_avail || 0;
    let qty = existingItem.finv_qty || 0;
    const currentPcs = existingItem.finv_pcs || 0;
    const inv_id = existingItem.inv_detail?.inv_id;

    // Validate pieces per box if dealing with boxes
    if (
      data.finv_qty_unit === "boxes" &&
      Number(currentPcs) !== Number(data.finv_pcs)
    ) {
      throw new Error(
        `Pieces per box must match the existing stock (${currentPcs}).`
      );
    }

    let newQtyAvail = currentQtyAvail;

    // Calculate new quantities
    if (data.finv_qty_unit === "boxes") {
      qty += Number(data.finv_qty) || 0;
      newQtyAvail = qty * currentPcs;
    } else {
      qty += Number(data.finv_qty) || 0;
      newQtyAvail = qty;
    }

    // Update the stock
    await api.put(`inventory/update_firstaidstocks/${finv_id}/`, {
      finv_qty: qty,
      finv_qty_avail: newQtyAvail,
    });

    // Update inventory timestamp if inv_id exists
    if (inv_id) {
      await api.put(`inventory/update_inventorylist/${inv_id}/`, {
        updated_at: new Date().toISOString(),
      });
    }

    // Create transaction record
    const string_qty =
      data.finv_qty_unit === "boxes"
        ? `${data.finv_qty} boxes (${data.finv_pcs} pcs per box)`
        : `${data.finv_qty} ${data.finv_qty_unit}`;
    const staffId = 1;
    const action = "Added";
    
    const firstAidTransactionPayload = FirstAidTransactionPayload(
      finv_id,
      string_qty,
      action,
      staffId
    );

    await addFirstAidTransaction(firstAidTransactionPayload);

    // Invalidate queries to refresh the data
    await queryClient.invalidateQueries({
      queryKey: ["firstaidinventorylist"],
    });

    return { success: true };
  } catch (error) {
    console.error("Error in handleEditFirstAidStock:", error);
    throw error; // Re-throw the error to be caught by the calling function
  }
};
