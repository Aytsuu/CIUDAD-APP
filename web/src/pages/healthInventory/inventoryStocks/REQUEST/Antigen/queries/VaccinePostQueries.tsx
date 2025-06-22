import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  addVaccineStock,
  AntigenTransaction,
} from "../restful-api/VaccinePostAPI";
import { useAddInventory } from "../../InventoryAPIQueries";
import { toast } from "sonner";
import { CircleCheck } from "lucide-react";
import { useNavigate } from "react-router";
export const useAddVaccineStock = () => {
  return useMutation({
    mutationFn: ({
      data,
      vac_id,
      inv_id,
    }: {
      data: Record<string, any>;
      vac_id: number;
      inv_id: string;
    }) => addVaccineStock(data, vac_id, inv_id),
    onError: (error: Error) => {
      console.error("Error adding vaccine stock:", error.message);
    },
  });
};

// Mutation hook for antigen transaction
export const useAntigenTransaction = () => {
  return useMutation({
    mutationFn: ({
      vacStck_id,
      string_qty,
      action,
      staffId,
    }: {
      vacStck_id: number;
      string_qty: string;
      action: string;
      staffId: number;
    }) => AntigenTransaction(vacStck_id, string_qty, action, staffId),
    onError: (error: Error) => {
      console.error("Error during antigen transaction:", error.message);
    },
  });
};

export const useSubmitVaccineStock = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { mutateAsync: addInventoryRecord } = useAddInventory();
  return useMutation({
    mutationFn: async (data: Record<string, any>) => {
      const inventoryResponse = await addInventoryRecord({
        data: data,
        inv_type: "Antigen",
      });

      if (!inventoryResponse?.inv_id) {
        throw new Error("Failed to generate inventory ID.");
      }
      const inv_id = inventoryResponse.inv_id;

      // 2) Add Vaccine Stock
      const vac_id = Number(data.vac_id);
      if (isNaN(vac_id)) throw new Error("Invalid vaccine selection");

      const addedStock = await addVaccineStock(data, vac_id, inv_id);
      if (!addedStock?.vacStck_id)
        throw new Error("Failed to get the new stock ID");

      // 3) Add Transaction
      const unit = data.solvent === "doses" ? "vial/s" : "container/s";
      const string_qty = `${data.qty} ${unit}`;
      const staffId = 1; // Replace with actual staff id from auth system

      await AntigenTransaction(
        addedStock.vacStck_id,
        string_qty,
        "Added",
        staffId
      );
      queryClient.invalidateQueries({ queryKey: ["combinedStocks"] }); // Adjust key if needed

      return { success: true };
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
