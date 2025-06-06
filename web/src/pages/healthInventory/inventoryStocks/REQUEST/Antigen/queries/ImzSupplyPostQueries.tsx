import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  addImzTransaction,
  addImmunizationStock,
} from "../restful-api/ImzSupplyPostAPI";
import { ImmunizationSuppliesType } from "@/form-schema/inventory/stocks/inventoryStocksSchema";
import { useAddInventory } from "../../InventoryAPIQueries";

export const useAddImzTransaction = () => {
  return useMutation({
    mutationFn: ({
      string_qty,
      staffId,
      imzStck_id,
      action,
    }: {
      string_qty: string;
      staffId: number;
      imzStck_id: number;
      action: string;
    }) => addImzTransaction(string_qty, staffId, imzStck_id, action),
    onError: (error: Error) => {
      console.error("Error adding immunization transaction:", error.message);
    },
  });
};

export const useAddImmunizationStock = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      data,
      inv_id,
    }: {
      data: Record<string, any>;
      inv_id: number;
    }) => addImmunizationStock(data, inv_id),

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["immunizationStockList"] });
    },

    onError: (error: Error) => {
      console.error("Error adding immunization stock:", error.message);
    },
  });
};

export const useSubmitImmunizationStock = () => {
  const queryClient = useQueryClient();
  const { mutateAsync: addInventoryRecord } = useAddInventory();
  const { mutateAsync: addImmunizationStockRecord } = useAddImmunizationStock();
  const { mutateAsync: addImzTransactionRecord } = useAddImzTransaction();

  return useMutation({
    mutationFn: async (data: any) => {
      // Step 1: Create Inventory record
      const inventoryResponse = await addInventoryRecord({
        data: data,
        inv_type: "Antigen",
      });

      if (!inventoryResponse?.inv_id) {
        throw new Error("Failed to generate inventory ID.");
      }

      const inv_id = parseInt(inventoryResponse.inv_id, 10);

      // Calculate quantities depending on unit
      const isBoxes = data.imzStck_unit === "boxes";
      const imzStck_qty = isBoxes ? data.imzStck_qty : 0;
      const imzStck_per_pcs = isBoxes ? data.imzStck_pcs : 0;
      const imzStck_pcs = isBoxes
        ? data.imzStck_qty * (data.imzStck_pcs || 0)
        : data.imzStck_qty;
      const imzStck_avail = imzStck_pcs;

      // Step 2: Add Immunization Stock
      const stockResponse = await addImmunizationStockRecord({
        data: {
          ...data,
          imzStck_qty,
          imzStck_per_pcs,
          imzStck_pcs,
          imzStck_avail,
        },
        inv_id,
      });

      if (!stockResponse?.imzStck_id) {
        throw new Error("Failed to add immunization stock");
      }

      // Step 3: Add Transaction
      const string_qty =
        data.imzStck_unit === "boxes"
          ? `${data.imzStck_qty} boxes (${data.imzStck_pcs} pcs per box)`
          : `${data.imzStck_qty} ${data.imzStck_unit}`;
      const staffId = 1;
      const imzStck_id = stockResponse.imzStck_id;

      const transactionResponse = await addImzTransactionRecord({
        string_qty,
        staffId,
        imzStck_id,
        action: "Added",
      });

      if (!transactionResponse) {
        throw new Error("Failed to add immunization transaction");
      }

      return { success: true };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["immunizationStockList"] });
    },
    onError: (error: any) => {
      console.error(
        "Error submitting immunization stock:",
        error.message || error
      );
    },
  });
};
