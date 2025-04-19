// src/services/firstAid/hooks/useFirstAidMutations.ts
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { CircleCheck } from "lucide-react";
import { addFirstAidInventory, addFirstAidTransaction } from "../restful-api/FirstAidPost";
import { addInventory } from "../../Inventory";
import { formatQuantityString } from "../../FormatQuantityString";

export const useAddFirstAidInventory = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({
      formData,
      inv_id,
      parseFirstAidID
    }: {
      formData: any;
      inv_id: number;
      parseFirstAidID: number;
    }) => addFirstAidInventory(formData, inv_id, parseFirstAidID),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["firstaidinventorylist"] });
    }
  });
};

export const useAddFirstAidTransaction = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({
      finv_id,
      string_qty,
      action,
      staffId
    }: {
      finv_id: number;
      string_qty: string;
      action: string;
      staffId: number;
    }) => addFirstAidTransaction(finv_id, string_qty, action, staffId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["firstaidtransactions"] });
    }
  });
};

export const useSubmitFirstAidStock = () => {
  const queryClient = useQueryClient();
  const { mutateAsync: addFirstAidInventory } = useAddFirstAidInventory();
  const { mutateAsync: addFirstAidTransaction } = useAddFirstAidTransaction();
  
  return useMutation({
    mutationFn: async (data: any) => {
      // ADD INVENTORY
      const inv_type = "FirstAid";
      const inventoryResponse = await addInventory(data, inv_type);
      
      if (!inventoryResponse?.inv_id) {
        throw new Error("Failed to generate inventory ID.");
      }
      
      const inv_id = parseInt(inventoryResponse.inv_id, 10);
      const parseFirstAidID = parseInt(data.fa_id, 10);
      
      if (!data.fa_id) {
        throw new Error("Failed to get FirstAid ID.");
      }

      // ADD FIRSTAID STOCKS
      const firstAidInventoryResponse = await addFirstAidInventory({
        formData: data,
        inv_id,
        parseFirstAidID
      });

      if (!firstAidInventoryResponse) {
        throw new Error("Failed to add FirstAid inventory.");
      }

      // TRANSACTION
      const quantityString = formatQuantityString(
        data.finv_qty, 
        data.finv_qty_unit, 
        data.finv_pcs
      );
      const staffId = 1; // Replace with actual staff ID from your auth system
      
      await addFirstAidTransaction({
        finv_id: firstAidInventoryResponse.finv_id,
        string_qty: quantityString,
        action: "Added",
        staffId
      });

      return { success: true };
    },
    onSuccess: () => {
      // Refresh all related data
      queryClient.invalidateQueries({ queryKey: ["firstaidinventorylist"] });
      queryClient.invalidateQueries({ queryKey: ["firstaidtransactions"] });
      
      toast.success('First Aid item added successfully', {
        icon: <CircleCheck size={24} className="fill-green-500 stroke-white" />,
        duration: 2000,     
      });
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to add First Aid item", {
        duration: 3000,
      });
    }
  });
};