import { useMutation } from "@tanstack/react-query";
import { useQueryClient } from "@tanstack/react-query";
import { addCommodity } from "../../restful-api/commodity/CommodityPostAPI";
import { CommodityType } from "@/form-schema/inventory/lists/inventoryListSchema";


export const useAddCommodity = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CommodityType) => addCommodity(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["commodities"] });
    },
  });
};
