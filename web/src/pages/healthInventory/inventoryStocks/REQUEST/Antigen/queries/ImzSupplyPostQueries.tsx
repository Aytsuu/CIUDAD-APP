import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createImmunizationStock } from "../restful-api/post";
import { useNavigate } from "react-router";
import { showErrorToast, showSuccessToast } from "@/components/ui/toast";

export const useSubmitImmunizationStock = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: async ({ data }: { data: any }) => {
      console.log("Data being submitted:", data);
      
      const imz_id = Number(data.imz_id);
      if (isNaN(imz_id)) {
        throw new Error("Invalid immunization supply selection");
      }

      const atomicData = { ...data, imz_id };
      const result = await createImmunizationStock(atomicData);
      return result;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["immunizationStockList"] });
      queryClient.invalidateQueries({ queryKey: ["combinedStocks"] });
      queryClient.invalidateQueries({ queryKey: ["antigen_transactions"] });
      queryClient.invalidateQueries({ queryKey: ["inventorylist"] });
      
      navigate(-1);
      showSuccessToast("Added successfully");
      
      console.log("Created records:", data.data);
    },
    onError: (error) => {
      console.error("Failed to add immunization stock:", error);
      showErrorToast(error.message || "Failed to Add");
    },
  });
};