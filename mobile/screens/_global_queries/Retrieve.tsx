import { useQuery } from "@tanstack/react-query";
import { api } from "@/api/api";

export const useGetSitio = () => {
  return useQuery({
    queryKey: ['sitioList'],
    queryFn: async () => {
      try {
        const res = await api.get('profiling/sitio/list/');
        return res.data;
      } catch (err) {
        throw err;
      }
    },
    staleTime: 5000
  })
}