import { useQuery } from "@tanstack/react-query";
import { api2 } from "@/api/api";

export function useMedicineCount(patientId: string) {
  return useQuery({
    queryKey: ["medicineRecordCount", patientId],
    queryFn: async () => {
      const response = await api2.get(`/medicine/medrec-count/${patientId}/`);
      return response.data;
    },
    refetchOnMount: true,
    staleTime: 0,
  });
}