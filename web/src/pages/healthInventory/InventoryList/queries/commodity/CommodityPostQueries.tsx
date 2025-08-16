import { useMutation } from "@tanstack/react-query";
import { useQueryClient } from "@tanstack/react-query";
import { addCommodity } from "../../restful-api/commodity/CommodityPostAPI";
import { CommodityType } from "@/form-schema/inventory/lists/inventoryListSchema";
import { useNavigate } from "react-router";
import { showErrorToast,showSuccessToast } from "@/components/ui/toast";

export const useAddCommodity = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: CommodityType) => {
      return await addCommodity(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["commodities"] });
    },
    onError: (error: any) => {
      console.error("Error adding commodity:", error);
      throw error; // Re-throw to be caught in the component
    },
  });
};