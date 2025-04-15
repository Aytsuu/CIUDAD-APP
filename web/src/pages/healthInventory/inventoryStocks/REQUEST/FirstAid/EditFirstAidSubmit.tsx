import { addFirstAidTransaction } from "./restful-api/FirstAidPost";
import { QueryClient } from "@tanstack/react-query";
import {getFirstAidInventoryList} from "./restful-api/FirstAidGet";
import {updateFirstAidStock, updateInventoryTimestamp} from "./restful-api/FirstAidPut";
import { formatQuantityString } from "../FormatQuantityString";
// Main handler function
export const handleEditFirstAidStock = async (
  data: any,
  finv_id: number,
  queryClient: QueryClient
) => {
  try {
    // First, fetch the current inventory list
    const inventoryList = await getFirstAidInventoryList();
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
    await updateFirstAidStock(finv_id, {finv_qty: qty,finv_qty_avail: newQtyAvail,});

    if (inv_id) {await updateInventoryTimestamp(inv_id); }

    const quantityString = formatQuantityString(data.finv_qty, data.finv_qty_unit, data.finv_pcs);
    const staffId = 1;
    await addFirstAidTransaction(
      finv_id,
      quantityString,
      "Added",
      staffId
    )


await queryClient.invalidateQueries({queryKey: ["firstaidinventorylist"],});
    return { success: true };
  } catch (error) {
    console.error("Error in handleEditFirstAidStock:", error);
    throw error;
  }
};