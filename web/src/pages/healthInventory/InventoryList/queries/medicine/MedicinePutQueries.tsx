import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateMedicine } from "../../restful-api/medicine/MedicinePutAPI";
import { MedicineType } from "@/form-schema/inventory/lists/inventoryListSchema";

export const useUpdateMedicine = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({med_id,data,}: {
      med_id: string; data: MedicineType; }) => updateMedicine(med_id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["medicines"] });
    },
    onError: (error) => {
      console.error("Error updating medicine:", error);
    },
  });
  
};
