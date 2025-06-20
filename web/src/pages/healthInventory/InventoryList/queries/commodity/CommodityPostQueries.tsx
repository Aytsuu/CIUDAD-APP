import { useMutation } from "@tanstack/react-query";
import { useQueryClient } from "@tanstack/react-query";
import { addCommodity } from "../../restful-api/commodity/CommodityPostAPI";
import { CommodityType } from "@/form-schema/inventory/lists/inventoryListSchema";
import { toast } from "sonner";
import { useNavigate } from "react-router";

export const useAddCommodity = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  return useMutation({
    mutationFn: async (data: CommodityType) => {
      console.log("Adding commodity with data:", data);
      const response = await addCommodity(data); // actual post call
      console.log("Response from addCommodity:", response);
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["commodities"] });
      navigate(-1)
      toast.success("Commodity added successfully", {
        description: "The commodity has been added to the inventory list.",
      });
    },
    onError: (error: any) => {
      console.error("Error from mutation:", error?.response?.data || error);
      toast.error("Failed to add commodity", {
        description: "An error occurred while adding the commodity. Please try again.",
      });
    },
  });
};
