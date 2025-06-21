// hooks/useFollowUpVisits.ts
import { useQuery } from "@tanstack/react-query";
import { api2 } from "@/api/api";

export function useCompletedFollowUpVisits(patientId: string) {
  return useQuery({
    queryKey: ["completedFollowUpVisits", patientId],
    queryFn: async () => {
      const response = await api2.get(`/patientrecords/followup-complete/${patientId}/`);
      return response.data;
    },
    enabled: !!patientId,
    refetchOnMount: true,
    staleTime: 0,
  });
}

export function usePendingFollowUpVisits(patientId: string) {
  return useQuery({
    queryKey: ["pendingFollowUpVisits", patientId],
    queryFn: async () => {
      const response = await api2.get(`/patientrecords/followup-pending/${patientId}/`);
      return response.data;
    },
    enabled: !!patientId,
    refetchOnMount: true,
    staleTime: 0,
  });
}