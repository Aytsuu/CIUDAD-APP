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

export const useBusinessInfo = (busId: number) => {
  return useQuery({
    queryKey: ["businessInfo", busId],
    queryFn: async () => {
      if (!busId) return null;
      
      try {
        const res = await api.get(`profiling/business/${busId}/info/`);
        return res.data;
      } catch (err) {
        throw err;
      }
    },
    staleTime: 5000,
  });
}

export const useModificationRequests = () => {
  return useQuery({
    queryKey: ['modificationRequests'],
    queryFn: async () => {
      try {
        const res = await api.get('profiling/business/modification/request-list/');
        return res.data
      } catch (err) {
        console.error(err);
        throw(err);
      }
    },
    staleTime: 5000
  })
}