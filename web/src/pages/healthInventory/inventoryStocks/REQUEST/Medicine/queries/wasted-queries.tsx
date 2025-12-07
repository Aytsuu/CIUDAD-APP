import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api2 } from "@/api/api";
import { showErrorToast, showSuccessToast } from "@/components/ui/toast";

export const useHandleMedicineDeduction = () => {
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: async (data: any) => {
      if (process.env.NODE_ENV === "development") {
        console.log("Deduction data:", data);
      }
      const medStck_id = data?.record?.id;
      if (!medStck_id) {
        if (process.env.NODE_ENV === "development") {
          console.error("Missing medicine stock ID");
        }
        return null;
      }
      try {
        const response = await api2.post("inventory/medicine-deduct/", data);
        return response.data;
      } catch (error: any) {
        if (process.env.NODE_ENV === "development") {
          console.error("Error while deducting medicine:", error);
        }
        return null;
      }
    },
    onSuccess: () => {
      showSuccessToast("Deducted successfully");
      queryClient.invalidateQueries({ queryKey: ["medicineStocks"] });
      queryClient.invalidateQueries({ queryKey: ["medicinetransactions"] });
    },
    onError: (error: any) => {
      showErrorToast((error && error.message) || "Failed to deduct medicine");
      if (process.env.NODE_ENV === "development" && error) {
        console.error(error);
      }
    }
  });
  return {
    mutateAsync: mutation.mutateAsync,
    isPending: mutation.isPending
  };
};
