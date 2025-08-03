import { useMutation } from "@tanstack/react-query";
import { useQueryClient } from "@tanstack/react-query";
import { addMedicineInventory, addMedicineTransaction } from "../restful-api/MedicinePostAPI"; // Update the import path
// Update with your actual type


export interface MedicineTransactionType {
    mdt_qty: string;
    mdt_action: string;
    staff: string;
    minv_id: number;
  }
  
export const useAddMedicineInventory = () => {
  const queryClient = useQueryClient();
  interface AddMedicineInventoryMutationVariables {
    data: Record<string, any>;
    inv_id: string;
    staff: string;
  }

  return useMutation({
    mutationFn: ({ data, inv_id, staff }: AddMedicineInventoryMutationVariables) => 
      addMedicineInventory(data, inv_id, staff),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["medicineinventorylist"] }); // Update with your query key
    },
    onError: (error: Error) => {
      console.error("Error adding medicine inventory:", error.message);
    }
  });
};

export const useAddMedicineTransaction = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: MedicineTransactionType,) => addMedicineTransaction(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["medicinetransactions"] }); // Update with your query key
    },
    onError: (error: Error) => {
      // You can handle errors here if needed
      console.error("Error adding medicine transaction:", error.message);
    }
  });
};