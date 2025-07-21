import { useMutation } from "@tanstack/react-query";
import { useQueryClient } from "@tanstack/react-query";
import { addMedicineInventory, addMedicineTransaction } from "../restful-api/MedicinePostAPI"; // Update the import path
import { MedicineStockType } from "@/form-schema/inventory/stocks/inventoryStocksSchema"; // Update with your actual type


export interface MedicineTransactionType {
    mdt_qty: string;
    mdt_action: string;
    mdt_staff: number;
    minv_id: number;
  }
  
export const useAddMedicineInventory = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ data, inv_id }: { data: Record<string, any>, inv_id: string }) => 
      addMedicineInventory(data, inv_id),
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
    mutationFn: (data: MedicineTransactionType) => addMedicineTransaction(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["medicinetransactions"] }); // Update with your query key
    },
    onError: (error: Error) => {
      // You can handle errors here if needed
      console.error("Error adding medicine transaction:", error.message);
    }
  });
};