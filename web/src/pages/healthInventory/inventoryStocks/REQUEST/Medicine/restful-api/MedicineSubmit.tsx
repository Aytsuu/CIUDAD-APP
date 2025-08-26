// src/services/medicine/hooks/useMedicineStockMutations.ts
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createMedicineStock } from "../restful-api/MedicinePostAPI";
import { useNavigate } from "react-router";
import { showErrorToast, showSuccessToast } from "@/components/ui/toast";

export const useSubmitMedicineStock = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: async ({ data }: { data: any }) => {
      console.log("Data being submitted:", data);

      const medicineID = data.medicineID;

      const atomicData = { ...data, medicineID };

      const result = await createMedicineStock(atomicData);
      return result;
    },
    onSuccess: (data) => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ["medicineinventorylist"] });
      queryClient.invalidateQueries({ queryKey: ["medicinetransactions"] });
      queryClient.invalidateQueries({ queryKey: ["inventorylist"] });

      navigate(-1);
      showSuccessToast("Added successfully");

      console.log("Created records:", data.data);
    },
    onError: (error: any) => {
      console.error("Failed to add medicine stock:", error);
      showErrorToast(error.message || "Failed to Add");
    }
  });
};
