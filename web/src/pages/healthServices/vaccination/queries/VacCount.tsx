// hooks/useVaccinationCount.ts
import { useQuery } from "@tanstack/react-query";
import { api2 } from "@/api/api";

export function useVaccinationCount(patientId: string) {
  return useQuery({
    queryKey: ["vaccinationCount", patientId],
    queryFn: async () => {
      const response = await api2.get(`/vaccination/vacrec-count/${patientId}/`);
      return response.data;
    },
    enabled: !!patientId,
    refetchOnMount: true,
    staleTime: 0
  });
}
