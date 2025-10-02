import { useQuery } from "@tanstack/react-query";
import { api2 } from "@/api/api";

export const getIndividualMedicineRecords = async (
    id: string,
    page: number,
    pageSize: number,
    search?: string
  ): Promise<any> => {
    if (!id) {
      return { success: true, results: [], count: 0 };
    }
    
    try {
      const response = await api2.get(`/medicine/medicine-records-table/${id}/`, {
        params: { page, page_size: pageSize, search: search?.trim() },
        timeout: 30000,
      });
      
      // Always return the API response as-is, let the component handle it
      return response.data;
      
    } catch (err: any) {
      console.error("Error fetching medicine records:", err);
      
      // For any error, return empty data
      return {
        success: false,
        results: [],
        count: 0,
        error: err.message || "Failed to load medicine records"
      };
    }
  };

export const useIndividualMedicineRecords = (
  pat_id: string, 
  page: number, 
  pageSize: number, 
  search?: string
) => {
  return useQuery({
    queryKey: ["individualMedicineRecords", pat_id, page, pageSize, search],
    queryFn: () => getIndividualMedicineRecords(pat_id, page, pageSize, search),
    enabled: !!pat_id && pat_id.trim() !== "",
    refetchOnMount: false, // Changed to false to prevent double calls
    staleTime: 5* 60 * 1000, // 2 minutes
    retry: 1, // Only retry once
    retryDelay: 2000,
  });
};