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

export const useFirstAidRecords = (params: {
  patientId: string;
  search: string;
  page: number;
  page_size: number;
}) => {
  return useQuery({
    queryKey: ["patientFirstAidDetails", params], // The query key now includes all params
    queryFn: async () => {
      const { patientId, search, page, page_size } = params;
      if (!patientId) {
        // Return a default paginated structure if no patient ID
        return { count: 0, next: null, previous: null, results: [] };
      }

      // Build search params
      const searchParams = new URLSearchParams();
      if (search) {
        searchParams.append('search', search);
      }
      searchParams.append('page', page.toString());
      searchParams.append('page_size', page_size.toString());

      const response = await api2.get(
        `/firstaid/indiv-firstaid-record/${patientId}/?${searchParams.toString()}`
      );
      return response.data; // Return the full paginated response
    },
    enabled: !!params.patientId, // Only run the query if patientId exists
    refetchOnMount: true,
    staleTime: 0,
  });
};
