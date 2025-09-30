import { api } from "@/api/api";
import { useQuery } from "@tanstack/react-query";

export const useGetCardAnalytics = () => {
  return useQuery({
    queryKey: ['profilingCardAnalytics'],
    queryFn: async () => {
      try {
        const res = await api.get("profiling/card/analytics/data/");
        return res.data
      } catch (err) {
        throw err;
      }
    },
    staleTime: 5000
  })
}

export const useGetSidebarAnalytics = () => {
  return useQuery({
    queryKey: ['profilingSidebar'],
    queryFn: async () => {
      try {
        const res = await api.get("profiling/sidebar/analytics/data/");
        return res.data;
      } catch(err) {
        throw err;
      }
    },
    staleTime: 5000
  })
}