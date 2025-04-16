// src/services/firstAidService.ts
import { QueryClient } from "@tanstack/react-query";
import { addInventory } from "../Inventory";
import { formatQuantityString } from "../FormatQuantityString";
import { addFirstAidInventory,addFirstAidTransaction } from "./restful-api/FirstAidPost";


export const submitFirstAidStock = async (data: any,queryClient: QueryClient) => {
  // ADD INVENTORY
  const inv_type = "FirstAid";
  const inventoryResponse = await addInventory(data,inv_type);
  console.log("Inventory Response:", inventoryResponse);
  if (!inventoryResponse?.inv_id) {throw new Error("Failed to generate inventory ID.");}
  const inv_id = parseInt(inventoryResponse.inv_id, 10);
  const parseFirstAidID = parseInt(data.fa_id, 10);
  if (!data.fa_id) { throw new Error("Failed to get FirstAid ID.");}

// ADD FIRSTAID STOCKS
  const firstAidInventoryResponse = await addFirstAidInventory(data, inv_id, parseFirstAidID);

  if (!firstAidInventoryResponse || firstAidInventoryResponse.error) {
    throw new Error("Failed to add FirstAid inventory.");
  }
// TRANSACTION

  const quantityString = formatQuantityString(data.finv_qty, data.finv_qty_unit, data.finv_pcs);
  const staffId = 1;
  // Call the function with individual parameters
  await addFirstAidTransaction(
    firstAidInventoryResponse.finv_id,
    quantityString,
    "Added",
    staffId
  );
  // Refresh data
  await queryClient.invalidateQueries({ queryKey: ["firstaidinventorylist"] });
  await queryClient.invalidateQueries({ queryKey: ["firstaidtransactions"] });

  return { success: true };
};



