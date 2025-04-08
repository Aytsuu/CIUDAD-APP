// src/services/inventory/firstAidStockService.ts
import api from "@/pages/api/api";
import axios from "axios";
import { FirstAidTransactionPayload } from "../FirstAid/FirstAidAddPost";
import { FirstAidStocksRecord } from "../../../tables/FirstAidStocks";

export const deductFirstAidStock = async (
  data: FirstAidStocksRecord,
  values: { usedItem: number },
  displayUnit: string
) => {
  try {
    // First, fetch the current inventory list
    const res = await api.get(`inventory/firstaidinventorylist/`);
    const inventoryList = res.data || [];

    // Find the existing item with proper null checks
    const existingItem = inventoryList.find(
      (item: any) => item?.finv_id?.toString() === data.finv_id.toString()
    );

    if (!existingItem) {
      throw new Error("First aid item not found. Please check the ID.");
    }

    const currentQtyAvail = existingItem.finv_qty_avail;
    const existingUsedItem = existingItem.finv_used;
    let newUsedItem = 0;
    let newQty = 0;

    if (currentQtyAvail == 0) {
      throw new Error("Current quantity available is 0.");
    } else if (values.usedItem > currentQtyAvail) {
      throw new Error("Cannot use more items than available.");
    } else {
      newQty = currentQtyAvail - values.usedItem;
      newUsedItem = existingUsedItem + values.usedItem;
    }

    // Update the stock with proper payload structure
    const updatePayload = {
      finv_qty_avail: newQty,
      finv_used: newUsedItem,
      finv_name: existingItem.finv_name,
      finv_qty_unit: existingItem.finv_qty_unit
    };

    await api.put(`inventory/update_firstaidstocks/${data.finv_id}/`, updatePayload);

    // Update inventory timestamp if inv_id exists
    if (data.inv_id) {
      await api.put(`inventory/update_inventorylist/${data.inv_id}/`, {
        updated_at: new Date().toISOString(),
      });
    }

    // Create transaction record
    const staffId = 1; // Replace with actual staff ID
    const action = "Deducted";
    const string_qty = `${values.usedItem} ${displayUnit}`;

    const firstAidTransactionPayload = FirstAidTransactionPayload(
      data.finv_id,
      string_qty,
      action,
      staffId
    );

    await api.post(
      `inventory/firstaidtransaction/`,
      firstAidTransactionPayload
    );

    return { success: true };
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error("API Error Details:", error.response?.data);
      throw new Error(error.response?.data?.message || "API request failed");
    }
    console.error("Error:", error);
    throw error instanceof Error ? error : new Error("An error occurred");
  }
};