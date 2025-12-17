import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api2 } from "@/api/api";
import { showErrorToast, showSuccessToast } from "@/components/ui/toast";

export const useHandleCommodityDeduction = () => {
    const queryClient=useQueryClient()
  const mutation = useMutation({
    mutationFn: async (data: any) => {
      if (process.env.NODE_ENV === 'development') {
        console.log("Deduction data:", data);
      }
      const id = data?.record?.id;
      if (!id) {
        if (process.env.NODE_ENV === 'development') {
          console.error("Missing Commodity stock ID");
        }
        return;
      }
      try {
        const response = await api2.post("inventory/commodity-deduct/", data);
        return response.data;
      } catch (error: any) {
        if (process.env.NODE_ENV === 'development') {
          console.error("Error while deducting Commodity:", error);
        }
        if (error.response?.data?.message) {
          if (process.env.NODE_ENV === 'development') {
            console.error(error.response.data.message);
          }
          return;
        }
        if (process.env.NODE_ENV === 'development') {
          console.error("An unexpected error occurred while deducting Commodity");
        }
        return;
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
