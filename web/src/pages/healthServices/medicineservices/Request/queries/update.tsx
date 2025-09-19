// src/hooks/useRejectMedicineRequest.ts
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { confirmAllPendingItems } from "../restful-api/update";
import { showSuccessToast, showErrorToast } from "@/components/ui/toast";
import { useNavigate } from "react-router";

export const useConfirmAllPendingItems = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: confirmAllPendingItems,
    onSuccess: (variables) => {
      // Invalidate and refetch related queries
      queryClient.invalidateQueries({ queryKey: ["pendingItemsMedRequest", variables] });
      queryClient.invalidateQueries({ queryKey: ["medicineRequestItems"] });
      queryClient.invalidateQueries({ queryKey: ["medicinesWithStock"] });

      navigate(-1); // Navigate back to the previous page
      showSuccessToast("All pending items confirmed successfully");
    },
    onError: (error) => {
      console.error("Failed to confirm pending items:", error);
      showErrorToast;
    }
  });
};
