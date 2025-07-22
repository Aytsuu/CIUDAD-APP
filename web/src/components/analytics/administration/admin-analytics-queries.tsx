import { api } from "@/api/api";
import { useQuery } from "@tanstack/react-query";

export const  useGetCardAnalytics = () => {
  return useQuery({
    queryKey: ['adminCardAnalytics'],
    queryFn: async () => {
      try {
        const res = await api.get('administration/card/analytics/data/');
        return res.data;
      } catch (err) {
        throw err;
      }
    },
    staleTime: 5000
  })
}