import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateMedicine } from "../../restful-api/medicine/MedicinePutAPI";
import { MedicineType } from "@/form-schema/inventory/lists/inventoryListSchema";
import { showErrorToast, showSuccessToast } from "@/components/ui/toast";
export const useUpdateMedicine = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({med_id,data,}: {
      med_id: string; data: MedicineType; }) => updateMedicine(med_id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["medicines"] });
      queryClient.invalidateQueries({ queryKey: ['medicineCategories'] }); // Invalidate the query to refetch categories
      showSuccessToast("Medicine updated successfully");

    },
    onError: (error) => {
      console.error("Error updating medicine:", error);
      showErrorToast("Failed to update medicine");
    },
  });
  
};
