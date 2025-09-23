import api from "@/api/api";
import { useQuery } from "@tanstack/react-query";

export const useGetPersonalModificationReq = (per_id: string) => {
  return useQuery({
    queryKey: ['personalModReq'],
    queryFn: async () => {
      try {
        const res = await api.get(`profiling/personal/${per_id}/modification/`);
        return res.data;
      } catch (err) {
        throw err;
      }
    },
    staleTime: 5000
  })
}