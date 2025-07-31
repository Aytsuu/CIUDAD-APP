import { useQuery } from "@tanstack/react-query";
import { api2 } from "@/api/api";

export function useFirstAidCount(patientId: string) {
  return useQuery({
    queryKey: ["firstaidcount"],
    queryFn: async () => {
      const response = await api2.get(`/firstaid/firstaid-records-count/${patientId}/`);
      return response.data;
    },
    refetchOnMount: true,
    staleTime: 0,
  });
}