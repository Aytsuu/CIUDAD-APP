import { useQuery } from "@tanstack/react-query";
import { api2 } from "@/api/api";

export function useMedConCount(patientId: string) {
    return useQuery({
      queryKey: ["medcon-count"],
      queryFn: async () => {
        const response = await api2.get(`/medical-consultation/medcon-record-count/${patientId}/`);
        return response.data;
      },
      refetchOnMount: true,
      staleTime: 0,
    });
  }



export function useChildHealthRecordCount(patientId: string) {
    return useQuery({
      queryKey: ["child-health-record-count"],
      queryFn: async () => {
        const response = await api2.get(`/child-health/child-health-record-count/${patientId}/`);
        return response.data;
      },
      refetchOnMount: true,
      staleTime: 0,
    });
  }