// src/services/firstAidService.ts
import { QueryClient } from "@tanstack/react-query";
import { FirstAidStockType,FirstAidTransactionType } from "../../type";
import { addInventory } from "../Inventory";
import api from "@/pages/api/api";


export const  addFirstAidInventory = async (firstAidData: FirstAidStockType) => {
    try {
      const res = await api.post(
        "inventory/firstaidinventorylist/",
        firstAidData
      );
      return res.data;
    } catch (err: any) {
      console.log("Error response:", err.response?.data || err.message);
      throw err;
    }
  }

  export const addFirstAidTransaction = async (FirstAidTransacindata: FirstAidTransactionType) => {
    try {
      const res = await api.post("inventory/firstaidtransaction/",FirstAidTransacindata);
      return res.data;
    } catch (err:any) {
      console.log("Error response:", err.response?.data || err.message);
      throw err;
    }
  };
  
  export const FirstAidTransactionPayload = (finv_id: number,string_qty :string,action:string,staffId:number) => {
    return {
      fat_qty: string_qty, 
      fat_action: action,
      finv_id: finv_id, 
      staff: staffId, 

    };
  }
  

export const InventoryFirstAidPayload = (data: any) => {
    return {
      expiry_date: data.expiryDate,
      inv_type: "FirstAid",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
  };
  
  export const FirstAidPayload = (
    data: any, // Replace with the correct type if available
    inv_id: number,
    parseFirstAidID: number
  ): FirstAidStockType => { // Replace with your actual return type if available
    const qty = Number(data.finv_qty) || 0;
    const pcs = Number(data.finv_pcs) || 0;
    const finv_qty_avail = data.finv_qty_unit === "boxes" ? qty * pcs : qty;
  
    return {
      fa_id: parseFirstAidID,
      cat_id: Number(data.cat_id),
      finv_qty: qty,
      finv_qty_unit: data.finv_qty_unit,
      finv_pcs: pcs,
      finv_used: data.finv_dispensed, // Added default dispensed value
      finv_qty_avail: finv_qty_avail, // Calculated available quantity
      inv_id,
      expiryDate: data.expiryDate,
    };
  };
  


  
  

export const submitFirstAidStock = async (data: any,  queryClient: QueryClient) => {
  // Step 1: Create base inventory record
  const inventoryResponse = await addInventory(InventoryFirstAidPayload(data));
  
  if (!inventoryResponse?.inv_id) {throw new Error("Failed to generate inventory ID.");}

  const inv_id = parseInt(inventoryResponse.inv_id, 10);
  const parseFirstAidID = parseInt(data.fa_id, 10);
  
  if (!data.fa_id) {throw new Error("Failed to get FirstAid ID.");}

  // Step 2: Create first aid specific inventory record
  const firstAidPayload = FirstAidPayload(data, inv_id, parseFirstAidID);
  
  await new Promise((resolve) => setTimeout(resolve, 300));
  
  const firstAidInventoryResponse = await addFirstAidInventory(firstAidPayload);
  
  if (!firstAidInventoryResponse || firstAidInventoryResponse.error) {throw new Error("Failed to add FirstAid inventory.");}

  const action = "Added";
  const quantityString = formatQuantityString(
    data.finv_qty,
    data.finv_qty_unit,
    data.finv_pcs
  );
  const staffid=1

  const transactionPayload = FirstAidTransactionPayload(
    firstAidInventoryResponse.finv_id,
    quantityString,
    action,
    staffid
  );

  await addFirstAidTransaction(transactionPayload);
  
  // Refresh data
  await queryClient.invalidateQueries({ queryKey: ["firstaidinventorylist"] });
  await queryClient.invalidateQueries({ queryKey: ["firstaidtransactions"] });
  
  return { success: true };
};



export const formatQuantityString = (
  quantity: number,
  unit: string,
  pcsPerBox?: number
): string => {
  if (unit === "boxes" && pcsPerBox) {
    const boxText = quantity === 1 ? "box" : "boxes";
    return `${quantity} ${boxText} (${quantity * pcsPerBox} pcs total)`;
  }
  
  const unitText = quantity === 1 ? unit.replace(/s$/, "") : unit;
  return `${quantity} ${unitText}`;
};