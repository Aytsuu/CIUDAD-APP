import { api } from "@/pages/api/api";
import { QueryClient } from "@tanstack/react-query";
import { addInventory } from "../../Inventory";

export interface CommodityStockType {
  com_id: number;
  cat_id: number;
  cinv_qty: number;
  cinv_qty_unit: string;
  cinv_pcs: number;
  cinv_qty_avail: number;
  cinv_dispensed: number;
  cinv_recevFrom: string;
  expiryDate: string;
  inv_id: number;
}

export interface CommodityTransactionType {
  comt_qty: string;
  comt_action: string;
  staff: number;
  cinv_id: number;
}

// Commodity Inventory API
export const addCommodityInventory = async (
  commodityData: CommodityStockType
) => {
  try {
    const res = await api.post(
      "inventory/commodityinventorylist/",
      commodityData
    );
    return res.data;
  } catch (err: any) {
    console.log("Error response:", err.response?.data || err.message);
    throw err;
  }
};

// Commodity Transaction API
export const addCommodityTransaction = async (
  transactionData: CommodityTransactionType
) => {
  try {
    const res = await api.post(
      "inventory/commoditytransaction/",
      transactionData
    );
    return res.data;
  } catch (err: any) {
    console.log("Error response:", err.response?.data || err.message);
    throw err;
  }
};

// Payload Formatters
export const CommodityPayload = ( 
  data: any,
  inv_id: number,
  parseCommodityID: number
): CommodityStockType => {
  const qty = Number(data.cinv_qty) || 0;
  const pcs = Number(data.cinv_pcs) || 0;
  const cinv_qty_avail = data.cinv_qty_unit === "boxes" ? qty * pcs : qty;

  return {
    com_id: parseCommodityID,
    cat_id: Number(data.cat_id),
    cinv_qty: qty,
    cinv_qty_unit: data.cinv_qty_unit,
    cinv_pcs: pcs,
    cinv_recevFrom: data.cinv_recevFrom,
    cinv_dispensed: data.cinv_dispensed || 0,
    cinv_qty_avail: cinv_qty_avail,
    inv_id,
    expiryDate: data.expiryDate,
  };
};

export const CommodityTransactionPayload = (
  cinv_id: number,
  string_qty: string,
  action: string
): CommodityTransactionType => ({
  comt_qty: string_qty,
  comt_action: action,
  staff: 1, // Consider making this dynamic
  cinv_id: cinv_id,
});

export const InventoryCommodityPayload = (data: any) => {
  return {
    expiry_date: data.expiryDate,
    inv_type: "Commodity",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
};
export const submitCommodityStock = async (
  data: any,
  queryClient: QueryClient
) => {
 
    // Step 1: Create inventory record
    const inv_type = "Commodity";
    const inventoryResponse = await addInventory(data,inv_type
    );

    if (!inventoryResponse?.inv_id) {
      throw new Error("Failed to generate inventory ID.");
    }

    const inv_id = parseInt(inventoryResponse.inv_id, 10);
    const parseCommodityID = parseInt(data.com_id, 10);

    if (isNaN(parseCommodityID)) {
      throw new Error("Invalid commodity ID.");
    }

    // Step 2: Create commodity inventory record
    const commodityPayload = CommodityPayload(data, inv_id, parseCommodityID);
    const commodityInventoryResponse = await addCommodityInventory(
      commodityPayload
    );

    if (!commodityInventoryResponse) {
      throw new Error("Failed to add commodity inventory.");
    }

    // Get the cinv_id from the newly created commodity inventory
    const cinv_id = commodityInventoryResponse.cinv_id;

    // Format the quantity string for the transaction
    const string_qty =
      data.cinv_qty_unit === "boxes"
        ? `${data.cinv_qty} boxes (${data.cinv_pcs} pcs per box)`
        : `${data.cinv_qty} ${data.cinv_qty_unit}`;

    const action = "Added";
    const commodityTransactionPayload = CommodityTransactionPayload(
      cinv_id,  // Use the newly created cinv_id
      string_qty,
      action
    );

    // Step 3: Create transaction record
    const commodityTransactionResponse = await addCommodityTransaction(
      commodityTransactionPayload
    );

    if (!commodityTransactionResponse || commodityTransactionResponse.error) {
      throw new Error("Failed to add Commodity transaction.");
    }

    // Invalidate queries to refresh the data
    await queryClient.invalidateQueries({
      queryKey: ["commodityinventorylist"],
    });

    
    return { success: true };
  };
  