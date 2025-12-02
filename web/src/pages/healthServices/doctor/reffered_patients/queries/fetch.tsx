import { useQuery } from "@tanstack/react-query";
import { api2 } from "@/api/api";


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
