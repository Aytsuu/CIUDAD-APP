import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  addCommodityInventory,
  addCommodityTransaction,
} from "../restful-api/CommodityPostAPI";
import { useAddInventory } from "../../InventoryAPIQueries";

export const useAddCommodityInventory = () => {
  return useMutation({
    mutationFn: ({
      data,
      inv_id,
    }: {
      data: Record<string, any>;
      inv_id: number;
    }) => addCommodityInventory(data, inv_id),
    onError: (error: Error) => {
      console.error(error.message);
    },
  });
  
};

export const useAddCommodityTransaction = () => {
  return useMutation({
    mutationFn: ({
      string_qty,
      staffId,
      cinv_id,
      action,
    }: {
      string_qty: string;
      staffId: number;
      cinv_id: number;
      action: string;
    }) => addCommodityTransaction(string_qty, staffId, cinv_id, action),
    onError: (error: Error) => {
      console.error(error.message);
    },
  });
};


export const useSubmitCommodityStock = () => {
  const queryClient = useQueryClient();
  const { mutateAsync: addInventoryRecord } = useAddCommodityInventory();
  const { mutateAsync: addTransaction } = useAddCommodityTransaction();
  const { mutateAsync: addInventory } = useAddInventory();

  return useMutation({
    mutationFn: async (data: any) => {
      // Step 1: Create inventory record
      const inventoryResponse = await addInventory({
        data,
        inv_type: "Commodity",
      });

      if (!inventoryResponse?.inv_id) {
        throw new Error("Failed to generate inventory ID.");
      }

      const inv_id = parseInt(inventoryResponse.inv_id, 10);
      const qty = Number(data.cinv_qty) || 0;
      const pcs = Number(data.cinv_pcs) || 0;
      const cinv_qty_avail = data.cinv_qty_unit === "boxes" ? qty * pcs : qty;

      const commodityPayload = {
        com_id: data.com_id,
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

      // Step 2: Add commodity inventory
      const commodityInventoryResponse = await addInventoryRecord({
        data: commodityPayload,
        inv_id,
      });

      if (!commodityInventoryResponse) {
        throw new Error("Failed to add commodity inventory.");
      }

      const cinv_id = commodityInventoryResponse.cinv_id;

      // Step 3: Add transaction
      const string_qty =
        data.cinv_qty_unit === "boxes"
          ? `${data.cinv_qty} boxes (${data.cinv_pcs} pcs per box)`
          : `${data.cinv_qty} ${data.cinv_qty_unit}`;

      const action = "Added";
      const staffId = 1; // You may later replace this with dynamic auth-based value

      const commodityTransactionResponse = await addTransaction({
        string_qty,
        staffId,
        cinv_id,
        action,
      });

      if (!commodityTransactionResponse || commodityTransactionResponse.error) {
        throw new Error("Failed to add Commodity transaction.");
      }

      return { success: true };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["commodityinventorylist"] });
    
    
    },
    onError: (error: Error) => {
      console.error(error.message);
    },
  });
};




