import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateCommodity } from "../../restful-api/commodity/CommodityPutAPI";
import { CommodityType } from "@/form-schema/inventory/lists/inventoryListSchema";
import { toast } from "sonner";
import { useNavigate } from "react-router";
export const useUpdateCommodity = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  return useMutation({
    mutationFn: ({com_id,data}: {
      com_id: string; data: Record<string,any>; }) => updateCommodity(com_id, data),
    onSuccess: () => {
      navigate(-1)
      toast.success("Commodity updated successfully", {
        description: "The commodity has been updated in the inventory list.",
      });
      queryClient.invalidateQueries({ queryKey: ["commodities"] });
    },
    onError: (error) => {
      console.error("Error updating commodity:", error);
    },
  });
  
};

