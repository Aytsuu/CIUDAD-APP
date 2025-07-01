import { useQuery } from "@tanstack/react-query";
import { api } from "@/api/api";

export const useGetReportType = () => {
  return useQuery({
    queryKey: ['irReportType'],
    queryFn: async () => {
      try { 
        const res = await api.get('report/rt/list/Incident/');
        return res.data;
      } catch (err) {
        console.log(err);
        throw err;
      }
    },
    staleTime: 5000
  })
}