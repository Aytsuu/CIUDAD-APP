import { api } from "@/api/api";
import { useQuery } from "@tanstack/react-query";

export const useGetCardAnalytics = () => {
  return useQuery({
    queryKey: ['reportCardAnalytics'],
    queryFn: async () => {
      try {
        const res = await api.get("report/card/analytics/data/");
        return res.data;  
      } catch(err) {
        throw err;
      }
    },
    staleTime: 5000
  })
}

export const useGetSidebarAnalytics = (period: string = "today") => {
  return useQuery({
    queryKey: ['reportSidebar', period],
    queryFn: async () => {
      try {
        const res = await api.get("report/sidebar/analytics/data/", {
          params: {
            period
          }
        });
        return res.data;
      } catch (err) {
        throw err;
      }
    },
    staleTime:5000
  })
}

export const useGetChartAnalytics = () => {
  return useQuery({
    queryKey: ['reportChartAnalytics'],
    queryFn: async () => {
      try {
        const res = await api.get("report/chart/analytics/data/");
        return res.data;
      } catch (err) {
        throw err;
      }
    }
  })
}