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