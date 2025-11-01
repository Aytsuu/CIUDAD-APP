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

export function useFamplanCount(patientId: string) {
  console.log("useFamplanCount called with patientId:", patientId);
  
  return useQuery({
    queryKey: ["fam-count", patientId],
    queryFn: async () => {
      try {
        console.log("Making API call to fetch FP count...");
        const response = await api2.get(`/familyplanning/fp-methods-count/${patientId}/`);
        console.log("API Response:", response.data);
        return response.data;
      } catch (error) {
        console.error("Error fetching FP count:", error);
        throw error;
      }
    },
    enabled: !!patientId, // Only run if patientId exists
    retry: 2,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useAnimalbitesCount(patientId: string) {
  return useQuery({
    queryKey: ["animalbites-count"],
    queryFn: async () => {
      const response = await api2.get(`/animalbites/count/${patientId}/`);
      console.log("FUCK", response.data);
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
