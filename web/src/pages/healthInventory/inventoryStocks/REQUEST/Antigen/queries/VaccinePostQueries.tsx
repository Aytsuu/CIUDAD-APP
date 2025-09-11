import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createVaccineStock } from "../restful-api/post";
import { useNavigate } from "react-router";
import { showErrorToast, showSuccessToast } from "@/components/ui/toast";

export const useSubmitVaccineStock = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: async ({ data }: { data: any }) => {
      const vac_id = Number(data.vac_id);
      if (isNaN(vac_id)) {
        throw new Error("Invalid vaccine selection");
      }
      const atomicData = { ...data, vac_id };
      const result = await createVaccineStock(atomicData);
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["combinedStocks"] });
      queryClient.invalidateQueries({ queryKey: ["inventorylist"] });
      queryClient.invalidateQueries({ queryKey: ["vaccine_stocks"] });
      queryClient.invalidateQueries({ queryKey: ["antigen_transactions"] });
      navigate(-1);
      showSuccessToast("Added successfully");

    },
    onError: (error) => {
      showErrorToast(error.message || "Failed to Add");
    }
  });
};
