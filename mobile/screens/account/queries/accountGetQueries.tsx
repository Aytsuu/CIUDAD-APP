import api from "@/api/api";
import { useQuery } from "@tanstack/react-query";

export const useGetPersonalModificationReq = (per_id: string) => {
  return useQuery({
    queryKey: ['personalModReq', per_id],
    queryFn: async () => {
      try {
        const res = await api.get(`profiling/personal/${per_id}/modification/`);
        return res.data;
      } catch (err) {
        throw err;
      }
    },
    staleTime: 5000,
    retry: false
  })
}

export const useGetOwnedHouses = (residentId: string) => {
  return useQuery({
    queryKey: ['ownedHouses', residentId],
    queryFn: async () => {
      try {
        const res = await api.get(`profiling/household/owned-by-${residentId}/`);
        return res.data;
      } catch (err) {
        throw err;
      }
    },
    staleTime: 5000,
    retry: false
  })
}

export const useGetResidentFamily = (residentId: string) => {
  return useQuery({
    queryKey: ["familyData", residentId],
    queryFn: async () => {
      try {
        const res = await api.get("profiling/family/data/resident-specific/", {
          params: {
            residentId
          }
        });
        return res.data;
      } catch (err) {
        throw err;
      }
    },
    staleTime: 500,
    retry: false
  })
}