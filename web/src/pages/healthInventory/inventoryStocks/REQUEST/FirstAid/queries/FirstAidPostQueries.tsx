// src/services/firstAid/hooks/useFirstAidMutations.ts
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { CircleCheck } from "lucide-react";
import {
  addFirstAidInventory,
  addFirstAidTransaction,
} from "../restful-api/FirstAidPostAPI";
import { useAddInventory } from "../../InventoryAPIQueries";
import { useNavigate } from "react-router";

export const useAddFirstAidInventory = () => {

  return useMutation({
    mutationFn: ({
      data,
      inv_id,
      fa_id,
      staff_id
    }: {
      data: Record<string, any>;
      inv_id: string;
      fa_id: string;
      staff_id:string
    }) => addFirstAidInventory(data, inv_id, fa_id,staff_id),
    onError: (error: Error) => {
      console.error(error.message);
    },
  });
};



export const useSubmitFirstAidStock = () => {
  const queryClient = useQueryClient();
  const navigate=useNavigate()
  const { mutateAsync: addFirstAidInventory } = useAddFirstAidInventory();
  const { mutateAsync: addInventory } = useAddInventory();

  return useMutation({
    mutationFn: async ({ data, staff_id }: { data: any; staff_id: string }) => {
      const inventoryResponse = await addInventory({
        data,
        inv_type: "First Aid",
        staff:staff_id
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
        staff_id
      });

      if (!firstAidInventoryResponse) {
        throw new Error("Failed to add FirstAid inventory.");
      }

      const string_qty =
      data.finv_qty_unit === "boxes"
        ? `${data.finv_qty} boxes (${data.finv_pcs} pcs per box)`
        : `${data.finv_qty} ${data.finv_qty_unit}`;


      const staffId = staff_id; // Replace with actual staff ID from your auth system

      await addFirstAidTransaction({
        finv_id: firstAidInventoryResponse.finv_id,
        fat_qty:string_qty,
        fat_action: "Added",
        staffId,
      });
      queryClient.invalidateQueries({ queryKey: ["firstaidinventorylist"] });
      queryClient.invalidateQueries({ queryKey: ["firstaidtransactions"] });
   
      return;
    },
    onSuccess: () => {
      navigate(-1);
      toast.success("Added successfully", {
        icon: <CircleCheck size={24} className="fill-green-500 stroke-white" />,
        duration: 2000,
      });
    },
    onError: (error: any) => {
      const message = error?.response?.data?.error || "Failed to add";
      toast.error(message, {
        icon: <CircleCheck size={24} className="fill-red-500 stroke-white" />,
        duration: 2000,
      });
    },
  });
};
