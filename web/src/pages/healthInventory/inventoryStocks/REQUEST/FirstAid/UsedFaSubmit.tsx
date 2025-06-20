// src/services/inventory/firstAidStockService.ts
import { api } from "@/api/api";
import axios from "axios";
import { FirstAidStocksRecord } from "../../tables/type";
import {getFirstAidInventoryList} from "./restful-api/FirstAidGetAPI";
import { updateFirstAidStock ,updateInventoryTimestamp} from "./restful-api/FirstAidPutAPI";
import {addFirstAidTransaction} from "./restful-api/FirstAidPostAPI";

export const deductFirstAidStock = async (
  data: FirstAidStocksRecord,
  values: { usedItem: number },
  displayUnit: string
) => {
  try {
    // First, fetch the current inventory list
    const inventoryList = await getFirstAidInventoryList();
    
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
    
    await updateFirstAidStock(data.finv_id, updatePayload);
    
    // Update inventory timestamp if inv_id exists
    if (data.inv_id) {
      await updateInventoryTimestamp(data.inv_id);
    }
    
    // TRANSACTION
    const staffId = 1; 
    const string_qty = `${values.usedItem} ${displayUnit}`;
    await addFirstAidTransaction(
      data.finv_id,
      string_qty,
      "Deducted",
      staffId
    )
    
    
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