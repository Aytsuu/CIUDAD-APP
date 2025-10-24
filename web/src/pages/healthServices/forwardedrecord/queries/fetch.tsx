import { useQuery } from "@tanstack/react-query";
import { api2 } from "@/api/api";

// Medical Consultations

export function useCombinedHealthRecords(staffId: string, search: string, recordType: string, page: number, pageSize: number) {
  return useQuery<any>({
    queryKey: ["combinedHealthRecords", staffId, search, recordType, page, pageSize],
    queryFn: async () => {
      const params = new URLSearchParams({
        search: search,
        record_type: recordType,
        page: page.toString(),
        page_size: pageSize.toString()
      });

      const response = await api2.get<any>(`/medical-consultation/combined-health-records/${staffId}/?${params}`);
      return response.data;
    }
  });
}



// export function useCHimmunizationCount() {
//     return useQuery({
//       queryKey: ["chimmunization-count"],
//       queryFn: async () => {
//         const response = await api2.get(`/child-health/child-immunization-count/`);
//         return response.data;
//       },
//       refetchOnMount: true,
//       staleTime: 0
//     });
//   }
  
  export function usePendingMedicalConCount() {
    return useQuery({
      queryKey: ["pendingmedcon-count"],
      queryFn: async () => {
        const response = await api2.get(`/medical-consultation/pending-medcon-record-count/`);
        return response.data;
      },
      refetchOnMount: true,
      staleTime: 0
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
      staleTime: 0
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
      staleTime: 0
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
      staleTime: 0
    });
  }
  