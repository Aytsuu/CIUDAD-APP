// src/services/firstAid/hooks/useFirstAidMutations.ts
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { CircleCheck } from "lucide-react";
import {
  addFirstAidInventory,
  addFirstAidTransaction,
} from "../restful-api/FirstAidPostAPI";
import { useAddInventory } from "../../InventoryAPIQueries";
import { formatQuantityString } from "../../FormatQuantityString";

export const useAddFirstAidInventory = () => {
  return useMutation({
    mutationFn: ({
      data,
      inv_id,
      fa_id,
    }: {
      data: Record<string, any>;
      inv_id: string;
      fa_id: string;
    }) => addFirstAidInventory(data, inv_id, fa_id),
    onError: (error: Error) => {
      console.error(error.message);
    },
  });
};

export const useAddFirstAidTransaction = () => {
  return useMutation({
    mutationFn: ({
      finv_id,
      string_qty,
      action,
      staffId,
    }: {
      finv_id: number;
      string_qty: string;
      action: string;
      staffId: number;
    }) => addFirstAidTransaction(finv_id, string_qty, action, staffId),
    onError: (error: Error) => {
      console.error(error.message);
    },
  });
};

export const useSubmitFirstAidStock = () => {
  const queryClient = useQueryClient();
  const { mutateAsync: addFirstAidInventory } = useAddFirstAidInventory();
  const { mutateAsync: addFirstAidTransaction } = useAddFirstAidTransaction();
  const { mutateAsync: addInventory } = useAddInventory();

  return useMutation({
    mutationFn: async (data: any) => {
      const inventoryResponse = await addInventory({
        data,
        inv_type: "First Aid",
      });
      if (!inventoryResponse?.inv_id) {
        throw new Error("Failed to generate inventory ID.");
      }

      const inv_id = inventoryResponse.inv_id;
      const fa_id = data.fa_id;

      if (!data.fa_id) {
        throw new Error("Failed to get FirstAid ID.");
      }

      // ADD FIRSTAID STOCKS
      const firstAidInventoryResponse = await addFirstAidInventory({
        data: data,
        inv_id,
        fa_id,
      });

      if (!firstAidInventoryResponse) {
        throw new Error("Failed to add FirstAid inventory.");
      }

      const string_qty =
      data.finv_qty_unit === "boxes"
        ? `${data.finv_qty} boxes (${data.finv_pcs} pcs per box)`
        : `${data.finv_qty} ${data.finv_qty_unit}`;


      const staffId = 1; // Replace with actual staff ID from your auth system

      await addFirstAidTransaction({
        finv_id: firstAidInventoryResponse.finv_id,
        string_qty,
        action: "Added",
        staffId,
      });

      return { success: true };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["firstaidinventorylist"] });
      queryClient.invalidateQueries({ queryKey: ["firstaidtransactions"] });
    },
    onError: (error: Error) => {
      console.error(error.message);
    },
  });
};
