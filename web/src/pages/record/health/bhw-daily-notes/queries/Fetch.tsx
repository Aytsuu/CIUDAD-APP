import { api2 } from "@/api/api";
import { useQuery } from "@tanstack/react-query";

export const useBHWStaffWithNotes = (page: number, pageSize: number, search: string) => {
   return useQuery({
      queryKey: ['bhwStaffWithNotes', page, pageSize, search],
      queryFn: async () => {
         try {
            const res = await api2.get('/reports/bhw/with-notes/', {
               params: {
                  page: page,
                  page_size: pageSize,
                  search: search,
               }
            })
            return res.data;
         } catch (error) {
            throw error;
         }
      },
      staleTime: 5000,
		retry: 1,
		refetchInterval: 2000,
   })
}