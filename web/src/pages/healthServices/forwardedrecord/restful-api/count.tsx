import { useQuery } from "@tanstack/react-query";
import { api2 } from "@/api/api";

export function useCHimmunizationCount() {
    return useQuery({
      queryKey: ["chimmunization-count"],
      queryFn: async () => {
        const response = await api2.get(`/child-health/child-immunization-count/`);
        return response.data;
      },
      refetchOnMount: true,
      staleTime: 0,
    });
  }


  
export function usePendingMedicalConCount() {
    return useQuery({
      queryKey: ["pendingmedcon-count"],
      queryFn: async () => {
        const response = await api2.get(`/medical-consultation/pending-medcon-record-count/`);
        return response.data;
      },
      refetchOnMount: true,
      staleTime: 0,
    });
  }


  export function useForwardedVaccinationCount() {
    return useQuery({
      queryKey: ["forwardedvaccination-count"],
      queryFn: async () => {
        const response = await api2.get(`/vaccination/forwarded-vaccination-count/`);
        return response.data;
      },
      refetchOnMount: true,
      staleTime: 0,
    });
  }

  export function useForwardedChildMedRecordCount() { 
    return useQuery({
      queryKey: ["forwardedchildmedrec-count"],
      queryFn: async () => {
        const response = await api2.get(`/child-health/history/pending-count/`);
        return response.data;
      },
      refetchOnMount: true,
      staleTime: 0,
    });
  }


  
  export function useScheduledVaccinationCount() { 
    return useQuery({
      queryKey: ["scheduledvaccination-count"],
      queryFn: async () => {
        const response = await api2.get(`/vaccination/count-scheduled-vaccinations/`);
        return response.data;
      },
      refetchOnMount: true,
      staleTime: 0,
    });
  }



