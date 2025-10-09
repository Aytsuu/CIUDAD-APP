// src/hooks/useRejectAppointment.ts
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api2 } from "@/api/api";
import { showErrorToast, showSuccessToast } from "@/components/ui/toast";

export interface RejectAppointmentData {
  appointmentId: string;
  status: string;
  reason: string;
}

export const useActionAppointment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ appointmentId, status, reason }: RejectAppointmentData) =>
      api2
        .patch(`/medical-consultation/action-appointment/${appointmentId}/`, {
          status: status,
          archive_reason: reason
        })
        .then((res) => res.data),

    onSuccess: () => {
      // Invalidate relevant queries to refresh data
      queryClient.invalidateQueries({ queryKey: ["pendingmedicalapp"] });
      queryClient.invalidateQueries({ queryKey: ["appointments"] });
      queryClient.invalidateQueries({ queryKey: ["medical-appointments"] });

      showSuccessToast("Appointment rejected successfully");
    },

    onError: (error: Error) => {
      console.error("Failed to reject appointment:", error);
      showErrorToast("Failed to reject appointment");
    }
  });
};
