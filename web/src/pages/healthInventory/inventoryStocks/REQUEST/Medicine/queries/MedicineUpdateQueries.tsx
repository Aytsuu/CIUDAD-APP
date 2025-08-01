import { useMutation, } from "@tanstack/react-query";
import { updateMedicineStocks, updateInventoryTimestamp } from "../restful-api/MedicinePutAPI";

export const useUpdateMedicineStocks = () => {
  return useMutation({
    mutationFn: ({ id, data }: { id: number, data: Record<string, any> }) => 
      updateMedicineStocks(id, data),
    onError: (error: Error) => {
      console.error(error.message);
    }
  });
};

export const useUpdateInventoryTimestamp = () => {
  return useMutation({
    mutationFn: (inv_id: string) => updateInventoryTimestamp(inv_id),
    onError: (error: Error) => {
      console.error(error.message);
    }
  });
};