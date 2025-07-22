import { api } from "@/api/api";
import { useQuery } from "@tanstack/react-query";

export const useGetProjectProposalStatusCounts = () => {
  return useQuery({
    queryKey: ['projectStatusCounts'],
    queryFn: async () => {
      try {
        const res = await api.get('/gad/status-counts/');
        console.log(res.data);
        return res.data;
      } catch (err) {
        throw err;
      }
    },
    staleTime: 5000,
  });
};