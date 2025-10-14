// src/hooks/useRejectMedicineRequest.ts
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { confirmAllPendingItems } from "../restful-api/update";
import { showSuccessToast, showErrorToast } from "@/components/ui/toast";
import { useNavigate } from "react-router";

export const useConfirmAllPendingItems = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: (payload: {
      medreq_id: string;
      selected_medicines: any[];
      staff_id?: string;
      pat_id: string;
    }) => confirmAllPendingItems(payload),
    onSuccess: (data, variables) => {
      // Invalidate and refetch related queries
      queryClient.invalidateQueries({ queryKey: ["pendingItemsMedRequest", variables.medreq_id] });
      queryClient.invalidateQueries({ queryKey: ["medicineRequestItems"] });
      queryClient.invalidateQueries({ queryKey: ["medicinesWithStock"] });
      queryClient.invalidateQueries({ queryKey: ["reportscount"] });
      
      // Show success message with allocation details
      showSuccessToast(
        `Medicine request confirmed successfully! ${data.allocations_created} allocations created.`
      );
      
      navigate(-1); // Navigate back to the previous page
    },
    onError: (error: any) => {
      const errorMessage = error.response?.data?.error || "Failed to confirm pending items";
      showErrorToast(errorMessage);
    }
  });
};