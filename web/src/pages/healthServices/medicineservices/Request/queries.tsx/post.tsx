// src/hooks/useRejectMedicineRequest.ts
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { api2 } from "@/api/api";
import { showErrorToast, showSuccessToast } from "@/components/ui/toast";

export interface UpdateMedicineRequestData {
  status: string;
  archive_reason: string;
  is_archived: boolean;
}

export const useUpdateMedicineRequestItem = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ medreqitem_id, data }: { medreqitem_id: number; data: UpdateMedicineRequestData }) =>
      api2.patch(`/inventory/update-medreq-item/${medreqitem_id}/`, data).then((res) => res.data),
    
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["medicineStocks"] });
      queryClient.invalidateQueries({ queryKey: ["medicine-request-items"] });
      queryClient.invalidateQueries({ queryKey: ["pendingmedrequest"] });
      queryClient.invalidateQueries({ queryKey: ["pendingmedrequestitems"] });
      
      // Dynamic success message based on status
      const message = variables.data.status === "rejected" 
        ? "Document rejected successfully" 
        : "Request referred successfully";
      showSuccessToast(message);
    },

    onError: (error: Error) => {
      console.error("Update failed:", error);
      showErrorToast("Failed to update document");
    }
  });
};