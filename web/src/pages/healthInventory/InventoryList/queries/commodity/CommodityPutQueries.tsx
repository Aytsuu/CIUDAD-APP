import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateCommodity } from "../../restful-api/commodity/CommodityPutAPI";
import { CommodityType } from "@/form-schema/inventory/lists/inventoryListSchema";

export const useUpdateCommodity = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({com_id,data,}: {
      com_id: string; data: CommodityType; }) => updateCommodity(com_id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["commodities"] });
    },
    onError: (error) => {
      console.error("Error updating commodity:", error);
    },
  });
  
};

