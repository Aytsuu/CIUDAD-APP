// src/services/commodity/hooks/useCommodityStockMutations.ts
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createCommodityStock } from "../restful-api/CommodityPostAPI";
import { useNavigate } from "react-router";
import { showErrorToast, showSuccessToast } from "@/components/ui/toast";

export const useSubmitCommodityStock = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: async ({ data }: { data: any }) => {
      console.log("Data being submitted:", data);
      const com_id = data.com_id;
      if (!com_id) {
        throw new Error("Invalid commodity selection: com_id must have a value");
      }
      const atomicData = { ...data, com_id };
      const result = await createCommodityStock(atomicData);
      return result;
    },
    onSuccess: (data) => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ["commodityinventorylist"] });
      queryClient.invalidateQueries({ queryKey: ["commoditytransactions"] });
      queryClient.invalidateQueries({ queryKey: ["inventorylist"] });
      queryClient.invalidateQueries({ queryKey: ["commodityStocks"] });

      navigate(-1);
      showSuccessToast("Added successfully");

      console.log("Created records:", data.data);
    },
    onError: (error) => {
      console.error("Failed to add commodity stock:", error);
      showErrorToast(error.message || "Failed to Add");
    }
  });
};
