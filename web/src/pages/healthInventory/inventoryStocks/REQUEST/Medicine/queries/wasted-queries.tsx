import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api2 } from "@/api/api";
import { showErrorToast, showSuccessToast } from "@/components/ui/toast";

export const useHandleMedicineDeduction = () => {
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: async (data: any) => {
      console.log("Deduction data:", data);
      const medStck_id = data?.record?.id;
      if (!medStck_id) {
        throw new Error("Missing medicine stock ID");
      }
      try {
        const response = await api2.post("inventory/medicine-deduct/", data);
        return response.data;
      } catch (error: any) {
        console.error("Error while deducting medicine:", error);
        if (error.response?.data?.message) {
          throw new Error(error.response.data.message);
        }
        throw new Error("An unexpected error occurred while deducting medicine");
      }
    },
    onSuccess: () => {
      showSuccessToast("Deducted successfully");
      queryClient.invalidateQueries({ queryKey: ["medicineStocks"] });
      queryClient.invalidateQueries({ queryKey: ["medicinetransactions"] });
    },
    onError: (error: any) => {
      showErrorToast(error.message || "Failed to deduct medicine");
    }
  });
  return {
    mutateAsync: mutation.mutateAsync,
    isPending: mutation.isPending
  };
};
