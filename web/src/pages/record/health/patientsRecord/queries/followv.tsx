// hooks/useFollowUpVisits.ts
import { useQuery } from "@tanstack/react-query";
import { api2 } from "@/api/api";

type FollowUpStatus = "completed" | "pending" | "missed" | "all";

export function usePatientFollowUpVisits(patientId: string, status: FollowUpStatus = "all") {
  return useQuery({
    queryKey: ["patientFollowUpVisits", patientId, status],
    queryFn: async () => {
      const response = await api2.get(`/patientrecords/patient-followup-visits/${patientId}/`, {
        params: { status }
      });
      return response.data;
    },
    enabled: !!patientId,
    refetchOnMount: true,
    staleTime: 0
  });
}

// Convenience hooks for specific statuses
export function useCompletedFollowUpVisits(patientId: string) {
  return usePatientFollowUpVisits(patientId, "completed");
}

export function usePendingFollowUpVisits(patientId: string) {
  return usePatientFollowUpVisits(patientId, "pending");
}

export function useMissedFollowUpVisits(patientId: string) {
  return usePatientFollowUpVisits(patientId, "missed");
}

export function useAllFollowUpVisits(patientId: string) {
  return usePatientFollowUpVisits(patientId, "all");
}
