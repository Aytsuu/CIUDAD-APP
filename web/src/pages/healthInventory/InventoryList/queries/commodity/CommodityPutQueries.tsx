import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateCommodity } from "../../restful-api/commodity/CommodityPutAPI";
import { showErrorToast, showSuccessToast } from "@/components/ui/toast";

export const useUpdateCommodity = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (params: { com_id: string; data: Record<string,any> }) => {
      return await updateCommodity(params.com_id, params.data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["commodities"] });
      queryClient.invalidateQueries({ queryKey: ["commodity"] });
      queryClient.invalidateQueries({ queryKey: ["commoditylistcount"] });
      showSuccessToast("updated successfully!");
    },
    onError: (error: any) => {
      console.error("Error updating commodity:", error);
      showErrorToast("Failed to update. Please try again.");
      throw error; // Re-throw to be caught in the component

    },
  });
};