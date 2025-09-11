import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { processMedicineRequest } from "./processSubmit";
import { showSuccessToast } from "@/components/ui/toast";
import { showErrorToast } from "@/components/ui/toast";

export const useMedicineRequestMutation = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ data, staff_id }: { data: any; staff_id: string | null }) => {
      // Allow null
      return processMedicineRequest(data, staff_id);
    },
    onSuccess: () => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ["medicinetransactions"] });
      queryClient.invalidateQueries({ queryKey: ["medicineStocks"] });
      queryClient.invalidateQueries({ queryKey: ["inventorylist"] });
      showSuccessToast("Medicine request submitted successfully!");
      navigate(-1);
    },
    onError: (error: Error) => {
      console.error("Submission failed:", error);
      showErrorToast(error.message || "Failed to submit medicine request. Please try again.");
    }
  });
};
