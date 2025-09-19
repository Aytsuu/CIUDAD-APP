import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api2 } from "@/api/api";
import { showErrorToast, showSuccessToast } from "@/components/ui/toast";

export const useHandleCommodityDeduction = () => {
    const queryClient=useQueryClient()
  const mutation = useMutation({
    mutationFn: async (data: any) => {
      console.log("Deduction data:", data);
      const id = data?.record?.id;
      if (!id) {
        throw new Error("Missing Commodity stock ID");
      }
      try {
        const response = await api2.post("inventory/commodity-deduct/", data);
        return response.data;
      } catch (error: any) {
        console.error("Error while deducting Commodity:", error);
        if (error.response?.data?.message) {
          throw new Error(error.response.data.message);
        }
        throw new Error("An unexpected error occurred while deducting Commodity");
      }
    },
    onSuccess: () => {
      showSuccessToast("Deducted successfully");
        queryClient.invalidateQueries({ queryKey: ["commodityStocks"] });
        queryClient.invalidateQueries({ queryKey: ["commoditytransactions"] });
    },
    onError: (error: any) => {
      showErrorToast(error.message || "Failed to deduct Commodity");
    }
  });
  return {
    mutateAsync: mutation.mutateAsync,
    isPending: mutation.isPending
  };
};
