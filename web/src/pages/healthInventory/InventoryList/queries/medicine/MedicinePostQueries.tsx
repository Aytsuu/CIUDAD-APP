import { useMutation } from "@tanstack/react-query";
import { useQueryClient } from "@tanstack/react-query";
import { addMedicine } from "../../restful-api/medicine/MedlistPostAPI";
import { MedicineType } from "@/form-schema/inventory/lists/inventoryListSchema";


export const useAddMedicine = () => {
  const queryClient= useQueryClient();
  return useMutation({
    mutationFn: (data: MedicineType) => addMedicine(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["medicines"] });
      queryClient.invalidateQueries({ queryKey: ['medicineCategories'] }); // Invalidate the query to refetch categories

    },
  });
};



