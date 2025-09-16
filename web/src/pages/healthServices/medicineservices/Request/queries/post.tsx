// src/hooks/useRejectMedicineRequest.ts
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api2 } from "@/api/api";
import { showErrorToast, showSuccessToast } from "@/components/ui/toast";
import { useNavigate } from "react-router-dom";

export interface UpdateMedicineRequestData {
  status: string;
  archive_reason: string;
  is_archived: boolean;
}

export const useUpdateMedicineRequestItem = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ medreqitem_id, data }: { medreqitem_id: number; data: UpdateMedicineRequestData }) => api2.patch(`/medicine/update-medreq-item/${medreqitem_id}/`, data).then((res) => res.data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["medicineStocks"] });
      queryClient.invalidateQueries({ queryKey: ["medicine-request-items"] });
      queryClient.invalidateQueries({ queryKey: ["pendingmedrequest"] });
      queryClient.invalidateQueries({ queryKey: ["pendingmedrequestitems"] });

      // Dynamic success message based on status
      const message = variables.data.status === "rejected" ? "Document rejected successfully" : "Request referred successfully";
      showSuccessToast(message);
    },

    onError: (error: Error) => {
      console.error("Update failed:", error);
      showErrorToast("Failed to update document");
    }
  });
};

export const useCreateMedicineAllocation = () => {
  // Corrected function declaration
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  return useMutation({
    mutationFn: async (data: any) => {
      const response = await api2.post("medicine/create-medicine-allocation/", data);
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["medicine-requests"] });
      queryClient.invalidateQueries({ queryKey: ["pending-items"] });

      console.log("Allocation successful:", data);
      showSuccessToast("Allocation processed successfully");
      navigate(-1);
    },
    onError: (error: Error) => {
      console.error("Allocation error:", error);
      showErrorToast("Failed to process allocation");
    }
  });
};
