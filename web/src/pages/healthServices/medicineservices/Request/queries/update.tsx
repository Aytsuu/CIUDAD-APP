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
    onSuccess: (variables) => {
      // Invalidate and refetch related queries
      queryClient.invalidateQueries({ queryKey: ["medicinesWithStock"] });
      queryClient.invalidateQueries({ queryKey: ["reportscount"] });
      queryClient.invalidateQueries({ queryKey: ["medicineStocks"] });
      queryClient.invalidateQueries({ queryKey: ["pendingmedrequest"] });
      queryClient.invalidateQueries({ queryKey: ["processingmedrequest"] });
      queryClient.invalidateQueries({ queryKey: ["pendingmedrequestitems"] });
      queryClient.invalidateQueries({ queryKey: ["individualMedicineRecords", variables.pat_id] });
      queryClient.invalidateQueries({ queryKey: ["medicineRecords"] });


      
      // Show success message with allocation details
      showSuccessToast("Confirmed Successfully"      );
      
      navigate(-1); // Navigate back to the previous page
    },
    onError: (error: any) => {
      const errorMessage = error.response?.data?.error || "Failed to confirm pending items";
      showErrorToast(errorMessage);
    }
  });
};