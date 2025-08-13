import { api } from "@/api/api";
import { useQuery } from "@tanstack/react-query";

export const useOwnedBusinesses = (data: Record<string, any>) => {
  return useQuery({
    queryKey: ['ownedBusinesses', data],
    queryFn: async () => {
      try {
        const res = await api.get('profiling/business/specific/ownership', {
          params: data
        });

        return res.data;
      } catch (err){
        throw err;
      }
    },
    staleTime: 5000
  })
}