import { useMutation, useQueryClient } from "@tanstack/react-query";
import {createVaccineStock} from "../restful-api/VaccinePostAPI";
import { useNavigate } from "react-router";
import { showErrorToast, showSuccessToast } from "@/components/ui/toast";

export const useSubmitVaccineStock = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: async ({ data }: { data:any }) => {
      console.log("Data being submitted:", data);
      
      const vac_id = Number(data.vac_id);
      if (isNaN(vac_id)) {
        throw new Error("Invalid vaccine selection");
      }

      const atomicData = { ...data, vac_id,};

      // Single API call handles all three operations atomically
      const result = await createVaccineStock(atomicData);
      return result;
    },
    onSuccess: (data) => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ["combinedStocks"] });
      queryClient.invalidateQueries({ queryKey: ["inventorylist"] });
      queryClient.invalidateQueries({ queryKey: ["vaccine_stocks"] });
      queryClient.invalidateQueries({ queryKey: ["antigen_transactions"] });
      
      navigate(-1);
      showSuccessToast("Added successfully");
      
      console.log("Created records:", data.data);
    },
    onError: (error) => {
      console.error("Failed to add vaccine stock:", error);
      showErrorToast(error.message || "Failed to Add");
    },
  });
};
